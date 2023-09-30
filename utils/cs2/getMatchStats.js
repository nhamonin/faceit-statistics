import { withErrorHandling, fetchData } from '#utils';

export async function getMatchStats(match_id) {
  const url = `https://api.faceit.com/stats/v1/stats/matches/${match_id}`;
  return withErrorHandling(() => fetchData(url), {
    error: 'FetchError',
    errorMessage: 'Unable to fetch match stats data.',
  })();
}
