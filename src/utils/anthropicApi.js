// Groq API wrapper with timeout and error handling
// Uses local proxy server to avoid CORS issues
// Note: Model is hardcoded in the proxy server (server.js) to llama-3.3-70b-versatile

const PROXY_ENDPOINT = '/api/groq'
const MAX_TOKENS = 2048
const TEMPERATURE = 0.7
const TIMEOUT_MS = 30000 // 30 second timeout
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 10000 // 10 seconds for 429 rate limit retry

async function fetchWithRetry(messages, retries = 0) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(PROXY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Model is ignored by proxy - hardcoded to llama-3.3-70b-versatile in server.js
        model: 'llama-3.3-70b-versatile',
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
        messages,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const data = await response.json()
    console.log('Groq API raw response:', JSON.stringify(data, null, 2))

    // Handle 429 rate limit - retry with delay
    if (response.status === 429 && retries < MAX_RETRIES) {
      console.log(`Rate limited (429). Retrying in ${RETRY_DELAY_MS}ms... (attempt ${retries + 1}/${MAX_RETRIES})`)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
      return fetchWithRetry(messages, retries + 1)
    }

    if (!response.ok) {
      throw new Error(
        `API Error (${response.status}): ${data.error?.message || data.message || response.statusText}`
      )
    }

    // Groq/OpenAI response format: choices[0].message.content
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('Unexpected API response format')
    }

    return data.choices[0].message.content.trim()
  } catch (error) {
    clearTimeout(timeoutId)

    if (error.name === 'AbortError') {
      throw new Error('Request timed out after 30 seconds. Please try again.')
    }

    throw error
  }
}

export async function callGroq(systemPrompt, userPrompt) {
  // Groq uses OpenAI-compatible format: system prompt goes in messages array
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]

  return fetchWithRetry(messages)
}

// Build FOR agent system prompt
export function buildForPrompt(topic, round, maxRounds, history, lastOpponentArg) {
  return `You are an AI debater arguing FOR the following topic: ${topic}.
Round ${round} of ${maxRounds}. Your previous arguments: ${history.length > 0 ? history.join(' | ') : 'None'}.
Opponent's last argument: ${lastOpponentArg || 'None (first round)'}.
Write ONE concise argument (4-5 lines max) with SPECIFIC real-world facts, statistics, and named examples. Every claim must be backed by a concrete fact (study, report, law, company, country, year). No vague assertions. Directly counter the opponent's last point. Stay consistent with your position.`
}

// Build AGAINST agent system prompt
export function buildAgainstPrompt(topic, round, maxRounds, history, lastOpponentArg) {
  return `You are an AI debater arguing AGAINST the following topic: ${topic}.
Round ${round} of ${maxRounds}. Your previous arguments: ${history.length > 0 ? history.join(' | ') : 'None'}.
Opponent's last argument: ${lastOpponentArg || 'None (first round)'}.
Write ONE concise argument (4-5 lines max) with SPECIFIC real-world facts, statistics, and named examples. Every claim must be backed by a concrete fact (study, report, law, company, country, year). No vague assertions. Directly counter the opponent's last point. Stay consistent with your position.`
}

// Build closing statement prompt
export function buildClosingPrompt(topic, side, ownHistory, opponentHistory) {
  const position = side === 'for' ? 'FOR' : 'AGAINST'
  return `You are an AI debater arguing ${position} the following topic: ${topic}.
Your arguments this debate: ${ownHistory.length > 0 ? ownHistory.join(' | ') : 'None'}.
Opponent's arguments: ${opponentHistory.length > 0 ? opponentHistory.join(' | ') : 'None'}.
Deliver a 2-sentence closing statement. First sentence: your strongest fact-backed point. Second sentence: why the opposition's case fails. Use maximum conviction - no hedging.`
}

// Keep old export name for compatibility
export const callAnthropic = callGroq