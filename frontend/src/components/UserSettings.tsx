// Import necessary React hooks and components
import React, { useState, useEffect } from 'react';

// Import styled components
import * as S from '../styles/AppStyles';
import { Button } from '../styles/ButtonStyles';

// Import internal utility functions
import useAuth from '../utils/useAuth';
import { apiServiceOptions, llmOptions, ttsOptions } from '../utils/Options';
import { voiceOptions } from '../utils/voiceOptions';

// Import language options
import { languageOptions } from '../utils/languageMapping';

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
    const [settings, setSettings] = useState<UserSettingsState>({
        preferred_language: 'english',
        theme: 'light',
        native_language: 'en-US',
        target_language: 'en-US',
        selected_api_service: 'openrouter',
        selected_tts_service: 'google',
        selected_llm: llmOptions['openrouter'][0]?.value || '',
        selected_voice: voiceOptions[0]?.value || ''
    });

    // Load user settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await fetch(`/user/settings`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const data = await response.json();
                
                // Complete validation of received data
                const validatedSettings = {
                    preferred_language: ['english', 'portuguese', 'spanish'].includes(data.preferred_language) 
                        ? data.preferred_language 
                        : 'english',
                    theme: ['light', 'dark'].includes(data.theme) 
                        ? data.theme 
                        : 'light',
                    native_language: languageOptions.some(opt => opt.value === data.native_language) 
                        ? data.native_language 
                        : 'en-US',
                    target_language: languageOptions.some(opt => opt.value === data.target_language) 
                        ? data.target_language 
                        : 'en-US',
                    selected_api_service: apiServiceOptions.some(opt => opt.value === data.selected_api_service) 
                        ? data.selected_api_service 
                        : 'openrouter',
                    selected_tts_service: ttsOptions.some(opt => opt.value === data.selected_tts_service) 
                        ? data.selected_tts_service 
                        : 'google',
                    selected_llm: llmOptions[data.selected_api_service]?.some(llm => llm.value === data.selected_llm)
                        ? data.selected_llm
                        : (llmOptions[data.selected_api_service]?.[0]?.value || ''),
                    selected_voice: voiceOptions.some(v => 
                        v.value === data.selected_voice && 
                        v.ttsService === data.selected_tts_service &&
                        v.languageCode === data.target_language
                    )
                        ? data.selected_voice
                        : (voiceOptions.find(v => 
                            v.ttsService === data.selected_tts_service && 
                            v.languageCode === data.target_language
                          )?.value || voiceOptions[0].value)
                };

                setSettings(validatedSettings);

            } catch (error) {
                console.error('Error loading settings:', error);
                alert('Error loading settings. Using default values.'); // TODO: Replace with proper error handling
            }
        };

        if (user) {
            loadSettings();
        }
    }, [user]);

    // Update LLM only if current value is invalid
    useEffect(() => {
        const currentAPIService = settings.selected_api_service;
        const isValidLLM = llmOptions[currentAPIService]?.some(
            llm => llm.value === settings.selected_llm
        );
        
        if (!isValidLLM) {
            const defaultLLM = llmOptions[currentAPIService]?.[0]?.value || '';
            setSettings(prev => ({ 
                ...prev, 
                selected_llm: defaultLLM 
            }));
        }
    }, [settings.selected_api_service]);

    // Add additional validation
    useEffect(() => {
        const currentService = settings.selected_api_service;
        const validLLMs = llmOptions[currentService]?.map(llm => llm.value) || [];
        
        if (!validLLMs.includes(settings.selected_llm)) {
            const defaultLLM = llmOptions[currentService]?.[0]?.value || '';
            setSettings(prev => ({ ...prev, selected_llm: defaultLLM }));
        }
    }, [settings.selected_api_service]);

    // Update voice only if current value is invalid
    useEffect(() => {
        const filteredVoices = voiceOptions.filter(v => 
            v.ttsService === settings.selected_tts_service &&
            v.languageCode === settings.target_language
        );
        
        const isValidVoice = filteredVoices.some(v => v.value === settings.selected_voice);
        
        if (!isValidVoice) {
            const defaultVoice = filteredVoices[0]?.value || voiceOptions[0].value;
            setSettings(prev => ({ 
                ...prev, 
                selected_voice: defaultVoice 
            }));
        }
    }, [settings.selected_tts_service, settings.target_language]);

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

    // Get voices filtered by the selected TTS service
    const getFilteredVoices = () => {
        return voiceOptions.filter(voice => 
            voice.ttsService === settings.selected_tts_service &&
            voice.languageCode === settings.target_language
        );
    };

    // Get LLMs filtered by the selected API provider
    const getFilteredLLMs = () => {
        return llmOptions[settings.selected_api_service] || [];
    };

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
                        {languageOptions.map(option => (
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
                        {languageOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </S.FormGroup>

                {/* API Provider */}
                <S.FormGroup>
                    <label>API Provider:</label>
                    <select
                        name="selected_api_service"
                        value={settings.selected_api_service}
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
                        name="selected_llm"
                        value={settings.selected_llm}
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
                        name="selected_tts_service"
                        value={settings.selected_tts_service}
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
                        name="selected_voice"
                        value={settings.selected_voice}
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
