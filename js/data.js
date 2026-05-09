// All game data constants
import { P, S } from './dialogue.js';

export const LOCATION_NAMES={
  basement:'THE BASEMENT',planetarium:'PLANETARIUM LOUNGE',
  labyrinth:'MIRROR LABYRINTH',zerograv:'ZERO GRAVITY CHAMBER',
  void:'VOID OF JUDGEMENT',tvstation:'TV STATION'
};
export const LOCATION_KEYS=['basement','planetarium','labyrinth','zerograv','void','tvstation'];

export const EVIDENCE_META={
  'ROPES':{type:'PHYSICAL',room:'Basement'},
  'KNOCKOUT GAS BOTTLE #1':{type:'PHYSICAL',room:'Basement'},
  'KNOCKOUT GAS BOTTLE #2':{type:'PHYSICAL',room:'Locker Rooms'},
  'KNOCKOUT GAS BOTTLE #3':{type:'PHYSICAL',room:"Gatekeeper's Room"},
  'KNOCKOUT GAS INFO':{type:'DOCUMENT',room:'Mall'},
  'WET SPACE SUIT':{type:'PHYSICAL',room:'Planetarium Lounge'},
  'WORK NOTICE':{type:'DOCUMENT',room:'Planetarium Lounge'},
  "STABBING VICTIM'S BODY":{type:'PHYSICAL',room:'Planetarium Lounge'},
  'OBJECT TRAIL':{type:'PHYSICAL',room:'Mirror Labyrinth'},
  'ONE-WAY PANEL':{type:'PHYSICAL',room:'Mirror Labyrinth'},
  'LOWER MAZE':{type:'PHYSICAL',room:'Mirror Labyrinth'},
  'SAW DRILL':{type:'PHYSICAL',room:'Mirror Labyrinth'},
  'FRAMING PHONE':{type:'PHYSICAL',room:'Mirror Labyrinth'},
  "STRANGULATION VICTIM'S BODY":{type:'PHYSICAL',room:'Zero Gravity Chamber'},
  'THE GATE':{type:'PHYSICAL',room:'Void of Judgement'},
  'BINDING ROPES':{type:'PHYSICAL',room:'Void of Judgement'},
  'RIGGED SAW':{type:'PHYSICAL',room:'Void of Judgement'},
  'VOID PANEL':{type:'PHYSICAL',room:'Void of Judgement'},
  'BROADCAST RECORDING':{type:'DOCUMENT',room:'TV Station'},
  'FLASH DRIVE':{type:'PHYSICAL',room:'TV Station'},
  'ANONYMOUS LETTER':{type:'DOCUMENT',room:'TV Station'},
  "THE COURIER'S ACCOUNT":{type:'TESTIMONY',room:'Mirror Labyrinth'},
  "THE DRIFTER'S ACCOUNT":{type:'TESTIMONY',room:'Mirror Labyrinth'},
  "THE OPERATOR'S ACCOUNT":{type:'TESTIMONY',room:'Basement'},
  "THE OBSERVER'S ACCOUNT":{type:'TESTIMONY',room:'Various'}
};

export const SUSPECTS=[
  {id:'scheduler',name:'THE SCHEDULER',portrait:'portrait_scheduler',desc:'Organized. Present all night. Has a very specific skill set.'},
  {id:'operator',name:'THE OPERATOR',portrait:'portrait_operator',desc:'Was held captive. Helped regardless. Knows more than they say.'},
  {id:'observer',name:'THE OBSERVER',portrait:'portrait_observer',desc:'Knew where the Operator was. Stayed quiet about the rest.'},
  {id:'courier',name:'THE COURIER',portrait:'portrait_courier',desc:'Was in the labyrinth. Witnessed the stabbing. Panicked.'},
  {id:'drifter',name:'THE DRIFTER',portrait:'portrait_drifter',desc:'Trapped in the lower maze. Or conveniently placed there.'}
];

export const HOTSPOTS={
  basement:[
    {id:'ropes',label:'THE ROPES',x:300,y:480,collect:'ROPES',lines:[P('Ropes. Cut clean. Whoever was tied here was untied. Not freed. There is a difference.')]},
    {id:'bottle',label:'THE KNOCKOUT BOTTLE',x:500,y:510,collect:'KNOCKOUT GAS BOTTLE #1',lines:[P('Knockout gas. Already used. These come in packs of three. Only three. One bottle here. Two unaccounted for.')]},
    {id:'chair',label:'THE CHAIR',x:650,y:420,lines:[P('Something sat here for a while. The chair faces the room, not the door. Whoever was here could see everything coming and could not stop it.')]},
    {id:'light',label:'THE OVERHEAD LIGHT',x:480,y:180,lines:[P('This room was not meant to hold a person. Someone improvised. They had exactly what they needed though.')]}
  ],
  planetarium:[
    {id:'wetsuit',label:'THE WET SUIT',x:320,y:400,collect:'WET SPACE SUIT',lines:[P('This suit is wet on the outside. Not sweat. Not rain. Something else. It was used recently and put back on display.')]},
    {id:'missing',label:'THE MISSING SUIT STAND',x:580,y:360,lines:[P('One stand. No suit. A suit is missing from display. It did not walk away on its own.')]},
    {id:'notice',label:'THE WORK NOTICE',x:750,y:300,collect:'WORK NOTICE',lines:[P('Most staff out today for Halloween preparations. That means fewer eyes on the building. Convenient timing.')]},
    {id:'body',label:'THE BODY',x:300,y:470,collect:"STABBING VICTIM'S BODY",lines:[P('Multiple stab wounds. Back and front. Whoever did this was not in a hurry to stop. He was put into a suit after the fact. There is a lot of blood under the suit.')],contradiction:{requires:['WET SPACE SUIT'],id:1}}
  ],
  labyrinth:[
    {id:'objects',label:'THE OBJECTS ON FLOOR',x:250,y:480,collect:'OBJECT TRAIL',lines:[P('Random objects. Placed deliberately. A trail. Leading somewhere specific. Someone used these as a guide.')]},
    {id:'panel',label:'THE ONE-WAY PANEL',x:480,y:430,collect:'ONE-WAY PANEL',lines:[P('This panel is different from the others. Reflective from above. See-through from below. And there is a hole drilled through it. Knife-sized.')],contradiction:{requires:['OBJECT TRAIL'],id:2}},
    {id:'lower',label:'THE LOWER MAZE ENTRANCE',x:480,y:520,collect:'LOWER MAZE',lines:[P('A whole other maze beneath this one. The panel was covering it. The Drifter is down there. Pushed. No way back up.')]},
    {id:'prints',label:'THE BLOODY SHOE PRINTS',x:650,y:460,lines:[P('Multiple sets of shoe prints. All going different directions. This was a busy floor.')]},
    {id:'sawdrill',label:'THE SAW DRILL',x:180,y:400,collect:'SAW DRILL',lines:[P('A drill bit. Battery-powered. Same type used to rig the saw at the void gate. Someone brought this here and used it on the panel.')]},
    {id:'phone',label:'THE FRAMING PHONE',x:700,y:520,collect:'FRAMING PHONE',lines:[P('A phone on the ground. Not belonging to anyone here. New. Fresh number. Full of texts. Left deliberately to be found.')]}
  ],
  zerograv:[
    {id:'chamber_suit',label:'THE SPACE SUIT IN CHAMBER',x:480,y:320,collect:"STRANGULATION VICTIM'S BODY",lines:[P('The chamber is on. There is someone inside that suit. She is not floating. She is arranged to look like it.')]},
    {id:'controls',label:'THE CHAMBER CONTROLS',x:750,y:400,lines:[P('Switched on manually. Someone wanted this to look like a display. It almost worked.')]},
    {id:'secondsuit',label:'THE SECOND SUIT',x:280,y:380,lines:[P('This suit looks like the one from the Planetarium Lounge. Same model. Same size. They came as a set.')]}
  ],
  void:[
    {id:'gate',label:'THE GATE',x:480,y:250,collect:'THE GATE',lines:[P('The gate is open now. It was not open before. Someone planned for it to open at exactly this moment.')]},
    {id:'ground_ropes',label:'ROPES ON GROUND',x:350,y:500,collect:'BINDING ROPES',lines:[P('He was tied here. The ropes are still attached to the panel. He could not move even if he woke up.')]},
    {id:'saw',label:'THE SAW',x:550,y:490,collect:'RIGGED SAW',lines:[P('This fell when the gate opened. It was rigged. A battery-powered saw. No outlet needed.')]},
    {id:'mirror_panel',label:'MIRROR PANEL',x:450,y:460,collect:'VOID PANEL',lines:[P('Same type as the labyrinth. He was tied to it. Brought here from somewhere else.')],contradiction:{requires:['ONE-WAY PANEL'],id:3}}
  ],
  tvstation:[
    {id:'monitor',label:'THE BROADCAST MONITOR',x:400,y:320,collect:'BROADCAST RECORDING',lines:[P('The broadcast played from here. Pre-recorded. Made to look live. Whoever made it knew the studio would be empty.')]},
    {id:'flashdrive',label:'THE FLASH DRIVE',x:620,y:400,collect:'FLASH DRIVE',lines:[P('The video was on this. Someone brought it here and plugged it in. They knew exactly what they were doing.')]},
    {id:'letter',label:'THE ANONYMOUS LETTER',x:300,y:450,collect:'ANONYMOUS LETTER',lines:[P('Told the hosts to film in the plaza. So the studio would be free. No name. Of course.')],contradiction:{requires:['BROADCAST RECORDING'],id:4}}
  ]
};

export const NPCS={
  basement:[
    {id:'operator',name:'THE OPERATOR',portrait:'portrait_operator',x:480,y:455,color:0x2a2035,
      lines:[S('THE OPERATOR','portrait_operator','I did not agree to help. I was found and used.'),S('THE OPERATOR','portrait_operator','They asked me about the maze. The void gate. I said what I knew.'),S('THE OPERATOR','portrait_operator','I did not know what they were planning to do with that information.')],
      conditional:{has:'BINDING ROPES',line:P('The ropes in the basement were cut clean. Someone helped you out.')},collect:"THE OPERATOR'S ACCOUNT"}
  ],
  planetarium:[
    {id:'observer',name:'THE OBSERVER',portrait:'portrait_observer',x:600,y:450,color:0xd4621a,
      lines:[S('THE OBSERVER','portrait_observer','I told them where the Operator was. That is all I did.'),S('THE OBSERVER','portrait_observer','I did not agree with what was being planned.'),S('THE OBSERVER','portrait_observer','I did not stop it either. That is the part I cannot justify.')],
      conditional:{has:'BROADCAST RECORDING',line:P('You knew what was coming and said nothing. That is not neutrality. That is a choice.')},collect:"THE OBSERVER'S ACCOUNT"}
  ],
  labyrinth:[
    {id:'courier',name:'THE COURIER',portrait:'portrait_courier',x:380,y:455,color:0x2d4a2d,
      lines:[S('THE COURIER','portrait_courier','We were invited. There was supposed to be a Halloween trick to see.'),S('THE COURIER','portrait_courier','The objects on the floor \u2014 we just followed them. Like we were told to.'),S('THE COURIER','portrait_courier','He crouched on a panel. I was looking around. I was not paying attention.'),S('THE COURIER','portrait_courier','When I turned back he was bleeding. There was nothing sharp in there. Nothing visible.')],
      collect:"THE COURIER'S ACCOUNT"},
    {id:'drifter',name:'THE DRIFTER',portrait:'portrait_drifter',x:620,y:455,color:0x2a2035,
      requires:'LOWER MAZE',
      lines:[S('THE DRIFTER','portrait_drifter','I got a text. Midnight. Go to the labyrinth.'),S('THE DRIFTER','portrait_drifter','I followed the objects on the ground. Then I was falling.'),S('THE DRIFTER','portrait_drifter','There is a phone down here. A saw drill. Blood on the floor from above.'),S('THE DRIFTER','portrait_drifter','I did not do this. I cannot get out of here on my own.')],
      collect:"THE DRIFTER'S ACCOUNT"}
  ],
  zerograv:[],
  void:[],
  tvstation:[
    {id:'scheduler',name:'THE SCHEDULER',portrait:'portrait_scheduler',x:500,y:455,color:0x1a0a0a,
      lines:[S('THE SCHEDULER','portrait_scheduler','I was here all night. Halloween preparations. Nothing unusual.'),S('THE SCHEDULER','portrait_scheduler','I did not go near the labyrinth. Or the void. I had things to do here.'),S('THE SCHEDULER','portrait_scheduler','The broadcast? I saw it same as everyone. Unsettling stuff.')],
      conditional:{has:['FLASH DRIVE','ANONYMOUS LETTER'],line:P('The drive was in the studio. The letter cleared the studio. You were in the studio. All night.')}}
  ]
};

export const CONTRADICTIONS=[
  {id:1,requires:['WET SPACE SUIT',"STABBING VICTIM'S BODY"],text:'A suit wet on the outside \u2014 used, then returned to display. The victim was placed inside a suit after death. Two suits used. One stand empty. This was prepared in advance.'},
  {id:2,requires:['OBJECT TRAIL','ONE-WAY PANEL'],text:'The objects led someone to a specific panel on purpose. That panel had a knife-hole drilled through it. This was not a trap. This was a guided assassination.'},
  {id:3,requires:['ONE-WAY PANEL','VOID PANEL'],text:'Same panel type. Two separate locations. One for the stabbing. One for the rigged saw. The same person built both setups.'},
  {id:4,requires:['BROADCAST RECORDING','ANONYMOUS LETTER'],text:'The letter cleared the studio before the broadcast. The broadcast played from that same empty studio. The letter writer and the broadcaster are the same person.'},
  {id:5,requires:['KNOCKOUT GAS BOTTLE #1','KNOCKOUT GAS INFO'],text:'Sold only in packs of three. Always exactly three. One in the basement. One in the locker rooms. One elsewhere. Three victims incapacitated. Three bottles. One buyer.'},
  {id:6,requires:['FRAMING PHONE'],text:'This phone belongs to no one in the group. It is new. Fresh number. But full of texts. It was left deliberately \u2014 to be found.'}
];

export const HINTS={
  basement:['Ropes do not cut themselves.','Three bottles. Sold only in threes.','This room held something important.'],
  planetarium:['A wet suit returned to its stand. Someone knew this room well.','Two suits. One missing stand.','The notice tells you who was meant to be absent.'],
  labyrinth:['The objects are not clutter. They are a path.','One panel is not like the others.','The Drifter did not choose to fall.'],
  zerograv:['The chamber was switched on after the fact.','Both suits came from the same source.','She could not have arranged herself.'],
  void:['The saw did not fall by chance.','The gate opening was the mechanism.','He was brought here.'],
  tvstation:['The letter emptied the room before anyone arrived.','Pre-recorded means the opposite of unplanned.','The drive was left. Someone forgot \u2014 or wanted it found.']
};

export const TRIAL_STATEMENTS=[
  {id:1,speaker:'THE OPERATOR',text:'I was held in the basement. I never saw their face.',correctEvidence:'KNOCKOUT GAS BOTTLE #1'},
  {id:2,speaker:'THE COURIER',text:'There was nothing sharp in the labyrinth.',correctEvidence:'ONE-WAY PANEL'},
  {id:3,speaker:'THE OBSERVER',text:'I only told them where the Operator was.',correctEvidence:'ANONYMOUS LETTER'},
  {id:4,speaker:'THE DRIFTER',text:"I was pushed. I don't know who did it.",correctEvidence:'FRAMING PHONE'},
  {id:5,speaker:'THE SCHEDULER',text:'I was preparing for Halloween all night.',correctEvidence:'BROADCAST RECORDING'}
];
