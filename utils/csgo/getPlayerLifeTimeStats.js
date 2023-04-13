import { fetch } from 'undici';

import { withErrorHandling } from '#utils';

export async function getPlayerLifeTimeStats(player_id) {
  return withErrorHandling(async () => {
    const url = `https://api.faceit.com/stats/v1/stats/users/${player_id}/games/csgo`;
    const res = await fetch(url);
    if (res.ok) return res.json();
  })();
}
