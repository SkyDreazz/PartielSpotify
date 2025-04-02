import React, { useEffect, useState } from "react";
import './App.css';
import { Header } from "./components/header/header.component.tsx";
import Nav from "./components/nav/nav.component.tsx";

function App() {
  const [recentTracks, setRecentTracks] = useState([]);
  const [accessToken, setAccessToken] = useState('');
  const [playlist, setPlaylist] = useState([]);

  const SPOTIFY_CLIENT_ID = 'be200dbb6f9f48bd8593b798a0cbc68f'; // Ton Client ID
  const REDIRECT_URI = "http://localhost:3000"; // URI de redirection (même URL que celle de ton app)
  const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
  const RESPONSE_TYPE = 'token'; // Utilisation du "Implicit Grant Flow"
  const SCOPES = [
    'user-read-recently-played', 
    'playlist-read-private', 
    'playlist-read-collaborative'
  ];
  

  // Fonction de login qui redirige l'utilisateur vers Spotify
  const login = () => {
    setAccessToken(''); // Réinitialiser le token à chaque nouvelle tentative de login
    const authUrl = `${AUTH_ENDPOINT}?client_id=${SPOTIFY_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join("%20")}`;
    window.location.href = authUrl;
    console.log("token d'accès : ", accessToken);
  };

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.slice(1));  
    const token = params.get('access_token');
  
    if (token) {
      setAccessToken(token);
      localStorage.setItem('spotifyAccessToken', token);  // Sauvegarde dans localStorage
      window.location.hash = '';  // Nettoyer l'URL après avoir extrait le token
    } else {
      const storedToken = localStorage.getItem('spotifyAccessToken');
      if (storedToken) {
        setAccessToken(storedToken);  // Récupération du token stocké
      }
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetch(`https://api.spotify.com/v1/me/playlists?limit=4`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
        .then(response => response.json())
        .then(async (data) => {
          console.log("Playlists récupérées :", data); // Debug
  
          if (data.items) {
            // Récupérer les artistes pour chaque playlist
            const playlistsWithArtists = await Promise.all(
              data.items.map(async (playlist) => {
                // Fetch les morceaux de la playlist
                const tracksResponse = await fetch(
                  `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
                  {
                    headers: { Authorization: `Bearer ${accessToken}` },
                  }
                );
                const tracksData = await tracksResponse.json();
  
                // Extraire les artistes uniques
                const artists = Array.from(new Set<string>(tracksData.items.map((item) => item.track.artists[0].name))).slice(0,5);
  
                return { ...playlist, artists };
              })
            );
  
            setPlaylist(playlistsWithArtists);
          } else {
            console.error("Erreur : Aucun items dans la réponse de Spotify", data);
          }
        })
        .catch(error => console.error('Erreur lors de la récupération des playlists:', error));
    }
  }, [accessToken]);
  
  
  

  useEffect(() => {
    if (accessToken) {
      const fetchRecentlyPlayed = () => {
        fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=8`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        })
          .then(response => response.json())
          .then(data => {
            // Récupération de l'image de la chanson via l'album
            const tracksWithImages = data.items.map(item => ({
              name: item.track.name,
              artist: item.track.artists[0].name,
              imageUrl: item.track.album.images[0]?.url, // Utilisation de la première image de l'album
            }));
            setRecentTracks(tracksWithImages);
          })
          .catch(error => console.error('Error fetching recently played tracks:', error));
      };

      // Récupérer les derniers morceaux écoutés au démarrage
      fetchRecentlyPlayed();

      // Mettre à jour les derniers morceaux écoutés toutes les 30 secondes
      const intervalId = setInterval(fetchRecentlyPlayed, 30000);

      // Nettoyer l'intervalle lorsqu'on quitte la page
      return () => clearInterval(intervalId);
    } else {
      // setAccessToken("")
    }
  }, [accessToken]);

  console.log(accessToken)

  return (
    <div className="App">
      <Header />
      <div className="main-content">
        <Nav playlists={playlist} recentTracks={recentTracks}></Nav>
        {/* <div style={{width: "8vw"}}>

        </div> */}
        <div className="last-content">
          {accessToken ? (
            <p></p>
          ) : (
            <button onClick={login}>Se connecter avec Spotify</button>
          )}
          <h2>Derniers titres écoutés :</h2>
          <div>
            {recentTracks.length > 0 ? (
              <div className="recently-played">
                {recentTracks.map((track, index) => (
                  <div key={index} className="title">
                    <img src={track.imageUrl} alt={track.name} /> {/* Affichage de l'image */}
                    <p>{track.name} - {track.artist}</p>
                  </div>
                  ))}
              </div>
            ) : (
              <p>Aucun titre récemment joué.</p>
            )}
          </div>
          <h2>Mes playlists</h2>
          <div>
            {playlist.length > 0 ? (
              <div className="playlist-container">
                {playlist.map((playlist, index) => (
                  <div key={index} className="playlist">
                    <img src={playlist.images[0]?.url} alt={playlist.name} />
                    <div className="artists">
                      <p>{playlist.name}</p>
                      <p><strong>Artistes :</strong> {playlist.artists.join(", ")}</p> {/* Affichage des artistes */}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <p>Aucune playlist</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
