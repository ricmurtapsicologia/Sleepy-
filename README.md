# Sono em Dia

Plataforma pública de educação, acompanhamento e ferramentas psicológicas para qualidade do sono.

## Estrutura

- `index.html` — aplicação e conteúdo estrutural
- `css/styles.css` — design system, responsividade e night mode
- `js/content.js` — módulos, triagem educativa e roteiros de áudio
- `js/app.js` — navegação, diário, mapa, progresso, plano, compartilhamento e áudio
- `assets/` — identidade visual e preview social
- `manifest.webmanifest` + `sw.js` — experiência instalável/offline básica

## Privacidade

A versão atual usa `localStorage` no próprio navegador para avaliação inicial, diário, progresso e plano pessoal. Não há backend nem transmissão automática dos registros.

## Áudio

A versão inicial funciona imediatamente com `SpeechSynthesis` do navegador. O sistema:

- procura uma voz `pt-BR` disponível no dispositivo;
- prioriza vozes locais/naturais conhecidas quando disponíveis;
- usa velocidade distinta para explicações e práticas de desaceleração;
- fragmenta o roteiro por frases para inserir pausas mais orgânicas;
- oferece transcrição integral.

A qualidade final da voz depende do sistema operacional e do navegador. Para padronização premium em todos os dispositivos, a arquitetura está pronta para substituir o TTS local por arquivos de áudio próprios/licenciados (MP3/M4A/Opus) sem alterar o conteúdo dos módulos. Os roteiros estão centralizados em `js/content.js`.

### Diretriz de produção de voz gravada/TTS premium

- português brasileiro adulto;
- timbre médio ou médio-grave;
- explicações em ~135–155 palavras/min;
- práticas em ~105–130 palavras/min;
- prosódia variável e natural;
- sem locução publicitária, dramatização ou voz infantilizada;
- pausas breves entre ideias e mais longas apenas em exercícios;
- loudness alvo aproximado: -16 LUFS;
- true peak máximo aproximado: -1 dBTP;
- sem música nos áudios explicativos;
- ambiente opcional e muito discreto nos exercícios.

## Publicação no GitHub Pages

O projeto é estático e pode ser publicado diretamente a partir da branch `main`. Configure GitHub Pages para servir a raiz do repositório.

## Princípios clínicos/editoriais

- não emite diagnóstico automático;
- não promete sono, cura ou resultado;
- não trata higiene do sono isoladamente como solução universal;
- evita pontuação de desempenho do sono;
- prioriza tendências de vários dias;
- orienta avaliação profissional quando surgem sinais que merecem investigação individual.
