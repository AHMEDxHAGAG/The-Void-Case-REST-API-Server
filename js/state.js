// Game state & backend sync
export const gameState = {
  currentLocation:'basement', collectedEvidence:[], visitedLocations:[],
  suspectsTalked:[], pins:{}, contradictionsTriggered:[], trialProgress:0, gamePhase:'intro'
};

export function saveState(){
  fetch('/api/save',{
    method:'PUT',
    headers:{'Content-Type':'application/json'},
    credentials:'include',
    body:JSON.stringify(gameState)
  }).catch(()=>{});
}

export function loadState(){
  return fetch('/api/auth/me',{credentials:'include'})
    .then(r=>{
      if(r.status===401){window.location.href='login.html';throw new Error('unauth');}
      return fetch('/api/save',{credentials:'include'});
    })
    .then(r=>{
      if(r.status===404){
        gameState.gamePhase='intro';
        fetch('/api/save',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          credentials:'include',
          body:JSON.stringify(gameState)
        }).catch(()=>{});
        return null;
      }
      return r.json();
    })
    .then(d=>{if(d)Object.assign(gameState,d);})
    .catch(()=>{});
}
