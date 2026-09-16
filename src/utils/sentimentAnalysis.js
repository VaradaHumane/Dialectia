// Sentiment analysis for debate arguments - Positive/Negative emotional tone
// Measures the RHETORICAL FRAMING of the argument itself, not which side of the
// policy it takes. An AGAINST argument that is written positively reads positive;
// a Supporting argument that catalogs harms reads negative. No side is hard-coded.
//
// Method: counts framing signals — language that casts outcomes as good (benefits,
// solutions, progress, savings) versus bad (costs, losses, failures, risks) — and
// resolves context that naive word counting gets wrong:
//   - direction: "cut emissions" (good) vs "cut GDP growth" (bad)
//   - negation:  "does not improve", "no benefit"
//   - minimizers: "fell only 4%", "just 0.5%"  (achievement cast as a shortfall)
//
// The `side` argument is intentionally NOT used.
//
// Runs in <200ms, no external API or library needed.

// ---- Words that cast outcomes as GOOD ----
// (economic terms like increase/growth/rise are handled contextually below,
//  NOT listed here, because "prices rise" and "job growth" point opposite ways)
const BENEFIT_FRAMING = [
  'benefit', 'benefits', 'benefited', 'beneficial',
  'improve', 'improves', 'improved', 'improving', 'improvement', 'improvements',
  'boost', 'boosts', 'boosted', 'strengthen', 'strengthens', 'strengthened',
  'enhance', 'enhances', 'enhanced', 'reinforce', 'reinforces', 'reinforced',
  'advantage', 'advantages', 'opportunity', 'opportunities',
  'solution', 'solutions', 'solve', 'solves', 'solved', 'resolve', 'resolves', 'resolved',
  'progress', 'achievement', 'achieve', 'achieves', 'achieved', 'success', 'successful', 'succeed', 'succeeds',
  'gain', 'gains', 'gained', 'empower', 'empowers', 'empowered', 'empowerment',
  'enable', 'enables', 'enabled', 'protect', 'protects', 'protected', 'protection',
  'safeguard', 'safeguards', 'resilient', 'resilience',
  'thrive', 'thriving', 'flourish', 'flourishing', 'promising', 'innovative', 'innovation', 'breakthrough',
  'essential', 'crucial', 'vital', 'pivotal', 'indispensable', 'worthwhile', 'valuable',
  'invest', 'invests', 'invested', 'investment', 'investments',
  'create', 'creates', 'created', 'creating', 'creation', 'creations'
]

// ---- Words that cast outcomes as BAD ----
// (bare loss/losses are NOT here — see LOSS_PHRASES, so that "avert that loss"
//  is credited as good while "net job losses" still reads as a harm)
const HARM_FRAMING = [
  // losses & damage. Bare damage/damages is NOT here (see DAMAGE_PHRASES and
  // HARMFUL_IF_RISING) — "averts $3.2T in damages" must read as a credit.
  'unemployment', 'downturn', 'recession', 'contraction',
  'collapse', 'collapses', 'collapsed', 'crisis', 'crises',
  'harm', 'harms', 'harmful', 'hurt', 'hurts', 'hurting', 'undermine', 'undermines', 'undermined',
  'weaken', 'weakens', 'weakened', 'erode', 'erodes', 'eroded', 'deteriorate', 'deteriorates',
  'worsen', 'worsens', 'worsened', 'displace', 'displaces', 'displaced', 'displacement',
  'devastate', 'devastates', 'devastating', 'devastated', 'destroy', 'destroys', 'destroyed', 'destroying',
  'destruction', 'disaster', 'disastrous', 'catastrophic',
  // failure / inadequacy
  'fail', 'fails', 'failed', 'failure', 'ineffective', 'inefficiency', 'inefficient',
  'insufficient', 'inadequate', 'shortfall', 'shortcomings', 'drawback', 'drawbacks',
  'downside', 'downsides', 'disappoint', 'disappoints', 'disappointing', 'letdown',
  'miss', 'misses', 'missed', 'unmet',
  // threats & risks
  'risk', 'risks', 'risky', 'threat', 'threats', 'threaten', 'threatens', 'threatened',
  'danger', 'dangerous', 'hazard', 'hazards', 'hazardous', 'adverse', 'jeopardize', 'jeopardizes',
  'endanger', 'endangers', 'undercut', 'undercuts', 'suffer', 'suffers', 'suffered',
  // imposition (policies forcing burdens — a bare "mandate" is not negative)
  'impose', 'imposes', 'imposed', 'forced', 'forces', 'forcing',
  'saddle', 'saddled', 'strain', 'strains', 'strain', 'drain', 'drains', 'drained',
  'burden', 'burdens', 'burdened', 'expensive', 'deficit', 'deficits', 'debt', 'debts',
  'bankrupt', 'bankruptcy', 'insolvent',
  // challenging the other side's case
  'baseless', 'dubious', 'questionable', 'unfounded', 'misleading', 'exaggerated', 'overstated',
  'flawed', 'contradict', 'contradicts', 'contradicted', 'ignores', 'ignored', 'overlook', 'overlooked',
  'neglect', 'neglects', 'neglected', 'disregard', 'disregards', 'distorts', 'distorted', 'cherry-picks'
]

// Specific loss phrases that are unambiguously HARMFUL — so that "avert that loss"
// is credited as good (via CUT_VERBS + HARMFUL_IF_RISING) while "net job losses"
// still reads as a harm.
const LOSS_PHRASES = [
  'job losses', 'job loss', 'net job losses', 'net job loss', 'net losses', 'net loss',
  'economic losses', 'economic loss', 'financial loss', 'financial losses',
  'gdp loss', 'gdp losses', 'output loss', 'output losses', 'production losses',
  'lost jobs', 'lost growth', 'lost income', 'lost wages', 'lost output',
  'loss of jobs', 'loss of income', 'loss of growth', 'loss of output',
  'billion dollar losses', 'million dollar losses'
]

// Harmful damage phrasing (as opposed to damage that is averted, which reads
// as a credit via "averts … damages" in CUT_VERBS + HARMFUL_IF_RISING).
const DAMAGE_PHRASES = [
  'cause damage', 'causes damage', 'caused damage', 'causing damage',
  'inflict damage', 'inflicts damage', 'inflicted damage', 'inflicting damage',
  'economic damage', 'economic damages', 'environmental damage', 'environmental damages',
  'structural damage', 'infrastructure damage', 'property damage', 'collateral damage',
  'severe damage', 'severe damages', 'major damage', 'massive damage',
  'damage caused', 'damages caused', 'damage growth', 'damages growth', 'damaging growth',
  'damage the economy', 'damages the economy', 'damaging the economy',
  'damage economic growth', 'damage jobs', 'damages jobs', 'damage gdp'
]

// ---- Directional verbs. Their valence depends on WHAT they act on. ----
const RAISE_VERBS = [
  'increase', 'increases', 'increased', 'increasing', 'rise', 'rises', 'rose', 'rising',
  'raise', 'raises', 'raised', 'raising', 'up', 'higher', 'grow', 'grew', 'growing', 'grown',
  'surge', 'surging', 'spike', 'spiked', 'soar', 'soars', 'soaring',
  'push', 'pushes', 'pushed', 'lift', 'lifts', 'lifted', 'spur', 'spurs', 'spurred', 'spurring'
]
const CUT_VERBS = [
  'reduce', 'reduces', 'reduced', 'reducing', 'reduction', 'cut', 'cuts', 'cutting',
  'slash', 'slashes', 'slashed', 'lower', 'lowers', 'lowered', 'drop', 'drops', 'dropped',
  'fall', 'falls', 'fell', 'fallen', 'decline', 'declines', 'declined',
  'mitigate', 'mitigates', 'mitigated', 'alleviate', 'alleviates', 'alleviated',
  'prevent', 'prevents', 'prevented', 'avert', 'averts', 'averted', 'avoid', 'avoids', 'avoided',
  'save', 'saves', 'saved', 'eliminate', 'eliminates', 'eliminated', 'curb', 'curbs', 'curbed',
  // closing/removing a harmful object is good ("close the gap", "address the risk")
  'close', 'closes', 'closed', 'closing', 'address', 'addresses', 'addressed', 'addressing'
]

// Raising these is BAD (pollution, emissions, costs, prices...). Cutting them is GOOD.
const HARMFUL_IF_RISING = [
  'emission', 'emissions', 'carbon', 'co2', 'greenhouse', 'gases', 'pollution', 'waste',
  'price', 'prices', 'cost', 'costs', 'bill', 'bills', 'tax', 'taxes', 'premium', 'premiums',
  'debt', 'debts', 'deficit', 'deficits', 'inflation', 'unemployment', 'poverty', 'inequality',
  'risk', 'risks', 'harm', 'deaths', 'mortality', 'disease', 'illness', 'illnesses', 'accident', 'accidents',
  'coal', 'fossil', 'burden', 'burdens', 'loss', 'losses', 'damage', 'damages', 'damaged',
  // burdens worth cutting / bad to raise: workload, penalties, shortfalls ("the gap")
  // (NOT 'fine' — it is a substring of "confidence/define/refined"; "eliminating
  //  the fine risk" is already credited via the 'risk' object)
  'workload', 'penalty', 'gap'
]

// Raising these is GOOD (jobs, output, wages...). Cutting them is BAD.
const WORTH_IF_RISING = [
  'growth', 'gdp', 'output', 'jobs', 'employment', 'wage', 'wages', 'income', 'incomes',
  'investment', 'investments', 'production', 'economy', 'economic', 'productivity',
  'standard of living', 'living standards', 'wealth', 'salaries', 'savings',
  // educational achievement — "rise in test scores / mastery" is good news
  // (NOT 'grade' — it is a substring of "degraded/degrade", which must stay harmful)
  'score', 'mastery'
]

// Negation / blocked-benefit phrases — "does not improve" reads as a criticism.
const NEGATED_FRAMING = [
  'no benefit', 'no benefits', 'not benefit', 'does not improve', 'did not improve',
  'does not help', 'did not help', 'no help', 'fails to', 'fail to', 'failed to',
  'unable to', 'cannot', 'can t', 'won t', 'would not', 'without', 'lack of', 'lacks',
  'no solution', 'no solutions', 'no progress', 'does not work', 'did not work',
  'doesn t work', 'not effective', 'no improvement', 'nothing to show', 'fall short',
  'fell short', 'falls short', 'has not', 'have not', 'has not delivered',
  'has yet to', 'is yet to', 'yet to generate', 'yet to deliver', 'yet to produce',
  'yet to yield', 'no such', 'no real', 'no actual', 'does not deliver', 'did not deliver',
  'without benefit', 'without any benefit', 'without progress'
]

// Clause-level negation tokens — a "cut" that is negated ("no such reduction")
// is a criticism, not a credit. Also used to invert a raise-of-worth claim that
// is paired with harm ("a rise that erodes GDP" is not good news).
const NEG_TOKENS = [
  'no', 'not', 'never', 'without', 'nor', 'neither', 'yet to', 'belies', 'fails to',
  'fail to', 'failed to', 'has not', 'have not', 'did not', 'does not', 'do not',
  'don t', 'doesn t', 'didn t', 'won t', 'would not', 'cannot', 'can t', 'unable',
  'lacks', 'lack of', 'absent', 'instead of', 'rather than',
  // a claimed gain that was "lost significance" is an undercut, not a win
  // (NOT 'lose'/'loses' — both are substrings of "closes/closed", which are good verbs)
  'lost'
]

// Shortfall minimizers — "only 4%", "merely 0.5%" downplay a claimed result.
const MINIMIZER_RE = /\b(?:only|merely|just|barely|scarcely)\s+[£$€]?\s*\d[\d.,]*%?\b/g

// Adversative pivots — "yet emissions fell only 4%" frames a downside.
const ADVERSATIVE_RE = /\b(?:yet|however|but|although|though|despite|whereas|nevertheless|nonetheless|meanwhile)\b/g

function normalizeText(text) {
  // Fold unicode that appears a lot in economic/climate prose: sub/superscript
  // digits ("CO₂", "H₂O", "30 %"), the degree sign ("3 °C"), typographic quotes.
  return text
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[₂₁₃₄₀-₉]/g, ch => ch.normalize('NFKD').replace(/[₀-₉]/g, d => d.charCodeAt(0) - 0x2080))
    .replace(/[⁰-⁹]/g, ch => ch.normalize('NFKD').replace(/[⁰-⁹]/g, d => '0123456789'[d.charCodeAt(0) - 0x2070] || d))
    .replace(/°/g, ' ')
    .replace(/—/g, ' ')
}

// Count stem + common inflections (s, es, ed, ing) with word boundaries.
// Dedupes by character position so a single occurrence of e.g. "fails" is not
// counted separately for the list entries "fail" and "fails".
function countStems(text, stems) {
  const matched = new Set()
  for (const stem of stems) {
    const esc = stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`\\b${esc}(?:s|es|d|ed|ing|ions)?\\b`, 'g')
    let m
    while ((m = re.exec(text)) !== null) matched.add(m.index)
  }
  return matched.size
}

// Count how many times any of a set of phrases appears in the text.
function countPhrases(text, phrases) {
  let count = 0
  for (const phrase of phrases) {
    if (text.includes(phrase)) count += 1
  }
  return count
}

// For each clause that pairs a directional verb with a target object, detect
// whether the claim is negated/undercut and hand back credits to the positive
// and negative sides accordingly. `extraFlips` are substrings that also invert
// the claim (e.g. harm words next to "rise" turn a rise-of-worth into bad news).
function contextualValence(text, verbs, objects, extraFlips = []) {
  let posHits = 0
  let negHits = 0
  // Whole-word match (both boundaries) so a stem like `grow` does not match
  // the noun `growth`, and `up` does not match `upgrade`.
  const verbsRe = new RegExp(`\\b(?:${verbs.map(v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`)
  // Clause boundaries: punctuation, or a coordinating "and" so that
  // "lower household bills and spur employment" binds each verb to its own object.
  const clauses = text.split(/[.!?;—,:(]|\s+and\s+/)
  for (const clause of clauses) {
    if (!verbsRe.test(clause)) continue
    if (!objects.some(obj => clause.includes(obj))) continue
    const flipped = [...NEG_TOKENS, ...extraFlips].some(tok => clause.includes(tok))
    if (flipped) negHits += 1
    else posHits += 1
  }
  return { posHits, negHits }
}

// Count negation phrases (each costs the author a positive signal).
function countNegated(text, phrases) {
  let count = 0
  for (const phrase of phrases) {
    const idx = text.indexOf(phrase)
    if (idx !== -1) count += 1
  }
  return count
}

export function analyzeSentiment(text, side) {
  if (!text || typeof text !== 'string') {
    return { positive: 50, negative: 50 }
  }

  const t = normalizeText(text)
  const lossPhraseCount = countPhrases(t, LOSS_PHRASES)
  const damagePhraseCount = countPhrases(t, DAMAGE_PHRASES)

  // Objects that are bad to raise / good to cut. HARMFUL_IF_RISING covers the
  // everyday targets (emissions, prices, bills...); HARM_FRAMING words in a
  // "cut/reduce/prevent/avert X" claim read as good ("prevent collapse",
  // "reduce catastrophic events").
  const harmfulObjects = [...HARMFUL_IF_RISING, ...HARM_FRAMING]

  // Raised/cut claims whose object determines the valence.
  const cutHarm = contextualValence(t, CUT_VERBS, harmfulObjects)         // cut emissions = good; "no such reduction" = bad
  const raiseWorth = contextualValence(t, RAISE_VERBS, WORTH_IF_RISING)  // job growth = good; "rise that erodes GDP" = bad
  const cutWorth = contextualValence(t, CUT_VERBS, WORTH_IF_RISING)      // cut GDP = bad
  const raiseHarm = contextualValence(t, RAISE_VERBS, harmfulObjects)    // prices up = bad; "didn't spike" = good

  // Positive framing
  const benefitCount = countStems(t, BENEFIT_FRAMING)
  let positiveSignals =
    benefitCount +
    cutHarm.posHits +      // cutting a harmful thing (emissions, costs) = good
    raiseWorth.posHits +   // growing a worthy thing (jobs, output) = good
    cutWorth.negHits +     // NOT cutting jobs/output = good
    raiseHarm.negHits      // prices NOT going up = good

  // Negative framing
  const harmCount = countStems(t, HARM_FRAMING)
  const minimizerCount = (t.match(MINIMIZER_RE) || []).length
  const negatedCount = countNegated(t, NEGATED_FRAMING)
  const adversativeCount = (t.match(ADVERSATIVE_RE) || []).length

  let negativeSignals =
    harmCount +
    lossPhraseCount +      // "net job losses"
    damagePhraseCount +    // "economic damage" (not damage that is averted)
    cutHarm.negHits +      // reduction denied = criticism
    raiseWorth.negHits +   // rise denied/eroding worth = criticism
    cutWorth.posHits +     // cutting GDP/output/jobs = bad
    raiseHarm.posHits +    // prices/costs going up = bad
    minimizerCount +       // "only 4%" = shortfall
    negatedCount +         // "does not improve" etc.
    (adversativeCount * 0.5)

  // Minimizers and denials downplay a claimed result — cancel the positive
  // credit they were about to create ("fell only 4%", "has yet to deliver").
  positiveSignals = Math.max(0, positiveSignals - minimizerCount - negatedCount)

  const total = positiveSignals + negativeSignals

  // No framing signals at all — fall back to a neutral baseline with mild variation.
  if (total === 0) {
    const hash = text.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    const variation = ((hash % 7) - 3) * 1.2 // ±3.6%
    const positive = Math.max(35, Math.min(65, 50 + variation))
    return {
      positive: Math.round(positive * 10) / 10,
      negative: Math.round((100 - positive) * 10) / 10,
    }
  }

  // Map the signal ratio [-1, 1] onto a positive percentage [~14, ~86].
  const ratio = (positiveSignals - negativeSignals) / total
  let positive = 50 + 34 * ratio

  // Small deterministic variation so bars differ between arguments.
  const hash = text.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  const variation = ((hash % 9) - 4) * 1.2 // ±4.8%
  positive = Math.max(8, Math.min(92, positive + variation))
  const negative = 100 - positive

  return {
    positive: Math.round(positive * 10) / 10,
    negative: Math.round(negative * 10) / 10,
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