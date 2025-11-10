// logic helper functions
import { apiFetchValidEvolutions, apiSendToHand, apiDiscardCard,
    apiMoveToActive, apiMoveToBench,
    apiSwapActiveWithBench, apiAttachCard } from "./gameApi.js";

function allowedToBeInEmptySpot(card) {
  // Clefairy Doll loophole
  if (card.name == "Clefairy Doll") return true;
  // must be a Pokemon card
  if (card.category != "Pokemon") return false;
  // always allow basics
  if (card.stage == "Basic") return true;
  // allow evolutions to move once in play
  if (card.attachedCards.length > 0) return true;
  return false;
}

export function initializeGame(deckNumber, gameGuid) {
  fetch(
    `${process.env.REACT_APP_SERVER_BASE_URL}/game/getnewgame/${deckNumber}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (!data) throw "Game data empty!";
      if (data.gameGuid) gameGuid.current = data.gameGuid;
      // TODO: display mulligans
    })
    .catch((err) => console.error("Error fetching game start:", err));
}

export async function placeCardInSpot({
  card,
  spot,
  isPublicCaller,
  state,
  setState,
  helpers,
  gameGuid,
}) {
  const { hand, active, bench } = state;
  const { setHand } = setState;
  const { attachOrSwapCard, apiReturnToDeck } = helpers;
  let guid = !gameGuid ? gameGuid.current : gameGuid;

  switch (spot) {
    case -2: // real hand: dropped in public bottom zone
      if (card.attachedCards.length > 0) {
        const handattached = card.attachedCards.map((c) => ({
          ...c,
          damageCounters: 0,
        }));
        handattached.forEach(c => apiSendToHand(guid, c));
      }
      apiSendToHand(guid, card);
      break;
    case -1: // temp hand: dropped in private top zone
      console.log(isPublicCaller, hand, card);
      if (!isPublicCaller && hand.includes(card)) { // real hand includes
        setHand(hand.filter((c) => c.numberInDeck != card.numberInDeck));
        card.attachedCards = [];
        card.damageCounters = 0;
      }
      break;
    case 0:
      if (active) { // placed in occupied spot, try to attach or swap
        let attachedOk = await attachOrSwapCard(guid, card, true);
        if (!attachedOk) return;
      } else {
        if (!allowedToBeInEmptySpot(card)) {
          return; // placed in an empty spot but not allowed to be
        }
        let attached = card.attachedCards;
        apiMoveToActive(guid, card);
      }
      break;

    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
      const idx = spot - 1;
      if (bench.length > idx && bench[idx]) { // placed in occupied spot, try to attach or swap
        let attachedOk = await attachOrSwapCard(guid, card, false, idx);
        if (!attachedOk) return;
      } else {
        if (!allowedToBeInEmptySpot(card))
          return; // placed in an empty spot but not allowed to be
        apiMoveToBench(guid, card);

      }
      break;

    case 6:
      console.log(card);
      card.attachedCards.forEach((c) => apiDiscardCard(guid, c));
      apiDiscardCard(guid, card);
      break;

    case 7:
      card.attachedCards.forEach((c) => apiReturnToDeck(c, guid));
      apiReturnToDeck(card, guid);
      break;
  }
}

export function tightenHandLayoutLogic(hand, setHand, setRerenderKey) {
  const sorted = [...hand].sort((a, b) =>
    a.category.localeCompare(b.category) // sort by card type
  );
  setHand(sorted);
  setRerenderKey((p) => p + 1); // make sure hand re-renders
}

function shouldAttachAsEnergy(baseCard, cardToAttach) {
  if (cardToAttach.category == "Energy") return true;
  if (baseCard.name != "Voltorb" && cardToAttach.name == "Electrode" && cardToAttach.attachedCards.length > 0) {
    return true;
  }
  return false;
}

export async function attachOrSwapCard(
  guid,
  cardToAttach,
  isActive,
  benchPosition = -1,
  state
) {
  const { hand, active, bench } = state;

  // handle Pokémon Breeder evolution shortcut
  if (cardToAttach.name == "Pokémon Breeder") {
    const baseName = isActive ? active.name : bench[benchPosition].name;
    const validStageOneNames = await apiFetchValidEvolutions(baseName);
    const stageTwo = hand.find((card) =>
      validStageOneNames.includes(card.evolveFrom)
    );
    if (!stageTwo) {
      console.log(
        `Pokémon Breeder: ${baseName} cannot evolve right now — sending back to hand`
      );
      return false;
    }

    // evolution logic
    if (isActive) {
      stageTwo.attachedCards = [...active.attachedCards, active];
      stageTwo.damageCounters = active.damageCounters;
      apiMoveToActive(guid, stageTwo);
    } else {
      stageTwo.attachedCards = [
        ...bench[benchPosition].attachedCards,
        bench[benchPosition],
      ];
      stageTwo.damageCounters = bench[benchPosition].damageCounters;
      apiMoveToBench(guid, stageTwo);
    }
    // discard Pokémon Breeder
    apiDiscardCard(guid, cardToAttach);
    return false;
  }

  if (isActive) {
    if (shouldAttachAsEnergy(active, cardToAttach)) { // attach energy?
      // handle Electrode Buzzap power
      cardToAttach.attachedCards.forEach(c => apiDiscardCard(guid, c));
      cardToAttach.attachedCards = [];
      apiAttachCard(guid, cardToAttach, active);
    } else if (hand.includes(cardToAttach) &&
      cardToAttach.evolveFrom == active.name) { // evolve?
      cardToAttach.attachedCards = active.attachedCards;
      active.attachedCards = [];
      cardToAttach.attachedCards.push(active);
      cardToAttach.damageCounters = active.damageCounters;
      apiMoveToActive(guid, cardToAttach);
    } else if (bench.includes(cardToAttach)) { // swap with bench?
      const newActive = cardToAttach;
      const newBench = active;
      apiSwapActiveWithBench(guid, newActive, newBench);
      return false;
    } else return false;

    return true;
  }

  if (shouldAttachAsEnergy(bench[benchPosition], cardToAttach)) { // attach energy?
    // handle Electrode Buzzap power
    cardToAttach.attachedCards.forEach(c => apiDiscardCard(guid, c));
    cardToAttach.attachedCards = [];
    apiAttachCard(guid, cardToAttach, bench[benchPosition]);
  } else if (hand.includes(cardToAttach) &&
    cardToAttach.evolveFrom == bench[benchPosition].name) { // evolve?
    let evolved = cardToAttach;
    evolved.attachedCards = bench[benchPosition].attachedCards;
    bench[benchPosition].attachedCards = [];
    evolved.attachedCards.push(bench[benchPosition]);
    evolved.damageCounters = bench[benchPosition].damageCounters;
    apiMoveToBench(guid, evolved);
  } else if (active == cardToAttach) { // swap with active?
      apiSwapActiveWithBench(guid, bench[benchPosition], cardToAttach);
    return false;
  } else return false;

  return true;
}