// Interface for voice options
export interface VoiceOption {
    name: string;
    value: string;
    language: string;
    languageCode: string;
    ttsService: 'google' | 'azure';
}

// Array of available voice options for TTS
export const voiceOptions: VoiceOption[] = [
    // Add English voice options
    { name: 'en-US-Journey-D', value: 'en-US-Journey-D', language: 'english', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Journey-F', value: 'en-US-Journey-F', language: 'english', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Journey-O', value: 'en-US-Journey-O', language: 'english', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Wavenet-A', value: 'en-US-Wavenet-A', language: 'english', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Wavenet-B', value: 'en-US-Wavenet-B', language: 'english', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Wavenet-C', value: 'en-US-Wavenet-C', language: 'english', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Wavenet-D', value: 'en-US-Wavenet-D', language: 'english', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Wavenet-E', value: 'en-US-Wavenet-E', language: 'english', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Wavenet-F', value: 'en-US-Wavenet-F', language: 'english', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Wavenet-G', value: 'en-US-Wavenet-G', language: 'english', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Wavenet-H', value: 'en-US-Wavenet-H', language: 'english', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Wavenet-I', value: 'en-US-Wavenet-I', language: 'english', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Wavenet-J', value: 'en-US-Wavenet-J', language: 'english', languageCode: 'en-US', ttsService: 'google' },
    // Add Italian voice options
    { name: 'it-IT-Wavenet-A', value: 'it-IT-Wavenet-A', language: 'italian', languageCode: 'it-IT', ttsService: 'google' },
    { name: 'it-IT-Wavenet-B', value: 'it-IT-Wavenet-B', language: 'italian', languageCode: 'it-IT', ttsService: 'google' },
    { name: 'it-IT-Wavenet-C', value: 'it-IT-Wavenet-C', language: 'italian', languageCode: 'it-IT', ttsService: 'google' },
    { name: 'it-IT-Wavenet-D', value: 'it-IT-Wavenet-D', language: 'italian', languageCode: 'it-IT', ttsService: 'google' },
    // Add German voice options
    { name: 'de-DE-Wavenet-A', value: 'de-DE-Wavenet-A', language: 'german', languageCode: 'de-DE', ttsService: 'google' },
    { name: 'de-DE-Wavenet-B', value: 'de-DE-Wavenet-B', language: 'german', languageCode: 'de-DE', ttsService: 'google' },
    { name: 'de-DE-Wavenet-C', value: 'de-DE-Wavenet-C', language: 'german', languageCode: 'de-DE', ttsService: 'google' },
    { name: 'de-DE-Wavenet-D', value: 'de-DE-Wavenet-D', language: 'german', languageCode: 'de-DE', ttsService: 'google' },
    { name: 'de-DE-Wavenet-E', value: 'de-DE-Wavenet-E', language: 'german', languageCode: 'de-DE', ttsService: 'google' },
    { name: 'de-DE-Wavenet-F', value: 'de-DE-Wavenet-F', language: 'german', languageCode: 'de-DE', ttsService: 'google' },
    // Add French voice options
    { name: 'fr-FR-Wavenet-A', value: 'fr-FR-Wavenet-A', language: 'french', languageCode: 'fr-FR', ttsService: 'google' },
    { name: 'fr-FR-Wavenet-B', value: 'fr-FR-Wavenet-B', language: 'french', languageCode: 'fr-FR', ttsService: 'google' },
    { name: 'fr-FR-Wavenet-C', value: 'fr-FR-Wavenet-C', language: 'french', languageCode: 'fr-FR', ttsService: 'google' },
    { name: 'fr-FR-Wavenet-D', value: 'fr-FR-Wavenet-D', language: 'french', languageCode: 'fr-FR', ttsService: 'google' },
    { name: 'fr-FR-Wavenet-E', value: 'fr-FR-Wavenet-E', language: 'french', languageCode: 'fr-FR', ttsService: 'google' },
    { name: 'fr-FR-Wavenet-F', value: 'fr-FR-Wavenet-F', language: 'french', languageCode: 'fr-FR', ttsService: 'google' },
    { name: 'fr-FR-Wavenet-G', value: 'fr-FR-Wavenet-G', language: 'french', languageCode: 'fr-FR', ttsService: 'google' },
    // Add Spanish voice options
    { name: 'es-ES-Wavenet-B', value: 'es-ES-Wavenet-B', language: 'spanish', languageCode: 'es-ES', ttsService: 'google' },
    { name: 'es-ES-Wavenet-C', value: 'es-ES-Wavenet-C', language: 'spanish', languageCode: 'es-ES', ttsService: 'google' },
    { name: 'es-ES-Wavenet-D', value: 'es-ES-Wavenet-D', language: 'spanish', languageCode: 'es-ES', ttsService: 'google' },
    // Add Portuguese voice options
    { name: 'pt-BR-Wavenet-A', value: 'pt-BR-Wavenet-A', language: 'portuguese', languageCode: 'pt-BR', ttsService: 'google' },
    { name: 'pt-BR-Wavenet-B', value: 'pt-BR-Wavenet-B', language: 'portuguese', languageCode: 'pt-BR', ttsService: 'google' },
    { name: 'pt-BR-Wavenet-C', value: 'pt-BR-Wavenet-C', language: 'portuguese', languageCode: 'pt-BR', ttsService: 'google' },
    { name: 'pt-BR-Wavenet-D', value: 'pt-BR-Wavenet-D', language: 'portuguese', languageCode: 'pt-BR', ttsService: 'google' },
    { name: 'pt-BR-Wavenet-E', value: 'pt-BR-Wavenet-E', language: 'portuguese', languageCode: 'pt-BR', ttsService: 'google' },
    // Add Dutch voice options
    { name: 'nl-NL-Wavenet-A', value: 'nl-NL-Wavenet-A', language: 'dutch', languageCode: 'nl-NL', ttsService: 'google' },
    { name: 'nl-NL-Wavenet-B', value: 'nl-NL-Wavenet-B', language: 'dutch', languageCode: 'nl-NL', ttsService: 'google' },
    { name: 'nl-NL-Wavenet-C', value: 'nl-NL-Wavenet-C', language: 'dutch', languageCode: 'nl-NL', ttsService: 'google' },
    { name: 'nl-NL-Wavenet-D', value: 'nl-NL-Wavenet-D', language: 'dutch', languageCode: 'nl-NL', ttsService: 'google' },
    { name: 'nl-NL-Wavenet-E', value: 'nl-NL-Wavenet-E', language: 'dutch', languageCode: 'nl-NL', ttsService: 'google' },
    // Add Polish voice options
    { name: 'pl-PL-Wavenet-A', value: 'pl-PL-Wavenet-A', language: 'polish', languageCode: 'pl-PL', ttsService: 'google' },
    { name: 'pl-PL-Wavenet-B', value: 'pl-PL-Wavenet-B', language: 'polish', languageCode: 'pl-PL', ttsService: 'google' },
    { name: 'pl-PL-Wavenet-C', value: 'pl-PL-Wavenet-C', language: 'polish', languageCode: 'pl-PL', ttsService: 'google' },
    { name: 'pl-PL-Wavenet-D', value: 'pl-PL-Wavenet-D', language: 'polish', languageCode: 'pl-PL', ttsService: 'google' },
    { name: 'pl-PL-Wavenet-E', value: 'pl-PL-Wavenet-E', language: 'polish', languageCode: 'pl-PL', ttsService: 'google' },
    // Add Russian voice options
    { name: 'ru-RU-Wavenet-A', value: 'ru-RU-Wavenet-A', language: 'russian', languageCode: 'ru-RU', ttsService: 'google' },
    { name: 'ru-RU-Wavenet-B', value: 'ru-RU-Wavenet-B', language: 'russian', languageCode: 'ru-RU', ttsService: 'google' },
    { name: 'ru-RU-Wavenet-C', value: 'ru-RU-Wavenet-C', language: 'russian', languageCode: 'ru-RU', ttsService: 'google' },
    { name: 'ru-RU-Wavenet-D', value: 'ru-RU-Wavenet-D', language: 'russian', languageCode: 'ru-RU', ttsService: 'google' },
    { name: 'ru-RU-Wavenet-E', value: 'ru-RU-Wavenet-E', language: 'russian', languageCode: 'ru-RU', ttsService: 'google' },
    // Add Mandarin voice options
    { name: 'cmn-CN-Wavenet-A', value: 'cmn-CN-Wavenet-A', language: 'mandarin', languageCode: 'cmn-CN', ttsService: 'google' },
    { name: 'cmn-CN-Wavenet-B', value: 'cmn-CN-Wavenet-B', language: 'mandarin', languageCode: 'cmn-CN', ttsService: 'google' },
    { name: 'cmn-CN-Wavenet-C', value: 'cmn-CN-Wavenet-C', language: 'mandarin', languageCode: 'cmn-CN', ttsService: 'google' },
    { name: 'cmn-CN-Wavenet-D', value: 'cmn-CN-Wavenet-D', language: 'mandarin', languageCode: 'cmn-CN', ttsService: 'google' },
    // Add Japanese voice options
    { name: 'ja-JP-Wavenet-A', value: 'ja-JP-Wavenet-A', language: 'japanese', languageCode: 'ja-JP', ttsService: 'google' },
    { name: 'ja-JP-Wavenet-B', value: 'ja-JP-Wavenet-B', language: 'japanese', languageCode: 'ja-JP', ttsService: 'google' },
    { name: 'ja-JP-Wavenet-C', value: 'ja-JP-Wavenet-C', language: 'japanese', languageCode: 'ja-JP', ttsService: 'google' },
    { name: 'ja-JP-Wavenet-D', value: 'ja-JP-Wavenet-D', language: 'japanese', languageCode: 'ja-JP', ttsService: 'google' },
    // Add Korean voice options
    { name: 'ko-KR-Wavenet-A', value: 'ko-KR-Wavenet-A', language: 'korean', languageCode: 'ko-KR', ttsService: 'google' },
    { name: 'ko-KR-Wavenet-B', value: 'ko-KR-Wavenet-B', language: 'korean', languageCode: 'ko-KR', ttsService: 'google' },
    { name: 'ko-KR-Wavenet-C', value: 'ko-KR-Wavenet-C', language: 'korean', languageCode: 'ko-KR', ttsService: 'google' },
    { name: 'ko-KR-Wavenet-D', value: 'ko-KR-Wavenet-D', language: 'korean', languageCode: 'ko-KR', ttsService: 'google' },

    // Azure TTS voices
    // Add English voice options
    { name: 'en-US-BrianNeural', value: 'en-US-BrianNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-JennyNeural', value: 'en-US-JennyNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    // Add Italian voice options
    { name: 'it-IT-DiegoNeural', value: 'it-IT-DiegoNeural', language: 'italian', languageCode: 'it-IT', ttsService: 'azure' },
    { name: 'it-IT-ElsaNeural', value: 'it-IT-ElsaNeural', language: 'italian', languageCode: 'it-IT', ttsService: 'azure' },
    // Add German voice options
    { name: 'de-DE-KatjaNeural', value: 'de-DE-KatjaNeural', language: 'german', languageCode: 'de-DE', ttsService: 'azure' },
    { name: 'de-DE-ConradNeural', value: 'de-DE-ConradNeural', language: 'german', languageCode: 'de-DE', ttsService: 'azure' },
    // Add French voice options
    { name: 'fr-FR-DeniseNeural', value: 'fr-FR-DeniseNeural', language: 'french', languageCode: 'fr-FR', ttsService: 'azure' },
    { name: 'fr-FR-HenriNeural', value: 'fr-FR-HenriNeural', language: 'french', languageCode: 'fr-FR', ttsService: 'azure' },
    // Add Spanish voice options
    { name: 'es-ES-ElviraNeural', value: 'es-ES-ElviraNeural', language: 'spanish', languageCode: 'es-ES', ttsService: 'azure' },
    { name: 'es-ES-AlvaroNeural', value: 'es-ES-AlvaroNeural', language: 'spanish', languageCode: 'es-ES', ttsService: 'azure' },
    // Add Portuguese voice options
    { name: 'pt-BR-FranciscaNeural', value: 'pt-BR-FranciscaNeural', language: 'portuguese', languageCode: 'pt-BR', ttsService: 'azure' },
    { name: 'pt-BR-AntonioNeural', value: 'pt-BR-AntonioNeural', language: 'portuguese', languageCode: 'pt-BR', ttsService: 'azure' },
    // Add Dutch voice options
    { name: 'nl-NL-ColetteNeural', value: 'nl-NL-ColetteNeural', language: 'dutch', languageCode: 'nl-NL', ttsService: 'azure' },
    { name: 'nl-NL-MaartenNeural', value: 'nl-NL-MaartenNeural', language: 'dutch', languageCode: 'nl-NL', ttsService: 'azure' },
    // Add Polish voice options
    { name: 'pl-PL-AgnieszkaNeural', value: 'pl-PL-AgnieszkaNeural', language: 'polish', languageCode: 'pl-PL', ttsService: 'azure' },
    { name: 'pl-PL-MarekNeural', value: 'pl-PL-MarekNeural', language: 'polish', languageCode: 'pl-PL', ttsService: 'azure' },
    // Add Russian voice options
    { name: 'ru-RU-SvetlanaNeural', value: 'ru-RU-SvetlanaNeural', language: 'russian', languageCode: 'ru-RU', ttsService: 'azure' },
    { name: 'ru-RU-DmitryNeural', value: 'ru-RU-DmitryNeural', language: 'russian', languageCode: 'ru-RU', ttsService: 'azure' },
    // Add Mandarin voice options
    { name: 'zh-CN-XiaoxiaoNeural', value: 'zh-CN-XiaoxiaoNeural', language: 'mandarin', languageCode: 'zh-CN', ttsService: 'azure' },
    { name: 'zh-CN-YunxiNeural', value: 'zh-CN-YunxiNeural', language: 'mandarin', languageCode: 'zh-CN', ttsService: 'azure' },
    // Add Japanese voice options
    { name: 'ja-JP-NanamiNeural', value: 'ja-JP-NanamiNeural', language: 'japanese', languageCode: 'ja-JP', ttsService: 'azure' },
    { name: 'ja-JP-KeitaNeural', value: 'ja-JP-KeitaNeural', language: 'japanese', languageCode: 'ja-JP', ttsService: 'azure' },
    // Add Korean voice options
    { name: 'ko-KR-SunHiNeural', value: 'ko-KR-SunHiNeural', language: 'korean', languageCode: 'ko-KR', ttsService: 'azure' },
    { name: 'ko-KR-InJoonNeural', value: 'ko-KR-InJoonNeural', language: 'korean', languageCode: 'ko-KR', ttsService: 'azure' },
];
