/*
------
*/
const TOKEN = "";
const PLAYLISTNAME = "Test";
const TRACKNAME = "NutShell - Alice in Chains";
const PLAYLISTSIZE = 100; //Max 100

async function fetchWebApi(endpoint, method, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    method,
    body: method === "GET" ? null : JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error.message);
  }

  return await res.json();
}

async function searchTrackByName(trackName) {
  const query = encodeURIComponent(trackName);
  const data = await fetchWebApi(
    `v1/search?q=${query}&type=track&limit=1`,
    "GET"
  );
  if (data.tracks.items.length === 0) {
    throw new Error("Nenhuma música encontrada com esse nome.");
  }
  return data.tracks.items[0].id;
}

async function getRecommendations(seedTrackId) {
  const data = await fetchWebApi(
    `v1/recommendations?limit=${PLAYLISTSIZE}&seed_tracks=${seedTrackId}`,
    "GET"
  );
  return data.tracks.map((track) => track.uri);
}

async function getUserId() {
  const data = await fetchWebApi("v1/me", "GET");
  return data.id;
}

async function main() {
  try {
    const userId = await getUserId();
    const createdPlaylist = await fetchWebApi(
      `v1/users/${userId}/playlists`,
      "POST",
      {
        name: PLAYLISTNAME,
        public: false,
        description: "",
      }
    );

    const seedTrackId = await searchTrackByName(TRACKNAME);
    const recommendations = await getRecommendations(seedTrackId);

    await fetchWebApi(`v1/playlists/${createdPlaylist.id}/tracks`, "POST", {
      uris: recommendations,
    });
    console.log("Success - Created playlist with recommendations.");
  } catch (error) {
    console.error("Error o get the recommendations:", error);
  }
}

main();
