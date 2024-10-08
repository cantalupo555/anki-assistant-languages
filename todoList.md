# Todo List for Anki Assistant Languages

## Frontend
- [ ] Adicionar validação de entrada de dados no formulário:
  - [ ] Campo word-input
  - [ ] Verificar se os dados inseridos são válidos (por exemplo, e-mail no formato correto)
- [x] Tornar todos os campos obrigatórios
- [ ] Criar uma página de login:
  - [ ] Adicionar rotas para a página de login
  - [ ] Criar um formulário de login
- [ ] Implementar a autenticação no frontend:
  - [ ] Adicionar campo de e-mail no formulário de login
  - [ ] Exibir um formulário para o usuário inserir o código de 6 dígitos
  - [ ] Enviar o código de 6 dígitos fornecido pelo usuário para o backend
  - [ ] Permitir o login após a validação bem-sucedida do código
- [ ] Adicionar suporte para registro de novos usuários:
  - [ ] Criar uma página de registro
  - [ ] Adicionar rotas para a página de registro
  - [ ] Adicionar um formulário de registro
- [ ] Adicionar funcionalidades de gerenciamento de usuários:
  - [ ] Adicionar opções para edição de perfil
  - [ ] Adicionar opção de logout
- [ ] Adicionar feedback visual para ações de login e registro:
  - [ ] Exibir feedback visual quando o usuário realiza ações de login ou registro
- [x] Dividir a rota `/generate` para separar a geração de definições e sentenças, garantindo que ao clicar no botão `Generate` faça chamadas ao mesmo tempo na geração de definições e sentenças:
  - [x] Criar uma função separada para fazer a chamada à rota `/generate/definitions`
  - [x] Criar uma função separada para fazer a chamada à rota `/generate/sentences`
  - [x] Chamar as duas funções simultaneamente ao clicar no botão `Generate`
- [x] Implementar a soma dos tokens das rotas `/translate`, `/generate/sentences` e `/generate/definitions`:
  - [x] Atualizar o state para incluir a soma dos tokens
  - [x] Exibir a soma dos tokens no frontend
  - [x] Chamar endpoint `/token/sum` ao clicar no botão `Translate this sentence`
  - [x] Ao clicar no botão `Translate this sentence`, somar os tokens da tradução atual aos tokens já somados anteriormente, tornando o totalTokenCount dinâmico
  - [x] Sempre que clicar no botão `Translate this sentence` fazer a soma de tokens junto com tokens somados anteriores, garantindo que a soma seja cumulativa
  - [x] Remover `translationTokenCount` em `App.tsx`
- [ ] Reformular o header do frontend:
  - [ ] Melhorar a aparência e a usabilidade do header
- [ ] Criar uma página de configurações, na qual o usuário poderá personalizar:
  - [ ] Modelo LLM (Language Model) de sua preferência
  - [ ] Número de sentenças geradas
  - [ ] Voz TTS preferida para o idioma selecionado
- [x] Corrigir 'translationTokenCount' is assigned a value but never used
- [x] Renomear as constantes `API_URL_DEFINITIONS` e `API_URL_SENTENCES` para `DEFINITIONS_URL` e `SENTENCES_URL` respectivamente
- [x] Implementar a integração com `OpenRouter`:
  - [x] Atualizar a interface do usuário para permitir a seleção do modelo de linguagem do OpenRouter
  - [x] Adicionar lógica para chamar a API correta dentro do `expressServer.ts` usando `apiService`
  - [x] Garantir que a seleção no campo `Select API Service` fique salvo
- [x] Implementar a persistência dos campos selecionados pelo usuário usando context e localStorage:
  - [x] Salvar a seleção de idioma nativo, idioma de aprendizado, serviço de API, serviço de TTS e voz preferida no localStorage
  - [x] Carregar as seleções salvas do localStorage ao iniciar a aplicação
  - [x] Atualizar o contexto do aplicativo para refletir as seleções salvas
  - [x] Corrigir o campo `Select Voice:` para que a opção selecionada seja persistida corretamente no localStorage
- [ ] Otimizar o carregamento de assets:
  - [ ] Minimizar o tamanho dos assets
  - [ ] Utilizar lazy loading para imagens e outros assets
- [ ] Melhorar a experiência do usuário com animações e transições suaves:
  - [ ] Adicionar transições suaves para mudanças de estado
  - [ ] Adicionar animações para feedback visual
- [ ] Feedback visual para ações do usuário:
  - [ ] Exibir feedback visual quando o usuário salva itens, remove itens, e outras ações
  - [ ] Apriomar feedback visual durante o carregamento do `handleSubmit`
  - [ ] Apriomar feedback visual durante o carregamento do `handleAnalyzeFrequency`
  - [ ] Apriomar feedback visual durante o carregamento do `handleTranslation`
- [ ] Implementar um dark mode:
  - [ ] Adicionar suporte para dark mode
  - [ ] Permitir a alternância entre light e dark mode
- [ ] Melhorar a acessibilidade da aplicação:
  - [ ] Garantir que a aplicação seja navegável via teclado
- [x] Adicionar suporte ao prompt `analyzeFrequency`
  - [x] Criar uma função para tratar a requisição de análise de frequência no `App.tsx`
  - [x] Adicionar um botão para acionar a análise de frequência na interface do usuário
  - [x] Criar uma modal para exibir o resultado da análise de frequência detalhadamente
  - [x] Aprimorar o estilo `Modal.css`
  - [x] Aprimorar o estilo `App.css` para aumentar a separação entre botões
- [x] Adicionar console.log em `handleSubmit`, `handleAnalyzeFrequency` e `handleTranslation` para debugging

## Backend
- [ ] Implementar a funcionalidade de salvar itens no banco de dados
- [ ] Adicionar suporte para múltiplos usuários, incluindo registro, login, e gerenciamento de perfis
- [ ] Implementar a gestão de sessões de usuário
- [ ] Implementar autenticação por código enviado por e-mail:
  - [ ] Implementar a geração de um código de 6 dígitos
  - [ ] Enviar o código de 6 dígitos para o e-mail do usuário
  - [ ] Validar o código de 6 dígitos fornecido pelo frontend
- [x] Dividir a rota `/generate` para separar a geração de definições e sentenças, garantindo que ao clicar no botão `Generate` faça chamadas ao mesmo tempo na geração de definições e sentenças:
  - [x] Criar uma nova rota `/generate/definitions` para a geração de definições
  - [x] Criar uma nova rota `/generate/sentences` para a geração de sentenças
  - [x] Implementar a lógica para gerar definições na rota `/generate/definitions`
  - [x] Implementar a lógica para gerar sentenças na rota `/generate/sentences`
- [x] Implementar a soma dos tokens das rotas `/translate`, `/generate/sentences` e `/generate/definitions`:
  - [x] Atualizar a lógica de cálculo dos tokens para incluir a soma dos tokens de todas as rotas
  - [x] Implementar novo endpoint `/token/sum`
- [ ] Implementar suporte para modelos LLM personalizados e número de sentenças geradas
- [ ] Implementar suporte para selecionar a voz TTS preferida no backend
- [x] Implementar a integração com `OpenRouter`:
  - [x] Inserir as chaves de API e URLs necessárias dentro do .env
  - [x] Criar `./openRouter.ts` para realizar interação com API do OpenRouter
  - [x] Testar a integração com a API do OpenRouter
  - [x] Implementar a lógica para gerar definições usando o OpenRouter
  - [x] Implementar a lógica para gerar sentenças usando o OpenRouter
  - [x] Implementar a lógica para traduzir sentenças usando o OpenRouter
  - [x] Atualizar as rotas e endpoints para suportar a integração com o OpenRouter
  - [x] Atualizar as chamadas de API para chamar o arquivo correto `./anthropicClaude` ou `./openRouter.ts` de acordo com a seleção do usuário
- [ ] Adicionar suporte para fallbacks para APIs em caso de falhas:
  - [ ] Implementar a lógica de fallback para a API de geração de definições
  - [ ] Implementar a lógica de fallback para a API de geração de sentenças
  - [ ] Implementar a lógica de fallback para a API de tradução
  - [ ] Implementar a lógica de fallback para a API de TTS (Text-to-Speech)
  - [ ] Implementar a recuperação automática de chamadas de APIs em caso de falhas
- [ ] Adicionar logs de falhas nas chamadas de APIs
- [x] Adicionar suporte ao prompt `analyzeFrequency`
  - [x] Implementar a rota `/analyze/frequency` no `expressServer.ts`
  - [x] Adicionar a lógica para processar a análise de frequência usando o `anthropicClaude`
  - [x] Adicionar a lógica para processar a análise de frequência usando o `openRouter`
  - [x] Testar a integração da rota `/analyze/frequency` com as APIs Anthropic Claude e OpenRouter
  - [x] Adicionar a lógica de cálculo dos tokens na rota `/analyze/frequency`
  - [x] Implementar a soma dos tokens da rota `/analyze/frequency` com os tokens de outras rotas
  - [x] Atualizar a lógica de cálculo dos tokens para incluir a soma dos tokens da rota `/analyze/frequency`
- [x] Registro de resultados das respostas da API endpoints:
  - [x] Resultados em `/generate/definitions`
  - [x] Resultados em `/generate/sentences`
  - [x] Resultados em `/translate`
  - [x] Resultados em `/analyze/frequency`
- [x] Renomear as funções do `anthropicClaude`

## Integração de APIs
- [x] ~~Implementar a integração com `Google Gemini`~~ [Descontinuado - Gemini não apresentou um resultado satisfatório]
- [x] Implementar a integração com `Anthropic Claude`
- [x] Implementar a integração com `Google Cloud TTS`
- [x] Implementar a integração com `Azure Speech`
- [x] Implementar a integração com `OpenRouter`
- [ ] Implementar fallbacks para APIs em caso de falhas

## Documentação
- [x] Adicionar informações sobre o projeto no `README.md`
- [ ] Escrever a documentação detalhada para o uso do frontend e do backend
- [ ] Criar guias de instalação e configuração
- [ ] Criar guia detalhado para importação de flashcards no Anki

## Performance e Otimização
- [ ] Otimizar o uso de memória e desempenho das rotas do Express
- [ ] Melhorar o carregamento de assets para reduzir o tempo de carregamento da aplicação
- [ ] Otimizar a lógica de geração de definições e sentenças

## Segurança
- [ ] Implementar a criptografia de dados sensíveis
- [ ] Adicionar proteções contra injeção de SQL e outros tipos de ataques
- [ ] Adicionar proteções contra ataques CSRF (Cross-Site Request Forgery)
- [ ] Adicionar proteções contra ataques XSS
- [ ] Implementar a autenticação e autorização para as rotas protegidas

## UX e Design
- [ ] Melhorar a experiência do usuário com animações e transições suaves
- [ ] Implementar um dark mode para a aplicação
- [ ] Adicionar mais feedback visual para ações do usuário
- [ ] Implementar a personalização de temas
- [ ] Melhorar a acessibilidade da aplicação

## Deploy
- [ ] Implementar o monitoramento e o registro de logs em produção
- [ ] Configurar o equilíbrio de carga para o backend
- [ ] Implementar a gestão de versões para o frontend e o backend
