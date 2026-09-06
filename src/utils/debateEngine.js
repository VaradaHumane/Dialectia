// Debate engine - orchestrates the round loop

import { callAnthropic, buildForPrompt, buildAgainstPrompt, buildClosingPrompt } from './anthropicApi'
import { analyzeSentiment } from './sentimentAnalysis'

// 5 second delay between API calls to avoid 429 rate limits
const API_CALL_DELAY = 5000
// Small delay before displaying parallel arguments
const DISPLAY_DELAY = 2500

export async function runDebateRound(
  topic,
  round,
  maxRounds,
  forHistory,
  againstHistory,
  onForArgument,
  onAgainstArgument,
  onError
) {
  try {
    // Run FOR and AGAINST API calls in parallel
    const forPrompt = buildForPrompt(
      topic,
      round,
      maxRounds,
      forHistory,
      againstHistory[againstHistory.length - 1] || null
    )

    const againstPrompt = buildAgainstPrompt(
      topic,
      round,
      maxRounds,
      againstHistory,
      forHistory.length > 0 ? forHistory[forHistory.length - 1] : null
    )

    const [forArgument, againstArgument] = await Promise.all([
      callAnthropic(forPrompt, 'Present your argument.'),
      callAnthropic(againstPrompt, 'Present your argument.')
    ])

    const forSentiment = analyzeSentiment(forArgument, 'for')
    const againstSentiment = analyzeSentiment(againstArgument, 'against')

    // Small delay before displaying so they appear together
    await new Promise(resolve => setTimeout(resolve, DISPLAY_DELAY))

    onForArgument({
      round,
      side: 'for',
      argument: forArgument,
      sentiment: forSentiment,
      timestamp: Date.now()
    })

    onAgainstArgument({
      round,
      side: 'against',
      argument: againstArgument,
      sentiment: againstSentiment,
      timestamp: Date.now()
    })

    return { success: true }
  } catch (error) {
    onError(error.message)
    return { success: false, error: error.message }
  }
}

export async function runFullDebate(
  topic,
  maxRounds,
  callbacks
) {
  const { onRoundStart, onForArgument, onAgainstArgument, onRoundComplete, onError, onComplete, onClosingStatement } = callbacks

  const forHistory = []
  const againstHistory = []
  const allArguments = []

  for (let round = 1; round <= maxRounds; round++) {
    onRoundStart(round)

    const result = await runDebateRound(
      topic,
      round,
      maxRounds,
      forHistory,
      againstHistory,
      (arg) => {
        forHistory.push(arg.argument)
        allArguments.push(arg)
        onForArgument(arg)
      },
      (arg) => {
        againstHistory.push(arg.argument)
        allArguments.push(arg)
        onAgainstArgument(arg)
      },
      onError
    )

    if (!result.success) {
      return { success: false, arguments: allArguments }
    }

    onRoundComplete(round)

    // 5 second delay between rounds to avoid Groq rate limits
    if (round < maxRounds) {
      await new Promise(resolve => setTimeout(resolve, API_CALL_DELAY))
    }
  }

  // Closing statements round (round maxRounds + 1)
  onRoundStart(maxRounds + 1)

  try {
    // FOR and AGAINST closing statements in parallel
    const forClosingPrompt = buildClosingPrompt(topic, 'for', forHistory, againstHistory)
    const againstClosingPrompt = buildClosingPrompt(topic, 'against', againstHistory, forHistory)

    const [forClosing, againstClosing] = await Promise.all([
      callAnthropic(forClosingPrompt, 'Present your closing statement.'),
      callAnthropic(againstClosingPrompt, 'Present your closing statement.')
    ])

    const forClosingSentiment = analyzeSentiment(forClosing, 'for')
    const againstClosingSentiment = analyzeSentiment(againstClosing, 'against')

    // Small delay before displaying closing statements
    await new Promise(resolve => setTimeout(resolve, DISPLAY_DELAY))

    // Emit closing statements via the regular callbacks so they appear in cards
    onForArgument({
      round: maxRounds + 1,
      side: 'for',
      argument: forClosing,
      sentiment: forClosingSentiment,
      timestamp: Date.now(),
      isClosing: true
    })

    onAgainstArgument({
      round: maxRounds + 1,
      side: 'against',
      argument: againstClosing,
      sentiment: againstClosingSentiment,
      timestamp: Date.now(),
      isClosing: true
    })

    allArguments.push(
      { round: maxRounds + 1, side: 'for', argument: forClosing, sentiment: forClosingSentiment, timestamp: Date.now(), isClosing: true },
      { round: maxRounds + 1, side: 'against', argument: againstClosing, sentiment: againstClosingSentiment, timestamp: Date.now(), isClosing: true }
    )

  } catch (error) {
    onError(error.message)
    return { success: false, arguments: allArguments }
  }

  onComplete(allArguments)
  return { success: true, arguments: allArguments }
}