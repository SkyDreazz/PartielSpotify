import React, { useState } from "react";
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css'; // Importation du CSS pour SimpleBar
import "./nav.css";
import Fav from "../../images/favoris.png";
import New from "../../images/New.png";
import Expand from "../../images/Expand.png";
import { TitlePlaylist } from "../modals/title_playlist";

const Nav = ({ playlists, recentTracks, accessToken }) => {
  const [expanded, setExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

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

  return (
    <div className={`nav-content ${expanded ? "expanded" : ""}`}>
      {/* Ajout de accessToken */}
      <TitlePlaylist
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedPlaylist={selectedPlaylist}
        accessToken={accessToken} 
      />
      <div className="head">
        <img src={Fav} alt="Favoris" />
        <img src={New} alt="Nouveau" />
        <img
          src={Expand}
          alt="Expand"
          style={{ cursor: "pointer" }}
          onClick={handleExpandClick}
        />
      </div>
      <div className={`playlist-thumbnails`}>
        <h3 className={`infostitle ${expanded ? "expanded" : ""}`}>Mes playlists :</h3>
        {playlists.map((playlist, index) => (
          <div
            className={`infos ${expanded ? "expanded" : ""}`}
            key={index}
            onClick={() => handlePlaylistClick(playlist)} // ✅ Correction ici
          >
            <img src={playlist.images[0]?.url} alt={playlist.name} />
            <p className={`playlist-name ${expanded ? "show" : "hide"}`}>{playlist.name}</p>
          </div>
        ))}
      </div>

      <div className="recently-played">
        <h3 className={`infostitle ${expanded ? "expanded" : ""}`}>Dernières écoutes :</h3>
        {recentTracks.length > 0 ? (
          <div className="playlistinfos-container">
            <SimpleBar style={{ maxHeight: '25vh' }} className="playlistinfos">
              {recentTracks.map((track, index) => (
                <div key={index} className={`infos ${expanded ? "expanded" : ""}`}>
                  <img src={track.imageUrl} alt={track.name} />
                  <p className={`playlist-name ${expanded ? "show" : "hide"}`}>{track.name} - {track.artist}</p>
                </div>
              ))}
            </SimpleBar>
          </div>
        ) : (
          <p>Aucun titre récemment joué.</p>
        )}
      </div>
    </div>
  );
};

export default Nav;
