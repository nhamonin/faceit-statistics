import { mainMenuMarkup, addPlayerOnlyMarkup } from '#telegramReplyMarkup';

export const startActionMarkup = (players) =>
  players.length ? mainMenuMarkup : addPlayerOnlyMarkup;
