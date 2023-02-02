import fetch from 'node-fetch';

export async function getMatchData(match_id) {
  const url = `https://api.faceit.com/match/v2/match/${match_id}`;
  const response = await fetch(url);
  const data = await response.json();

  return data;
}
