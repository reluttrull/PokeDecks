// PublicPlayArea.jsx
import React from 'react';
import PublicCard from './PublicCard.jsx';
import StaticCard from './StaticCard.jsx';
import PrizeCard from './PrizeCard.jsx';
import Deck from './Deck.jsx';
import './App.css';

const PublicPlayArea = ({
  temphand, bench, active, discard, prizes,
  numberInDeck, rerenderKey,
  cardCallback,
  drawPrize, handleSelectFromDiscard,
  handleSelectFromDeck, handleShuffle
}) => {
  return (
    <div>
      {/* Debug info */}
      <div style={{position: 'absolute', top: '50px', left: '700px', width: '200px'}}>active card = {active && active.name}</div>
      <div style={{position: 'absolute', top: '150px', left: '700px', width: '200px'}}># cards in bench = {bench?.length}</div>

      {/* Active */}
      <div id="user-active" className="card-target">
        {active && <PublicCard key={active.numberInDeck} data={active} startOffset={0} positionCallback={cardCallback} />}
      </div>

      {/* Bench */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} id={`user-bench-${i + 1}`} className="card-target">
          {bench.length > i && <PublicCard key={bench[i].numberInDeck} data={bench[i]} startOffset={0} positionCallback={cardCallback} />}
        </div>
      ))}

      {/* Discard */}
      <div id="discard-area" className="card-target">
        <button id="discard-select-button" className="button" onClick={handleSelectFromDiscard}>
          Select from discard
        </button>
        {discard.length > 0 && (
          <StaticCard key={discard[0].numberInDeck} data={discard[0]} />
        )}
      </div>

      {/* Deck */}
      <Deck displayNum={numberInDeck} shuffleCallback={handleShuffle} selectCallback={handleSelectFromDeck} />

      {/* Prizes */}
      {prizes.map((prizeNum) => (
        <a href="#" key={prizeNum} onClick={() => drawPrize(prizeNum)}>
          <PrizeCard prizeNum={prizeNum} />
        </a>
      ))}

      {/* Temp Hand */}
      <div id="hand-area" className="card-target">
        {temphand.map((card, index) => (
          <PublicCard
            key={`${card.numberInDeck}-${rerenderKey}`}
            data={card}
            startOffset={index * 30}
            positionCallback={cardCallback}
          />
        ))}
      </div>
      <div id="return-to-hand-zone">return to hand</div>
    </div>
  );
};

export default PublicPlayArea;