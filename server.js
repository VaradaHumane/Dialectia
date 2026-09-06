import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PROXY_PORT || 3001
const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'

if (!GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY not found in .env file')
  process.exit(1)
}

console.log(`🔑 GROQ_API_KEY loaded: ${GROQ_API_KEY.slice(0, 5)}...`)

app.use(cors())
app.use(express.json({ limit: '1mb' }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'dialectia-proxy' })
})

// Proxy endpoint for Groq API (OpenAI-compatible)
// Model is hardcoded to openai/gpt-oss-20b — override whatever the frontend sends
const HARDCODED_MODEL = 'openai/gpt-oss-20b'

app.post('/api/groq', async (req, res) => {
  try {
    const { model, max_tokens, temperature, messages } = req.body

    // Validate required fields (model is optional now since we override it)
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Invalid request: messages are required'
      })
    }

    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: HARDCODED_MODEL, // Always override with hardcoded model
        max_tokens: max_tokens || 500,
        temperature: temperature || 0.7,
        messages,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Groq API error:', data)
      return res.status(response.status).json(data)
    }

    res.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({
      error: 'Internal proxy error',
      message: error.message
    })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Dialectia proxy server running on http://localhost:${PORT}`)
  console.log(`   Forwarding to ${GROQ_ENDPOINT}`)
})