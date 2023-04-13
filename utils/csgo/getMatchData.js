import { fetch } from 'undici';

import { withErrorHandling } from '#utils';

export async function getMatchData(match_id) {
  return withErrorHandling(async () => {
    const url = `https://api.faceit.com/match/v2/match/${match_id}`;
    const res = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: 0,
      },
    });
    console.log('11');
    if (res.ok) return res.json();
  })();
}
