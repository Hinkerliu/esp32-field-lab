import { lessons } from './lessons.js';

const indicator={led:{a:'bb:e9',b:'bb:e10'},resistor:{a:'bb:c6',b:'bb:c9',ohms:330}};
const labels={led:'LED',resistor:'330 Ω 电阻',button:'按键',potentiometer:'电位器'};
export const BUILD_PROJECTS=[
  {id:'blink',title:'搭建一个闪烁的 LED',shortTitle:'闪烁',
    goal:'搭建一条从 GPIO23 经过电阻和 LED 到 GND 的完整通路。',
    parts:['led','resistor'],labels,placements:structuredClone(indicator),
    control:{type:'interval',label:'闪烁间隔',min:100,max:1500,step:50,value:500},
    code:lessons.find(l=>l.id==='blink').code},
  {id:'button',title:'搭建一个按键控制的 LED',shortTitle:'按键 + LED',
    goal:'把一个按键从 GPIO18 连接到 GND，然后在 GPIO23 上搭建 LED 输出电路。',
    parts:['led','resistor','button'],labels,
    placements:{...structuredClone(indicator),button:{a:'bb:d16',b:'bb:d18',c:'bb:f16',d:'bb:f18'}},
    control:{type:'button',label:'按住按键',value:false},
    code:lessons.find(l=>l.id==='button').code},
  {id:'potentiometer',title:'搭建一个亮度控制器',shortTitle:'旋钮 + LED',
    goal:'用 3V3 和 GND 为电位器供电。把它的滑动端连接到 GPIO34，把 LED 输出连接到 GPIO23。',
    parts:['led','resistor','potentiometer'],labels,
    placements:{...structuredClone(indicator),potentiometer:{a:'bb:h18',w:'bb:h19',b:'bb:h20'}},
    control:{type:'range',label:'旋钮位置',min:0,max:100,step:1,value:50},
    code:lessons.find(l=>l.id==='potentiometer').code},
];
for (const project of BUILD_PROJECTS) {
  const index=lessons.findIndex(lesson=>lesson.id===project.id);
  project.lessonTitle=lessons[index].title;
  project.lessonNumber=String(index+1).padStart(2,'0');
}
export function getBuildProject(id){return BUILD_PROJECTS.find(p=>p.id===id)||BUILD_PROJECTS[0];}
export function buildSketch(state){
  const project=getBuildProject(state?.project);
  return project.id==='blink'?project.code.replace(/(const int INTERVAL_MS = )\d+(;)/,`$1${state?.interval??500}$2`):project.code;
}
