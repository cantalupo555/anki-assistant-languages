// Import types - Ideally, these types should be in a shared location
// or duplicated in the backend for complete separation. For now, we assume
// we can import from the frontend, but consider refactoring this later.
import { APIServiceOption, LLMOption } from '../../frontend/src/utils/Types';

/**
 * @description Array of available AI service provider options.
 * Each object contains the display name and the internal value used for identification.
 * @type {APIServiceOption[]}
 */
export const apiServiceOptions: APIServiceOption[] = [
  { name: 'OpenRouter', value: 'openrouter' },
  { name: 'Google', value: 'google' },
  { name: 'Anthropic', value: 'anthropic' },
];

/**
 * @description Object mapping AI service provider values to their available Large Language Model (LLM) options.
 * The keys correspond to the `value` field in `apiServiceOptions`.
 * Each value is an array of LLM options, containing display name and internal value.
 * @type {{ [key: string]: LLMOption[] }}
 */
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
