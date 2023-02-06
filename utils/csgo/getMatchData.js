import fetch from 'node-fetch';

export async function getMatchData(match_id) {
  try {
    const url = `https://api.faceit.com/match/v2/match/${match_id}`;
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
