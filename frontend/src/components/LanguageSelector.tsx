// Import necessary React components
import React from 'react';

// Import internal context
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
                <option value="English (United States)">English (US)</option>
                <option value="Italian (Italy)">Italiano (IT)</option>
                <option value="German (Germany)">Deutsch (DE)</option>
                <option value="French (France)">Français (FR)</option>
                <option value="Spanish (Spain)">Español (ES)</option>
                <option value="Portuguese (Brazil)">Português (BR)</option>
                <option value="Dutch (Netherlands)">Nederlands (NL)</option>
                <option value="Polish (Poland)">Polski (PL)</option>
                <option value="Russian (Russia)">Pусский (RU)</option>
                <option value="Mandarin (China)">普通话（CN)</option>
                <option value="Japanese (Japan)">日本語（JP)</option>
                <option value="Korean (Korea)">한국어（KR)</option>
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
                <option value="English (United States)">English (US)</option>
                <option value="Italian (Italy)">Italiano (IT)</option>
                <option value="German (Germany)">Deutsch (DE)</option>
                <option value="French (France)">Français (FR)</option>
                <option value="Spanish (Spain)">Español (ES)</option>
                <option value="Portuguese (Brazil)">Português (BR)</option>
                <option value="Dutch (Netherlands)">Nederlands (NL)</option>
                <option value="Polish (Poland)">Polski (PL)</option>
                <option value="Russian (Russia)">Pусский (RU)</option>
                <option value="Mandarin (China)">普通话（CN)</option>
                <option value="Japanese (Japan)">日本語（JP)</option>
                <option value="Korean (Korea)">한국어（KR)</option>
            </select>
        </div>
    );
};

export default LanguageSelector;
