import { withErrorHandling, fetchData } from '#utils';

export async function getPlayerMatches(player_id, amount = 20, page = 0) {
  const url = `https://api.faceit.com/stats/v1/stats/time/users/${player_id}/games/cs2?page=${page}&size=${amount}`;
  return withErrorHandling(() => fetchData(url), {
    error: 'FetchError',
    errorMessage: 'Unable to fetch player matches data.',
  })();
}
