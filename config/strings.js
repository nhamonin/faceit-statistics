import { localizeDate } from '#utils';

export default {
  start: (players) =>
    players.length
      ? `Welcome back!
Your team: <b>${players.join(', ')}</b>.
You can check stats or modify your team.`
      : 'Welcome to the faceit stats bot! You are now able to add players to your list.',
  resetTeam: {
    success:
      "Team has been successfully reset. Now you don't have any players. You can add some via the button below.",
    notExists:
      "You don't have a team to reset. Init it first via the command '/start.'",
  },
  basicMenu: (teamNicknames) =>
    `Your team: <b>${teamNicknames.join(
      ', '
    )}</b>.\nChoose one of the options below:`,
  selectOnOfTheOptions: (isDone) =>
    `${isDone ? 'Done! ' : ''}Select one of the options below:`,
  sendLastMatchesCount: 'Send the number of matches you want to see.',
  sendPlayerNickname: 'Send player nickname:',
  addPlayer: {
    success: (nickname, teamNicknames) =>
      `Player <b>${nickname}</b> was added.\nYour team: <b>${teamNicknames}</b>.`,
    sendNickname: 'Send nickname of the player you want to add.',
    exists: (nickname, teamNicknames) =>
      `Sorry, but player <b>${nickname}</b> already exists in your team. Try to add another player.\nYour team: <b>${teamNicknames}</b>.`,
    notFound: (nickname, teamNicknames) =>
      `Sorry, but player <b>${nickname}</b> doesn't exist. Try to add another player.\nYour team: <b>${teamNicknames}</b>.`,
    tooMany: (teamNicknames) =>
      `Sorry, but you can't add more players. Try to delete the existing one to add a new one.\nYour team: <b>${teamNicknames}</b>.`,
  },
  deletePlayer: {
    success: (nickname, teamNicknames) =>
      `Player <b>${nickname}</b> was deleted.\nYour team: <b>${teamNicknames}</b>.`,
    notExists: (nickname) =>
      `Sorry, but <b>${nickname}</b> doesn't exists in your team.`,
    selectPlayer: (teamNicknames) =>
      `Your team: <b>${teamNicknames.join(
        ', '
      )}</b>.\nChoose a player you want to delete:`,
    lastPlayerWasDeleted:
      'You just deleted the last player in your team. Please add at least one player via the button below',
  },
  updateTeamPlayers: {
    success:
      'Team players was successfully updated. Check out Elo rating via the /get_team_elo or K/D via /get_team_kd commands.',
    error:
      'Unfortunately, dut to the technical reasons it is impossible to update players right now. Please wait and try again later.',
  },
  emptyTeamError: (attribute) =>
    `Please add at least one player via '/add_player nickname' command to check ${attribute}.`,
  emptyMatchesError: 'Your teammates have no matches in CS:GO.',
  getTeamStats: (playerStatMessage, statAttribute, avgTeamStat) =>
    `${playerStatMessage}<br>${
      avgTeamStat ? `<div>Avg Team ${statAttribute}: ${avgTeamStat}</div>` : ''
    }`,
  getPlayerLastMatches: {
    notExists: (nickname) =>
      `Sorry, but player with nickname <b>${nickname}</b> doesn't exists. Try to check another player.`,
  },
  getTeamKD: {
    validationError:
      'Bad value error: Your input must be an integer number greater than 0.',
  },
  highestElo: {
    defaultMessage: (playerNickname, highestElo, diffElo, date, diffDays) =>
      `<b>${playerNickname}</b>'s highest elo rating was <b>${highestElo}</b> (${diffElo} from now).\nDate when the highest elo rating was reached: <b>${localizeDate(
        date,
        'en'
      )}</b> (${diffDays} days ago).`,
    peakEloMessage: (playerNickname, highestElo, date, diffDays) =>
      `<b>${playerNickname}</b> is at its peak now! Current elo rating: <b>${highestElo}</b>.\nDate when the highest elo rating was reached: <b>${localizeDate(
        date,
        'en'
      )}</b>. (${diffDays} days ago)`,
  },
  subscriptions: {
    summaryStats: {
      message:
        'You or someone from your team just finished a match. Here is updated statistics of your team: upper half shows the lifetime stats, lower half shows the stats for the last 20 matches.',
      unsubscribed:
        'You have been successfully unsubscribed from the summary stats.',
      subscribed: 'You have been successfully subscribed to the summary stats.',
    },
    calculateBestMaps: {
      message: (teammatesString, neededVariables, opponentTeamName) =>
        `Match <b>${neededVariables[2]}</b> vs <b>${opponentTeamName}</b> just created! Above, you can find the best maps for <b>${neededVariables[2]}</b> (${teammatesString} from your team).`,
      unsubscribed:
        'You have been successfully unsubscribed from the best maps calculation.',
      subscribed:
        'You have been successfully subscribed to the best maps calculation.',
    },
    manage: 'Manage subscriptions below:',
  },
  settings: 'Settings of your team below:',
  comingSoon: 'Coming soon...',
  teamNotExistError:
    "You don't have a team. Init it first via the command '/start.'",
  serverError: 'Oops, something went wrong. Try again later.',
};
