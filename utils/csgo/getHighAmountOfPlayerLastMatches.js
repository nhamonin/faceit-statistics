import { MAX_MATCHES_PER_REQUEST } from '#config';
import { getPlayerMatches } from '#utils';

export async function getHighAmountOfPlayerLastMatches(player_id, amount = 20) {
  try {
    const pages = [
      ...Array(Math.ceil(amount / MAX_MATCHES_PER_REQUEST)).keys(),
    ];
    const res = [];

    for await (const page of pages) {
      const matches = await getPlayerMatches(
        player_id,
        MAX_MATCHES_PER_REQUEST,
        page
      );

      if (!matches?.length) break;

      res.push(...matches);
    }
    return res;
  } catch (e) {
    console.log(e);
  }
}
