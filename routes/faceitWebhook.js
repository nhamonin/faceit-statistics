import { clearInterval } from 'node:timers';

import { Players } from 'faceit-node-api';

import database from '#db';
import { updatePlayers } from '#services';
import {
  calculateBestMaps,
  performMapPickerAnalytics,
  getMatchData,
  getMatchStats,
  handleSummaryStatsAutoSend,
  receiveArgs,
  cacheWithExpiry,
  prettifyScoreBasedOnResult,
  wait,
} from '#utils';
import { allowedCompetitionNames, caches } from '#config';

const eventHandlers = new Map([
  ['match_object_created', handleMatchObjectCreated],
  ['match_status_finished', handleMatchStatusFinished],
]);

const players = new Players();

export default {
  '/faceit-webhook': {
    post: async (req, res) => {
      try {
        const data = await receiveArgs(req);
        const addedToCache = cacheWithExpiry(
          caches[data.event],
          data.payload.id,
          1000 * 60 * 30
        );
        if (!addedToCache) {
          res.end('Already cached');
          return;
        }

        const eventHandler = eventHandlers.get(data.event);

        if (eventHandler) {
          await eventHandler(data);
        } else {
          console.warn(`Unhandled event type: ${data.event}`);
        }

        res.end('OK');
      } catch (e) {
        console.error(e);
        res.end('Internal Server Error');
      }

      res.statusCode = 200;
    },
  },
};

async function handleMatchObjectCreated(data) {
  const match_id = data.payload.id;

  let maxIntervalCount = 15;
  const interval = setInterval(async () => {
    maxIntervalCount--;
    if (!maxIntervalCount) clearInterval(interval);
    const matchData = await getMatchData(match_id);
    const allowedCompetitionName = allowedCompetitionNames.includes(
      matchData?.payload?.entity?.name
    );
    if (!allowedCompetitionName) clearInterval(interval);
    if (
      matchData?.payload?.teams?.faction1 &&
      matchData?.payload?.teams?.faction2 &&
      allowedCompetitionName
    ) {
      clearInterval(interval);
      await updatePlayersInMatch(matchData.payload.teams);
      const predictions = await calculateBestMaps(matchData);
      if (predictions?.length) {
        const prediction = await database.tempPredictions.readBy({
          match_id,
        });

        if (!prediction) {
          await database.tempPredictions.create({
            match_id,
            predictions,
          });
        }
      }
    }
  }, 4500);
}

async function updatePlayersInMatch(teams) {
  const factions = Object.keys(teams);

  for (const faction of factions) {
    const team = teams[faction];

    for (const player of team.roster) {
      const player_id = player.id;
      const dbPlayer = await database.players.readBy({ player_id });
      if (!dbPlayer) continue;
      await database.players.updateAllBy(
        { player_id },
        { previous_elo: dbPlayer.elo, in_match: true }
      );
    }
  }
}

async function handleMatchStatusFinished(data) {
  await performMapPickerAnalytics(data.payload.id);

  if (
    !data?.payload?.teams?.length ||
    !data.payload.teams[0]?.roster?.length ||
    !data.payload.teams[1]?.roster?.length
  ) {
    return;
  }

  const playersRoster = [
    ...data.payload.teams[0].roster,
    ...data.payload.teams[1].roster,
  ];
  const playerIDs = playersRoster.map(({ id }) => id);
  const teamsToSendSummary = new Set();
  const updatedTeams = new Map();
  await wait(1000 * 3);
  const matchStatsArr = await getMatchStats(data.payload.id);
  if (!matchStatsArr?.length) return;
  const [matchStats] = matchStatsArr;

  for await (const player_id of playerIDs) {
    const teams = await database.teams.readAllByPlayerId(player_id);
    if (!teams.length) continue;

    for (const team of teams) {
      updatedTeams.set(team.chat_id, team);
      teamsToSendSummary.add(team.chat_id);
    }

    await Promise.all([
      createMatchRows(player_id, matchStats),
      deleteMatchInProgressAttrs(player_id),
    ]);
  }

  await updatePlayers({ playerIDs });

  if (updatedTeams.size) {
    console.log(
      `Players of the teams: ${[...updatedTeams.values()]
        .map(({ username, title, chat_id }) => username || title || chat_id)
        .join(',')} were updated.`,
      new Date().toLocaleString()
    );
  }

  await handleSummaryStatsAutoSend(data.payload.id, [...teamsToSendSummary]);
}

async function createMatchRows(player_id, matchStats) {
  if (!matchStats) return;

  const dbPlayer = await database.players.readBy({ player_id });
  if (!dbPlayer) return;

  const playerData = matchStats.teams
    .flatMap((team) => team.players)
    .find((player) => player.playerId === player_id);
  if (!playerData) return;

  const playerDetails = await players.getPlayerDetailsByPlayerID(player_id);
  const newElo = playerDetails?.games?.csgo?.faceit_elo;

  return await database.matches.create({
    match_id: matchStats.matchId,
    player_id: player_id,
    elo: newElo !== dbPlayer.previous_elo ? newElo : null,
    timestamp: new Date(matchStats.date),
    kd: +playerData.c2,
    kills: +playerData.i6,
    hs: +playerData.c4,
    map: matchStats.i1,
    game_mode: matchStats.gameMode,
    win: +playerData.i10,
    score: prettifyScoreBasedOnResult(matchStats.i18, +playerData.i10),
  });
}

async function deleteMatchInProgressAttrs(player_id) {
  return await database.players.updateAllBy(
    { player_id },
    { previous_elo: null, in_match: false }
  );
}
