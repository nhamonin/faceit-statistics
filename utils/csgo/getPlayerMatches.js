import fetch from 'node-fetch';

export async function getPlayerMatches(player_id, amount = 20, page = 0) {
  try {
    const url = `https://api.faceit.com/stats/v1/stats/time/users/${player_id}/games/csgo?page=${page}&size=${amount}`;
    const res = await fetch(url);
    if (res.ok) {
      return res.json();
    } else {
      console.log(
        `Status code error: ${res.status}. Reason: ${res.statusText} Endpoint: ${url}`
      );
    }
  } catch (e) {
    console.log(e);
  }
}
