// Import types - Same consideration about type location as in aiOptions.ts
import { TTSOption, VoiceOption } from '../../frontend/src/utils/Types';

/**
 * @description Array of available Text-to-Speech (TTS) service options.
 * Each object contains the display name and the internal value used for identification.
 * @type {TTSOption[]}
 */
export const ttsOptions: TTSOption[] = [
  { name: 'Google TTS', value: 'google' },
  { name: 'Azure TTS', value: 'azure' },
];

/**
 * @description Array of available voice options for TTS, categorized by service and language.
 * Each object contains the voice name, internal value, full language name, language code,
 * and the TTS service it belongs to.
 * @type {VoiceOption[]}
 */
export const voiceOptions: VoiceOption[] = [
    // Google Cloud TTS voices
    // English (United States)
    { name: 'en-US-Journey-D', value: 'en-US-Journey-D', language: 'English (United States)', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Journey-F', value: 'en-US-Journey-F', language: 'English (United States)', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Journey-O', value: 'en-US-Journey-O', language: 'English (United States)', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Wavenet-A', value: 'en-US-Wavenet-A', language: 'English (United States)', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Wavenet-B', value: 'en-US-Wavenet-B', language: 'English (United States)', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Wavenet-C', value: 'en-US-Wavenet-C', language: 'English (United States)', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Wavenet-D', value: 'en-US-Wavenet-D', language: 'English (United States)', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Wavenet-E', value: 'en-US-Wavenet-E', language: 'English (United States)', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Wavenet-F', value: 'en-US-Wavenet-F', language: 'English (United States)', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Wavenet-G', value: 'en-US-Wavenet-G', language: 'English (United States)', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Wavenet-H', value: 'en-US-Wavenet-H', language: 'English (United States)', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Wavenet-I', value: 'en-US-Wavenet-I', language: 'English (United States)', languageCode: 'en-US', ttsService: 'google' },
    { name: 'en-US-Wavenet-J', value: 'en-US-Wavenet-J', language: 'English (United States)', languageCode: 'en-US', ttsService: 'google' },
    // Italian (Italy)
    { name: 'it-IT-Wavenet-A', value: 'it-IT-Wavenet-A', language: 'Italian (Italy)', languageCode: 'it-IT', ttsService: 'google' },
    { name: 'it-IT-Wavenet-B', value: 'it-IT-Wavenet-B', language: 'Italian (Italy)', languageCode: 'it-IT', ttsService: 'google' },
    { name: 'it-IT-Wavenet-C', value: 'it-IT-Wavenet-C', language: 'Italian (Italy)', languageCode: 'it-IT', ttsService: 'google' },
    { name: 'it-IT-Wavenet-D', value: 'it-IT-Wavenet-D', language: 'Italian (Italy)', languageCode: 'it-IT', ttsService: 'google' },
    // German (Germany)
    { name: 'de-DE-Wavenet-A', value: 'de-DE-Wavenet-A', language: 'German (Germany)', languageCode: 'de-DE', ttsService: 'google' },
    { name: 'de-DE-Wavenet-B', value: 'de-DE-Wavenet-B', language: 'German (Germany)', languageCode: 'de-DE', ttsService: 'google' },
    { name: 'de-DE-Wavenet-C', value: 'de-DE-Wavenet-C', language: 'German (Germany)', languageCode: 'de-DE', ttsService: 'google' },
    { name: 'de-DE-Wavenet-D', value: 'de-DE-Wavenet-D', language: 'German (Germany)', languageCode: 'de-DE', ttsService: 'google' },
    { name: 'de-DE-Wavenet-E', value: 'de-DE-Wavenet-E', language: 'German (Germany)', languageCode: 'de-DE', ttsService: 'google' },
    { name: 'de-DE-Wavenet-F', value: 'de-DE-Wavenet-F', language: 'German (Germany)', languageCode: 'de-DE', ttsService: 'google' },
    // French (France)
    { name: 'fr-FR-Wavenet-A', value: 'fr-FR-Wavenet-A', language: 'French (France)', languageCode: 'fr-FR', ttsService: 'google' },
    { name: 'fr-FR-Wavenet-B', value: 'fr-FR-Wavenet-B', language: 'French (France)', languageCode: 'fr-FR', ttsService: 'google' },
    { name: 'fr-FR-Wavenet-C', value: 'fr-FR-Wavenet-C', language: 'French (France)', languageCode: 'fr-FR', ttsService: 'google' },
    { name: 'fr-FR-Wavenet-D', value: 'fr-FR-Wavenet-D', language: 'French (France)', languageCode: 'fr-FR', ttsService: 'google' },
    { name: 'fr-FR-Wavenet-E', value: 'fr-FR-Wavenet-E', language: 'French (France)', languageCode: 'fr-FR', ttsService: 'google' },
    { name: 'fr-FR-Wavenet-F', value: 'fr-FR-Wavenet-F', language: 'French (France)', languageCode: 'fr-FR', ttsService: 'google' },
    { name: 'fr-FR-Wavenet-G', value: 'fr-FR-Wavenet-G', language: 'French (France)', languageCode: 'fr-FR', ttsService: 'google' },
    // Spanish (Spain)
    { name: 'es-ES-Wavenet-B', value: 'es-ES-Wavenet-B', language: 'Spanish (Spain)', languageCode: 'es-ES', ttsService: 'google' },
    { name: 'es-ES-Wavenet-C', value: 'es-ES-Wavenet-C', language: 'Spanish (Spain)', languageCode: 'es-ES', ttsService: 'google' },
    { name: 'es-ES-Wavenet-D', value: 'es-ES-Wavenet-D', language: 'Spanish (Spain)', languageCode: 'es-ES', ttsService: 'google' },
    // Portuguese (Brazil)
    { name: 'pt-BR-Wavenet-A', value: 'pt-BR-Wavenet-A', language: 'Portuguese (Brazil)', languageCode: 'pt-BR', ttsService: 'google' },
    { name: 'pt-BR-Wavenet-B', value: 'pt-BR-Wavenet-B', language: 'Portuguese (Brazil)', languageCode: 'pt-BR', ttsService: 'google' },
    { name: 'pt-BR-Wavenet-C', value: 'pt-BR-Wavenet-C', language: 'Portuguese (Brazil)', languageCode: 'pt-BR', ttsService: 'google' },
    { name: 'pt-BR-Wavenet-D', value: 'pt-BR-Wavenet-D', language: 'Portuguese (Brazil)', languageCode: 'pt-BR', ttsService: 'google' },
    { name: 'pt-BR-Wavenet-E', value: 'pt-BR-Wavenet-E', language: 'Portuguese (Brazil)', languageCode: 'pt-BR', ttsService: 'google' },
    // Dutch (Netherlands)
    { name: 'nl-NL-Wavenet-A', value: 'nl-NL-Wavenet-A', language: 'Dutch (Netherlands)', languageCode: 'nl-NL', ttsService: 'google' },
    { name: 'nl-NL-Wavenet-B', value: 'nl-NL-Wavenet-B', language: 'Dutch (Netherlands)', languageCode: 'nl-NL', ttsService: 'google' },
    { name: 'nl-NL-Wavenet-C', value: 'nl-NL-Wavenet-C', language: 'Dutch (Netherlands)', languageCode: 'nl-NL', ttsService: 'google' },
    { name: 'nl-NL-Wavenet-D', value: 'nl-NL-Wavenet-D', language: 'Dutch (Netherlands)', languageCode: 'nl-NL', ttsService: 'google' },
    { name: 'nl-NL-Wavenet-E', value: 'nl-NL-Wavenet-E', language: 'Dutch (Netherlands)', languageCode: 'nl-NL', ttsService: 'google' },
    // Polish (Poland)
    { name: 'pl-PL-Wavenet-A', value: 'pl-PL-Wavenet-A', language: 'Polish (Poland)', languageCode: 'pl-PL', ttsService: 'google' },
    { name: 'pl-PL-Wavenet-B', value: 'pl-PL-Wavenet-B', language: 'Polish (Poland)', languageCode: 'pl-PL', ttsService: 'google' },
    { name: 'pl-PL-Wavenet-C', value: 'pl-PL-Wavenet-C', language: 'Polish (Poland)', languageCode: 'pl-PL', ttsService: 'google' },
    { name: 'pl-PL-Wavenet-D', value: 'pl-PL-Wavenet-D', language: 'Polish (Poland)', languageCode: 'pl-PL', ttsService: 'google' },
    { name: 'pl-PL-Wavenet-E', value: 'pl-PL-Wavenet-E', language: 'Polish (Poland)', languageCode: 'pl-PL', ttsService: 'google' },
    // Russian (Russia)
    { name: 'ru-RU-Wavenet-A', value: 'ru-RU-Wavenet-A', language: 'Russian (Russia)', languageCode: 'ru-RU', ttsService: 'google' },
    { name: 'ru-RU-Wavenet-B', value: 'ru-RU-Wavenet-B', language: 'Russian (Russia)', languageCode: 'ru-RU', ttsService: 'google' },
    { name: 'ru-RU-Wavenet-C', value: 'ru-RU-Wavenet-C', language: 'Russian (Russia)', languageCode: 'ru-RU', ttsService: 'google' },
    { name: 'ru-RU-Wavenet-D', value: 'ru-RU-Wavenet-D', language: 'Russian (Russia)', languageCode: 'ru-RU', ttsService: 'google' },
    { name: 'ru-RU-Wavenet-E', value: 'ru-RU-Wavenet-E', language: 'Russian (Russia)', languageCode: 'ru-RU', ttsService: 'google' },
    // Mandarin (China)
    { name: 'cmn-CN-Wavenet-A', value: 'cmn-CN-Wavenet-A', language: 'Mandarin (China)', languageCode: 'cmn-CN', ttsService: 'google' },
    { name: 'cmn-CN-Wavenet-B', value: 'cmn-CN-Wavenet-B', language: 'Mandarin (China)', languageCode: 'cmn-CN', ttsService: 'google' },
    { name: 'cmn-CN-Wavenet-C', value: 'cmn-CN-Wavenet-C', language: 'Mandarin (China)', languageCode: 'cmn-CN', ttsService: 'google' },
    { name: 'cmn-CN-Wavenet-D', value: 'cmn-CN-Wavenet-D', language: 'Mandarin (China)', languageCode: 'cmn-CN', ttsService: 'google' },
    // Japanese (Japan)
    { name: 'ja-JP-Wavenet-A', value: 'ja-JP-Wavenet-A', language: 'Japanese (Japan)', languageCode: 'ja-JP', ttsService: 'google' },
    { name: 'ja-JP-Wavenet-B', value: 'ja-JP-Wavenet-B', language: 'Japanese (Japan)', languageCode: 'ja-JP', ttsService: 'google' },
    { name: 'ja-JP-Wavenet-C', value: 'ja-JP-Wavenet-C', language: 'Japanese (Japan)', languageCode: 'ja-JP', ttsService: 'google' },
    { name: 'ja-JP-Wavenet-D', value: 'ja-JP-Wavenet-D', language: 'Japanese (Japan)', languageCode: 'ja-JP', ttsService: 'google' },
    // Korean (Korea)
    { name: 'ko-KR-Wavenet-A', value: 'ko-KR-Wavenet-A', language: 'Korean (Korea)', languageCode: 'ko-KR', ttsService: 'google' },
    { name: 'ko-KR-Wavenet-B', value: 'ko-KR-Wavenet-B', language: 'Korean (Korea)', languageCode: 'ko-KR', ttsService: 'google' },
    { name: 'ko-KR-Wavenet-C', value: 'ko-KR-Wavenet-C', language: 'Korean (Korea)', languageCode: 'ko-KR', ttsService: 'google' },
    { name: 'ko-KR-Wavenet-D', value: 'ko-KR-Wavenet-D', language: 'Korean (Korea)', languageCode: 'ko-KR', ttsService: 'google' },

    // Azure TTS voices
    // English (United States)
    { name: 'en-US-AvaMultilingualNeural', value: 'en-US-AvaMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-AndrewMultilingualNeural', value: 'en-US-AndrewMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-EmmaMultilingualNeural', value: 'en-US-EmmaMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-BrianMultilingualNeural', value: 'en-US-BrianMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-JennyMultilingualNeural', value: 'en-US-JennyMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-RyanMultilingualNeural', value: 'en-US-RyanMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-AdamMultilingualNeural', value: 'en-US-AdamMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-AlloyTurboMultilingualNeural', value: 'en-US-AlloyTurboMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-AmandaMultilingualNeural', value: 'en-US-AmandaMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-BrandonMultilingualNeural', value: 'en-US-BrandonMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-ChristopherMultilingualNeural', value: 'en-US-ChristopherMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-CoraMultilingualNeural', value: 'en-US-CoraMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-DavisMultilingualNeural', value: 'en-US-DavisMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-DerekMultilingualNeural', value: 'en-US-DerekMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-DustinMultilingualNeural', value: 'en-US-DustinMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-EvelynMultilingualNeural', value: 'en-US-EvelynMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-LewisMultilingualNeural', value: 'en-US-LewisMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-LolaMultilingualNeural', value: 'en-US-LolaMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-NancyMultilingualNeural', value: 'en-US-NancyMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-NovaTurboMultilingualNeural', value: 'en-US-NovaTurboMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-PhoebeMultilingualNeural', value: 'en-US-PhoebeMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-SamuelMultilingualNeural', value: 'en-US-SamuelMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-SerenaMultilingualNeural', value: 'en-US-SerenaMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    { name: 'en-US-SteffanMultilingualNeural', value: 'en-US-SteffanMultilingualNeural', language: 'English (United States)', languageCode: 'en-US', ttsService: 'azure' },
    // Italian (Italy)
    { name: 'it-IT-AlessioMultilingualNeural', value: 'it-IT-AlessioMultilingualNeural', language: 'Italian (Italy)', languageCode: 'it-IT', ttsService: 'azure' },
    { name: 'it-IT-IsabellaMultilingualNeural', value: 'it-IT-IsabellaMultilingualNeural', language: 'Italian (Italy)', languageCode: 'it-IT', ttsService: 'azure' },
    { name: 'it-IT-GiuseppeMultilingualNeural', value: 'it-IT-GiuseppeMultilingualNeural', language: 'Italian (Italy)', languageCode: 'it-IT', ttsService: 'azure' },
    { name: 'it-IT-MarcelloMultilingualNeural', value: 'it-IT-MarcelloMultilingualNeural', language: 'Italian (Italy)', languageCode: 'it-IT', ttsService: 'azure' },
    // German (Germany)
    { name: 'de-DE-FlorianMultilingualNeural', value: 'de-DE-FlorianMultilingualNeural', language: 'German (Germany)', languageCode: 'de-DE', ttsService: 'azure' },
    { name: 'de-DE-SeraphinaMultilingualNeural', value: 'de-DE-SeraphinaMultilingualNeural', language: 'German (Germany)', languageCode: 'de-DE', ttsService: 'azure' },
    // French (France)
    { name: 'fr-FR-RemyMultilingualNeural', value: 'fr-FR-RemyMultilingualNeural', language: 'French (France)', languageCode: 'fr-FR', ttsService: 'azure' },
    { name: 'fr-FR-VivienneMultilingualNeural', value: 'fr-FR-VivienneMultilingualNeural', language: 'French (France)', languageCode: 'fr-FR', ttsService: 'azure' },
    { name: 'fr-FR-LucienMultilingualNeural', value: 'fr-FR-LucienMultilingualNeural', language: 'French (France)', languageCode: 'fr-FR', ttsService: 'azure' },
    // Spanish (Spain)
    { name: 'es-ES-ArabellaMultilingualNeural', value: 'es-ES-ArabellaMultilingualNeural', language: 'Spanish (Spain)', languageCode: 'es-ES', ttsService: 'azure' },
    { name: 'es-ES-IsidoraMultilingualNeural', value: 'es-ES-IsidoraMultilingualNeural', language: 'Spanish (Spain)', languageCode: 'es-ES', ttsService: 'azure' },
    { name: 'es-ES-TristanMultilingualNeural', value: 'es-ES-TristanMultilingualNeural', language: 'Spanish (Spain)', languageCode: 'es-ES', ttsService: 'azure' },
    { name: 'es-ES-XimenaMultilingualNeural', value: 'es-ES-XimenaMultilingualNeural', language: 'Spanish (Spain)', languageCode: 'es-ES', ttsService: 'azure' },
    // Portuguese (Brazil)
    { name: 'pt-BR-MacerioMultilingualNeural', value: 'pt-BR-MacerioMultilingualNeural', language: 'Portuguese (Brazil)', languageCode: 'pt-BR', ttsService: 'azure' },
    { name: 'pt-BR-ThalitaMultilingualNeural', value: 'pt-BR-ThalitaMultilingualNeural', language: 'Portuguese (Brazil)', languageCode: 'pt-BR', ttsService: 'azure' },
    // Dutch (Netherlands)
    { name: 'nl-NL-FennaNeural', value: 'nl-NL-FennaNeural', language: 'Dutch (Netherlands)', languageCode: 'nl-NL', ttsService: 'azure' },
    { name: 'nl-NL-MaartenNeural', value: 'nl-NL-MaartenNeural', language: 'Dutch (Netherlands)', languageCode: 'nl-NL', ttsService: 'azure' },
    { name: 'nl-NL-ColetteNeural', value: 'nl-NL-ColetteNeural', language: 'Dutch (Netherlands)', languageCode: 'nl-NL', ttsService: 'azure' },
    // Polish (Poland)
    { name: 'pl-PL-AgnieszkaNeural', value: 'pl-PL-AgnieszkaNeural', language: 'Polish (Poland)', languageCode: 'pl-PL', ttsService: 'azure' },
    { name: 'pl-PL-MarekNeural', value: 'pl-PL-MarekNeural', language: 'Polish (Poland)', languageCode: 'pl-PL', ttsService: 'azure' },
    { name: 'pl-PL-ZofiaNeural', value: 'pl-PL-ZofiaNeural', language: 'Polish (Poland)', languageCode: 'pl-PL', ttsService: 'azure' },
    // Russian (Russia)
    { name: 'ru-RU-SvetlanaNeural', value: 'ru-RU-SvetlanaNeural', language: 'Russian (Russia)', languageCode: 'ru-RU', ttsService: 'azure' },
    { name: 'ru-RU-DmitryNeural', value: 'ru-RU-DmitryNeural', language: 'Russian (Russia)', languageCode: 'ru-RU', ttsService: 'azure' },
    { name: 'ru-RU-DariyaNeural', value: 'ru-RU-DariyaNeural', language: 'Russian (Russia)', languageCode: 'ru-RU', ttsService: 'azure' },
    // Mandarin (China)
    { name: 'zh-CN-XiaoxiaoMultilingualNeural', value: 'zh-CN-XiaoxiaoMultilingualNeural', language: 'Mandarin (China)', languageCode: 'zh-CN', ttsService: 'azure' },
    { name: 'zh-CN-XiaochenMultilingualNeural', value: 'zh-CN-XiaochenMultilingualNeural', language: 'Mandarin (China)', languageCode: 'zh-CN', ttsService: 'azure' },
    { name: 'zh-CN-XiaoyuMultilingualNeural', value: 'zh-CN-XiaoyuMultilingualNeural', language: 'Mandarin (China)', languageCode: 'zh-CN', ttsService: 'azure' },
    { name: 'zh-CN-YunyiMultilingualNeural', value: 'zh-CN-YunyiMultilingualNeural', language: 'Mandarin (China)', languageCode: 'zh-CN', ttsService: 'azure' },
    { name: 'zh-CN-YunfanMultilingualNeural', value: 'zh-CN-YunfanMultilingualNeural', language: 'Mandarin (China)', languageCode: 'zh-CN', ttsService: 'azure' },
    { name: 'zh-CN-YunxiaoMultilingualNeural', value: 'zh-CN-YunxiaoMultilingualNeural', language: 'Mandarin (China)', languageCode: 'zh-CN', ttsService: 'azure' },
    // Japanese (Japan)
    { name: 'ja-JP-MasaruMultilingualNeural', value: 'ja-JP-MasaruMultilingualNeural', language: 'Japanese (Japan)', languageCode: 'ja-JP', ttsService: 'azure' },
    // Korean (Korea)
    { name: 'ko-KR-HyunsuMultilingualNeural', value: 'ko-KR-HyunsuMultilingualNeural', language: 'Korean (Korea)', languageCode: 'ko-KR', ttsService: 'azure' },
];
