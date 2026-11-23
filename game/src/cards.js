// cards.js — the card pool, the elements, and deck building for Ember Duel.
// Every card is an original design for this game: an element (shape + colour),
// a mana cost, and one clear effect. No card is copied from another game.

export const ELEMENTS = {
  flame: { name: 'Flame', glyph: '▲', color: '#e5484d', dark: '#8f1d22' },
  tide: { name: 'Tide', glyph: '●', color: '#3e8ef7', dark: '#174a8f' },
  leaf: { name: 'Leaf', glyph: '◆', color: '#46a758', dark: '#1d5c2c' },
  stone: { name: 'Stone', glyph: '■', color: '#d19a2e', dark: '#7a5510' },
};

// id, name, element, cost, power, kind, blurb. power means damage, block,
// healing or cards drawn, depending on kind.
export const CARD_DEFS = [
  { id: 'ember-strike', name: 'Ember Strike', element: 'flame', cost: 2, power: 4, kind: 'damage', blurb: 'Deal 4 damage.' },
  { id: 'tide-slash', name: 'Tide Slash', element: 'tide', cost: 1, power: 2, kind: 'damage', blurb: 'Deal 2 damage.' },
  { id: 'thorn-volley', name: 'Thorn Volley', element: 'leaf', cost: 3, power: 6, kind: 'damage', blurb: 'Deal 6 damage.' },
  { id: 'meteor-fall', name: 'Meteor Fall', element: 'flame', cost: 5, power: 9, kind: 'damage', blurb: 'Deal 9 damage.' },
  { id: 'stone-guard', name: 'Stone Guard', element: 'stone', cost: 2, power: 5, kind: 'block', blurb: 'Gain 5 block.' },
  { id: 'tide-ward', name: 'Tide Ward', element: 'tide', cost: 1, power: 3, kind: 'block', blurb: 'Gain 3 block.' },
  { id: 'leaf-mend', name: 'Leaf Mend', element: 'leaf', cost: 2, power: 5, kind: 'heal', blurb: 'Restore 5 health.' },
  { id: 'spark-surge', name: 'Spark Surge', element: 'flame', cost: 1, power: 2, kind: 'draw', blurb: 'Draw 2 cards.' },
];

export const MAX_HAND = 7;
export const START_HP = 30;
export const START_MANA = 3;
export const MAX_MANA = 10;

let uid = 1;

export function makeCard(def) {
  return { uid: uid++, ...def };
}

// A fresh 24-card deck: three copies of each of the eight cards, shuffled.
export function buildDeck(random = Math.random) {
  const deck = [];
  for (let copy = 0; copy < 3; copy++) {
    for (const def of CARD_DEFS) deck.push(makeCard(def));
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function drawCards(fighter, count) {
  for (let i = 0; i < count; i++) {
    if (fighter.hand.length >= MAX_HAND) return;
    if (fighter.deck.length === 0) {
      // Reshuffle the discard pile back into the deck so a duel never stalls.
      fighter.deck = fighter.discard.splice(0);
      for (let k = fighter.deck.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        [fighter.deck[k], fighter.deck[j]] = [fighter.deck[j], fighter.deck[k]];
      }
      if (fighter.deck.length === 0) return;
    }
    fighter.hand.push(fighter.deck.pop());
  }
}

export function newFighter(name, title) {
  return {
    name,
    title,
    hp: START_HP,
    maxHp: START_HP,
    block: 0,
    mana: START_MANA,
    maxMana: START_MANA,
    deck: buildDeck(),
    hand: [],
    discard: [],
  };
}
