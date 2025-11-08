// api helper functions
const BASE = "https://pokeserver20251017181703-ace0bbard6a0cfas.canadacentral-01.azurewebsites.net/deck";

export const apiGetPublicDeckBriefs = (setDeckBriefs) =>
  fetch(`${BASE}/getpublicdeckbriefs`)
    .then((response) => response.json())
    .then((data) => {
      setDeckBriefs(data);
    });
    
export const apiGetAllDeckBriefs = (setDeckBriefs) =>
  fetch(`${BASE}/getalldeckbriefs`)
    .then((response) => response.json())
    .then((data) => {
      setDeckBriefs(data);
    });