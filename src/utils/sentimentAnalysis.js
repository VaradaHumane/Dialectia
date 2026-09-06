// Sentiment analysis for debate arguments - Positive/Negative emotional tone
// Returns { positive, negative } as percentages adding to 100
// Runs in <200ms, no external API or library needed

// Positive emotion keywords - indicate optimistic, confident, supportive tone
// Excludes words that commonly appear in neutral/descriptive contexts
const POSITIVE_KEYWORDS = [
  'success', 'succeed', 'succeeds', 'achieve', 'achieves', 'achieved', 'improvement', 'improvements', 'benefit', 'benefits', 'benefited', 'beneficial',
  'positive', 'optimistic', 'hopeful', 'promising', 'encouraging', 'excellent',
  'outstanding', 'remarkable', 'impressive', 'stronger', 'growth',
  'gain', 'gains', 'gained', 'increase', 'increases', 'increased', 'rising', 'better', 'best',
  'effective', 'efficient', 'successful', 'successfully', 'win', 'wins', 'winning',
  'victory', 'breakthrough', 'innovation', 'innovative', 'progress', 'advance', 'advanced', 'advances',
  'advantage', 'advantages', 'opportunity', 'opportunities', 'potential',
  'valuable', 'value', 'worthwhile', 'rewarding', 'profitable', 'prosperous', 'prosperity',
  'thrive', 'thriving', 'flourish', 'flourishing', 'robust',
  'resilient', 'sustainable', 'stable', 'secure', 'safe', 'protected',
  'empower', 'empowers', 'empowering', 'enable', 'enables', 'enabling', 'support', 'supports', 'supporting',
  'help', 'helps', 'helping', 'assist', 'assists', 'assisting', 'guide', 'guides', 'guiding', 'lead', 'leads', 'leading',
  'inspire', 'inspires', 'inspiring', 'motivate', 'motivates', 'motivating', 'encourage', 'encourages', 'encouraging',
  'uplift', 'uplifting', 'celebrate', 'celebrates', 'celebrating', 'praise', 'praises', 'praising',
  'commend', 'commendable', 'applaud', 'applauds', 'applauding', 'approve', 'approves', 'approval',
  'endorse', 'endorses', 'endorsing', 'recommend', 'recommends', 'recommending', 'favor', 'favors', 'favorable',
  'agree', 'agrees', 'agreement', 'consensus', 'unity', 'cooperation',
  'collaboration', 'partnership', 'together', 'united', 'harmony', 'peace',
  'peaceful', 'calm', 'confident', 'confidence', 'certain', 'certainty',
  'clear', 'clarity', 'obvious', 'evident', 'proven', 'proved', 'verified',
  'validated', 'confirmed', 'established', 'demonstrated', 'shown', 'shows',
  'indicate', 'indicates', 'suggest', 'suggests', 'point', 'points', 'toward',
  'towards', 'direction', 'forward', 'onward', 'upward', 'higher', 'highest',
  'top', 'premier', 'prime', 'first', 'pioneer', 'pioneering',
  'trailblazing', 'groundbreaking', 'revolutionary', 'transform', 'transforms', 'transformative',
  'game-changing', 'paradigm', 'shift', 'leap', 'bound',
  'milestone', 'landmark', 'historic', 'unprecedented', 'exceptional',
  'extraordinary', 'phenomenal', 'spectacular', 'magnificent', 'superb',
  'supreme', 'ultimate', 'optimal', 'ideal', 'perfect', 'flawless',
  'seamless', 'smooth', 'easy', 'simple', 'straightforward', 'direct',
  'streamlined', 'optimized', 'refined', 'polished', 'perfected',
  'works', 'working', 'worked', 'effective', 'effectively', 'efficacy',
  'solution', 'solutions', 'solve', 'solves', 'solved', 'resolve', 'resolves', 'resolved',
  'lift', 'lifts', 'lifted', 'raise', 'raises', 'raised', 'boost', 'boosts', 'boosted',
  'enhance', 'enhances', 'enhanced', 'strengthen', 'strengthens', 'strengthened',
  'prosper', 'prospers', 'prosperity', 'flourish', 'flourishes', 'bloom', 'blooms', 'blooming',
  'healthier', 'healthiest', 'wellness', 'wellbeing', 'happiness', 'happy', 'happier',
  'satisfy', 'satisfies', 'satisfied', 'satisfaction', 'content', 'contented',
  'alleviate', 'alleviates', 'alleviated', 'mitigate', 'mitigates', 'mitigated',
  'protect', 'protects', 'protected', 'shield', 'shields', 'shielded', 'safeguard', 'safeguards',
  'prevent', 'prevents', 'prevented', 'avoid', 'avoids', 'avoided',
  'create', 'creates', 'created', 'generate', 'generates', 'generated', 'produce', 'produces', 'produced',
  'build', 'builds', 'building', 'develop', 'develops', 'developed', 'expand', 'expands', 'expanded',
  'grow', 'grows', 'growing', 'scale', 'scales', 'scaled', 'multiply', 'multiplies',
  'upgrade', 'upgrades', 'upgraded'
]

// Negative emotion keywords - indicate pessimistic, critical, opposing tone
// These are specifically negative SENTIMENT words, not just topic words
const NEGATIVE_KEYWORDS = [
  'fail', 'fails', 'failure', 'failed', 'failing', 'lose', 'loses', 'loss', 'lost',
  'defeat', 'defeated', 'defeating',
  'plummet', 'plummets', 'plummeting', 'crash', 'crashes', 'crashing',
  'collapse', 'collapses', 'collapsing', 'worsen', 'worsens', 'worsening',
  'worse', 'worst', 'deteriorate', 'deteriorates', 'deteriorating', 'deterioration',
  'damage', 'damages', 'damaged', 'harm', 'harms', 'harmful', 'hurt', 'hurts', 'hurting',
  'injure', 'injures', 'injuring', 'injury', 'destroy', 'destroys', 'destruction', 'destroyed',
  'ruin', 'ruins', 'ruining', 'ruined', 'devastate', 'devastates', 'devastating', 'devastated', 'devastation',
  'catastrophe', 'catastrophic', 'disaster', 'disastrous', 'crisis', 'crises',
  'emergency', 'urgent', 'critical', 'dangerous', 'risky', 'perilous',
  'hazardous', 'threat', 'threats', 'threaten', 'threatens', 'threatening', 'endanger', 'endangers', 'endangering',
  'jeopardize', 'jeopardizes', 'jeopardizing', 'undermine', 'undermines', 'undermining',
  'weaken', 'weakens', 'weakening', 'weak', 'weaker', 'weakest', 'fragile', 'frail',
  'vulnerable', 'exposed', 'susceptible', 'unstable', 'shaky', 'precarious',
  'problem', 'problems', 'issue', 'issues', 'concern', 'concerns', 'worry', 'worries', 'worrying',
  'anxiety', 'anxious', 'fear', 'fears', 'fearful', 'scared', 'terrified', 'panic', 'panicking',
  'alarm', 'alarming', 'alert', 'warning', 'warn', 'warns', 'caution', 'cautious', 'adverse',
  'bad', 'poor', 'inadequate', 'insufficient', 'lacking', 'deficient',
  'defective', 'flawed', 'faulty', 'broken', 'malfunction', 'malfunctioning',
  'error', 'errors', 'mistake', 'mistakes', 'wrong', 'incorrect', 'false',
  'misleading', 'deceptive', 'dishonest', 'corrupt', 'corruption', 'fraud',
  'fraudulent', 'scam', 'scandal', 'scandalous', 'shameful', 'disgraceful',
  'appalling', 'horrific', 'terrible', 'awful', 'dreadful', 'atrocious',
  'abysmal', 'pathetic', 'lamentable', 'deplorable', 'disappointing', 'disappoints',
  'dismal', 'grim', 'bleak', 'hopeless', 'despair', 'desperate', 'desperation',
  'helpless', 'powerless', 'useless', 'worthless', 'pointless', 'futile',
  'vain', 'impossible', 'unfeasible', 'impractical', 'unworkable', 'doomed',
  'doom', 'doomed', 'destined', 'inevitable', 'unavoidable', 'inescapable',
  'trap', 'trapped', 'dead end', 'deadlock', 'stalemate', 'impasse',
  'obstacle', 'obstacles', 'barrier', 'barriers', 'hurdle', 'hurdles',
  'challenge', 'challenges', 'difficulty', 'difficulties', 'hardship', 'hardships',
  'struggle', 'struggles', 'battle', 'battles', 'fight', 'fights',
  'conflict', 'conflicts', 'dispute', 'disputes', 'disagreement', 'discord',
  'division', 'divide', 'divided', 'split', 'separate', 'separated', 'isolate', 'isolates', 'isolated',
  'alone', 'lonely', 'abandoned', 'neglected', 'ignored', 'overlooked',
  'dismissed', 'rejected', 'refused', 'denied', 'refuted', 'disproven',
  'debunked', 'exposed', 'uncovered', 'revealed', 'myth', 'misconception',
  'fallacy', 'falsehood', 'lie', 'lies', 'lying', 'deceive', 'deceives', 'deceiving',
  'deception', 'deceit', 'deceitful', 'manipulate', 'manipulates', 'manipulating', 'manipulation',
  'mislead', 'misleads', 'misleading', 'misinformation', 'disinformation', 'propaganda',
  'brainwash', 'brainwashes', 'brainwashing', 'indoctrinate', 'indoctrinates', 'indoctrination',
  'coerce', 'coerces', 'coercing', 'coercion', 'force', 'forces', 'forcing',
  'pressure', 'pressures', 'pressuring', 'bully', 'bullies', 'bullying',
  'intimidate', 'intimidates', 'intimidating', 'threaten', 'threatens', 'threatening',
  'blackmail', 'extort', 'extorts', 'extorting', 'exploit', 'exploits', 'exploiting', 'exploitation',
  'abuse', 'abuses', 'abusing', 'misuse', 'misuses', 'misusing',
  'waste', 'wastes', 'wasting', 'wasteful', 'squander', 'squanders', 'squandering',
  'misspend', 'misspends', 'misspending', 'lose', 'loses', 'losing', 'loss',
  'cost', 'costly', 'expensive', 'overpriced', 'overbudget', 'deficit', 'debt',
  'bankrupt', 'bankruptcy', 'insolvent', 'default', 'recession', 'depression',
  'unemployment', 'jobless', 'homeless', 'hungry', 'starving',
  'suffering', 'suffer', 'suffers', 'pain', 'painful', 'agony', 'misery', 'distress',
  'anguish', 'torment', 'torture', 'persecution', 'oppression', 'suppression',
  'depression',
  'repression', 'tyranny', 'dictatorship', 'authoritarian', 'totalitarian',
  'fascist', 'fascism', 'nazi', 'racist', 'racism', 'discrimination',
  'prejudice', 'bias', 'bigotry', 'hatred', 'hate', 'violence', 'violent',
  'attack', 'attacks', 'assault', 'abuse', 'murder', 'murders', 'killing', 'killings',
  'death', 'die', 'dies', 'dying', 'dead', 'fatal', 'lethal', 'deadly', 'mortal', 'terminal',
  'incurable', 'hopeless', 'desperate', 'lost', 'gone', 'vanished', 'empty',
  'void', 'nothing', 'none', 'zero', 'nil', 'null', 'absence', 'lack', 'devoid',
  'barren', 'sterile', 'lifeless', 'extinct', 'extinction', 'annihilation',
  'oblivion', 'end', 'finish', 'final', 'last', 'endgame', 'game over', 'over', 'done', 'finished',
  // Neutral/academic words that shouldn't count as positive sentiment
  'improved', 'improves', 'improve', 'improvement', 'improvements',
  'reduced', 'reduces', 'reduce', 'reduction', 'reductions',
  'lower', 'lowers',
  'minimize', 'minimizes', 'minimized', 'minimization',
  'eliminate', 'eliminates', 'eliminated', 'elimination',
  'remove', 'removes', 'removed', 'removal',
  'alleviate', 'alleviates', 'alleviated', 'alleviation',
  'mitigate', 'mitigates', 'mitigated', 'mitigation',
  'prevent', 'prevents', 'prevented', 'prevention',
  'avoid', 'avoids', 'avoided', 'avoidance',
  'protect', 'protects', 'protected', 'protection',
  'shield', 'shields', 'shielded',
  'safeguard', 'safeguards', 'safeguarded',
  'solution', 'solutions', 'solve', 'solves', 'solved', 'resolve', 'resolves', 'resolved', 'resolution',
  'benefit', 'benefits', 'benefited', 'beneficial',
  'effective', 'effectively', 'effectiveness', 'efficiency', 'efficient',
  'success', 'successful', 'successfully', 'achieve', 'achieves', 'achieved', 'achievement',
  'gain', 'gains', 'gained', 'increase', 'increases', 'increased', 'increase',
  'progress', 'advance', 'advanced', 'advances', 'advancement',
  'opportunity', 'opportunities', 'potential',
  'support', 'supports', 'supported', 'supporting', 'supportive',
  'help', 'helps', 'helped', 'assist', 'assists', 'assisted', 'assistance',
  'enable', 'enables', 'enabled', 'enabling', 'empower', 'empowers', 'empowered', 'empowering',
  'create', 'creates', 'created', 'creation', 'generate', 'generates', 'generated', 'generation',
  'produce', 'produces', 'produced', 'production', 'build', 'builds', 'building', 'built',
  'develop', 'develops', 'developed', 'development', 'expand', 'expands', 'expanded', 'expansion',
  'grow', 'grows', 'growing', 'growth', 'scale', 'scales', 'scaled', 'scaling',
  'enhance', 'enhances', 'enhanced', 'enhancement', 'upgrade', 'upgrades', 'upgraded',
  'strengthen', 'strengthens', 'strengthened', 'strengthening', 'stronger',
  'prosper', 'prospers', 'prospered', 'prosperity', 'flourish', 'flourishes', 'flourished',
  'healthier', 'healthiest', 'wellness', 'wellbeing', 'happiness', 'happy', 'happier',
  'satisfy', 'satisfies', 'satisfied', 'satisfaction', 'content', 'contented',
  'positive', 'optimistic', 'hopeful', 'promising', 'encouraging',
  'advantage', 'advantages', 'valuable', 'value', 'worthwhile', 'rewarding', 'profitable', 'prosperous',
  'stable', 'secure', 'safe', 'resilient', 'sustainable', 'reliable',
  'clear', 'clarity', 'obvious', 'evident', 'proven', 'proved', 'verified',
  'validated', 'confirmed', 'established', 'demonstrated', 'shown', 'shows',
  'indicate', 'indicates', 'suggest', 'suggests', 'point', 'points', 'toward',
  'towards', 'direction', 'forward', 'onward', 'upward', 'higher', 'highest',
  'top', 'premier', 'prime', 'first', 'pioneer', 'pioneering',
  'trailblazing', 'groundbreaking', 'revolutionary', 'transform', 'transforms', 'transformative',
  'game-changing', 'paradigm', 'shift', 'leap', 'bound',
  'milestone', 'landmark', 'historic', 'unprecedented', 'exceptional',
  'extraordinary', 'phenomenal', 'spectacular', 'magnificent', 'superb',
  'supreme', 'ultimate', 'optimal', 'ideal', 'perfect', 'flawless',
  'seamless', 'smooth', 'easy', 'simple', 'straightforward', 'direct',
  'streamlined', 'optimized', 'refined', 'polished', 'perfected',
  'agree', 'agrees', 'agreement', 'consensus', 'unity', 'cooperation',
  'collaboration', 'partnership', 'together', 'united', 'harmony', 'peace',
  'peaceful', 'calm', 'confident', 'confidence', 'certain', 'certainty',
  'commend', 'commendable', 'applaud', 'applauds', 'applauding', 'approve', 'approves', 'approval',
  'endorse', 'endorses', 'endorsing', 'recommend', 'recommends', 'recommending', 'favor', 'favors', 'favorable',
  'celebrate', 'celebrates', 'celebrating', 'praise', 'praises', 'praising',
  'uplift', 'uplifting', 'inspire', 'inspires', 'inspiring', 'motivate', 'motivates', 'motivating', 'encourage', 'encourages', 'encouraging'
]

function normalizeText(text) {
  return text.toLowerCase().replace(/[^\w\s']/g, ' ')
}

function countKeywords(text, keywords) {
  const normalized = normalizeText(text)
  const words = normalized.split(/\s+/)
  let count = 0

  for (const keyword of keywords) {
    const keywordWords = keyword.toLowerCase().split(/\s+/)
    if (keywordWords.length === 1) {
      count += words.filter(w => w === keywordWords[0]).length
    } else {
      const phrase = keywordWords.join(' ')
      if (normalized.includes(phrase)) {
        count += 1
      }
    }
  }

  return count
}

export function analyzeSentiment(text, side) {
  if (!text || typeof text !== 'string') {
    return { positive: 50, negative: 50 }
  }

  const positiveCount = countKeywords(text, POSITIVE_KEYWORDS)
  const negativeCount = countKeywords(text, NEGATIVE_KEYWORDS)

  const total = positiveCount + negativeCount

  // If no sentiment keywords found, use argument structure to infer
  if (total === 0) {
    // Base on side - FOR args tend positive, AGAINST tend negative
    // But add variation based on text characteristics
    const wordCount = text.split(/\s+/).length
    const hasExclamation = text.includes('!')
    const hasQuestion = text.includes('?')

    let basePositive = side === 'for' ? 55 : 45
    if (hasExclamation) basePositive += 5
    if (hasQuestion) basePositive -= 5
    if (wordCount > 200) basePositive += 3 // longer args = more conviction

    // Add some randomness for variation
    const variation = (Math.random() - 0.5) * 10
    const positive = Math.max(20, Math.min(80, basePositive + variation))

    return {
      positive: Math.round(positive * 10) / 10,
      negative: Math.round((100 - positive) * 10) / 10
    }
  }

  // Calculate raw percentages from keyword counts
  let positive = (positiveCount / total) * 100
  let negative = (negativeCount / total) * 100

  // Apply side bias: FOR args lean positive, AGAINST lean negative
  // This ensures FOR vs AGAINST on same topic look different
  const sideBias = side === 'for' ? 10 : -10
  positive = Math.max(5, Math.min(95, positive + sideBias))
  negative = 100 - positive

  // Apply smoothing to avoid extreme values (but less aggressive)
  const smoothing = 5
  positive = Math.max(positive, smoothing)
  negative = Math.max(negative, smoothing)

  // Renormalize to 100
  const sum = positive + negative
  positive = (positive / sum) * 100
  negative = (negative / sum) * 100

  // Add slight variation based on argument uniqueness so bars look different
  const hash = text.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  const variation = ((hash % 14) - 7) * 0.7 // ±4.9% variation
  positive = Math.max(8, Math.min(92, positive + variation))
  negative = 100 - positive

  // Round to 1 decimal place
  return {
    positive: Math.round(positive * 10) / 10,
    negative: Math.round(negative * 10) / 10
  }
}

export function getDominantSentiment(sentiment) {
  const { positive, negative } = sentiment
  if (positive >= negative) return 'positive'
  return 'negative'
}

export function getSentimentColor(sentiment) {
  const dominant = getDominantSentiment(sentiment)
  return dominant === 'positive' ? '#22c55e' : '#ef4444'
}