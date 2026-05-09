// Reusable UI helpers
import { C, F } from './constants.js';

export function drawAllCornerMarks(s,x,y,w,h,color,len){
  len=len||14;const g=s.add.graphics();g.lineStyle(2,color,1);
  g.beginPath();g.moveTo(x,y+len);g.lineTo(x,y);g.lineTo(x+len,y);g.strokePath();
  g.beginPath();g.moveTo(x+w-len,y);g.lineTo(x+w,y);g.lineTo(x+w,y+len);g.strokePath();
  g.beginPath();g.moveTo(x,y+h-len);g.lineTo(x,y+h);g.lineTo(x+len,y+h);g.strokePath();
  g.beginPath();g.moveTo(x+w-len,y+h);g.lineTo(x+w,y+h);g.lineTo(x+w,y+h-len);g.strokePath();
  return g;
}

export function makeButton(s,x,y,w,h,label,opts){
  opts=opts||{};const fs=opts.fontSize||13;const cont=s.add.container(x,y);
  const bg=s.add.rectangle(0,0,w,h,C.BG_PANEL,1).setOrigin(0,0).setStrokeStyle(2,C.ACCENT);
  const txt=s.add.text(w/2,h/2,label,{fontFamily:F.UI,fontSize:fs+'px',fontStyle:'700',color:C.ACCENT_S}).setOrigin(0.5);
  cont.add([bg,txt]);bg.setInteractive({useHandCursor:true});
  bg.on('pointerover',()=>{bg.setFillStyle(C.ACCENT,1);txt.setColor(C.BG_DEEP_S);});
  bg.on('pointerout',()=>{bg.setFillStyle(C.BG_PANEL,1);txt.setColor(C.ACCENT_S);});
  if(opts.onClick)bg.on('pointerdown',opts.onClick);cont.bg=bg;cont.txt=txt;return cont;
}

export function drawCanvasFrame(s){
  const g=s.add.graphics();g.lineStyle(1,C.ACCENT,1);g.strokeRect(1,1,958,598);g.setDepth(9999);
  const len=22;const cg=s.add.graphics();cg.lineStyle(3,C.ACCENT,2);cg.setDepth(9999);
  cg.beginPath();cg.moveTo(0,len);cg.lineTo(0,0);cg.lineTo(len,0);cg.strokePath();
  cg.beginPath();cg.moveTo(960-len,0);cg.lineTo(960,0);cg.lineTo(960,len);cg.strokePath();
  cg.beginPath();cg.moveTo(0,600-len);cg.lineTo(0,600);cg.lineTo(len,600);cg.strokePath();
  cg.beginPath();cg.moveTo(960-len,600);cg.lineTo(960,600);cg.lineTo(960,600-len);cg.strokePath();
  return[g,cg];
}

export function scaleGame(){
  const sc=Math.min(window.innerWidth/960,window.innerHeight/600);
  const c=document.getElementById('game-container');
  if(c){c.style.transform='scale('+sc+')';c.style.transformOrigin='center center';}
}

window.addEventListener('resize',scaleGame);
scaleGame();
