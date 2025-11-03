import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from "react-modal";
import * as signalR from "@microsoft/signalr";
import PublicPlayArea from "./PublicPlayArea.jsx";
import CoinFlip from "./CoinFlip.jsx";
import Loading from "./Loading.jsx";
import {
  placeCardInSpot,
  attachOrSwapCard,
} from "./gameLogic.js";
import {
  apiReturnToDeck,
  apiDrawPrize,
  apiDrawTopCard,
  apiEndGame,
  apiFlipCoin,
  apiShuffleDeck,
  apiFetchCardsFromDeck,
  apiDrawSpecificCard,
  apiGetHand
} from "./gameApi.js";
import "./App.css";

const Public = () => {
  const { gameGuid } = useParams();
  const navigate = useNavigate();
  Modal.setAppElement("#root");
  const [temphand, setTemphand] = useState([]);
  const [active, setActive] = useState(null);
  const [bench, setBench] = useState([]);
  const [discard, setDiscard] = useState([]);
  const [prizes, setPrizes] = useState([0, 3, 1, 4, 2, 5]);
  const [coinResult, setCoinResult] = useState(null);
  const [isSelectingDeck, setIsSelectingDeck] = useState(false);
  const [isSelectingDiscard, setIsSelectingDiscard] = useState(false);
  const [cardsInDeck, setCardsInDeck] = useState([]);
  const [numberInDeck, setNumberInDeck] = useState(47);
  const [rerenderKey, setRerenderKey] = useState(0);
  const [loadingDone, setLoadingDone] = useState(false);
  
  const cardCallback = (data) => {
    if (data.pos == -1) return;
    placeCardInSpot({
    card: data.card,
    spot: data.pos,
    isPublicCaller: true,
    state: { hand: temphand, active, bench, discard },
    setState: { setHand: setTemphand, setActive, setBench, setDiscard },
    helpers: {
        attachOrSwapCard: (gameGuid, card, isActive, benchPos) =>
        attachOrSwapCard(gameGuid, card, isActive, benchPos, { hand: temphand, active, bench, discard }, { setHand: setTemphand, setActive, setBench, setDiscard }),
        apiReturnToDeck,
    },
    gameGuid,
    });
  };
    
  // api handlers
  const drawPrize = (prizeNum) =>
    apiDrawPrize(gameGuid, temphand, setTemphand, setPrizes, prizeNum, function() {});
  const drawTopCard = () => apiDrawTopCard(gameGuid, temphand, setTemphand);
  const endGame = () => {
    apiEndGame(gameGuid, function() {});
    navigate("/pokeclient/gameover");
  };
  const getCoinFlip = () => apiFlipCoin(setCoinResult);
  const closeCoinFlip = () => setCoinResult(null);
  const handleShuffle = () => apiShuffleDeck(gameGuid);
  const handleSelectFromDeck = () => {
    apiFetchCardsFromDeck(gameGuid, setCardsInDeck);
    setIsSelectingDeck(true);
  };
  const handleCloseSelectFromDeck = () => setIsSelectingDeck(false);
  const handleSelectFromDiscard = () => setIsSelectingDiscard(true);
  const handleCloseSelectFromDiscard = () => setIsSelectingDiscard(false);
  const addFromDeckToHand = (card) =>
    apiDrawSpecificCard(gameGuid, card, temphand, setTemphand, cardsInDeck, setCardsInDeck);
  const addFromDiscardToHand = (card) => {
    card.attachedCards = [];
    card.damageCounters = 0;
    setTemphand([...temphand, card]);
    setDiscard(discard.filter((c) => c.numberInDeck != card.numberInDeck));
  };
  
    // this way won't work with two devices, need to rethink
    useEffect(() => {
      let totalAttached = 0;
      if (bench) bench.forEach((c) => (totalAttached += c.attachedCards.length));
      if (active) totalAttached += active.attachedCards.length;
      setNumberInDeck(
        60 -
          temphand.length -
          bench.length -
          discard.length -
          prizes.length -
          (active ? 1 : 0) -
          totalAttached
      );
    }, [temphand, active, bench, discard, prizes]);

  // on mount
  useEffect(() => {
    if (!gameGuid) return;

    const connection = new signalR.HubConnectionBuilder()
        .withUrl("https://pokeserverv2-age7btb6fwabhee2.canadacentral-01.azurewebsites.net/notifications") // Adjust to your backend URL
        .withAutomaticReconnect()
        .build();

    // receive messages from server
    connection.on("CardAddedToPlayArea", (message) => {
        console.log("Message from SignalR hub: card moved to play area", message);
        message.damageCounters = 0;
        message.attachedCards = [];
        setTemphand(prevTemphand => [...prevTemphand, message]);
    });
    connection.on("CardReturnedToHand", (message) => {
        console.log("Message from SignalR hub: card returned to hand", message);
    });

    // start connection
    connection.start()
    .then(() => {
        connection.invoke("JoinGameGroup", gameGuid);
        console.log("Connected to SignalR hub");
        setTimeout(() => setLoadingDone(true), 2000);
    })
    .catch((err) => console.error("Connection failed: ", err));

    return () => {
        connection.stop();
    };
  }, []);

  return (
    <>
      {!loadingDone && <Loading />}

      {isSelectingDeck && (
        <Modal
          className="card-overlay-container"
          isOpen={isSelectingDeck}
          onRequestClose={handleCloseSelectFromDeck}
        >
          {cardsInDeck.map((card) => (
            <a
              href="#"
              key={"deckselect" + card.numberInDeck}
              onClick={() => addFromDeckToHand(card)}
            >
              <img src={`${card.image}/low.webp`} className="card-size" />
            </a>
          ))}
          <button onClick={handleCloseSelectFromDeck}>
            Done selecting cards
          </button>
        </Modal>
      )}

      {isSelectingDiscard && (
        <Modal
          className="card-overlay-container"
          isOpen={isSelectingDiscard}
          onRequestClose={handleCloseSelectFromDiscard}
        >
          {discard.map((card) => (
            <a
              href="#"
              key={"discardselect" + card.numberInDeck}
              onClick={() => addFromDiscardToHand(card)}
            >
              <img src={`${card.image}/low.webp`} className="card-size" />
            </a>
          ))}
          <button onClick={handleCloseSelectFromDiscard}>
            Done selecting cards
          </button>
        </Modal>
      )}

      {loadingDone && (
        <>
          <PublicPlayArea
            temphand={temphand}
            bench={bench}
            active={active}
            discard={discard}
            prizes={prizes}
            numberInDeck={numberInDeck}
            rerenderKey={rerenderKey}
            cardCallback={cardCallback}
            drawPrize={drawPrize}
            handleSelectFromDiscard={handleSelectFromDiscard}
            handleSelectFromDeck={handleSelectFromDeck}
            handleShuffle={handleShuffle}
          />
          <button id="flip-coin-button" onClick={getCoinFlip}>flip coin</button>
          <button id="draw-card-button" onClick={drawTopCard}>draw</button>
          <button id="end-game-button" onClick={endGame}>end game</button>
        </>
      )}

      {coinResult != null && (
        <Modal
          className="coin-flip-container"
          isOpen={coinResult != null}
          onRequestClose={closeCoinFlip}
        >
          <CoinFlip isHeads={coinResult} />
        </Modal>
      )}
    </>
  );
};

export default Public;
