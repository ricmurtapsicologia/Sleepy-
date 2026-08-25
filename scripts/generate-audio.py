import asyncio, json, os, sys
from pathlib import Path
import edge_tts

MANIFEST=Path(sys.argv[1] if len(sys.argv)>1 else '/tmp/sono-audios.json')
OUT=Path(sys.argv[2] if len(sys.argv)>2 else 'audio')
VOICE=os.environ.get('SONO_VOICE','pt-BR-AntonioNeural')
OUT.mkdir(parents=True,exist_ok=True)

def settings(kind):
    if kind=='calm':
        return {'rate':'-11%','pitch':'-3Hz','volume':'+0%'}
    return {'rate':'-5%','pitch':'-2Hz','volume':'+0%'}

async def render_one(audio_id,data):
    text=(data.get('script') or '').strip()
    if not text:
        return
    cfg=settings(data.get('kind','explain'))
    target=OUT/f'{audio_id}.mp3'
    comm=edge_tts.Communicate(text=text,voice=VOICE,rate=cfg['rate'],pitch=cfg['pitch'],volume=cfg['volume'])
    await comm.save(str(target))
    print(f'gerado: {target}')

async def main():
    data=json.loads(MANIFEST.read_text(encoding='utf-8'))
    for audio_id,item in data.items():
        await render_one(audio_id,item)
    spec={
        'voice':VOICE,
        'profile':'masculina adulta, pt-BR, conversacional; ritmo mais lento apenas em práticas de regulação',
        'tracks':list(data.keys())
    }
    (OUT/'audio-spec.json').write_text(json.dumps(spec,ensure_ascii=False,indent=2),encoding='utf-8')

asyncio.run(main())
