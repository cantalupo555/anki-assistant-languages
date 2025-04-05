import { APIServiceOption, LLMOption, TTSOption } from './Types';

export const apiServiceOptions: APIServiceOption[] = [
  { name: 'OpenRouter', value: 'openrouter' },
  { name: 'Google', value: 'google' },
  { name: 'Anthropic', value: 'anthropic' },
];

export const llmOptions: { [key: string]: LLMOption[] } = {
  openrouter: [
    { name: 'Llama 4 Maverick', value: 'meta-llama/llama-4-maverick' },
    { name: 'DeepSeek V3-0324', value: 'deepseek/deepseek-chat-v3-0324' },
    { name: 'Gemini 2.0 Flash', value: 'google/gemini-2.0-flash-001' },
    { name: 'Claude 3.5 Haiku', value: 'anthropic/claude-3-5-haiku' },
  ],
  google: [
    { name: 'Gemini 2.0 Flash Exp', value: 'gemini-2.0-flash-exp' },
  ],
  anthropic: [
    { name: 'Claude-3.5 Haiku', value: 'claude-3-5-haiku-latest' },
  ]
};

export const ttsOptions: TTSOption[] = [
  { name: 'Google TTS', value: 'google' },
  { name: 'Azure TTS', value: 'azure' },
];
