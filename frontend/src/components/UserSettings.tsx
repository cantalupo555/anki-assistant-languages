// Import necessary React hooks and components
import React, { useState, useEffect } from 'react';

// Import styled components
import * as S from '../styles/AppStyles';
import { Button } from '../styles/ButtonStyles';

// Import internal utility functions
import useAuth from '../utils/useAuth';
import { apiServiceOptions, llmOptions, ttsOptions } from '../utils/Options';
import { voiceOptions } from '../utils/voiceOptions';

// List of supported languages
const supportedLanguages = [
    'English (United States)',
    'Italian (Italy)',
    'German (Germany)',
    'French (France)',
    'Spanish (Spain)',
    'Portuguese (Brazil)',
    'Dutch (Netherlands)',
    'Polish (Poland)',
    'Russian (Russia)',
    'Mandarin (China)',
    'Japanese (Japan)',
    'Korean (Korea)'
];

interface UserSettingsState {
    preferredLanguage: string;
    theme: string;
    nativeLanguage: string;
    targetLanguage: string;
    selectedApiService: string;
    selectedTtsService: string;
    selectedLlm: string;
    selectedVoice: string;
}

const UserSettings: React.FC = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState<UserSettingsState>({
        preferredLanguage: 'english',
        theme: 'light',
        nativeLanguage: '',
        targetLanguage: '',
        selectedApiService: 'openrouter',
        selectedTtsService: ttsOptions[0].value,
        selectedLlm: llmOptions['openrouter'][0].value,
        selectedVoice: voiceOptions[0].value
    });

    // Load user settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await fetch(`/api/user/settings`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setSettings(data);
                }
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        };

        if (user) {
            loadSettings();
        }
    }, [user]);

    // Update LLMs when the API provider changes
    useEffect(() => {
        const defaultLLM = llmOptions[settings.selectedApiService]?.[0] || { name: 'Select AI', value: '' };
        setSettings(prev => ({
            ...prev,
            selectedLlm: defaultLLM.value
        }));
    }, [settings.selectedApiService]);

    // Update voices when the TTS service changes
    useEffect(() => {
        const defaultVoice = voiceOptions.find(
            voice => voice.ttsService === settings.selectedTtsService
        ) || voiceOptions[0];
        setSettings(prev => ({
            ...prev,
            selectedVoice: defaultVoice.value
        }));
    }, [settings.selectedTtsService]);

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
            const response = await fetch('/api/user/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                alert('Settings saved successfully!');
            } else {
                throw new Error('Error saving settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Error saving settings');
        }
    };

    // Get voices filtered by the selected TTS service
    const getFilteredVoices = () => {
        return voiceOptions.filter(voice => 
            voice.ttsService === settings.selectedTtsService &&
            voice.language === settings.targetLanguage
        );
    };

    // Get LLMs filtered by the selected API provider
    const getFilteredLLMs = () => {
        return llmOptions[settings.selectedApiService] || [];
    };

    return (
        <S.Section>
            <h2>User Settings</h2>
            <S.Form onSubmit={handleSubmit}>
                {/* Interface Language */}
                <S.FormGroup>
                    <label>Interface Language:</label>
                    <select
                        name="preferredLanguage"
                        value={settings.preferredLanguage}
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
                        name="nativeLanguage"
                        value={settings.nativeLanguage}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select your native language</option>
                        {supportedLanguages.map(lang => (
                            <option key={lang} value={lang}>
                                {lang}
                            </option>
                        ))}
                    </select>
                </S.FormGroup>

                {/* Target Language */}
                <S.FormGroup>
                    <label>Learning Language:</label>
                    <select
                        name="targetLanguage"
                        value={settings.targetLanguage}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select the language you are learning</option>
                        {supportedLanguages.map(lang => (
                            <option key={lang} value={lang}>
                                {lang}
                            </option>
                        ))}
                    </select>
                </S.FormGroup>

                {/* API Provider */}
                <S.FormGroup>
                    <label>API Provider:</label>
                    <select
                        name="selectedApiService"
                        value={settings.selectedApiService}
                        onChange={handleChange}
                    >
                        {apiServiceOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </S.FormGroup>

                {/* Language Model (LLM) */}
                <S.FormGroup>
                    <label>Language Model:</label>
                    <select
                        name="selectedLlm"
                        value={settings.selectedLlm}
                        onChange={handleChange}
                    >
                        {getFilteredLLMs().map(option => (
                            <option key={option.value} value={option.value}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </S.FormGroup>

                {/* TTS Service */}
                <S.FormGroup>
                    <label>Text-to-Speech Service:</label>
                    <select
                        name="selectedTtsService"
                        value={settings.selectedTtsService}
                        onChange={handleChange}
                    >
                        {ttsOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </S.FormGroup>

                {/* TTS Voice */}
                <S.FormGroup>
                    <label>TTS Voice:</label>
                    <select
                        name="selectedVoice"
                        value={settings.selectedVoice}
                        onChange={handleChange}
                    >
                        {getFilteredVoices().map(option => (
                            <option key={option.value} value={option.value}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </S.FormGroup>

                <Button type="submit">Save Settings</Button>
            </S.Form>
        </S.Section>
    );
};

export default UserSettings;
