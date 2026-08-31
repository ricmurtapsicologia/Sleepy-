# N3 Natural — Sono em Dia

Versão: `n3-20260831` • Perfil: `N3-C`.

Esta plataforma usa síntese de fala neural pt-BR sem paisagem sonora decorativa. O objetivo é proximidade, clareza e naturalidade clínica.

Regras locais:

- voz canônica: `pt-BR-AntonioNeural`, salvo mudança editorial explícita;
- MP3 128 kbps, mono, 44,1 kHz;
- alvo -18 dBFS e pico máximo -1,2 dBFS;
- compressão leve 2:1;
- segmentação em unidades respiratórias sem alteração lexical;
- prosódia determinada pela função semântica da frase, nunca pelo índice do turno;
- perfil `calm` usa pausas experienciais maiores para instruções/reflexões;
- perfil `explain` usa cadência conversacional e pausas menores;
- nenhum ambiente, trilha ou Foley é inserido nesta superfície, salvo futura justificativa clínica explícita;
- `speechSynthesis`/`SpeechSynthesisUtterance` são proibidos no runtime.

O baseline N2 permanece rastreável pelo Git e pelo manifesto de congelamento pré-N3.
