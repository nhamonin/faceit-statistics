import { withErrorHandling, fetchData } from '#utils';

export async function getMatchData(match_id) {
  const url = `https://api.faceit.com/match/v2/match/${match_id}`;
  return withErrorHandling(() => fetchData(url), {
    error: 'FetchError',
    errorMessage: 'Unable to fetch match data.',
  })();
}
