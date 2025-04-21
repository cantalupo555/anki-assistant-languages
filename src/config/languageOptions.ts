/**
 * @fileOverview Utility functions for mapping language codes to full names and vice versa.
 * This file provides mappings for language codes (e.g., 'en-US') to human-readable names (e.g., 'English (United States)').
 *
 * This file contains:
 * - `languageOptions`: An array listing supported languages with their codes (e.g., 'en-US')
 *   and user-friendly labels (e.g., 'English (United States)'). Exposed via API for frontend selectors.
 * - `getFullLanguageName`: A function to convert a language code to its full name. Used internally by the backend.
 * - `getLanguageCode`: A function to convert a full language name back to its code. Used internally by the backend.
 */

// Array of supported languages with their display labels and language codes
export const languageOptions = [
    { label: 'English (United States)', value: 'en-US' }, // English language option
    { label: 'Italian (Italy)', value: 'it-IT' },         // Italian language option
    { label: 'German (Germany)', value: 'de-DE' },       // German language option
    { label: 'French (France)', value: 'fr-FR' },        // French language option
    { label: 'Spanish (Spain)', value: 'es-ES' },        // Spanish language option
    { label: 'Portuguese (Brazil)', value: 'pt-BR' },    // Portuguese (Brazil) language option
    { label: 'Dutch (Netherlands)', value: 'nl-NL' },    // Dutch language option
    { label: 'Polish (Poland)', value: 'pl-PL' },        // Polish language option
    { label: 'Russian (Russia)', value: 'ru-RU' },       // Russian language option
    { label: 'Mandarin (China)', value: 'cmn-CN' },      // Mandarin Chinese language option
    { label: 'Japanese (Japan)', value: 'ja-JP' },       // Japanese language option
    { label: 'Korean (Korea)', value: 'ko-KR' }          // Korean language option
];

/**
 * Converts a language code to its full language name
 * @param code - The language code (e.g., 'en-US')
 * @returns The full language name (e.g., 'English (United States)')
 *          Defaults to 'English (United States)' if code is not found
 */
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

/**
 * Converts a full language name to its corresponding language code
 * @param fullName - The full language name (e.g., 'English (United States)')
 * @returns The language code (e.g., 'en-US')
 *          Defaults to 'en-US' if full name is not found
 */
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
