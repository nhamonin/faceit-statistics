import database from '#db';
import { calculateAverage, getPlayerLifeTimeStats, calculateLifeTimeWinrate } from '#utils';
import { statsNumberArray } from '#config';

export async function getPlayerLastStats(player_id, limit) {
  const LIMIT = limit || Math.max(...statsNumberArray);
  const [matches, stats] = await Promise.all([
    getPlayerMatches(player_id, LIMIT),
    getPlayerLifeTimeStats(player_id),
  ]);
  const statsArr = matches.map(({ kd, kills, win, hs }) => ({
    kd,
    avg: kills,
    winrate: win,
    hs,
  }));
  const res = {
    kd: {},
    avg: {},
    winrate: {},
    hs: {},
  };

  res.kd.lifetime = stats ? +stats.lifetime?.k5 : 0;
  res.winrate.lifetime = calculateLifeTimeWinrate(stats);
  res.hs.lifetime = stats ? +stats.lifetime?.k8 : 0;

  statsNumberArray.forEach((number) => {
    Object.keys(res).forEach((attr) => {
      res[attr][`last${limit ? '' : number}`] = +(
        calculateAverage(
          statsArr.map((attrsObj) => attrsObj[attr]).slice(0, limit || number) || 0
        ) * (attr === 'winrate' ? 100 : 1) || 0
      ).toFixed(2);
    });
  });

  return res;
}

async function getPlayerMatches(player_id, limit) {
  return await database.matches.readAllBy(
    { player_id, game_mode: '5v5' },
    {
      limit,
      excludeNull: 'elo',
    }
  );
}
