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
      callback: (retry) => {
        console.log(`Trying: ${retry}`);
      },
    });
    if (res.ok) return res.json();
  } catch (e) {
    console.log(e);
  }
}
