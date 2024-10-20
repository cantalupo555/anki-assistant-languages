// Import necessary libraries
// React: Core library for building user interfaces
import React from 'react';
import { useAppContext } from '../context/selectionContext';

// Interface to define the props for the LanguageSelector component
interface LanguageSelectorProps {}

// LanguageSelector component
const LanguageSelector: React.FC<LanguageSelectorProps> = () => {
    const { nativeLanguage, setNativeLanguage, targetLanguage, setTargetLanguage } = useAppContext();

    return (
        <div className="language-selector">
            {/* Native language selection */}
            <label htmlFor="native-language-select">Your native language:</label>
            <select
                id="native-language-select"
                value={nativeLanguage}
                onChange={(e) => setNativeLanguage(e.target.value)}
                required
            >
                <option value="">Select your native language</option>
                <option value="en-US">English (US)</option>
                <option value="it-IT">Italiano (IT)</option>
                <option value="de-DE">Deutsch (DE)</option>
                <option value="fr-FR">Français (FR)</option>
                <option value="es-ES">Español (ES)</option>
                <option value="pt-BR">Português (BR)</option>
                <option value="nl-NL">Nederlands (NL)</option>
                <option value="pl-PL">Polski (PL)</option>
                <option value="ru-RU">Pусский (RU)</option>
                <option value="cmn-CN">普通话（CN)</option>
                <option value="ja-JP">日本語（JP)</option>
                <option value="ko-KR">한국어（KR)</option>
            </select>

            {/* Target language selection */}
            <label htmlFor="target-language-select">You are learning:</label>
            <select
                id="target-language-select"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                required
            >
                <option value="">Select target language</option>
                <option value="en-US">English (US)</option>
                <option value="it-IT">Italiano (IT)</option>
                <option value="de-DE">Deutsch (DE)</option>
                <option value="fr-FR">Français (FR)</option>
                <option value="es-ES">Español (ES)</option>
                <option value="pt-BR">Português (BR)</option>
                <option value="nl-NL">Nederlands (NL)</option>
                <option value="pl-PL">Polski (PL)</option>
                <option value="ru-RU">Pусский (RU)</option>
                <option value="cmn-CN">普通话（CN)</option>
                <option value="ja-JP">日本語（JP)</option>
                <option value="ko-KR">한국어（KR)</option>
            </select>
        </div>
    );
};

export default LanguageSelector;
