# Áudio — produção premium

A plataforma funciona hoje com síntese de voz local do navegador e transcrição integral. Esta pasta é o ponto de substituição para arquivos de voz padronizados quando forem produzidos.

Formato recomendado por faixa:

- principal: `.m4a`/AAC ou `.mp3` de alta qualidade;
- opcional web: `.opus`;
- 44.1 kHz ou 48 kHz;
- loudness integrado em torno de -16 LUFS;
- true peak máximo em torno de -1 dBTP;
- voz em português brasileiro, adulta, serena e natural;
- sem trilha musical nos áudios explicativos;
- ambiência opcional e muito discreta nos exercícios.

Nomenclatura sugerida:

`welcome.mp3`, `module1.mp3` ... `module8.mp3`, `mind.mp3`, `anxiety.mp3`, `awake.mp3`, `middle.mp3`, `frustrated.mp3`, `slow.mp3`.

Os roteiros-fonte estão em `js/content.js` e devem ser gravados como fala natural, não como leitura literal de um texto institucional.
