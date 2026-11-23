// render.js — everything the player sees: the table, the hands, the health
// and mana bars, the duel log, the floating damage numbers, and the title /
// win / loss screens. All DOM, no game rules here.

import { ELEMENTS } from './cards.js';
import { score } from './engine.js';

const $ = (id) => document.getElementById(id);

export function buildCardEl(card, opts = {}) {
  const el = ELEMENTS[card.element];
  const div = document.createElement('div');
  div.className = 'card el-' + card.element + (opts.playable ? ' playable' : '') + (opts.small ? ' mini' : '');
  div.dataset.uid = card.uid;
  div.innerHTML =
    '<div class="card-top"><span class="cost">' + card.cost + '</span>' +
    '<span class="element" title="' + el.name + '">' + el.glyph + '</span></div>' +
    '<div class="card-power">' + (card.kind === 'damage' ? '⚔' + card.power : card.kind === 'block' ? '🛡' + card.power : card.kind === 'heal' ? '✚' + card.power : '↻' + card.power) + '</div>' +
    '<div class="card-name">' + card.name + '</div>' +
    '<div class="card-text">' + card.blurb + '</div>' +
    '<div class="card-element-name">' + el.name + '</div>';
  if (opts.onClick) div.addEventListener('click', () => opts.onClick(card));
  return div;
}

export function buildCardBackEl() {
  const div = document.createElement('div');
  div.className = 'card card-back mini';
  div.innerHTML = '<div class="back-glyph">✦</div>';
  return div;
}

function renderFighter(state, who) {
  const f = state[who];
  const prefix = who === 'player' ? 'p' : 'a';
  $(prefix + '-hp-num').textContent = f.hp + ' / ' + f.maxHp;
  $(prefix + '-hp-fill').style.width = Math.max(0, (f.hp / f.maxHp) * 100) + '%';
  $(prefix + '-hp-fill').classList.toggle('low', f.hp <= 10);
  $(prefix + '-block').textContent = f.block > 0 ? '🛡 ' + f.block : '';
  $(prefix + '-block').style.display = f.block > 0 ? 'inline-block' : 'none';
  const mana = $(prefix + '-mana');
  mana.innerHTML = '';
  for (let i = 0; i < f.maxMana; i++) {
    const gem = document.createElement('span');
    gem.className = 'mana-gem' + (i < f.mana ? ' full' : ' empty');
    gem.textContent = '◆';
    mana.appendChild(gem);
  }
  $(prefix + '-deck').textContent = 'Deck ' + f.deck.length;
}

function renderHands(state, onPlayCard) {
  const aiHand = $('ai-hand');
  aiHand.innerHTML = '';
  for (let i = 0; i < state.ai.hand.length; i++) aiHand.appendChild(buildCardBackEl());

  const hand = $('player-hand');
  hand.innerHTML = '';
  state.player.hand.forEach((card, i) => {
    const el = buildCardEl(card, {
      playable: state.phase === 'playing' && state.active === 'player' && card.cost <= state.player.mana,
      onClick: onPlayCard,
    });
    el.style.setProperty('--i', i);
    el.style.animationDelay = i * 60 + 'ms';
    hand.appendChild(el);
  });
}

function renderLog(state) {
  $('log').innerHTML = state.log.map((line) => '<div class="log-line">' + line + '</div>').join('');
}

function renderLastPlayed(state) {
  const box = $('last-played');
  box.innerHTML = '';
  if (!state.lastPlayed) {
    box.innerHTML = '<div class="vs">⚔ VS ⚔</div>';
    return;
  }
  const { by, card } = state.lastPlayed;
  const label = document.createElement('div');
  label.className = 'last-played-label';
  label.textContent = by === 'player' ? 'You played' : 'Nyx played';
  box.appendChild(label);
  box.appendChild(buildCardEl(card, { small: true }));
}

export function renderAll(state, onPlayCard) {
  renderFighter(state, 'player');
  renderFighter(state, 'ai');
  renderHands(state, onPlayCard);
  renderLog(state);
  renderLastPlayed(state);

  $('turn-label').textContent =
    state.phase === 'playing'
      ? state.active === 'player'
        ? 'Your turn — Turn ' + state.turn
        : "Nyx's turn…"
      : state.phase === 'won'
        ? 'Victory!'
        : 'Defeat';
  $('score-num').textContent = score(state);
  $('dmg-num').textContent = state.stats.damageDealt;
  $('cards-num').textContent = state.stats.cardsPlayed;
  $('end-turn').disabled = !(state.phase === 'playing' && state.active === 'player');
  $('end-turn').classList.toggle('pulse', state.phase === 'playing' && state.active === 'player');
  document.body.classList.toggle('your-turn', state.active === 'player' && state.phase === 'playing');
}

// Floating combat text over a fighter's portrait.
export function floatText(targetId, text, kind) {
  const target = $(targetId);
  if (!target) return;
  const span = document.createElement('span');
  span.className = 'float-text ' + (kind || '');
  span.textContent = text;
  target.appendChild(span);
  setTimeout(() => span.remove(), 1200);
}

export function shakeTable() {
  const table = $('table');
  table.classList.remove('shake');
  void table.offsetWidth;
  table.classList.add('shake');
}

export function showTitle(best) {
  $('title-screen').classList.remove('hidden');
  $('end-screen').classList.add('hidden');
  $('best-score').textContent = best > 0 ? 'Best score: ' + best : 'No duels won yet — make your first legend!';
}

export function showEnd(state, best) {
  const won = state.phase === 'won';
  $('title-screen').classList.add('hidden');
  const end = $('end-screen');
  end.classList.remove('hidden');
  $('end-title').textContent = won ? '🏆 VICTORY!' : '💀 DEFEAT';
  $('end-title').className = won ? 'end-title win' : 'end-title lose';
  $('end-sub').textContent = won
    ? 'Nyx bows to your ember. The table is yours!'
    : 'Nyx cackles as your ember fades. Duel again?';
  $('end-score').textContent = 'Score: ' + score(state);
  $('end-stats').textContent =
    'Damage dealt ' + state.stats.damageDealt +
    '  •  Cards played ' + state.stats.cardsPlayed +
    '  •  Turns ' + state.stats.turnsTaken +
    '  •  Best ' + Math.max(best, score(state));
  end.classList.toggle('win-glow', won);
}

export function hideScreens() {
  $('title-screen').classList.add('hidden');
  $('end-screen').classList.add('hidden');
}
