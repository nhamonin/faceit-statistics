import {
  calculateAverage,
  getPlayerMatches,
  getPlayerLifeTimeStats,
} from '#utils';
import { statsNumberArray } from '#config';

export async function getPlayerLastStats(player_id, limit) {
  const maxNumber = limit || Math.max(...statsNumberArray);

  const [matches, stats] = await Promise.all([
    getPlayerMatches(player_id, maxNumber),
    getPlayerLifeTimeStats(player_id),
  ]);

  const statsArr = matches.map(({ c2, i6, i10, c4 }) => ({
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
  res.winrate.lifetime = stats ? +stats.lifetime.k6 : 0;
  res.hs.lifetime = stats ? +stats.lifetime.k8 : 0;

  statsNumberArray.forEach((number) => {
    Object.keys(res).forEach((attr) => {
      res[attr][`last${limit ? '' : number}`] =
        (calculateAverage(
          statsArr.map((attrsObj) => attrsObj[attr]).slice(0, number)
        ) || 0) * (attr === 'winrate' ? 100 : 1);
    });
  });

  return res;
}
