import React from 'react';
import Card from './Card.jsx';
import './App.css';

const PrivateCard = ({data, startOffset, positionCallback}) => {

  return (
    <Card data={data} startOffset={startOffset} positionCallback={positionCallback} isPublic={false} />
  );
};

export default PrivateCard;
