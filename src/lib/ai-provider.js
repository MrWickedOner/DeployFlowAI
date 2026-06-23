/**
 * DeployFlow AI — AI Provider Abstraction Layer
 * 
 * Supports two modes, configurable via DEPLOYFLOW_MODE env var:
 *   - "cloud" (default): Uses remote AI APIs (OpenAI, Anthropic, Gemini)
 *   - "local": Uses Ollama running locally
 * 
 * The mode and provider are selected via environment variables:
 *   DEPLOYFLOW_MODE=local|cloud
 *   AI_PROVIDER=openai|anthropic|gemini|ollama
 *   OLLAMA_BASE_URL=http://localhost:11434  (local mode defaults)
 *   OLLAMA_MODEL=llama3.2                     (local mode defaults)
 *   OPENAI_API_KEY=sk-...                     (cloud mode)
 *   ANTHROPIC_API_KEY=sk-ant-...              (cloud mode)
 */

/**
 * Returns the current AI provider configuration.
 */
export function getAIProvider() {
  const mode = process.env.DEPLOYFLOW_MODE || 'cloud';
  const provider = process.env.AI_PROVIDER || (mode === 'local' ? 'ollama' : 'openai');

  return {
    mode,
    provider,
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'llama3.2'
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307'
    }
  };
}

/**
 * Send a chat completion request using the configured AI provider.
 * 
 * @param {Array<{role: string, content: string}>} messages - Chat messages
 * @param {Object} [options] - LLM options
 * @param {string} [options.systemPrompt] - System prompt override
 * @param {number} [options.temperature=0.7] - Temperature
 * @returns {Promise<string>} The AI's response text
 */
export async function chatCompletion(messages, options = {}) {
  const config = getAIProvider();
  const systemPrompt = options.systemPrompt || 'You are a helpful business AI assistant.';

  switch (config.provider) {
    case 'ollama':
      return chatWithOllama(messages, systemPrompt, config.ollama, options);
    case 'openai':
      return chatWithOpenAI(messages, systemPrompt, config.openai, options);
    case 'anthropic':
      return chatWithAnthropic(messages, systemPrompt, config.anthropic, options);
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }
}

/**
 * Local AI via Ollama.
 */
async function chatWithOllama(messages, systemPrompt, ollamaConfig, options) {
  const fullMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  const res = await fetch(`${ollamaConfig.baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: ollamaConfig.model,
      messages: fullMessages,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.7
      }
    })
  });

  if (!res.ok) {
    throw new Error(`Ollama API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.message?.content || '';
}

/**
 * Cloud AI via OpenAI.
 */
async function chatWithOpenAI(messages, systemPrompt, openaiConfig, options) {
  if (!openaiConfig.apiKey) {
    // Fallback to local if no API key configured
    console.warn('⚠️ No OpenAI API key configured. Falling back to Ollama...');
    const fallbackConfig = { ...getAIProvider(), provider: 'ollama' };
    if (fallbackConfig.ollama) {
      return chatWithOllama(messages, systemPrompt, fallbackConfig.ollama, options);
    }
    return simulateChatResponse(messages, systemPrompt);
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiConfig.apiKey}`
    },
    body: JSON.stringify({
      model: openaiConfig.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 300
    })
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Cloud AI via Anthropic Claude.
 */
async function chatWithAnthropic(messages, systemPrompt, anthropicConfig, options) {
  if (!anthropicConfig.apiKey) {
    console.warn('⚠️ No Anthropic API key configured. Falling back to local AI...');
    return simulateChatResponse(messages, systemPrompt);
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicConfig.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: anthropicConfig.model,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      max_tokens: options.maxTokens ?? 300,
      temperature: options.temperature ?? 0.7
    })
  });

  if (!res.ok) {
    throw new Error(`Anthropic API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || '';
}

/**
 * Fallback simulated response when no AI is available.
 * Used for demo/preview purposes when no API keys or local AI is configured.
 */
function simulateChatResponse(messages, systemPrompt) {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
  const promptLower = systemPrompt.toLowerCase();

  // Extract business context from system prompt
  const businessMatch = systemPrompt.match(/You are the AI support assistant for ([^.]+)/);
  const businessName = businessMatch ? businessMatch[1].trim() : 'our business';
  const servicesMatch = promptLower.match(/services: ([^.]+)/);
  const services = servicesMatch ? servicesMatch[1] : '';

  if (lastMessage.includes('service') || lastMessage.includes('offer') || lastMessage.includes('do you')) {
    return `At ${businessName}, we offer professional services including ${services || 'custom solutions tailored to your needs'}. Would you like to learn more about any specific service?`;
  }
  if (lastMessage.includes('hour') || lastMessage.includes('open') || lastMessage.includes('timing')) {
    return `Our operating hours are listed on our website. We're open during regular business hours and would love to serve you!`;
  }
  if (lastMessage.includes('cost') || lastMessage.includes('price') || lastMessage.includes('estimate')) {
    return `Thank you for your interest! For specific pricing details, please reach out to us directly using the contact form on our site. We provide competitive rates and custom quotes.`;
  }
  if (lastMessage.includes('book') || lastMessage.includes('appointment') || lastMessage.includes('schedule')) {
    return `I'd be happy to help you book an appointment! You can use the contact form on this page, or give us a call directly. Our team will get you scheduled right away.`;
  }

  return `That's a great question! At ${businessName}, we strive to provide the best experience for our clients. Please feel free to ask about our services, hours, or anything else you'd like to know!`;
}

export default {
  getAIProvider,
  chatCompletion,
  simulateChatResponse
};