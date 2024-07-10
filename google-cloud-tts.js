// Configuração da API Google Text-to-Speech
const GOOGLE_TTS_API_CONFIG = {
  URL: 'https://texttospeech.googleapis.com/v1/text:synthesize',
  KEY: 'API_KEY'
};

// Função para fazer chamadas à API
const apiCall = async (url, options) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API respondeu com status ${response.status}: ${errorText}`);
  }
  return response;
};

// Lista pré-definida de vozes em inglês
const ENGLISH_VOICES = [
  { name: 'en-US-Journey-D', gender: 'MALE' },
  { name: 'en-US-Journey-F', gender: 'FEMALE' },
  { name: 'en-US-Journey-O', gender: 'FEMALE' }
];

// Voz predefinida
const DEFAULT_VOICE = 'en-US-Journey-F';

// Função para preencher o select de vozes
const populateVoiceSelect = () => {
  console.log('Preenchendo lista de vozes');
  const voiceSelect = document.getElementById('voiceSelect');
  voiceSelect.innerHTML = '';
  ENGLISH_VOICES.forEach(voice => {
    const option = document.createElement('option');
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.gender})`;
    option.selected = voice.name === DEFAULT_VOICE;
    voiceSelect.appendChild(option);
  });
};

// Função para converter texto para fala
const converterParaFala = async (texto, voiceId) => {
  try {
    const response = await apiCall(`${GOOGLE_TTS_API_CONFIG.URL}?key=${GOOGLE_TTS_API_CONFIG.KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text: texto },
        voice: { languageCode: 'en-US', name: voiceId },
        audioConfig: { audioEncoding: 'MP3' },
      }),
    });
    const data = await response.json();
    const audioContent = data.audioContent;
    const audioBlob = new Blob([Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' });
    return audioBlob;
  } catch (error) {
    console.error('Erro na conversão de texto para fala:', error);
    throw error;
  }
};

// Função para criar URL do áudio
const createAudioUrl = (audioBlob) => {
  return URL.createObjectURL(audioBlob);
};

// Função para download do áudio
const downloadAudio = (audioBlob, filename) => {
  const url = createAudioUrl(audioBlob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  const btnFalar = document.getElementById('btnFalar');
  const textoInput = document.getElementById('texto');
  const audioPlayer = document.getElementById('audioPlayer');
  const voiceSelect = document.getElementById('voiceSelect');
  const btnDownload = document.getElementById('btnDownload');
  
  let currentAudioBlob = null;

  populateVoiceSelect(); // Preenche a lista de vozes ao carregar a página

  btnFalar.addEventListener('click', async () => {
    const texto = textoInput.value.trim();
    const voiceId = voiceSelect.value;
    if (!texto || !voiceId) {
      alert('Por favor, insira um texto e selecione uma voz.');
      return;
    }
    try {
      currentAudioBlob = await converterParaFala(texto, voiceId);
      const audioUrl = createAudioUrl(currentAudioBlob);
      audioPlayer.src = audioUrl;
      audioPlayer.play();
      btnDownload.style.display = 'inline-block';
    } catch (error) {
      alert(`Não foi possível converter o texto para fala. Erro: ${error.message}`);
    }
  });

  btnDownload.addEventListener('click', () => {
    if (currentAudioBlob) {
      downloadAudio(currentAudioBlob, 'audio.mp3');
    } else {
      alert('Nenhum áudio disponível para download.');
    }
  });
});
