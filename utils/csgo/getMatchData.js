import fetch from 'node-fetch-retry';

export async function getMatchData(match_id) {
  try {
    const url = `https://api.faceit.com/match/v2/match/${match_id}`;
    const res = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: 0,
      },
      retry: 5,
      pause: 1000,
      callback: (retry) => {
        console.log(`Trying: ${retry}`);
      },
    });
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
