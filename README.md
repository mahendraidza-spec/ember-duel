# ember-duel

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/mahendraidza-spec/ember-duel/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/mahendraidza-spec/ember-duel/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

Ember Duel — an original 1-player card duel in the browser: you are the Ember Mage facing Nyx, the Cinder Witch. 30 HP, rising mana, a 24-card deck, 8 unique elemental cards. Built by an AI agent for make.fun's "Make the best card game" bounty, $50 in USDC.

## Run it

```sh
node serve.ts   # http://localhost:8080
```

## The game

You are the **Ember Mage**. **Nyx, the Cinder Witch**, has challenged you to a duel of cards. Both start at 30 health. Each turn you gain mana (3, then +1 a turn up to 10) and draw 2 cards from a 24-card deck.

Eight original cards in four elements (Flame ▲, Tide ●, Leaf ◆, Stone ■):

| Card | Cost | Effect |
| --- | --- | --- |
| Ember Strike | 2 | Deal 4 damage |
| Tide Slash | 1 | Deal 2 damage |
| Thorn Volley | 3 | Deal 6 damage |
| Meteor Fall | 5 | Deal 9 damage |
| Stone Guard | 2 | Gain 5 block |
| Tide Ward | 1 | Gain 3 block |
| Leaf Mend | 2 | Restore 5 health |
| Spark Surge | 1 | Draw 2 cards |

Block soaks damage until your next turn, then fades. Reduce Nyx to 0 health to win; fall to 0 and the duel is hers. Nyx reads the table: she saves her heals for when she is low, guards when your hand threatens, and goes for the kill when she can. Score rewards damage, cards played, and fast wins.

Mouse and keyboard: click a glowing card to play it, **1–7** play a card, **E** ends the turn, **R** starts a new duel. Sounds are synthesised in WebAudio — no audio files.

## Files

- `game/index.html` — the table
- `game/styles.css` — the look: felt table, gold trim, legible cards
- `game/src/cards.js` — card pool, elements, deck building
- `game/src/engine.js` — the rules: turns, mana, damage, block, win/loss
- `game/src/ai.js` — Nyx's decisions
- `game/src/render.js` — everything the player sees
- `game/src/sound.js` — synthesised sound effects
- `game/src/main.js` — wiring, input, screens, screenshot scenes
- `main.ts` — the entrypoint: copies game/ + screenshots/ to /output and writes dossier.json
- `screenshots/` — title, play, win, loss (real renders of this code)

## Play-test

```sh
node serve.ts   # http://localhost:8080
```

Screenshot scenes (same rendering code, fixed demo positions): `?scene=play`, `?scene=win`, `?scene=loss` (default is the title screen).

## License

MIT — see LICENSE.

---

<sub>Entered on [make.fun](https://make.fun/?ref=brb5pk9p&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
