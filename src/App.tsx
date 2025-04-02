import React, { useEffect, useState } from "react";
import './App.css';
import { Header } from "./components/header/header.component.tsx";
import Nav from "./components/nav/nav.component.tsx";
import { TitlePlaylist } from "./components/modals/title_playlist.tsx";
import { ChatBoxMessage } from "./components/chatgroup/chatgroup.component.tsx";

function App() {
  const [recentTracks, setRecentTracks] = useState([]); // Derniers morceaux écoutés
  const [topArtists, setTopArtists] = useState([]); // Artistes les plus écoutés
  const [accessToken, setAccessToken] = useState('');
  const [playlist, setPlaylist] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  const SPOTIFY_CLIENT_ID = 'be200dbb6f9f48bd8593b798a0cbc68f'; // Ton Client ID
  const REDIRECT_URI = "http://localhost:3000"; // URI de redirection (même URL que celle de ton app)
  const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
  const RESPONSE_TYPE = 'token'; // Utilisation du "Implicit Grant Flow"
  const SCOPES = [
    'user-read-recently-played',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-follow-read', // S'assurer que ce scope est bien ajouté
  ];
  
  const login = () => {
    const authUrl = `${AUTH_ENDPOINT}?client_id=${SPOTIFY_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join("%20")}`;
    window.location.href = authUrl;
  };

  const searchTracks = (query) => {
    if (query) {
      fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=5`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          console.log("Résultats de recherche:", data);
          setSearchResults(data.tracks.items || []);  // Mettre à jour les résultats de la recherche
        })
        .catch(error => console.error('Erreur lors de la recherche:', error));
    } else {
      setSearchResults([]);  // Si aucun texte, réinitialiser les résultats
    }
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

  // Récupérer les artistes les plus écoutés
  useEffect(() => {
    if (accessToken) {
      fetch('https://api.spotify.com/v1/me/following?type=artist', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          console.log("Réponse complète des artistes :", data); // Affiche toute la réponse
          if (data.artists.items) {
            console.log("Artistes les plus écoutés :", data.items);
            setTopArtists(data.artists.items);  // Utiliser les artistes si présents
          } else {
            console.error("Pas d'éléments dans la réponse des artistes",  "data :", data,  "data.items :", data.items);
          }
        })
        .catch(error => console.error('Erreur lors de la récupération des artistes les plus écoutés:', error));
    }
  }, [accessToken]);

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
    }
    // else {
    //   setAccessToken("");
    // }
  }, [accessToken]);

  const handlePlaylistClick = async (playlist) => {
    console.log("Playlist cliquée :", playlist);

    try {
      const response = await fetch(playlist.tracks.href, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des morceaux");
      }

      const data = await response.json();
      console.log("Morceaux de la playlist :", data);

      setSelectedPlaylist({ ...playlist, 
        tracks: { 
          ...playlist.tracks,
          items: data.items 
        } 
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Erreur de chargement des morceaux :", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlaylist(null);
  };

  const formatDuration = (durationMs) => {
    const minutes = Math.floor(durationMs / 60000); // 1 minute = 60 000 ms
    const seconds = ((durationMs % 60000) / 1000).toFixed(0); // Récupérer les secondes
    return `${minutes}min ${seconds.padStart(2, '0')}s`; // Assurer un format correct
  };

  console.log(accessToken)

  return (
    <div className="App">
      <Header onSearch={searchTracks}/>
      <div className="main-content">
        <Nav playlists={playlist} recentTracks={recentTracks} accessToken={accessToken}></Nav>
        <TitlePlaylist isOpen={isModalOpen} onClose={closeModal} accessToken={accessToken} selectedPlaylist={selectedPlaylist}></TitlePlaylist>
        
        <div className="last-content">
          {accessToken ? (
            <p></p>
          ) : (
            <button onClick={login}>Se connecter avec Spotify</button>
          )}
          <div className="search-results">
            <h2 style={{display: `${searchResults.length > 0 ? "block" : "none"}`}}>Résultats de la recherche :</h2>
            <div className="results">
              {searchResults.length > 0 ? (
                searchResults.map((track, index) => (
                    <div key={index} className="track">
                      <img src={track.album.images[0]?.url} alt={track.name} />
                        <p>{track.name} - {track.artists[0].name} / {formatDuration(track.duration_ms)}</p>
                    </div>
                ))
              ) : (
                <div style={{display: "none"}}>
                  <p>Aucun résultat trouvé.</p>
                </div>
              )}
            </div>
          </div>
          <h2>Derniers titres écoutés :</h2>
          <div>
            {recentTracks.length > 0 ? (
              <div className="recently-played">
                {recentTracks.map((track, index) => (
                  <div key={index} className="title">
                    <img src={track.imageUrl} alt={track.name} />
                    <p>{track.name} - {track.artist}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>Aucun titre récemment joué.</p>
            )}
          </div>

          {/* Affichage des artistes les plus écoutés */}
          <h2>Artistes que tu suis :</h2>
          <div>
            {topArtists.length > 0 ? (
              <div className="top-artists">
                {topArtists.map((artist, index) => (
                  <div key={index} className="artist">
                    <img src={artist.images[0]?.url} alt={artist.name} />
                    <p>{artist.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>Aucun artiste trouvé.</p>
            )}
          </div>

          <h2>Mes playlists</h2>
          <div>
            {playlist.length > 0 ? (
              <div className="playlist-container">
                {playlist.map((playlist, index) => (
                  <div key={index} className="playlist" onClick={() => handlePlaylistClick(playlist)}>
                    <img src={playlist.images[0]?.url} alt={playlist.name} />
                    <div className="artists">
                      <p>{playlist.name}</p>
                      <p><strong>Artistes :</strong> {playlist.artists.join(", ")}</p>
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
            
            <h2>Mes groupes de chat :</h2>
            <div className="group-chat">
              <div style={{
                width: "11vw",
                display: "flex",
                flexWrap: "wrap",
                gap: "1vw",
                backgroundColor: "#630B1A",
                padding: "0.5vw",
                borderRadius: "0.5vw"
              }} onClick={openChat}>
                {groupchat.map((data) => (
                  <div style={{
                    width: "5vw",
                    borderRadius: data.rad ? data.rad : "0.5vw",
                    backgroundColor: data.color,
                  }}>
                    <h3>{data.name}</h3>
                  </div>
                ))}
              </div>
              <div style={{
                width: "11vw",
                display: "flex",
                flexWrap: "wrap",
                gap: "1vw",
                backgroundColor: "#630B1A",
                padding: "0.5vw",
                borderRadius: "0.5vw"
              }} onClick={openChat}>
                {groupchat.map((data) => (
                  <div style={{
                    width: "5vw",
                    borderRadius: data.rad ? data.rad : "0.5vw",
                    backgroundColor: data.color
                  }}>
                    <h3>{data.name}</h3>
                  </div>
                ))}
              </div>
              <div style={{
                width: "11vw",
                display: "flex",
                flexWrap: "wrap",
                gap: "1vw",
                backgroundColor: "#630B1A",
                padding: "0.5vw",
                borderRadius: "0.5vw"
              }} onClick={openChat}>
                {groupchat.map((data) => (
                  <div style={{
                    width: "5vw",
                    borderRadius: data.rad ? data.rad : "0.5vw",
                    backgroundColor: data.color
                  }}>
                    <h3>{data.name}</h3>
                  </div>
                ))}
              </div>
              <div style={{
                width: "11vw",
                display: "flex",
                flexWrap: "wrap",
                gap: "1vw",
                backgroundColor: "#630B1A",
                padding: "0.5vw",
                borderRadius: "0.5vw"
              }} onClick={openChat}>
                {groupchat.map((data) => (
                  <div style={{
                    width: "5vw",
                    borderRadius: data.rad ? data.rad : "0.5vw",
                    backgroundColor: data.color
                  }}>
                    <h3>{data.name}</h3>
                  </div>
                ))}
              </div>
            </div>

          {isChatOpen && (
            <div className="modal-overlay-chat">
              <div className="modal-content-chat">
                <button className="close-btn-chat" onClick={closeChat}>Fermer le groupe chat</button>
                <h2>Groupe chat avec Yness et 2 autres</h2>
                <ChatBoxMessage />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;

const groupchat = [
  {
    color: "#FF9B9B",
    name: "Y"
  },
  {
    color: "#7CC8FF",
    name: "C"
  },
  {
    color: "#FF9B9B",
    name: "N"
  },
  {
    color: "#2AFD82",
    name: "+2",
    rad: "50vw"
  }

]