import { SERVER_BASE_URL } from './api.js';

// api helper functions
export const GAME_API_BASE = `${SERVER_BASE_URL}/game`;

export const apiReturnToDeck = (gameGuid, card) =>
    fetch(`${GAME_API_BASE}/placecardonbottomofdeck/${gameGuid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  }).catch((error) => console.error("Return to deck failed:", error));

  
export const apiMoveToStadium = (gameGuid, card) =>
    fetch(`${GAME_API_BASE}/movetostadium/${gameGuid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  }).catch((error) => console.error("Move card to stadium failed:", error));

export const apiDrawPrize = (gameGuid, setPrizes, prizeNum, callback) =>
    fetch(`${GAME_API_BASE}/drawcardfromprizes/${gameGuid}`)
    .then((response) => response.json())
    .then((data) => {
      data.prizeCard.attachedCards = [];
      data.prizeCard.damageCounters = 0;
      setPrizes((prize) => prize.filter((n) => n != prizeNum));
      if (data.remainingPrizes == 0) {
        apiEndGame(gameGuid, callback);
        return false;
      }
      return true;
    });

export const apiDrawTopCard = (gameGuid) =>
    fetch(`${GAME_API_BASE}/drawcardfromdeck/${gameGuid}`)
    .then((response) => response.json())
    .then((data) => {
      data.attachedCards = [];
      data.damageCounters = 0;
    });

export const apiEndGame = (gameGuid, callback) =>
    fetch(`${GAME_API_BASE}/endgame/${gameGuid}`, { method: "PUT" }).then((response) => {
    if (response.status == 204) callback({ ended: true });
  });

export const apiFlipCoin = (gameGuid, setCoinResult) =>
    fetch(`${GAME_API_BASE}/flipcoin/${gameGuid}`)
    .then((response) => response.json())
    .then((data) => setCoinResult(data));

export const apiShuffleDeck = (gameGuid) =>
    fetch(`${GAME_API_BASE}/shuffledeck/${gameGuid}`, { method: "PUT" });

export const apiFetchCardsFromDeck = (gameGuid, setCardsInDeck) =>
    fetch(`${GAME_API_BASE}/peekatallcardsindeck/${gameGuid}`)
    .then((response) => response.json())
    .then((data) => setCardsInDeck(data));

export const apiDrawSpecificCard = (gameGuid, card, cardsInDeck, setCardsInDeck) =>
    fetch(`${GAME_API_BASE}/drawthiscardfromdeck/${gameGuid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  }).then((response) => {
    if (response.status == 204) {
      card.attachedCards = [];
      card.damageCounters = 0;
      setCardsInDeck(cardsInDeck.filter((c) => c.numberInDeck != card.numberInDeck));
    }
  });
  
export const apiDrawSpecificCardFromDiscard = (gameGuid, card, discard, setDiscard) =>
    fetch(`${GAME_API_BASE}/drawthiscardfromdiscard/${gameGuid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  }).then((response) => {
    if (response.status == 204) {
      card.attachedCards = [];
      card.damageCounters = 0;
      setDiscard(discard.filter((c) => c.numberInDeck != card.numberInDeck));
    }
  });

export const apiDiscardCard = (gameGuid, card) =>
    fetch(`${GAME_API_BASE}/discardcard/${gameGuid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  });

export const apiSendToTempHand = (gameGuid, card) =>
    fetch(`${GAME_API_BASE}/sendtotemphand/${gameGuid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  });

export const apiSendToHand = (gameGuid, card) =>
    fetch(`${GAME_API_BASE}/sendtohand/${gameGuid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  });

export const apiMoveToActive = (gameGuid, card) =>
    fetch(`${GAME_API_BASE}/movetoactive/${gameGuid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mainCard: card, attachedCards: card.attachedCards, damageCounters: card.damageCounters }),
  });

export const apiMoveToBench = (gameGuid, card) =>
    fetch(`${GAME_API_BASE}/movetobench/${gameGuid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mainCard: card, attachedCards: card.attachedCards, damageCounters: card.damageCounters }),
  });

export const apiSwapActiveWithBench = (gameGuid, card1, card2) =>
    fetch(`${GAME_API_BASE}/swapactivewithbench/${gameGuid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([
      { mainCard: card1, attachedCards: card1.attachedCards, damageCounters: card1.damageCounters },
      { mainCard: card2, attachedCards: card2.attachedCards, damageCounters: card2.damageCounters }
    ]),
  });

export const apiAttachCard = (gameGuid, card, attachedToCard) =>
    fetch(`${GAME_API_BASE}/attachcard/${gameGuid}/${attachedToCard.numberInDeck}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  });

export const apiGetHand = (gameGuid, setHand) =>
    fetch(`${GAME_API_BASE}/gethand/${gameGuid}`)
    .then((response) => response.json())
    .then((data) => {
        const expandedHand = data.map((card) => ({
          ...card,
          attachedCards: [],
          damageCounters: 0,
        }));
      setHand(expandedHand);
    });

export const apiFetchValidEvolutions = (pokemonName) =>
    fetch(`${GAME_API_BASE}/getvalidevolutions/${pokemonName}`)
    .then((response) => (response.ok ? response.json() : []))
    .catch(() => []);

export const apiFetchLog = (gameGuid, setLogEntries) =>
    fetch(`${GAME_API_BASE}/getgamehistory/${gameGuid}`)
    .then((response) => response.json())
    .then((data) => {
      const logEntries = data.logs.map((log) => ({
        ...log,
        displayDateTime: new Date(log.timestamp).toLocaleString()
      }));
      setLogEntries(logEntries);
    });

    
export const apiDiscardHand = (gameGuid) =>
    fetch(`${GAME_API_BASE}/discardhand/${gameGuid}`);


export const apiAddDamageCounters = (gameGuid, card, amount) =>
    fetch(`${GAME_API_BASE}/adddamagecounters/${gameGuid}/${card.numberInDeck}/${amount}`, {
    method: "PUT"
  });
  
export const apiRemoveDamageCounters = (gameGuid, card, amount) =>
    fetch(`${GAME_API_BASE}/removedamagecounters/${gameGuid}/${card.numberInDeck}/${amount}`, {
    method: "PUT"
  });