import { C, F } from './constants.js';
import { gameState } from './state.js';
import { drawCanvasFrame, makeButton } from './helpers.js';

export class IntroScene extends Phaser.Scene{
  constructor(){super('Intro');}
  create(){
    gameState.gamePhase='intro';this.cameras.main.setBackgroundColor(C.BG_S);drawCanvasFrame(this);
    this.panelIndex=0;this.advancing=false;this.lastPanel=false;this.layer=this.add.container(0,0);
    this.input.keyboard.on('keydown-SPACE',()=>this.advance());this.input.on('pointerdown',()=>this.advance());this.showPanel();
  }
  clearLayer(){this.layer.removeAll(true);}
  showPanel(){
    this.clearLayer();const idx=this.panelIndex;
    if(idx===1&&this.textures.exists('bg_void'))this.layer.add(this.add.image(480,300,'bg_void').setAlpha(0.6));
    if(idx===3&&this.textures.exists('bg_labyrinth'))this.layer.add(this.add.image(480,300,'bg_labyrinth').setAlpha(0.6));
    if(idx===0){
      this.layer.add(this.add.text(480,240,'[ HALLOWEEN NIGHT. ]',{fontFamily:F.UI,fontSize:'18px',fontStyle:'700',color:C.ACCENT_S}).setOrigin(0.5));
      this.layer.add(this.add.text(480,278,'Four people are dead.',{fontFamily:F.MONO,fontSize:'16px',color:C.LIGHT_S}).setOrigin(0.5));
      this.layer.add(this.add.text(480,308,'One is not dead yet \u2014 but the gate is already open.',{fontFamily:F.MONO,fontSize:'16px',color:C.LIGHT_S}).setOrigin(0.5));
    }else if(idx===1){
      this.layer.add(this.add.text(480,230,'The Void of Judgement opened.',{fontFamily:F.MONO,fontSize:'16px',color:C.LIGHT_S}).setOrigin(0.5));
      this.layer.add(this.add.text(480,264,'Someone made sure of that.',{fontFamily:F.MONO,fontSize:'16px',color:C.LIGHT_S}).setOrigin(0.5));
      this.layer.add(this.add.text(480,298,'It was not an accident.',{fontFamily:F.MONO,fontSize:'16px',color:C.LIGHT_S}).setOrigin(0.5));
    }else if(idx===2){
      this.layer.add(this.add.image(180,200,'portrait_investigator').setOrigin(0.5).setDisplaySize(160,200));
      this.layer.add(this.add.rectangle(180,200,162,202,0x000000,0).setOrigin(0.5).setStrokeStyle(2,C.ACCENT));
      this.layer.add(this.add.text(400,200,"I don't have a name that matters here.",{fontFamily:F.MONO,fontSize:'14px',color:C.LIGHT_S}));
      this.layer.add(this.add.text(400,234,'What matters is what I find.',{fontFamily:F.MONO,fontSize:'14px',color:C.LIGHT_S}));
      this.layer.add(this.add.text(400,268,'And the person in this room who caused all of this.',{fontFamily:F.MONO,fontSize:'14px',color:C.LIGHT_S}));
    }else if(idx===3){
      this.layer.add(this.add.text(480,230,'The trail starts in the basement.',{fontFamily:F.MONO,fontSize:'16px',color:C.LIGHT_S}).setOrigin(0.5));
      this.layer.add(this.add.text(480,264,'It ends in the void.',{fontFamily:F.MONO,fontSize:'16px',color:C.LIGHT_S}).setOrigin(0.5));
      this.layer.add(this.add.text(480,298,"Let's walk it.",{fontFamily:F.MONO,fontSize:'16px',color:C.LIGHT_S}).setOrigin(0.5));
    }else if(idx===4){
      this.layer.add(this.add.text(480,200,'THE VOID CASE',{fontFamily:F.UI,fontSize:'48px',fontStyle:'700',color:C.ACCENT_S,letterSpacing:6}).setOrigin(0.5));
      this.layer.add(this.add.text(480,264,'Case File \u2014 Halloween Night',{fontFamily:F.MONO,fontSize:'14px',color:C.LIGHT_S}).setOrigin(0.5));
      this.layer.add(makeButton(this,340,330,280,50,'[ BEGIN INVESTIGATION ]',{fontSize:16,onClick:()=>{this.scene.start('Game');}}));
      this.lastPanel=true;
    }
    if(idx<4){const ct=this.add.text(480,540,'[ CLICK OR SPACE TO CONTINUE ]',{fontFamily:F.MONO,fontSize:'11px',color:C.ACCENT_S,letterSpacing:2}).setOrigin(0.5);this.layer.add(ct);this.tweens.add({targets:ct,alpha:{from:1,to:0.35},duration:700,yoyo:true,repeat:-1});}
    this.cameras.main.fadeIn(300);
  }
  advance(){if(this.advancing||this.lastPanel)return;this.advancing=true;this.cameras.main.fadeOut(300);this.cameras.main.once('camerafadeoutcomplete',()=>{this.panelIndex++;this.advancing=false;this.showPanel();});}
}
