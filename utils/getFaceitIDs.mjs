export default async function getFaceitIDs(nicknames) {
  return await Promise.all(
    nicknames.map((nickname) =>
      fetch(
        `https://open.faceit.com/data/v4/search/players?nickname=${encodeURIComponent(
          nickname
        )}&game=csgo&offset=0`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.FACEIT_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )
        .then((response) => response.json())
        .then((data) => data.items[0].player_id)
        .catch((error) => {
          console.error('Error: ', error);
        })
    )
  );
}
