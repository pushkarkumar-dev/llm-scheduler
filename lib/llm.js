// Abort LLM calls that take longer than this to prevent blocking the scheduler tick.
const LLM_TIMEOUT_MS = parseInt(process.env.LLM_TIMEOUT_MS ?? '120000');

export async function callLLM({ prompt, model }) {
  const baseUrl = process.env.LMSTUDIO_BASE_URL ?? 'http://localhost:1234/v1';
  const apiKey  = process.env.LMSTUDIO_API_KEY  ?? 'lm-studio';

  const body = {
    messages: [{ role: 'user', content: prompt }],
    ...(model ? { model } : {}),
  };

  let res;
  try {
    res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
    });
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new Error(`LM Studio request timed out after ${LLM_TIMEOUT_MS / 1000}s. Is a model loaded?`);
    }
    throw new Error(`Failed to reach LM Studio at ${baseUrl}: ${err.message}`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`LM Studio error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('LM Studio returned no content. Ensure a model is loaded.');
  return content;
}
