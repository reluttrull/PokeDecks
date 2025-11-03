// PublicPlayArea.jsx
import React from 'react';
import PrivateCard from './PrivateCard.jsx';
import './App.css';

const PrivatePlayArea = ({
  hand, rerenderKey,
  cardCallback,
}) => {
  return (
    <div>
      {/* Hand */}
      <div id="private-hand-area" className="card-target">
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