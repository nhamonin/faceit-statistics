import { fetch } from 'undici';

import { withErrorHandling } from '#utils';

export async function getMatchStats(match_id) {
  return withErrorHandling(async () => {
    const url = `https://api.faceit.com/stats/v1/stats/matches/${match_id}`;
    const res = await fetch(url);
    if (res.ok) return res.json();
  })();
}
