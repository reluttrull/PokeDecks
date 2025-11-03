// PublicPlayArea.jsx
import React from 'react';
import { PiCardsThree } from 'react-icons/pi';
import PrivateCard from './PrivateCard.jsx';
import './App.css';

const PrivatePlayArea = ({
  hand, rerenderKey,
  cardCallback, tightenHandLayout
}) => {
  return (
    <div>
      {/* Hand */}
      <div id="private-hand-area" className="card-target">
        <PiCardsThree
          id="hand-tighten-button"
          className="icon-button"
          onClick={tightenHandLayout}
          alt="tighten up hand layout"
          title="tighten up hand layout"
        />
        {hand.map((card, index) => (
          <PrivateCard
            key={`${card.numberInDeck}-${rerenderKey}`}
            data={card}
            startOffset={index * 30}
            positionCallback={cardCallback}
          />
        ))}
      </div>
      <div id="move-to-play-zone">move to play area</div>
    </div>
  );
};

export default PrivatePlayArea;