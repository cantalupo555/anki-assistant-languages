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
    // Google Cloud TTS voices
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
    { name: 'en-US-AvaMultilingualNeural', value: 'en-US-AvaMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-AndrewMultilingualNeural', value: 'en-US-AndrewMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-EmmaMultilingualNeural', value: 'en-US-EmmaMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-BrianMultilingualNeural', value: 'en-US-BrianMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-JennyMultilingualNeural', value: 'en-US-JennyMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-RyanMultilingualNeural', value: 'en-US-RyanMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-AdamMultilingualNeural', value: 'en-US-AdamMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-AlloyTurboMultilingualNeural', value: 'en-US-AlloyTurboMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-AmandaMultilingualNeural', value: 'en-US-AmandaMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-BrandonMultilingualNeural', value: 'en-US-BrandonMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-ChristopherMultilingualNeural', value: 'en-US-ChristopherMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-CoraMultilingualNeural', value: 'en-US-CoraMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-DavisMultilingualNeural', value: 'en-US-DavisMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-DerekMultilingualNeural', value: 'en-US-DerekMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-DustinMultilingualNeural', value: 'en-US-DustinMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-EvelynMultilingualNeural', value: 'en-US-EvelynMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-LewisMultilingualNeural', value: 'en-US-LewisMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-LolaMultilingualNeural', value: 'en-US-LolaMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-NancyMultilingualNeural', value: 'en-US-NancyMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-NovaTurboMultilingualNeural', value: 'en-US-NovaTurboMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-PhoebeMultilingualNeural', value: 'en-US-PhoebeMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-SamuelMultilingualNeural', value: 'en-US-SamuelMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-SerenaMultilingualNeural', value: 'en-US-SerenaMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-SteffanMultilingualNeural', value: 'en-US-SteffanMultilingualNeural', language: 'english', languageCode: 'en-US', ttsService: 'azure' },
    // Add Italian voice options
    { name: 'it-IT-AlessioMultilingualNeural', value: 'it-IT-AlessioMultilingualNeural', language: 'italian', languageCode: 'it-IT', ttsService: 'azure' },
    { name: 'it-IT-IsabellaMultilingualNeural', value: 'it-IT-IsabellaMultilingualNeural', language: 'italian', languageCode: 'it-IT', ttsService: 'azure' },
    { name: 'it-IT-GiuseppeMultilingualNeural', value: 'it-IT-GiuseppeMultilingualNeural', language: 'italian', languageCode: 'it-IT', ttsService: 'azure' },
    { name: 'it-IT-MarcelloMultilingualNeural', value: 'it-IT-MarcelloMultilingualNeural', language: 'italian', languageCode: 'it-IT', ttsService: 'azure' },
    // Add German voice options
    { name: 'de-DE-FlorianMultilingualNeural', value: 'de-DE-FlorianMultilingualNeural', language: 'german', languageCode: 'de-DE', ttsService: 'azure' },
    { name: 'de-DE-SeraphinaMultilingualNeural', value: 'de-DE-SeraphinaMultilingualNeural', language: 'german', languageCode: 'de-DE', ttsService: 'azure' },
    // Add French voice options
    { name: 'fr-FR-RemyMultilingualNeural', value: 'fr-FR-RemyMultilingualNeural', language: 'french', languageCode: 'fr-FR', ttsService: 'azure' },
    { name: 'fr-FR-VivienneMultilingualNeural', value: 'fr-FR-VivienneMultilingualNeural', language: 'french', languageCode: 'fr-FR', ttsService: 'azure' },
    { name: 'fr-FR-LucienMultilingualNeural', value: 'fr-FR-LucienMultilingualNeural', language: 'french', languageCode: 'fr-FR', ttsService: 'azure' },
    // Add Spanish voice options
    { name: 'es-ES-ArabellaMultilingualNeural', value: 'es-ES-ArabellaMultilingualNeural', language: 'spanish', languageCode: 'es-ES', ttsService: 'azure' },
    { name: 'es-ES-IsidoraMultilingualNeural', value: 'es-ES-IsidoraMultilingualNeural', language: 'spanish', languageCode: 'es-ES', ttsService: 'azure' },
    { name: 'es-ES-TristanMultilingualNeural', value: 'es-ES-TristanMultilingualNeural', language: 'spanish', languageCode: 'es-ES', ttsService: 'azure' },
    { name: 'es-ES-XimenaMultilingualNeural', value: 'es-ES-XimenaMultilingualNeural', language: 'spanish', languageCode: 'es-ES', ttsService: 'azure' },
    // Add Portuguese voice options
    { name: 'pt-BR-MacerioMultilingualNeural', value: 'pt-BR-MacerioMultilingualNeural', language: 'portuguese', languageCode: 'pt-BR', ttsService: 'azure' },
    { name: 'pt-BR-ThalitaMultilingualNeural', value: 'pt-BR-ThalitaMultilingualNeural', language: 'portuguese', languageCode: 'pt-BR', ttsService: 'azure' },
    // Add Dutch voice options - No multilingual options available
    { name: 'nl-NL-FennaNeural', value: 'nl-NL-FennaNeural', language: 'dutch', languageCode: 'nl-NL', ttsService: 'azure' },
    { name: 'nl-NL-MaartenNeural', value: 'nl-NL-MaartenNeural', language: 'dutch', languageCode: 'nl-NL', ttsService: 'azure' },
    { name: 'nl-NL-ColetteNeural', value: 'nl-NL-ColetteNeural', language: 'dutch', languageCode: 'nl-NL', ttsService: 'azure' },
    // Add Polish voice options - No multilingual options available
    { name: 'pl-PL-AgnieszkaNeural', value: 'pl-PL-AgnieszkaNeural', language: 'polish', languageCode: 'pl-PL', ttsService: 'azure' },
    { name: 'pl-PL-MarekNeural', value: 'pl-PL-MarekNeural', language: 'polish', languageCode: 'pl-PL', ttsService: 'azure' },
    { name: 'pl-PL-ZofiaNeural', value: 'pl-PL-ZofiaNeural', language: 'polish', languageCode: 'pl-PL', ttsService: 'azure' },
    // Add Russian voice options - No multilingual options available
    { name: 'ru-RU-SvetlanaNeural', value: 'ru-RU-SvetlanaNeural', language: 'russian', languageCode: 'ru-RU', ttsService: 'azure' },
    { name: 'ru-RU-DmitryNeural', value: 'ru-RU-DmitryNeural', language: 'russian', languageCode: 'ru-RU', ttsService: 'azure' },
    { name: 'ru-RU-DariyaNeural', value: 'ru-RU-DariyaNeural', language: 'russian', languageCode: 'ru-RU', ttsService: 'azure' },
    // Add Mandarin voice options
    { name: 'zh-CN-XiaoxiaoMultilingualNeural', value: 'zh-CN-XiaoxiaoMultilingualNeural', language: 'mandarin', languageCode: 'zh-CN', ttsService: 'azure' },
    { name: 'zh-CN-XiaochenMultilingualNeural', value: 'zh-CN-XiaochenMultilingualNeural', language: 'mandarin', languageCode: 'zh-CN', ttsService: 'azure' },
    { name: 'zh-CN-XiaoyuMultilingualNeural', value: 'zh-CN-XiaoyuMultilingualNeural', language: 'mandarin', languageCode: 'zh-CN', ttsService: 'azure' },
    { name: 'zh-CN-YunyiMultilingualNeural', value: 'zh-CN-YunyiMultilingualNeural', language: 'mandarin', languageCode: 'zh-CN', ttsService: 'azure' },
    { name: 'zh-CN-YunfanMultilingualNeural', value: 'zh-CN-YunfanMultilingualNeural', language: 'mandarin', languageCode: 'zh-CN', ttsService: 'azure' },
    { name: 'zh-CN-YunxiaoMultilingualNeural', value: 'zh-CN-YunxiaoMultilingualNeural', language: 'mandarin', languageCode: 'zh-CN', ttsService: 'azure' },
    // Add Japanese voice options
    { name: 'ja-JP-MasaruMultilingualNeural', value: 'ja-JP-MasaruMultilingualNeural', language: 'japanese', languageCode: 'ja-JP', ttsService: 'azure' },
    // Add Korean voice options
    { name: 'ko-KR-HyunsuMultilingualNeural', value: 'ko-KR-HyunsuMultilingualNeural', language: 'korean', languageCode: 'ko-KR', ttsService: 'azure' },
];