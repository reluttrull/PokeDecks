import React, { useState } from 'react';

const ActivePokemonStats = ({ active }) => {

    return (
    active && <div id="active-pokemon-stats">
        <div><em>{active.name}</em></div>
        <div>{`${active.hp - (active.damageCounters * 10)}/${active.hp} HP`}</div>
    </div>
)};


export default ActivePokemonStats;