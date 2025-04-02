import React, { useEffect, useState, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import "./Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlaylist: any;
  accessToken: string;
}

export function TitlePlaylist({ isOpen, onClose, selectedPlaylist, accessToken }: ModalProps) {
  const nodeRef = useRef(null);
  const [tracks, setTracks] = useState([]); // 🔹 Ajout d'un state pour stocker les morceaux

  useEffect(() => {
    if (isOpen && selectedPlaylist?.tracks?.href) {
      fetch(selectedPlaylist.tracks.href, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then(response => response.json())
        .then(data => {
          console.log("Morceaux récupérés :", data); // 🔹 Debugging
          setTracks(data.items); // 🔹 Mise à jour du state avec les morceaux
        })
        .catch(error => console.error("Erreur de chargement des morceaux :", error));
    }
  }, [isOpen, selectedPlaylist, accessToken]);

  const handleClose = () => {
    onClose();
  };

  return (
    <CSSTransition
      in={isOpen}
      timeout={300}
      classNames="modal"
      unmountOnExit
      onExited={onClose}
      nodeRef={nodeRef}
    >
      <div className="modal-overlay-nav" ref={nodeRef}>
        <div className="modal-content-nav">
          <button className="close-btn" onClick={handleClose}>
            Fermer
          </button>
          <h2>Playlist : {selectedPlaylist?.name}</h2>

          <div>
          {tracks.length > 0 ? (
            <div className="track-block">
              {tracks.map((item: any, index) => (
                <div key={index}>
                    {/* Vérification de l'existence de l'image */}
                    {item.track.album?.images?.[0]?.url ? (
                      <img src={item.track.album.images[0].url} alt="track image" />
                    ) : (
                      <div style={{ width: '40px', height: '40px', backgroundColor: '#ddd', borderRadius: '8px' }} />
                    )}
                    <p>{item.track.name} - {item.track.artists[0]?.name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>Aucun titre disponible.</p>
          )}
          </div>
        </div>
      </div>
    </CSSTransition>
  );
}
