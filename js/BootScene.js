import { C, F } from './constants.js';
import { gameState, loadState } from './state.js';

export class BootScene extends Phaser.Scene{
  constructor(){super('Boot');}
  create(){
    loadState().then(()=>{
      this.bakeBackgrounds();this.bakePortraits();
      if(gameState.gamePhase==='trial'){this.scene.start('Trial');}
      else if(gameState.gamePhase==='accusation'){this.scene.start('Accusation');}
      else{this.scene.start('Intro');}
    }).catch(()=>{
      this.bakeBackgrounds();this.bakePortraits();this.scene.start('Intro');
    });
  }
  mg(){return this.make.graphics({add:false});}

  bakePortraits(){
    const portraits=[
      {key:'portrait_investigator',body:0x2a2a3a,head:0x2a2a3a,hair:null,acc:null,border:0xe63946,nc:'#f0eaff',bg:0x1a1a2a},
      {key:'portrait_scheduler',body:0x1a0a0a,head:0xc49a6c,hair:{t:'rect',x:30,y:20,w:100,h:30,c:0xe87ca0},acc:null,border:0x9b1d20,nc:'#e63946',bg:0x1a0f0f},
      {key:'portrait_operator',body:0x2a2035,head:0xd4cfe0,hair:{t:'rect',x:35,y:22,w:90,h:20,c:0x1a1520},acc:{t:'badge',x:65,y:140,w:30,h:15},border:0x4a4a5a,nc:'#f0eaff',bg:0x12121a},
      {key:'portrait_observer',body:0xd4621a,head:0x8b5e3c,hair:{t:'rect',x:25,y:18,w:110,h:28,c:0x1a0f0a},acc:null,border:0xd4621a,nc:'#f0eaff',bg:0x1a1210},
      {key:'portrait_courier',body:0x2d4a2d,head:0xc49a6c,hair:{t:'rect',x:40,y:24,w:80,h:18,c:0x2a1f1a},acc:{t:'frown',x:80,y:76},border:0x4a4a5a,nc:'#f0eaff',bg:0x1a1a18},
      {key:'portrait_drifter',body:0x2a2035,head:0xd4cfe0,hair:{t:'rect',x:30,y:20,w:50,h:40,c:0xe87ca0},acc:{t:'eye',x:110,y:62,c:0xc49a2a},border:0x4a4a5a,nc:'#c49a2a',bg:0x12121a},
      {key:'portrait_cloaked',body:0x0f0f0f,head:0x0f0f0f,hair:null,acc:{t:'mask',x:80,y:62,c:0xf0f0f0},border:0x4a4a5a,nc:'#f0eaff',bg:0x0f0f0f},
      {key:'portrait_assistant',body:0x1a1218,head:0x1a1218,hair:{t:'hood',pts:[[30,120],[20,50],[80,20],[140,50],[130,120]],c:0x0a0810},acc:{t:'eye',x:100,y:62,c:0xe63946},border:0xe63946,nc:'#9b1d20',bg:0x1a1218}
    ];
    portraits.forEach(p=>{
      const W=160,H=200;const rt=this.add.renderTexture(0,0,W,H).setVisible(false);
      const g=this.add.graphics();
      g.fillStyle(p.bg,1);g.fillRect(0,0,W,H);
      g.lineStyle(2,p.border,1);g.strokeRect(2,2,W-4,H-4);
      g.fillStyle(p.body,1);g.beginPath();g.moveTo(20,H);g.lineTo(42,115);g.lineTo(118,115);g.lineTo(140,H);g.closePath();g.fillPath();
      g.fillStyle(p.head,1);g.fillCircle(80,62,26);
      if(p.hair){if(p.hair.t==='rect'){g.fillStyle(p.hair.c,1);g.fillRect(p.hair.x,p.hair.y,p.hair.w,p.hair.h);}else if(p.hair.t==='hood'){g.fillStyle(p.hair.c,1);g.beginPath();p.hair.pts.forEach(([px,py],i)=>i===0?g.moveTo(px,py):g.lineTo(px,py));g.closePath();g.fillPath();}}
      if(p.acc){if(p.acc.t==='badge'){g.fillStyle(0x4a4a5a,1);g.fillRect(p.acc.x,p.acc.y,p.acc.w,p.acc.h);}else if(p.acc.t==='eye'){g.fillStyle(p.acc.c,1);g.fillCircle(p.acc.x,p.acc.y,4);}else if(p.acc.t==='mask'){g.fillStyle(p.acc.c,0.7);g.fillEllipse(p.acc.x,p.acc.y,40,30);}else if(p.acc.t==='frown'){g.lineStyle(1,0x4a4a5a,1);g.beginPath();g.moveTo(p.acc.x-8,p.acc.y);g.lineTo(p.acc.x+8,p.acc.y+4);g.strokePath();}}
      rt.draw(g);g.destroy();
      const nm=p.key.replace('portrait_','').toUpperCase();
      const txt=this.add.text(W/2,182,nm,{fontFamily:F.MONO,fontSize:'9px',color:p.nc}).setOrigin(0.5);
      rt.draw(txt);txt.destroy();rt.saveTexture(p.key);rt.destroy();
    });
  }

  bakeBackgrounds(){this.bakeBasement();this.bakePlanetarium();this.bakeLabyrinth();this.bakeZeroGrav();this.bakeVoid();this.bakeTVStation();}

  bakeBasement(){
    const W=960,H=600,g=this.mg();
    g.fillStyle(0x1e1e28,1);g.fillRect(0,0,W,380);
    g.lineStyle(1,0x0f0f15,1);for(let x=0;x<=W;x+=60){g.beginPath();g.moveTo(x,0);g.lineTo(x,380);g.strokePath();}
    for(let y=0;y<=380;y+=40){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.strokePath();}
    g.fillStyle(0x1a1a22,1);g.fillRect(0,380,W,220);
    g.lineStyle(1,0x0f0f15,1);for(let x=0;x<=W;x+=60){g.beginPath();g.moveTo(x,380);g.lineTo(x,H);g.strokePath();}
    for(let y=380;y<=H;y+=40){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.strokePath();}
    const dS=(sx,sy)=>{g.fillStyle(0x2a2a38,1);g.fillRect(sx,sy,8,200);g.fillRect(sx+80,sy,8,200);for(let i=0;i<4;i++){const py=sy+10+i*48;g.fillStyle(0x3a3a48,1);g.fillRect(sx-4,py,96,6);g.fillStyle(0x2a2a38,1);g.fillRect(sx+10,py-14,18,14);g.fillRect(sx+40,py-10,22,10);}};
    dS(50,140);dS(200,140);dS(700,140);
    g.lineStyle(3,0x8b7355,1);g.beginPath();g.moveTo(280,200);g.lineTo(290,260);g.lineTo(310,280);g.lineTo(300,340);g.strokePath();
    g.beginPath();g.moveTo(320,200);g.lineTo(330,250);g.lineTo(350,270);g.lineTo(340,340);g.strokePath();
    g.lineStyle(1,0x8b7355,0.8);for(let a=0;a<6;a++){const ang=(a/6)*Math.PI*2;g.beginPath();g.moveTo(300,340);g.lineTo(300+Math.cos(ang)*12,340+Math.sin(ang)*12);g.strokePath();g.beginPath();g.moveTo(340,340);g.lineTo(340+Math.cos(ang)*12,340+Math.sin(ang)*12);g.strokePath();}
    g.fillStyle(0x3a3a48,1);g.fillRect(620,400,50,8);g.lineStyle(2,0x2a2a38,1);
    g.beginPath();g.moveTo(622,408);g.lineTo(615,440);g.strokePath();g.beginPath();g.moveTo(668,408);g.lineTo(675,440);g.strokePath();
    g.beginPath();g.moveTo(635,408);g.lineTo(630,440);g.strokePath();g.beginPath();g.moveTo(655,408);g.lineTo(660,440);g.strokePath();
    g.fillStyle(0x3a3a48,1);g.fillRect(610,370,8,40);
    g.fillStyle(0xf0eaff,1);g.fillRect(470,20,20,10);g.fillStyle(0xe63946,0.04);g.fillTriangle(440,30,520,30,480,380);
    g.lineStyle(1,0x4a4a5a,0.6);g.beginPath();g.moveTo(465,20);g.lineTo(465,35);g.strokePath();g.beginPath();g.moveTo(495,20);g.lineTo(495,35);g.strokePath();
    g.generateTexture('bg_basement',W,H);g.destroy();
  }

  bakePlanetarium(){
    const W=960,H=600,g=this.mg();
    g.fillStyle(0x0d0d1a,1);g.fillRect(0,0,W,H);
    for(let i=0;i<70;i++){const sx=(Math.sin(i*7.3)*0.5+0.5)*W,sy=(Math.cos(i*5.1)*0.5+0.5)*300,sz=1+(i%3),sa=0.3+(i%7)*0.1;g.fillStyle(0xf0eaff,sa);g.fillRect(sx,sy,sz,sz);}
    g.fillStyle(0x111118,1);g.fillRect(0,380,W,220);g.lineStyle(1,0x1a1a22,1);
    for(let x=0;x<=W;x+=48){g.beginPath();g.moveTo(x,380);g.lineTo(x,H);g.strokePath();}
    for(let y=380;y<=H;y+=48){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.strokePath();}
    const dSt=(sx,sy,hs)=>{g.fillStyle(0x2a2a38,1);g.fillRect(sx-20,sy+160,40,10);g.fillStyle(0x1a1a28,1);g.fillRect(sx-4,sy+40,8,120);g.fillStyle(0x2a2a38,1);g.fillRect(sx-30,sy+30,60,10);
      if(hs){g.fillStyle(0xd0d4dc,1);g.fillCircle(sx,sy,22);g.lineStyle(1,0x4a4a5a,0.6);g.strokeCircle(sx,sy,22);g.fillStyle(0x0a0a12,0.7);g.fillRect(sx-16,sy-6,32,12);g.fillStyle(0xd0d4dc,1);g.fillRect(sx-18,sy+24,36,50);g.fillRect(sx-28,sy+28,10,40);g.fillRect(sx+18,sy+28,10,40);g.fillRect(sx-14,sy+74,12,50);g.fillRect(sx+2,sy+74,12,50);}};
    dSt(250,180,true);dSt(480,180,true);dSt(710,180,false);
    g.fillStyle(0xd0d4dc,0.7);g.fillRect(400,440,60,30);g.fillRect(380,445,20,25);g.fillRect(460,445,20,25);g.fillRect(410,470,15,30);g.fillRect(435,470,15,30);g.fillCircle(430,430,16);
    g.fillStyle(0x1a1a28,1);g.fillRect(0,100,60,200);g.fillRect(900,100,60,200);
    g.fillStyle(0xe63946,0.6);g.fillCircle(30,140,3);g.fillStyle(0x4a4a5a,0.6);g.fillCircle(930,140,3);
    g.generateTexture('bg_planetarium',W,H);g.destroy();
  }

  bakeLabyrinth(){
    const W=960,H=600,g=this.mg();
    g.fillStyle(0x1a1a22,1);g.fillRect(0,0,W,H);g.lineStyle(1,0x2a2a35,1);
    for(let x=0;x<=W;x+=48){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.strokePath();}
    for(let x=0;x<=W;x+=144){g.fillStyle(0x1e1e2a,1);g.fillRect(x,0,48,H);}
    const oc=[0x4a4a5a,0x3a3a4a,0x5a5a6a];
    for(let i=0;i<12;i++){const ox=100+(i*73)%760,oy=420+(i*37)%140;g.fillStyle(oc[i%3],0.7);if(i%3===0)g.fillRect(ox,oy,10,10);else if(i%3===1)g.fillCircle(ox+5,oy+5,5);else{g.beginPath();g.moveTo(ox,oy+10);g.lineTo(ox+5,oy);g.lineTo(ox+10,oy+10);g.closePath();g.fillPath();}}
    g.fillStyle(0x1e1820,1);g.fillRect(440,400,80,80);g.lineStyle(1,0xe63946,1);g.strokeRect(440,400,80,80);
    [[250,480],[500,500],[700,460]].forEach(([px,py])=>{g.fillStyle(0x4a4a5a,0.4);g.fillEllipse(px,py,12,18);g.fillEllipse(px+20,py+4,12,18);});
    g.generateTexture('bg_labyrinth',W,H);g.destroy();
  }

  bakeZeroGrav(){
    const W=960,H=600,g=this.mg();
    g.fillStyle(0xd0d4dc,1);g.fillRect(0,0,W,H);g.fillStyle(0xc0c4cc,1);g.fillRect(0,420,W,180);g.lineStyle(1,0xb0b4bc,1);
    for(let x=0;x<=W;x+=60){g.beginPath();g.moveTo(x,420);g.lineTo(x,H);g.strokePath();}
    for(let y=420;y<=H;y+=30){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.strokePath();}
    g.fillStyle(0xb0b4bc,1);g.fillRect(380,60,200,360);g.lineStyle(1,0x909498,1);g.strokeRect(380,60,200,360);
    for(let y=80;y<400;y+=40){g.beginPath();g.moveTo(385,y);g.lineTo(575,y);g.strokePath();}
    g.fillStyle(0x909498,1);g.fillRect(540,100,30,20);g.fillRect(540,140,30,20);g.fillRect(540,180,30,20);
    g.fillStyle(0x0a0a12,0.8);g.fillCircle(480,220,50);g.lineStyle(2,0x909498,1);g.strokeCircle(480,220,50);
    g.fillStyle(0xd0d4dc,0.5);g.fillCircle(480,200,12);g.fillRect(470,214,20,30);
    g.fillStyle(0xf0eaff,1);g.fillRect(380,40,200,10);g.fillStyle(0xf0eaff,0.06);g.fillTriangle(380,50,580,50,480,420);
    g.fillStyle(0xa0a4ac,1);g.fillRect(700,200,80,200);g.lineStyle(1,0x808488,1);g.strokeRect(700,200,80,200);
    for(let i=0;i<6;i++){g.fillStyle(i%2===0?0xe63946:0x4a4a5a,0.8);g.fillRect(710,210+i*28,20,16);}
    g.fillStyle(0x4a4a5a,0.6);g.fillRect(740,210,30,8);g.fillRect(740,260,30,8);
    g.generateTexture('bg_zerograv',W,H);g.destroy();
  }

  bakeVoid(){
    const W=960,H=600,g=this.mg();
    g.fillStyle(0x0a0008,1);g.fillRect(0,0,W,H);g.fillStyle(0x0d0006,1);g.fillRect(0,400,W,200);
    g.lineStyle(1,0x9b1d20,0.3);g.beginPath();g.moveTo(480,400);g.lineTo(380,550);g.strokePath();g.beginPath();g.moveTo(480,400);g.lineTo(580,550);g.strokePath();g.beginPath();g.moveTo(480,400);g.lineTo(480,580);g.strokePath();g.beginPath();g.moveTo(480,400);g.lineTo(430,520);g.strokePath();g.beginPath();g.moveTo(480,400);g.lineTo(530,520);g.strokePath();
    g.fillStyle(0x1a0810,1);g.fillRect(360,60,100,340);g.fillRect(500,60,100,340);
    g.lineStyle(2,0x9b1d20,1);g.strokeRect(360,60,100,340);g.strokeRect(500,60,100,340);
    g.lineStyle(1,0x9b1d20,0.5);g.strokeRect(370,70,80,320);g.strokeRect(510,70,80,320);
    g.beginPath();g.moveTo(380,230);g.lineTo(440,230);g.strokePath();g.beginPath();g.moveTo(520,230);g.lineTo(580,230);g.strokePath();
    g.lineStyle(2,0xe63946,0.6);g.beginPath();g.moveTo(460,60);g.lineTo(460,400);g.strokePath();g.beginPath();g.moveTo(500,60);g.lineTo(500,400);g.strokePath();
    g.lineStyle(3,0x8b7355,0.7);g.beginPath();g.moveTo(300,490);g.lineTo(350,470);g.lineTo(400,490);g.strokePath();
    g.fillStyle(0x9b1d20,0.15);g.beginPath();g.moveTo(0,0);g.lineTo(120,0);g.lineTo(0,180);g.closePath();g.fillPath();g.beginPath();g.moveTo(W,0);g.lineTo(W-120,0);g.lineTo(W,180);g.closePath();g.fillPath();g.beginPath();g.moveTo(0,H);g.lineTo(100,H);g.lineTo(0,H-100);g.closePath();g.fillPath();
    g.fillStyle(0x0f0006,0.6);g.fillRect(0,60,360,340);g.fillRect(600,60,360,340);
    g.generateTexture('bg_void',W,H);g.destroy();
  }

  bakeTVStation(){
    const W=960,H=600,g=this.mg();
    g.fillStyle(0x131318,1);g.fillRect(0,0,W,H);g.fillStyle(0x101016,1);g.fillRect(0,400,W,200);g.lineStyle(1,0x1a1a22,1);
    for(let x=0;x<=W;x+=60){g.beginPath();g.moveTo(x,400);g.lineTo(x,H);g.strokePath();}
    g.lineStyle(2,0x2a2a38,1);g.beginPath();g.moveTo(350,400);g.lineTo(370,280);g.strokePath();g.beginPath();g.moveTo(390,400);g.lineTo(370,280);g.strokePath();g.beginPath();g.moveTo(410,400);g.lineTo(370,280);g.strokePath();
    g.fillStyle(0x2a2a38,1);g.fillRect(345,260,50,30);g.fillStyle(0x0a0a12,1);g.fillCircle(370,275,12);g.lineStyle(1,0x4a4a5a,1);g.strokeCircle(370,275,12);
    g.fillStyle(0x1e1e28,1);g.fillRect(500,340,250,60);g.lineStyle(1,0x2a2a38,1);g.strokeRect(500,340,250,60);
    g.fillStyle(0x1a1a22,1);g.fillRect(560,260,100,80);g.lineStyle(1,0x4a4a5a,1);g.strokeRect(560,260,100,80);
    g.fillStyle(0x0a0a12,1);g.fillRect(566,266,88,60);for(let i=0;i<30;i++){const sx=568+(i*3)%84,sy=268+(i*7)%56;g.fillStyle(0xf0eaff,0.1+(i%5)*0.05);g.fillRect(sx,sy,2,2);}
    g.fillStyle(0x1a1a22,1);g.fillRect(600,340,20,10);g.fillStyle(0x4a4a5a,1);g.fillRect(720,355,20,8);g.lineStyle(1,0x2a2a38,1);g.strokeRect(720,355,20,8);g.fillStyle(0x8a8a9a,1);g.fillRect(738,357,4,4);
    g.fillStyle(0xf0eaff,0.8);g.fillRect(300,10,360,6);for(let i=0;i<4;i++){const cx=340+i*90;g.fillStyle(0xf0eaff,0.04);g.fillTriangle(cx-20,16,cx+20,16,cx,120);}
    g.lineStyle(1,0x1a1a22,1);for(let x=50;x<=900;x+=120){g.beginPath();g.moveTo(x,40);g.lineTo(x,400);g.strokePath();}
    [150,750].forEach(wx=>{g.fillStyle(0x0a0a12,1);g.fillRect(wx,120,80,60);g.lineStyle(1,0x4a4a5a,1);g.strokeRect(wx,120,80,60);for(let i=0;i<10;i++){g.fillStyle(0xf0eaff,0.08+(i%3)*0.04);g.fillRect(wx+4+(i*7)%72,124+(i*5)%52,2,2);}});
    g.generateTexture('bg_tvstation',W,H);g.destroy();
  }
}
