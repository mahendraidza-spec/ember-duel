// main.js — wires Ember Duel together: starts games, handles clicks and
// keys, runs Nyx's turn with pauses so her plays can be read, and opens the
// title / win / loss screens. Also exposes window.__ember for play-testing.

import { newGame, playCard, endPlayerTurn, startTurn, checkEnd, score, canPlay } from './engine.js';
import { takeAiTurn } from './ai.js';
import { renderAll, showTitle, showEnd, hideScreens, floatText, shakeTable } from './render.js';
import { sfx, toggleMute, isMuted } from './sound.js';
import { drawCards } from './cards.js';

let state = null;
let best = 0;
try {
  best = Number(localStorage.getItem('ember-duel-best') || 0) || 0;
} catch (_e) {
  best = 0;
}

function saveBest() {
  const s = score(state);
  if (state.phase === 'won' && s > best) {
    best = s;
    try {
      localStorage.setItem('ember-duel-best', String(best));
    } catch (_e) {
      /* best score is a nicety, not a requirement */
    }
  }
}

function refresh() {
  renderAll(state, onPlayCard);
  if (state.phase === 'won' || state.phase === 'lost') {
    saveBest();
    showEnd(state, best);
    if (state.phase === 'won') sfx.win();
    else sfx.lose();
  }
}

function onPlayCard(card) {
  if (!canPlay(state, card)) {
    if (state.active === 'player' && state.player.mana < card.cost) {
      floatText('player-portrait', 'Not enough mana!', 'warn');
    }
    return;
  }
  const aiHpBefore = state.ai.hp;
  const aiBlockBefore = state.ai.block;
  playCard(state, state.player, card.uid);
  if (card.kind === 'damage') {
    sfx.hit();
    shakeTable();
    floatText('ai-portrait', '-' + Math.max(0, card.power - aiBlockBefore) + ' HP', 'dmg');
  } else if (card.kind === 'block') sfx.block();
  else if (card.kind === 'heal') {
    sfx.heal();
    floatText('player-portrait', '+' + card.power + ' HP', 'heal');
  } else sfx.play();
  void aiHpBefore;
  refresh();
}

function onEndTurn() {
  if (state.phase !== 'playing' || state.active !== 'player') return;
  endPlayerTurn(state);
  refresh();
  // Nyx takes her turn, one card at a time, then your next turn begins.
  setTimeout(() => {
    startTurn(state, state.ai);
    refresh();
    takeAiTurn(
      state,
      (card) => {
        if (card.kind === 'damage') {
          sfx.hit();
          shakeTable();
          floatText('player-portrait', '-' + card.power + ' HP', 'dmg');
        } else if (card.kind === 'block') sfx.block();
        else if (card.kind === 'heal') {
          sfx.heal();
          floatText('ai-portrait', '+' + card.power + ' HP', 'heal');
        } else sfx.play();
        refresh();
      },
      () => {
        if (state.phase !== 'playing') {
          refresh();
          return;
        }
        state.active = 'player';
        startTurn(state, state.player);
        sfx.turn();
        refresh();
      },
    );
  }, 500);
}

function startNewGame() {
  state = newGame();
  hideScreens();
  refresh();
  sfx.deal();
}

function buildDemoScene(scene) {
  // Deterministic table states used for the entry's screenshots: the same
  // rendering code as a real duel, with a fixed mid-duel position.
  state = newGame();
  hideScreens();
  if (scene === 'play') {
    state.player.hp = 26;
    state.ai.hp = 18;
    state.ai.block = 3;
    state.player.mana = 5;
    state.player.maxMana = 6;
    state.ai.mana = 4;
    state.stats.damageDealt = 12;
    state.stats.cardsPlayed = 4;
    state.turn = 3;
    state.lastPlayed = { by: 'player', card: state.player.hand[0] };
    state.log = [
      'You play Thorn Volley — 6 damage!',
      'Nyx plays Stone Guard — +5 block.',
      'You play Ember Strike — 4 damage!',
      'Nyx plays Tide Slash — 2 damage!',
    ];
  } else if (scene === 'win') {
    state.ai.hp = 0;
    state.phase = 'won';
    state.winner = 'player';
    state.stats.damageDealt = 31;
    state.stats.cardsPlayed = 9;
    state.stats.turnsTaken = 6;
    state.turn = 7;
    state.log = ['You play Meteor Fall — 9 damage!', 'Nyx falls. You win the duel!'];
    showEnd(state, best);
  } else if (scene === 'loss') {
    state.player.hp = 0;
    state.phase = 'lost';
    state.winner = 'ai';
    state.stats.damageDealt = 18;
    state.stats.cardsPlayed = 7;
    state.stats.turnsTaken = 8;
    state.turn = 9;
    state.log = ['Nyx plays Thorn Volley — 6 damage!', 'Your ember fades. Nyx wins the duel.'];
    showEnd(state, best);
  }
  refresh();
  if (scene === 'win' || scene === 'loss') showEnd(state, best);
}

function boot() {
  document.getElementById('start-btn').addEventListener('click', startNewGame);
  document.getElementById('again-btn').addEventListener('click', startNewGame);
  document.getElementById('title-again-btn').addEventListener('click', startNewGame);
  document.getElementById('end-turn').addEventListener('click', onEndTurn);
  document.getElementById('new-game').addEventListener('click', startNewGame);
  document.getElementById('sound-btn').addEventListener('click', (e) => {
    const m = toggleMute();
    e.currentTarget.textContent = m ? '🔇 Sound off' : '🔊 Sound on';
  });
  document.getElementById('how-btn').addEventListener('click', () => {
    document.getElementById('how-panel').classList.toggle('hidden');
  });

  document.addEventListener('keydown', (e) => {
    if (state && state.phase === 'playing' && state.active === 'player') {
      if (e.key >= '1' && e.key <= '7') {
        const card = state.player.hand[Number(e.key) - 1];
        if (card) onPlayCard(card);
      } else if (e.key === 'e' || e.key === 'E' || e.key === ' ') {
        e.preventDefault();
        onEndTurn();
      }
    }
    if ((e.key === 'r' || e.key === 'R') && state) startNewGame();
  });

  const scene = new URLSearchParams(location.search).get('scene');
  if (scene === 'play' || scene === 'win' || scene === 'loss') {
    buildDemoScene(scene);
  } else {
    state = newGame();
    showTitle(best);
    refresh();
  }

  // Test hooks for headless play-testing (not part of the visible game).
  window.__ember = {
    get state() {
      return state;
    },
    startNewGame,
    playCard: onPlayCard,
    endTurn: onEndTurn,
    score: () => score(state),
    drawCards,
  };
}

document.addEventListener('DOMContentLoaded', boot);
