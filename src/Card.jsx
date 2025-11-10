import React, { useEffect, useRef, useState } from 'react';
import { animate, useDrag, useValue, withSpring } from 'react-ui-animate';
import { FaCircleInfo } from 'react-icons/fa6';
import Modal from 'react-modal';
import AttachedEnergy from './AttachedEnergy.jsx';
import Damage from './Damage.jsx';
import SpecialConditions from './SpecialConditions.jsx';
import './App.css';

const Card = ({data, startOffset, positionCallback, isPublic, damageCallback}) => {
  const ref = useRef(null);
  const uuid = crypto.randomUUID();
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [translateX, setTranslateX] = useValue(startOffset);
  const [translateY, setTranslateY] = useValue(0);
  const [attachedEnergy, setAttachedEnergy] = useState([]);
  const [mockEnergy, setMockEnergy] = useState([]);
  const [rerenderEnergyKey, setRerenderEnergyKey] = useState(0);
  const [rerenderDmgKey, setRerenderDmgKey] = useState(0);
  let slowMotion = 15;

  let urlstring = `url('${data.image}/low.webp')`;
  let hqurlstring = `${data.image}/high.webp`;
  Modal.setAppElement('#root');
  const [backgroundImage, setBackgroundImage] = useValue(urlstring);
  const publicTargets = [
    { left: 80, top: 420, position: -1}, // temphand
    { left: 190, top: 420, position: -1}, // extend hand area right
    { left: 600, top: 85, position: 0 }, // active
    { left: 300, top: 275, position: 1 }, // bench 1
    { left: 450, top: 275, position: 2 }, // bench 2
    { left: 600, top: 275, position: 3 }, // bench 3
    { left: 750, top: 275, position: 4 }, // bench 4
    { left: 900, top: 275, position: 5 }, // bench 5
    { left: 1050, top: 465, position: 6 }, // discard
    { left: 1050, top: 310, position: 7 }, // deck
  ];
  
  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  function privateCheckDropTop(down, movementX, movementY, y) {
    const topZoneBottom = 80;
    if (y <= topZoneBottom) {
      setTranslateX(down ? movementX : withSpring(startOffset));
      setTranslateY(down ? movementY : withSpring(0));

      if (!down) {
        positionCallback({ card: data, pos: -1 });
        setTranslateX(withSpring(startOffset, {stiffness: slowMotion}));
        setTranslateY(withSpring(0, {stiffness: slowMotion}));
      }
      return true;
    }
    return false;
  }

  function publicCheckDropBottom(down, movementX, movementY, y) {
    const bottomZoneTop = 400;
    if (y >= bottomZoneTop) {
      setTranslateX(down ? movementX : withSpring(startOffset));
      setTranslateY(down ? movementY : withSpring(0));

      if (!down) {
        positionCallback({ card: data, pos: -2 });
        setTranslateX(withSpring(startOffset, {stiffness: slowMotion}));
        setTranslateY(withSpring(0, {stiffness: slowMotion}));
      }
      return true;
    }
    return false;
  }

  useDrag(ref, ({ down, movement }) => {
    if (!ref.current) return;

    const scrollX = window.scrollX; // account for scroll
    const scrollY = window.scrollY;

    const scale = window.visualViewport?.scale ?? 1; // account for zoom

    const rect = ref.current.getBoundingClientRect();
    const cardCenterX = (rect.left + rect.width / 2) / scale + scrollX;
    const cardCenterY = (rect.top + rect.height / 2) / scale + scrollY;
    
    // see if we're on any public target locations
    for (let i = 0; i < publicTargets.length; i++) {
      let target = publicTargets[i];
      if (cardCenterX >= target.left - 55 && cardCenterX <= target.left + 55
          && cardCenterY >= target.top - 81 && cardCenterY <= target.top + 81) {
        setTranslateX(down ? movement.x : withSpring(target.left + 2));
        setTranslateY(down ? movement.y : withSpring(target.top)); 
        if (!down) {
          positionCallback({ card: data, pos: target.position});
          setTranslateX(withSpring(startOffset, {stiffness: slowMotion}));
          setTranslateY(withSpring(0, {stiffness: slowMotion}));
        }
        return;
      }
    }

    
    if (isPublic && publicCheckDropBottom(down, movement.x, movement.y, cardCenterY)) return;
    if (!isPublic && privateCheckDropTop(down, movement.x, movement.y, cardCenterY)) return;

    setTranslateX(down ? movement.x : withSpring(startOffset));
    setTranslateY(down ? movement.y : withSpring(0));
  });

  function handleEnergyDelete(cardName) {
    console.log(`deleting ${cardName} from this card`);
    let energyCard = null;
    for (let i = data.attachedCards.length - 1; i >= 0; i--) {
      if (data.attachedCards[i].name == cardName) {
        energyCard = data.attachedCards[i];
        data.attachedCards.splice(i, 1);
        break;
      }
    }
    if (energyCard) {
      positionCallback({ card: energyCard, pos: 6}); // send to discard
    }
    
    // make sure state updates
    setAttachedEnergy(data.attachedCards
          .filter((attachedCard) => attachedCard.category == "Energy")
          .toSorted((a,b) => a.name - b.name));
  }

  function handleSendDmg(change) {
    damageCallback({card:data, change:change});
  }

  function isTreatedAsPokemon() {
    if (data.category == "Pokemon") return true;
    if (data.name == "Clefairy Doll") return true;
    return false;
  }

  useEffect(() => {
    if (!data.attachedCards) return;
    setAttachedEnergy(data.attachedCards
          .filter((attachedCard) => attachedCard.category == "Energy")
          .toSorted((a,b) => a.name - b.name));
    setMockEnergy(data.attachedCards
          .filter((attachedCard) => attachedCard.name == "Electrode"));
    setRerenderEnergyKey((p) => p + 1);
    }, [JSON.stringify(data.attachedCards)]);

  return (
    <>
    <animate.div
      key={uuid}
      ref={ref}
      style={{
        position: 'absolute',
        cursor: 'grab',
        translateX,
        translateY,
        width: 120,
        height: 165,
        backgroundImage,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        borderRadius: 4,
        zIndex: 1000,
        userSelect: "none",
        touchAction: "none"
      }}
    />
    <animate.div
      style={{
        position: 'absolute',
        translateX,
        translateY,
      }}
    >
      <FaCircleInfo className="info-block" onClick={openModal} alt="see full card" title="see full card" />
      {attachedEnergy.length > 0 && 
          attachedEnergy.map((card, index) => (
        <AttachedEnergy key={card.numberInDeck} cardName={card.name} offset={index * 20} deleteCallback={handleEnergyDelete} />
      ))}
      {mockEnergy.length > 0 &&
          mockEnergy.map((card, index) => (
        <div key={`${card.numberInDeck}-${rerenderEnergyKey}`}>
          <AttachedEnergy cardName={card.name} 
              offset={(attachedEnergy.length * 20) + (index * 40)} deleteCallback={handleEnergyDelete} />
          <AttachedEnergy cardName={card.name} 
              offset={(attachedEnergy.length * 20) + (index * 40) + 20} deleteCallback={handleEnergyDelete} />
        </div>
      ))}
      {isTreatedAsPokemon && <Damage key={`${data.numberInDeck}-dmg${rerenderDmgKey}`} damageCounters={data.damageCounters} damageCallback={handleSendDmg} />}
      {isTreatedAsPokemon && <SpecialConditions />}
    </animate.div>
    <Modal className="card-overlay-container"
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Card Overlay"
        onClick={closeModal}
      ><img className="card-overlay" src={hqurlstring} />
    </Modal>
    </>
  );
};

export default Card;
