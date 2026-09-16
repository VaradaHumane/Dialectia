import React from 'react'

// Horizontal round progress timeline
// Green = completed, indigo = active/current, dark outline = future
export default function DebateTimeline({ maxRounds, currentRound, isComplete, isClosing }) {
  const totalSteps = maxRounds + 1 // rounds + closing
  const activeStep = isComplete ? totalSteps + 1 : isClosing ? totalSteps : currentRound || 1

  const steps = []
  for (let i = 1; i <= totalSteps; i++) {
    const isClosingStep = i === totalSteps
    const completed = i < activeStep
    const active = i === activeStep
    const future = i > activeStep

    const isFor = !isClosingStep
    const label = isClosingStep ? 'Closing' : `Round ${i}`

    let circleClasses = ''
    let textClasses = ''
    let connectorClasses = ''

    if (completed) {
      circleClasses = 'bg-green-500 border-green-500 text-green-950'
      textClasses = 'text-green-400'
      connectorClasses = 'bg-green-500/70' // connector after completed step
    } else if (active) {
      circleClasses = 'bg-indigo-600 border-indigo-500 text-white ring-4 ring-indigo-500/20'
      textClasses = 'text-indigo-300'
      connectorClasses = 'bg-slate-700'
    } else {
      // future
      circleClasses = 'bg-transparent border-slate-600 text-slate-500'
      textClasses = 'text-slate-500'
      connectorClasses = 'bg-slate-800'
    }

    steps.push(
      <React.Fragment key={isClosingStep ? 'closing' : `r${i}`}>
        {i > 1 && (
          <div className={`h-0.5 flex-1 mx-2 rounded ${connectorClasses}`}></div>
        )}
        <div className="flex flex-col items-center gap-1.5 min-w-[72px]">
          <div
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 ${circleClasses} ${isFor ? '' : ''}`}
          >
            {completed ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span>{i}</span>
            )}
          </div>
          <span className={`text-[11px] font-medium uppercase tracking-wide ${textClasses}`}>{label}</span>
        </div>
      </React.Fragment>
    )
  }

  return (
    <div className="flex items-center justify-between w-full overflow-x-auto pb-1">
      <div className="flex items-center w-full min-w-max justify-around px-2">
        {steps}
      </div>
    </div>
  )
}