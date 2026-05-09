import { C, F } from './constants.js';
import { gameState, saveState } from './state.js';
import { drawAllCornerMarks, drawCanvasFrame, makeButton } from './helpers.js';
import { EVIDENCE_META, TRIAL_STATEMENTS } from './data.js';

export class TrialScene extends Phaser.Scene{
  constructor(){super('Trial');}
  create(){
    this.gs=gameState;this.gs.gamePhase='trial';this.cameras.main.setBackgroundColor(C.BG_S);drawCanvasFrame(this);
    this.statementIndex=0;this.resolved=0;this._trialPage=0;
    this.add.rectangle(0,0,960,50,C.BG_PANEL,1).setOrigin(0,0);this.add.rectangle(0,50,960,2,C.ACCENT).setOrigin(0,0);
    this.add.text(20,16,'// THE TRIAL',{fontFamily:F.UI,fontSize:'18px',fontStyle:'700',color:C.ACCENT_S,letterSpacing:5});
    this.trialStatus=this.add.text(940,18,'STATEMENT 01/05',{fontFamily:F.MONO,fontSize:'11px',color:C.MUTE_S,letterSpacing:2}).setOrigin(1,0);
    this.buildEvidenceHand();this.showStatement();this.cameras.main.fadeIn(300);
  }
  buildEvidenceHand(){
    if(this.evidenceCards)this.evidenceCards.forEach(c=>c.destroy());this.evidenceCards=[];
    if(this._evHandBg)this._evHandBg.destroy();if(this._evHandLabel)this._evHandLabel.destroy();
    if(this._prevBtn)this._prevBtn.destroy();if(this._nextBtn)this._nextBtn.destroy();if(this._pageLabel)this._pageLabel.destroy();
    const hY=480,hH=120;this._evHandBg=this.add.rectangle(0,hY,960,hH,C.BG_PANEL,1).setOrigin(0,0);this.add.rectangle(0,hY,960,1,C.ACCENT).setOrigin(0,0);
    this._evHandLabel=this.add.text(20,hY+8,'// YOUR EVIDENCE \u2014 DRAG ONTO STATEMENT',{fontFamily:F.MONO,fontSize:'10px',color:C.MUTE_S,letterSpacing:2});
    const evs=this.gs.collectedEvidence;const cW=120,cH=60,gap=6,sX=20,perPage=7;
    const maxPage=Math.max(0,Math.ceil(evs.length/perPage)-1);if(this._trialPage>maxPage)this._trialPage=maxPage;
    const pageEvs=evs.slice(this._trialPage*perPage,(this._trialPage+1)*perPage);
    pageEvs.forEach((id,i)=>{const cx=sX+i*(cW+gap),cy=hY+24;const card=this.add.container(cx,cy);
      card.add(this.add.rectangle(0,0,cW,cH,C.BG_PANEL2,1).setOrigin(0,0).setStrokeStyle(1,C.MUTE));card.add(this.add.rectangle(0,0,3,cH,C.ACCENT,1).setOrigin(0,0));
      card.add(this.add.text(8,8,id.length>16?id.slice(0,15)+'\u2026':id,{fontFamily:F.UI,fontSize:'11px',fontStyle:'700',color:C.ACCENT_S,letterSpacing:1}));
      card.add(this.add.text(8,28,(EVIDENCE_META[id]?EVIDENCE_META[id].type.slice(0,3):'???'),{fontFamily:F.MONO,fontSize:'9px',color:C.MUTE_S,letterSpacing:1}));
      card.evidenceId=id;card.origX=cx;card.origY=cy;
      const bg=card.getAt(0);bg.setInteractive({useHandCursor:true,draggable:true});this.input.setDraggable(bg);
      bg.on('drag',(pointer,dX,dY)=>{card.x=dX-cW/2;card.y=dY-cH/2;});bg.on('dragend',()=>this.checkDrop(card));
      this.evidenceCards.push(card);});
    if(maxPage>0){const p=this._trialPage;
      if(p>0)this._prevBtn=makeButton(this,20,hY+hH-26,60,20,'< PREV',{fontSize:9,onClick:()=>{this._trialPage--;this.buildEvidenceHand();}});
      if(p<maxPage)this._nextBtn=makeButton(this,880,hY+hH-26,60,20,'NEXT >',{fontSize:9,onClick:()=>{this._trialPage++;this.buildEvidenceHand();}});
      this._pageLabel=this.add.text(480,hY+hH-16,'PAGE '+(p+1)+'/'+(maxPage+1),{fontFamily:F.MONO,fontSize:'9px',color:C.MUTE_S,letterSpacing:2}).setOrigin(0.5);
    }
  }
  showStatement(){
    if(this.statementIndex>=TRIAL_STATEMENTS.length){this.cameras.main.fadeOut(400);this.cameras.main.once('camerafadeoutcomplete',()=>{this.scene.start('Accusation');});return;}
    const st=TRIAL_STATEMENTS[this.statementIndex];this.trialStatus.setText('STATEMENT '+String(st.id).padStart(2,'0')+'/05');
    const sw=600,sh=120,sx=(960-sw)/2,sy=160;if(this.statementCard)this.statementCard.destroy();
    this.statementCard=this.add.container(sx,sy);this.statementCard.add(this.add.rectangle(0,0,sw,sh,C.BG_PANEL2,1).setOrigin(0,0).setStrokeStyle(1,C.MUTE));
    this.statementCard.add(drawAllCornerMarks(this,0,0,sw,sh,C.ACCENT,14));
    this.statementCard.add(this.add.text(16,12,'// STATEMENT 0'+st.id+' \u2014 '+st.speaker,{fontFamily:F.UI,fontSize:'14px',fontStyle:'700',color:C.ACCENT_S,letterSpacing:3}));
    this.statementCard.add(this.add.text(16,40,st.text,{fontFamily:F.MONO,fontSize:'14px',color:C.LIGHT_S,wordWrap:{width:sw-32,useAdvancedWrap:true},lineSpacing:4}));
    this.statementCard.setDepth(50);this.currentStatement=st;
  }
  checkDrop(card){
    if(!this.statementCard||!this.currentStatement){card.x=card.origX;card.y=card.origY;return;}
    const sb=this.statementCard.getBounds();const cb=card.getBounds();
    if(Phaser.Geom.Intersects.RectangleToRectangle(sb,cb)){
      if(card.evidenceId===this.currentStatement.correctEvidence||(this.currentStatement.id===5&&card.evidenceId==='FLASH DRIVE')){
        this.resolved++;this.gs.trialProgress=this.resolved;saveState();card.destroy();
        this.statementCard.getAt(0).setStrokeStyle(2,C.ACCENT);this.add.text(this.statementCard.x+560,this.statementCard.y+60,'\u2713',{fontFamily:F.UI,fontSize:'36px',fontStyle:'700',color:C.ACCENT_S}).setOrigin(0.5).setDepth(55);
        this.time.delayedCall(600,()=>{this.statementIndex++;this.showStatement();});
      }else{this.statementCard.getAt(0).setStrokeStyle(2,C.ACCENT2);this.time.delayedCall(300,()=>{this.statementCard.getAt(0).setStrokeStyle(1,C.MUTE);});this.tweens.add({targets:card,x:card.origX,y:card.origY,duration:300,ease:'Back.Out'});}
    }else{card.x=card.origX;card.y=card.origY;}
  }
}
