import { C, F } from './constants.js';
import { gameState, saveState } from './state.js';
import { drawAllCornerMarks, makeButton, drawCanvasFrame } from './helpers.js';
import { SUSPECTS } from './data.js';

export class EndingScene extends Phaser.Scene{
  constructor(){super('Ending');}
  init(data){this.accused=data&&data.accused;this.correct=!!(data&&data.correct);this._recommendations=null;}
  create(){
    const gs=gameState;this.cameras.main.setBackgroundColor(this.correct?'#0d1410':'#100d10');drawCanvasFrame(this);
    const grid=this.add.graphics();grid.lineStyle(1,this.correct?0x1a2a22:0x2a1a1a,1);
    for(let x=0;x<=960;x+=40){grid.beginPath();grid.moveTo(x,0);grid.lineTo(x,600);grid.strokePath();}
    for(let y=0;y<=600;y+=40){grid.beginPath();grid.moveTo(0,y);grid.lineTo(960,y);grid.strokePath();}
    this.add.rectangle(0,0,960,38,C.BG_PANEL,1).setOrigin(0,0);this.add.rectangle(0,38,960,1,C.ACCENT).setOrigin(0,0);
    this.add.text(20,12,'// CASE FILE \u2014 VERDICT',{fontFamily:F.UI,fontSize:'14px',fontStyle:'700',color:C.ACCENT_S,letterSpacing:4});
    this.add.text(940,12,this.correct?'// CASE CLOSED':'// CASE OPEN',{fontFamily:F.MONO,fontSize:'11px',color:C.MUTE_S,letterSpacing:2}).setOrigin(1,0);
    const verdict=this.correct?'CORRECT.':'INCORRECT.';
    const big=this.add.text(480,130,verdict,{fontFamily:F.UI,fontSize:'90px',fontStyle:'700',color:C.ACCENT_S,letterSpacing:10}).setOrigin(0.5).setAlpha(0);
    this.tweens.add({targets:big,alpha:1,duration:400});
    const tw=big.width+80,th=big.height+30;const border=this.add.rectangle(480,130,tw,th,0x000000,0).setOrigin(0.5).setStrokeStyle(3,C.ACCENT).setAlpha(0);this.tweens.add({targets:border,alpha:1,duration:400});
    drawAllCornerMarks(this,480-tw/2,130-th/2,tw,th,C.ACCENT,22);
    this.add.text(480,200,this.correct?'// YOU SAW THE SHAPE OF IT.':'// SOMEONE IS WALKING FREE.',{fontFamily:F.MONO,fontSize:'13px',color:C.MUTE_S,letterSpacing:4}).setOrigin(0.5);
    const sus=SUSPECTS.find(s=>s.id===this.accused)||SUSPECTS[0];
    const cX=80,cY=250,cW=200,cH=280;this.add.rectangle(cX,cY,cW,cH,C.BG_PANEL,1).setOrigin(0,0).setStrokeStyle(2,C.ACCENT);drawAllCornerMarks(this,cX,cY,cW,cH,C.ACCENT,16);
    this.add.image(cX+cW/2,cY+110,sus.portrait).setOrigin(0.5).setDisplaySize(cW-30,196);this.add.rectangle(cX+cW/2,cY+110,cW-28,198,0x000000,0).setOrigin(0.5).setStrokeStyle(1,C.ACCENT,0.6);
    this.add.text(cX+cW/2,cY+230,sus.name,{fontFamily:F.UI,fontSize:'22px',fontStyle:'700',color:C.LIGHT_S,letterSpacing:5}).setOrigin(0.5);
    this.add.rectangle(cX+cW/2,cY+252,60,1,C.ACCENT).setOrigin(0.5);
    this.add.text(cX+cW/2,cY+264,this.correct?'CONVICTED':'ACCUSED',{fontFamily:F.MONO,fontSize:'11px',color:this.correct?C.ACCENT_S:C.MUTE_S,letterSpacing:3}).setOrigin(0.5);
    const bx=320,by=260,bw=580,bh=270;this.add.rectangle(bx,by,bw,bh,C.BG_PANEL,0.95).setOrigin(0,0).setStrokeStyle(1,C.ACCENT,0.6);drawAllCornerMarks(this,bx,by,bw,bh,C.ACCENT,14);
    this.add.text(bx+18,by+16,'// CASE NOTES',{fontFamily:F.MONO,fontSize:'11px',color:C.ACCENT_S,letterSpacing:3});this.add.rectangle(bx+18,by+36,bw-36,1,C.ACCENT,0.4).setOrigin(0,0);
    const goodLines=['The Scheduler planned everything from the start.','She got a costume and voice changer \u2014 and a new phone \u2014 so no one would recognize her.','She visited the Observer in disguise. The Observer told her where the Operator was.','She knocked out the Operator with the first bottle. She needed the gate key.','Malcolm was lured to the Planetarium and stabbed through the floor panel from below.','Ada was strangled in her room with the third knockout gas bottle used first. Then stuffed into a suit and staged in the chamber.','Petunia was guided by text to crouch on a marked panel. He was stabbed from beneath through the drilled hole. Iwo saw the Operator nearby \u2014 a reflection. A distraction.','Viste was knocked out in the locker room and bound at the void gate. The saw was rigged to fall when the gate opened.','The Drifter was pushed into the lower maze and framed with a phone left behind.','The broadcast was pre-recorded. The letter cleared the studio. She stood in it alone and played the video.','Four dead. One framed. One gate open. All of it planned.'];
    const badLines=['The wrong person.','The real killer watches you leave.','The gate stays open.'];
    const lines=this.correct?goodLines:badLines;
    lines.forEach((t,i)=>{const txt=this.add.text(bx+18,by+56+i*30,'> '+t,{fontFamily:F.MONO,fontSize:'14px',color:i===lines.length-1?C.ACCENT_S:C.LIGHT_S,wordWrap:{width:bw-36,useAdvancedWrap:true},fontStyle:'italic'}).setAlpha(0);this.tweens.add({targets:txt,alpha:1,duration:260,delay:600+i*220});});
    if(this.correct){const caseClosed=this.add.text(480,by+bh+20,'[ CASE CLOSED ]',{fontFamily:F.UI,fontSize:'48px',fontStyle:'700',color:C.ACCENT_S,letterSpacing:6}).setOrigin(0.5).setAlpha(0);this.tweens.add({targets:caseClosed,alpha:1,duration:400,delay:600+lines.length*220+200});}
    const ev=gs.collectedEvidence.length,cn=gs.contradictionsTriggered.length;
    this.add.text(480,555,'EVIDENCE COLLECTED '+String(ev).padStart(2,'0')+'/25  \u00b7  CONTRADICTIONS '+cn+'/06',{fontFamily:F.MONO,fontSize:'11px',color:C.MUTE_S,letterSpacing:3}).setOrigin(0.5);
    const btnX=(960-240)/2;
    const btn=makeButton(this,btnX,590,240,38,'[ PLAY AGAIN ]',{fontSize:16,onClick:()=>{
      gameState.currentLocation='basement';gameState.collectedEvidence=[];gameState.visitedLocations=[];gameState.suspectsTalked=[];gameState.pins={};gameState.contradictionsTriggered=[];gameState.trialProgress=0;gameState.gamePhase='intro';
      saveState();this.scene.start('Intro');
    }});btn.setAlpha(0);this.tweens.add({targets:btn,alpha:1,duration:400,delay:1500});
    this.cameras.main.fadeIn(360,10,10,15);
    // POST /api/complete + fetch recommendations
    fetch('/api/complete',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({accusedSuspect:this.accused,gotCorrectEnding:this.correct,missedClues:[]})})
      .then(r=>r.json()).then(d=>{
        if(d.recommendations&&d.recommendations.length>0){
          const rx=320,ry=540,rw=580,rh=50;
          this.add.rectangle(rx,ry,rw,rh,C.BG_PANEL,0.95).setOrigin(0,0).setStrokeStyle(1,C.MUTE);
          this.add.text(rx+10,ry+6,'// RECOMMENDATIONS',{fontFamily:F.MONO,fontSize:'10px',color:C.ACCENT_S,letterSpacing:2});
          const recTxt=d.recommendations.slice(0,3).join(' \u00b7 ');
          this.add.text(rx+10,ry+22,recTxt.length>80?recTxt.slice(0,79)+'\u2026':recTxt,{fontFamily:F.MONO,fontSize:'12px',color:C.LIGHT_S,wordWrap:{width:rw-20,useAdvancedWrap:true}});
        }
      }).catch(()=>{});
  }
}
