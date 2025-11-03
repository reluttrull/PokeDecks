import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './Landing.jsx';
import Public from './Public.jsx';
import './App.css';

const App = () => {

  function GameOver() {
    return <h1>Game Over!</h1>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/pokeclient/" element={<Landing />} />
        <Route path="/pokeclient/public/:gameGuid" element={<Public />} />
        {/* <Route path="/pokeclient/private/:gameGuid" element={<Private />} /> */}
        <Route path="/pokeclient/gameover" element={<GameOver />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
