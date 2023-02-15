import { fetch } from 'undici';

export async function getPlayerMatches(player_id, amount = 20, page = 0) {
  try {
    const url = `https://api.faceit.com/stats/v1/stats/time/users/${player_id}/games/csgo?page=${page}&size=${amount}`;
    const res = await fetch(url);
    if (res.ok) return res.json();
  } catch (e) {
    console.log(e);
  }
}
