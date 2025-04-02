import React, { useState } from "react";
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css'; // Importation du CSS pour SimpleBar
import "./nav.css";
import Fav from "../../images/favoris.png";
import New from "../../images/New.png";
import Expand from "../../images/Expand.png";
import { ModalConnexionForm } from "../modals/connexionform";
import { TitlePlaylist } from "../modals/title_playlist";

const Nav = ({ playlists, recentTracks }) => {
  const [expanded, setExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handlePlaylistClick = (playlist) => {
    setSelectedPlaylist(playlist);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlaylist(null);
  };

  return (
    <div className={`nav-content ${expanded ? "expanded" : ""}`}>
        <TitlePlaylist isOpen={isModalOpen} onClose={closeModal}></TitlePlaylist>
        <div className="head">
            <img src={Fav} alt="" />
            <img src={New} alt="" />
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
            <div className={`infos ${expanded ? "expanded" : ""}`} key={index} onClick={() => handlePlaylistClick}>
                <img src={playlist.images[0]?.url} alt={playlist.name} />
                <p className={`playlist-name ${expanded ? "show" : "hide"}`}>{playlist.name}</p>
            </div>
            ))}
        </div>

        <div className="recently-played">
            <h3 className={`infostitle ${expanded ? "expanded" : ""}`}>Dernières écoutes :</h3>
            {recentTracks.length > 0 ? (
            <div className="playlistinfos-container"> {/* Conteneur pour la scrollbar externe */}
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
