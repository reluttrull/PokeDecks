// api helper functions
const BASE = `${process.env.REACT_APP_SERVER_BASE_URL}/game`;

export const apiReturnToDeck = (card, gameGuid) =>
  fetch(`${BASE}/placecardonbottomofdeck/${gameGuid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  }).catch((error) => console.error("Return to deck failed:", error));

export const apiDrawPrize = (gameGuid, setPrizes, prizeNum, callback) =>
  fetch(`${BASE}/drawcardfromprizes/${gameGuid}`)
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
  fetch(`${BASE}/drawcardfromdeck/${gameGuid}`)
    .then((response) => response.json())
    .then((data) => {
      data.attachedCards = [];
      data.damageCounters = 0;
    });

export const apiEndGame = (gameGuid, callback) =>
  fetch(`${BASE}/endgame/${gameGuid}`, { method: "PUT" }).then((response) => {
    if (response.status == 204) callback({ ended: true });
  });

export const apiFlipCoin = (gameGuid, setCoinResult) =>
  fetch(`${BASE}/flipcoin/${gameGuid}`)
    .then((response) => response.json())
    .then((data) => setCoinResult(data));

export const apiShuffleDeck = (gameGuid) =>
  fetch(`${BASE}/shuffledeck/${gameGuid}`, { method: "PUT" });

export const apiFetchCardsFromDeck = (gameGuid, setCardsInDeck) =>
  fetch(`${BASE}/peekatallcardsindeck/${gameGuid}`)
    .then((response) => response.json())
    .then((data) => setCardsInDeck(data));

export const apiDrawSpecificCard = (gameGuid, card, cardsInDeck, setCardsInDeck) =>
  fetch(`${BASE}/drawthiscardfromdeck/${gameGuid}`, {
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
  fetch(`${BASE}/drawthiscardfromdiscard/${gameGuid}`, {
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
  fetch(`${BASE}/discardcard/${gameGuid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  });

export const apiSendToTempHand = (gameGuid, card) =>
  fetch(`${BASE}/sendtotemphand/${gameGuid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  });

export const apiSendToHand = (gameGuid, card) =>
  fetch(`${BASE}/sendtohand/${gameGuid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  });

export const apiMoveToActive = (gameGuid, card) =>
  fetch(`${BASE}/movetoactive/${gameGuid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mainCard: card, attachedCards: card.attachedCards, damageCounters: card.damageCounters }),
  });

export const apiMoveToBench = (gameGuid, card) =>
  fetch(`${BASE}/movetobench/${gameGuid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mainCard: card, attachedCards: card.attachedCards, damageCounters: card.damageCounters }),
  });

export const apiSwapActiveWithBench = (gameGuid, card1, card2) =>
  fetch(`${BASE}/swapactivewithbench/${gameGuid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([
      { mainCard: card1, attachedCards: card1.attachedCards, damageCounters: card1.damageCounters },
      { mainCard: card2, attachedCards: card2.attachedCards, damageCounters: card2.damageCounters }
    ]),
  });

export const apiAttachCard = (gameGuid, card, attachedToCard) =>
  fetch(`${BASE}/attachcard/${gameGuid}/${attachedToCard.numberInDeck}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  });

export const apiGetHand = (gameGuid, setHand) =>
  fetch(`${BASE}/gethand/${gameGuid}`)
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
  fetch(`${BASE}/getvalidevolutions/${pokemonName}`)
    .then((response) => (response.ok ? response.json() : []))
    .catch(() => []);

export const apiFetchLog = (gameGuid, setLogEntries) =>
  fetch(`${BASE}/getgamehistory/${gameGuid}`)
    .then((response) => response.json())
    .then((data) => {
      const logEntries = data.logs.map((log) => ({
        ...log,
        displayDateTime: new Date(log.timestamp).toLocaleString()
      }));
      setLogEntries(logEntries);
    });

    
export const apiDiscardHand = (gameGuid) =>
  fetch(`${BASE}/discardhand/${gameGuid}`);


export const apiAddDamageCounters = (gameGuid, card, amount) =>
  fetch(`${BASE}/adddamagecounters/${gameGuid}/${card.numberInDeck}/${amount}`, {
    method: "PUT"
  });
  
export const apiRemoveDamageCounters = (gameGuid, card, amount) =>
  fetch(`${BASE}/removedamagecounters/${gameGuid}/${card.numberInDeck}/${amount}`, {
    method: "PUT"
  });