from __future__ import annotations

import asyncio
import json
import os
import re
import shutil
import sys
from pathlib import Path

import edge_tts
from pydub import AudioSegment, effects

MANIFEST = Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/sono-audios.json')
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else 'audio')
TMP = Path('.tmp_sono_audio')
VOICE = os.environ.get('SONO_VOICE', 'pt-BR-AntonioNeural')

# Perfil sonoro alinhado ao padrão N2 de “Girando a Ampulheta da Vida”.
OPENING_SILENCE_MS = 130
ENDING_SILENCE_MS = 240
TARGET_DBFS = -18.0
MAX_TURN_CHARS = 560
SYNTH_TIMEOUT_SECONDS = 55
MAX_CONCURRENT_SYNTH = 4

OUT.mkdir(parents=True, exist_ok=True)
TMP.mkdir(parents=True, exist_ok=True)


def normalize_text(text: str) -> str:
    return re.sub(r'\s+', ' ', text or '').strip()


def split_turns(text: str) -> list[str]:
    text = normalize_text(text)
    sentences = re.findall(r'[^.!?]+[.!?]+|[^.!?]+$', text)
    turns: list[str] = []
    current = ''
    for sentence in (normalize_text(s) for s in sentences):
        if not sentence:
            continue
        candidate = f'{current} {sentence}'.strip()
        if current and len(candidate) > MAX_TURN_CHARS:
            turns.append(current)
            current = sentence
        else:
            current = candidate
    if current:
        turns.append(current)
    return turns or [text]


def prosody(kind: str, text: str, index: int) -> tuple[str, str, int]:
    calm = kind == 'calm'
    rate = -9 if calm else -4
    pitch = -2 if calm else -1
    normalized = text.strip().lower()

    if text.rstrip().endswith('?'):
        rate += 2
        pitch += 2
    if normalized.startswith(('guarde', 'em resumo', 'pense', 'imagine', 'observe', 'por enquanto', 'agora')):
        rate -= 2

    rate += (-1, 0, 1, 0)[index % 4]
    rate = max(-13 if calm else -10, min(2 if calm else 4, rate))
    pitch = max(-4, min(4, pitch))

    if text.rstrip().endswith('?'):
        pause = 620 if calm else 560
    elif text.rstrip().endswith('!'):
        pause = 580 if calm else 500
    else:
        pause = 620 if calm else 520

    return f'{rate:+d}%', f'{pitch:+d}Hz', pause


async def synthesize(text: str, rate: str, pitch: str, output: Path, semaphore: asyncio.Semaphore):
    async with semaphore:
        for attempt in range(1, 4):
            try:
                communicate = edge_tts.Communicate(
                    text=text,
                    voice=VOICE,
                    rate=rate,
                    pitch=pitch,
                    volume='+0%',
                )
                await asyncio.wait_for(communicate.save(str(output)), timeout=SYNTH_TIMEOUT_SECONDS)
                return
            except Exception:
                if attempt == 3:
                    raise
                await asyncio.sleep(0.9 * attempt)


async def render_one(audio_id: str, data: dict, semaphore: asyncio.Semaphore):
    text = normalize_text(data.get('script') or '')
    if not text:
        return None

    kind = data.get('kind', 'explain')
    turns = split_turns(text)
    work = TMP / audio_id
    work.mkdir(parents=True, exist_ok=True)

    tasks = []
    sequence: list[tuple[Path, int]] = []
    for idx, turn in enumerate(turns):
        rate, pitch, pause_ms = prosody(kind, turn, idx)
        part = work / f'{idx:03d}.mp3'
        sequence.append((part, 0 if idx == len(turns) - 1 else pause_ms))
        tasks.append(synthesize(turn, rate, pitch, part, semaphore))

    await asyncio.gather(*tasks)

    merged = AudioSegment.silent(duration=OPENING_SILENCE_MS)
    for part, pause_ms in sequence:
        merged += AudioSegment.from_file(part, format='mp3')
        if pause_ms:
            merged += AudioSegment.silent(duration=pause_ms)
    merged += AudioSegment.silent(duration=ENDING_SILENCE_MS)

    merged = effects.compress_dynamic_range(
        merged,
        threshold=-20.0,
        ratio=2.0,
        attack=8.0,
        release=70.0,
    )
    if merged.dBFS != float('-inf'):
        merged = merged.apply_gain(TARGET_DBFS - merged.dBFS)
    if merged.max_dBFS > -1.2:
        merged = merged.apply_gain(-1.2 - merged.max_dBFS)

    target = OUT / f'{audio_id}.mp3'
    merged.export(
        target,
        format='mp3',
        bitrate='128k',
        parameters=['-ac', '1', '-ar', '44100'],
    )
    print(f'gerado: {target} ({len(merged) / 1000:.1f}s)')
    return audio_id, round(len(merged) / 1000, 1)


async def main():
    data = json.loads(MANIFEST.read_text(encoding='utf-8'))
    if not data:
        raise RuntimeError('Manifesto de áudio vazio.')

    semaphore = asyncio.Semaphore(MAX_CONCURRENT_SYNTH)
    results = []
    # Um episódio por vez preserva estabilidade; os trechos de cada episódio são paralelizados.
    for audio_id, item in data.items():
        result = await render_one(audio_id, item, semaphore)
        if result:
            results.append(result)

    spec = {
        'voice': VOICE,
        'profile': 'Ampulheta N2: voz masculina pt-BR, pausas editoriais, compressão e normalização',
        'opening_silence_ms': OPENING_SILENCE_MS,
        'ending_silence_ms': ENDING_SILENCE_MS,
        'target_dbfs': TARGET_DBFS,
        'format': 'MP3 128 kbps, mono, 44.1 kHz',
        'tracks': [{'id': audio_id, 'duration_seconds': duration} for audio_id, duration in results],
    }
    (OUT / 'audio-spec.json').write_text(json.dumps(spec, ensure_ascii=False, indent=2), encoding='utf-8')

    expected = set(data.keys())
    produced = {p.stem for p in OUT.glob('*.mp3')}
    missing = sorted(expected - produced)
    if missing:
        raise RuntimeError(f'Faixas não geradas: {missing}')

    shutil.rmtree(TMP, ignore_errors=True)
    print(f'Concluído: {len(results)} faixas no perfil N2.')


asyncio.run(main())