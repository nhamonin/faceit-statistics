import { Matches } from 'faceit-node-api';

import { getPlayerInfo, getPlayerMatches, webhookMgr } from '#utils';

export default async function addNewPlayersToWebhookList(playersNicknames) {
  playersNicknames = playersNicknames
    .split(',')
    .map((nickname) => nickname.trim());

  for await (const playerNickname of playersNicknames) {
    const { player_id } = await getPlayerInfo({
      playerNickname,
    });
    const matchIDs = (await getPlayerMatches(player_id, 1000)).map(
      ({ matchId }) => matchId
    );
    const matches = new Matches();

    for await (const matchID of matchIDs) {
      const details = await matches.getMatchDetails(matchID);
      if (!details?.teams?.faction1?.roster?.length) continue;
      const playersIDs1 = details.teams.faction1.roster.map(
        ({ player_id }) => player_id
      );
      const playersIDs2 = details.teams.faction2.roster.map(
        ({ player_id }) => player_id
      );

      await webhookMgr.addPlayersToList(playersIDs1);
      await webhookMgr.addPlayersToList(playersIDs2);
    }

    console.log('done', playerNickname);
  }

  return 'Adding new players process was finished.';
}
