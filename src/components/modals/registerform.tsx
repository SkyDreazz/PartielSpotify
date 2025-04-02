import React, { useState, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import "./Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ModalRegisterForm({ isOpen, onClose }: ModalProps) {
  const nodeRef = useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    gender: "",
    birthday: "",
  });

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
      const response = await fetch("http://localhost:5500/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Formulaire envoyé");
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
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
            />
            <div>
              <input
                type="radio"
                name="gender"
                value="Masculin"
                checked={formData.gender === "Masculin"}
                onChange={handleChange}
              />
              <label>Masculin</label>

              <input
                type="radio"
                name="gender"
                value="Feminin"
                checked={formData.gender === "Feminin"}
                onChange={handleChange}
              />
              <label>Féminin</label>

              <input
                type="radio"
                name="gender"
                value="Autre"
                checked={formData.gender === "Autre"}
                onChange={handleChange}
              />
              <label>Autre</label>
            </div>
            <div>
              <label htmlFor="birthday">Date de Naissance : </label>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
              />
            </div>
            <button className="submit" type="submit">S'inscrire</button>
          </form>
        </div>
      </div>
    </CSSTransition>
  );
}
