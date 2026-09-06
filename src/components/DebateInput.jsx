import React, { useState } from 'react'

// Landing screen: topic input, chips, round selector, start button
export default function DebateInput({ onStartDebate }) {
  const [topic, setTopic] = useState('')
  const [rounds, setRounds] = useState(3)
  const [error, setError] = useState('')

  const exampleTopics = [
    'AI in Education',
    'Climate Policy',
    'Remote Work',
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = topic.trim()
    if (!trimmed) {
      setError('Please enter a debate topic')
      return
    }
    if (trimmed.length < 5) {
      setError('Topic must be at least 5 characters')
      return
    }
    setError('')
    onStartDebate(trimmed, rounds)
  }

  const handleChipClick = (exampleTopic) => {
    setTopic(exampleTopic)
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Gradient border card */}
        <div className="gradient-border p-8">
          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-white mb-3">
              AI Debate Arena
            </h1>
            <p className="text-slate-400 text-lg">
              Two AI agents. One topic. Real-time sentiment.
            </p>
          </div>

          {/* Topic input form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Text input */}
            <div>
              <label htmlFor="topic" className="sr-only">Debate topic</label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value)
                  if (error) setError('')
                }}
                placeholder="Enter a debate topic..."
                className="w-full px-5 py-4 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-400" role="alert">{error}</p>
              )}
            </div>

            {/* Example topic chips */}
            <div>
              <p className="text-sm text-slate-500 mb-3">Or try an example:</p>
              <div className="flex flex-wrap gap-2">
                {exampleTopics.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => handleChipClick(example)}
                    className="px-4 py-2 rounded-full border border-slate-600 bg-slate-800/50 text-slate-300 text-sm font-medium hover:bg-slate-700/50 hover:border-slate-500 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Round selector */}
            <div>
              <label className="block text-sm text-slate-400 mb-3">Number of Rounds</label>
              <div className="flex gap-2" role="radiogroup" aria-label="Number of debate rounds">
                {[3, 5, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRounds(num)}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                      rounds === num
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                        : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-700/50 hover:text-slate-200'
                    }`}
                    role="radio"
                    aria-checked={rounds === num}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Debate button */}
            <button
              type="submit"
              disabled={!topic.trim()}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                topic.trim()
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              Start Debate
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}