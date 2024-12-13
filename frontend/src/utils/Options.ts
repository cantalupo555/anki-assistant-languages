import { APIServiceOption, LLMOption, TTSOption } from './Types';

export const apiServiceOptions: APIServiceOption[] = [
  { name: 'Select your AI Provider', value: '' },
  { name: 'OpenRouter', value: 'openrouter' },
  { name: 'Google', value: 'google' },
  { name: 'Anthropic', value: 'anthropic' },
];

export const llmOptions: { [key: string]: LLMOption[] } = {
  openrouter: [
    { name: 'Select AI', value: '' },
    { name: 'Qwen-2.5 72B Instruct', value: 'qwen/qwen-2.5-72b-instruct' },
    { name: 'Claude-3.5 Haiku', value: 'anthropic/claude-3-5-haiku' },
  ],
  google: [
    { name: 'Select AI', value: '' },
    { name: 'Gemini 2.0 Flash Exp', value: 'gemini-2.0-flash-exp' },
  ],
  anthropic: [
    { name: 'Select AI', value: '' },
    { name: 'Claude-3.5 Haiku', value: 'claude-3-5-haiku-latest' },
  ]
};

export const ttsOptions: TTSOption[] = [
  { name: 'Select your TTS Service', value: '' },
  { name: 'Google TTS', value: 'google' },
  { name: 'Azure TTS', value: 'azure' },
];
