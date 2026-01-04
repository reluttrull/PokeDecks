import React from 'react';
import Card from './Card.jsx';
import './App.css';

const PrivateCard = ({data, startOffset, positionCallback, damageCallback}) => {

  return (
    <Card data={data} startOffset={startOffset} positionCallback={positionCallback} damageCallback={damageCallback} isPublic={false} />
  );
};

export default PrivateCard;
