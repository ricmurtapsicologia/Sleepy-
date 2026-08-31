from __future__ import annotations

import asyncio
import hashlib
import json
import os
import re
import shutil
import sys
from pathlib import Path

import edge_tts
from pydub import AudioSegment, effects

MANIFEST=Path(sys.argv[1] if len(sys.argv)>1 else '/tmp/sono-audios.json')
OUT=Path(sys.argv[2] if len(sys.argv)>2 else 'audio')
TMP=Path('.tmp_sono_audio_n3')
VOICE=os.environ.get('SONO_VOICE','pt-BR-AntonioNeural')
VERSION='n3-20260831'
OPENING_SILENCE_MS=150
ENDING_SILENCE_MS=280
TARGET_DBFS=-18.0
MAX_CONCURRENT_SYNTH=4
SYNTH_TIMEOUT_SECONDS=55

OUT.mkdir(parents=True,exist_ok=True);TMP.mkdir(parents=True,exist_ok=True)

SOFT={'mas','porém','porem','contudo','entretanto','porque','quando','enquanto','então','entao','assim','agora','portanto','se','como','além','alem','ainda','depois','antes','embora'}
INSTRUCTIONS=('observe','imagine','pense','respire','inspire','expire','exale','perceba','note','sinta','coloque','apoie','mantenha','deixe','permita','guarde','faça','faca','tente','olhe','escute','volte')
REFLECTIVE=('talvez','por enquanto','agora','às vezes','as vezes','vale lembrar','repare','considere','uma possibilidade','isso pode')
CONCLUSION=('em resumo','para concluir','por fim','em síntese','em sintese','o ponto principal','leve com você','leve com voce')


def norm(text:str)->str:return re.sub(r'\s+',' ',text or '').strip()

def tokens(text:str):return re.findall(r'[\wÀ-ÿ]+',text.lower(),flags=re.UNICODE)

def stable(text:str,low:int,high:int,salt:str)->int:
    h=hashlib.sha256((salt+'|'+norm(text)).encode()).digest();u=int.from_bytes(h[:4],'big')/0xffffffff
    return low+int(round(u*(high-low)))

def intent(text:str)->str:
    t=norm(text);low=t.lower()
    if t.endswith('?'):return 'question'
    if low.startswith(INSTRUCTIONS):return 'instruction'
    if low.startswith(REFLECTIVE):return 'reflective'
    if low.startswith(CONCLUSION):return 'conclusion'
    if t.endswith('!'):return 'emphasis'
    return 'explain'

def breath_units(text:str)->list[str]:
    text=norm(text);out=[]
    for sentence in [s.strip() for s in re.split(r'(?<=[.!?…])\s+',text) if s.strip()]:
        words=sentence.split()
        if len(words)<=20:out.append(sentence);continue
        start=0
        while len(words)-start>20:
            lo=start+9;hi=min(start+20,len(words));target=min(start+14,hi)
            candidates=[]
            for i in range(lo,hi):
                w=re.sub(r'^[^\wÀ-ÿ]+|[^\wÀ-ÿ]+$','',words[i].lower())
                if w in SOFT:candidates.append(i)
            cut=min(candidates,key=lambda i:abs(i-target)) if candidates else target
            unit=' '.join(words[start:cut]).strip()
            if unit and not unit.endswith((',', ';', ':', '.', '?', '!', '…')):unit+=','
            out.append(unit);start=cut
        if start<len(words):out.append(' '.join(words[start:]).strip())
    if tokens(' '.join(out))!=tokens(text):raise RuntimeError('Gate lexical N3 falhou')
    return out or [text]

def prosody(kind:str,text:str):
    calm=kind=='calm';i=intent(text)
    rate=-9 if calm else -4;pitch=-2 if calm else -1
    rate += {'explain':0,'question':1,'instruction':-3,'reflective':-3,'conclusion':-2,'emphasis':1}[i]
    pitch += {'explain':0,'question':2,'instruction':-1,'reflective':-1,'conclusion':-1,'emphasis':1}[i]
    rate+=stable(text,-1,1,'rate');pitch+=stable(text,-1,1,'pitch')
    if calm:
        ranges={'explain':(650,1000),'question':(850,1400),'instruction':(1300,2400),'reflective':(1100,2000),'conclusion':(900,1400),'emphasis':(650,950)}
    else:
        ranges={'explain':(390,650),'question':(480,760),'instruction':(750,1200),'reflective':(720,1150),'conclusion':(650,1050),'emphasis':(390,650)}
    lo,hi=ranges[i];pause=stable(text,lo,hi,'pause')
    return i,f'{max(-14,min(5,rate)):+d}%',f'{max(-5,min(5,pitch)):+d}Hz',pause

async def synth(text,rate,pitch,path,sem):
    async with sem:
        for attempt in range(1,4):
            try:
                c=edge_tts.Communicate(text=text,voice=VOICE,rate=rate,pitch=pitch,volume='+0%')
                await asyncio.wait_for(c.save(str(path)),timeout=SYNTH_TIMEOUT_SECONDS);return
            except Exception:
                if attempt==3:raise
                await asyncio.sleep(.9*attempt)

async def render_one(audio_id:str,data:dict,sem):
    text=norm(data.get('script') or '')
    if not text:return None
    kind=data.get('kind','explain');turns=breath_units(text);work=TMP/audio_id;work.mkdir(parents=True,exist_ok=True)
    tasks=[];seq=[];intents=[]
    for idx,turn in enumerate(turns):
        name,rate,pitch,pause=prosody(kind,turn);part=work/f'{idx:03d}.mp3'
        seq.append((part,0 if idx==len(turns)-1 else pause));tasks.append(synth(turn,rate,pitch,part,sem));intents.append(name)
    await asyncio.gather(*tasks)
    audio=AudioSegment.silent(duration=OPENING_SILENCE_MS)
    for part,pause in seq:
        audio+=AudioSegment.from_file(part,format='mp3')
        if pause:audio+=AudioSegment.silent(duration=pause)
    audio+=AudioSegment.silent(duration=ENDING_SILENCE_MS)
    audio=effects.compress_dynamic_range(audio,threshold=-20.0,ratio=2.0,attack=8.0,release=70.0)
    if audio.dBFS!=float('-inf'):audio=audio.apply_gain(TARGET_DBFS-audio.dBFS)
    if audio.max_dBFS>-1.2:audio=audio.apply_gain(-1.2-audio.max_dBFS)
    target=OUT/f'{audio_id}.mp3';audio.export(target,format='mp3',bitrate='128k',parameters=['-ac','1','-ar','44100'])
    return {'id':audio_id,'duration_seconds':round(len(audio)/1000,1),'kind':kind,'intents':sorted(set(intents)),'turns':len(turns)}

async def main():
    data=json.loads(MANIFEST.read_text(encoding='utf-8'))
    if not data:raise RuntimeError('Manifesto de áudio vazio')
    sem=asyncio.Semaphore(MAX_CONCURRENT_SYNTH);results=[]
    for audio_id,item in data.items():
        r=await render_one(audio_id,item,sem)
        if r:results.append(r)
    spec={'version':VERSION,'voice':VOICE,'profile':'N3-C Natural — Sono em Dia','prosody':'semantic-intent + deterministic-content-jitter','ambient_audio':False,
          'opening_silence_ms':OPENING_SILENCE_MS,'ending_silence_ms':ENDING_SILENCE_MS,'target_dbfs':TARGET_DBFS,'peak_ceiling_dbfs':-1.2,
          'format':'MP3 128 kbps, mono, 44.1 kHz','tracks':results}
    (OUT/'audio-spec.json').write_text(json.dumps(spec,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    expected=set(data);produced={p.stem for p in OUT.glob('*.mp3')};missing=sorted(expected-produced)
    if missing:raise RuntimeError(f'Faixas não geradas: {missing}')
    shutil.rmtree(TMP,ignore_errors=True);print(f'Concluído: {len(results)} faixas N3-C.')

asyncio.run(main())
