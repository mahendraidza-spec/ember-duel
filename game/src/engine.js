// engine.js — the rules of Ember Duel: turns, mana, playing cards, damage,
// block, healing, drawing, and the win / loss conditions. Pure game logic;
// it knows nothing about the DOM.

import { newFighter, drawCards, START_MANA, MAX_MANA } from './cards.js';

export function newGame() {
  const state = {
    phase: 'playing', // 'playing' | 'won' | 'lost'
    turn: 1,
    active: 'player', // whose turn it is
    player: newFighter('You', 'Ember Mage'),
    ai: newFighter('Nyx', 'the Cinder Witch'),
    log: [],
    stats: { damageDealt: 0, damageTaken: 0, cardsPlayed: 0, turnsTaken: 0 },
    lastPlayed: null, // { by, card } shown in the middle of the table
    winner: null,
  };
  drawCards(state.player, 4);
  drawCards(state.ai, 4);
  addLog(state, 'The duel begins. Your move — play a card, then End Turn.');
  return state;
}

export function addLog(state, text) {
  state.log.unshift(text);
  if (state.log.length > 6) state.log.length = 6;
}

function dealDamage(state, attacker, defender, amount) {
  let left = amount;
  if (defender.block > 0) {
    const absorbed = Math.min(defender.block, left);
    defender.block -= absorbed;
    left -= absorbed;
  }
  if (left > 0) defender.hp = Math.max(0, defender.hp - left);
  return amount - left; // damage actually soaked by block is not counted
}

export function canPlay(state, card) {
  if (state.phase !== 'playing' || state.active !== 'player') return false;
  return state.player.mana >= card.cost;
}

// Play one card from a fighter's hand. Returns true when the card was played.
export function playCard(state, fighter, cardUid) {
  const hand = fighter.hand;
  const idx = hand.findIndex((c) => c.uid === cardUid);
  if (idx < 0) return false;
  const card = hand[idx];
  if (fighter.mana < card.cost) return false;

  fighter.mana -= card.cost;
  hand.splice(idx, 1);
  fighter.discard.push(card);
  state.lastPlayed = { by: fighter === state.player ? 'player' : 'ai', card };
  const foe = fighter === state.player ? state.ai : state.player;

  if (card.kind === 'damage') {
    dealDamage(state, fighter, foe, card.power);
    if (fighter === state.player) state.stats.damageDealt += card.power;
    else state.stats.damageTaken += card.power;
    addLog(state, `${fighter.name} plays ${card.name} — ${card.power} damage!`);
  } else if (card.kind === 'block') {
    fighter.block += card.power;
    addLog(state, `${fighter.name} plays ${card.name} — +${card.power} block.`);
  } else if (card.kind === 'heal') {
    fighter.hp = Math.min(fighter.maxHp, fighter.hp + card.power);
    addLog(state, `${fighter.name} plays ${card.name} — heals ${card.power}.`);
  } else if (card.kind === 'draw') {
    drawCards(fighter, card.power);
    addLog(state, `${fighter.name} plays ${card.name} — draws ${card.power} cards.`);
  }

  if (fighter === state.player) state.stats.cardsPlayed++;
  checkEnd(state);
  return true;
}

export function checkEnd(state) {
  if (state.ai.hp <= 0) {
    state.phase = 'won';
    state.winner = 'player';
    addLog(state, 'Nyx falls. You win the duel!');
  } else if (state.player.hp <= 0) {
    state.phase = 'lost';
    state.winner = 'ai';
    addLog(state, 'Your ember fades. Nyx wins the duel.');
  }
}

// End the player's turn: the AI takes its turn, then a fresh player turn starts.
export function endPlayerTurn(state) {
  if (state.phase !== 'playing' || state.active !== 'player') return;
  state.active = 'ai';
  state.stats.turnsTaken++;
}

// Start a fighter's turn: block fades, mana grows by one, draw two cards.
export function startTurn(state, fighter) {
  fighter.block = 0;
  if (fighter === state.player) {
    fighter.maxMana = Math.min(MAX_MANA, START_MANA + state.turn - 1);
    state.turn++;
  } else {
    fighter.maxMana = Math.min(MAX_MANA, START_MANA + state.turn - 1);
  }
  fighter.mana = fighter.maxMana;
  drawCards(fighter, 2);
}

export function score(state) {
  // Score rewards aggressive, efficient play: damage dealt, cards played,
  // and finishing fast (fewer turns), plus a win bonus.
  return (
    state.stats.damageDealt * 10 +
    state.stats.cardsPlayed * 5 +
    Math.max(0, 100 - state.stats.turnsTaken * 5) +
    (state.phase === 'won' ? 200 : 0)
  );
}
