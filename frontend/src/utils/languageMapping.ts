export const languageOptions = [
    { label: 'English (United States)', value: 'en-US' },
    { label: 'Italian (Italy)', value: 'it-IT' },
    { label: 'German (Germany)', value: 'de-DE' },
    { label: 'French (France)', value: 'fr-FR' },
    { label: 'Spanish (Spain)', value: 'es-ES' },
    { label: 'Portuguese (Brazil)', value: 'pt-BR' },
    { label: 'Dutch (Netherlands)', value: 'nl-NL' },
    { label: 'Polish (Poland)', value: 'pl-PL' },
    { label: 'Russian (Russia)', value: 'ru-RU' },
    { label: 'Mandarin (China)', value: 'cmn-CN' },
    { label: 'Japanese (Japan)', value: 'ja-JP' },
    { label: 'Korean (Korea)', value: 'ko-KR' }
];

export function getFullLanguageName(code: string): string {
    const mapping: { [key: string]: string } = {
        'en-US': 'English (United States)',
        'it-IT': 'Italian (Italy)',
        'de-DE': 'German (Germany)',
        'fr-FR': 'French (France)',
        'es-ES': 'Spanish (Spain)',
        'pt-BR': 'Portuguese (Brazil)',
        'nl-NL': 'Dutch (Netherlands)',
        'pl-PL': 'Polish (Poland)',
        'ru-RU': 'Russian (Russia)',
        'cmn-CN': 'Mandarin (China)',
        'ja-JP': 'Japanese (Japan)',
        'ko-KR': 'Korean (Korea)'
    };
    return mapping[code] || 'English (United States)';
}

export function getLanguageCode(fullName: string): string {
    const reverseMapping: { [key: string]: string } = {
        'English (United States)': 'en-US',
        'Italian (Italy)': 'it-IT',
        'German (Germany)': 'de-DE',
        'French (France)': 'fr-FR',
        'Spanish (Spain)': 'es-ES',
        'Portuguese (Brazil)': 'pt-BR',
        'Dutch (Netherlands)': 'nl-NL',
        'Polish (Poland)': 'pl-PL',
        'Russian (Russia)': 'ru-RU',
        'Mandarin (China)': 'cmn-CN',
        'Japanese (Japan)': 'ja-JP',
        'Korean (Korea)': 'ko-KR'
    };
    return reverseMapping[fullName] || 'en-US';
}
