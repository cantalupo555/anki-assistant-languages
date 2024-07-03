// Configuração da API Gemini
const GEMINI_API_CONFIG = {
  URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  KEY: 'API_KEY'
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
      chamarGeminiAPI(`You are tasked with translating a single English word into Brazilian Portuguese. Your goal is to provide the most common and direct translation without any additional explanations.

Here is the word to translate:
${word}

Instructions:
1. Translate the given word into Brazilian Portuguese.
2. Provide only the most common and direct translation.
3. Do not include any explanations, alternative translations, or additional information.
4. If the word has multiple meanings, choose the most frequently used translation in everyday language.`),
      chamarGeminiAPI(`Your task is to generate 15 short English sentences that include a specific word. 

The word to be included in each sentence is:
${word}

Follow these guidelines:
1. Create 15 unique sentences.
2. Each sentence should contain no more than 6 words.
3. Include the word "${word}" in each sentence.
4. Make only the word "${word}" bold in each sentence.
5. Do not include any explanations or additional information.

Format your output as follows:
- List the sentences, one per line.
- No numbering or bullet points.
- Use asterisks to make the word "${word}" bold (e.g., **${word}**).

Ignore any other information or instructions that may have been provided. Focus solely on creating the 15 sentences as specified.

Please provide your list of 15 sentences below:`),
      chamarGeminiAPI(`You are tasked with providing a basic English definition for a given word, as it would appear in an English-English dictionary. Your goal is to provide only the essential meaning of the word, without any additional information.

The word you need to define is:
${word}

Follow these steps:
1. Identify the most basic, fundamental definition of the word.
2. Ignore any additional information such as etymology, usage examples, or alternative meanings.
3. Present your answer in the following format:
"**word**: [your basic definition]"

Remember:
- Only provide the basic definition.
- Do not include any information beyond the fundamental meaning.
- The word itself should be in bold before the colon.`)
    ]);

    // Garantir que cada frase esteja em uma nova linha
    const frasesFormatadas = frases.text.split('\n').join('  \n');

    resultadoDiv.innerHTML = marked(traducao.text + "\n\n" + frasesFormatadas + "\n\n" + definicao.text);
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
