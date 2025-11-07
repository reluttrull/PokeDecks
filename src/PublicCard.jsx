import React from 'react';
import Card from './Card.jsx';
import './App.css';

const PublicCard = ({data, startOffset, positionCallback, damageCallback}) => {

  return (
    <Card data={data} startOffset={startOffset} positionCallback={positionCallback} damageCallback={damageCallback} isPublic={true} />
  );
};

export default PublicCard;
