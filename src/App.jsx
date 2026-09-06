import React, { useState } from 'react'
import DebateInput from './components/DebateInput'
import DebateContainer from './components/DebateContainer'

// Root component - switches between input screen and debate screen
export default function App() {
  const [mode, setMode] = useState('input') // 'input' | 'debate'
  const [topic, setTopic] = useState('')
  const [maxRounds, setMaxRounds] = useState(3)

  const handleStartDebate = (debateTopic, rounds) => {
    setTopic(debateTopic)
    setMaxRounds(rounds)
    setMode('debate')
  }

  const handleReset = () => {
    setMode('input')
    setTopic('')
    setMaxRounds(3)
  }

  return (
    <div className="min-h-screen bg-background font-inter">
      {mode === 'input' && (
        <DebateInput onStartDebate={handleStartDebate} />
      )}

      {mode === 'debate' && (
        <DebateContainer
          topic={topic}
          maxRounds={maxRounds}
          onReset={handleReset}
        />
      )}
    </div>
  )
}