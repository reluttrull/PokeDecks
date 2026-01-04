import React from 'react';
import { animate, useValue } from 'react-ui-animate';
import confirm from './ConfirmationDialog.jsx';
import './App.css';

const AttachedTool = ({cardName, cardImage, deleteCallback}) => {
  let urlstring = `${cardImage}/low.png`;

  const handleToolClick = async () => {
    if (await confirm({ confirmation: 'Do you really want to discard this tool?' })) {
      deleteCallback(cardName);
    }
  };

  return (
    <animate.div className="tool-icon" onClick={handleToolClick} >
        <img src={urlstring} />
    </animate.div>
  );
};

export default AttachedTool;