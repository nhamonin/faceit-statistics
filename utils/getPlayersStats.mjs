export default async function getPlayersStats(faceitIDs) {
  return await Promise.all(
    faceitIDs.map((faceitID) =>
      fetch(`https://open.faceit.com/data/v4/players/${faceitID}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.FACEIT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .catch((error) => {
          console.error('Error: ', error);
        })
    )
  );
}
