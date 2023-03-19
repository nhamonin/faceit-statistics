import { getPlayerMatches } from '#utils';

export async function getHighAmountOfPlayerLastMatches(player_id, amount = 20) {
  try {
    const LIMIT = 100;
    const pages = Math.ceil(amount / LIMIT);
    const res = [];
    for (let i = 0; i < pages; i++) {
      const matches = await getPlayerMatches(player_id, LIMIT, i);

      if (!matches?.length) break;

      res.push(...matches);
    }
    return res;
  } catch (e) {
    console.log(e);
  }
}
