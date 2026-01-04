// api helper functions
const BASE = `${import.meta.env.VITE_SERVER_BASE_URL}/deck`;

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