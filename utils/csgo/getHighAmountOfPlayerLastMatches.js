import { MAX_MATCHES_PER_REQUEST } from '#config';
import { getPlayerMatches } from '#utils';

export async function getHighAmountOfPlayerLastMatches(player_id, amount = 20) {
  try {
    const pages = Math.ceil(amount / MAX_MATCHES_PER_REQUEST);
    const res = [];
    for (let i = 0; i < pages; i++) {
      const matches = await getPlayerMatches(
        player_id,
        MAX_MATCHES_PER_REQUEST,
        i
      );

      if (!matches?.length) break;

      res.push(...matches);
    }
    return res;
  } catch (e) {
    console.log(e);
  }
}
