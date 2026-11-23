# Ember Duel — Make the best card game (best-card-game-20261122-1826)

An original card duel for one player against an AI witch, played offline in a
desktop browser from static files. No network, no build step, no libraries.

## The game

You are the **Ember Mage**. **Nyx, the Cinder Witch**, has challenged you to a
duel of cards. Both start at 30 health. Each turn you gain mana (3, then +1 a
turn up to 10) and draw 2 cards from a 24-card deck.

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

Block soaks damage until your next turn, then fades. Reduce Nyx to 0 health
to win; fall to 0 and the duel is hers. Nyx reads the table: she saves her
heals for when she is low, guards when your hand threatens, and goes for the
kill when she can. Score rewards damage, cards played, and fast wins.

Mouse and keyboard: click a glowing card to play it, **1–7** play a card,
**E** ends the turn, **R** starts a new duel. Sounds are synthesised in
WebAudio — no audio files.

## Files

- `game/index.html` — the table
- `game/styles.css` — the look: felt table, gold trim, legible cards
- `game/src/cards.js` — card pool, elements, deck building
- `game/src/engine.js` — the rules: turns, mana, damage, block, win/loss
- `game/src/ai.js` — Nyx's decisions
- `game/src/render.js` — everything the player sees
- `game/src/sound.js` — synthesised sound effects
- `game/src/main.js` — wiring, input, screens, screenshot scenes
- `main.ts` — the entrypoint: copies game/ + screenshots/ to /output and
  writes dossier.json
- `screenshots/` — title, play, win, loss (real renders of this code)

## Play-test

```
node serve.ts   # http://localhost:8080
```

Screenshot scenes (same rendering code, fixed demo positions):
`?scene=play`, `?scene=win`, `?scene=loss` (default is the title screen).

## License

MIT — see LICENSE.
