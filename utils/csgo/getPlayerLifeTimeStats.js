import fetch from 'node-fetch';

export async function getPlayerLifeTimeStats(player_id) {
  try {
    const url = `https://api.faceit.com/stats/v1/stats/users/${player_id}/games/csgo`;
    const res = await fetch(url);
    if (res.ok) {
      return res.json();
    } else {
      console.log(
        `Status code error : ${res.status}. Reason: ${res.statusText}`
      );
    }
  } catch (e) {
    console.log(e);
  }
}
