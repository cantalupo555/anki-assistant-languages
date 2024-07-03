// Configuração da API ElevenLabs
const ELEVENLABS_API_CONFIG = {
    URL: 'https://api.elevenlabs.io/v1',
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
  
  // Função para carregar vozes
  const carregarVozes = async () => {
    console.log('Iniciando carregamento de vozes');
    const voiceSelect = document.getElementById('voiceSelect');
    try {
      const response = await apiCall(`${ELEVENLABS_API_CONFIG.URL}/voices`, {
        headers: { 'xi-api-key': ELEVENLABS_API_CONFIG.KEY },
      });
      const data = await response.json();
      console.log('Resposta da API ElevenLabs:', data);
      if (!data.voices) {
        throw new Error('Resposta da API não contém vozes');
      }
      voiceSelect.innerHTML = '<option value="">Selecione uma voz</option>';
      data.voices.forEach(voz => {
        const option = document.createElement('option');
        option.value = voz.voice_id;
        option.textContent = voz.name;
        voiceSelect.appendChild(option);
      });
    } catch (error) {
      console.error('Erro ao carregar vozes:', error);
      voiceSelect.innerHTML = '<option value="">Erro ao carregar vozes</option>';
    }
  };
  
// Função para converter texto para fala
const converterParaFala = async (texto, voiceId) => {
    try {
      const response = await apiCall(`${ELEVENLABS_API_CONFIG.URL}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_CONFIG.KEY,
        },
        body: JSON.stringify({
          text: texto,
          model_id: 'eleven_multilingual_v1',
        }),
      });
      const audioBlob = await response.blob();
      return audioBlob; // Retorna o Blob diretamente
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
  
    carregarVozes();
  });
