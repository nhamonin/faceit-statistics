import fetch from 'node-fetch';

export async function getPlayerLifeTimeStats(player_id) {
  try {
    const url = `https://api.faceit.com/stats/v1/stats/users/${player_id}/games/csgo`;
    const response = await fetch(url);
    const matches = await response.json();

    return matches;
  } catch (e) {
    console.log(e);
  }
}
