export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'
}

export interface GameState {
  hand: Card[]
  score: number
  mult: number
  chips: number
  handsLeft: number
  discardsLeft: number
  roundScore: number
  targetScore: number
}

export interface HandResult {
  name: string
  chips: number
  mult: number
  score: number
  description: string
}

export const JOKER_TYPES = [
  'joker',
  'greedy',
  'lusty',
  'wrathful',
  'glutton',
  'mystic',
  'chaos',
  'fortune'
] as const

export type JokerType = typeof JOKER_TYPES[number]

export const JOKER_INFO: Record<JokerType, { name: string; effect: string; color: string }> = {
  joker: { name: 'Joker', effect: '+4 Mult', color: '#ff2d75' },
  greedy: { name: 'Greedy Joker', effect: '+3 Mult for each Diamond', color: '#ffd700' },
  lusty: { name: 'Lusty Joker', effect: '+3 Mult for each Heart', color: '#ff6b9d' },
  wrathful: { name: 'Wrathful Joker', effect: '+3 Mult for each Spade', color: '#4a90d9' },
  glutton: { name: 'Glutton Joker', effect: '+3 Mult for each Club', color: '#50c878' },
  mystic: { name: 'Mystic Joker', effect: '+15 Chips per card played', color: '#9b59b6' },
  chaos: { name: 'Chaos Joker', effect: 'x1.5 Mult', color: '#e74c3c' },
  fortune: { name: 'Fortune Joker', effect: '+50 Chips', color: '#f39c12' }
}

const RANK_VALUES: Record<Card['rank'], number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11
}

const RANK_ORDER: Record<Card['rank'], number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
}

function getRankCounts(cards: Card[]): Map<Card['rank'], number> {
  const counts = new Map<Card['rank'], number>()
  for (const card of cards) {
    counts.set(card.rank, (counts.get(card.rank) || 0) + 1)
  }
  return counts
}

function getSuitCounts(cards: Card[]): Map<Card['suit'], number> {
  const counts = new Map<Card['suit'], number>()
  for (const card of cards) {
    counts.set(card.suit, (counts.get(card.suit) || 0) + 1)
  }
  return counts
}

function isFlush(cards: Card[]): boolean {
  if (cards.length < 5) return false
  const suits = getSuitCounts(cards)
  return Array.from(suits.values()).some(count => count >= 5)
}

function isStraight(cards: Card[]): boolean {
  if (cards.length < 5) return false
  const ranks = [...new Set(cards.map(c => RANK_ORDER[c.rank]))].sort((a, b) => a - b)
  if (ranks.length < 5) return false

  for (let i = 0; i <= ranks.length - 5; i++) {
    if (ranks[i + 4] - ranks[i] === 4) return true
  }

  // Check for A-2-3-4-5 straight
  if (ranks.includes(14) && ranks.includes(2) && ranks.includes(3) && ranks.includes(4) && ranks.includes(5)) {
    return true
  }

  return false
}

function getBaseChips(cards: Card[]): number {
  return cards.reduce((sum, card) => sum + RANK_VALUES[card.rank], 0)
}

export function evaluateHand(cards: Card[], jokers: JokerType[]): HandResult {
  const rankCounts = getRankCounts(cards)
  const countValues = Array.from(rankCounts.values()).sort((a, b) => b - a)
  const suitCounts = getSuitCounts(cards)

  let baseChips = getBaseChips(cards)
  let baseMult = 1
  let handName = 'High Card'
  let description = 'Highest card wins'
  let handChips = 5

  const flush = isFlush(cards)
  const straight = isStraight(cards)

  // Royal Flush
  if (flush && straight && cards.length >= 5) {
    const ranks = cards.map(c => RANK_ORDER[c.rank])
    if (ranks.includes(14) && ranks.includes(13) && ranks.includes(12) && ranks.includes(11) && ranks.includes(10)) {
      handName = 'Royal Flush'
      handChips = 100
      baseMult = 8
      description = 'A-K-Q-J-10 of same suit!'
    } else {
      handName = 'Straight Flush'
      handChips = 100
      baseMult = 8
      description = '5 cards in sequence, same suit!'
    }
  }
  // Four of a Kind
  else if (countValues[0] >= 4) {
    handName = 'Four of a Kind'
    handChips = 60
    baseMult = 7
    description = '4 cards of same rank'
  }
  // Full House
  else if (countValues[0] >= 3 && countValues[1] >= 2) {
    handName = 'Full House'
    handChips = 40
    baseMult = 4
    description = '3 of a kind + a pair'
  }
  // Flush
  else if (flush) {
    handName = 'Flush'
    handChips = 35
    baseMult = 4
    description = '5 cards of same suit'
  }
  // Straight
  else if (straight) {
    handName = 'Straight'
    handChips = 30
    baseMult = 4
    description = '5 cards in sequence'
  }
  // Three of a Kind
  else if (countValues[0] >= 3) {
    handName = 'Three of a Kind'
    handChips = 30
    baseMult = 3
    description = '3 cards of same rank'
  }
  // Two Pair
  else if (countValues[0] >= 2 && countValues[1] >= 2) {
    handName = 'Two Pair'
    handChips = 20
    baseMult = 2
    description = '2 different pairs'
  }
  // Pair
  else if (countValues[0] >= 2) {
    handName = 'Pair'
    handChips = 10
    baseMult = 2
    description = '2 cards of same rank'
  }

  // Apply joker effects
  let jokerMult = 0
  let jokerChips = 0
  let multMultiplier = 1

  for (const joker of jokers) {
    switch (joker) {
      case 'joker':
        jokerMult += 4
        break
      case 'greedy':
        jokerMult += (suitCounts.get('diamonds') || 0) * 3
        break
      case 'lusty':
        jokerMult += (suitCounts.get('hearts') || 0) * 3
        break
      case 'wrathful':
        jokerMult += (suitCounts.get('spades') || 0) * 3
        break
      case 'glutton':
        jokerMult += (suitCounts.get('clubs') || 0) * 3
        break
      case 'mystic':
        jokerChips += cards.length * 15
        break
      case 'chaos':
        multMultiplier *= 1.5
        break
      case 'fortune':
        jokerChips += 50
        break
    }
  }

  const totalChips = handChips + baseChips + jokerChips
  const totalMult = Math.floor((baseMult + jokerMult) * multMultiplier)
  const score = totalChips * totalMult

  return {
    name: handName,
    chips: totalChips,
    mult: totalMult,
    score,
    description
  }
}
