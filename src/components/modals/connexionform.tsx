import React, { useState, useRef, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import "./Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ModalConnexionForm({ isOpen, onClose }: ModalProps) {
  const nodeRef = useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [connected, setConnected] = useState(false);

  const handleClose = () => {
    onClose();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5500/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data)
        handleClose();
        localStorage.setItem("connected", "true");
        const firstLetter = data.firstLetter;
        localStorage.setItem('userFirstLetter', firstLetter);
        console.log("Connecté ! Première lettre :", firstLetter);
      } else {
        alert("Erreur lors de l'envoi du formulaire.");
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi du formulaire");
    }
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
      <div className="modal-overlay" ref={nodeRef}>
        <div className="modal-content">
          <button className="close-btn" onClick={handleClose}>
            Fermer
          </button>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
            />
            <button className="submit" type="submit">Se connecter</button>
          </form>
        </div>
      </div>
    </CSSTransition>
  );
}
