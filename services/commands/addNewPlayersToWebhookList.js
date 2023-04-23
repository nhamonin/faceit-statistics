import {
  getPlayerInfo,
  getPlayerMatches,
  webhookMgr,
  getMatchData,
} from '#utils';

export async function addNewPlayersToWebhookList(playerNickname, limit) {
  const queue = [playerNickname];
  const processedPlayers = new Set();
  const addedPlayers = new Set();
  const processedMatches = new Set();
  const matchesToConsider = 5;

  while (queue.length > 0) {
    const currentNickname = queue.shift();
    if (processedPlayers.has(currentNickname)) continue;
    processedPlayers.add(currentNickname);

    const restrictionsCount = await webhookMgr.getRestrictionsCount();
    if (restrictionsCount >= limit) break;

    const { player_id } = await getPlayerInfo({
      playerNickname: currentNickname,
    });
    const matchIDs = await getMatchIDsForPlayer(player_id);
    const unprocessedMatchIDs = getUnprocessedMatchIDs(
      matchIDs,
      processedMatches
    );
    processedMatches.add(...unprocessedMatchIDs);

    await fetchAndProcessMatches(
      queue,
      processedPlayers,
      addedPlayers,
      unprocessedMatchIDs.slice(0, matchesToConsider),
      limit
    );
  }

  return 'Adding new players process was finished.';
}

async function fetchAndProcessMatches(
  queue,
  processedPlayers,
  addedPlayers,
  unprocessedMatchIDs,
  limit
) {
  const matchDataList = await fetchMatchData(unprocessedMatchIDs);

  for (const matchData of matchDataList) {
    if (!isMatchDataValid(matchData)) continue;

    const [faction1IDs, faction2IDs] = getFactionsPlayerIDs(matchData);
    await addNewPlayersToWebhookManager(faction1IDs, faction2IDs, addedPlayers);

    const newRestrictionsCount = await webhookMgr.getRestrictionsCount();
    console.log(newRestrictionsCount);

    if (newRestrictionsCount >= limit) {
      return 'Limit reached, adding new players process stopped.';
    }

    const [faction1Nicknames, faction2Nicknames] =
      getFactionsPlayerNicknames(matchData);
    enqueueUnprocessedNicknames(
      queue,
      processedPlayers,
      faction1Nicknames,
      faction2Nicknames
    );
  }
}

async function getMatchIDsForPlayer(player_id) {
  return (await getPlayerMatches(player_id)).map(({ matchId }) => matchId);
}

function getUnprocessedMatchIDs(matchIDs, processedMatches) {
  return matchIDs.filter((matchID) => !processedMatches.has(matchID));
}

function isMatchDataValid(matchData) {
  return matchData?.payload?.teams?.faction1?.roster?.length;
}

function getFactionsPlayerIDs(matchData) {
  const faction1IDs = matchData.payload.teams.faction1.roster.map(
    ({ id }) => id
  );
  const faction2IDs = matchData.payload.teams.faction2.roster.map(
    ({ id }) => id
  );
  return [faction1IDs, faction2IDs];
}

async function addNewPlayersToWebhookManager(
  faction1IDs,
  faction2IDs,
  addedPlayers
) {
  const uniqueFaction1IDs = faction1IDs.filter((id) => !addedPlayers.has(id));
  const uniqueFaction2IDs = faction2IDs.filter((id) => !addedPlayers.has(id));

  await webhookMgr.addPlayersToList(uniqueFaction1IDs);
  await webhookMgr.addPlayersToList(uniqueFaction2IDs);

  uniqueFaction1IDs.forEach((id) => addedPlayers.add(id));
  uniqueFaction2IDs.forEach((id) => addedPlayers.add(id));
}

function getFactionsPlayerNicknames(matchData) {
  const faction1Nicknames = matchData.payload.teams.faction1.roster.map(
    ({ nickname }) => nickname
  );
  const faction2Nicknames = matchData.payload.teams.faction2.roster.map(
    ({ nickname }) => nickname
  );
  return [faction1Nicknames, faction2Nicknames];
}

function enqueueUnprocessedNicknames(
  queue,
  processedPlayers,
  faction1Nicknames,
  faction2Nicknames
) {
  const allNicknames = [...faction1Nicknames, ...faction2Nicknames];

  allNicknames.forEach((nickname) => {
    if (!queue.includes(nickname) && !processedPlayers.has(nickname)) {
      queue.push(nickname);
    }
  });
}

async function fetchMatchData(matchIDs) {
  const matchDataPromises = matchIDs.map((matchID) => getMatchData(matchID));
  return Promise.all(matchDataPromises);
}
