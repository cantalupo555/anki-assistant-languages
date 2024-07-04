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

// Função para limpar as frases geradas
const clearGeneratedSentences = () => {
  const sentencasGeradasDiv = document.getElementById('sentencasGeradas');
  const sentencaSelecionadaDiv = document.getElementById('sentencaSelecionada');
  sentencasGeradasDiv.innerHTML = '';
  sentencaSelecionadaDiv.innerHTML = '';
};


// Função para salvar a frase no localStorage
const saveSentence = (sentence) => {
  const savedSentences = getSavedSentences();
  savedSentences.push(sentence); // Agora salvamos a frase com os asteriscos
  localStorage.setItem('savedSentences', JSON.stringify(savedSentences));
  clearGeneratedSentences(); // Limpa as frases geradas após salvar
  displaySavedSentences(); // Atualiza a exibição imediatamente após salvar
};

// Função para recuperar frases salvas
const getSavedSentences = () => {
  return JSON.parse(localStorage.getItem('savedSentences') || '[]');
};

// Função para limpar o localStorage
const clearSavedSentences = () => {
  localStorage.removeItem('savedSentences');
  displaySavedSentences(); // Atualiza a exibição após limpar
};

// Função para exibir frases salvas
const displaySavedSentences = () => {
  const savedSentencesDiv = document.getElementById('savedSentences');
  const savedSentences = getSavedSentences();
  
  savedSentencesDiv.innerHTML = '<h3>Frases Salvas:</h3>';
  if (savedSentences.length === 0) {
    savedSentencesDiv.innerHTML += '<p>Nenhuma frase salva.</p>';
  } else {
    const ul = document.createElement('ul');
    savedSentences.forEach((sentence, index) => {
      const li = document.createElement('li');
      li.innerHTML = marked(sentence); // Usa marked para renderizar o Markdown
      ul.appendChild(li);
    });
    savedSentencesDiv.appendChild(ul);
  }

  // Adiciona o botão para limpar o localStorage
  const clearButton = document.createElement('button');
  clearButton.textContent = 'Limpar Frases Salvas';
  clearButton.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja limpar todas as frases salvas?')) {
      clearSavedSentences();
    }
  });
  savedSentencesDiv.appendChild(clearButton);
};

// Função para criar elementos de frase clicáveis
const createSentenceElements = (sentences) => {
  const sentencasGeradasDiv = document.getElementById('sentencasGeradas');
  sentencasGeradasDiv.innerHTML = '<h3>Selecione uma frase:</h3>';
  
  sentences.forEach((sentence, index) => {
    const sentenceElement = createElement('div', { class: 'sentence', 'data-index': index });
    sentenceElement.innerHTML = marked(sentence);
    sentenceElement.addEventListener('click', () => selectSentence(sentence, index));
    sentencasGeradasDiv.appendChild(sentenceElement);
  });
};

// Função para lidar com a seleção de frases
const selectSentence = (sentence, index) => {
  const sentencaSelecionadaDiv = document.getElementById('sentencaSelecionada');
  sentencaSelecionadaDiv.innerHTML = `
    <h3>Frase selecionada:</h3>
    ${marked(sentence)}
    <button id="usarFrase">Usar esta frase</button>
    <button id="salvarFrase">Salvar esta frase</button>
  `;
  
  document.querySelectorAll('.sentence').forEach(el => el.classList.remove('selected'));
  document.querySelector(`.sentence[data-index="${index}"]`).classList.add('selected');
  
  document.getElementById('usarFrase').addEventListener('click', () => {
    document.getElementById('texto').value = sentence; // Agora usamos a frase com os asteriscos
  });

  document.getElementById('salvarFrase').addEventListener('click', () => {
    saveSentence(sentence); // Salvamos a frase com os asteriscos
    displaySavedSentences();
    alert('Frase salva com sucesso!');
    clearGeneratedSentences(); // Isso já é chamado dentro de saveSentence, mas podemos manter aqui para clareza
  });
};

// Função para processar a palavra
const processarPalavra = async (word) => {
  const resultadoDiv = document.getElementById('resultado');
  const contagemTokensDiv = document.getElementById('contagemTokens');
  const sentencasGeradasDiv = document.getElementById('sentencasGeradas');
  const sentencaSelecionadaDiv = document.getElementById('sentencaSelecionada');

  resultadoDiv.innerHTML = '<p>Carregando...</p>';
  contagemTokensDiv.textContent = '';
  sentencasGeradasDiv.innerHTML = '';
  sentencaSelecionadaDiv.innerHTML = '';

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
    const frasesArray = frases.text.split('\n').filter(sentence => sentence.trim() !== '');

    //resultadoDiv.innerHTML = marked(traducao.text + "\n\n" + definicao.text);
    resultadoDiv.innerHTML = `
      <h3>Tradução:</h3>
      ${marked(traducao.text)}
      <h3>Definição:</h3>
      ${marked(definicao.text)}
    `;
    createSentenceElements(frasesArray);
    displaySavedSentences();
    contagemTokensDiv.textContent = `Total de tokens usados: ${traducao.tokens + frases.tokens + definicao.tokens}`;
  } catch (error) {
    resultadoDiv.innerHTML = `<p class="erro">Não foi possível processar a palavra. Erro: ${error.message}</p>`;
  }
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  const executarBtn = document.getElementById('executar');
  const palavraInput = document.getElementById('palavra');
  displaySavedSentences();
  executarBtn.addEventListener('click', () => processarPalavra(palavraInput.value.trim()));
});
