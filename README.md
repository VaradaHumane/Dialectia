# Dialectia - AI Debate Arena

A local React prototype for a Multi-Agent AI Debate System with Live Sentiment Analysis.

## 🎥 Project Demo

Watch the Dialectia AI Debate Arena in action:

<video src="https://github.com/user-attachments/assets/e00b240a-9698-4ab8-9f02-7050b1da8328" controls></video>

## Features

- **Two AI Agents**: FOR and AGAINST agents debate any topic across multiple rounds
- **Real-time Sentiment Analysis**: Keyword-based sentiment scoring for each argument
- **Visual Analytics**: Sentiment heatmap and trend chart (recharts)
- **Dark Professional UI**: Tailwind CSS with custom design system
- **CORS-free API**: Local Express proxy server handles Groq API calls

## Tech Stack

- React 18 + Vite
- Tailwind CSS v3
- Groq API (llama-3.3-70b-versatile) via local proxy
- Express.js proxy server
- recharts for data visualization
- No database - all state in React

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure API key**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Groq API key:
   ```
   GROQ_API_KEY=your_actual_key_here
   ```
   Get your key from: https://console.groq.com/keys

3. **Start development servers** (runs both proxy and React app)
   ```bash
   npm run dev:all
   ```
   - React app: http://localhost:3000
   - Proxy server: http://localhost:3001

   Or run separately:
   ```bash
   # Terminal 1 - Proxy server
   npm run dev:proxy
   
   # Terminal 2 - React app
   npm run dev
   ```

## Usage

1. Enter a debate topic (or click an example chip)
2. Select number of rounds (3, 5, or 7)
3. Click "Start Debate"
4. Watch agents debate in real-time with live sentiment analysis
5. View sentiment heatmap and trend chart after rounds complete
6. Click "New Debate" to start over

## Project Structure

```
Dialectia/
├── server.js                 # Express proxy server
├── index.html                # Entry HTML
├── package.json              # Dependencies & scripts
├── vite.config.js            # Vite config with proxy
├── tailwind.config.js        # Custom color palette & theme
├── postcss.config.js         # PostCSS config
├── .env.example              # API key template
├── .env                      # Your API key (not committed)
├── README.md                 # This file
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Root - switches input/debate screens
│   ├── index.css             # Tailwind + custom styles/animations
│   ├── components/
│   │   ├── DebateInput.jsx       # Landing: topic input, chips, round selector, start
│   │   ├── DebateContainer.jsx   # Main debate orchestration
│   │   ├── ArgumentCard.jsx      # Single argument with sentiment bar
│   │   ├── SkeletonCard.jsx      # Loading placeholder
│   │   ├── SentimentHeatmap.jsx  # Round × side sentiment grid
│   │   └── SentimentChart.jsx    # Recharts line chart
│   └── utils/
│       ├── anthropicApi.js       # API wrapper (calls local proxy - now Groq)
│       ├── sentimentAnalysis.js  # Keyword-based sentiment scorer
│       └── debateEngine.js       # Round loop orchestration
```

## API Configuration

- **Proxy Endpoint**: http://localhost:3001/api/groq
- **Groq Endpoint**: https://api.groq.com/openai/v1/chat/completions
- **Model**: llama-3.3-70b-versatile
- **Max tokens**: 500
- **Temperature**: 0.7
- **Timeout**: 30 seconds

## How the Proxy Works

The React app calls `/api/groq` (relative path). Vite's dev server proxies this to `http://localhost:3001`. The Express server (`server.js`) receives the request, injects the `GROQ_API_KEY` from `.env`, and forwards to Groq's OpenAI-compatible API. This avoids CORS issues since the browser only talks to localhost.

## Sentiment Analysis

Simple keyword heuristic (no external NLP libraries):
- Positive keywords: benefit, improve, success, effective, opportunity, etc.
- Negative keywords: harm, damage, fail, risk, problem, oppose, etc.
- Neutral keywords: however, furthermore, consider, perspective, etc.
- Returns percentages for positive/neutral/negative (sum = 100)

## Error Handling

- API failures show inline error card with Retry button
- Empty topic prevents starting
- 30-second timeout with user-friendly message
- All errors are recoverable without page refresh
