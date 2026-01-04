import React, { useEffect, useState } from 'react';
import Modal from "react-modal";
import { useParams, useNavigate } from 'react-router-dom';
import * as signalR from "@microsoft/signalr";
import { tightenHandLayoutLogic } from "./gameLogic.js";
import {
  apiGetHand, apiSendToTempHand, apiFetchLog, apiDiscardHand
} from "./gameApi.js";
import PrivatePlayArea from './PrivatePlayArea.jsx';
import confirm from './ConfirmationDialog.jsx';
import "./App.css";

const Private = () => {
  const { gameGuid } = useParams();
  const navigate = useNavigate();
  const [hand, setHand] = useState([]);
  const [rerenderKey, setRerenderKey] = useState(0);
  const [logEntries, setLogEntries] = useState([]);
  const [isLogOpen, setIsLogOpen] = useState(false);
  Modal.setAppElement("#root");
  Modal.defaultStyles.overlay.backgroundColor = 'rgba(255, 255, 255, 0.85)';
  
  const cardCallback = (data) => {
    let card = data.card;
    apiSendToTempHand(gameGuid, card);
    // may not need to do anything else here
  };
  const tightenHandLayout = () =>
    tightenHandLayoutLogic(hand, setHand, setRerenderKey);
  const handleCheckLog = () => {
    apiFetchLog(gameGuid, setLogEntries);
    setIsLogOpen(true);
  };
  const handleCloseLog = () => setIsLogOpen(false);
  const handleDiscardHand =  async () => {
    if (await confirm({ confirmation: 'Do you really want to discard your whole hand?' })) {
      apiDiscardHand(gameGuid);
    }
  }

  // on mount
  useEffect(() => {
    apiGetHand(gameGuid, setHand);

    if (!gameGuid) return;

    const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${process.env.REACT_APP_SERVER_BASE_URL}/notifications`)
        .withAutomaticReconnect()
        .build();

    // receive messages from server
    connection.on("HandChanged", (message) => {
        console.log("Message from SignalR hub: hand changed", message);
        tightenHandLayoutLogic(message, setHand, setRerenderKey); // set once, in the correct order
    });
    connection.on("GameOver", () => {
      console.log("Message from SignalR hub: game over");
      navigate("/gameover");
    });

    // start connection
    connection.start()
    .then(() => {
        connection.invoke("JoinGameGroup", gameGuid);
        console.log("Connected to SignalR hub");
    })
    .catch((err) => console.error("Connection failed: ", err));

    connection.onreconnected(() => {
      console.log("Reconnected, rejoining group...");
      connection.invoke("JoinGameGroup", gameGuid);
    });

    return () => {
        connection.stop();
    };
  }, []);

  return (
    <>
      <Modal
        className="scrollable-modal"
        isOpen={isLogOpen}
        onRequestClose={handleCloseLog}
      >
        {logEntries && logEntries.map((log) => (
          <div className="log-item"
              key={"log-" + log.timestamp}>
            <div>
              <span><strong>{log.name}</strong></span><span style={{float:'right'}}><em>{log.displayDateTime}</em></span>
            </div>
            <div>
              {log.involvedCards && log.involvedCards.map((card) => (
                <img
                  key={`log-${log.timestamp}-${card.numberInDeck}`}
                  src={`${card.image}/low.webp`} className="tiny-card-size" />
              ))}
              {log.eventType == 504 && <img src="/PokeDecks/coinHeads.png" className="tiny-coin-size" />}
              {log.eventType == 505 && <img src="/PokeDecks/coinTails.png" className="tiny-coin-size" />}
            </div>
            <hr />
          </div>
        ))}
        <button style={{marginTop:'20px'}} onClick={handleCloseLog}>Done</button>
      </Modal>
      <PrivatePlayArea
        hand={hand}
        rerenderKey={rerenderKey}
        cardCallback={cardCallback}
        tightenHandLayout={tightenHandLayout}
      />
      <button className="button" id="game-logs-button" onClick={handleCheckLog}>Game log</button>
      <button className="button" id="discard-hand-button" onClick={handleDiscardHand}>Discard hand</button>
    </>
  );
};

export default Private;