# Todo List for Anki Assistant Languages

## Frontend
- [ ] Adicionar validação de entrada de dados no formulário
- [ ] Criar uma página de login
- [ ] Implementar a autenticação no frontend:
  - [ ] Adicionar campo de e-mail no formulário de login
  - [ ] Exibir um formulário para o usuário inserir o código de 6 dígitos
  - [ ] Enviar o código de 6 dígitos fornecido pelo usuário para o backend
  - [ ] Permitir o login após a validação bem-sucedida do código
- [ ] Adicionar suporte para registro de novos usuários
- [ ] Adicionar funcionalidades de gerenciamento de usuários, como edição de perfil e logout
- [ ] Adicionar feedback visual para ações de login e registro
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
- [ ] Reformular o header do frontend
- [ ] Criar uma página de configurações, na qual o usuário poderá personalizar:
  - [ ] Modelo LLM (Language Model) de sua preferência
  - [ ] Número de sentenças geradas
  - [ ] Voz TTS preferida para o idioma selecionado
- [x] Corrigir 'translationTokenCount' is assigned a value but never used
- [ ] Renomear as constantes `API_URL_DEFINITIONS` e `API_URL_SENTENCES` para `DEFINITIONS_API_URL` e `SENTENCES_API_URL` respectivamente
- [ ] Atualizar todas as referências às constantes renomeadas no código
- [ ] Implementar a integração com `OpenRouter`:
  - [ ] Atualizar a interface do usuário para permitir a seleção do modelo de linguagem do OpenRouter

## Backend
- [ ] Adicionar testes unitários e de integração para as rotas do Express
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
- [ ] Implementar a integração com `OpenRouter`:
  - [x] Inserir as chaves de API e URLs necessárias dentro do .env
  - [ ] Testar a integração com a API do OpenRouter
  - [ ] Implementar a lógica para gerar definições e sentenças usando o OpenRouter
  - [ ] Implementar a lógica para traduzir sentenças usando o OpenRouter
  - [ ] Atualizar as rotas e endpoints para suportar a integração com o OpenRouter
  - [ ] Atualizar as chamadas de API para chamar o arquivo correto `./anthropicClaude` ou `./openRouter.ts` de acordo com a seleção do usuário
- [ ] Adicionar suporte para fallbacks para APIs em caso de falhas:
  - [ ] Implementar a lógica de fallback para a API de geração de definições
  - [ ] Implementar a lógica de fallback para a API de geração de sentenças
  - [ ] Implementar a lógica de fallback para a API de tradução
  - [ ] Implementar a lógica de fallback para a API de TTS (Text-to-Speech)
  - [ ] Implementar a recuperação automática de chamadas de APIs em caso de falhas
- [ ] Adicionar logs de falhas nas chamadas de APIs

## Integração de APIs
- [x] ~~Implementar a integração com `Google Gemini`~~ [Descontinuado - Gemini não apresentou um resultado satisfatório]
- [x] Implementar a integração com `Anthropic Claude`
- [x] Implementar a integração com `Google Cloud TTS`
- [x] Implementar a integração com `Azure Speech`
- [ ] Implementar a integração com `OpenRouter`
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
