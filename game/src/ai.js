// ai.js — Nyx, the Cinder Witch: the opponent's brain. She reads the table
// and picks the play that hurts you most, heals when she is in danger, and
// guards when your hand looks lethal. Deterministic given the hand, so every
// duel still plays differently because the decks are shuffled.

import { playCard } from './engine.js';

function valueOf(state, card) {
  const me = state.ai;
  const you = state.player;
  if (card.kind === 'damage') {
    // Lethal damage is worth far more than chip damage.
    let v = card.power * 2;
    if (card.power >= you.hp + you.block) v += 50;
    else if (card.power >= you.hp) v += 20;
    return v / card.cost;
  }
  if (card.kind === 'heal') {
    // Healing matters most when she is low; wasted when she is full.
    if (me.hp >= me.maxHp - 2) return 0.1;
    return (me.maxHp - me.hp <= 10 ? 14 : 6) / card.cost;
  }
  if (card.kind === 'block') {
    // Block matters when you could hit her hard next turn.
    const threat = you.hand.reduce((s, c) => s + (c.kind === 'damage' ? c.power : 0), 0);
    return (threat >= 8 ? 8 : 3) / card.cost;
  }
  if (card.kind === 'draw') {
    return me.hand.length <= 2 ? 7 : 2;
  }
  return 1;
}

// Play Nyx's turn one card at a time. onPlay is called after each card so
// the table can animate it; done is called when she ends her turn.
export function takeAiTurn(state, onPlay, done) {
  const step = () => {
    if (state.phase !== 'playing') return done();
    const playable = state.ai.hand.filter((c) => c.cost <= state.ai.mana);
    if (playable.length === 0) return done();
    // She plays at most three cards a turn, best value first.
    if (state.ai._playedThisTurn >= 3) return done();
    playable.sort((a, b) => valueOf(state, b) - valueOf(state, a));
    const pick = playable[0];
    state.ai._playedThisTurn = (state.ai._playedThisTurn || 0) + 1;
    playCard(state, state.ai, pick.uid);
    onPlay(pick);
    if (state.phase !== 'playing') return done();
    setTimeout(step, 650);
  };
  state.ai._playedThisTurn = 0;
  setTimeout(step, 500);
}
