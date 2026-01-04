import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from "react-modal";
import * as signalR from "@microsoft/signalr";
import PublicPlayArea from "./PublicPlayArea.jsx";
import CoinFlip from "./CoinFlip.jsx";
import Loading from "./Loading.jsx";
import QRWrapper from "./QRWrapper.jsx";
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
  apiDrawSpecificCardFromDiscard,
  apiAddDamageCounters,
  apiRemoveDamageCounters
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
  const [stadium, setStadium] = useState(null);
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
    state: { hand: temphand, active, bench },
    setState: { setHand: setTemphand },
    helpers: {
        attachOrSwapCard: (gameGuid, card, isActive, benchPos) =>
        attachOrSwapCard(gameGuid, card, isActive, benchPos, { hand: temphand, active, bench }),
        apiReturnToDeck,
    },
    gameGuid,
    });
  };
    
  // api handlers
  async function drawPrize(prizeNum) {
    let gameActive = await apiDrawPrize(gameGuid, setPrizes, prizeNum, function() {});
    if (!gameActive) endGame();
  }
  const drawTopCard = () => apiDrawTopCard(gameGuid);
  const endGame = () => {
    apiEndGame(gameGuid, function() {});
    navigate("/gameover");
  };
  const getCoinFlip = () => apiFlipCoin(gameGuid, setCoinResult);
  const closeCoinFlip = () => setCoinResult(null);
  const handleShuffle = () => apiShuffleDeck(gameGuid);
  const handleSelectFromDeck = () => {
    apiFetchCardsFromDeck(gameGuid, setCardsInDeck);
    setIsSelectingDeck(true);
  };
  const handleCloseSelectFromDeck = () => setIsSelectingDeck(false);
  const handleSelectFromDiscard = () => setIsSelectingDiscard(true);
  const handleDiscardHand =  async () => {
    if (await confirm({ confirmation: 'Do you really want to discard your whole hand?' })) {
      setDiscard([...hand, ...discard]);
      setHand([]);
    }
  }
  const handleCloseSelectFromDiscard = () => setIsSelectingDiscard(false);
  const addFromDeckToHand = (card) =>
    apiDrawSpecificCard(gameGuid, card, cardsInDeck, setCardsInDeck);
  const addFromDiscardToHand = (card) => {
    card.attachedCards = [];
    card.damageCounters = 0;
    apiDrawSpecificCardFromDiscard(gameGuid, card, discard, setDiscard);
    setDiscard(discard.filter((c) => c.numberInDeck != card.numberInDeck));
  };
  const handleDamageChange = (data) => {
    if (data.change > 0) apiAddDamageCounters(gameGuid, data.card, data.change);
    else if (data.change < 0) apiRemoveDamageCounters(gameGuid, data.card, Math.abs(data.change));
  };

  // on mount
  useEffect(() => {
    if (!gameGuid) return;

    const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_SERVER_BASE_URL}/notifications`)
        .withAutomaticReconnect()
        .build();

    // receive messages from server
    connection.on("TempHandChanged", (message) => {
        console.log("Message from SignalR hub: temp hand changed", message);
        let newTemphand = message.map(card => { return { ...card, attachedCards: [], damageCounters: 0 }});
        setTemphand(newTemphand);
    });
    connection.on("DeckChanged", (message) => {
        console.log("Message from SignalR hub: number of cards in deck changed", message);
        setNumberInDeck(message);
    });
    connection.on("DiscardChanged", (message) => {
        console.log("Message from SignalR hub: discard pile changed", message);
        setDiscard(message);
    });
    connection.on("ActiveChanged", (message) => {
        console.log("Message from SignalR hub: active card changed", message);
        if (message.mainCard) {
          message.mainCard.attachedCards = message.attachedCards.map(ac => { return { ...ac, attachedCards: [], damageCounters: 0 }});
          message.mainCard.damageCounters = message.damageCounters;
        }
        setActive(message.mainCard);
    });
    connection.on("BenchChanged", (message) => {
        console.log("Message from SignalR hub: bench changed", message);
        let newBench = [];
        message.forEach(spot => {
          if (spot.mainCard) {
            spot.mainCard.attachedCards = spot.attachedCards.map(ac => { return { ...ac, attachedCards: [], damageCounters: 0 }});
            spot.mainCard.damageCounters = spot.damageCounters;
            newBench.push(spot.mainCard);
          }
        });
        setBench(newBench);
    });
    connection.on("StadiumChanged", (message) => {
        if (message) {
          message.attachedCards = [];
        }
        console.log("Message from SignalR hub: stadium changed", message);
        setStadium(message);
    });

    // start connection
    connection.start()
    .then(() => {
        connection.invoke("JoinGameGroup", gameGuid);
        console.log("Connected to SignalR hub");
        setTimeout(() => setLoadingDone(true), 2000);
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
      {!loadingDone && <Loading />}
      <Modal
        className="card-overlay-container scrollable-full-modal"
        isOpen={isSelectingDeck}
        onRequestClose={handleCloseSelectFromDeck}
      >
        {cardsInDeck.map((card) => (
          <img
            key={"deckselect" + card.numberInDeck}
            onClick={() => addFromDeckToHand(card)}
            src={`${card.image}/low.webp`} className="card-size icon-button" />
        ))}
        <button onClick={handleCloseSelectFromDeck}>
          Done selecting cards
        </button>
      </Modal>
      <Modal
        className="card-overlay-container scrollable-full-modal"
        isOpen={isSelectingDiscard}
        onRequestClose={handleCloseSelectFromDiscard}
      >
        {discard.map((card) => (
          <img 
          key={"discardselect" + card.numberInDeck}
          onClick={() => addFromDiscardToHand(card)}
          src={`${card.image}/low.webp`} className="card-size icon-button" />
        ))}
        <button onClick={handleCloseSelectFromDiscard}>
          Done selecting cards
        </button>
      </Modal>
      {loadingDone && (
        <>
          <PublicPlayArea
            temphand={temphand}
            bench={bench}
            active={active}
            discard={discard}
            stadium={stadium}
            prizes={prizes}
            numberInDeck={numberInDeck}
            rerenderKey={rerenderKey}
            cardCallback={cardCallback}
            damageCallback={handleDamageChange}
            drawPrize={drawPrize}
            handleSelectFromDiscard={handleSelectFromDiscard}
            handleDiscardHand={handleDiscardHand}
            handleSelectFromDeck={handleSelectFromDeck}
            handleShuffle={handleShuffle}
          />
          <div id="private-qr">
            <QRWrapper id="private-qr" url={window.location.href.replace('public', 'private')} />
          </div>
          <button id="flip-coin-button" className="button" onClick={getCoinFlip}>flip coin</button>
          <button id="draw-card-button" className="button" onClick={drawTopCard}>draw</button>
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
