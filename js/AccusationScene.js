import { C, F } from './constants.js';
import { gameState } from './state.js';
import { drawAllCornerMarks, makeButton, drawCanvasFrame } from './helpers.js';
import { SUSPECTS, EVIDENCE_META } from './data.js';

export class AccusationScene extends Phaser.Scene{
  constructor(){super('Accusation');}
  create(){
    this.gs=gameState;this.gs.gamePhase='accusation';this.cameras.main.setBackgroundColor(C.BG_S);drawCanvasFrame(this);
    const grid=this.add.graphics();grid.lineStyle(1,0x1a1a25,1);for(let x=0;x<=960;x+=40){grid.beginPath();grid.moveTo(x,0);grid.lineTo(x,600);grid.strokePath();}for(let y=0;y<=600;y+=40){grid.beginPath();grid.moveTo(0,y);grid.lineTo(960,y);grid.strokePath();}
    this.add.rectangle(0,0,960,50,C.BG_PANEL,1).setOrigin(0,0);this.add.rectangle(0,50,960,2,C.ACCENT).setOrigin(0,0);
    this.add.text(20,16,'// FINAL ACCUSATION',{fontFamily:F.UI,fontSize:'18px',fontStyle:'700',color:C.ACCENT_S,letterSpacing:5});
    this.add.text(480,80,'WHO IS THE KILLER?',{fontFamily:F.UI,fontSize:'32px',fontStyle:'700',color:C.LIGHT_S,letterSpacing:6}).setOrigin(0.5);
    this.add.rectangle(480,102,380,3,C.ACCENT).setOrigin(0.5);this.add.text(480,120,'drag evidence onto a suspect. then confirm.',{fontFamily:F.MONO,fontSize:'11px',color:C.MUTE_S,letterSpacing:2}).setOrigin(0.5);
    this.droppedEvidence={};this.suspectCards={};this.confirmBtn=null;
    const cW=140,cH=220,gap=16,tW=5*cW+4*gap,sX=(960-tW)/2,y=150;
    SUSPECTS.forEach((sus,i)=>{const x=sX+i*(cW+gap);const card=this.add.container(x,y);
      card.add(this.add.rectangle(0,0,cW,cH,C.BG_PANEL,1).setOrigin(0,0).setStrokeStyle(2,C.MUTE));
      card.add(this.add.rectangle(8,8,cW-16,100,0x000000,0).setOrigin(0,0).setStrokeStyle(1,C.ACCENT,0.7));
      card.add(this.add.image(cW/2,58,sus.portrait).setOrigin(0.5).setDisplaySize(cW-20,96));
      card.add(this.add.text(14,14,'0'+(i+1),{fontFamily:F.MONO,fontSize:'10px',color:C.ACCENT_S,letterSpacing:2}));
      card.add(this.add.text(cW/2,120,sus.name,{fontFamily:F.UI,fontSize:'12px',fontStyle:'700',color:C.LIGHT_S,letterSpacing:2}).setOrigin(0.5));
      card.add(this.add.rectangle(10,138,cW-20,1,C.MUTE).setOrigin(0,0));
      const pinArea=this.add.container(6,146);card.add(pinArea);
      const dropZone=this.add.rectangle(0,0,cW,cH,0x000000,0).setOrigin(0,0).setInteractive({dropZone:true});
      card.add(dropZone);this.suspectCards[sus.id]={cont:card,pinArea,dropZone};
      const corners=drawAllCornerMarks(this,x+4,y+4,cW-8,cH-8,C.ACCENT,14);corners.setAlpha(0);
      dropZone.on('dragenter',()=>{card.getAt(0).setStrokeStyle(2,C.ACCENT);corners.setAlpha(1);});
      dropZone.on('dragleave',()=>{card.getAt(0).setStrokeStyle(2,C.MUTE);corners.setAlpha(0);});
      dropZone.on('drop',(pointer,evCard)=>{const evId=evCard.evidenceId;
        if(!this.droppedEvidence[sus.id])this.droppedEvidence[sus.id]=[];
        if(!this.droppedEvidence[sus.id].includes(evId)){this.droppedEvidence[sus.id].push(evId);this.refreshPins(sus.id);}
        evCard.destroy();this.showConfirmBtn();});
    });
    const hY=420,hH=180;this.add.rectangle(0,hY,960,hH,C.BG_PANEL,1).setOrigin(0,0);this.add.rectangle(0,hY,960,1,C.ACCENT).setOrigin(0,0);
    this.add.text(20,hY+8,'// YOUR EVIDENCE \u2014 DRAG ONTO A SUSPECT',{fontFamily:F.MONO,fontSize:'10px',color:C.MUTE_S,letterSpacing:2});
    this.evidenceCards=[];const evs=this.gs.collectedEvidence;const ecW=110,ecH=50,gap2=6,sX2=20;
    evs.slice(0,8).forEach((id,i)=>{const cx=sX2+i*(ecW+gap2),cy=hY+28;const card=this.add.container(cx,cy);
      card.add(this.add.rectangle(0,0,ecW,ecH,C.BG_PANEL2,1).setOrigin(0,0).setStrokeStyle(1,C.MUTE));card.add(this.add.rectangle(0,0,3,ecH,C.ACCENT,1).setOrigin(0,0));
      card.add(this.add.text(8,6,id.length>14?id.slice(0,13)+'\u2026':id,{fontFamily:F.UI,fontSize:'10px',fontStyle:'700',color:C.ACCENT_S,letterSpacing:1}));
      card.add(this.add.text(8,24,(EVIDENCE_META[id]?EVIDENCE_META[id].type.slice(0,3):'???'),{fontFamily:F.MONO,fontSize:'9px',color:C.MUTE_S,letterSpacing:1}));
      card.evidenceId=id;card.origX=cx;card.origY=cy;
      const bg=card.getAt(0);bg.setInteractive({useHandCursor:true,draggable:true});this.input.setDraggable(bg);
      bg.on('drag',(pointer,dX,dY)=>{card.x=dX-ecW/2;card.y=dY-ecH/2;});
      bg.on('dragend',()=>{card.x=card.origX;card.y=card.origY;});
      this.evidenceCards.push(card);});
    const ev=this.gs.collectedEvidence.length,cn=this.gs.contradictionsTriggered.length;
    this.add.text(940,580,'EVIDENCE '+String(ev).padStart(2,'0')+'/25  \u00b7  CONTRADICTIONS '+cn+'/06',{fontFamily:F.MONO,fontSize:'11px',color:C.MUTE_S,letterSpacing:2}).setOrigin(1,0);
    this.cameras.main.fadeIn(280,10,10,15);
  }
  refreshPins(susId){const sc=this.suspectCards[susId];if(!sc)return;sc.pinArea.removeAll(true);
    const pins=this.droppedEvidence[susId]||[];let py=0;pins.forEach(p=>{const t=this.add.text(0,py,'\u00b7 '+(p.length>16?p.slice(0,15)+'\u2026':p),{fontFamily:F.MONO,fontSize:'8px',color:C.ACCENT_S,letterSpacing:1});sc.pinArea.add(t);py+=12;});}
  showConfirmBtn(){if(this.confirmBtn)return;const anyDropped=Object.values(this.droppedEvidence).some(a=>a.length>0);if(!anyDropped)return;
    this.confirmBtn=makeButton(this,(960-280)/2,560,280,32,'[ CONFIRM ACCUSATION ]',{fontSize:14,onClick:()=>{
      let accused='scheduler';for(const sid of Object.keys(this.droppedEvidence)){if(this.droppedEvidence[sid].length>0){accused=sid;break;}}
      this.cameras.main.flash(180,230,57,70);this.cameras.main.fadeOut(360,10,10,15);this.cameras.main.once('camerafadeoutcomplete',()=>{this.scene.start('Ending',{accused,correct:accused==='scheduler'});});
    }});}
}
