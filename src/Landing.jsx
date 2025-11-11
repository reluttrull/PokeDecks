import React, { useEffect, useRef, useState } from 'react';
import { FaClipboard } from 'react-icons/fa6';
import { IoIosTabletLandscape, IoIosPhoneLandscape } from 'react-icons/io';
import { useNavigate } from "react-router-dom";
import CoinFlip from './CoinFlip.jsx';
import './App.css';
import { apiGetPublicDeckBriefs, apiGetAllDeckBriefs } from './deckApi.js';
import { initializeGame, importCustomDeck, initializeGameCustomDeck } from './gameLogic.js';

const Landing = () => {
  const navigate = useNavigate();
  const gameGuid = useRef(null);
  const [deckBriefs, setDeckBriefs] = useState([]);
  const [deckNum, setDeckNum] = useState("0");
  const [coinResult, setCoinResult] = useState(null);
  const [clipboardText, setClipboardText] = useState("");
  const [error, setError] = useState("");
  const [useCustomDeck, setUseCustomDeck] = useState(false);

  async function handleReadClipboard() {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        setError("Clipboard API is not supported in this browser.");
        return;
      }

      const text = await navigator.clipboard.readText();
      setClipboardText(text);
      setError("");
    } catch (err) {
      setError("Failed to read clipboard. Permission denied or no text available.");
      console.error(err);
    }
  };

  async function startGame() {
    getCoinFlip();
    if (!useCustomDeck) {
      initializeGame(deckNum, gameGuid);
    } else {
      try {
        const deckGuid = await importCustomDeck(clipboardText); // returns deck guid string
        if (!deckGuid) throw new Error('No deck id returned from import');
        await initializeGameCustomDeck(deckGuid, gameGuid);
      } catch (err) {
        console.error('Import/init failed', err);
        setError('Failed to import or initialize custom deck');
        return;
      }
    }
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

  function toggleUseCustomDeck() {
    setUseCustomDeck(!useCustomDeck);
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
          <div>
            <label className="switch" alt="use custom deck" title="Use custom deck">
              <input type="checkbox" value={useCustomDeck} onClick={toggleUseCustomDeck} />
              <span className="slider round"></span>
            </label>
          </div>
          {!useCustomDeck &&
            <><h3>Choose a standard deck</h3>
            {deckBriefs && deckBriefs.map(brief => 
              <div key={brief.deckId}>
                <input type="radio" id={brief.name} value={brief.deckId} checked={deckNum == brief.deckId} onChange={handleDeckNumChange} />
                <label htmlFor={brief.name}>
                  <strong>{brief.name}</strong> : {brief.description}
                </label>
              <br />
              </div>)
            }</>
          }
          {useCustomDeck &&
            <>
              <h3>Import a custom deck from clipboard <small>(build one <a href="https://my.limitlesstcg.com/builder">here</a>)</small></h3>
              <em>Experimental - only Base 1 and Jungle sets fully supported</em>
              <pre>{clipboardText}</pre>
              <button onClick={handleReadClipboard}><FaClipboard style={{paddingRight:'10px'}} /> Import</button>
              <br />
            </>
          }
          <br />
          <button className="button" onClick={startGame}><IoIosTabletLandscape /><span style={{paddingLeft:'20px'}}>Start game</span></button>
        </div>
      {coinResult != null && <CoinFlip isHeads={coinResult} />}
    </>
  );
};

export default Landing;
