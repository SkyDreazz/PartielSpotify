import React, { useEffect, useState } from "react";
import { ModalRegisterForm } from "../modals/registerform";
import { ModalConnexionForm } from "../modals/connexionform";
import Logo from "../../images/logo.png"
import "./header.css"
import { useNavigate } from "react-router-dom";

export function Header(){

    const nav = useNavigate()

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
            {connected ? (
                <>
                <div>
                    <img src={Logo} onClick={() => nav("/")} alt="" />
                </div>
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
                    <img src={Logo} alt="" />
                </div>
                <div>
                    <button onClick={openModal}>S'inscrire</button>
                    <button className="connexion" onClick={openModal}>Se Connecter</button>
                </div>
                </>
            )}
        </div>
    )
}