import {
  calculateAverage,
  getHighAmountOfPlayerLastMatches,
  getPlayerLifeTimeStats,
} from '#utils';
import { statsNumberArray } from '#config';

export async function getPlayerLastStats(player_id, limit) {
  const maxNumber = limit || Math.max(...statsNumberArray);
  const LIMIT = maxNumber + 50;

  const [matches, stats] = await Promise.all([
    getHighAmountOfPlayerLastMatches(player_id, LIMIT),
    getPlayerLifeTimeStats(player_id),
  ]);

  const statsArr = matches
    .filter((match) => match.game === 'csgo' && match.gameMode === '5v5')
    .slice(0, maxNumber)
    .map(({ c2, i6, i10, c4 }) => ({
      kd: +c2,
      avg: +i6,
      winrate: +i10,
      hs: +c4,
    }));
  const res = {
    kd: {},
    avg: {},
    winrate: {},
    hs: {},
  };

  res.kd.lifetime = stats ? +stats.lifetime.k5 : 0;
  res.winrate.lifetime = stats
    ? ((stats.lifetime.m2 / stats.lifetime.m1) * 100).toFixed(2)
    : 0;
  res.hs.lifetime = stats ? +stats.lifetime.k8 : 0;

  statsNumberArray.forEach((number) => {
    Object.keys(res).forEach((attr) => {
      res[attr][`last${limit ? '' : number}`] = +(
        calculateAverage(
          statsArr
            .map((attrsObj) => attrsObj[attr])
            .slice(0, limit || number) || 0
        ) * (attr === 'winrate' ? 100 : 1) || 0
      ).toFixed(2);
    });
  });

  return res;
}
