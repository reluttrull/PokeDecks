import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as signalR from "@microsoft/signalr";
import {
  apiGetHand, apiSendToPlayArea
} from "./gameApi.js";
import PrivatePlayArea from './PrivatePlayArea.jsx';
import "./App.css";

const Private = () => {
  const { gameGuid } = useParams();
  const navigate = useNavigate();
  const [hand, setHand] = useState([]);
  const [rerenderKey, setRerenderKey] = useState(0);
  
  const cardCallback = (data) => {
    let card = data.card;
    apiSendToPlayArea(gameGuid, card);
    // may not need to do anything else here
  };

  // on mount
  useEffect(() => {
    apiGetHand(gameGuid, setHand);

    if (!gameGuid) return;

    const connection = new signalR.HubConnectionBuilder()
        .withUrl("https://pokeserverv2-age7btb6fwabhee2.canadacentral-01.azurewebsites.net/notifications") // Adjust to your backend URL
        .withAutomaticReconnect()
        .build();

    // receive messages from server
    connection.on("CardAddedToPlayArea", (message) => {
        console.log("Message from SignalR hub: card moved to play area", message);
        setHand(prevHand => prevHand.filter(c => c.numberInDeck !== message.numberInDeck));
    });
    connection.on("CardMovedToHand", (message) => {
        console.log("Message from SignalR hub: card returned to hand", message);
        message.damageCounters = 0;
        message.attachedCards = [];
        setHand(prevHand => [...prevHand, message]);
    });

    // start connection
    connection.start()
    .then(() => {
        connection.invoke("JoinGameGroup", gameGuid);
        console.log("Connected to SignalR hub");
    })
    .catch((err) => console.error("Connection failed: ", err));

    return () => {
        connection.stop();
    };
  }, []);

  return (
    <>
          <PrivatePlayArea
            hand={hand}
            rerenderKey={rerenderKey}
            cardCallback={cardCallback}
          />
    </>
  );
};

export default Private;