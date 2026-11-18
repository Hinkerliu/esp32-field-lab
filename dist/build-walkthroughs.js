import { getBuildProject } from './build-projects.js';
import { allEndpoints, connectionPlan, electricallyConnected, endpointLabel, netOf, parseEndpoint, partTerminals, placement, placementIssue, resolveWireConnection, validateCircuit } from './build-circuit.js';

const name = endpointLabel;
const clone = value => structuredClone(value);
const same = (state, a, b) => electricallyConnected(state, a, b);

// 引导遵循学习者的布局。下面的坐标只是针对缺失元件的建议，
// 并不是正确电路必须满足的要求。
function suggestedPart(state, kind, preferred) {
  const valid = part => {
    if (!part || placementIssue(state, kind, part)) return false;
    const next = clone(state); next.parts[kind] = part;
    const ids = partTerminals(kind, part);
    if (kind === 'button') {
      if (same(next, part.a, part.c)) return false;
    } else if (ids.some((a, i) => ids.slice(i + 1).some(b => same(next, a, b)))) return false;
    // 放置只判断这些引线能否分处不同的通路。
    // 无关的接线错误不应触发对整块电路板的搜索，
    // 也不应被误报为空间不足。连接步骤会处理这类错误。
    return true;
  };
  if (valid(preferred)) return clone(preferred);
  for (const anchor of allEndpoints().filter(id => id.startsWith('bb:'))) {
    for (const angle of [0, 90, 180, 270]) {
      const part = placement(kind, anchor, angle);
      if (valid(part)) return part;
    }
  }
  return null;
}

function stripDescription(a, b) {
  const p = parseEndpoint(a), q = parseEndpoint(b);
  if (netOf(a) !== netOf(b)) return null;
  if (p?.kind === 'hole' && q?.kind === 'hole')
    return `${name(a)} 和 ${name(b)} 共用第 ${p.row} 排内隐藏的金属条（${p.column < 'f' ? 'A–E' : 'F–J'}）。不需要跳线。`;
  if (p?.kind === 'rail') return '两个触点共用这条连续的电源轨。不需要额外的跳线。';
  return '这些触点在电路板内部已经相连。不需要额外的跳线。';
}

// 把中间的跳线触点也包含进来，这样基于电源轨的电路就能按实际路径解释，
// 而不是被想象成一条直接连在两端之间的导线。
function connectionTargets(state, a, b) {
  const edges = new Map();
  const add = (from, to) => {
    const key = netOf(from);
    if (!edges.has(key)) edges.set(key, []);
    edges.get(key).push({ from, to, key: netOf(to) });
  };
  for (const wire of state.wires) { add(wire.from, wire.to); add(wire.to, wire.from); }
  const button = state.parts.button;
  if (button) for (const [from, to] of [[button.a, button.b], [button.c, button.d]]) { add(from, to); add(to, from); }
  const queue = [{ key: netOf(a), path: [a] }], seen = new Set();
  while (queue.length) {
    const entry = queue.shift();
    if (entry.key === netOf(b)) return [...new Set([...entry.path, b])];
    if (seen.has(entry.key)) continue;
    seen.add(entry.key);
    for (const edge of edges.get(entry.key) || []) queue.push({ key: edge.key, path: [...entry.path, edge.from, edge.to] });
  }
  return [a, b];
}

function connectionStep(state, planned, id, title, from, to, why, code) {
  const complete = same(state, from, to);
  const resolved = !complete && planned ? resolveWireConnection(state, from, to) : null;
  const action = resolved?.ok ? { type: 'wire', from: resolved.from, to: resolved.to } : null;
  const sharedPin = (resolved?.redirected || []).filter(item => parseEndpoint(item.requested)?.kind === 'pin')
    .map(item => `${name(item.endpoint)} 已经连接到 ${name(item.requested)}。`).join(' ');
  const targets = complete ? connectionTargets(state, from, to) : action ? [action.from, action.to, from, to] : [from, to];
  const sharedStrip = complete ? stripDescription(from, to) : null;
  return {
    id, type: 'connection', title, complete, action, targets, copper: targets,
    blocked: !complete && !action,
    instruction: complete ? sharedStrip || `${name(from)} 已连接到 ${name(to)}。沿着高亮的触点和跳线查看。`
      : action ? `把 ${name(action.from)} → ${name(action.to)} 连接起来。${sharedPin ? ' ' + sharedPin : ''}点击两个高亮的触点，或使用“执行此步骤”。`
      : '请先完成元件放置，或在添加这根导线前修复高亮的连接。',
    why, code,
  };
}

export function getWalkthrough(state) {
  const project = getBuildProject(state.project), future = clone(state);
  const steps = [
    { id: 'rows', type: 'concept', title: '五个孔，一条连接', complete: true, action: null,
      instruction: '沿着高亮的金属条看：A9、B9、C9、D9 和 E9 在面包板内部已经相连。',
      why: '插在 C9 的引脚和插在 A9 的导线接触的是同一条金属条。请使用不同的孔；一个孔只能插一根引线。',
      targets: ['bb:a9', 'bb:e9'], frame: ['bb:a1', 'bb:j10'], copper: ['bb:a9'] },
    { id: 'gap', type: 'concept', title: '中间凹槽把两侧分开', complete: true, action: null,
      instruction: 'E9 和 F9 隔着凹槽相对，但在面包板内部并未相连。第 10 排也与第 9 排相互独立。',
      why: '元件的两根引线必须接在不同的通路上。如果把 LED 的两根引线都插在 A9–E9，就会把它们连在一起。',
      targets: ['bb:a9', 'bb:e9', 'bb:f9', 'bb:j9', 'bb:a10', 'bb:e10'], frame: ['bb:a1', 'bb:j11'], copper: ['bb:a9', 'bb:f9', 'bb:a10'] },
    { id: 'rails', type: 'concept', title: '彩色线是电源轨', complete: true, action: null,
      instruction: '这条面包板上，每条长的 + 或 − 金属条都是一条独立通路。四条金属条彼此独立，也与编号的排相互独立。',
      why: '印制的 + 和 − 只是标记，并不是电源。只有把它接到 3V3 或 GND 后，电源轨才会变成 3.3 V 或地。这个实验可以直接连接到 ESP32。',
      targets: ['rail:L+:1', 'rail:L+:25', 'rail:L-:1', 'rail:L-:25'], copper: ['rail:L+', 'rail:L-'].map(id => id + ':1') },
  ];
  const descriptions = {
    resistor: { title: '放置限流电阻', why: '330 Ω 电阻限制流过 LED 的电流，保护 GPIO 输出。两根引线必须接在不同的通路上；方向任意。' },
    led: { title: '放置 LED，两根引线分开', why: '标 + 的是阳极（长脚）；标 K − 的是阴极（短脚，平边）。电流必须先经过电阻再经过 LED，或先经过 LED 再经过电阻。' },
    button: { title: '放置四脚按键', why: '两个 A 触点在按键内部始终相连；两个 B 触点是另一组相连的触点。按下会把 A 和 B 接通。在面包板上要让这两组触点彼此分开。' },
    potentiometer: { title: '让旋钮有三个独立的连接', why: 'A 和 B 是电阻轨道的两端。W 是中间那只脚，称为滑动端。转动旋钮会让它沿轨道移动触点。' },
  };
  for (const kind of ['resistor', 'led', ...project.parts.filter(k => !['resistor', 'led'].includes(k))]) {
    const existing = state.parts[kind], part = existing || suggestedPart(future, kind, project.placements[kind]);
    if (part) future.parts[kind] = part;
    const targets = part ? partTerminals(kind, part) : [];
    const separate = !existing || (kind === 'button'
      ? [existing.a, existing.b].every(a => [existing.c, existing.d].every(b => netOf(a) !== netOf(b)))
      : new Set(targets.map(netOf)).size === targets.length);
    steps.push({ id: 'part-' + kind, type: 'part', kind, ...descriptions[kind],
      complete: !!existing && separate, action: existing || !part ? null : { type: 'place', kind, part }, targets, copper: targets,
      instruction: existing && !separate ? kind === 'button'
        ? '即使按键未按下，面包板也会把 A 和 B 两组触点连在一起。选中按键，然后旋转或移动它，让两组触点分别位于不同的金属条上。'
        : `面包板会把 ${kind === 'potentiometer' ? '这三只脚中的一部分' : '两根引线'} 连在一起。选中 ${project.labels[kind]}，然后使用 Rotate（旋转）或拖动，使 ${kind === 'potentiometer' ? '三只脚都位于不同的金属条上' : '它的两根引线位于不同的金属条上'}。`
      : existing ? `${project.labels[kind]} 已放置在 ${targets.map(name).join(' / ')}。沿着它的引线找到对应的金属条。`
        : part ? `把 ${project.labels[kind]} 放置在 ${targets.map(name).join(' / ')}。点击它的虚影，或使用“执行此步骤”。`
        : '这里没有空位放置这个元件。请先移开重叠的元件或导线。' });
  }
  if (Object.values(future.parts).some(p => !p)) return steps;
  const plan = connectionPlan(future), completed = clone(future);
  if (plan) for (const [i, wire] of plan.entries()) {
    let id = 'walkthrough-' + i;
    while (completed.wires.some(w => w.id === id)) id += 'x';
    completed.wires.push({ ...wire, id, color: '#d4ac58' });
  }
  const { resistor: r, led: l, button: b, potentiometer: p } = future.parts;
  const variants = [
    { before: true, input: r.a, output: r.b, edges: [['pin:23', r.a], [r.b, l.a], [l.b, 'pin:GND']] },
    { before: true, input: r.b, output: r.a, edges: [['pin:23', r.b], [r.a, l.a], [l.b, 'pin:GND']] },
    { before: false, input: r.a, output: r.b, edges: [['pin:23', l.a], [l.b, r.a], [r.b, 'pin:GND']] },
    { before: false, input: r.b, output: r.a, edges: [['pin:23', l.a], [l.b, r.b], [r.a, 'pin:GND']] },
  ];
  const route = variants.find(v => v.edges.every(([a, b]) => same(completed, a, b))) || variants[0];
  const allPlaced = project.parts.every(kind => state.parts[kind]);
  const canPlan = allPlaced && plan !== null;
  const connection = (id, title, a, b, why, code) => steps.push(connectionStep(state, canPlan, id, title, a, b, why, code));
  connection('indicator-source', '把 GPIO23 接入 LED 电路', ...route.edges[0],
    route.before ? 'GPIO23 是受控输出。这条连接先接到电阻，因此电流必须经过电阻才能到达 LED。'
      : 'GPIO23 接到 LED 阳极。你的电阻位于 LED 接地的一侧；这同样是一个有效的串联电路。',
    { line: 'const int LED_PIN = 23;', explanation: '示例控制的是标有 23 的引脚。接在其他 GPIO 上的导线不会遵循这段代码。' });
  connection('indicator-junction', route.before ? '把电阻接到 LED 阳极' : '把 LED 阴极接到电阻', ...route.edges[1],
    '串联意味着一条穿过两个元件的连续通路。电阻如果只是摆在一旁而不把两端接入通路，是不起作用的。共用的面包板金属条算作一条连接。');
  connection('indicator-return', '完成到 GND 的通路', ...route.edges[2],
    'GND 是公共的 0 V 参考点和回流路径。当 GPIO23 变为 HIGH 时，电流经过电阻和 LED 流向 GND。没有回流路径，LED 就不会亮。');
  if (b) {
    const input = same(completed, 'pin:18', b.c) ? b.c : b.a;
    const ground = input === b.a ? b.c : b.a;
    connection('button-input', '把一组开关触点接到 GPIO18', 'pin:18', input,
      'GPIO18 读取按键。开关断开时，其内部上拉会让输入保持 HIGH；不需要额外接线到 3V3。',
      { line: 'pinMode(BUTTON_PIN, INPUT_PULLUP);', explanation: 'INPUT_PULLUP 会在 ESP32 内部启用一个到 3.3 V 的弱连接，因此未按下按键时会有确定的 HIGH 读数。' });
    connection('button-ground', '把另一组开关触点接到 GND', ground, 'pin:GND',
      '按下会接通两组触点，把 GPIO18 接到 GND，使输入变为 LOW。如果把两根跳线都接到同一组触点，输入就会一直是 LOW。',
      { line: 'bool pressed = digitalRead(BUTTON_PIN) == LOW;', explanation: '代码把 LOW 视为“按下”，并点亮 LED。' });
  }
  if (p) {
    const high = same(completed, p.a, 'pin:3V3') ? p.a : p.b, low = high === p.a ? p.b : p.a;
    connection('pot-ground', '把旋钮一只外侧脚接到 GND', low, 'pin:GND',
      '这会把电阻轨道的一端设为 0 V。轨道仍位于 GND 和 3.3 V 之间；两只外侧脚绝不能共用同一条面包板金属条。');
    connection('pot-power', '把另一只外侧脚接到 3V3', 'pin:3V3', high,
      '3V3 为轨道的另一端提供稳定的 3.3 V。这里要用 3V3，而不是 VIN：GPIO34 不能承受 5 V。交换两根外侧导线会让旋钮方向反转。');
    connection('pot-wiper', '把中间脚接到 GPIO34', p.w, 'pin:34',
      '滑动端在两只外侧脚之间选取一个电压。GPIO34 测量它，随后代码驱动 GPIO23 上独立的 LED 电路。旋钮并不直接给 LED 供电。',
      { line: 'int raw = analogRead(POT_PIN);', explanation: '示例把 GPIO34 的读数存入 raw。演示把理想的 0–4095 读数映射为 LED 亮度；实际 ADC 读数可能不同。' });
  }
  const check = validateCircuit(state);
  if (!check.ok && check.code !== 'missing_parts') for (const step of steps) if (step.blocked) {
    step.instruction = check.message;
    step.targets = check.targets;
    step.copper = check.targets;
    step.diagnostic = check;
  }
  steps.push({ id: 'run', type: 'run', title: '先检查，再让它运行起来', complete: check.ok, action: null,
    instruction: project.id === 'blink' ? '选择 Check circuit（检查电路），然后 Run（运行）。修改 INTERVAL_MS 可调整 LED 每次变化之间的停顿。'
      : project.id === 'button' ? '选择 Check circuit（检查电路），然后 Run（运行）。按住实体按键或 Hold button（按住按键）控件；松开即可熄灭 LED。'
      : '选择 Check circuit（检查电路），然后 Run（运行）。转动实体旋钮或使用 Dial position（旋钮位置）来改变 LED 亮度。',
    why: '演示会检查这个电路并遵循所提供的示例。它不会编译显示的代码。改动真实接线前请先断开电源。',
    targets: ['pin:23', ...partTerminals('resistor', r), ...partTerminals('led', l), 'pin:GND'], copper: [],
    code: project.id === 'blink' ? { line: 'delay(INTERVAL_MS);', explanation: `每次停顿为 ${state.interval} 毫秒。一次亮灭循环耗时 ${state.interval * 2} 毫秒。滑块会同时更新演示和可下载示例中的这个常量。` }
      : project.id === 'potentiometer' ? { line: 'ledcWrite(LED_PIN, duty);', explanation: 'PWM 让 GPIO23 快速开关。duty 决定每个周期中有多少时间处于高电平：0 为熄灭，255 为全亮。' }
      : { line: 'digitalWrite(LED_PIN, HIGH);', explanation: '按下的分支把 GPIO23 设为 HIGH；松开的分支把它设为 LOW。' } });
  return steps;
}
