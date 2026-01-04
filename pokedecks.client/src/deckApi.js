import { SERVER_BASE_URL } from './api.js';

// api helper functions
export const DECK_API_BASE = `${SERVER_BASE_URL}/deck`;

export const apiGetPublicDeckBriefs = (setDeckBriefs) =>
    fetch(`${DECK_API_BASE}/getpublicdeckbriefs`)
    .then((response) => response.json())
    .then((data) => {
      setDeckBriefs(data);
    });
    
export const apiGetAllDeckBriefs = (setDeckBriefs) =>
    fetch(`${DECK_API_BASE}/getalldeckbriefs`)
    .then((response) => response.json())
    .then((data) => {
      setDeckBriefs(data);
    });