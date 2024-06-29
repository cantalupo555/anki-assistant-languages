// Configuração da API Gemini
const GEMINI_API_CONFIG = {
  URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  KEY: 'SUA_API'
};

// Função para criar elementos HTML
const createElement = (tag, attributes = {}) => {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
};

// Função para chamar a API Gemini
const chamarGeminiAPI = async (promptText) => {
  console.log('Iniciando chamada à API Gemini');
  console.log('Prompt:', promptText);
  try {
    const response = await fetch(`${GEMINI_API_CONFIG.URL}?key=${GEMINI_API_CONFIG.KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0.9,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
      }),
    });

    const data = await response.json();
    console.log('Resposta completa da API Gemini:', data);

    if (!response.ok) {
      throw new Error(`API respondeu com status ${response.status}: ${JSON.stringify(data)}`);
    }

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Nenhum candidato retornado pela API Gemini');
    }

    const text = data.candidates[0].content.parts[0].text;
    const tokens = data.usageMetadata?.totalTokenCount || 0;

    console.log('Texto extraído:', text);
    console.log('Tokens usados:', tokens);

    return { text, tokens };
  } catch (error) {
    console.error('Erro detalhado na chamada à API Gemini:', error);
    throw error;
  }
};

// Função para processar a palavra
const processarPalavra = async (word) => {
  const resultadoDiv = document.getElementById('resultado');
  const contagemTokensDiv = document.getElementById('contagemTokens');

  resultadoDiv.innerHTML = '<p>Carregando...</p>';
  contagemTokensDiv.textContent = '';

  try {
    const [traducao, frases, definicao] = await Promise.all([
      chamarGeminiAPI(`Traduza para o português brasileiro a palavra: "${word}". Forneça apenas a tradução mais comum e direta, sem explicações adicionais.`),
      chamarGeminiAPI(`Gere 15 frases em inglês que contenham a palavra "${word}". Deixe apenas palavra "${word}" que foi informada em negrito. Ao lado de cada frase coloque a sua tradução em português separando com |-|-|.`),
      chamarGeminiAPI(`Forneça a definição da palavra "${word}" em inglês, como em um dicionário inglês-inglês. Se possível adicione "basic definition" e "idioms". Quando tiver "idioms" forneça também exemplos.`)
    ]);

    resultadoDiv.innerHTML = marked("<p>" + traducao.text + "</p><p>" + frases.text + "</p><p>" + definicao.text + "</p>");
    contagemTokensDiv.textContent = `Total de tokens usados: ${traducao.tokens + frases.tokens + definicao.tokens}`;
  } catch (error) {
    resultadoDiv.innerHTML = `<p class="erro">Não foi possível processar a palavra. Erro: ${error.message}</p>`;
  }
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  const executarBtn = document.getElementById('executar');
  const palavraInput = document.getElementById('palavra');

  executarBtn.addEventListener('click', () => processarPalavra(palavraInput.value.trim()));
});
