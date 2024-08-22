// Interface for voice options
export interface VoiceOption {
    name: string;
    value: string;
    language: string;
    languageCode: string;
}

// Array of available voice options for TTS
export const voiceOptions: VoiceOption[] = [
    // Add English voice options
    { name: 'en-US-Journey-D', value: 'en-US-Journey-D', language: 'english', languageCode: 'en-US' },
    { name: 'en-US-Journey-F', value: 'en-US-Journey-F', language: 'english', languageCode: 'en-US' },
    { name: 'en-US-Journey-O', value: 'en-US-Journey-O', language: 'english', languageCode: 'en-US' },
    { name: 'en-US-Wavenet-A', value: 'en-US-Wavenet-A', language: 'english', languageCode: 'en-US' },
    { name: 'en-US-Wavenet-B', value: 'en-US-Wavenet-B', language: 'english', languageCode: 'en-US' },
    { name: 'en-US-Wavenet-C', value: 'en-US-Wavenet-C', language: 'english', languageCode: 'en-US' },
    { name: 'en-US-Wavenet-D', value: 'en-US-Wavenet-D', language: 'english', languageCode: 'en-US' },
    { name: 'en-US-Wavenet-E', value: 'en-US-Wavenet-E', language: 'english', languageCode: 'en-US' },
    { name: 'en-US-Wavenet-F', value: 'en-US-Wavenet-F', language: 'english', languageCode: 'en-US' },
    { name: 'en-US-Wavenet-G', value: 'en-US-Wavenet-G', language: 'english', languageCode: 'en-US' },
    { name: 'en-US-Wavenet-H', value: 'en-US-Wavenet-H', language: 'english', languageCode: 'en-US' },
    { name: 'en-US-Wavenet-I', value: 'en-US-Wavenet-I', language: 'english', languageCode: 'en-US' },
    { name: 'en-US-Wavenet-J', value: 'en-US-Wavenet-J', language: 'english', languageCode: 'en-US' },
    // Add Italian voice options
    { name: 'it-IT-Wavenet-A', value: 'it-IT-Wavenet-A', language: 'italian', languageCode: 'it-IT' },
    { name: 'it-IT-Wavenet-B', value: 'it-IT-Wavenet-B', language: 'italian', languageCode: 'it-IT' },
    { name: 'it-IT-Wavenet-C', value: 'it-IT-Wavenet-C', language: 'italian', languageCode: 'it-IT' },
    { name: 'it-IT-Wavenet-D', value: 'it-IT-Wavenet-D', language: 'italian', languageCode: 'it-IT' },
    // Add German voice options
    { name: 'de-DE-Wavenet-A', value: 'de-DE-Wavenet-A', language: 'german', languageCode: 'de-DE' },
    { name: 'de-DE-Wavenet-B', value: 'de-DE-Wavenet-B', language: 'german', languageCode: 'de-DE' },
    { name: 'de-DE-Wavenet-C', value: 'de-DE-Wavenet-C', language: 'german', languageCode: 'de-DE' },
    { name: 'de-DE-Wavenet-D', value: 'de-DE-Wavenet-D', language: 'german', languageCode: 'de-DE' },
    { name: 'de-DE-Wavenet-E', value: 'de-DE-Wavenet-E', language: 'german', languageCode: 'de-DE' },
    { name: 'de-DE-Wavenet-F', value: 'de-DE-Wavenet-F', language: 'german', languageCode: 'de-DE' },
    // Add French voice options
    { name: 'fr-FR-Wavenet-A', value: 'fr-FR-Wavenet-A', language: 'french', languageCode: 'fr-FR' },
    { name: 'fr-FR-Wavenet-B', value: 'fr-FR-Wavenet-B', language: 'french', languageCode: 'fr-FR' },
    { name: 'fr-FR-Wavenet-C', value: 'fr-FR-Wavenet-C', language: 'french', languageCode: 'fr-FR' },
    { name: 'fr-FR-Wavenet-D', value: 'fr-FR-Wavenet-D', language: 'french', languageCode: 'fr-FR' },
    { name: 'fr-FR-Wavenet-E', value: 'fr-FR-Wavenet-E', language: 'french', languageCode: 'fr-FR' },
    { name: 'fr-FR-Wavenet-F', value: 'fr-FR-Wavenet-F', language: 'french', languageCode: 'fr-FR' },
    { name: 'fr-FR-Wavenet-G', value: 'fr-FR-Wavenet-G', language: 'french', languageCode: 'fr-FR' },
    // Add Spanish voice options
    { name: 'es-ES-Wavenet-B', value: 'es-ES-Wavenet-B', language: 'spanish', languageCode: 'es-ES' },
    { name: 'es-ES-Wavenet-C', value: 'es-ES-Wavenet-C', language: 'spanish', languageCode: 'es-ES' },
    { name: 'es-ES-Wavenet-D', value: 'es-ES-Wavenet-D', language: 'spanish', languageCode: 'es-ES' },
    // Add Portuguese voice options
    { name: 'pt-BR-Wavenet-A', value: 'pt-BR-Wavenet-A', language: 'portuguese', languageCode: 'pt-BR' },
    { name: 'pt-BR-Wavenet-B', value: 'pt-BR-Wavenet-B', language: 'portuguese', languageCode: 'pt-BR' },
    { name: 'pt-BR-Wavenet-C', value: 'pt-BR-Wavenet-C', language: 'portuguese', languageCode: 'pt-BR' },
    { name: 'pt-BR-Wavenet-D', value: 'pt-BR-Wavenet-D', language: 'portuguese', languageCode: 'pt-BR' },
    { name: 'pt-BR-Wavenet-E', value: 'pt-BR-Wavenet-E', language: 'portuguese', languageCode: 'pt-BR' },
    // Add Dutch voice options
    { name: 'nl-NL-Wavenet-A', value: 'nl-NL-Wavenet-A', language: 'dutch', languageCode: 'nl-NL' },
    { name: 'nl-NL-Wavenet-B', value: 'nl-NL-Wavenet-B', language: 'dutch', languageCode: 'nl-NL' },
    { name: 'nl-NL-Wavenet-C', value: 'nl-NL-Wavenet-C', language: 'dutch', languageCode: 'nl-NL' },
    { name: 'nl-NL-Wavenet-D', value: 'nl-NL-Wavenet-D', language: 'dutch', languageCode: 'nl-NL' },
    { name: 'nl-NL-Wavenet-E', value: 'nl-NL-Wavenet-E', language: 'dutch', languageCode: 'nl-NL' },
    // Add Polish voice options
    { name: 'pl-PL-Wavenet-A', value: 'pl-PL-Wavenet-A', language: 'polish', languageCode: 'pl-PL' },
    { name: 'pl-PL-Wavenet-B', value: 'pl-PL-Wavenet-B', language: 'polish', languageCode: 'pl-PL' },
    { name: 'pl-PL-Wavenet-C', value: 'pl-PL-Wavenet-C', language: 'polish', languageCode: 'pl-PL' },
    { name: 'pl-PL-Wavenet-D', value: 'pl-PL-Wavenet-D', language: 'polish', languageCode: 'pl-PL' },
    { name: 'pl-PL-Wavenet-E', value: 'pl-PL-Wavenet-E', language: 'polish', languageCode: 'pl-PL' },
    // Add Russian voice options
    { name: 'ru-RU-Wavenet-A', value: 'ru-RU-Wavenet-A', language: 'russian', languageCode: 'ru-RU' },
    { name: 'ru-RU-Wavenet-B', value: 'ru-RU-Wavenet-B', language: 'russian', languageCode: 'ru-RU' },
    { name: 'ru-RU-Wavenet-C', value: 'ru-RU-Wavenet-C', language: 'russian', languageCode: 'ru-RU' },
    { name: 'ru-RU-Wavenet-D', value: 'ru-RU-Wavenet-D', language: 'russian', languageCode: 'ru-RU' },
    { name: 'ru-RU-Wavenet-E', value: 'ru-RU-Wavenet-E', language: 'russian', languageCode: 'ru-RU' },
    // Add Mandarin voice options
    { name: 'cmn-CN-Wavenet-A', value: 'cmn-CN-Wavenet-A', language: 'mandarin', languageCode: 'cmn-CN' },
    { name: 'cmn-CN-Wavenet-B', value: 'cmn-CN-Wavenet-B', language: 'mandarin', languageCode: 'cmn-CN' },
    { name: 'cmn-CN-Wavenet-C', value: 'cmn-CN-Wavenet-C', language: 'mandarin', languageCode: 'cmn-CN' },
    { name: 'cmn-CN-Wavenet-D', value: 'cmn-CN-Wavenet-D', language: 'mandarin', languageCode: 'cmn-CN' },
    // Add Japanese voice options
    { name: 'ja-JP-Wavenet-A', value: 'ja-JP-Wavenet-A', language: 'japanese', languageCode: 'ja-JP' },
    { name: 'ja-JP-Wavenet-B', value: 'ja-JP-Wavenet-B', language: 'japanese', languageCode: 'ja-JP' },
    { name: 'ja-JP-Wavenet-C', value: 'ja-JP-Wavenet-C', language: 'japanese', languageCode: 'ja-JP' },
    { name: 'ja-JP-Wavenet-D', value: 'ja-JP-Wavenet-D', language: 'japanese', languageCode: 'ja-JP' },
    // Add Korean voice options
    { name: 'ko-KR-Wavenet-A', value: 'ko-KR-Wavenet-A', language: 'korean', languageCode: 'ko-KR' },
    { name: 'ko-KR-Wavenet-B', value: 'ko-KR-Wavenet-B', language: 'korean', languageCode: 'ko-KR' },
    { name: 'ko-KR-Wavenet-C', value: 'ko-KR-Wavenet-C', language: 'korean', languageCode: 'ko-KR' },
    { name: 'ko-KR-Wavenet-D', value: 'ko-KR-Wavenet-D', language: 'korean', languageCode: 'ko-KR' },
];
