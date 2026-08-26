from __future__ import annotations

import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

OWNER = 'ricmurtapsicologia'
ROOT = Path(__file__).resolve().parents[1]
OUT_JSON = ROOT / 'AUDIO_ECOSYSTEM_AUDIT.json'
OUT_MD = ROOT / 'AUDIO_ECOSYSTEM_AUDIT.md'
TOKEN = os.environ.get('GITHUB_TOKEN', '')
AUDIO_EXT = {'.mp3', '.wav', '.m4a', '.ogg', '.aac', '.flac'}
TEXT_EXT = {'.html', '.htm', '.js', '.mjs', '.ts', '.tsx', '.jsx', '.json', '.md', '.py', '.yml', '.yaml'}
SKIP_PARTS = {'node_modules', 'vendor', '.git', 'dist', 'build', '.next', 'coverage'}
PATTERNS = {
    'speech_synthesis': re.compile(r'\b(?:speechSynthesis|SpeechSynthesisUtterance)\b'),
    'audio_tag': re.compile(r'<audio\b', re.I),
    'new_audio': re.compile(r'\bnew\s+Audio\s*\('),
    'audio_extension_ref': re.compile(r'\.(?:mp3|wav|m4a|ogg|aac|flac)(?:[?"\'\s)]|$)', re.I),
    'tts_term': re.compile(r'\bTTS\b|text[- ]to[- ]speech', re.I),
}


def request_json(url: str):
    headers = {'Accept': 'application/vnd.github+json', 'User-Agent': 'sono-em-dia-audio-audit'}
    if TOKEN:
        headers['Authorization'] = f'Bearer {TOKEN}'
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def request_text(url: str):
    req = urllib.request.Request(url, headers={'User-Agent': 'sono-em-dia-audio-audit'})
    with urllib.request.urlopen(req, timeout=20) as r:
        data = r.read(1_500_000)
        return data.decode('utf-8', errors='ignore')


def active_repos():
    repos = []
    page = 1
    while True:
        url = f'https://api.github.com/users/{OWNER}/repos?per_page=100&page={page}&type=owner&sort=full_name'
        batch = request_json(url)
        if not batch:
            break
        repos.extend(r for r in batch if not r.get('archived') and not r.get('fork') and not r.get('private'))
        if len(batch) < 100:
            break
        page += 1
    return repos


def scan_repo(repo: dict):
    name = repo['name']
    branch = repo.get('default_branch') or 'main'
    tree_url = f"https://api.github.com/repos/{OWNER}/{urllib.parse.quote(name, safe='.-_')}/git/trees/{urllib.parse.quote(branch, safe='.-_/')}?recursive=1"
    try:
        tree = request_json(tree_url)
    except Exception as e:
        return {'repo': name, 'default_branch': branch, 'error': f'tree: {e}', 'audio_files': [], 'signals': []}

    entries = tree.get('tree', [])
    audio_files = []
    text_files = []
    for item in entries:
        if item.get('type') != 'blob':
            continue
        path = item.get('path', '')
        parts = set(path.split('/'))
        if parts & SKIP_PARTS:
            continue
        suffix = Path(path).suffix.lower()
        if suffix in AUDIO_EXT:
            audio_files.append({'path': path, 'size': item.get('size'), 'sha': item.get('sha')})
        if suffix in TEXT_EXT and (item.get('size') or 0) <= 1_200_000:
            text_files.append(path)

    signals = []
    # Scan source files from raw.githubusercontent.com; no GitHub code-search dependency.
    for path in text_files:
        raw = f"https://raw.githubusercontent.com/{OWNER}/{urllib.parse.quote(name, safe='.-_')}/{urllib.parse.quote(branch, safe='.-_/')}/{urllib.parse.quote(path, safe='/-_.')}"
        try:
            text = request_text(raw)
        except Exception:
            continue
        hits = [label for label, pat in PATTERNS.items() if pat.search(text)]
        if hits:
            signals.append({'path': path, 'signals': hits})

    return {
        'repo': name,
        'html_url': repo.get('html_url'),
        'default_branch': branch,
        'tree_truncated': bool(tree.get('truncated')),
        'audio_files': sorted(audio_files, key=lambda x: x['path'].lower()),
        'signals': sorted(signals, key=lambda x: x['path'].lower()),
    }


def main():
    repos = active_repos()
    results = []
    for idx, repo in enumerate(repos, start=1):
        print(f'[{idx}/{len(repos)}] {repo["name"]}')
        results.append(scan_repo(repo))
        time.sleep(0.05)

    candidates = [r for r in results if r.get('audio_files') or r.get('signals')]
    report = {
        'owner': OWNER,
        'scope': 'public active non-fork repositories',
        'generated_by': 'scripts/audit_audio_ecosystem.py',
        'repository_count': len(results),
        'candidate_repository_count': len(candidates),
        'repositories': results,
    }
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    lines = [
        '# Auditoria global de áudio', '',
        f'- Repositórios públicos ativos auditados: {len(results)}',
        f'- Repositórios com arquivos de áudio ou sinais de player/TTS: {len(candidates)}',
        '- Método: árvore Git recursiva + inspeção direta dos arquivos-fonte; não depende da busca de código do GitHub.', '',
        '| Repositório | Arquivos de áudio | Sinais em código/conteúdo |',
        '|---|---:|---:|',
    ]
    for r in candidates:
        lines.append(f"| {r['repo']} | {len(r.get('audio_files', []))} | {len(r.get('signals', []))} |")
    lines += ['', '## Detalhes', '']
    for r in candidates:
        lines += [f"### {r['repo']}", '']
        if r.get('audio_files'):
            lines.append('Arquivos de áudio:')
            lines += [f"- `{x['path']}`" for x in r['audio_files']]
        if r.get('signals'):
            lines.append('Sinais em arquivos-fonte:')
            lines += [f"- `{x['path']}` — {', '.join(x['signals'])}" for x in r['signals']]
        lines.append('')
    OUT_MD.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(f'Concluído: {len(results)} repos; {len(candidates)} candidatos.')


if __name__ == '__main__':
    main()
