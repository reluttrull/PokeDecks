import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Landing from './Landing.jsx';
import Public from './Public.jsx';
import Private from './Private.jsx';
import './App.css';

const App = () => {

  function GameOver() {
    return <h1>Game Over!</h1>
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/public/:gameGuid" element={<Public />} />
        <Route path="/private/:gameGuid" element={<Private />} />
        <Route path="/gameover" element={<GameOver />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
