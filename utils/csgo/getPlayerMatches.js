import fetch from 'node-fetch';

export async function getPlayerMatches(player_id, amount = 20, page = 0) {
  const url = `https://api.faceit.com/stats/v1/stats/time/users/${player_id}/games/csgo?page=${page}&size=${amount}`;
  const response = await fetch(url);
  const matches = await response.json();

  return matches;
}
