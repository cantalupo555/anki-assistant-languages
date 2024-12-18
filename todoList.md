# Todo List for Anki Assistant Languages

## Frontend
- [ ] Adicionar validação de entrada de dados no formulário:
  - [ ] Campo word-input
  - [ ] Verificar se os dados inseridos são válidos (por exemplo, e-mail no formato correto)
- [x] Tornar todos os campos obrigatórios
- [ ] Criar uma página de login:
  - [ ] Adicionar rotas para a página de login
  - [x] Criar um formulário de login
- [ ] Implementar a autenticação do usuário:
  - [ ] Adicionar campo de e-mail no formulário de login
  - [ ] Exibir um campo para o usuário inserir a senha
  - [ ] Permitir o login após a validação bem-sucedida
  - [ ] Adicionar feedback visual quando o login for concluído
  - [ ] Adicionar feedback visual quando o login for falho
  - [ ] Adicionar feedback visual quando executar o logout
- [ ] Adicionar suporte para registro de novos usuários:
  - [ ] Criar uma página de registro
  - [ ] Adicionar rotas para a página de registro
  - [ ] Adicionar um formulário de registro
  - [ ] Implementar a criptografia de senhas antes de registrá-las
  - [ ] Validar a integridade dos dados de registro (e-mail, senha, etc.)
- [x] Adicionar opção de logout
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
  - [x] Garantir que a seleção no campo `Select API Service` fique salva
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
  - [ ] Aprimorar feedback visual durante o carregamento do `handleSubmit`
  - [ ] Aprimorar feedback visual durante o carregamento do `handleGenerateDialogue`
  - [ ] Aprimorar feedback visual durante o carregamento do `handleAnalyzeFrequency`
  - [ ] Aprimorar feedback visual durante o carregamento do `handleTranslation`
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
- [x] Adicionar console.log para debugging:
  - [x] `handleSubmit`
  - [x] `handleGenerateDialogue`
  - [x] `handleAnalyzeFrequency`
  - [x] `handleTranslation`
- [x] Adicionar console.log para exibir o resultado:
  - [x] `handleSubmit`
  - [x] `handleGenerateDialogue`
  - [x] `handleAnalyzeFrequency`
  - [x] `handleTranslation`
- [x] Garantir chamada ao endpoint `/generate/dialogue` no botão `Generate Dialogue`
- [x] Exibir conteúdo do `handleGenerateDialogue` no Modal
- [x] Corrigir problema na exibição do conteúdo Modal devido a implementação do `handleGenerateDialogue`
- [ ] Corrigir context para o campo AI Model ser salvo corretamente
- [ ] Modularizar as funções de manipulação de eventos no App.tsx:
  - [x] Mover `handleSubmit` para um arquivo separado `handleSubmit.ts`
  - [x] Mover `handleGenerateDialogue` para um arquivo separado `handleGenerateDialogue.ts`
  - [x] Mover `handleAnalyzeFrequency` para um arquivo separado `handleAnalyzeFrequency.ts`
  - [x] Mover `handleTranslation` para um arquivo separado `handleTranslation.ts`
  - [x] Importar as funções modularizadas no `App.tsx`
  - [x] Corrigir warnings de "is assigned a value but never used" em `App.tsx`
  - [x] Corrigir warnings de "is defined but never used" em `handleSubmit.ts`
  - [x] Corrigir warnings de "is defined but never used" em `handleGenerateDialogue.ts`
  - [x] Corrigir warnings de "is defined but never used" em `handleAnalyzeFrequency.ts`
  - [x] Corrigir warnings de "is defined but never used" em `handleTranslation.ts`
- [x] Atualizar `handleTranslation` para receber as informações do usuário pelo `App.tsx`:
  - [x] Modificar a função `handleTranslation` para aceitar `nativeLanguage`, `targetLanguage`, `apiService` e `llm` como parâmetros
  - [x] Passar os valores corretos de `nativeLanguage`, `targetLanguage`, `apiService` e `llm` do `App.tsx` para a função `handleTranslation`
- [ ] Considerar o uso de cookies HTTP-only para armazenar tokens de autenticação em vez de localStorage:
  - [ ] Instalar e configurar `js-cookie` para gerenciar cookies no frontend
  - [ ] Implementar a armazenagem de tokens de autenticação em cookies HTTP-only no `useAuth.ts`
  - [ ] Remover a armazenagem de tokens de autenticação no localStorage
  - [ ] Atualizar a lógica de autenticação para ler tokens de cookies HTTP-only
  - [ ] Atualizar a lógica de logout para remover tokens de cookies HTTP-only
- [ ] Implementar configurações de privacidade:
  - [ ] Adicionar opções para controlar a coleta de dados de uso
  - [ ] Adicionar opções para excluir dados pessoais
- [ ] Proteger endpoints com autenticação e autorização adequadas:
  - [ ] Implementar autenticação de usuários para todas as rotas
  - [ ] Garantir que apenas usuários autenticados possam acessar certas rotas
  - [ ] Implementar tokens de sessão para manter a autenticação
  - [ ] Adicionar middleware de autenticação para rotas protegidas
- [x] Mover a interface `VoiceOption` do `voiceOptions.ts` para `Types.ts`
- [x] Alterar a forma que o `supportedLanguages` é apresentado:
  - [x] Atualizar os `value=` em `LanguageSelector.tsx` para usar os novos nomes de idioma
  - [x] Atualizar as comparações de `targetLanguage ===` em `App.tsx` para usar os novos nomes de idioma
  - [x] Atualizar os `language:` em `voiceOptions.ts` para corresponder aos novos nomes

## Backend
- [ ] Implementar a funcionalidade de salvar itens no banco de dados
- [x] Dividir a rota `/generate` para separar a geração de definições e sentenças, garantindo que ao clicar no botão `Generate` faça chamadas ao mesmo tempo na geração de definições e sentenças:
  - [x] Criar uma nova rota `/generate/definitions` para a geração de definições
  - [x] Criar uma nova rota `/generate/sentences` para a geração de sentenças
  - [x] Implementar a lógica para gerar definições na rota `/generate/definitions`
  - [x] Implementar a lógica para gerar sentenças na rota `/generate/sentences`
- [x] Implementar a soma dos tokens das rotas `/translate`, `/generate/sentences` e `/generate/definitions`:
  - [x] Atualizar a lógica de cálculo dos tokens para incluir a soma dos tokens de todas as rotas
  - [x] Implementar novo endpoint `/token/sum`
- [x] Implementar suporte para modelos LLM personalizados
- [ ] Implementar suporte para selecionar a voz TTS preferida no backend
- [ ] Implementar suporte para selecionar o número de sentenças geradas
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
- [x] Adicionar suporte ao prompt `getDialogue`
  - [x] Implementar a rota `/generate/dialogue` no `expressServer.ts`
  - [x] Adicionar a lógica no `anthropicClaude`
  - [x] Adicionar a lógica no `openRouter`
  - [x] Adicionar a lógica de cálculo dos tokens na rota `/generate/dialogue`
- [x] Implementar novos parâmetros na chamada de API do `openRouter.ts`:
  - [x] Adicionar o parâmetro `max_tokens` nas funções de definições, sentenças, tradução, diálogo, e análise de frequência
  - [x] Adicionar o parâmetro `temperature` nas funções de definições, sentenças, tradução, diálogo, e análise de frequência
- [ ] Implementar a gestão de sessões de usuário
- [ ] Implementar autenticação do usuário:
  - [ ] Validar as credenciais fornecidas pelo frontend
- [ ] Implementar endpoints na autenticação do usuário:
  - [ ] Criar endpoint `/user/login` para autenticação de usuários
  - [ ] Criar endpoint `/user/logout` para logout de usuários
  - [ ] Criar endpoint `/user/register` para registro de usuários
  - [ ] Criar endpoint `/check-auth` para verificar se o usuário está autenticado
  - [ ] Implementar a lógica de validação de credenciais no backend
- [ ] Implementar o uso de um banco de dados PostgreSQL para armazenar dados de usuários e senhas:
  - [ ] Configurar o banco de dados PostgreSQL
  - [ ] Criar tabelas para usuários
  - [ ] Implementar queries para autenticação e registro de usuários
  - [ ] Implementar a criptografia de senhas (bcrypt) antes de armazená-las no banco de dados
- [ ] Considerar o uso de cookies HTTP-only para armazenar tokens de autenticação em vez de localStorage:
  - [ ] Instalar e configurar `cookie-parser` para gerenciar cookies no backend
  - [ ] Implementar a armazenagem de tokens de autenticação em cookies HTTP-only no backend
  - [ ] Atualizar a lógica de autenticação para enviar tokens em cookies HTTP-only
  - [ ] Atualizar a lógica de logout para remover tokens de cookies HTTP-only
- [ ] Proteger endpoints com autenticação e autorização adequadas:
  - [ ] Implementar autenticação de usuários para todas as rotas
  - [ ] Garantir que apenas usuários autenticados possam acessar certas rotas
  - [ ] Implementar tokens de sessão para manter a autenticação
  - [ ] Adicionar middleware de autenticação para rotas protegidas
- [x] Garantir que a lógica de validação e manipulação de idiomas no backend esteja alinhada com as mudanças feitas no frontend
  - [x] Alterar o array `supportedLanguages` em `expressServer.ts` para:
    ```typescript
    const supportedLanguages = [
      'English (United States)',
      'Italian (Italy)',
      'German (Germany)',
      'French (France)',
      'Spanish (Spain)',
      'Portuguese (Brazil)',
      'Dutch (Netherlands)',
      'Polish (Poland)',
      'Russian (Russia)',
      'Mandarin (China)',
      'Japanese (Japan)',
      'Korean (Korea)'
    ];
    ```

## Integração de APIs
- [x] ~~Implementar a integração com `Google Gemini`~~ [Gemini agora funciona no OpenRouter]
- [x] Implementar a integração com `Anthropic Claude`
- [x] Implementar a integração com `Google Cloud TTS`
- [x] Implementar a integração com `Azure Speech`
- [x] Implementar a integração com `OpenRouter`
- [ ] Implementar fallbacks para APIs em caso de falhas
- [x] Implementar os parâmetros `max_tokens` e `temperature` na chamada API OpenRouter
- [ ] Implementar novos endponints responsável pela autenticação do usuário

## Documentação
- [x] Adicionar informações sobre o projeto no `README.md`
- [ ] Criar guias de instalação e configuração
- [ ] Criar guia detalhado para importação de flashcards no Anki
- [ ] Adicionar documentação MIT no projeto:
  - [ ] Incluir a licença MIT no arquivo `LICENSE.md`
  - [ ] Atualizar o `README.md` com informações sobre a licença MIT

## Performance e Otimização
- [ ] Otimizar o uso de memória e desempenho das rotas do Express
- [ ] Melhorar o carregamento de assets para reduzir o tempo de carregamento da aplicação
- [ ] Otimizar a lógica de geração de definições e sentenças

## Segurança
- [ ] Implementar a criptografia de dados sensíveis
- [ ] Adicionar proteções contra injeção de SQL
- [ ] Adicionar proteções contra ataques CSRF (Cross-Site Request Forgery)
- [ ] Adicionar proteções contra ataques XSS
- [ ] Proteger endpoints com autenticação e autorização adequadas
- [ ] Implementar a validação de credenciais no back-end
- [ ] Considerar o uso de cookies HTTP-only para armazenar tokens de autenticação em vez de localStorage
- [ ] Garantir acesso via HTTPS com Nginx

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
