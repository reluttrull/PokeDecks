import React, { useEffect, useRef, useState } from 'react';
import { FaCircleInfo } from 'react-icons/fa6';
import { IoIosTabletLandscape, IoIosPhoneLandscape } from 'react-icons/io';
import { useNavigate } from "react-router-dom";
import CoinFlip from './CoinFlip.jsx';
import './App.css';
import { apiGetPublicDeckBriefs, apiGetAllDeckBriefs } from './deckApi.js';
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
      let url = '/public/';
      url += gameGuid.current;
      navigate(url);
    }, 5000);
  }

  function getCoinFlip() {
    fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/game/flipcoin/`)
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
    apiGetPublicDeckBriefs(setDeckBriefs);
  }, []);

  return (
    <>
        <div style={{textAlign:'left'}}>
        <h2>Welcome!</h2>
          In order to use this game client, you will need two devices: <br />
          <ul>
          <li><IoIosTabletLandscape style={{paddingRight:'10px'}} />one large device to show all the public parts of the game <strong><em>(this device)</em></strong><br />
              (e.g. tablet or computer)</li>
          <li><IoIosPhoneLandscape style={{paddingRight:'10px'}} />one small device to manage your hand<br />
              (e.g. phone or small tablet)</li>
          </ul>

          <h3>Choose your deck:</h3>

          {deckBriefs && deckBriefs.map(brief => 
          <div key={brief.deckId}>
            <input type="radio" id={brief.name} value={brief.deckId} checked={deckNum == brief.deckId} onChange={handleDeckNumChange} />
            <label htmlFor={brief.name}>
              <strong>{brief.name}</strong> : {brief.description}
            </label>
          <br />
          </div>)}
          <br />
          <button className="button" onClick={startGame}><IoIosTabletLandscape /><span style={{paddingLeft:'20px'}}>Start game</span></button>
        </div>
      {coinResult != null && <CoinFlip isHeads={coinResult} />}
    </>
  );
};

export default Landing;
