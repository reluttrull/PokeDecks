import React from 'react';
import Card from './Card.jsx';
import './App.css';

const PublicCard = ({data, startOffset, positionCallback}) => {

  return (
    <Card data={data} startOffset={startOffset} positionCallback={positionCallback} isPublic={true} />
  );
};

export default PublicCard;
