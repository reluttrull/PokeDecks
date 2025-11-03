import React, { useEffect, useRef, useState } from 'react';
import { IoIosTabletLandscape } from 'react-icons/io';
import { useNavigate } from "react-router-dom";
import CoinFlip from './CoinFlip.jsx';
import './App.css';
import { apiGetAllDeckBriefs } from './deckApi.js';
import { initializeGame } from './gameLogic.js';

const Landing = () => {
  const navigate = useNavigate();
  const gameGuid = useRef(null);
  const [deckBriefs, setDeckBriefs] = useState([]);
  const [deckNum, setDeckNum] = useState("0");
  const [coinResult, setCoinResult] = useState(null);

  function startGame() {
    getCoinFlip();
    initializeGame(deckNum, gameGuid);
    setTimeout(() => {
      setCoinResult(null);
      navigate(`/pokeclient/public/${gameGuid.current}`);
    }, 5000);
  }

  function getCoinFlip() {
    fetch(`https://pokeserver20251017181703-ace0bbard6a0cfas.canadacentral-01.azurewebsites.net/game/flipcoin`)
    .then(response => response.json())
    .then(data => {
      console.log('flipped coin', data);
      setCoinResult(data);
    })
    .catch(error => console.error('Error fetching data:', error));
  }

  function handleDeckNumChange(event) {
    setDeckNum(event.target.value);
  }
  
  // on mount
  useEffect(() => {
    apiGetAllDeckBriefs(setDeckBriefs);
  }, []);

  return (
    <>
        <div style={{textAlign:'left'}}>
          Welcome!  In order to use this game client, you will need two devices: <br />
          <ul>
          <li>one large device to show all the public parts of the game <strong><em>(this device)</em></strong><br />
              (e.g. tablet or computer)</li>
          <li>one small device to manage your hand<br />
              (e.g. phone or small tablet)</li>
          </ul>
          {deckBriefs && deckBriefs.map(brief => 
          <div key={brief.deckId}>
            <input type="radio" id={brief.name} value={brief.deckId} checked={deckNum == brief.deckId} onChange={handleDeckNumChange} />
            <label htmlFor={brief.name}>{brief.name}</label>
          <br />
          </div>)}
          <br />
          <button onClick={startGame}><IoIosTabletLandscape /><span style={{paddingLeft:'20px'}}>Start game</span></button>
        </div>
      {coinResult != null && <CoinFlip isHeads={coinResult} />}
    </>
  );
};

export default Landing;
