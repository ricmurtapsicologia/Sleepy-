# Auditoria global de áudio

- Repositórios públicos ativos auditados: 43
- Repositórios com arquivos de áudio ou sinais de player/TTS: 7
- Método: árvore Git recursiva + inspeção direta dos arquivos-fonte; não depende da busca de código do GitHub.

| Repositório | Arquivos de áudio | Sinais em código/conteúdo |
|---|---:|---:|
| altaperformance | 1 | 0 |
| clinicadosono | 0 | 1 |
| Pilulas-de-Reflexao | 18 | 14 |
| Podcast-ATS-CBMMG | 108 | 14 |
| regulacao-polivagal. | 54 | 5 |
| RPD | 2 | 9 |
| sono-em-dia- | 15 | 8 |

## Detalhes

### altaperformance

Arquivos de áudio:
- `Panico.mp3`

### clinicadosono

Sinais em arquivos-fonte:
- `index.html` — speech_synthesis

### Pilulas-de-Reflexao

Arquivos de áudio:
- `audio/n2/pr-001.mp3`
- `audio/n2/pr-002.mp3`
- `audio/n2/pr-003.mp3`
- `audio/n2/pr-004.mp3`
- `audio/n2/pr-005.mp3`
- `audio/n2/pr-006.mp3`
- `audio/n2/pr-007.mp3`
- `audio/n2/pr-008.mp3`
- `audio/n2/pr-009.mp3`
- `audio/n2/pr-010.mp3`
- `PODCAST 000 REGISTRO DE PENSAMENTOS DISFUNCIONAIS.mp3`
- `PODCAST 001 OUVIR NO FINAL DE DOMINGO.mp3`
- `PODCAST 002 LIDANDO COM PENSAMENTOS DE CONTROLE.mp3`
- `PODCAST 003 LIDANDO COM FOMO.mp3`
- `PODCAST 004 LIDANDO COM O TÉDIO.mp3`
- `PODCAST 005 SUPERANDO INSEGURANÇA.mp3`
- `PODCAST 006 FINJA ATÉ SER VERDADE.mp3`
- `PODCAST 007 MEDITAÇÃO GUIADA.mp3`
Sinais em arquivos-fonte:
- `.github/workflows/audio-kokoro-production-main.yml` — audio_extension_ref, tts_term
- `.github/workflows/audio-v3.yml` — audio_extension_ref, tts_term
- `.github/workflows/enforce-ten-audios.yml` — audio_extension_ref
- `.github/workflows/generate-audio-n2.yml` — audio_extension_ref, tts_term
- `audio-freeze-20260825.json` — audio_extension_ref
- `audio/n2/audio-spec.json` — audio_extension_ref
- `data/audio-v3.json` — audio_extension_ref, tts_term
- `data/pilulas.json` — audio_extension_ref
- `index.html` — audio_tag
- `package.json` — tts_term
- `README.md` — tts_term
- `scripts/audio-build.mjs` — tts_term
- `scripts/generate_audio_n2.py` — audio_extension_ref, tts_term
- `scripts/render-tts-openai.mjs` — tts_term

### Podcast-ATS-CBMMG

Arquivos de áudio:
- `001 Aborgagem Técnica - comunicação que salva!.mp3.mp3`
- `002 Comportamentos Desejáveis na Abordagem Técnica.mp3.mp3`
- `003 Comportamentos que Devem Ser Evitados na Abordagem Técnica.mp3.mp3`
- `004 A Aproximação Segura no Atendimento a Tentativas de Suicídio.mp3.mp3`
- `005 O Poder de Ouvir.mp3.mp3`
- `006 A Apresentação Pessoal A Primeira Conexão.mp3.mp3`
- `007 Perguntas Simples -  Rastreando Fatores de Risco e Proteção.mp3.mp3`
- `008 Usando Perguntas Simples com Tentante de Perfil Depressivo.mp3.mp3`
- `009 Usando Perguntas Simples com Tentante de Perfil Agressivo.mp3.mp3`
- `010 Usando Perguntas Simples com Tentante de Perfil Psicótico.mp3.mp3`
- `011 Usando Perguntas Complexas para Apoiar o Tentante.mp3.mp3`
- `012 Ferramentas de Diálogo Influenciando a Reflexão do Tentante.mp3.mp3`
- `013 Técnica do Sucesso Anterior Resgatando Estratégias do Passado.mp3.mp3`
- `014 Ponte para o Passado Resgatando Memórias Agradáveis.mp3.mp3`
- `015 Ponte para o Futuro Criando Perspectivas Positivas.mp3.mp3`
- `016 Paráfrase Resumida Refinando o Foco no Diálogo.mp3.mp3`
- `017 Especificidades para Abordar Tentantes de Perfil Depressivo.mp3.mp3`
- `018 Especificidades para Abordar Tentantes de Perfil Agressivo.mp3.mp3`
- `019 Especificidades para Abordar Tentantes de Perfil Psicótico.mp3.mp3`
- `020 Entrada Forçada Quando a Segurança Exige Ação.mp3.mp3`
- `021 Encerramento Continuemos a Girar a Ampulheta da Vida.mp3.mp3`
- `A2 000 Desvendando as Engrenagens do Comportamento Suicida.mp3`
- `A2 001 A Origem do Suicídio.mp3`
- `A2 002 Os Bastidores do Cérebro.mp3`
- `A2 003 O Peso da Mente.mp3`
- `A2 004 Maria e as sombras da depressao.mp3`
- `A2 005 Cláudio e os Ciclos do TAB.mp3`
- `A2 006 Fernanda na Rede da Dependência.mp3`
- `A2 007 Entrevista com Júlia.mp3`
- `A2 008 Entrevista com Dra Sara.mp3`
- `A2 009 Dona Lurdes e sua irmã.mp3`
- `A2 010 Fatores Invisíveis Vulnerabilidades Sociais e Filosóficas.mp3`
- `A2 011 Quando o Cérebro Quebra.mp3`
- `A2 012 A Impulsividade e o Comportamento de Fuga.mp3`
- `A3 013 Um Novo Olhar para as Engrenagens.mp3`
- `assets/audio/serie-1/a1-001-s3n2.mp3`
- `assets/audio/serie-1/a1-002-s3n2.mp3`
- `assets/audio/serie-1/a1-003-s3n2.mp3`
- `assets/audio/serie-1/a1-004-s3n2.mp3`
- `assets/audio/serie-1/a1-005-s3n2.mp3`
- `assets/audio/serie-1/a1-006-s3n2.mp3`
- `assets/audio/serie-1/a1-007-s3n2.mp3`
- `assets/audio/serie-1/a1-008-s3n2.mp3`
- `assets/audio/serie-1/a1-009-s3n2.mp3`
- `assets/audio/serie-1/a1-010-s3n2.mp3`
- `assets/audio/serie-1/a1-011-s3n2.mp3`
- `assets/audio/serie-1/a1-012-s3n2.mp3`
- `assets/audio/serie-1/a1-013-s3n2.mp3`
- `assets/audio/serie-1/a1-014-s3n2.mp3`
- `assets/audio/serie-1/a1-015-s3n2.mp3`
- `assets/audio/serie-1/a1-016-s3n2.mp3`
- `assets/audio/serie-1/a1-017-s3n2.mp3`
- `assets/audio/serie-1/a1-018-s3n2.mp3`
- `assets/audio/serie-1/a1-019-s3n2.mp3`
- `assets/audio/serie-1/a1-020-s3n2.mp3`
- `assets/audio/serie-1/a1-021-s3n2.mp3`
- `assets/audio/serie-2/a2-000-s3v2.mp3`
- `assets/audio/serie-2/a2-000-s3v3.mp3`
- `assets/audio/serie-2/a2-000.mp3`
- `assets/audio/serie-2/a2-001-s3v2.mp3`
- `assets/audio/serie-2/a2-001-s3v3.mp3`
- `assets/audio/serie-2/a2-001.mp3`
- `assets/audio/serie-2/a2-002-s3v2.mp3`
- `assets/audio/serie-2/a2-002-s3v3.mp3`
- `assets/audio/serie-2/a2-002.mp3`
- `assets/audio/serie-2/a2-003-s3v2.mp3`
- `assets/audio/serie-2/a2-003-s3v3.mp3`
- `assets/audio/serie-2/a2-003.mp3`
- `assets/audio/serie-2/a2-004-s3v2.mp3`
- `assets/audio/serie-2/a2-004-s3v3.mp3`
- `assets/audio/serie-2/a2-004.mp3`
- `assets/audio/serie-2/a2-005-s3v2.mp3`
- `assets/audio/serie-2/a2-005-s3v3.mp3`
- `assets/audio/serie-2/a2-005.mp3`
- `assets/audio/serie-2/a2-006-s3v2.mp3`
- `assets/audio/serie-2/a2-006-s3v3.mp3`
- `assets/audio/serie-2/a2-006.mp3`
- `assets/audio/serie-2/a2-007-s3v2.mp3`
- `assets/audio/serie-2/a2-007-s3v3.mp3`
- `assets/audio/serie-2/a2-007.mp3`
- `assets/audio/serie-2/a2-008-s3v2.mp3`
- `assets/audio/serie-2/a2-008-s3v3.mp3`
- `assets/audio/serie-2/a2-008.mp3`
- `assets/audio/serie-2/a2-009-s3v2.mp3`
- `assets/audio/serie-2/a2-009-s3v3.mp3`
- `assets/audio/serie-2/a2-009.mp3`
- `assets/audio/serie-2/a2-010-s3v2.mp3`
- `assets/audio/serie-2/a2-010-s3v3.mp3`
- `assets/audio/serie-2/a2-010.mp3`
- `assets/audio/serie-2/a2-011-s3v2.mp3`
- `assets/audio/serie-2/a2-011-s3v3.mp3`
- `assets/audio/serie-2/a2-011.mp3`
- `assets/audio/serie-2/a2-012-s3v2.mp3`
- `assets/audio/serie-2/a2-012-s3v3.mp3`
- `assets/audio/serie-2/a2-012.mp3`
- `assets/audio/serie-2/a2-013-s3v2.mp3`
- `assets/audio/serie-2/a2-013-s3v3.mp3`
- `assets/audio/serie-2/a2-013.mp3`
- `assets/audio/serie-3/psp-01.mp3`
- `assets/audio/serie-3/psp-02.mp3`
- `assets/audio/serie-3/psp-03.mp3`
- `assets/audio/serie-3/psp-04.mp3`
- `assets/audio/serie-3/psp-05.mp3`
- `assets/audio/serie-3/psp-06.mp3`
- `assets/audio/serie-3/psp-07.mp3`
- `assets/audio/serie-3/psp-08.mp3`
- `assets/audio/serie-3/psp-09.mp3`
- `assets/audio/serie-3/psp-10.mp3`
Sinais em arquivos-fonte:
- `.github/workflows/generate-psp-audio.yml` — audio_extension_ref, tts_term
- `.github/workflows/remaster-series1-n2.yml` — tts_term
- `.github/workflows/remaster-series2-n2.yml` — tts_term
- `app.js` — audio_tag, audio_extension_ref
- `assets/audio/serie-1/quality.json` — audio_extension_ref
- `assets/audio/serie-2/quality-s3-parity.json` — audio_extension_ref
- `assets/audio/serie-2/quality.json` — audio_extension_ref
- `psp.js` — audio_tag
- `PYTHON_LAYER.md` — audio_extension_ref
- `README_SERIE3_AUDIO.md` — audio_tag
- `scripts/audio_pipeline.py` — audio_extension_ref
- `scripts/generate_psp_audio.py` — audio_extension_ref
- `scripts/remaster_series1_n2.py` — audio_extension_ref
- `scripts/remaster_series2_n2.py` — audio_extension_ref

### regulacao-polivagal.

Arquivos de áudio:
- `audio/n2/adiar-01.mp3`
- `audio/n2/adiar-02.mp3`
- `audio/n2/adiar-03.mp3`
- `audio/n2/adiar-04.mp3`
- `audio/n2/complete.mp3`
- `audio/n2/conexao-01.mp3`
- `audio/n2/conexao-02.mp3`
- `audio/n2/conexao-03.mp3`
- `audio/n2/conexao-04.mp3`
- `audio/n2/desfusao-01.mp3`
- `audio/n2/desfusao-02.mp3`
- `audio/n2/desfusao-03.mp3`
- `audio/n2/desfusao-04.mp3`
- `audio/n2/exalar-01.mp3`
- `audio/n2/exalar-02.mp3`
- `audio/n2/exalar-03.mp3`
- `audio/n2/exalar-04.mp3`
- `audio/n2/exalar-05.mp3`
- `audio/n2/movimento-01.mp3`
- `audio/n2/movimento-02.mp3`
- `audio/n2/movimento-03.mp3`
- `audio/n2/movimento-04.mp3`
- `audio/n2/movimento-05.mp3`
- `audio/n2/onda-01.mp3`
- `audio/n2/onda-02.mp3`
- `audio/n2/onda-03.mp3`
- `audio/n2/onda-04.mp3`
- `audio/n2/onda-05.mp3`
- `audio/n2/orientar-01.mp3`
- `audio/n2/orientar-02.mp3`
- `audio/n2/orientar-03.mp3`
- `audio/n2/orientar-04.mp3`
- `audio/n2/orientar-05.mp3`
- `audio/n2/pressao-01.mp3`
- `audio/n2/pressao-02.mp3`
- `audio/n2/pressao-03.mp3`
- `audio/n2/pressao-04.mp3`
- `audio/n2/sabia-01.mp3`
- `audio/n2/sabia-02.mp3`
- `audio/n2/sabia-03.mp3`
- `audio/n2/sabia-04.mp3`
- `audio/n2/sabia-05.mp3`
- `audio/n2/stop-01.mp3`
- `audio/n2/stop-02.mp3`
- `audio/n2/stop-03.mp3`
- `audio/n2/stop-04.mp3`
- `audio/n2/temperatura-01.mp3`
- `audio/n2/temperatura-02.mp3`
- `audio/n2/temperatura-03.mp3`
- `audio/n2/temperatura-04.mp3`
- `audio/n2/valores-01.mp3`
- `audio/n2/valores-02.mp3`
- `audio/n2/valores-03.mp3`
- `audio/n2/valores-04.mp3`
Sinais em arquivos-fonte:
- `.github/workflows/generate-audio-n2.yml` — speech_synthesis, audio_extension_ref, tts_term
- `audio-freeze-20260825.json` — speech_synthesis
- `audio-n2.js` — new_audio
- `audio/n2/manifest.json` — audio_extension_ref
- `scripts/generate_audio_n2.py` — audio_extension_ref

### RPD

Arquivos de áudio:
- `audio/rpd1-n2.mp3`
- `RPD1.mp3`
Sinais em arquivos-fonte:
- `.github/workflows/remaster-audio-n2.yml` — audio_extension_ref, tts_term
- `_includes/v210_intro.html` — audio_tag, audio_extension_ref
- `assets/js/audio-n2.js` — audio_tag
- `audio-freeze-20260825.json` — audio_extension_ref
- `audio/audio-spec.json` — audio_extension_ref
- `index.html` — audio_tag, audio_extension_ref
- `README.md` — audio_extension_ref
- `scripts/remaster_rpd_n2.py` — audio_extension_ref
- `tests/rpd.spec.js` — audio_extension_ref

### sono-em-dia-

Arquivos de áudio:
- `audio/anxiety.mp3`
- `audio/awake.mp3`
- `audio/frustrated.mp3`
- `audio/middle.mp3`
- `audio/mind.mp3`
- `audio/module1.mp3`
- `audio/module2.mp3`
- `audio/module3.mp3`
- `audio/module4.mp3`
- `audio/module5.mp3`
- `audio/module6.mp3`
- `audio/module7.mp3`
- `audio/module8.mp3`
- `audio/slow.mp3`
- `audio/welcome.mp3`
Sinais em arquivos-fonte:
- `.github/workflows/audit-audio-ecosystem.yml` — tts_term
- `.github/workflows/generate-audio.yml` — audio_extension_ref, tts_term
- `.github/workflows/remove-legacy-tts.yml` — speech_synthesis, new_audio, tts_term
- `AUDITORIA-UX-28-PONTOS.md` — tts_term
- `js/audio-premium.js` — new_audio, audio_extension_ref
- `README.md` — tts_term
- `scripts/audit_audio_ecosystem.py` — speech_synthesis, audio_tag, audio_extension_ref, tts_term
- `scripts/generate-audio.py` — audio_extension_ref

