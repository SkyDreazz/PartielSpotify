import React, { useEffect, useState } from "react";
import { ModalRegisterForm } from "../modals/registerform";
import { ModalConnexionForm } from "../modals/connexionform";
import Logo from "../../images/logo.png"
import "./header.css"
import { useNavigate } from "react-router-dom";

export function Header({onSearch}) {
  const nav = useNavigate();
  const [searchQuery, setSearchQuery] = useState(''); // État pour le texte de recherche

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Empêche la soumission par défaut du formulaire
    onSearch(searchQuery); // Appeler la fonction de recherche dans le parent
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnexionModalOpen, setIsConnexionModalOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [firstLetter, setFirstLetter] = useState("");

  useEffect(() => {
    const storeConnection = localStorage.getItem('connected') === "true" ? true : false;
    setConnected(storeConnection);

    setFirstLetter(localStorage.getItem("userFirstLetter"));
  })

  const openModal = (e) => {
    if (e.target.className === "connexion") {
      setIsConnexionModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  }

  const logOut = () => {
    localStorage.setItem("connected", "false");
    setConnected(false)
  }

  const closeModal = () => {
    setIsModalOpen(false);
    setIsConnexionModalOpen(false)
  }

  return (
    <div className="header">
      <ModalRegisterForm isOpen={isModalOpen} onClose={closeModal}></ModalRegisterForm>
      <ModalConnexionForm isOpen={isConnexionModalOpen} onClose={closeModal}></ModalConnexionForm>
      
      <div>
        <img src={Logo} alt="Logo" />
      </div>

      {/* Formulaire de recherche */}
      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Recherche une chanson..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={{width: "30vw"}}
        />
      </form>

      {connected ? (
        <>
          <div>
            <div className="user">
              <h2>{firstLetter}</h2>
            </div>
            <button onClick={logOut}>Déconnexion</button>
          </div>
        </>
      ) : (
        <>
          <div>
            <button onClick={openModal}>S'inscrire</button>
            <button className="connexion" onClick={openModal}>Se Connecter</button>
          </div>
        </>
      )}
    </div>
  );
}
