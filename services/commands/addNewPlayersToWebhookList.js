import {
  getPlayerInfo,
  getPlayerMatches,
  webhookMgr,
  getMatchData,
} from '#utils';

export async function addNewPlayersToWebhookList(playersNicknames) {
  playersNicknames = playersNicknames
    .split(',')
    .map((nickname) => nickname.trim());

  for await (const playerNickname of playersNicknames) {
    const { player_id } = await getPlayerInfo({
      playerNickname,
    });
    const matchIDs = (await getPlayerMatches(player_id, 100)).map(
      ({ matchId }) => matchId
    );

    for await (const matchID of matchIDs) {
      const matchData = await getMatchData(matchID);
      if (!matchData?.payload?.teams?.faction1?.roster?.length) continue;
      const playersIDs1 = matchData.payload.teams.faction1.roster.map(
        ({ id }) => id
      );
      const playersIDs2 = matchData.payload.teams.faction2.roster.map(
        ({ id }) => id
      );

      await webhookMgr.addPlayersToList(playersIDs1);
      await webhookMgr.addPlayersToList(playersIDs2);
    }

    console.log('done', playerNickname);
  }

  return 'Adding new players process was finished.';
}
