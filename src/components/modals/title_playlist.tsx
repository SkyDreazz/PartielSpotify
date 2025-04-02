import React from "react";
import "./Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TitlePlaylist({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null; // Si la modale n'est pas ouverte, ne pas rendre quoi que ce soit

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          Fermer
        </button>
        <h2>LOOOL</h2>
      </div>
    </div>
  );
}
