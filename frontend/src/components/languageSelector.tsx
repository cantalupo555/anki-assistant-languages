import React, { Dispatch, SetStateAction } from 'react';

// Interface to define the props for the LanguageSelector component
interface LanguageSelectorProps {
  nativeLanguage: string;
  setNativeLanguage: Dispatch<SetStateAction<string>>;
  targetLanguage: string;
  setTargetLanguage: Dispatch<SetStateAction<string>>;
}

// LanguageSelector component
const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  nativeLanguage,
  setNativeLanguage,
  targetLanguage,
  setTargetLanguage,
}) => {
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
        <option value="english">English (US)</option>
        <option value="italian">Italiano (IT)</option>
        <option value="german">Deutsch (DE)</option>
        <option value="french">Français (FR)</option>
        <option value="spanish">Español (ES)</option>
        <option value="portuguese">Português (BR)</option>
        <option value="dutch">Nederlands (NL)</option>
        <option value="polish">Polski (PL)</option>
        <option value="russian">Pусский (RU)</option>
        <option value="mandarin">普通话（CN)</option>
        <option value="japanese">日本語（JP)</option>
        <option value="korean">한국어（KR)</option>
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
        <option value="english">English (US)</option>
        <option value="italian">Italiano (IT)</option>
        <option value="german">Deutsch (DE)</option>
        <option value="french">Français (FR)</option>
        <option value="spanish">Español (ES)</option>
        <option value="portuguese">Português (BR)</option>
        <option value="dutch">Nederlands (NL)</option>
        <option value="polish">Polski (PL)</option>
        <option value="russian">Pусский (RU)</option>
        <option value="mandarin">普通话（CN)</option>
        <option value="japanese">日本語（JP)</option>
        <option value="korean">한국어（KR)</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
