import { C, F } from './constants.js';
import { gameState, saveState } from './state.js';
import { drawAllCornerMarks, makeButton, drawCanvasFrame } from './helpers.js';
import { LOCATION_NAMES, LOCATION_KEYS, EVIDENCE_META, SUSPECTS, HOTSPOTS, NPCS, CONTRADICTIONS, HINTS } from './data.js';

export class GameScene extends Phaser.Scene{
  constructor(){super('Game');}
  create(){
    this.gs=gameState;this.gs.gamePhase='investigation';
    if(!this.gs.visitedLocations.includes(this.gs.currentLocation)){this.gs.visitedLocations.push(this.gs.currentLocation);saveState();}
    this.cameras.main.setBackgroundColor(C.BG_S);
    this.bgLayer=this.add.container(0,0).setDepth(0);this.roomLayer=this.add.container(0,0).setDepth(10);
    this.uiBackLayer=this.add.container(0,0).setDepth(40);this.navLayer=this.add.container(0,0).setDepth(60);
    this.dialogueLayer=this.add.container(0,0).setDepth(100).setVisible(false);
    this.panelLayer=this.add.container(0,0).setDepth(200).setVisible(false);
    this.suspectLayer=this.add.container(0,0).setDepth(300).setVisible(false);
    this.hintLayer=this.add.container(0,0).setDepth(400).setVisible(false);
    this.contraLayer=this.add.container(0,0).setDepth(500).setVisible(false);
    drawCanvasFrame(this);this.buildHeader();this.buildNavBar();this.buildDialoguePanel();this.buildAssistantButton();
    this.loadLocation(this.gs.currentLocation);
    this.input.keyboard.on('keydown-SPACE',()=>{if(this.dialogueActive)this.advanceDialogue();});
    this.input.keyboard.on('keydown-ESC',()=>{if(this.suspectLayer.visible)this.toggleSuspectBoard(false);else if(this.hintLayer.visible)this.toggleHintPanel(false);else if(this.panelLayer.visible)this.closePanel();});
    this.checkTrialReady();
  }
  buildHeader(){
    const h=36;this.uiBackLayer.add([this.add.rectangle(0,0,960,h,C.BG_PANEL,1).setOrigin(0,0),this.add.rectangle(0,h,960,1,C.ACCENT).setOrigin(0,0)]);
    this.headerLabel=this.add.text(20,10,'',{fontFamily:F.UI,fontSize:'15px',fontStyle:'700',color:C.ACCENT_S,letterSpacing:4});
    this.headerStatus=this.add.text(940,12,'',{fontFamily:F.MONO,fontSize:'10px',color:C.MUTE_S,letterSpacing:2}).setOrigin(1,0);
    this.uiBackLayer.add([this.headerLabel,this.headerStatus]);
  }
  refreshHeader(){this.headerLabel.setText('// '+LOCATION_NAMES[this.gs.currentLocation]);this.headerStatus.setText('EVIDENCE '+String(this.gs.collectedEvidence.length).padStart(2,'0')+'/25  \u00b7  CONTRADICTIONS '+this.gs.contradictionsTriggered.length+'/06');}
  loadLocation(loc){
    this.gs.currentLocation=loc;if(!this.gs.visitedLocations.includes(loc)){this.gs.visitedLocations.push(loc);saveState();}
    this.bgLayer.removeAll(true);this.roomLayer.removeAll(true);
    this.bgLayer.add(this.add.image(480,300,'bg_'+loc));this.bgLayer.add(this.add.rectangle(0,360,960,240,0x000000,0.15).setOrigin(0,0));
    HOTSPOTS[loc].forEach(h=>this.makeHotspot(h));(NPCS[loc]||[]).filter(n=>!n.requires||this.gs.collectedEvidence.includes(n.requires)).forEach(n=>this.makeNPC(n));
    this.refreshHeader();this.cameras.main.flash(180,230,57,70);this.buildAssistantButton();
  }
  makeHotspot(h){
    const col=h.collect&&this.gs.collectedEvidence.includes(h.collect);const cont=this.add.container(h.x,h.y);
    const br=this.add.graphics();br.lineStyle(1.5,C.ACCENT,1);const r=22;
    [[-r,-r,1,1],[r,-r,-1,1],[-r,r,1,-1],[r,r,-1,-1]].forEach(([x,y,sx,sy])=>{br.beginPath();br.moveTo(x,y);br.lineTo(x+8*sx,y);br.moveTo(x,y);br.lineTo(x,y+8*sy);br.strokePath();});
    cont.add(br);const dia=this.add.graphics();
    if(col){dia.fillStyle(C.ACCENT2,0.7);dia.lineStyle(1.5,C.ACCENT,0.7);}else{dia.fillStyle(C.ACCENT,1);dia.lineStyle(1.5,C.LIGHT,1);}
    dia.beginPath();dia.moveTo(0,-8);dia.lineTo(8,0);dia.lineTo(0,8);dia.lineTo(-8,0);dia.closePath();dia.fillPath();dia.strokePath();cont.add(dia);
    const lbl=this.add.text(0,28,h.label,{fontFamily:F.MONO,fontSize:'10px',color:C.ACCENT_S,letterSpacing:1.5}).setOrigin(0.5).setAlpha(0);cont.add(lbl);
    const hit=this.add.rectangle(0,0,56,56,0x000000,0).setInteractive({useHandCursor:true});cont.add(hit);
    hit.on('pointerover',()=>{lbl.setAlpha(1);this.tweens.add({targets:dia,scale:1.4,duration:120});});
    hit.on('pointerout',()=>{lbl.setAlpha(0);this.tweens.add({targets:dia,scale:1.0,duration:120});});
    hit.on('pointerdown',()=>this.triggerHotspot(h));
    this.tweens.add({targets:[dia,br],alpha:{from:0.6,to:1.0},duration:1200,yoyo:true,repeat:-1});this.roomLayer.add(cont);
  }
  makeNPC(n){
    const cont=this.add.container(n.x,n.y);cont.add(this.add.ellipse(0,70,70,14,0x000000,0.5));
    const body=this.add.graphics();body.fillStyle(n.color,1);body.beginPath();body.moveTo(-22,60);body.lineTo(-14,0);body.lineTo(14,0);body.lineTo(22,60);body.closePath();body.fillPath();body.lineStyle(2,0x0a0a0f,1);body.strokePath();cont.add(body);
    cont.add(this.add.circle(0,-14,14,0xd4cfe0).setStrokeStyle(2,0x0a0a0f));
    cont.add([this.add.rectangle(0,-50,100,18,C.BG_PANEL,0.92).setStrokeStyle(1,C.ACCENT),this.add.text(0,-50,n.name,{fontFamily:F.UI,fontSize:'10px',fontStyle:'700',color:C.ACCENT_S,letterSpacing:2}).setOrigin(0.5)]);
    const dot=this.add.circle(40,-36,4,C.ACCENT);cont.add(dot);this.tweens.add({targets:dot,alpha:{from:0.4,to:1},duration:700,yoyo:true,repeat:-1});
    const hit=this.add.rectangle(0,20,80,100,0x000000,0).setInteractive({useHandCursor:true});cont.add(hit);
    hit.on('pointerover',()=>{this.tweens.add({targets:cont,y:n.y-4,duration:140});});hit.on('pointerout',()=>{this.tweens.add({targets:cont,y:n.y,duration:140});});
    hit.on('pointerdown',()=>this.triggerNPC(n));this.roomLayer.add(cont);
  }
  buildNavBar(){
    const navY=552,navH=48;this.navLayer.add([this.add.rectangle(0,navY,960,navH,C.BG_PANEL,1).setOrigin(0,0),this.add.rectangle(0,navY,960,2,C.ACCENT).setOrigin(0,0)]);
    const tabs=['LOCATIONS','EVIDENCE','SUSPECTS','MAP'];this.navTabBtns={};const tabW=240;
    tabs.forEach((label,i)=>{const x=i*tabW;const tBg=this.add.rectangle(x,navY,tabW,navH,C.BG_PANEL,1).setOrigin(0,0).setStrokeStyle(1,C.MUTE);const tTx=this.add.text(x+tabW/2,navY+navH/2,label,{fontFamily:F.UI,fontSize:'13px',fontStyle:'700',color:C.MUTE_S,letterSpacing:3}).setOrigin(0.5);this.navLayer.add([tBg,tTx]);
      tBg.setInteractive({useHandCursor:true});tBg.on('pointerdown',()=>this.openTab(label));tBg.on('pointerover',()=>{tBg.setStrokeStyle(1,C.ACCENT);tTx.setColor(C.ACCENT_S);});tBg.on('pointerout',()=>{tBg.setStrokeStyle(1,C.MUTE);tTx.setColor(C.MUTE_S);});this.navTabBtns[label]={bg:tBg,txt:tTx};});
  }
  openTab(label){if(this.dialogueActive)return;if(label==='LOCATIONS')this.openLocationsPanel();else if(label==='EVIDENCE')this.openEvidencePanel();else if(label==='SUSPECTS')this.toggleSuspectBoard(true);else if(label==='MAP')this.openMapPanel();}
  closePanel(){this.tweens.add({targets:this.panelLayer,alpha:0,duration:200,onComplete:()=>{this.panelLayer.setVisible(false);this.panelLayer.removeAll(true);}});}
  openLocationsPanel(){
    const L=this.panelLayer;L.removeAll(true);const pw=960,ph=300,py=252;
    L.add(this.add.rectangle(0,py,pw,ph,C.BG_PANEL,1).setOrigin(0,0).setStrokeStyle(1,C.MUTE));L.add(drawAllCornerMarks(this,0,py,pw,ph,C.ACCENT,16));
    L.add(this.add.text(20,py+10,'// LOCATIONS',{fontFamily:F.UI,fontSize:'16px',fontStyle:'700',color:C.ACCENT_S,letterSpacing:4}));
    L.add(makeButton(this,880,py+8,60,24,'\u00d7 CLOSE',{fontSize:11,onClick:()=>this.closePanel()}));
    LOCATION_KEYS.forEach((k,i)=>{const bx=40+(i%3)*300,by=py+50+Math.floor(i/3)*80;const v=this.gs.visitedLocations.includes(k);
      L.add(makeButton(this,bx,by,260,60,LOCATION_NAMES[k],{fontSize:13,onClick:()=>{this.closePanel();this.transitionToLocation(k);}}));L.add(this.add.circle(bx+240,by+30,5,v?C.ACCENT:C.MUTE));});
    L.setVisible(true).setAlpha(0);this.tweens.add({targets:L,alpha:1,duration:200});
  }
  openEvidencePanel(){
    const L=this.panelLayer;L.removeAll(true);const pw=960,ph=200,py=352;
    L.add(this.add.rectangle(0,py,pw,ph,C.BG_PANEL,1).setOrigin(0,0).setStrokeStyle(1,C.MUTE));L.add(drawAllCornerMarks(this,0,py,pw,ph,C.ACCENT,14));
    L.add(this.add.text(20,py+8,'// EVIDENCE',{fontFamily:F.UI,fontSize:'14px',fontStyle:'700',color:C.ACCENT_S,letterSpacing:4}));
    L.add(makeButton(this,880,py+6,60,22,'\u00d7 CLOSE',{fontSize:10,onClick:()=>this.closePanel()}));
    const filters=['ALL','PHYSICAL','DOCUMENT','TESTIMONY'];if(!this._evFilter)this._evFilter='ALL';
    filters.forEach((f,i)=>{const bx=160+i*80,by=py+8;const isActive=f===this._evFilter;
      const fb=this.add.rectangle(bx,by,72,20,isActive?C.ACCENT:C.BG_PANEL2,1).setOrigin(0,0).setStrokeStyle(1,isActive?C.ACCENT:C.MUTE);
      const ft=this.add.text(bx+36,by+10,f,{fontFamily:F.UI,fontSize:'10px',fontStyle:'700',color:isActive?C.LIGHT_S:C.MUTE_S,letterSpacing:1}).setOrigin(0.5);
      fb.setInteractive({useHandCursor:true});fb.on('pointerdown',()=>{this._evFilter=f;this.openEvidencePanel();});
      L.add([fb,ft]);});
    const searchDom=this.add.dom(660,py+18).createFromHTML('<input id="ev-search" style="width:180px;height:20px;background:#0d0d14;border:1px solid #4a4a5a;color:#f0eaff;font-family:Space Mono,monospace;font-size:10px;padding:2px 6px;" placeholder="Search room..." />');
    L.add(searchDom);
    const evs=this.gs.collectedEvidence;const searchEl=document.getElementById('ev-search');const searchVal=searchEl?searchEl.value.toLowerCase():'';
    const filtered=evs.filter(id=>{const m=EVIDENCE_META[id];if(!m)return true;
      if(this._evFilter!=='ALL'&&m.type!==this._evFilter)return false;
      if(searchVal&&!m.room.toLowerCase().includes(searchVal)&&!id.toLowerCase().includes(searchVal))return false;return true;});
    if(filtered.length===0){L.add(this.add.text(480,py+110,'// NO EVIDENCE MATCHES FILTER',{fontFamily:F.MONO,fontSize:'12px',color:C.MUTE_S}).setOrigin(0.5));}
    else{if(!this._evPage)this._evPage=0;const perPage=7;const maxPage=Math.max(0,Math.ceil(filtered.length/perPage)-1);if(this._evPage>maxPage)this._evPage=maxPage;
      const pageEvs=filtered.slice(this._evPage*perPage,(this._evPage+1)*perPage);
      const cW=120,cH=80,gap=8,sX=20;pageEvs.forEach((id,i)=>{const cx=sX+i*(cW+gap),cy=py+58,m=EVIDENCE_META[id];const card=this.add.container(cx,cy);
      card.add([this.add.rectangle(0,0,cW,cH,C.BG_PANEL2,1).setOrigin(0,0).setStrokeStyle(1,C.MUTE),this.add.rectangle(0,0,3,cH,C.ACCENT,1).setOrigin(0,0),
        this.add.text(8,8,id.length>16?id.slice(0,15)+'\u2026':id,{fontFamily:F.UI,fontSize:'11px',fontStyle:'700',color:C.ACCENT_S,letterSpacing:1}),
        this.add.text(8,28,(m?m.type.slice(0,3):'???')+' \u00b7 '+(m?m.room:'???'),{fontFamily:F.MONO,fontSize:'9px',color:C.MUTE_S,letterSpacing:1})]);L.add(card);});
      if(maxPage>0){const pIdx=this._evPage;
        if(pIdx>0)L.add(makeButton(this,20,py+ph-26,60,20,'< PREV',{fontSize:9,onClick:()=>{this._evPage--;this.openEvidencePanel();}}));
        if(pIdx<maxPage)L.add(makeButton(this,880,py+ph-26,60,20,'NEXT >',{fontSize:9,onClick:()=>{this._evPage++;this.openEvidencePanel();}}));
        L.add(this.add.text(480,py+ph-16,'PAGE '+(pIdx+1)+'/'+(maxPage+1),{fontFamily:F.MONO,fontSize:'9px',color:C.MUTE_S,letterSpacing:2}).setOrigin(0.5));
      }
    }
    L.setVisible(true).setAlpha(0);this.tweens.add({targets:L,alpha:1,duration:200});
  }
  openMapPanel(){
    const L=this.panelLayer;L.removeAll(true);const pw=960,ph=300,py=252;
    L.add(this.add.rectangle(0,py,pw,ph,C.BG_PANEL,1).setOrigin(0,0).setStrokeStyle(1,C.MUTE));L.add(drawAllCornerMarks(this,0,py,pw,ph,C.ACCENT,16));
    L.add(this.add.text(20,py+10,'// MAP',{fontFamily:F.UI,fontSize:'16px',fontStyle:'700',color:C.ACCENT_S,letterSpacing:4}));
    L.add(makeButton(this,880,py+8,60,24,'\u00d7 CLOSE',{fontSize:11,onClick:()=>this.closePanel()}));
    LOCATION_KEYS.forEach((k,i)=>{const col=i%3,row=Math.floor(i/3);const bx=80+col*290,by=py+50+row*100;const v=this.gs.visitedLocations.includes(k);
      L.add(makeButton(this,bx,by,250,70,LOCATION_NAMES[k],{fontSize:12,onClick:()=>{this.closePanel();this.transitionToLocation(k);}}));L.add(this.add.circle(bx+230,by+35,5,v?C.ACCENT:C.MUTE));});
    L.setVisible(true).setAlpha(0);this.tweens.add({targets:L,alpha:1,duration:200});
  }
  transitionToLocation(loc){this.cameras.main.fadeOut(300);this.cameras.main.once('camerafadeoutcomplete',()=>{this.loadLocation(loc);this.cameras.main.fadeIn(300);});}
  buildDialoguePanel(){
    const x=0,y=460,w=960,h=140;const bg=this.add.rectangle(x,y,w,h,C.BG_PANEL,1).setOrigin(0,0);const tl=this.add.rectangle(x,y,w,1,C.MUTE).setOrigin(0,0);
    this.dialogueLayer.add([bg,tl]);this.dialogueLayer.add(drawAllCornerMarks(this,x,y,w,h,C.ACCENT,14));
    this.dialogueLayer.add(this.add.rectangle(10,y+10,100,120,0x000000,0).setOrigin(0,0).setStrokeStyle(2,C.ACCENT));
    this.dPortrait=this.add.image(60,y+70,'portrait_investigator').setOrigin(0.5).setDisplaySize(100,120);this.dialogueLayer.add(this.dPortrait);
    this.dSpeaker=this.add.text(120,y+10,'',{fontFamily:F.UI,fontSize:'14px',fontStyle:'700',color:C.ACCENT_S,letterSpacing:2});this.dialogueLayer.add(this.dSpeaker);
    this.dText=this.add.text(120,y+34,'',{fontFamily:F.MONO,fontSize:'12px',color:C.LIGHT_S,wordWrap:{width:820,useAdvancedWrap:true},lineSpacing:4});this.dialogueLayer.add(this.dText);
    this.dContinue=this.add.text(940,y+130,'[ CLICK TO CONTINUE ]',{fontFamily:F.MONO,fontSize:'10px',color:C.ACCENT_S,letterSpacing:2}).setOrigin(1,1);this.dialogueLayer.add(this.dContinue);
    this.tweens.add({targets:this.dContinue,alpha:{from:1,to:0.35},duration:700,yoyo:true,repeat:-1});
    bg.setInteractive({useHandCursor:true});bg.on('pointerdown',()=>this.advanceDialogue());
  }
  showDialogue(lines,onDone){this.dialogueActive=true;this.dialogueQueue=lines.slice();this._onDone=onDone||null;this.dialogueLayer.setVisible(true).setAlpha(0);this.dialogueLayer.y=8;this.tweens.add({targets:this.dialogueLayer,alpha:1,y:0,duration:220,ease:'Power2'});this.advanceDialogue(true);}
  advanceDialogue(init){if(!this.dialogueActive)return;if(!init&&this.dialogueQueue.length===0){this.hideDialogue();return;}const next=this.dialogueQueue.shift();if(!next){this.hideDialogue();return;}this.dPortrait.setTexture(next.portrait);this.dSpeaker.setText(next.speaker);this.dText.setStyle({fontFamily:F.MONO,fontSize:'12px',color:C.LIGHT_S,fontStyle:next.italic?'italic':'400',wordWrap:{width:820,useAdvancedWrap:true},lineSpacing:4});this.dText.setText(next.text);this.dText.setAlpha(0);this.tweens.add({targets:this.dText,alpha:1,duration:130});}
  hideDialogue(){this.dialogueActive=false;this.tweens.add({targets:this.dialogueLayer,alpha:0,y:8,duration:200,onComplete:()=>{this.dialogueLayer.setVisible(false);const d=this._onDone;this._onDone=null;if(d)d();}});}
  triggerHotspot(h){if(this.dialogueActive)return;this.showDialogue(h.lines,()=>{if(h.collect)this.collectEvidence(h.collect);if(h.contradiction){const r=Array.isArray(h.contradiction.requires)?h.contradiction.requires:[h.contradiction.requires];if(r.every(x=>this.gs.collectedEvidence.includes(x))){this.fireContradiction(h.contradiction.id);return;}}this.checkContradictions();});}
  triggerNPC(n){if(this.dialogueActive)return;if(!this.gs.suspectsTalked.includes(n.id))this.gs.suspectsTalked.push(n.id);let q=n.lines.slice();if(n.conditional){const ch=Array.isArray(n.conditional.has)?n.conditional.has:[n.conditional.has];if(ch.every(x=>this.gs.collectedEvidence.includes(x)))q.push(n.conditional.line);}this.showDialogue(q,()=>{if(n.collect)this.collectEvidence(n.collect);this.checkContradictions();});}
  collectEvidence(id){
    if(!id||this.gs.collectedEvidence.includes(id))return false;this.gs.collectedEvidence.push(id);saveState();this.refreshHeader();this.cameras.main.flash(120,230,57,70);
    if(id==="THE DRIFTER'S ACCOUNT"){if(!this.gs.collectedEvidence.includes('FRAMING PHONE')){this.gs.collectedEvidence.push('FRAMING PHONE');this.fireContradiction(6);}if(!this.gs.collectedEvidence.includes('SAW DRILL'))this.gs.collectedEvidence.push('SAW DRILL');}
    if(id==='KNOCKOUT GAS BOTTLE #1'){if(!this.gs.collectedEvidence.includes('KNOCKOUT GAS INFO'))this.gs.collectedEvidence.push('KNOCKOUT GAS INFO');if(!this.gs.collectedEvidence.includes('KNOCKOUT GAS BOTTLE #2'))this.gs.collectedEvidence.push('KNOCKOUT GAS BOTTLE #2');if(!this.gs.collectedEvidence.includes('KNOCKOUT GAS BOTTLE #3'))this.gs.collectedEvidence.push('KNOCKOUT GAS BOTTLE #3');}
    this.roomLayer.removeAll(true);HOTSPOTS[this.gs.currentLocation].forEach(h=>this.makeHotspot(h));(NPCS[this.gs.currentLocation]||[]).filter(n=>!n.requires||this.gs.collectedEvidence.includes(n.requires)).forEach(n=>this.makeNPC(n));this.checkTrialReady();return true;
  }
  checkContradictions(){for(const c of CONTRADICTIONS){if(this.gs.contradictionsTriggered.includes(c.id))continue;if(c.requires.every(r=>this.gs.collectedEvidence.includes(r))){this.fireContradiction(c.id);return;}}}
  fireContradiction(id){
    const c=CONTRADICTIONS.find(x=>x.id===id);if(!c||this.gs.contradictionsTriggered.includes(id))return;this.gs.contradictionsTriggered.push(id);saveState();this.refreshHeader();
    const L=this.contraLayer;L.removeAll(true);L.setVisible(true).setAlpha(0);
    const fl=this.add.rectangle(0,0,960,600,C.ACCENT,0).setOrigin(0,0);L.add(fl);this.tweens.add({targets:fl,alpha:{from:0,to:0.9},duration:200,yoyo:true});
    const pw=600,ph=200,px=(960-pw)/2,py=(600-ph)/2;
    L.add(this.add.rectangle(px,py,pw,ph,C.BG_PANEL,1).setOrigin(0,0).setStrokeStyle(2,C.ACCENT));L.add(drawAllCornerMarks(this,px,py,pw,ph,C.ACCENT,16));
    L.add(this.add.text(px+20,py+16,'// CONTRADICTION',{fontFamily:F.UI,fontSize:'18px',fontStyle:'700',color:C.ACCENT_S,letterSpacing:4}));
    L.add(this.add.rectangle(px+20,py+42,pw-40,1,C.ACCENT).setOrigin(0,0));
    L.add(this.add.text(px+20,py+56,c.text,{fontFamily:F.MONO,fontSize:'13px',color:C.LIGHT_S,wordWrap:{width:pw-40,useAdvancedWrap:true},lineSpacing:4}));
    const ha=this.add.rectangle(0,0,960,600,0x000000,0).setInteractive();L.add(ha);ha.on('pointerdown',()=>{this.tweens.add({targets:L,alpha:0,duration:300,onComplete:()=>{L.setVisible(false);L.removeAll(true);}});});
    this.tweens.add({targets:L,alpha:1,duration:300});
  }
  toggleSuspectBoard(show){if(show){this.buildSuspectBoard();this.suspectLayer.setVisible(true).setAlpha(0);this.tweens.add({targets:this.suspectLayer,alpha:1,duration:180});}else{this.tweens.add({targets:this.suspectLayer,alpha:0,duration:180,onComplete:()=>{this.suspectLayer.setVisible(false);this.suspectLayer.removeAll(true);}});}}
  buildSuspectBoard(){
    const L=this.suspectLayer;L.removeAll(true);L.add(this.add.rectangle(0,0,960,600,C.BG_PANEL,0.97).setOrigin(0,0));
    const gr=this.add.graphics();gr.fillStyle(C.MUTE,0.2);for(let gx=0;gx<=960;gx+=32)for(let gy=0;gy<=600;gy+=32)gr.fillRect(gx,gy,1,1);L.add(gr);
    L.add(this.add.text(20,16,'// SUSPECT BOARD',{fontFamily:F.UI,fontSize:'20px',fontStyle:'700',color:C.LIGHT_S,letterSpacing:5}));
    L.add(this.add.text(20,42,'cross-reference suspects against evidence',{fontFamily:F.MONO,fontSize:'10px',color:C.MUTE_S,letterSpacing:1}));
    L.add(makeButton(this,880,14,60,28,'\u00d7 CLOSE',{fontSize:11,onClick:()=>this.toggleSuspectBoard(false)}));
    const cW=160,cH=280,gap=10,tW=5*cW+4*gap,sX=(960-tW)/2,cY=80;
    SUSPECTS.forEach((sus,i)=>{const x=sX+i*(cW+gap);const card=this.add.container(x,cY);
      card.add(this.add.rectangle(0,0,cW,cH,C.BG_PANEL2,1).setOrigin(0,0).setStrokeStyle(1,C.MUTE));card.add(this.add.rectangle(0,0,cW,4,C.ACCENT,1).setOrigin(0,0));
      card.add(this.add.text(10,14,'0'+(i+1),{fontFamily:F.MONO,fontSize:'10px',color:C.MUTE_S,letterSpacing:2}));
      card.add(this.add.image(cW/2,100,sus.portrait).setOrigin(0.5).setDisplaySize(140,160));card.add(this.add.rectangle(cW/2,100,142,162,0x000000,0).setOrigin(0.5).setStrokeStyle(1,C.ACCENT,0.7));
      card.add(this.add.text(cW/2,200,sus.name,{fontFamily:F.UI,fontSize:'14px',fontStyle:'700',color:C.LIGHT_S,letterSpacing:2}).setOrigin(0.5));
      card.add(this.add.rectangle(20,220,cW-40,1,C.MUTE).setOrigin(0,0));
      card.add(this.add.text(cW/2,234,sus.desc,{fontFamily:F.MONO,fontSize:'10px',color:C.MUTE_S,wordWrap:{width:cW-24,useAdvancedWrap:true},align:'center',lineSpacing:2}).setOrigin(0.5));
      const pins=this.gs.pins[sus.id]||[];const pc=this.add.container(8,260);let py=0;pins.slice(0,2).forEach(p=>{pc.add([this.add.rectangle(0,py,cW-16,14,0x000000,0).setOrigin(0,0).setStrokeStyle(1,C.ACCENT),this.add.text(4,py+7,'\u00b7 '+(p.length>18?p.slice(0,17)+'\u2026':p),{fontFamily:F.MONO,fontSize:'8px',color:C.ACCENT_S,letterSpacing:1}).setOrigin(0,0.5)]);py+=16;});card.add(pc);
      card.add(makeButton(this,14,cH-28,cW-28,22,'+ PIN EVIDENCE',{fontSize:10,onClick:()=>this.openPinPicker(sus)}));L.add(card);});
  }
  openPinPicker(sus){
    const L=this.suspectLayer;const sub=this.add.container(0,0);sub.add(this.add.rectangle(0,0,960,600,0x000000,0.7).setOrigin(0,0).setInteractive());
    const pw=520,ph=440,px=(960-pw)/2,py=(600-ph)/2;sub.add(this.add.rectangle(px,py,pw,ph,C.BG_PANEL,1).setOrigin(0,0).setStrokeStyle(2,C.ACCENT));sub.add(drawAllCornerMarks(this,px,py,pw,ph,C.ACCENT,16));
    sub.add(this.add.text(px+16,py+22,'// PIN EVIDENCE TO '+sus.name,{fontFamily:F.UI,fontSize:'15px',fontStyle:'700',color:C.ACCENT_S,letterSpacing:4}));
    const pins=this.gs.pins[sus.id]||(this.gs.pins[sus.id]=[]);const list=this.gs.collectedEvidence;
    if(list.length===0)sub.add(this.add.text(px+pw/2,py+ph/2,'> NO EVIDENCE COLLECTED YET',{fontFamily:F.MONO,fontSize:'14px',color:C.MUTE_S}).setOrigin(0.5));
    list.forEach((id,i)=>{const col=i%2,row=Math.floor(i/2);const ix=px+20+col*240,iy=py+60+row*36;const ip=pins.includes(id);
      const ib=this.add.rectangle(ix,iy,230,30,C.BG_PANEL2,1).setOrigin(0,0).setStrokeStyle(1,ip?C.ACCENT:C.MUTE);const st=this.add.rectangle(ix,iy,3,30,ip?C.ACCENT:C.MUTE,1).setOrigin(0,0);
      const tx=this.add.text(ix+10,iy+8,(ip?'\u25c9 ':'\u25cb ')+(id.length>22?id.slice(0,21)+'\u2026':id),{fontFamily:F.MONO,fontSize:'10px',color:ip?C.ACCENT_S:C.LIGHT_S,letterSpacing:1});
      ib.setInteractive({useHandCursor:true});ib.on('pointerdown',()=>{if(pins.includes(id))pins.splice(pins.indexOf(id),1);else pins.push(id);saveState();sub.destroy();this.toggleSuspectBoard(false);this.toggleSuspectBoard(true);});
      sub.add([ib,st,tx]);});
    sub.add(makeButton(this,px+pw-110,py+ph-44,92,28,'DONE',{fontSize:12,onClick:()=>sub.destroy()}));L.add(sub);
  }
  buildAssistantButton(){
    const x=870,y=490;const cont=this.add.container(x,y);cont.add(this.add.image(0,0,'portrait_assistant').setOrigin(0.5).setDisplaySize(80,100));
    cont.add(this.add.rectangle(0,0,82,102,0x000000,0).setOrigin(0.5).setStrokeStyle(2,C.ACCENT));
    const hit=this.add.rectangle(0,0,82,102,0x000000,0).setInteractive({useHandCursor:true});cont.add(hit);
    hit.on('pointerdown',()=>{if(!this.dialogueActive)this.toggleHintPanel(true);});this.roomLayer.add(cont);
  }
  toggleHintPanel(show){if(show){this.buildHintPanel();this.hintLayer.setVisible(true);this.hintLayer.x=960;this.tweens.add({targets:this.hintLayer,x:0,duration:220,ease:'Cubic.Out'});}else{this.tweens.add({targets:this.hintLayer,x:960,duration:200,ease:'Cubic.In',onComplete:()=>{this.hintLayer.setVisible(false);this.hintLayer.removeAll(true);this.hintLayer.x=0;}});}}
  buildHintPanel(){
    const L=this.hintLayer;L.removeAll(true);const pw=280,ph=600,px=960-pw,py=0;
    L.add(this.add.rectangle(px,py,pw,ph,C.BG_PANEL,1).setOrigin(0,0).setStrokeStyle(1,C.ACCENT));L.add(drawAllCornerMarks(this,px,py,pw,ph,C.ACCENT,14));
    L.add(this.add.text(px+16,py+16,'// THE ASSISTANT',{fontFamily:F.UI,fontSize:'14px',fontStyle:'700',color:C.ACCENT_S,letterSpacing:4}));
    L.add(makeButton(this,px+pw-46,py+12,30,22,'\u00d7',{fontSize:14,onClick:()=>this.toggleHintPanel(false)}));
    L.add(this.add.image(px+pw/2,py+80,'portrait_assistant').setOrigin(0.5).setDisplaySize(100,125));L.add(this.add.rectangle(px+pw/2,py+80,102,127,0x000000,0).setOrigin(0.5).setStrokeStyle(1,C.ACCENT,0.7));
    if(!this._hintMsgs)this._hintMsgs=[];
    const msgY=py+160,msgH=ph-240;L.add(this.add.rectangle(px+8,msgY,pw-16,msgH,C.BG_PANEL2,1).setOrigin(0,0).setStrokeStyle(1,C.MUTE));
    L.add(this.add.text(px+16,msgY+6,'// MESSAGE HISTORY',{fontFamily:F.MONO,fontSize:'10px',color:C.ACCENT_S,letterSpacing:2}));
    const msgCont=this.add.container(px+16,msgY+22);let my=0;
    this._hintMsgs.forEach(m=>{const c=m.isPlayer?C.LIGHT_S:C.ACCENT_S;const t=this.add.text(0,my,(m.isPlayer?'> ':'< ')+m.text,{fontFamily:F.MONO,fontSize:'11px',color:c,wordWrap:{width:pw-48,useAdvancedWrap:true},fontStyle:m.isPlayer?'400':'italic',lineSpacing:2});msgCont.add(t);my+=t.height+6;});
    L.add(msgCont);
    const iY=py+ph-70;L.add(this.add.rectangle(px+8,iY,pw-16,62,C.BG_PANEL2,1).setOrigin(0,0).setStrokeStyle(1,C.MUTE));
    const inp=this.add.dom(px+16,iY+6).createFromHTML('<input id="hint-input" style="width:240px;height:24px;background:#0d0d14;border:1px solid #4a4a5a;color:#f0eaff;font-family:Space Mono,monospace;font-size:11px;padding:4px;" placeholder="Ask the Assistant..." />');L.add(inp);
    L.add(makeButton(this,px+16,iY+36,80,20,'[ SEND ]',{fontSize:10,onClick:()=>{
      const el=document.getElementById('hint-input');if(!el||!el.value.trim())return;const msg=el.value.trim();el.value='';
      this._hintMsgs.push({isPlayer:true,text:msg});
      fetch('/api/hint',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({message:msg,location:this.gs.currentLocation})})
        .then(r=>r.json()).then(d=>{this._hintMsgs.push({isPlayer:false,text:d.reply||'No response.'});this.buildHintPanel();})
        .catch(()=>{const fb=HINTS[this.gs.currentLocation]||[];const reply=fb[Math.floor(Math.random()*fb.length)];this._hintMsgs.push({isPlayer:false,text:reply});this.buildHintPanel();});
    }}));
  }
  checkTrialReady(){const va=LOCATION_KEYS.every(k=>this.gs.visitedLocations.includes(k));const ee=this.gs.collectedEvidence.length>=12;if(va&&ee&&this.gs.gamePhase==='investigation'){this.gs.gamePhase='trial';saveState();this.time.delayedCall(800,()=>{this.cameras.main.fadeOut(400);this.cameras.main.once('camerafadeoutcomplete',()=>{this.scene.start('Trial');});});}}
}
