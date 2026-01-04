import React from 'react';
import { animate, useValue } from 'react-ui-animate';
import confirm from './ConfirmationDialog.jsx';
import './App.css';

const AttachedEnergy = ({cardName, offset, deleteCallback}) => {
  const [left, setLeft] = useValue(offset + 20);
  let energyType = cardName.replace(" Energy", "");
  if (["Mist", "Jet"].includes(energyType)) energyType = "Colorless";

  let urlstring = `/pokedecks/${energyType}.png`;

  const handleEnergyClick = async () => {
    if (await confirm({ confirmation: 'Do you really want to discard this energy?' })) {
      deleteCallback(cardName);
    }
  };

  return (
    <animate.div className="energy-icon" onClick={handleEnergyClick} style={{left}}>
        <img src={urlstring} />
    </animate.div>
  );
};

export default AttachedEnergy;