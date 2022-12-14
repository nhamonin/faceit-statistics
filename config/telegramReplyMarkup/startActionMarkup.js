import { mainMenuMarkup, addPlayerOnlyMarkup } from './index.js';

export const startActionMarkup = (players) =>
  players.length ? mainMenuMarkup : addPlayerOnlyMarkup;
