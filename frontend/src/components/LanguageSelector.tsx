// Import necessary React components
import React from 'react';

// Import internal context
import { useAppContext } from '../context/selectionContext';

// Interface to define the props for the LanguageSelector component
interface LanguageSelectorProps {}

// LanguageSelector component
const LanguageSelector: React.FC<LanguageSelectorProps> = () => {
    const {
        nativeLanguage, setNativeLanguage, targetLanguage, setTargetLanguage,
        languageOptionsList
    } = useAppContext();

    // Add a check in case the list hasn't loaded yet (optional, but good practice)
    if (!languageOptionsList || languageOptionsList.length === 0) {
         // Can return null, a loader, or a disabled select
         return <div>Loading languages...</div>;
    }

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
                {/* Mapear sobre languageOptionsList */}
                {languageOptionsList.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
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
                {/* Mapear sobre languageOptionsList */}
                {languageOptionsList.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default LanguageSelector;
