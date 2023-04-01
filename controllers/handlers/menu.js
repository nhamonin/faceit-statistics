import { telegramEditMessage } from '#utils';
import {
  mainMenuMarkup,
  modifyTeamMarkup,
  deletePlayerMarkup,
  getTeamKDMenu,
  lastPlayerMatchesMarkup,
  getHighestEloMenu,
  settingsMarkup,
  getStatsMarkup,
  manageSubscriptionsMarkup,
  chooseLanguageMarkup,
} from '#telegramReplyMarkup';

const menuHandlersConfig = {
  mainMenu: { text: 'basicMenu', markup: mainMenuMarkup },
  modifyTeam: { text: 'basicMenu', markup: modifyTeamMarkup },
  deletePlayer: { text: 'deletePlayer.select', markup: deletePlayerMarkup },
  teamKD: { text: 'getTeamKD.chooseLastMatchesAmount', markup: getTeamKDMenu },
  playerLastMatches: { text: 'choosePlayer', markup: lastPlayerMatchesMarkup },
  highestElo: { text: 'choosePlayer', markup: getHighestEloMenu },
  settings: { text: 'settings', markup: settingsMarkup },
  stats: { text: 'basicMenu', markup: getStatsMarkup },
  manageSubscriptions: {
    text: 'subscriptions.manage',
    markup: manageSubscriptionsMarkup,
  },
  chooseLanguage: { text: 'chooseLanguage', markup: chooseLanguageMarkup },
};

async function handleMenu(handlerName, opts, teamNicknames, ...args) {
  const { text, markup } = menuHandlersConfig[handlerName];
  const finalMarkup =
    typeof markup === 'function'
      ? markup(...(args.length ? args : [teamNicknames]))
      : markup;

  await telegramEditMessage(
    {
      text,
      options: { teamNicknames: teamNicknames.join(', ') },
    },
    {
      ...opts,
      ...finalMarkup,
    }
  );
}

export { handleMenu };
