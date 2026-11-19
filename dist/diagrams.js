// 这里是电气连接，而非面包板插孔映射。所有标记均在此编写。
// 数值和 GPIO 与 lessons.js 中最初的 ESP32-WROOM-32 课程一致。
let diagramSequence = 0;
const escapeText = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function drawing(title, description, content, caption = '', height = 400) {
  const id = `circuit-${++diagramSequence}`;
  const body = content.replaceAll('ARROW_ID', `${id}-arrow`);
  return `<figure class="circuit-diagram" style="margin:0;min-width:0">
    <div class="circuit-scroll" tabindex="0" role="group" aria-label="${escapeText(title)}. 水平滚动可查看所有连接。"><svg class="circuit-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 ${height}" role="img" aria-labelledby="${id}-title ${id}-desc" style="display:block;width:100%;height:auto;overflow:visible;color:#264864;fill:none;stroke:#264864;stroke-width:2;stroke-linecap:round;stroke-linejoin:round">
      <title id="${id}-title">${escapeText(title)}</title><desc id="${id}-desc">${escapeText(description)}</desc>
      <defs><marker id="${id}-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0 0 7 3.5 0 7" fill="none" stroke="#c8754e" stroke-width="1.5"/></marker></defs>
      ${body}
    </svg></div>
    <span class="diagram-scroll-hint" aria-hidden="true">横向滚动以查看完整电路 →</span>
    ${caption ? `<figcaption style="font:13px/1.6 'DM Sans',sans-serif;color:#607888;margin-top:8px">${escapeText(caption)}</figcaption>` : ''}
  </figure>`;
}

const line = (x1, y1, x2, y2, options = '') => `<path d="M${x1} ${y1}L${x2} ${y2}" ${options}/>`;
const path = (d, options = '') => `<path d="${d}" ${options}/>`;
const text = (x, y, value, size = 17, anchor = 'middle', color = '#264864') => `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" stroke="none" style="font:${size}px 'JetBrains Mono',monospace">${escapeText(value)}</text>`;
const note = (x, y, value, anchor = 'middle') => text(x, y, value, 15, anchor, '#697f8e');
const node = (x, y, accent = false) => `<circle cx="${x}" cy="${y}" r="4" fill="${accent ? '#c8754e' : '#264864'}" stroke="none"/>`;
const terminal = (x, y) => `<circle cx="${x}" cy="${y}" r="4" fill="#f8f5eb"/>`;
const ground = (x, y) => path(`M${x} ${y}v12m-17 0h34m-11 7h-12m3 7h6`) + text(x, y + 51, 'GND', 16);
const resistor = (x, y, angle = 0, length = 48) => `<g transform="translate(${x} ${y}) rotate(${angle})"><path d="M-${length / 2 + 15} 0h15m${length} 0h15"/><rect x="-${length / 2}" y="-10" width="${length}" height="20" fill="#f8f5eb"/></g>`;
const diode = (x, y, angle = 0, emitting = false) => `<g transform="translate(${x} ${y}) rotate(${angle})"><path d="M-35 0h21m28 0h21M-14-13 14 0-14 13ZM14-15v30"/>${emitting ? '<path d="M-4-23 10-37M10-19 24-33" stroke="#c8754e" marker-end="url(#ARROW_ID)"/>' : ''}</g>`;
const switchSymbol = (x, y, angle = 0) => `<g transform="translate(${x} ${y}) rotate(${angle})"><path d="M-35 0h15m40 0h15M-20 0 15-20"/><circle cx="-20" r="3" fill="#f8f5eb"/><circle cx="20" r="3" fill="#f8f5eb"/></g>`;
const block = (x, y, w, h, label = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f8f5eb"/>${label ? text(x + w / 2, y + h / 2 + 6, label) : ''}`;
const pin = (x, y, label, width = 136) => block(x, y - 22, width, 44, label);

function ledOutput(x = 580, top = 90) {
  return text(x, top - 20, 'GPIO23') + terminal(x, top) + line(x, top, x, top + 21)
    + resistor(x, top + 60, 90) + text(x + 43, top + 65, '330 Ω', 15, 'start')
    + line(x, top + 99, x, top + 115) + diode(x, top + 150, 90, true)
    + text(x + 42, top + 155, 'LED', 16, 'start') + line(x, top + 185, x, top + 220)
    + ground(x, top + 220);
}

function blink(wifi = false) {
  const c = pin(38, 170, 'GPIO23', 122) + line(160, 170, 246, 170)
    + resistor(285, 170) + text(285, 137, '330 Ω') + line(324, 170, 405, 170)
    + diode(440, 170, 0, true) + text(440, 115, 'LED')
    + note(399, 213, '+') + note(479, 213, '−')
    + path('M475 170H600V250') + ground(600, 250)
    + note(100, 220, '3.3 V 输出') + note(440, 253, '阳极 → 阴极');
  return drawing(wifi ? 'Wi-Fi LED 输出电路' : 'LED 输出电路',
    'GPIO23 通过 330 Ω 电阻连接到 LED 阳极，LED 阴极接地。', c,
    wifi ? 'Wi-Fi 请求会改变 GPIO23。外接 LED 仍需要同样完整且带限流的通路。' : 'GPIO23 → 电阻 → LED 阳极 (+) → 阴极 (−) → GND。');
}

function divider(sensor) {
  const isLight = sensor === 'LDR';
  const c = text(190, 48, '3V3') + line(190, 63, 190, 86) + resistor(190, 125, 90)
    + text(125, 130, sensor, 18, 'end')
    + (isLight ? path('M126 87 153 109M116 101 143 123', 'stroke="#c8754e" marker-end="url(#ARROW_ID)"') : '')
    + line(190, 164, 190, 231) + node(190, 205, true) + line(190, 205, 345, 205, 'stroke="#c8754e"')
    + pin(345, 205, 'GPIO34') + note(413, 249, 'ADC 输入')
    + resistor(190, 270, 90) + text(125, 275, '10 kΩ', 17, 'end')
    + line(190, 309, 190, 330) + ground(190, 330) + ledOutput(580, 90);
  return drawing(`${sensor} 分压电路与 LED`,
    `3V3 通过 ${sensor} 连接到一个公共节点，该节点同时接到 GPIO34 和一个接地的 10 kΩ 电阻。GPIO23 通过 330 Ω 电阻驱动另一路 LED 接地。`, c,
    '橙色圆点是公共节点：传感器、GPIO34 和 10 kΩ 在此汇合。');
}

function potentiometer() {
  const c = text(190, 48, '3V3') + line(190, 63, 190, 115)
    + resistor(190, 200, 90, 140) + text(128, 192, '10 kΩ', 17, 'end') + note(128, 216, '电位器', 'end')
    + line(190, 285, 190, 330) + ground(190, 330)
    + line(345, 200, 203, 200, 'stroke="#c8754e" marker-end="url(#ARROW_ID)"')
    + pin(345, 200, 'GPIO34') + note(277, 181, '滑动端') + note(413, 244, 'ADC 输入')
    + ledOutput(580, 90);
  return drawing('电位器滑动端与 PWM LED',
    '电位器的两个外侧端子分别接 3V3 和地，可移动的中间端子（滑动端）接 GPIO34。GPIO23 通过 330 Ω 电阻驱动 LED 接地。', c,
    '滑动端是中间端子，它在两个外侧端子之间选择一个电压。');
}

function board() {
  const c = block(35, 105, 150, 90, 'USB') + block(270, 105, 170, 90, '稳压器')
    + block(525, 105, 145, 90, 'ESP32')
    + line(185, 150, 270, 150) + text(225, 132, '5 V')
    + line(440, 150, 525, 150, 'stroke="#c8754e"') + node(480, 150, true)
    + line(480, 150, 480, 72, 'stroke="#c8754e"') + text(480, 52, '3V3 引脚')
    + note(355, 225, '5 V → 3.3 V') + note(598, 225, '3.3 V 逻辑')
    + path('M110 195V280H598V195M355 195V280') + node(355, 280) + ground(355, 280)
    + note(225, 268, 'USB 回路') + note(540, 268, '0 V 参考');
  return drawing('ESP32 开发板的电源与地',
    'USB 向稳压器提供 5 V 电压，稳压器向 ESP32 和 3V3 电源引脚提供 3.3 V。USB、稳压器和 ESP32 共用同一个地参考。', c,
    '3V3 是电源引脚，GPIO 是相对于 GND 测量的可编程信号。');
}

function button() {
  const c = `<rect x="45" y="30" width="330" height="181" stroke-dasharray="5 6"/>`
    + note(65, 56, 'ESP32 内部', 'start') + text(220, 82, '3V3')
    + line(220, 92, 220, 101) + resistor(220, 140, 90)
    + note(280, 131, '内部', 'start') + note(280, 154, '上拉', 'start')
    + line(220, 179, 220, 230) + node(220, 200, true) + line(95, 200, 220, 200)
    + text(93, 181, 'GPIO18') + switchSymbol(220, 265, 90)
    + note(275, 270, '按键', 'start') + line(220, 300, 220, 330) + ground(220, 330)
    + ledOutput(540, 90);
  return drawing('带内部上拉的低电平有效按键',
    '启用 INPUT_PULLUP 时，GPIO18 有一个接 3V3 的内部电阻。按下按键会将该输入接地。另一路输出 GPIO23 通过 330 Ω 电阻驱动 LED。', c,
    'INPUT_PULLUP：松开 = 高电平，按下 = 低电平。LED 使用独立的输出。');
}

function distance() {
  const c = block(35, 95, 165, 220) + text(117, 186, 'HC-SR04', 19)
    + text(117, 45, '5 V') + line(117, 60, 117, 95) + note(117, 120, 'VCC')
    + note(185, 150, 'Trig', 'end') + line(200, 145, 500, 145) + pin(500, 145, 'GPIO23')
    + note(185, 225, 'Echo', 'end') + line(200, 220, 246, 220)
    + resistor(285, 220) + text(285, 192, '2.2 kΩ')
    + line(324, 220, 500, 220, 'stroke="#c8754e"') + node(385, 220, true) + pin(500, 220, 'GPIO34')
    + line(385, 220, 385, 251) + resistor(385, 290, 90) + text(430, 295, '3.3 kΩ', 16, 'start')
    + path('M385 329V360H117V315') + node(385, 360) + ground(385, 360)
    + note(117, 296, 'GND') + note(285, 255, '5 V Echo') + note(567, 264, '≈ 3.0 V 最大值');
  return drawing('带 Echo 分压电路的 HC-SR04',
    'HC-SR04 使用 5 V 供电并共地。GPIO23 驱动 Trig，Echo 经过 2.2 kΩ 接到 GPIO34 的公共节点，再经过 3.3 kΩ 接地。5 V 的 Echo 信号在 GPIO34 节点处变为约 3 V。', c,
    '两个电阻构成分压器：5 × 3.3 / (2.2 + 3.3) = 3.0 V。切勿将 Echo 直接接到 GPIO34。', 430);
}

function rgb() {
  const rows = [[100, 25, '红'], [200, 26, '绿'], [300, 27, '蓝']];
  let c = '';
  for (const [y, gpio, color] of rows) {
    c += pin(32, y, `GPIO${gpio}`, 120) + line(152, y, 211, y) + resistor(250, y)
      + text(250, y - 28, '330 Ω') + line(289, y, 385, y) + diode(420, y, 0, true)
      + text(420, y - 47, color) + line(455, y, 590, y) + node(590, y);
  }
  c += line(590, 100, 590, 335) + ground(590, 335) + note(592, 410, '共阴极');
  return drawing('共阴极 RGB LED',
    'GPIO25、GPIO26 和 GPIO27 各自通过一个 330 Ω 电阻连接到红、绿、蓝 LED 阳极，所有阴极接地。', c,
    '三条独立的电流通路需要三个独立的电阻，请检查你所用 RGB LED 的引脚顺序。', 440);
}

function piezo(x, y) {
  return `<circle cx="${x}" cy="${y}" r="30" fill="#f8f5eb"/>`
    + path(`M${x - 30} ${y}h19m22 0h19M${x - 11} ${y - 18}v36m22-36v36`)
    + note(x, y + 58, '无源蜂鸣器');
}

function sound() {
  const c = pin(35, 170, 'GPIO25', 122) + line(157, 170, 236, 170)
    + resistor(275, 170) + text(275, 135, '100 Ω') + line(314, 170, 410, 170)
    + piezo(440, 170) + path('M470 170H605V265') + ground(605, 265)
    + note(394, 203, '+') + note(487, 203, '−') + note(96, 221, '音调输出');
  return drawing('无源蜂鸣器音调输出',
    'GPIO25 通过 100 Ω 连接到小型无源蜂鸣器的正极，负极接地。', c,
    '使用小型无源蜂鸣器，扬声器或大电流蜂鸣器需要合适的驱动电路。');
}

function piano() {
  const pins = [13, 14, 16, 17, 18, 19, 21, 22];
  const notes = ['C4', 'D', 'E', 'F', 'G', 'A', 'B', 'C5'];
  let c = text(350, 34, 'GPIO 输入 · INPUT_PULLUP', 18);
  pins.forEach((gpio, i) => {
    const x = 75 + i * 78;
    c += text(x, 76, gpio) + terminal(x, 91) + line(x, 95, x, 130)
      + switchSymbol(x, 165, 90) + note(x + 12, 125, notes[i], 'start')
      + line(x, 200, x, 235) + node(x, 235);
  });
  c += line(75, 235, 621, 235) + ground(350, 235)
    + pin(35, 355, 'GPIO25', 122) + line(157, 355, 236, 355) + resistor(275, 355)
    + text(275, 325, '100 Ω') + line(314, 355, 410, 355) + piezo(440, 355)
    + path('M470 355H605V370') + ground(605, 370);
  return drawing('八个琴键与一个蜂鸣器',
    '八个独立开关将 GPIO13、14、16、17、18、19、21 和 22 接到公共地，每个输入都使用 INPUT_PULLUP。GPIO25 通过 100 Ω 接到无源蜂鸣器，蜂鸣器另一端接地。', c,
    '每个按键都有独立的输入，只有它们的接地端连在一起。', 445);
}

function motor() {
  const c = text(440, 35, '电机额定电源 +', 17) + line(440, 50, 440, 106)
    + `<circle cx="440" cy="140" r="34" fill="#f8f5eb"/>` + text(440, 147, 'M', 23)
    + note(483, 108, '+') + note(483, 186, '−') + line(440, 174, 440, 245)
    + path('M440 80H580V105M580 175V200H440') + node(440, 80) + node(440, 200)
    + diode(580, 140, -90) + note(580, 226, '续流二极管') + note(580, 247, '色环朝电源正极')
    + block(350, 245, 180, 100) + text(440, 291, 'N-MOSFET') + note(440, 315, '3.3 V 栅极驱动')
    + text(440, 263, 'D', 13) + text(367, 299, 'G', 13) + text(440, 338, 'S', 13)
    + text(66, 275, 'GPIO25') + terminal(66, 295) + line(70, 295, 91, 295)
    + resistor(130, 295) + text(130, 263, '100 Ω', 16) + line(169, 295, 350, 295) + node(250, 295)
    + line(250, 295, 250, 311) + resistor(250, 350, 90) + text(202, 355, '10 kΩ', 16, 'end')
    + path('M250 389V405H600M440 345V405') + node(440, 405) + ground(440, 405)
    + note(600, 388, '电源 −', 'end') + note(250, 440, 'ESP32 GND');
  return drawing('低边 MOSFET 电机驱动',
    '电机正极接外部电源，负极接 N-MOSFET 漏极，源极接公共电源和 ESP32 地。GPIO25 通过 100 Ω 接到栅极，10 kΩ 下拉电阻将栅极接地。续流二极管并联在电机两端，阴极接电源正极，阳极接漏极。', c,
    'MOSFET 承载电机电流，二极管的阴极色环朝向电源正极。', 475);
}

function temperature() {
  const c = block(480, 120, 150, 190) + text(555, 190, 'DHT22', 20)
    + note(555, 145, 'VCC') + note(493, 236, '数据', 'start') + note(555, 292, 'GND')
    + text(250, 49, '3V3') + path('M250 64V116M250 80H555V120') + node(250, 80)
    + resistor(250, 155, 90) + text(303, 160, '10 kΩ', 17, 'start')
    + line(250, 194, 250, 230) + node(250, 230, true)
    + line(85, 230, 480, 230, 'stroke="#c8754e"') + terminal(85, 230) + text(85, 202, 'GPIO27')
    + line(555, 310, 555, 335) + ground(555, 335);
  return drawing('带上拉电阻的 DHT22 数据线',
    'DHT22 使用 3V3 和地，其数据端接 GPIO27 和一个接 3V3 的 10 kΩ 上拉电阻。裸传感器引脚 3 未使用。', c,
    '裸 DHT22 需要数据上拉电阻，有些模组已内置，请检查你的模组。');
}

function servo() {
  const c = block(500, 130, 155, 160) + text(577, 195, 'Servo', 22)
    + note(577, 153, 'V+') + note(515, 230, '信号', 'start') + note(577, 272, 'GND')
    + text(340, 49, '外部稳压 5 V', 17) + path('M340 64V80H577V130')
    + pin(35, 225, 'GPIO18', 120) + line(155, 225, 500, 225, 'stroke="#c8754e"')
    + note(325, 202, '控制脉冲') + note(325, 251, '50 Hz · 1–2 ms')
    + path('M577 290V330H100') + node(340, 330) + ground(340, 330)
    + note(100, 311, 'ESP32 GND') + note(577, 354, '电源 −');
  return drawing('舵机信号与外部电源',
    'GPIO18 提供舵机控制信号，外部稳压 5 V 电源为舵机供电。舵机、外部电源和 ESP32 的地连接在一起。', c,
    '信号线传输控制脉冲，舵机电流来自外部电源。');
}

function stepper() {
  let c = block(280, 105, 170, 230) + text(365, 86, 'ULN2003', 20)
    + block(550, 160, 120, 130) + text(610, 214, '28BYJ-48', 16) + note(610, 244, '5 V 电机')
    + line(450, 225, 550, 225) + note(500, 203, '5 线', 'middle') + note(500, 253, '插座')
    + text(365, 31, '外部 5 V') + line(365, 45, 365, 105) + note(365, 127, '+')
    + path('M365 335V370H80') + ground(365, 370) + note(105, 353, 'ESP32 GND') + note(550, 375, '电源 −')
    + line(365, 370, 590, 370) + node(365, 370);
  [16, 17, 18, 19].forEach((gpio, i) => {
    const y = 155 + i * 45;
    c += text(90, y + 6, `GPIO${gpio}`) + line(153, y, 280, y) + note(298, y + 6, `IN${i + 1}`, 'start');
  });
  return drawing('28BYJ-48 与 ULN2003 驱动器',
    'GPIO16、17、18 和 19 分别连接到 ULN2003 的输入 1、2、3、4。电机插入驱动器的电机插座。外部 5 V 电源为驱动器和电机供电，其地接 ESP32 地。', c,
    '驱动器切换电机线圈，GPIO 接到 IN1–IN4，而不是直接接电机。', 435);
}

function plant() {
  const c = block(35, 100, 150, 140) + text(110, 143, '土壤湿度', 17) + text(110, 166, '传感器', 17)
    + note(172, 201, 'AOUT', 'end') + block(255, 120, 190, 220) + text(350, 158, 'ESP32', 21)
    + block(520, 100, 150, 180) + text(595, 146, 'SSD1306', 18) + text(595, 169, 'OLED', 17)
    + line(185, 195, 255, 195, 'stroke="#c8754e"') + note(267, 201, 'GPIO34', 'start')
    + line(445, 195, 520, 195) + note(433, 201, 'GPIO21', 'end') + note(533, 201, 'SDA', 'start')
    + line(445, 235, 520, 235) + note(433, 241, 'GPIO22', 'end') + note(533, 241, 'SCL', 'start')
    + path('M110 100V55H595V100M350 55V120') + node(350, 55) + text(350, 36, '3V3')
    + path('M110 240V380H595V280M350 340V380') + node(350, 380) + ground(350, 380)
    + note(110, 91, 'VCC') + note(595, 91, 'VCC') + note(110, 263, 'GND') + note(595, 303, 'GND');
  return drawing('湿度传感器与 I²C OLED',
    '湿度传感器和 OLED 都使用 3V3 并共地。传感器的模拟输出接 GPIO34，GPIO21 接 OLED SDA，GPIO22 接 OLED SCL。', c,
    '使用兼容 3.3 V 的模组，两个设备共用电源和地，但使用不同的信号引脚。', 445);
}

/** 返回某节课对应的无障碍、响应式电路图。 */
export function renderCircuitDiagram(lessonId) {
  const circuits = {
    board, blink, button, potentiometer, rgb,
    light: () => divider('LDR'), distance, sound, piano, motor, temperature,
    servo, stepper, plant, force: () => divider('FSR'), wifi: () => blink(true)
  };
  return (circuits[lessonId] || board)();
}

/** 典型免焊面包板内部的导通关系，不是接线位置图。 */
export function renderBreadboardDiagram() {
  let c = text(350, 30, '面包板内部连接', 20)
    + note(75, 66, '电源轨') + note(625, 66, '电源轨')
    + text(350, 85, '中间凹槽', 16) + path('M350 94V120', 'stroke="#697f8e"')
    + `<rect x="332" y="130" width="36" height="180" fill="#e8e8df" stroke="none"/>`;
  // 每侧各一行：每条带是带有五个插孔的单一金属条。
  [168, 228, 288].forEach((y, row) => {
    [175, 390].forEach((start, group) => {
      const emphasized = row === 0;
      c += `<rect x="${start - 14}" y="${y - 15}" width="170" height="30" fill="${emphasized ? '#c8754e18' : '#26486409'}" stroke="${emphasized ? '#c8754e' : '#8299a655'}"/>`
        + line(start, y, start + 140, y, `stroke="${emphasized ? '#c8754e' : '#8299a6'}" stroke-width="4"`);
      for (let i = 0; i < 5; i++) c += `<circle cx="${start + i * 35}" cy="${y}" r="5.5" fill="#f8f5eb" stroke="${emphasized ? '#c8754e' : '#8299a6'}"/>`;
      if (row === 0) c += text(start + 70, 138, group ? 'F  G  H  I  J' : 'A  B  C  D  E', 15);
    });
  });
  // 电源轨是各自独立的竖直导体。此处显式画出断点，说明为什么
  // 不能假定长电源轨在所有面包板型号上都是连续的。
  [60, 100, 600, 640].forEach((x, i) => {
    const positive = i % 2 === 0;
    const color = positive ? '#c8754e' : '#264864';
    c += text(x, 101, positive ? '+' : '−', 22, 'middle', color)
      + path(`M${x} 126V198M${x} 233V305`, `stroke="${color}" stroke-width="3"`);
    [130, 161, 192, 241, 272, 303].forEach(y => {
      c += `<circle cx="${x}" cy="${y}" r="5" fill="#f8f5eb" stroke="${color}"/>`;
    });
  });
  c += note(250, 343, '5 个孔导通') + note(460, 343, '5 个孔导通')
    + note(350, 377, '各行彼此独立，不会跨过中间凹槽导通。')
    + path('M111 215H140V396', 'stroke="#c8754e"') + note(155, 402, '可能的电源轨断点', 'start');
  return drawing('面包板内部连接',
    '每组横向的五个孔是一条连通的金属条，中间凹槽另一侧的五孔组与之独立，相邻行彼此独立。竖直的电源轨与这些金属条独立，彼此也独立，并且中途可能有断点。', c,
    '电源轨不会自动与各行连接，需要连接处请加导线，并用通断测试仪检查电源轨断点。', 425);
}
