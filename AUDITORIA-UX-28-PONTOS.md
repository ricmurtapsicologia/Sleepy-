# Sono em Dia — Auditoria dos 28 pontos

Data: 25/08/2026

Legenda: **OK** = implementado e coerente; **PARCIAL** = existe, mas precisa evoluir; **PENDENTE** = não está implementado no nível previsto.

| # | Característica | Status | Análise atual |
|---|---|---|---|
| 1 | Experiência inicial | OK | Landing limpa, proposta clara, CTA principal e continuação. Boa hierarquia e baixa sobrecarga. |
| 2 | Onboarding | OK | Refeito com 14 perguntas objetivas, exemplos, alternativas claras e opção “Prefiro não responder”. |
| 3 | Mapa do sono | PARCIAL | Organiza regularidade, início do sono, despertares, preocupação e impacto diurno. Ainda não transforma todas as novas respostas em dimensões visuais. |
| 4 | Home após onboarding | OK | Registro, foco do dia e continuidade da jornada aparecem como prioridades. |
| 5 | Diário do sono | OK | Registro enxuto, cálculos internos, contexto opcional e armazenamento local. Pode evoluir com edição retroativa e melhor explicação das métricas. |
| 6 | Jornada guiada | OK | Oito módulos coerentes com fundamentos de TCC-I e manutenção. |
| 7 | Estrutura de cada módulo | OK | Entenda → Ouça → Experimente → Observe → Leve para hoje. Perguntas reflexivas foram simplificadas. |
| 8 | Sistema de áudio | PARCIAL | Arquitetura agora prioriza arquivos MP3 naturais em /audio e rejeita voz Google/robótica como padrão. Sem arquivos premium gravados/gerados, a qualidade ainda depende da existência de uma voz natural no aparelho. |
| 9 | “Estou com dificuldade agora” | OK | Seis entradas por estado/situação e roteiros curtos, sem promessa de induzir sono. |
| 10 | Higiene do sono sem moralização | PARCIAL | Princípio editorial está correto, mas falta uma área própria de hábitos com experimento individualizado. |
| 11 | Progresso | PARCIAL | 7/14/30 dias, médias e regularidade existem. Faltam visualizações específicas de qualidade, energia e despertares e insights mais ricos. |
| 12 | Meu Plano de Sono | PARCIAL | Estrutura funcional e impressão/PDF via navegador. Faltam cochilos, ambiente, sinais de alerta, fatores principais e quando buscar ajuda. |
| 13 | Segurança clínica | PARCIAL | Há triagem para respiração, sonolência de risco e impacto. Falta uma camada mais completa para sofrimento psicológico importante, uso inadequado de substâncias/medicação e encaminhamento contextual. |
| 14 | Navegação | OK | Cinco itens mobile, Registrar central, estado persistente e retorno de módulos. |
| 15 | Design | OK | Identidade sóbria, clínica, minimalista, light/dark e sem estética infantil. |
| 16 | Responsividade e acessibilidade | PARCIAL | Mobile-first, reduced-motion, foco, labels e transcrições estão presentes. Ainda falta auditoria WCAG formal e teste real de leitores de tela. |
| 17 | Privacidade | OK | Dados permanecem em LocalStorage; não há analytics clínico; usuário pode apagar tudo. |
| 18 | Compartilhamento | PARCIAL | Web Share e Open Graph existem. O preview social ainda usa SVG e URL relativa, o que pode falhar em WhatsApp/Telegram; ideal é PNG/JPG 1200×630 com URL absoluta após publicação. |
| 19 | Sobre | OK | Curto, técnico e sem currículo excessivo. |
| 20 | Rodapé | OK | Corrigido para alinhamento central, assinatura profissional e hierarquia discreta. Falta apenas inserir Termos diretamente no conjunto principal de links da home. |
| 21 | Referências | PARCIAL | Há referências centrais e atuais, mas a página pode ganhar links/DOIs e bibliografia mais completa. |
| 22 | Tecnologia | OK | HTML/CSS/JS estático, LocalStorage, PWA leve, Web Share e arquitetura sem backend. |
| 23 | Performance | OK | Sem framework pesado; assets leves; áudio é carregado sob demanda. Service worker foi atualizado para network-first e cache v2. |
| 24 | Microinterações | OK | Feedbacks discretos, progresso, estados de módulo e tema sem gamificação infantil. |
| 25 | Personalização | PARCIAL | Há priorização por regularidade, preocupação, cafeína, cochilos e dificuldade para dormir. Ainda não usa todas as 14 respostas para adaptar a trilha. |
| 26 | Princípio de UX | OK | As telas principais deixam claro onde o usuário está, o que fazer e qual é o próximo passo. |
| 27 | Princípio clínico/editorial | OK | Evita moralização, promessas, perfeccionismo, culpa e “forçar o sono”. |
| 28 | Auditoria/entrega | PARCIAL | CI valida sintaxe e arquivos. GitHub Pages continua dependendo da ativação inicial nas configurações do repositório; falta ainda teste visual real em navegador/dispositivos após publicação. |

## Prioridades de próxima evolução

1. Produzir e publicar arquivos de voz humana/TTS neural premium em `/audio` para eliminar dependência do sintetizador do aparelho.
2. Criar área própria “Hábitos que influenciam seu sono”, com um experimento por vez.
3. Completar Meu Plano de Sono.
4. Expandir o painel de tendências sem criar “score”.
5. Fortalecer segurança clínica e critérios de encaminhamento.
6. Criar imagem Open Graph PNG/JPG 1200×630 e URL absoluta.
7. Fazer auditoria visual em 360, 390, 412, 768 px e desktop após publicação.
