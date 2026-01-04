import React, { useState } from 'react';

const ActivePokemonStats = ({ active }) => {

    return (
    active && <div id="active-pokemon-stats">
        <div><em>{active.name}</em></div>
        <div>{`${active.hp - (active.damageCounters * 10)}/${active.hp} HP`}</div>
        <ul>Weakness: {active.weaknesses && active.weaknesses.map(w => 
            <li>
                <img src={`/pokedecks/${w.type}.png`} style={{height: '15px', width: '15px'}} /> {w.value}
            </li>)}
        </ul>
        <ul>Resistance: {active.resistances && active.resistances.map(r => 
            <li>
                <img src={`/pokedecks/${r.type}.png`} style={{height: '15px', width: '15px'}} /> {r.value}
            </li>)}
        </ul>
    </div>
)};


export default ActivePokemonStats;