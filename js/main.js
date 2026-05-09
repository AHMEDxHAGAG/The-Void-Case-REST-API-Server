// Entry point — wires all scenes into Phaser and starts the game
import { BootScene } from './BootScene.js';
import { IntroScene } from './IntroScene.js';
import { GameScene } from './GameScene.js';
import { TrialScene } from './TrialScene.js';
import { AccusationScene } from './AccusationScene.js';
import { EndingScene } from './EndingScene.js';

const config={
  type:Phaser.AUTO,width:960,height:600,backgroundColor:'#111118',parent:'game-container',
  scene:[BootScene,IntroScene,GameScene,TrialScene,AccusationScene,EndingScene],
  dom:{createContainer:true},
  scale:{mode:Phaser.Scale.NONE,autoCenter:Phaser.Scale.CENTER_BOTH}
};

new Phaser.Game(config);
