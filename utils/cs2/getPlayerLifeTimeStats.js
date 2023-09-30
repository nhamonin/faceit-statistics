import { withErrorHandling, fetchData } from '#utils';

export async function getPlayerLifeTimeStats(player_id) {
  const url = `https://api.faceit.com/stats/v1/stats/users/${player_id}/games/cs2`;
  return withErrorHandling(() => fetchData(url), {
    error: 'FetchError',
    errorMessage: 'Unable to fetch player lifetime stats data.',
  })();
}
