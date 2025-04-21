// Import necessary React hooks and components
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback

// Import styled components
import * as S from '../styles/AppStyles';
import { Button } from '../styles/ButtonStyles';

// Import type definitions
import { APIServiceOption, LLMOption, TTSOption, VoiceOption } from '../utils/Types';

// Import internal utility functions
import useAuth from '../utils/useAuth';
import { useAppContext } from '../context/selectionContext'; // Import context hook
import { LanguageOption } from '../utils/Types'; // Import LanguageOption type

// REMOVED: import { languageOptions } from '../utils/languageMapping'; // No longer needed

interface UserSettingsState {
    preferred_language: string;
    theme: string;
    native_language: string;
    target_language: string;
    selected_api_service: string;
    selected_tts_service: string;
    selected_llm: string;
    selected_voice: string;
}

const UserSettings: React.FC = () => {
    const { user } = useAuth();
    // Consume options lists and loading status from context
    const {
        apiServiceOptionsList,
        llmOptionsList,
        ttsOptionsList,
        voiceOptionsList,
        optionsLoading,
        optionsError: contextOptionsError, // Rename to avoid conflict with local error state
        languageOptionsList // <-- Get language options list from context
    } = useAppContext();

    const [settings, setSettings] = useState<UserSettingsState>({
        preferred_language: 'english',
        theme: 'light',
        // Initialize with potentially empty values, will be validated/set by useEffect
        native_language: '', // Keep only these initial empty values
        target_language: '', // Keep only these initial empty values
        selected_api_service: '',
        selected_tts_service: '',
        selected_llm: '',
        selected_voice: ''
    });
    const [isLoading, setIsLoading] = useState(true); // Local loading state for settings fetch
    // REMOVED: const [error, setError] = useState<string | null>(null); // Local error state was unused

    // Load user settings (runs after options are potentially loaded by context)
    useEffect(() => {
        // Don't fetch settings if options are still loading or failed
        if (optionsLoading || contextOptionsError) {
            setIsLoading(false); // Stop local loading if options failed
            return;
        }

        const loadSettings = async () => {
            setIsLoading(true); // Start local loading
            // setError(null); // Removed call to non-existent setError
            try {
                const response = await fetch(`/user/settings`, {
                    headers: {
                        // Use callApiWithAuth to handle token refresh automatically if needed
                        // Assuming callApiWithAuth returns the necessary headers or handles auth
                        // If not, revert to manually adding Authorization header
                        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }); // <--- REMOVE EXTRA BRACE HERE

                let data: Partial<UserSettingsState> = {}; // Use partial type

                if (response.ok) {
                    data = await response.json();
                } else if (response.status === 404) {
                    console.log('User settings not found in DB, using defaults.');
                    // Keep data as empty object, defaults will be applied below
                } else {
                    throw new Error(`HTTP Error ${response.status}`);
                }

                // --- Validate and Set Defaults using fetched options lists ---

                const validatedSettings: UserSettingsState = {
                    preferred_language: ['english', 'portuguese', 'spanish'].includes(data.preferred_language || '')
                        ? data.preferred_language || 'english'
                        : 'english',
                    theme: ['light', 'dark'].includes(data.theme || '')
                        ? data.theme || 'light'
                        : 'light',
                    // Use languageOptionsList from context for validation
                    native_language: languageOptionsList.some((opt: LanguageOption) => opt.value === data.native_language)
                        ? data.native_language || 'en-US' // Default native
                        : 'en-US',
                    target_language: languageOptionsList.some((opt: LanguageOption) => opt.value === data.target_language)
                        ? data.target_language || 'en-US' // Default target
                        : 'en-US',
                    selected_api_service: apiServiceOptionsList.some(opt => opt.value === data.selected_api_service)
                        ? data.selected_api_service || apiServiceOptionsList[0]?.value || ''
                        : apiServiceOptionsList[0]?.value || '',
                    selected_tts_service: ttsOptionsList.some(opt => opt.value === data.selected_tts_service)
                        ? data.selected_tts_service || ttsOptionsList[0]?.value || ''
                        : ttsOptionsList[0]?.value || '',
                    // LLM and Voice depend on other selections, validate them carefully
                    selected_llm: '', // Placeholder, will be set below
                    selected_voice: '', // Placeholder, will be set below
                };

                // Validate LLM based on the determined API service
                const currentLLMs = llmOptionsList[validatedSettings.selected_api_service] || [];
                validatedSettings.selected_llm = currentLLMs.some((llm: LLMOption) => llm.value === data.selected_llm)
                    ? data.selected_llm || currentLLMs[0]?.value || ''
                    : currentLLMs[0]?.value || '';

                // Validate Voice based on the determined TTS service and target language
                const currentVoices = voiceOptionsList.filter((v: VoiceOption) =>
                    v.ttsService === validatedSettings.selected_tts_service &&
                    v.languageCode === validatedSettings.target_language
                );
                validatedSettings.selected_voice = currentVoices.some((v: VoiceOption) => v.value === data.selected_voice)
                    ? data.selected_voice || currentVoices[0]?.value || ''
                    : currentVoices[0]?.value || (voiceOptionsList[0]?.value || ''); // Fallback to first overall if combo has none

                setSettings(validatedSettings);

            } catch (error) {
                console.error('Error loading settings:', error);
                // setError('Error loading settings'); // Removed call to local setError
            } finally {
                 setIsLoading(false); // Finish local loading
            }
        }; // End of loadSettings function

        // Only load if user exists and options are ready
        if (user && !optionsLoading && !contextOptionsError) {
            loadSettings();
        } else if (!optionsLoading && contextOptionsError) {
             // setError(`Cannot load user settings: ${contextOptionsError}`); // Removed call to local setError
             console.error(`Cannot load user settings: ${contextOptionsError}`); // Log error instead
             setIsLoading(false);
        }

    }, [user, optionsLoading, contextOptionsError, apiServiceOptionsList, llmOptionsList, ttsOptionsList, voiceOptionsList, languageOptionsList]); // Added languageOptionsList dependency

    // --- Validation Effects (run after settings are loaded or changed) ---

    // Validate LLM selection when API service changes (using context list)
    useEffect(() => {
        // Don't validate if options/settings are loading or service is not set
        if (optionsLoading || isLoading || !settings.selected_api_service) return;

        const currentAPIService = settings.selected_api_service;
        const validLLMs = llmOptionsList[currentAPIService] || [];
        const isValidLLM = validLLMs.some(
            (llm: LLMOption) => llm.value === settings.selected_llm
        );

        // If current LLM is invalid for the selected service, update to the default
        if (!isValidLLM) {
            const defaultLLMValue = validLLMs[0]?.value || ''; // Get the first valid LLM or empty string
            console.warn(`UserSettings: LLM ${settings.selected_llm} invalid for service ${currentAPIService}. Updating to ${defaultLLMValue}`);
            // Update only if the default is different to avoid infinite loops
            if (settings.selected_llm !== defaultLLMValue) {
                setSettings(prev => ({ ...prev, selected_llm: defaultLLMValue }));
            }
        }
    // Only re-validate LLM when the selected API service changes OR the LLM itself changes (to catch external updates)
    }, [settings.selected_api_service, settings.selected_llm, llmOptionsList, optionsLoading, isLoading]);

    // Validate Voice selection when TTS service or target language changes (using context list)
    useEffect(() => {
        // Don't validate if options/settings are loading or required fields are not set
        if (optionsLoading || isLoading || !settings.selected_tts_service || !settings.target_language) return;

        const filteredVoices = voiceOptionsList.filter((v: VoiceOption) =>
            v.ttsService === settings.selected_tts_service &&
            v.languageCode === settings.target_language
        );

        const isValidVoice = filteredVoices.some((v: VoiceOption) => v.value === settings.selected_voice);

        // If current voice is invalid for the combo
        if (!isValidVoice) {
            let newVoiceValue = '';
            if (filteredVoices.length > 0) {
                // Set to the first voice available for the combo
                newVoiceValue = filteredVoices[0].value;
                console.warn(`UserSettings: Voice ${settings.selected_voice} invalid for ${settings.target_language}/${settings.selected_tts_service}. Updating to ${newVoiceValue}`);
            } else {
                // Handle case where NO voices match the combo - select the first overall voice as fallback
                newVoiceValue = voiceOptionsList[0]?.value || ''; // Fallback to first overall voice or empty
                console.warn(`UserSettings: No voices for ${settings.target_language}/${settings.selected_tts_service}. Updating to fallback ${newVoiceValue}`);
            }
            // Update only if the new value is different to avoid potential loops
            if (settings.selected_voice !== newVoiceValue) {
                 setSettings(prev => ({ ...prev, selected_voice: newVoiceValue }));
            }
        }
    // Re-validate voice when TTS service, target language, or the voice itself changes
    }, [settings.selected_tts_service, settings.target_language, settings.selected_voice, voiceOptionsList, optionsLoading, isLoading]);

    // --- End Validation Effects ---

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const response = await fetch('/user/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                alert('Settings saved successfully!'); // TODO: Replace with proper notification system
            } else {
                throw new Error('Error saving settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Error saving settings'); // TODO: Replace with proper error handling
        }
    };

    // Get LLMs filtered by the selected API provider (memoized)
    const getFilteredLLMs = useCallback(() => {
        const currentService = settings.selected_api_service;
        // Use context list
        return llmOptionsList[currentService] || [];
    }, [settings.selected_api_service, llmOptionsList]); // Depend on context list

    // Get voices filtered by the selected TTS service and target language (memoized)
    const getFilteredVoices = useCallback(() => {
        // Use context list
        return voiceOptionsList.filter((voice: VoiceOption) =>
            voice.ttsService === settings.selected_tts_service &&
            voice.languageCode === settings.target_language
        );
    }, [settings.selected_tts_service, settings.target_language, voiceOptionsList]); // Depend on context list

    return (
        <S.Section>
            <h2>User Settings</h2>
            <S.Form onSubmit={handleSubmit}>
                {/* Interface Language */}
                <S.FormGroup>
                    <label>Interface Language:</label>
                    <select
                        name="preferred_language"
                        value={settings.preferred_language}
                        onChange={handleChange}
                    >
                        <option value="english">English</option>
                        <option value="portuguese">Português</option>
                        <option value="spanish">Español</option>
                    </select>
                </S.FormGroup>

                {/* Theme */}
                <S.FormGroup>
                    <label>Theme:</label>
                    <select
                        name="theme"
                        value={settings.theme}
                        onChange={handleChange}
                    >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </S.FormGroup>

                {/* Native Language */}
                <S.FormGroup>
                    <label>Native Language:</label>
                    <select
                        name="native_language"
                        value={settings.native_language}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select your native language</option>
                        {/* Map over languageOptionsList from context */}
                        {languageOptionsList.map((option: LanguageOption) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </S.FormGroup>

                {/* Target Language */}
                <S.FormGroup>
                    <label>Learning Language:</label>
                    <select
                        name="target_language"
                        value={settings.target_language}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select the language you are learning</option>
                        {/* Map over languageOptionsList from context */}
                        {languageOptionsList.map((option: LanguageOption) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </S.FormGroup>

                {/* API Provider */}
                {/* API Provider */}
                <S.FormGroup>
                    <label htmlFor="selected_api_service">AI Provider:</label>
                    <select
                        id="selected_api_service"
                        name="selected_api_service"
                        value={settings.selected_api_service}
                        onChange={handleChange}
                        disabled={optionsLoading || isLoading} // Disable while loading options or settings
                    >
                        {/* Use context list */}
                        {apiServiceOptionsList.map((option: APIServiceOption) => (
                            <option key={option.value} value={option.value}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </S.FormGroup>

                {/* Language Model (LLM) */}
                <S.FormGroup>
                    <label htmlFor="selected_llm">AI Model:</label>
                    <select
                        id="selected_llm"
                        name="selected_llm"
                        value={settings.selected_llm}
                        onChange={handleChange}
                        disabled={optionsLoading || isLoading || getFilteredLLMs().length === 0} // Disable if loading or no models
                    >
                        {/* Use filtered list */}
                        {getFilteredLLMs().length === 0 && <option value="">No models available</option>}
                        {getFilteredLLMs().map((option: LLMOption) => (
                            <option key={option.value} value={option.value}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </S.FormGroup>

                {/* TTS Service */}
                <S.FormGroup>
                    <label htmlFor="selected_tts_service">TTS Service:</label>
                    <select
                        id="selected_tts_service"
                        name="selected_tts_service"
                        value={settings.selected_tts_service}
                        onChange={handleChange}
                        disabled={optionsLoading || isLoading} // Disable while loading
                    >
                        {/* Use context list */}
                        {ttsOptionsList.map((option: TTSOption) => (
                            <option key={option.value} value={option.value}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </S.FormGroup>

                {/* TTS Voice */}
                <S.FormGroup>
                    <label htmlFor="selected_voice">Voice:</label>
                    <select
                        id="selected_voice"
                        name="selected_voice"
                        value={settings.selected_voice}
                        onChange={handleChange}
                        disabled={optionsLoading || isLoading || getFilteredVoices().length === 0} // Disable if loading or no voices
                    >
                         {/* Use filtered list */}
                        {getFilteredVoices().length === 0 && <option value="">No voices available</option>}
                        {getFilteredVoices().map((option: VoiceOption) => (
                            <option key={option.value} value={option.value}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </S.FormGroup>

                <Button type="submit" disabled={isLoading || optionsLoading}>Save Settings</Button>
            </S.Form>
        </S.Section>
    );
};

export default UserSettings;
