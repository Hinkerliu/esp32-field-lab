// 连通性规则，仅适用于随附的教学项目，并非通用求解器。
import { BUILD_PROJECTS, getBuildProject } from './build-projects.js';
export const COLUMNS = 'abcdefghij';
export const ROW_COUNT = 30;
export const MAX_WIRES = 60;
export const WIRE_COLORS = ['#d4ac58', '#3e5350', '#c85848', '#68a19a', '#8a8bb0'];
export const RESISTANCES = [220, 330, 470, 680, 1000];
export const BOARD_PINS = [
  'pin:EN', 'pin:36', 'pin:39', 'pin:34', 'pin:35', 'pin:32', 'pin:33',
  'pin:25', 'pin:26', 'pin:27', 'pin:14', 'pin:12', 'pin:13', 'pin:GND2', 'pin:VIN',
  'pin:23', 'pin:22', 'pin:1', 'pin:3', 'pin:21', 'pin:19', 'pin:18',
  'pin:5', 'pin:17', 'pin:16', 'pin:4', 'pin:2', 'pin:15', 'pin:GND', 'pin:3V3',
];
const pinSet = new Set(BOARD_PINS);
const aliases = {VP:'36', VN:'39', TX0:'1', RX0:'3', TX2:'17', RX2:'16',
  'GND-L':'GND2', 'GND-R':'GND', 'GND_LEFT':'GND2', 'GND_RIGHT':'GND'};
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const diagnostic = (code, title, message, targets = [], extra = {}) =>
  ({ok:false, code, title, message, targets:[...new Set(targets.filter(Boolean))], ...extra});

export function initialState(project='blink') {
  project=getBuildProject(project).id;
  return {version:1, project, parts:Object.fromEntries(getBuildProject(project).parts.map(kind=>[kind,null])), wires:[], interval:500};
}
export function partTerminals(kind,part){
  if(!part)return[];
  return (kind==='button'?['a','b','c','d']:kind==='potentiometer'?['a','w','b']:['a','b']).map(key=>part[key]);
}
const projectOf=state=>getBuildProject(state?.project);

export function parseEndpoint(value) {
  if (typeof value !== 'string' || value.length > 40) return null;
  let match = /^bb:([a-j])([1-9]|[12]\d|30)$/i.exec(value);
  if (match) {
    const column=match[1].toLowerCase(), row=Number(match[2]), id=`bb:${column}${row}`;
    return {id,kind:'hole',column,row,net:`strip:${column<'f'?'L':'R'}:${row}`,label:`${column.toUpperCase()}${row}`};
  }
  match = /^rail:([LR])([+-]):([1-9]|1\d|2[0-5])$/i.exec(value);
  if (match) {
    const side=match[1].toUpperCase(), polarity=match[2], index=Number(match[3]);
    return {id:`rail:${side}${polarity}:${index}`,kind:'rail',side,polarity,index,
      net:`rail:${side}${polarity}`,label:`${side==='L'?'左':'右'} ${polarity} 导轨 · ${index}`};
  }
  match = /^pin:(.+)$/i.exec(value);
  if (match) {
    let pin=match[1].toUpperCase().replace(/^GPIO(?=\d)/,'');
    pin=aliases[pin]||pin;
    const id=`pin:${pin}`;
    if (!pinSet.has(id)) return null;
    return {id,kind:'pin',pin,net:pin==='GND2'?'pin:GND':id,
      label:pin==='GND2'?'GND (左)':pin==='GND'?'GND (右)':/^\d+$/.test(pin)?`GPIO${pin}`:pin};
  }
  return null;
}

export const canonicalEndpoint = id => parseEndpoint(id)?.id ?? null;
export const netOf = id => parseEndpoint(id)?.net ?? null;
export const endpointLabel = id => parseEndpoint(id)?.label ?? '未知触点';
const endpoints = [
  ...BOARD_PINS,
  ...Array.from(COLUMNS, column=>Array.from({length:ROW_COUNT},(_,i)=>`bb:${column}${i+1}`)).flat(),
  ...['L+','L-','R+','R-'].flatMap(rail=>Array.from({length:25},(_,i)=>`rail:${rail}:${i+1}`)),
];
export const allEndpoints = () => [...endpoints];

// 方向 0 指向更大的行号；90 指向更大的列号。
// LED 的 a 是阳极（长引脚）；b 是阴极（短引脚）。
export function placement(kind, anchor, orientation=0, flipped=false) {
  const first=parseEndpoint(anchor);
  if (!['led','resistor','button','potentiometer'].includes(kind) || first?.kind!=='hole' || ![0,90,180,270].includes(orientation)) return null;
  const point=(dr,dc)=>{
    for(let angle=0;angle<orientation;angle+=90)[dr,dc]=[-dc,dr];
    const col=COLUMNS.indexOf(first.column)+dc,row=first.row+dr;
    return col<0||col>9||row<1||row>ROW_COUNT?null:`bb:${COLUMNS[col]}${row}`;
  };
  if(kind==='button'){
    const part={a:point(0,0),b:point(2,0),c:point(0,2),d:point(2,2)};
    return Object.values(part).every(Boolean)?part:null;
  }
  if(kind==='potentiometer'){
    const part={a:point(0,0),w:point(1,0),b:point(2,0)};
    return Object.values(part).every(Boolean)?part:null;
  }
  let a=first.id, b=point(kind==='led'?1:3,0);
  if(!b)return null;
  if (kind==='led' && flipped) [a,b]=[b,a];
  return kind==='resistor'?{a,b,ohms:330}:{a,b};
}

function cleanPart(kind, value) {
  if (!isObject(value)) return null;
  if(kind==='button'||kind==='potentiometer'){
    const keys=kind==='button'?['a','b','c','d']:['a','w','b'];
    const points=keys.map(key=>parseEndpoint(value[key]));
    if(points.some(p=>p?.kind!=='hole'))return null;
    const vector=(p,q)=>[q.row-p.row,COLUMNS.indexOf(q.column)-COLUMNS.indexOf(p.column)];
    const eq=(a,b)=>a[0]===b[0]&&a[1]===b[1];
    if(kind==='potentiometer'){
      const d=vector(points[0],points[1]);
      if(Math.abs(d[0])+Math.abs(d[1])!==1||!eq(d,vector(points[1],points[2])))return null;
    }else{
      const u=vector(points[0],points[1]),v=vector(points[0],points[2]);
      if(Math.abs(u[0])+Math.abs(u[1])!==2||Math.abs(v[0])+Math.abs(v[1])!==2||u[0]*v[0]+u[1]*v[1]!==0||
        (u[0]&&u[1])||(v[0]&&v[1])||!eq(vector(points[0],points[3]),[u[0]+v[0],u[1]+v[1]]))return null;
    }
    return Object.fromEntries(keys.map((key,i)=>[key,points[i].id]));
  }
  const a=parseEndpoint(value.a), b=parseEndpoint(value.b), span=kind==='led'?1:3;
  if (a?.kind!=='hole' || b?.kind!=='hole') return null;
  const dr=Math.abs(a.row-b.row), dc=Math.abs(COLUMNS.indexOf(a.column)-COLUMNS.indexOf(b.column));
  if (!((dr===span && dc===0) || (dr===0 && dc===span))) return null;
  if (kind==='resistor') {
    const ohms=value.ohms??330;
    if (!RESISTANCES.includes(ohms)) return null;
    return {a:a.id,b:b.id,ohms};
  }
  return {a:a.id,b:b.id};
}

function occupiedEndpoints(state, omitPart=null) {
  const occupied=new Map();
  for (const kind of projectOf(state).parts) {
    if (kind===omitPart) continue;
    const part=state.parts?.[kind];
    if (!part) continue;
    for (const terminal of partTerminals(kind,part)) {
      const id=canonicalEndpoint(terminal);
      if (id) occupied.set(id,`${projectOf(state).labels[kind].toLowerCase()}`);
    }
  }
  for (const wire of state.wires||[]) for (const key of ['from','to']) {
    const id=canonicalEndpoint(wire?.[key]);
    if (id) occupied.set(id,'一根导线');
  }
  return occupied;
}

export function placementIssue(state, kind, candidate) {
  if (!projectOf(state).parts.includes(kind) || !cleanPart(kind,candidate))
    return diagnostic('invalid_placement','在面包板上选择一个位置',
      kind==='led'?'LED 需要同一行或同一列中相邻的两个孔。':kind==='button'?'按键需要呈 2×2 间距排布的四个角上的孔。':kind==='potentiometer'?'电位器需要三个连续的孔。':'电阻的两个引脚必须在同一行或同一列中相隔三个孔距。');
  const part=cleanPart(kind,candidate), occupied=occupiedEndpoints(state,kind);
  for (const id of partTerminals(kind,part)) if (occupied.has(id))
    return diagnostic('occupied_contact','该触点已被占用',
      `${endpointLabel(id)} 已被 ${occupied.get(id)} 占用。请换一个空闲孔位。`,[id]);
  return null;
}

export function wireIssue(state, from, to) {
  const a=canonicalEndpoint(from), b=canonicalEndpoint(to);
  if (!a || !b) return diagnostic('invalid_endpoint','选择两个触点','请选择开发板引脚、面包板孔或导轨触点。');
  if (a===b) return diagnostic('same_endpoint','选择另一个触点','一根导线需要两个不同的端点。',[a]);
  if ((state.wires?.length||0)>=MAX_WIRES)
    return diagnostic('wire_limit','移除一根未使用的导线','此装配工作区最多支持 60 根导线。');
  if ((state.wires||[]).some(w=>(canonicalEndpoint(w.from)===a&&canonicalEndpoint(w.to)===b)||(canonicalEndpoint(w.from)===b&&canonicalEndpoint(w.to)===a)))
    return diagnostic('duplicate_wire','这根导线已经连接','请选择另一对触点。',[a,b]);
  const occupied=occupiedEndpoints(state);
  for (const id of [a,b]) if (occupied.has(id))
    return diagnostic('occupied_contact','该触点已被占用',
      `${endpointLabel(id)} 已被 ${occupied.get(id)} 占用。请在同一连通条带内换一个空闲孔位。`,[id]);
  return null;
}

// 点击的元件引脚可能已占用其孔位。可在同一导电网络上提供另一个物理
// 触点；绝不能跨接无源元件或按键的常开侧。
// 保存的电路中每个孔位仍只接一个引脚。
function wireResolutionContext(state) {
  const links=new Map();
  const link=(from,to)=>{
    from=canonicalEndpoint(from);to=canonicalEndpoint(to);
    const a=netOf(from),b=netOf(to);
    if(!links.has(a))links.set(a,[]);if(!links.has(b))links.set(b,[]);
    links.get(a).push({net:b,anchor:to});links.get(b).push({net:a,anchor:from});
  };
  for(const wire of state.wires)link(wire.from,wire.to);
  const button=state.parts.button;
  if(button){link(button.a,button.b);link(button.c,button.d);}
  return {occupied:occupiedEndpoints(state),uf:buildNets(state),links};
}

function resolveInContext(context,requested,exclude=[]) {
  const blocked=new Set((Array.isArray(exclude)?exclude:[]).map(canonicalEndpoint).filter(Boolean));
  const available=id=>!context.occupied.has(id)&&!blocked.has(id);
  if(available(requested))return {ok:true,requested,endpoint:requested,redirected:false};
  const origin=parseEndpoint(requested),target=context.uf.find(requested);
  // 两个 GND 排针在开发板内部相连。当另一个物理排针空闲时，
  // 尽量让所请求的接地连接保留在板面上可见。
  if(origin.kind==='pin'&&(origin.pin==='GND'||origin.pin==='GND2')){
    const other=origin.pin==='GND'?'pin:GND2':'pin:GND';
    if(available(other))return {ok:true,requested,endpoint:other,redirected:true};
  }
  const routes=new Map([[origin.net,{hops:0,anchors:[requested]}]]),queue=[origin.net];
  for(let i=0;i<queue.length;i++){
    const current=routes.get(queue[i]);
    for(const edge of context.links.get(queue[i])||[]){
      const known=routes.get(edge.net),hops=current.hops+1;
      if(!known){routes.set(edge.net,{hops,anchors:[edge.anchor]});queue.push(edge.net);}
      else if(known.hops===hops)known.anchors.push(edge.anchor);
    }
  }
  const distance=(a,b)=>a.kind==='hole'&&b.kind==='hole'?Math.abs(COLUMNS.indexOf(a.column)-COLUMNS.indexOf(b.column)):
    a.kind==='rail'&&b.kind==='rail'?Math.abs(a.index-b.index):0;
  const candidates=endpoints.filter(id=>available(id)&&context.uf.find(id)===target).map(id=>{
    const point=parseEndpoint(id),route=routes.get(point.net);
    // 优先使用点击的条带/导轨，然后是通过跳线或按键内部常连对可达的附近孔位。
    // 其他开发板引脚作为最后的选择。
    const tier=point.kind==='pin'?2:point.net===origin.net?0:1;
    return {id,rank:[tier,route?.hops??Infinity,route?Math.min(...route.anchors.map(anchor=>distance(point,parseEndpoint(anchor)))):Infinity]};
  });
  candidates.sort((a,b)=>a.rank[0]-b.rank[0]||a.rank[1]-b.rank[1]||a.rank[2]-b.rank[2]);
  if(!candidates.length)return diagnostic('no_free_contact','此连接上没有空闲触点',
    `与 ${endpointLabel(requested)} 电气相连的所有触点都已被占用或保留。请释放一个触点或选择其他连接。`,[requested]);
  return {ok:true,requested,endpoint:candidates[0].id,redirected:true};
}

export function resolveWireEndpoint(state,id,{exclude=[]}={}) {
  const requested=canonicalEndpoint(id);
  if(!requested)return diagnostic('invalid_endpoint','选择一个触点','请选择开发板引脚、面包板孔或导轨触点。');
  const bad=validInput(state);if(bad)return bad;
  return resolveInContext(wireResolutionContext(state),requested,exclude);
}

export function resolveWireConnection(state,requestedFrom,requestedTo) {
  const a=canonicalEndpoint(requestedFrom),b=canonicalEndpoint(requestedTo);
  if(!a||!b)return diagnostic('invalid_endpoint','选择两个触点','请选择开发板引脚、面包板孔或导轨触点。');
  const bad=validInput(state);if(bad)return bad;
  const context=wireResolutionContext(state);
  if(context.uf.find(a)===context.uf.find(b))return {alreadyConnected:true,targets:[...new Set([a,b])]};
  const first=resolveInContext(context,a);if(!first.ok)return first;
  const second=resolveInContext(context,b,[first.endpoint]);if(!second.ok)return second;
  const issue=wireIssue(state,first.endpoint,second.endpoint);if(issue)return issue;
  return {ok:true,from:first.endpoint,to:second.endpoint,
    redirected:[first,second].filter(result=>result.redirected).map(({requested,endpoint})=>({requested,endpoint}))};
}

// 预览端点修改时，先将原导线从电路中移除。其
// 另一端保持在完全相同的孔位中；调用方保留导线 ID/颜色。
export function resolveWireMove(state,wireId,end,target) {
  if(!['from','to'].includes(end))return diagnostic('invalid_wire_end','选择导线的一端','移动现有导线的起点或终点。');
  const requested=canonicalEndpoint(target);
  if(!requested)return diagnostic('invalid_endpoint','选择一个触点','请选择开发板引脚、面包板孔或导轨触点。');
  const bad=validInput(state);if(bad)return bad;
  const wire=state.wires.find(w=>w.id===wireId);
  if(!wire)return diagnostic('wire_not_found','选择一根现有导线','这根导线已不在此装配中。');
  const original={from:canonicalEndpoint(wire.from),to:canonicalEndpoint(wire.to)};
  if(requested===original[end])return {ok:true,...original,redirected:[],unchanged:true};
  const lifted={...state,wires:state.wires.filter(w=>w.id!==wireId)},fixed=original[end==='from'?'to':'from'];
  const context=wireResolutionContext(lifted);
  if(context.uf.find(requested)===context.uf.find(fixed))return diagnostic('already_connected','这些触点已经相连',
    '请选择其他连接上的触点。此移动会跨接现有连接增加一根导线。',[fixed,requested]);
  const resolved=resolveInContext(context,requested,[fixed]);if(!resolved.ok)return resolved;
  const actual={...original,[end]:resolved.endpoint},issue=wireIssue(lifted,actual.from,actual.to);if(issue)return issue;
  return {ok:true,...actual,redirected:resolved.redirected?[{requested,endpoint:resolved.endpoint}]:[],
    unchanged:actual.from===original.from&&actual.to===original.to};
}

export function electricallyConnected(state,a,b) {
  a=canonicalEndpoint(a);b=canonicalEndpoint(b);
  if(!a||!b||validInput(state))return false;
  const uf=buildNets(state);return uf.find(a)===uf.find(b);
}

// 恢复存储数据时绝不信任任意对象键、HTML、颜色或 ID。
// 无效的元件/导线会被丢弃；下面的验证从不静默修复其输入。
export function normalizeState(raw) {
  const state=initialState(raw?.project);
  if (!isObject(raw) || raw.version!==1) return state;
  if (typeof raw.interval==='number' && Number.isFinite(raw.interval))
    state.interval=Math.max(100,Math.min(1500,100+Math.round((raw.interval-100)/50)*50));
  for (const kind of projectOf(state).parts) {
    const part=cleanPart(kind,raw.parts?.[kind]);
    if (part && !placementIssue(state,kind,part)) state.parts[kind]=part;
  }
  const usedIds=new Set();
  for (const [index,wire] of (Array.isArray(raw.wires)?raw.wires.slice(0,MAX_WIRES):[]).entries()) {
    if (!isObject(wire) || wireIssue(state,wire.from,wire.to)) continue;
    let id=typeof wire.id==='string'&&/^[\w-]{1,40}$/.test(wire.id)?wire.id:`wire-${index+1}`;
    let suffix=0;
    while (usedIds.has(id)) id=`wire-${index+1}-${++suffix}`;
    usedIds.add(id);
    const color=typeof wire.color==='string'&&/^#[\da-f]{6}$/i.test(wire.color)?wire.color.toLowerCase():WIRE_COLORS[0];
    state.wires.push({id,from:canonicalEndpoint(wire.from),to:canonicalEndpoint(wire.to),color});
  }
  return state;
}

class UnionFind {
  constructor(){this.parents=new Map();}
  find(value){if(!this.parents.has(value))this.parents.set(value,value);let root=value;
    while(this.parents.get(root)!==root)root=this.parents.get(root);
    while(value!==root){const next=this.parents.get(value);this.parents.set(value,root);value=next;}return root;}
  join(a,b){a=this.find(a);b=this.find(b);if(a!==b)this.parents.set(a,b);}
}

function partTargets(part) {return part?[part.a,part.b]:[];}
function validInput(raw) {
  if (!isObject(raw)||raw.version!==1||!isObject(raw.parts)||!Array.isArray(raw.wires)||raw.wires.length>MAX_WIRES)
    return diagnostic('invalid_state','重置此装配','保存的装配不是受支持的格式。');
  if (!Number.isFinite(raw.interval)||raw.interval<100||raw.interval>1500||(raw.interval-100)%50!==0)
    return diagnostic('invalid_interval','选择闪烁间隔','使用 100–1500 ms，步长为 50 ms。');
  if(raw.project!==undefined&&!BUILD_PROJECTS.some(p=>p.id===raw.project))return diagnostic('invalid_project','选择装配项目','不支持此项目。');
  const probe=initialState(raw.project);
  for(const kind of Object.keys(raw.parts))if(!projectOf(raw).parts.includes(kind)&&raw.parts[kind]!==null)
    return diagnostic('unexpected_part','移除多余的元件','此元件不属于所选装配项目。');
  for (const kind of projectOf(raw).parts) {
    if (raw.parts[kind]===null) continue;
    const error=placementIssue(probe,kind,raw.parts[kind]);
    if (error) return error;
    probe.parts[kind]=cleanPart(kind,raw.parts[kind]);
  }
  const ids=new Set();
  for (const wire of raw.wires) {
    if (!isObject(wire)) return diagnostic('invalid_wire','移除无效的导线','一根导线必须有两个有效触点。');
    const error=wireIssue(probe,wire.from,wire.to);
    if (error) return error;
    if (typeof wire.id!=='string'||!/^[\w-]{1,40}$/.test(wire.id)||ids.has(wire.id))
      return diagnostic('invalid_wire_id','重置此装配','此装配包含无效或重复的导线标识符。');
    ids.add(wire.id);probe.wires.push(wire);
  }
  return null;
}

export function validateCircuit(raw) {
  const bad=validInput(raw);if(bad)return bad;
  const {parts,wires}=raw, project=projectOf(raw), uf=buildNets(raw);
  const root=id=>uf.find(canonicalEndpoint(id)), ground=root('pin:GND'), source=root('pin:23');
  const supply=root('pin:3V3'), vin=root('pin:VIN');
  if (source===ground) return diagnostic('short_gpio','GPIO23 与 GND 短路',
    '移除直接连接。电流路径必须经过电阻和 LED。', ['pin:23','pin:GND']);
  if (supply===ground||vin===ground) return diagnostic('short_power','电源与 GND 短路',
    '运行装配前请移除此连接。',[supply===ground?'pin:3V3':'pin:VIN','pin:GND']);
  if (source===supply||source===vin||supply===vin) return diagnostic('short_supplies','保持电源输出相互独立',
    '请勿将 GPIO23、3V3 和 VIN 直接互连。GPIO23 用于驱动此 LED。',
    source===supply?['pin:23','pin:3V3']:source===vin?['pin:23','pin:VIN']:['pin:3V3','pin:VIN']);
  const vinInput=BOARD_PINS.find(id=>(/^pin:\d+$/.test(id)||id==='pin:EN')&&root(id)===vin);
  if (vinInput) return diagnostic('gpio_overvoltage','勿将 VIN 接到 GPIO 引脚',
    'VIN 可能带有来自 USB 的 5 V。ESP32 的 GPIO 和 EN 使用 3.3 V 逻辑电平，不耐 5 V。', ['pin:VIN',vinInput]);
  if (root('pin:EN')===ground) return diagnostic('held_in_reset','EN 使开发板保持复位状态',
    '断开 EN 与 GND 的连接，以便草图运行。', ['pin:EN','pin:GND']);
  if (root('pin:12')===supply) return diagnostic('boot_strap','启动时勿将 GPIO12 接到 3V3',
    '在这块原版 ESP32-WROOM 开发板上，复位时 GPIO12 为高电平会选择错误的 Flash 供电电压，可能导致无法启动。请移除此连接。', ['pin:12','pin:3V3']);
  if (project.parts.some(kind=>!parts[kind])) {
    const missing=project.parts.filter(kind=>!parts[kind]);
    return diagnostic('missing_parts','放置元件',
      `将 ${missing.map(kind=>project.labels[kind]).join('、')} 添加到面包板上。`,[],{missing});
  }
  const led=cleanPart('led',parts.led), resistor=cleanPart('resistor',parts.resistor);
  const la=root(led.a), lk=root(led.b), ra=root(resistor.a), rb=root(resistor.b);
  if (la===lk) return diagnostic('led_shorted','LED 的两个引脚处于同一连接',
    '中心凹槽每一侧的五个孔相互连通。请将 LED 的两个引脚放在不同的条带上。',partTargets(led));
  if (ra===rb) return diagnostic('resistor_bypassed','电阻被旁路',
    '电阻的两个引脚被面包板或导线直接连通。请让两个引脚分别连接，使电流必须流经电阻。',partTargets(resistor));
  const series=(start,end,a=la,k=lk)=>(start===ra&&rb===a&&k===end)||(start===rb&&ra===a&&k===end)||
    (start===a&&k===ra&&rb===end)||(start===a&&k===rb&&ra===end);
  for (const drive of [source,supply,vin]) {
    if ((la===drive&&lk===ground)||(lk===drive&&la===ground))
      return diagnostic('missing_current_limit','LED 存在绕过电阻的路径',
        '移除旁路。从驱动引脚经 LED 到 GND 的每条路径都必须包含电阻。',[...partTargets(led),...partTargets(resistor)]);
  }
  const activeNodes=new Set([la,lk,ra,rb]);
  if (activeNodes.has(root('pin:EN')) && wires.some(w=>[w.from,w.to].some(e=>canonicalEndpoint(e)==='pin:EN')))
    return diagnostic('reset_pin','使用 GPIO23，而非 EN','EN 是复位输入。请将其与 LED 电路断开。',['pin:EN','pin:23']);
  if (series(source,ground)) {
    if (activeNodes.has(supply)||activeNodes.has(vin)) return diagnostic('extra_supply','断开多余的电源',
      '此装配由 GPIO23 驱动。当 GPIO23 为低电平时，3V3 或 VIN 连接仍可能给 LED 供电。',[activeNodes.has(supply)?'pin:3V3':'pin:VIN']);
    const allowed=['pin:23',...(project.id==='button'?['pin:18']:project.id==='potentiometer'?['pin:34']:[])];
    const extraPin=BOARD_PINS.find(id=>/^pin:\d+$/.test(id)&&!allowed.includes(id)&&activeNodes.has(root(id)));
    if (extraPin) return diagnostic('extra_gpio','此装配使用 GPIO23',
      `将 ${endpointLabel(extraPin)} 与 LED 电路断开。此任务仅驱动 GPIO23，不模拟其他 GPIO 状态。`,[extraPin,'pin:23']);
    const input=validateInputProject(raw,root,{ground,source,supply,vin,activeNodes});if(!input.ok)return input;
    return {...input,ok:true,code:'complete',title:project.id==='blink'?'可以闪烁了':'可以尝试了',
      message:project.id==='blink'?'GPIO23、电阻、LED 和 GND 构成完整的串联电路。':project.id==='button'?'按键将 GPIO18 切换到 GND。按下按键即可点亮 LED。':'滑动端连接 GPIO34。旋转旋钮可改变 LED 亮度。',
      targets:['pin:23',resistor.a,resistor.b,led.a,led.b,'pin:GND'],
      interval:raw.interval,period:raw.interval*2,resistance:resistor.ohms};
  }
  if (series(source,ground,lk,la)) return diagnostic('reversed_led','将 LED 翻转过来',
    '长引脚 (+) 必须经过电路朝向 GPIO23，短引脚 (−) 朝向 GND。请翻转 LED。',partTargets(led));
  if (series(supply,ground)||series(supply,ground,lk,la)||series(vin,ground)||series(vin,ground,lk,la))
    return diagnostic('constant_power','使用开关控制引脚',
      '3V3 是恒定电源。草图通过 GPIO23 控制 LED，因此请将 LED 电路连接到 GPIO23，而不是 3V3 或 VIN。', ['pin:23',series(supply,ground)||series(supply,ground,lk,la)?'pin:3V3':'pin:VIN']);
  if (!activeNodes.has(source)) {
    const other=BOARD_PINS.find(id=>!['pin:23','pin:GND','pin:GND2','pin:3V3','pin:VIN','pin:EN'].includes(id)&&activeNodes.has(root(id)));
    if(other)return diagnostic('wrong_gpio','草图使用 GPIO23',
      `${endpointLabel(other)} 已连接到电路，但此草图通过 GPIO23 进行切换。请移动该连接。`,[other,'pin:23']);
    return diagnostic('missing_gpio','将 GPIO23 连接到电路',
      '用一根导线将 GPIO23 连接到与某个元件引脚共用的条带中的空闲孔位。',['pin:23',...partTargets(resistor)]);
  }
  if (!activeNodes.has(ground)) return diagnostic('missing_ground','补全回路',
    '通过与最后一个元件引脚同一条带中的空闲孔位，将电路连接到 GND。',['pin:GND',...partTargets(led)]);
  return diagnostic('open_path','电路中存在断路',
    '沿着 GPIO23 → 电阻 → LED → GND 检查（电阻也可以接在 LED 之后）。面包板凹槽两侧是相互独立的。',
    [...partTargets(resistor),...partTargets(led)]);
}

function buildNets(state){
  const uf=new UnionFind();for(const id of endpoints)uf.join(id,netOf(id));
  for(const wire of state.wires)uf.join(canonicalEndpoint(wire.from),canonicalEndpoint(wire.to));
  const button=state.parts.button;
  if(button){uf.join(canonicalEndpoint(button.a),canonicalEndpoint(button.b));uf.join(canonicalEndpoint(button.c),canonicalEndpoint(button.d));}
  return uf;
}

function validateInputProject(state,root,{ground,source,supply,vin,activeNodes}){
  const project=projectOf(state);if(project.id==='blink')return{ok:true};
  const inputPin=project.id==='button'?'pin:18':'pin:34',input=root(inputPin);
  if(input!==ground&&activeNodes.has(input))return diagnostic('input_output_join','将输入与 LED 输出分开',
    `${endpointLabel(inputPin)} 用于检测输入；GPIO23 驱动 LED。两者必须是独立的信号连接。`,[inputPin,'pin:23']);
  let inputNodes;
  if(project.id==='button'){
    const b=state.parts.button,a=root(b.a),c=root(b.c);inputNodes=new Set([a,c]);
    if(a===c)return diagnostic('button_shorted','按键已被短接',
      'A1 与 A2 永久连通；B1 与 B2 永久连通。在按键被按下之前，请保持两侧相互独立。',partTerminals('button',b));
    if([source,supply,vin].some(n=>inputNodes.has(n)))return diagnostic('button_power','将输入切换到 GND',
      '将按键连接在 GPIO18 与 GND 之间，而不是输出或电源。INPUT_PULLUP 提供松开时的高电平。',[inputPin,...partTerminals('button',b)]);
    if(input===ground)return diagnostic('input_grounded','GPIO18 始终为低电平',
      '移除 GPIO18 到 GND 的直接通路。只有按下按键时才应导通。',[inputPin,'pin:GND']);
    if(!((a===input&&c===ground)||(c===input&&a===ground)))return diagnostic('button_input','连接开关的相对两侧',
      '将其中一对永久连通的引脚接到 GPIO18，另一对接到 GND。任意一对都可以作为输入侧。',[inputPin,'pin:GND',...partTerminals('button',b)]);
  }else{
    const p=state.parts.potentiometer,a=root(p.a),w=root(p.w),b=root(p.b);inputNodes=new Set([a,w,b]);
    if(a===b||a===w||w===b)return diagnostic('pot_shorted','让电位器的每个引脚各占一条连接',
      '两个外侧引脚和滑动端需要三条独立的面包板条带。如果引脚处于同一行，请旋转或移动元件。',partTerminals('potentiometer',p));
    if(a===vin||b===vin||w===vin)return diagnostic('pot_voltage','此输入使用 3V3',
      '用 3V3 和 GND 为两个外侧引脚供电。VIN 可能超过 3.3 V 的输入限制。', ['pin:VIN',...partTerminals('potentiometer',p)]);
    if(w===supply||w===ground||input===supply||input===ground)return diagnostic('wiper_shorted','让滑动端提供可变的信号',
      '请勿将中间引脚或 GPIO34 直接接到 3V3 或 GND。请将中间引脚连接到 GPIO34。',[p.w,inputPin]);
    if(!((a===supply&&b===ground)||(a===ground&&b===supply)))return diagnostic('pot_power','为两个外侧引脚供电',
      '将一个外侧引脚接到 3V3，另一个接到 GND。对调它们会反转旋钮方向。',[p.a,p.b,'pin:3V3','pin:GND']);
    if(w!==input)return diagnostic('wiper_input','将中间引脚连接到 GPIO34',
      '滑动端 (W) 提供变化的电压。GPIO34 读取该电压。',[p.w,inputPin]);
  }
  const extra=BOARD_PINS.find(id=>/^pin:\d+$/.test(id)&&id!==inputPin&&inputNodes.has(root(id)));
  if(extra)return diagnostic('extra_input_gpio','使用本项目的输入引脚',
    `将 ${endpointLabel(extra)} 与输入电路断开。此任务读取 ${endpointLabel(inputPin)}。`,[extra,inputPin]);
  if(inputNodes.has(root('pin:EN')))return diagnostic('reset_pin','让 EN 保持独立','EN 用于复位开发板，不是元件输入。', ['pin:EN']);
  return {ok:true,...(project.id==='potentiometer'?{potReversed:root(state.parts.potentiometer.a)===supply}:{})};
}

export function simulationState(state,{elapsedMs=0,pressed=false,value=50}={}){
  const check=validateCircuit(state),project=projectOf(state);
  value=Number.isFinite(value)?Math.max(0,Math.min(100,value)):50;
  const result={valid:check.ok,ledBrightness:0,inputLevel:null,adc:null,duty:null,pressed:!!pressed,value,status:check.ok?'就绪':check.message};
  if(!check.ok)return result;
  if(project.id==='button')return {...result,ledBrightness:pressed?1:0,inputLevel:pressed?'LOW':'HIGH',status:pressed?'已按下 · GPIO18 低电平':'已松开 · GPIO18 高电平'};
  if(project.id==='potentiometer'){
    const fraction=check.potReversed?1-value/100:value/100,adc=Math.round(fraction*4095),duty=Math.floor(adc*255/4095);
    return {...result,adc,duty,ledBrightness:duty/255,status:`ADC ${adc} / 4095 · PWM ${duty} / 255`};
  }
  const on=Number.isFinite(elapsedMs)&&elapsedMs>=0&&Math.floor(elapsedMs/state.interval)%2===0;
  return {...result,ledBrightness:on?1:0,status:on?'GPIO23 高电平 · LED 亮':'GPIO23 低电平 · LED 灭'};
}
export function ledIsOn(state,elapsedMs){return simulationState(state,{elapsedMs}).ledBrightness>0;}

// 根据实际网络寻找增量解法，而不是单一记忆化的布局。
// 这不会移动元件或删除用户的导线。返回 null 表示必须先修正现有
// 故障/放置问题，才可能给出连线提示。
export function connectionPlan(state){
  if(validInput(state)||projectOf(state).parts.some(kind=>!state.parts[kind]))return null;
  if(validateCircuit(state).ok)return[];
  const {led:l,resistor:r,button:b,potentiometer:p}=state.parts;
  const indicatorPlans=[
    [['pin:23',r.a],[r.b,l.a],[l.b,'pin:GND']],
    [['pin:23',r.b],[r.a,l.a],[l.b,'pin:GND']],
    [['pin:23',l.a],[l.b,r.a],[r.b,'pin:GND']],
    [['pin:23',l.a],[l.b,r.b],[r.a,'pin:GND']],
  ];
  const inputPlans=projectOf(state).id==='button'?[[['pin:18',b.a],[b.c,'pin:GND']],[['pin:18',b.c],[b.a,'pin:GND']]]:
    projectOf(state).id==='potentiometer'?[[['pin:GND',p.a],['pin:34',p.w],['pin:3V3',p.b]],[['pin:3V3',p.a],['pin:34',p.w],['pin:GND',p.b]]]:[[]];
  let best=null;
  for(const indicator of indicatorPlans)for(const input of inputPlans){
    const trial=structuredClone(state),uf=buildNets(trial),planned=[];let failed=false;
    for(const [a,b] of [...indicator,...input]){
      const ar=uf.find(canonicalEndpoint(a)),br=uf.find(canonicalEndpoint(b));if(ar===br)continue;
      const occupied=occupiedEndpoints(trial);
      const choose=net=>endpoints.find(id=>!occupied.has(id)&&uf.find(id)===net);
      const from=choose(ar),to=choose(br);
      if(!from||!to||wireIssue(trial,from,to)){failed=true;break;}
      let id=`hint-${planned.length}`;while(trial.wires.some(w=>w.id===id))id+='x';
      trial.wires.push({id,from,to,color:WIRE_COLORS[0]});planned.push({from,to});uf.join(from,to);
    }
    if(!failed&&validateCircuit(trial).ok&&(!best||planned.length<best.length))best=planned;
  }
  return best;
}

// 针对由 GPIO23 直接驱动的 LED 的有限修复：将一根电源导线的端点
// 移到电阻上，再补全缺失的连接。每个提议的最终电路都会经过检查；
// 对于不受支持的故障，不做任何猜测或自动修改。
export function repairPlan(state){
  if(validateCircuit(state).code!=='missing_current_limit')return null;
  const {led,resistor}=state.parts,uf=buildNets(state),root=id=>uf.find(canonicalEndpoint(id));
  if(root(led.a)!==root('pin:23')||root(led.b)!==root('pin:GND'))return null;
  let best=null;
  for(const wire of state.wires)for(const end of ['to','from']){
    const old=canonicalEndpoint(wire[end]),fixed=canonicalEndpoint(wire[end==='from'?'to':'from']);
    if(parseEndpoint(old).kind==='pin')continue;
    const lifted={...state,wires:state.wires.filter(w=>w.id!==wire.id)},nets=buildNets(lifted),net=id=>nets.find(canonicalEndpoint(id));
    if(net(fixed)!==net('pin:23')||net(old)!==net(led.a)||net(led.a)===net('pin:23'))continue;
    for(const target of [resistor.a,resistor.b]){
      const move=resolveWireMove(state,wire.id,end,target);if(!move.ok||move.unchanged)continue;
      const trial=structuredClone(state),edited=trial.wires.find(w=>w.id===wire.id);
      edited.from=move.from;edited.to=move.to;
      const connections=connectionPlan(trial);if(!connections)continue;
      const actual=move[end],operations=[{kind:'moveWire',wireId:wire.id,end,target:actual,from:move.from,to:move.to,
        title:`将导线端点从 ${endpointLabel(old)} 移到 ${endpointLabel(actual)}`,
        why:`保持 ${endpointLabel(fixed)} 的连接。${endpointLabel(actual)} 将其连接到 ${endpointLabel(target)} 处的电阻引脚。`,
        targets:[...new Set([old,actual,fixed,canonicalEndpoint(target)])]}];
      for(const connection of connections){
        const current=buildNets(trial),isAnode=id=>current.find(id)===current.find(canonicalEndpoint(led.a));
        operations.push({kind:'connect',...connection,
          title:`连接 ${endpointLabel(connection.from)} 与 ${endpointLabel(connection.to)}`,
          why:isAnode(connection.from)||isAnode(connection.to)?'将电阻接到 LED 的长引脚 (+) 上，使 LED 电流流经电阻。':'补全项目电路中的这条连接。',
          targets:[connection.from,connection.to]});
        let id='repair-wire';while(trial.wires.some(w=>w.id===id))id+='x';
        trial.wires.push({id,...connection,color:WIRE_COLORS[0]});
      }
      if(validateCircuit(trial).ok&&(!best||operations.length<best.operations.length))best={
        title:'将电阻接入 LED 路径',
        why:'GPIO23 目前直接连到 LED。请先经过电阻以限制 LED 电流。',operations};
    }
  }
  return best;
}
