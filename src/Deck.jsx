import React, { useState } from 'react';
import './Shuffle.css';
import './App.css';

const Deck = ({displayNum, shuffleCallback, selectCallback}) => {
    const [isAnimated, setIsAnimated] = useState(false);
    const [seenDeckOrder, setSeenDeckOrder] = useState(false);

    function handleSelect (event) {
        setSeenDeckOrder(true);
        selectCallback();
    }

    function handleShuffle (event) {
        setSeenDeckOrder(false);
        setIsAnimated(true);
        shuffleCallback();
        setTimeout(() => setIsAnimated(false), 5000);
    }

  return (
    <>
    <div className="card-target" id="deck">
        <div className={isAnimated ? "card-list is-animated" : "card-list"}>
            <div className="card-list__item" data-card="0">
                <img src="/pokeclient/cardback.png" className="card-size" />
            </div>
            <div className="card-list__item" data-card="1">
                <img src="/pokeclient/cardback.png" className="card-size" />
            </div>
            <div className="card-list__item" data-card="2">
                <img src="/pokeclient/cardback.png" className="card-size" />
            </div>
        </div>
        <button id="deck-select-button" className="button" onClick={handleSelect}>Select from deck</button>
        <button id="deck-shuffle-button" className={seenDeckOrder ? "shuffle-button shuffle-reminder" : "shuffle-button"} onClick={handleShuffle}>Shuffle</button>
        <div id="number-in-deck-display">{displayNum}</div>
    </div>
    </>
  );
};

export default Deck;
