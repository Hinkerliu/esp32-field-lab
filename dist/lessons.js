// 本课程针对原版 ESP32-WROOM-32 DevKit V1，30 引脚布局。
// 示例使用 Arduino-ESP32 3.x。浏览器场景演示每节课的行为。
const spec = (label, value) => ({ label, value });
const wire = (from, to, note = '') => ({ from, to, note });
const control = (label, min, max, step, value, unit) => ({ label, min, max, step, value, unit });
const question = (text, options, answer, explanation) => ({ text, options, answer, explanation });

export const lessons = [
  {
    id: 'board', title: '认识你的 ESP32', shortTitle: '开发板', category: '从这里开始', duration: '5 分钟', icon: 'cpu',
    description: '一块小巧却潜力巨大的开发板。探索处理器、天线、供电，以及把你的代码连接到物理世界的各类引脚。',
    objectives: ['识别 DevKit V1 的主要部件。', '理解 3.3 V 逻辑电平与安全的电源连接。', '通过 USB 发送你的第一条消息。'],
    steps: ['在你的电脑上安装 Arduino IDE 2，并用支持数据传输的 Micro-USB 线连接 ESP32。仅能充电的线缆无法上传代码。', '打开 文件 → 首选项（macOS 上为 Arduino IDE → 设置）。在“附加开发板管理器网址”中添加 https://espressif.github.io/arduino-esp32/package_esp32_index.json 并保存。', '打开 工具 → 开发板 → 开发板管理器，搜索 esp32，并安装“esp32 by Espressif Systems”。本课程使用该开发板包的 3.x 版本。', '用开发板选择器选择“DOIT ESP32 DEVKIT V1”。在 工具 → 端口 下，选择插入 ESP32 后出现的端口。', '将本课的示例复制到新建的 Arduino 草图中，点击“上传”（右箭头按钮）。等待上传完成。如果一直停留在“Connecting”，按住 BOOT 直到开始传输，再松开。', '打开 工具 → 串口监视器，将波特率设为 115200。按下开发板上的 EN 按钮重启，即可看到“Hello, ESP32!”以及运行时间信息。'],
    wiring: [wire('USB', '电脑', '提供电源和 USB 转串口通信。'), wire('GND', '电路地', '电路中的所有元件都需要一个共同的参考点。'), wire('3V3', '3.3 V 外设', 'GPIO 引脚不兼容 5 V。')],
    code: `// 开发板：DOIT ESP32 DEVKIT V1
// 核心：Arduino-ESP32 3.x
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("Hello, ESP32!");
  Serial.print("CPU frequency: ");
  Serial.print(ESP.getCpuFreqMHz());
  Serial.println(" MHz");
}

void loop() {
  Serial.print("Uptime: ");
  Serial.print(millis() / 1000);
  Serial.println(" seconds");
  delay(1000);
}`,
    explanation: 'setup() 在启动后运行一次，loop() 则反复运行。USB 转串口芯片把 Serial 消息传送到你的电脑；115200 是通信速率，而不是处理器主频。',
    specs: [spec('模组', 'ESP32-WROOM-32'), spec('处理器', '双核 Xtensa LX6，最高 240 MHz'), spec('逻辑电平', '3.3 V'), spec('典型 Flash', '4 MB；不同开发板有所差异'), spec('无线', '2.4 GHz Wi-Fi + Bluetooth/BLE'), spec('开发板型号', '30 引脚 DevKit V1')],
    control: null,
    challenge: '修改欢迎语，并每隔两秒打印一次运行时间。',
    question: question('ESP32 GPIO 上，多少电压代表 HIGH 输出？', ['3.3 V', '5 V', '12 V'], 0, 'ESP32 GPIO 使用 3.3 V 逻辑电平。向 GPIO 施加 5 V 可能损坏芯片。')
  },
  {
    id: 'blink', title: '你的第一次闪烁', shortTitle: '点亮 LED', category: '输出', duration: '6 分钟', icon: 'bulb',
    description: '让真实世界的输出响应你的代码。GPIO23 上的外接 LED 会亮灭切换，每次变化之间有短暂停顿。',
    objectives: ['用 pinMode() 配置输出引脚。', '用 HIGH 和 LOW 控制 LED。', '理解 LED 为什么需要串联电阻。'],
    steps: ['将 GPIO23 连接到 330 Ω 电阻，再接到 LED 阳极（较长的引脚）。', '将 LED 阴极（较短的引脚，靠近平边一侧）连接到 GND。', '开始演示。调整时间间隔，观察时序的变化。', '将示例上传到实物开发板，尝试不同的延时值。'],
    wiring: [wire('GPIO23', '330 Ω → LED 阳极 (+)', '电阻用于限制电流。'), wire('LED 阴极 (−)', 'GND', '注意 LED 的极性。')],
    code: `const int LED_PIN = 23;
const int INTERVAL_MS = 500;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(INTERVAL_MS);
  digitalWrite(LED_PIN, LOW);
  delay(INTERVAL_MS);
}`,
    explanation: 'const int 声明一个固定不变的整数值：LED_PIN 是引脚编号，INTERVAL_MS 是等待时间。花括号把属于 setup() 或 loop() 的指令分组；分号结束单条指令。setup() 只配置一次引脚，随后 loop() 反复置 HIGH、等待、置 LOW、等待。两次 500 ms 的等待构成一次一秒的循环。HIGH 约为 3.3 V，LOW 约为 0 V。',
    specs: [spec('输出', 'GPIO23'), spec('串联电阻', '330 Ω'), spec('LED', '红色，正向压降约 2 V'), spec('示例周期', '1 秒')],
    control: control('闪烁间隔', 100, 1500, 50, 500, 'ms'),
    challenge: '让 LED 亮 100 ms、灭 900 ms，循环周期仍为一秒。',
    question: question('为什么电阻要与 LED 串联？', ['为了提高 GPIO 电压', '为了限制流过 LED 的电流', '为了存储程序'], 1, 'LED 无法安全地限制自身电流。电阻同时保护 LED 和 GPIO 输出。')
  },
  {
    id: 'button', title: '监听按钮', shortTitle: '按下按钮', category: '输入', duration: '7 分钟', icon: 'button',
    description: '为你的电路添加一个输入。按下按钮点亮 LED，并了解为什么按下时读数会是 LOW。',
    objectives: ['读取数字输入。', '使用内部上拉电阻。', '识别低电平有效的按钮接法。'],
    steps: ['将轻触按钮两侧相对的开关触点分别接到 GPIO18 和 GND。许多四脚按钮同一侧的两个引脚内部已经连通。', '将 LED 通过 330 Ω 电阻接到 GPIO23，阴极接 GND。', '运行演示并按住按钮控件，LED 会随按下状态变化。', '在示例中使用 INPUT_PULLUP：松开时为 HIGH，按下时为 LOW。'],
    wiring: [wire('GPIO18', '按钮触点 A', 'INPUT_PULLUP 使松开时输入保持为 HIGH。'), wire('按钮触点 B', 'GND', '按下时把输入端接地。'), wire('GPIO23', '330 Ω → LED → GND', '指示输出。')],
    code: `const int BUTTON_PIN = 18;
const int LED_PIN = 23;

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  bool pressed = digitalRead(BUTTON_PIN) == LOW;
  if (pressed) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("Pressed");
  } else {
    digitalWrite(LED_PIN, LOW);
    Serial.println("Released");
  }
  delay(50);
}`,
    explanation: 'bool 存储真或假。比较 digitalRead(BUTTON_PIN) == LOW 判断输入是否等于 LOW，并把结果存入 pressed。当 pressed 为真时执行 if 块，否则执行 else 块。花括号把每个分支的指令分组。INPUT_PULLUP 让松开的输入保持 HIGH，按下时接地，使该比较为真。',
    specs: [spec('按钮', 'GPIO18 → GND'), spec('输入模式', 'INPUT_PULLUP'), spec('按下状态', 'LOW'), spec('LED 输出', 'GPIO23')],
    control: null,
    challenge: '反转 LED 的行为，使按钮松开时点亮。',
    question: question('按钮按下时，读数是什么？', ['HIGH', 'LOW', '一个未定义的值'], 1, '开关把 GPIO18 接地，因此 digitalRead() 返回 LOW。')
  },
  {
    id: 'potentiometer', title: '旋转模拟旋钮', shortTitle: '转动旋钮', category: '模拟', duration: '8 分钟', icon: 'dial',
    description: '电位器把位置转换为电压。读取其中间引脚，并用结果平滑控制 LED 亮度。',
    objectives: ['搭建分压电路。', '把输入电压转换为数字。', '用快速亮灭脉冲调节 LED 亮度。'],
    steps: ['把 10 kΩ 电位器的两个外侧引脚分别接到 3V3 和 GND。', '把中间引脚（滑动端）接到 GPIO34。', '把 GPIO23 经 330 Ω 电阻和 LED 接到 GND。', '运行演示并转动旋钮。显示的 ADC 读数是理想化数值；真实 ADC 存在噪声和非线性。'],
    wiring: [wire('3V3 / GND', '电位器外侧引脚', '对调两者可反转方向。'), wire('电位器滑动端', 'GPIO34', 'ADC1 输入；GPIO34 仅作输入。'), wire('GPIO23', '330 Ω → LED → GND', 'PWM 亮度输出。')],
    code: `const int POT_PIN = 34;
const int LED_PIN = 23;

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);
  analogSetPinAttenuation(POT_PIN, ADC_11db);
  ledcAttach(LED_PIN, 5000, 8);
}

void loop() {
  int raw = analogRead(POT_PIN);
  int duty = map(raw, 0, 4095, 0, 255);
  ledcWrite(LED_PIN, duty);
  Serial.println(raw);
  delay(50);
}`,
    explanation: '模数转换器（ADC）用数字表示电压。12 位时有 4096 个编码，即 0–4095。map() 将其重映射到 256 个 PWM 亮度等级，即 0–255。脉宽调制（PWM）改变每个快速亮灭周期中通电所占的比例。配置的 ADC 输入缩放（称为衰减）并不会让 GPIO34 能承受 5 V。',
    specs: [spec('电位器', '10 kΩ 线性'), spec('ADC 引脚', 'GPIO34 / ADC1'), spec('ADC 分辨率', '12 位，0–4095'), spec('PWM', '5 kHz，8 位，0–255')],
    control: control('旋钮位置', 0, 100, 1, 50, '%'),
    challenge: '反转映射关系，使 ADC 读数升高时 LED 变暗。',
    question: question('在当前 map() 下，旋钮读数从 1024 升到 3072，LED 会怎样？', ['变亮：PWM 占空比从约 25% 升到 75%', '变暗：PWM 占空比从约 75% 降到 25%', '亮度不变：所有非零读数都被视为全亮'], 0, 'map(raw, 0, 4095, 0, 255) 保持方向不变。输出从约 64 升到 191，通电时间占比更长。反转 map 的首尾参数会反转这一行为。')
  },
  {
    id: 'rgb', title: '把光混合成色彩', shortTitle: '混合颜色', category: '输出', duration: '8 分钟', icon: 'palette',
    description: '一个封装里有三颗 LED。用独立的 PWM 通道混合红、绿、蓝，创造出丰富的色彩。',
    objectives: ['识别共阴极 RGB LED。', '为每种颜色各配一个电阻。', '混合三个 PWM 亮度值。'],
    steps: ['查阅数据手册确认 RGB LED 的引脚排列；引脚顺序并不统一。', '把共阴极接到 GND。', '把红、绿、蓝阳极分别通过 330 Ω 电阻接到 GPIO25、GPIO26 和 GPIO27。', '运行演示并体验色相控件。示例会把选定的色相转换为三个 PWM 值。'],
    wiring: [wire('GPIO25', '330 Ω → 红色阳极'), wire('GPIO26', '330 Ω → 绿色阳极'), wire('GPIO27', '330 Ω → 蓝色阳极'), wire('共阴极', 'GND', '本示例适用于共阴极 LED。')],
    code: `const int RED = 25, GREEN = 26, BLUE = 27;
const int HUE_DEGREES = 180;

void setHue(int hue) {
  hue = ((hue % 360) + 360) % 360;
  int rise = (hue % 60) * 255 / 60;
  int fall = 255 - rise;
  int r = 0, g = 0, b = 0;
  switch (hue / 60) {
    case 0: r = 255; g = rise; break;
    case 1: r = fall; g = 255; break;
    case 2: g = 255; b = rise; break;
    case 3: g = fall; b = 255; break;
    case 4: r = rise; b = 255; break;
    case 5: r = 255; b = fall; break;
  }
  ledcWrite(RED, r);
  ledcWrite(GREEN, g);
  ledcWrite(BLUE, b);
}

void setup() {
  ledcAttach(RED, 5000, 8);
  ledcAttach(GREEN, 5000, 8);
  ledcAttach(BLUE, 5000, 8);
  setHue(HUE_DEGREES);
}

void loop() {
  delay(1000); // LEDC 会保持所选颜色持续显示。
}`,
    explanation: 'HUE_DEGREES 在 0–360° 的色环上选定一种颜色。setHue() 把它分成六个区间，得出三个 0–255 的 PWM 值。RGB LED 每种颜色都需要一个电阻。setup() 之后由 LEDC 维持这些值；实际色彩平衡取决于 LED、电阻和电源。',
    specs: [spec('类型', '共阴极 RGB LED'), spec('输出', 'GPIO25 / 26 / 27'), spec('电阻', '3 × 330 Ω'), spec('PWM 分辨率', '每种颜色 8 位')],
    control: control('色相', 0, 360, 1, 180, '°'),
    challenge: '用缓慢变化的角度调用 setHue()，做出彩虹渐变。再按比例降低三个 PWM 值，让光线更柔和。',
    question: question('色相为 60° 时，辅助函数选择区间 1，rise = 0、fall = 255。应该得到什么结果？', ['红 255、绿 0、蓝 255：品红', '红 255、绿 255、蓝 0：黄', '红 0、绿 255、蓝 255：青'], 1, '区间 1 把红色设为 fall、绿色设为 255，蓝色保持初始化时的零。红光与绿光混合得到黄色。三个亮度值分别控制各自带限流的通道。')
  },
  {
    id: 'light', title: '感知环境光', shortTitle: '感知光线', category: '传感器', duration: '8 分钟', icon: 'sun',
    description: '制作一盏能响应环境的小夜灯。光敏电阻的阻值会随光线变化。',
    objectives: ['把变化的电阻转换为电压。', '用 ADC 输入读取光线。', '用阈值控制输出的开关。'],
    steps: ['把光敏电阻（LDR）接在 3V3 与 GPIO34 之间。', '在 GPIO34 与 GND 之间接一个 10 kΩ 电阻，构成分压电路。', '把 LED 经 330 Ω 接到 GPIO23 和 GND。', '在实物上，打开 115200 波特率的串口监视器，分别记录遮住 LDR 和强光照射时的读数。若约为 400 和 2000，则中点阈值为 (400 + 2000) / 2 = 1200。你的读数可能不同。', '修改草图顶部的 DARK_THRESHOLD 以匹配你的测量值，然后重新上传。在仿真中，遮住传感器并调整环境光控件，观察阈值的判断结果。'],
    wiring: [wire('3V3', 'LDR → GPIO34', '光线越强，LDR 阻值越低。'), wire('GPIO34', '10 kΩ → GND', '分压的节点就是 ADC 输入。'), wire('GPIO23', '330 Ω → LED → GND')],
    code: `const int LIGHT_PIN = 34;
const int LED_PIN = 23;
const int DARK_THRESHOLD = 1200;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  analogReadResolution(12);
  analogSetPinAttenuation(LIGHT_PIN, ADC_11db);
}

void loop() {
  int light = analogRead(LIGHT_PIN);
  digitalWrite(LED_PIN, light < DARK_THRESHOLD);
  Serial.println(light);
  delay(100);
}`,
    explanation: '在这种接法下，光线越强，ADC 读数越高。阈值需要根据你的电路校准。LDR 提供的是相对光强测量；原始 ADC 值并不是以勒克斯为单位的照度读数。',
    specs: [spec('传感器', 'LDR / 光敏电阻'), spec('固定电阻', '10 kΩ'), spec('ADC 输入', 'GPIO34'), spec('输出', 'GPIO23')],
    control: control('环境光', 0, 100, 1, 65, '%'),
    challenge: '增加两个阈值，让读数在开关点附近波动时 LED 不会闪烁。',
    question: question('光线变亮时，LDR 的阻值会怎样？', ['减小', '增大', '始终保持在 10 kΩ'], 0, 'LDR 在强光下更容易导通，因此阻值减小。')
  },
  {
    id: 'distance', title: '测量前方距离', shortTitle: '读取距离', category: '传感器', duration: '10 分钟', icon: 'ruler',
    description: '发出一段短暂的超声脉冲，然后测量回波返回的时间。把回声转换为距离读数。',
    objectives: ['触发 HC-SR04 测量。', '把往返时间转换为距离。', '把 5 V 的 Echo 信号降压以适配 3.3 V 输入。'],
    steps: ['用 5 V 为标准 HC-SR04 供电，并把它的 GND 接到 ESP32 的地。', '把 GPIO23 接到 Trig。多数 HC-SR04 模块接受 3.3 V 触发信号；若无响应，请检查你的模块。', '把 Echo 经 2.2 kΩ 电阻接到 GPIO34，再用 3.3 kΩ 从 GPIO34 接到 GND。该分压电路把 5 V 回波降到约 3 V。', '运行演示并移动障碍物。在实物上，请对准平整的表面。'],
    wiring: [wire('5 V 电源 / GND', 'HC-SR04 VCC / GND', '使用合适的 5 V 电源并共地。'), wire('GPIO23', 'Trig'), wire('Echo', '2.2 kΩ → GPIO34', '切勿把 5 V 的 Echo 直接接到 GPIO。'), wire('GPIO34', '3.3 kΩ → GND', '构成分压电路的下臂电阻。')],
    code: `const int TRIG = 23;
const int ECHO = 34;

void setup() {
  Serial.begin(115200);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
}

void loop() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long duration = pulseIn(ECHO, HIGH, 30000);
  if (duration == 0) {
    Serial.println("No echo");
  } else {
    float cm = duration * 0.0343f / 2.0f;
    Serial.printf("Distance: %.1f cm\\n", cm);
  }
  delay(100);
}`,
    explanation: '室温下声音每微秒传播约 0.0343 cm。回波往返于障碍物之间，因此计算时要除以二。pulseIn() 设有超时，回波丢失时不会无限阻塞程序。',
    specs: [spec('传感器供电', '标准 HC-SR04 为 5 V'), spec('Echo 分压', '上臂 2.2 kΩ / 下臂 3.3 kΩ'), spec('典型量程', '2–400 cm；受环境影响'), spec('Trig / Echo', 'GPIO23 / GPIO34')],
    control: control('障碍物距离', 5, 150, 1, 45, 'cm'),
    challenge: '物体距离小于 20 cm 时点亮 LED，并单独处理“No echo”的情况。',
    question: question('Echo 脉冲持续 2000 µs。按每 µs 0.0343 cm 计算，障碍物距离多远？', ['约 68.6 cm', '约 34.3 cm', '约 17.2 cm'], 1, '2000 × 0.0343 = 68.6 cm 是往返全程。除以二得到单程距离约 34.3 cm。忘记除以二会使报告的距离翻倍。')
  },
  {
    id: 'sound', title: '发出声音', shortTitle: '制造声音', category: '输出', duration: '7 分钟', icon: 'volume',
    description: '无源压电片把变化的电压转换为振动。改变频率即可改变音调。',
    objectives: ['区分无源压电片与有源蜂鸣器。', '用 LEDC 产生音调。', '理解频率与音调的关系。'],
    steps: ['使用小型无源压电片，而不是大电流扬声器。', '把 GPIO25 经 100 Ω 电阻接到压电片正极，负极接 GND。', '开始演示并调整频率。开启网站音频即可听到浏览器版本的声音。', '把所选频率的草图上传到开发板，就能听到相同的音调参数。'],
    wiring: [wire('GPIO25', '100 Ω → 无源压电片 (+)'), wire('压电片 (−)', 'GND', '大电流蜂鸣器需要使用三极管驱动。')],
    code: `const int PIEZO_PIN = 25;
const int FREQUENCY_HZ = 440;

void setup() {
  ledcAttach(PIEZO_PIN, 2000, 8);
  ledcWriteTone(PIEZO_PIN, FREQUENCY_HZ);
}

void loop() {
  delay(1000); // 硬件会持续产生该音调。
  // 停止发声：ledcWriteTone(PIEZO_PIN, 0);
}`,
    explanation: 'FREQUENCY_HZ 决定音调，ledcWriteTone() 以该频率启动方波。loop() 等待期间，LEDC 持续输出。频率为零会停止发声。有源蜂鸣器自带振荡器，通常无法以同样方式发出不同音符。',
    specs: [spec('输出', 'GPIO25'), spec('换能器', '小型无源压电片'), spec('起始频率', '440 Hz · A4'), spec('音调 API', 'ledcWriteTone(pin, frequency)')],
    control: control('频率', 150, 2000, 10, 440, 'Hz'),
    challenge: '用 262、330 和 392 Hz 配合定时暂停，创作三音符旋律。再把每个频率翻倍，将旋律提高一个八度。',
    question: question('把一个音符的频率翻倍会发生什么？', ['音调升高一个八度', '变成静音', '音调保持不变'], 0, '八度对应 2:1 的频率比。')
  },
  {
    id: 'piano', title: '制作一架迷你钢琴', shortTitle: '迷你钢琴', category: '项目', duration: '12 分钟', icon: 'piano',
    description: '把八个按钮和一个压电片组合起来，做成一个八度音域的乐器。每个按钮选择一个不同的音符。',
    objectives: ['用数组保存相关的引脚和频率。', '扫描多个数字输入。', '制作一个简单的单音乐器。'],
    steps: ['把八个按钮分别接在列出的 GPIO 引脚与 GND 之间，每个按钮占用一个输入。', '把小型无源压电片经 100 Ω 接到 GPIO25，另一端接 GND。', '运行演示并弹奏屏幕上的琴键。', '如果同时按住多个按钮，硬件示例会播放数组中第一个被按下的琴键。'],
    wiring: [wire('GPIO13, 14, 16, 17', '按钮 C、D、E、F → GND', '每个引脚都使用 INPUT_PULLUP。'), wire('GPIO18, 19, 21, 22', '按钮 G、A、B、C5 → GND'), wire('GPIO25', '100 Ω → 无源压电片 → GND')],
    code: `const int keys[] = {13, 14, 16, 17, 18, 19, 21, 22};
const int notes[] = {262, 294, 330, 349, 392, 440, 494, 523};
const int PIEZO = 25;

void setup() {
  for (int pin : keys) {
    pinMode(pin, INPUT_PULLUP);
  }
  ledcAttach(PIEZO, 2000, 8);
}

void loop() {
  int frequency = 0;
  for (int i = 0; i < 8; i++) {
    if (digitalRead(keys[i]) == LOW) {
      frequency = notes[i];
      break;
    }
  }
  ledcWriteTone(PIEZO, frequency);
  delay(10);
}`,
    explanation: '两个数组的位置一一对应：keys[0] 对应 notes[0]。在循环中读取输入，避免把同样的逻辑重复八次。本示例一次只播放一个音符，不能合成和弦。',
    specs: [spec('琴键', '8 个轻触按钮'), spec('音域', 'C4 到 C5'), spec('输入极性', '低电平有效'), spec('声音输出', 'GPIO25')],
    control: control('音符', 0, 7, 1, 0, ''),
    challenge: '修改 notes 数组，创建不同的音阶，而不改动读取按钮的逻辑。',
    question: question('notes 数组中的索引 3 指的是什么？', ['第三个音符', '第四个音符', '3 Hz 的频率'], 1, 'C++ 数组从索引 0 开始，因此索引 3 是第四个元素。')
  },
  {
    id: 'motor', title: '控制电机', shortTitle: '驱动电机', category: '运动', duration: '12 分钟', icon: 'fan',
    description: '电机所需的电流超过 GPIO 能提供的能力。用 MOSFET 切换电机电源，而由 ESP32 控制转速。',
    objectives: ['把控制信号与电机电源分开。', '使用续流二极管并共地。', '用 PWM 调节电机转速。'],
    steps: ['一个完整的小电机示例使用：额定堵转电流不超过 300 mA 的 3 V 直流电机、2×AA 电池盒（约 3 V）、带 G/D/S 标注的 AO3400A MOSFET 转接板、1N5819 肖特基二极管，以及 100 Ω 和 10 kΩ 电阻。其他电机需要与其额定参数相匹配的元件和电源。', '辨认 G（栅极：控制端）、D（漏极：朝向电机负极）和 S（源极：朝向地）。以转接板标注和厂商的引脚图为准，并注意其观察方向；三极管引脚顺序并不统一。', '断开电源后，把电机正极接到电池盒正极，电机负极接到 D。把 S 接到电池盒负极和 ESP32 的 GND。本示例中 ESP32 保持通过 USB 供电。', '把 1N5819 并接在电机两端：带色环的阴极接电机正极，阳极接电机负极/D。这条续流通路用于关断后释放绕组电流。', '把 GPIO25 经 100 Ω 接到 G，并在 G 与 S/GND 之间接 10 kΩ。接通电机电源前检查所有连接。普通的 5 V 栅极 MOSFET 模块并不自动兼容 3.3 V 的 GPIO。'],
    wiring: [wire('GPIO25', '100 Ω → MOSFET 栅极', '10 kΩ 栅极对地下拉电阻。'), wire('MOSFET 源极', 'GND', '把电机电源与 ESP32 的地相连。'), wire('MOSFET 漏极', '电机 (−)'), wire('额定外部电源', '电机 (+)', '续流二极管：阴极接 +，阳极接 −。')],
    code: `const int MOTOR_PIN = 25;
const int DUTY = 140; // 8 位分辨率下为 0–255

void setup() {
  ledcAttach(MOTOR_PIN, 20000, 8);
  ledcWrite(MOTOR_PIN, DUTY);
}

void loop() {
  delay(1000); // LEDC 会保持所选的驱动占空比。
  // 停止电机：ledcWrite(MOTOR_PIN, 0);
}`,
    explanation: 'MOSFET 承载电机电流，GPIO 只控制它的栅极。三极管关断时，二极管为感性电流提供安全通路。真实电机在低占空比下可能无法启动，而且本电路只能单向调速。',
    specs: [spec('控制输出', 'GPIO25'), spec('PWM', '20 kHz，8 位'), spec('完整电机示例', '3 V，额定堵转电流 ≤300 mA'), spec('示例电机电源', '2×AA 电池盒；ESP32 由 USB 供电'), spec('示例开关 / 二极管', 'AO3400A breakout / 1N5819')],
    control: control('电机占空比', 0, 100, 1, 55, '%'),
    challenge: '修改代码，依次保持三档转速各两秒。观察电机能够启动的最低占空比。',
    question: question('为什么要在电机两端并接续流二极管？', ['为了自动反转电机', '为了吸收关断时的感性电压尖峰', '为了把 3.3 V 转换为 5 V'], 1, '电机绕组会储存能量。MOSFET 关断后，二极管为其电流提供通路。')
  },
  {
    id: 'temperature', title: '感知室内环境', shortTitle: '感知温度', category: '传感器', duration: '10 分钟', icon: 'thermometer',
    description: '从 DHT22 读取温度和湿度。学习如何使用传感器库，以及如何处理读取失败的情况。',
    objectives: ['安装传感器库。', '读取温度和相对湿度。', '检查无效读数。'],
    steps: ['在 Arduino 库管理器中安装 Adafruit 的“DHT sensor library”及其依赖“Adafruit Unified Sensor”。', '对于裸露的 DHT22，把 1 脚接到 3V3、2 脚（数据）接到 GPIO27、4 脚接到 GND；3 脚不使用。请确认你所用模块的引脚排列。', '如果你的模块没有内置上拉电阻，就在数据线与 3V3 之间加一个 10 kΩ 上拉电阻。', '运行演示并调节室温。真实 DHT22 的两次读数之间应至少间隔两秒。'],
    wiring: [wire('3V3', 'DHT22 VCC'), wire('GPIO27', 'DHT22 数据', '裸露传感器需在 3V3 与数据线之间接 10 kΩ 上拉电阻。'), wire('GND', 'DHT22 GND')],
    code: `// 安装：DHT sensor library（Adafruit）
// 依赖：Adafruit Unified Sensor
#include <DHT.h>

DHT sensor(27, DHT22);

void setup() {
  Serial.begin(115200);
  sensor.begin();
}

void loop() {
  delay(2000);
  float temperature = sensor.readTemperature();
  float humidity = sensor.readHumidity();
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Sensor read failed");
    return;
  }
  Serial.printf("%.1f C | %.1f %% RH\\n", temperature, humidity);
}`,
    explanation: '传感器库负责处理其数字时序协议。读取失败会返回 NaN（“not a number”，非数值），因此示例在使用前先做检查。这是响应较慢的环境传感器，而不是快速温度探头。',
    specs: [spec('传感器', 'DHT22 / AM2302'), spec('数据引脚', 'GPIO27'), spec('本电路供电', '3.3 V'), spec('读取间隔', '至少 2 秒')],
    control: control('温度', 5, 45, 0.5, 23.5, '°C'),
    challenge: '当温度高于 28 °C 时打印“Getting warm”，同时仍要处理读取失败的情况。',
    question: question('传感器返回 NaN 时，程序应该怎么做？', ['把它当作零度', '在使用数值前检测到读取失败', '提高供电电压'], 1, 'NaN 表示读数无效。应报告或重试该错误，而不是依据虚构的数值采取行动。')
  },
  {
    id: 'servo', title: '精准运动', shortTitle: '控制舵机位置', category: '运动', duration: '10 分钟', icon: 'gauge',
    description: '告诉舵机要转到哪里。重复脉冲的宽度决定目标角度，运动本身由舵机完成。',
    objectives: ['理解舵机控制脉冲。', '为运动部分使用独立电源。', '用 ESP32Servo 设置目标位置。'],
    steps: ['安装与 Arduino-ESP32 3.x 兼容的最新版 ESP32Servo。', '把舵机电源接到合适的外部稳压电源，SG90 通常为 5 V。请查看舵机的额定参数。', '把舵机信号线接到 GPIO18，并把舵机电源的地与 ESP32 的 GND 相连。', '尝试不同的目标位置。先从保守的 20–160° 范围开始，确认舵机的机械限位后再扩大范围。'],
    wiring: [wire('GPIO18', '舵机信号', '通常为橙色、黄色或白色；请查看你的舵机。'), wire('外部稳压 5 V', 'Servo V+'), wire('电源 GND', '舵机 GND + ESP32 GND', '切勿用 GPIO 给舵机供电。')],
    code: `// 安装：ESP32Servo（兼容 3.x 的当前版本）
#include <ESP32Servo.h>

Servo arm;
const int TARGET_ANGLE = 90;

void setup() {
  arm.setPeriodHertz(50);
  arm.attach(18, 1000, 2000);
  arm.write(TARGET_ANGLE);
}

void loop() {
  delay(1000); // 舵机会持续接收其目标脉冲。
}`,
    explanation: '舵机用脉冲宽度来选择目标位置，通常在 1–2 ms 之间，以 50 Hz 重复。具体角度范围因舵机而异。脉冲宽度与用于调节 LED 亮度的 PWM 占空比不同。',
    specs: [spec('信号', 'GPIO18'), spec('控制频率', '50 Hz'), spec('配置的脉冲', '1000–2000 µs'), spec('电源', '外部电源并共地')],
    control: control('目标角度', 20, 160, 1, 90, '°'),
    challenge: '把固定目标改为在 20° 与 160° 之间缓慢扫描。然后改用 GPIO34 上的电位器来选择目标。',
    question: question('控制信号的哪一部分告诉舵机目标位置？', ['脉冲宽度', 'USB 波特率', '电源线的数量'], 0, '舵机把每个控制脉冲的宽度解释为所请求的位置。')
  },
  {
    id: 'stepper', title: '一步一步来', shortTitle: '转动轮子', category: '运动', duration: '12 分钟', icon: 'rotate',
    description: '步进电机按一系列磁场依次转动。通过计步来控制小型减速电机的旋转。',
    objectives: ['通过 ULN2003 板驱动 28BYJ-48。', '用 Stepper 库依次给线圈通电。', '理解开环定位。'],
    steps: ['如果尚未安装 Arduino 的 Stepper 库，请先安装。', '把 5 V 的 28BYJ-48 插到它的 ULN2003 驱动板上。', '把 IN1、IN2、IN3、IN4 分别接到 GPIO16、GPIO17、GPIO18 和 GPIO19。用合适的 5 V 电源给驱动器供电并共地。', '运行示例，使其相对当前起始位置转动所选角度一次。复位或重新上传都会再次运行 setup()，从而再产生一次相对移动；本示例不会寻找绝对原点。具体减速比因电机而异。'],
    wiring: [wire('GPIO16 / 17', 'ULN2003 IN1 / IN2'), wire('GPIO18 / 19', 'ULN2003 IN3 / IN4'), wire('外部 5 V / GND', '驱动器 + / −', '把驱动器地线与 ESP32 的地相连。'), wire('电机连接器', 'ULN2003 电机插座')],
    code: `// 安装：Arduino 的 Stepper 库
#include <Stepper.h>

const int STEPS_PER_TURN = 2048;
const int TARGET_DEGREES = 180;
// 1-3-2-4 顺序与该电机的线圈相序一致。
Stepper motor(STEPS_PER_TURN, 16, 18, 17, 19);

void setup() {
  motor.setSpeed(10);
  int steps = STEPS_PER_TURN * TARGET_DEGREES / 360;
  motor.step(steps);
}

void loop() {
  delay(1000); // 不再走步；通电的线圈保持位置。
}`,
    explanation: 'TARGET_DEGREES 被转换为相对步数，并在 setup() 中执行一次。这种四拍驱动每输出一圈约需 2048 步。通电的线圈随后保持位置并持续耗电。电机没有位置反馈；过载可能导致丢步。实验结束后请断开电机电源。',
    specs: [spec('电机 / 驱动器', '5 V 28BYJ-48 / ULN2003'), spec('示例驱动方式', '四拍相序'), spec('标称步数/圈', '约 2048'), spec('示例转速', '10 RPM')],
    control: control('目标转角', 0, 360, 5, 180, '°'),
    challenge: '让电机在每个方向各转约四分之一圈。比较若干周期后的最终位置。',
    question: question('这个步进电路知道电机是否真的走过了一步吗？', ['知道，它读取内置编码器', '不知道，它只发步数指令而没有位置反馈', '只有在电机断开时才知道'], 1, '这是开环控制。如果电机堵转，程序记录的步数可能与实际位置不符。')
  },
  {
    id: 'plant', title: '让你的植物开口说话', shortTitle: '智能植物', category: '项目', duration: '15 分钟', icon: 'sprout',
    description: '把模拟湿度传感器和 OLED 显示屏结合起来。把校准后的读数变成一个简易的浇水提醒。',
    objectives: ['连接 I²C OLED。', '校准相对湿度标尺。', '把输入、逻辑和显示结合起来。'],
    steps: ['使用额定 3.3 V 的电容式土壤湿度传感器。把 VCC 接到 3V3、GND 接到 GND、模拟输出接到 GPIO34。别让传感器的电子部分接触土壤和水。', '先上传“学习”中仅用串口的校准草图，它无需 OLED 即可工作。打开 115200 波特率的串口监视器。把探头插入干燥培养土中到一个可重复的深度，记录几个稳定的原始读数。', '用相同深度在刚浇透并沥干的培养土中重复测量，记录稳定的湿润读数。这两个参考值只适用于你的这套装置，并非适用于所有土壤。把综合示例中的 DRY 和 WET 换成你测得的不同数值。', '连接一块兼容 3.3 V 的 SSD1306 OLED：SDA（数据）接 GPIO21，SCL（时钟）接 GPIO22，VCC 接 3V3，GND 接 GND。', '在 OLED 连接好的情况下运行“学习”中的 I²C 扫描程序，在串口监视器中读取检测到的地址。常见地址是 0x3C；如果不同，就在 display.begin() 中使用你的地址。', '安装 Adafruit SSD1306 和 Adafruit GFX Library，然后用你的校准值和地址上传综合示例。显示的百分比是相对值；决定是否浇水前请检查真实土壤。'],
    wiring: [wire('3V3 / GND', '湿度传感器 VCC / GND'), wire('传感器模拟输出', 'GPIO34', '输出必须保持在 ESP32 的输入范围内。'), wire('GPIO21 / GPIO22', 'OLED SDA / SCL'), wire('3V3 / GND', 'OLED VCC / GND', '使用兼容 3.3 V 的 OLED 模块。')],
    code: `// 安装：Adafruit SSD1306 + Adafruit GFX Library
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);
const int SOIL = 34;
const int DRY = 3000; // 替换为你的干燥读数
const int WET = 1300; // 替换为你的湿润读数

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  analogReadResolution(12);
  analogSetPinAttenuation(SOIL, ADC_11db);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED initialization failed");
    while (true) delay(1000);
  }
  display.setTextColor(SSD1306_WHITE);
}

void loop() {
  int raw = analogRead(SOIL);
  int moisture = constrain(map(raw, DRY, WET, 0, 100), 0L, 100L);
  display.clearDisplay();
  display.setTextSize(2);
  display.setCursor(0, 0);
  display.print(moisture); display.println("%");
  display.setTextSize(1);
  display.println(moisture < 30 ? "Check the soil" : "Looking good");
  display.display();
  Serial.printf("Raw: %d | Relative: %d%%\\n", raw, moisture);
  delay(1000);
}`,
    explanation: '这个百分比是介于两个校准点之间的相对标尺，不是实验室级别的含水量测量。不同土壤和传感器位置需要不同的校准。电容式传感器避免了容易腐蚀的外露电阻电极。',
    specs: [spec('模拟传感器', '3.3 V 电容式湿度探头'), spec('ADC', 'GPIO34 / ADC1'), spec('I²C 总线', 'SDA21 / SCL22'), spec('OLED', 'SSD1306 128×64，通常为 0x3C')],
    control: control('相对土壤湿度', 0, 100, 1, 55, '%'),
    challenge: '针对干燥、适宜和过湿三种情况显示三条不同的植物状态消息。',
    question: question('显示的湿度百分比代表什么？', ['适用于任何土壤的精确含水量测量', '基于你干湿校准的相对标尺', '电池电量'], 1, '示例把两个测得的参考值映射到 0–100%。土壤类型和传感器位置都会影响这个标尺。')
  },
  {
    id: 'force', title: '感受压力', shortTitle: '感知力度', category: '传感器', duration: '8 分钟', icon: 'fingerprint',
    description: '力敏电阻会对压力作出反应。读取它变化的阻值，并转换为可视的反馈。',
    objectives: ['用分压电路读取 FSR。', '区分相对读数与经过校准的力值。', '把压力映射为 LED 亮度。'],
    steps: ['把 FSR 接在 3V3 与 GPIO34 之间。', '在 GPIO34 与 GND 之间接一个 10 kΩ 电阻。', '把 LED 从 GPIO23 经 330 Ω 接到 GND。', '运行演示并调节压力。在实物上，请在传感器额定范围内轻按。'],
    wiring: [wire('3V3', 'FSR → GPIO34'), wire('GPIO34', '10 kΩ → GND', '构成分压电路。'), wire('GPIO23', '330 Ω → LED → GND')],
    code: `const int FORCE_PIN = 34;
const int LED_PIN = 23;

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);
  analogSetPinAttenuation(FORCE_PIN, ADC_11db);
  ledcAttach(LED_PIN, 5000, 8);
}

void loop() {
  int raw = analogRead(FORCE_PIN);
  int brightness = map(raw, 0, 4095, 0, 255);
  ledcWrite(LED_PIN, brightness);
  Serial.printf("Relative pressure: %d\\n", raw);
  delay(50);
}`,
    explanation: 'FSR 的阻值通常随压力增大而减小。在这种分压电路中，GPIO34 的电压会升高。其响应是非线性的，并受接触面积影响，因此示例报告的是相对值，而不是声称测得以牛顿为单位的力。',
    specs: [spec('传感器', '力敏电阻'), spec('分压电阻', '10 kΩ'), spec('ADC 输入', 'GPIO34'), spec('输出', 'GPIO23 PWM')],
    control: control('施加的压力', 0, 100, 1, 35, '%'),
    challenge: '增加一个用于提示“已按下”的阈值，再尝试对多个采样求平均以降低噪声。',
    question: question('这个未经校准的 FSR 读数能直接告诉我们以牛顿为单位的精确力值吗？', ['能，原始 ADC 值就是牛顿', '不能，它需要校准且响应是非线性的', '能，只要使用蓝色 LED'], 1, 'FSR 适合检测相对力度。精确的力测量需要适当的校准，通常还需换用其他传感器。')
  },
  {
    id: 'wifi', title: '搭建你的第一个联网项目', shortTitle: '进入无线世界', category: '联网', duration: '15 分钟', icon: 'wifi',
    description: '让手机控制你的 LED。ESP32 会创建自己的 Wi-Fi 网络并提供一个小型网页，无需路由器。',
    objectives: ['创建一个 Wi-Fi 接入点。', '用 WebServer 提供网页。', '把网页请求连接到物理输出。'],
    steps: ['把外接 LED 经 330 Ω 接到 GPIO23，再接到 GND。', '上传示例，并打开 115200 波特率的串口监视器查看接入点地址。', '用手机或电脑加入“ESP32-Lab”Wi-Fi 网络。它没有互联网连接；设备提示时请选择保持连接。', '在该设备的浏览器中打开 http://192.168.4.1，点击 LED 按钮。本网站的演示只在本地展示交互，不会连接到实物 ESP32。'],
    wiring: [wire('GPIO23', '330 Ω → LED 阳极 (+)'), wire('LED 阴极 (−)', 'GND'), wire('USB', '供电 + 编程', '草图启动后即可进行无线控制。')],
    code: `#include <WiFi.h>
#include <WebServer.h>

WebServer server(80);
const int LED = 23;

void page() {
  server.send(200, "text/html", R"HTML(
    <!doctype html><html lang="en">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>ESP32 Lab</title>
    <body style="font:20px system-ui;padding:2rem">
    <h1>Hello from ESP32</h1>
    <p><a href="/on">Turn LED on</a></p>
    <p><a href="/off">Turn LED off</a></p>
    </body></html>
  )HTML");
}

void setup() {
  Serial.begin(115200);
  pinMode(LED, OUTPUT);
  digitalWrite(LED, LOW);
  WiFi.mode(WIFI_AP);
  WiFi.softAP("ESP32-Lab");
  Serial.println(WiFi.softAPIP());
  server.on("/", page);
  server.on("/on", []() { digitalWrite(LED, HIGH); page(); });
  server.on("/off", []() { digitalWrite(LED, LOW); page(); });
  server.begin();
}

void loop() {
  server.handleClient();
}`,
    explanation: 'ESP32 充当接入点和 Web 服务器。浏览器请求 /on 或 /off，相应的处理函数会改变 GPIO23。本教学示例创建一个开放的本地网络。你可以给 WiFi.softAP() 传入第二个至少 8 个字符的参数，为接入点添加密码。',
    specs: [spec('网络模式', 'SoftAP, 2.4 GHz'), spec('网络名称', 'ESP32-Lab'), spec('默认本地地址', '192.168.4.1'), spec('库', 'WiFi 和 WebServer，随核心一起提供')],
    control: null,
    challenge: '把本课与 GPIO27 上的 DHT22 结合：增加 /temperature 路由，显示最近一次有效的摄氏温度读数。用 millis() 每两秒采样一次，避免使用阻塞式延时，这样 /on 和 /off 才能保持响应。',
    question: question('手机需要互联网连接才能打开 ESP32 的本地页面吗？', ['需要，每个网页都需要互联网', '不需要，它直接连接到 ESP32 的 Wi-Fi 网络', '只有在 LED 亮起时才需要'], 1, '手机与 ESP32 在本地 Wi-Fi 网络上通信，网页由 ESP32 本身提供。')
  }
];

// 与首屏摘要分开保存，让界面可以逐步呈现教学内容：
// 先预测、再交互、后观察，最后解释结果。
const learningNotes = {
  board: {
    interaction: '点击 EN 重启开发板。点选某个元件可了解它的用途。',
    concepts: [
      { title: '为物理任务而生的计算机', text: '微控制器会反复读取输入、做出判断并改变输出。ESP32 把你的草图存储在 Flash 中，断电后仍会保留。它的 SRAM 保存临时的运算数据。重启会清除这些临时状态，并重新开始运行程序。' },
      { title: '电源、电压与共地', text: '电压是两点之间的电势差。GND（地）是电路共用的 0 V 参考点，也是电流的回路。USB 为开发板提供 5 V，板上的稳压器产生 3.3 V。3V3 电源引脚可以给接在 3V3 与 GND 之间的合适小型设备供电。它并不是可编程的信号输出。' },
      { title: '信号与控制它们的程序', text: 'GPIO 表示通用输入输出：一个你的代码可以读取或控制的带编号引脚。相对 GND，HIGH 约为 3.3 V，LOW 约为 0 V；切勿向 ESP32 的 GPIO 施加 5 V。setup() 运行一次，随后 loop() 反复执行。这第一个示例通过 115200 波特率的 USB 串口打印运行时间，让你看到程序正在工作。' }
    ],
    experiment: {
      prediction: '如果重启开发板，已上传的程序会消失，还是只有运行状态重新开始？',
      action: '启动仿真，查看模组和 USB 接口，然后点击开发板上的 EN 复位按钮。把仿真中的重启与向实物开发板上传示例后按 EN 的情况作比较。',
      observe: '开发板会重新开始演示。在实物上，欢迎消息会再次出现，运行时间回到接近零；你无需重新上传草图。',
      why: 'EN 用于复位处理器。草图仍留在 Flash 中，而 setup() 和临时的运行时状态会重新开始。BOOT 的作用不同：复位时按住它可选择下载模式。'
    },
    troubleshooting: ['没有出现串口：请使用支持数据传输的 USB 线，然后检查你的开发板所需的 USB 转 UART 驱动。', '串口文字乱码：把监视器设为 115200 波特率。如果上传一直停留在“Connecting”，按住 BOOT 直到开始传输，再松开。'],
    takeaway: '理清完整路径：USB 供电 → 3.3 V 稳压器 → 处理器 → GPIO。你的代码从 setup() 开始，并在 loop() 中持续工作。'
  },
  blink: {
    interaction: '点击 LED 可改变其闪烁间隔。',
    concepts: [
      { title: '形成完整的电流通路', text: '当引脚为 HIGH 时，电流从 GPIO23 经电阻和 LED 流向 GND。LED 只能单向导通，从阳极到阴极。把它接反通常会使 LED 不亮，即使程序运行正常。' },
      { title: '选择电流，而不只是电压', text: 'Ω 表示欧姆，是电阻的单位；1 kΩ = 1000 Ω。电流以安培（A）计量；1 mA 是千分之一安培。红色 LED 的正向压降约为 2 V。在 3.3 V 输出和 330 Ω 电阻下，估算电流为 (3.3 − 2.0) / 330 ≈ 0.004 A，即 4 mA。实际电流取决于 LED 和引脚电压。去掉电阻可能损坏 LED 或 GPIO。' },
      { title: '两次延时构成一个周期', text: 'digitalWrite() 改变输出，delay() 决定该状态持续多久。示例保持 HIGH 500 ms、LOW 500 ms，构成一个一秒的周期，即 1 Hz。delay() 会阻塞这个循环；当项目还需要监听按钮或处理请求时，这就会成为限制。' }
    ],
    experiment: {
      prediction: '如果把亮和灭的时间都翻倍，LED 闪烁会快一倍还是慢一半？',
      action: '运行仿真并点击 LED，循环切换不同的间隔。用滑块比较 250 ms 与 1000 ms。要在实物上复现你的设置，可从“代码”下载更新后的草图，并用 Arduino IDE 上传。',
      observe: '间隔为 250 ms 时，一次完整闪烁耗时 500 ms；为 1000 ms 时，耗时两秒。亮和灭的时长始终相等。',
      why: '完整周期等于亮的时间加上灭的时间。两个间隔都增大会使周期变长、频率降低。滑块会更新演示和示例草图中的 INTERVAL_MS，但不会编译或上传代码。'
    },
    troubleshooting: ['LED 一直不亮：断电后检查其极性，并确认电阻和 LED 构成了通向 GND 的串联通路。', '闪烁的不是预期的 LED：本课使用的是 GPIO23 上的外接 LED。不同 ESP32 开发板上的板载 LED 各不相同。'],
    takeaway: '一个输出既需要正确的代码，也需要完整且限流的电路。闪烁频率取决于整个亮灭周期。'
  },
  button: {
    interaction: '按住按钮，然后松开。',
    concepts: [
      { title: '悬空的输入需要参考电平', text: '未连接的输入可能悬空并受到电气噪声干扰。INPUT_PULLUP 把一个弱内部上拉电阻接到 3.3 V，使按钮断开时 GPIO18 读数为 HIGH。原版 ESP32 上的 GPIO34–39 没有这些内部上拉电阻。' },
      { title: '按下可能意味着 LOW', text: '按钮按下时把 GPIO18 接地。上拉足够弱，开关会“胜出”，使输入为 LOW。表达式 digitalRead(BUTTON_PIN) == LOW 把这一电平转换为有用的概念“已按下”。LED 随后就可以跟随这个布尔值。' },
      { title: '用通俗语言理解判断', text: 'bool 是真或假的值。双等号 == 比较两个值；单个 = 存储一个值。这里的比较是在问“输入是否为 LOW？”，并把答案存入 pressed。if (pressed) 选择点亮 LED 的指令，else 则选择熄灭 LED 的指令。花括号把每个分支的指令分组。将来做切换或计数还需要消抖，因为真实开关触点会抖动。' }
    ],
    experiment: {
      prediction: 'LED 亮起时，按钮输入是 HIGH 还是 LOW？',
      action: '运行仿真，按住 3D 按钮，观察输入状态和 LED。松开后再试几次短按。面板上的按钮提供相同的交互。',
      observe: '按住按钮使 GPIO18 读数为 LOW 并点亮 LED。松开后输入回到 HIGH，LED 熄灭。',
      why: '输入电平和电平的含义是两回事。该电路是低电平有效的，与 LOW 的比较使“按下”这一布尔值为真。随后 digitalWrite() 把 LED 输出置为 HIGH。'
    },
    troubleshooting: ['输入始终为 LOW：检查按钮触点是否一直把 GPIO18 与 GND 导通。许多四脚按钮同一侧的两个引脚本来就是连通的。', '输入变化不可预测：确认使用了 INPUT_PULLUP 并且共地。不要改用仅作输入的引脚，除非另加外部上拉电阻。'],
    takeaway: '在编写条件之前，先明确松开和按下在电气上的含义。上拉电阻可防止开关断开时输入处于未定义状态。'
  },
  potentiometer: {
    interaction: '拖动旋钮可改变输入和 LED 亮度。',
    concepts: [
      { title: '位置变为电压', text: '电位器是一个带有可移动触点（滑动端）的连续可调电阻。它的两个外侧引脚跨接在 3V3 与 GND 之间。滑动端根据位置对该电压分压；它本身并不产生电压。对调两个外侧接线会反转方向。' },
      { title: '电压变为数字', text: 'ADC 表示模数转换器：它把电压转换为数字。12 位可产生 2¹² = 4096 个编码，从 0 到 4095。GPIO34 使用 ADC1，即 ESP32 两个转换器单元之一；该单元可在 Wi-Fi 运行时进行读取。ADC_11db 衰减设置选择更宽电压范围的内部输入缩放，但它并不允许输入 5 V。真实读数是非线性的，可能在达到 3.3 V 之前就到达上限。' },
      { title: '数字变为亮度', text: '脉宽调制（PWM）会反复开关输出。占空比指通电时间所占的比例。ESP32 的 LEDC 硬件产生这些脉冲；ledcAttach(LED_PIN, 5000, 8) 选择每秒 5000 个周期和 8 位精度，即 0 到 255 共 256 档占空比。map() 把 0–4095 的输入重映射到该输出范围，再由 ledcWrite() 施加。占空比越高，通常看起来越亮。' }
    ],
    experiment: {
      prediction: '旋钮转到中间时，你预计输入会接近零、接近半量程还是接近满量程？',
      action: '启动仿真，把电位器从一端拖到另一端。在 25%、50% 和 75% 附近暂停，比较仿真的 ADC 值与 LED 亮度。',
      observe: '随着旋钮转动，理想化的 ADC 读数向 4095 上升。LED 是逐渐变亮，而不是在某个单一阈值处突变。半量程约为 2048。',
      why: '分压电路提供变化的电压。ADC 把它表示为数字，映射再把这个数字转换为 PWM 占空比。真实 ESP32 要精确测量电压需要校准；原始值适合做相对控制。'
    },
    troubleshooting: ['读数一直停在某个极端：确认 GPIO34 接到了中间滑动端，且一个外侧引脚接 3V3、另一个接 GND。', 'LED 只有亮/灭两种状态：请使用 ledcAttach()/ledcWrite() 和映射后的 0–255 数值。digitalWrite() 无法选择中间占空比。'],
    takeaway: '这是许多交互设备的核心：物理位置 → 电压 → ADC 数字 → 输出行为。'
  },
  rgb: {
    interaction: '点击 RGB LED 可混合出另一种颜色，拖动则可扫描色相。',
    concepts: [
      { title: '叠加光线产生颜色', text: 'RGB LED 内含三个独立的发光单元。红加绿得到黄光，绿加蓝得到青色，蓝加红得到品红。三者叠加可接近白色。具体呈现取决于每个发光单元的亮度和颜色。' },
      { title: '三条支路需要三个电阻', text: '共阴极封装把负端连在一起并接到 GND。每个阳极仍需各自的串联电阻。共用一个电阻会因各通道正向压降不同而使它们互相影响。请确认封装的引脚顺序，而不要凭外形猜测。' },
      { title: '读懂颜色函数', text: '色相是色环上的一个角度。% 运算符取余数，因此第一行把角度折回 0–359°；360° 变为 0°。整除 60 会选中六个区间之一。hue % 60 给出在该区间内的进度，从而产生上升和下降的亮度值。switch 选中对应区间的 case，break 结束该分支。在 60° 时，区间 1 使用 rise = 0、fall = 255：红 255 加绿 255 得到黄色，蓝色为零。' }
    ],
    experiment: {
      prediction: '你会把哪两种光色混合来得到黄色？',
      action: '运行仿真并点击 RGB LED，循环切换颜色。拖动它或使用色相滑块，依次经过红、黄、绿、青、蓝和品红。',
      observe: '同一个物理封装能产生多种颜色。色相值描述的是色环上选定的颜色，而不是某个单一的 GPIO 亮度值。',
      why: '可见颜色来自三个发光单元的相对亮度。HUE_DEGREES 和 setHue() 把一次颜色选择转换为三个 PWM 值。在实物上复现时，务必为每个通道保留独立的电阻。'
    },
    troubleshooting: ['显示的颜色不对：请对照 LED 数据手册和 GPIO 分配，检查红、绿、蓝的引脚顺序。', '控件似乎反了，或 LED 一直不亮：确认 LED 是共阴极的。共阳极器件需要不同的接法和反向的亮度控制。'],
    takeaway: '颜色是三个受控输出组合而成。色相控件是选择一组红、绿、蓝亮度值的便捷方式。'
  },
  light: {
    interaction: '按住光传感器将其遮住，松开让光线重新照入。',
    concepts: [
      { title: '光线改变电阻', text: 'LDR 在光线变亮时阻值变小。ESP32 无法直接读取电阻，因此用 LDR 和一个 10 kΩ 电阻构成分压电路。这里 LDR 接 3V3，固定电阻接 GND，GPIO34 位于两者的节点。' },
      { title: '理解变化方向', text: '节点电压约为 3.3 × 10 kΩ /（LDR 阻值 + 10 kΩ）。强光下 LDR 阻值下降，电压升高。遮住传感器则相反。对调分压的两个元件会反转这一关系。' },
      { title: '根据测量选择阈值', text: '在实物 LDR 被遮住和强光照射时分别读取串口监视器。例如遮住 = 400、强光 = 2000，中点为 1200。把你选的数字填入草图顶部的 DARK_THRESHOLD，然后重新上传。light < DARK_THRESHOLD 会在低于该值时点亮 LED。如果读数在阈值附近跳动，可使用分开的开/关阈值，即滞回。' }
    ],
    experiment: {
      prediction: '遮住这个传感器时，ADC 值应上升还是下降？LED 应点亮还是熄灭？',
      action: '在明亮的环境光下启动仿真。按住 3D LDR 将其遮住，然后松开。用环境光滑块探索开关阈值附近的区域。',
      observe: '遮住传感器会降低仿真读数并点亮小夜灯。松开后恢复环境光水平。在这个理想化演示中，4095 中的 1200 约占输入量程的 29%。',
      why: '黑暗时阻值更大，向 3.3 V 的“拉力”更弱，因此固定电阻把分压电压拉低。代码把这个数字与阈值比较；该数字本身并不是经过校准的照度读数。'
    },
    troubleshooting: ['LED 在强光下点亮：检查分压的哪个元件接到了 3V3。如果你故意对调了它们，也要反转比较条件。', 'LED 在阈值附近闪烁：可对多个采样求平均，或增加分开的开/关阈值。让传感器接线尽量短，并确保接地可靠。'],
    takeaway: '当你知道传感器读数的变化方向，并根据测量选定判断阈值时，它才真正有用。'
  },
  distance: {
    interaction: '拖动障碍物，使其靠近或远离传感器。',
    concepts: [
      { title: '测量时间，推算距离', text: 'ESP32 向 Trig 发送一个 10 µs 的脉冲。HC-SR04 发出超声波，并把 Echo 保持为 HIGH 一段时间，时长与往返路程相关。室温下声音每微秒传播约 0.0343 cm。由于声音是往返的，需要除以二。' },
      { title: '保证 Echo 电压安全', text: '标准 HC-SR04 以 5 V 工作，并输出 5 V 的 Echo 信号。2.2 kΩ 上臂和 3.3 kΩ 下臂电阻构成分压：5 × 3.3 / (2.2 + 3.3) = 3.0 V。该电平适合 ESP32 输入；直接接 5 V 则不行。' },
      { title: '数据缺失不等于距离为零', text: 'pulseIn(ECHO, HIGH, 30000) 最多等待 30,000 µs。如果没有有效脉冲到来，它返回零，示例会打印“No echo”。柔软、倾斜或较远的物体可能无法返回有效的反射。程序应把这种情况与“近处有障碍物”分开处理。' }
    ],
    experiment: {
      prediction: '把障碍物从 20 cm 移到 40 cm，回波的传播时间会发生什么变化？',
      action: '运行仿真并在场景中拖动障碍物。用距离控件比较 20 cm、40 cm 和 80 cm，再查看串口场景下的读数。',
      observe: '报告的距离随障碍物变化。距离翻倍时，真实回波时长也大约翻倍：20 cm 时约 1166 µs，40 cm 时约 2332 µs。',
      why: '在相同条件下声速近似恒定，因此距离与传播时间成正比。浏览器演示展示了这一关系；真实测量还受温度、物体形状和反射的影响。'
    },
    troubleshooting: ['每次读数都是“No echo”：检查 5 V 电源、共地以及 Trig/Echo 的接线。确认你的模块接受 3.3 V 触发信号。', '读数跳变或看起来不合理：对准传感器量程内平整坚硬的表面，两次测距之间留出间隔，并检查 Echo 分压电路的接线。'],
    takeaway: '传感器测量的是往返时间。正确的计算、电压转换以及对回波丢失的处理，都是得到有效距离读数的必要环节。'
  },
  sound: {
    interaction: '点击压电片可改变音调，拖动可微调。',
    concepts: [
      { title: '频率是波每秒重复的次数', text: '440 Hz 的信号每秒重复 440 次。小型无源压电片会随这种变化的电压弯曲振动并发声。提高频率会升高音调；频率翻倍使音调升高一个八度，并不只是音量翻倍。' },
      { title: '选择合适的发声元件', text: '无源压电片需要 ESP32 提供变化的信号。有源蜂鸣器自带振荡器，通电后往往只发出一个固定音调。低阻抗扬声器或大电流蜂鸣器需要驱动电路；不要直接把它们替换到这个小功率压电片电路中。' },
      { title: '先配置一次，再选择音调', text: 'ledcAttach(PIEZO_PIN, 2000, 8) 先创建一个 PWM 输出，初始设置为 2000 Hz、8 位分辨率。下一次调用 ledcWriteTone(PIEZO_PIN, FREQUENCY_HZ) 会把它改为所选的音调频率；频率并不局限于 2000 Hz。loop() 等待期间，外设持续输出该音调。向 ledcWriteTone() 传入零即可停止。' }
    ],
    experiment: {
      prediction: '880 Hz 听起来与 440 Hz 相比如何？',
      action: '在设置中开启声音，启动仿真并点击或拖动压电片以改变音调。用滑块比较 440 Hz 与 880 Hz。关闭声音时，可观察显示的频率。',
      observe: '频率越高，音调越高。两个测试音相差一个八度。可视化的振动仅为示意，被放慢或简化以便你观察响应。',
      why: '耳朵把振动频率理解为音调。浏览器给出可听的演示，硬件示例则用 LEDC 驱动无源压电片。两者都以频率作为控制变量。'
    },
    troubleshooting: ['浏览器没有声音：开启“声音”，并通过点击或触摸启动仿真，以允许浏览器开始播放音频。', '真实蜂鸣器只发一个音调：确认它是无源压电片，检查 GPIO25 和 GND，并确认你选用的器件适合该驱动电路。'],
    takeaway: '音调频率控制音高，音符时长控制节奏。它们在程序中是相互独立的选择。'
  },
  piano: {
    interaction: '按住琴键即演奏，松开即停止音符。',
    mapping: [
      { key: 'C4', gpio: 'GPIO13', index: 0, frequency: '262 Hz' },
      { key: 'D4', gpio: 'GPIO14', index: 1, frequency: '294 Hz' },
      { key: 'E4', gpio: 'GPIO16 / RX2', index: 2, frequency: '330 Hz' },
      { key: 'F4', gpio: 'GPIO17 / TX2', index: 3, frequency: '349 Hz' },
      { key: 'G4', gpio: 'GPIO18', index: 4, frequency: '392 Hz' },
      { key: 'A4', gpio: 'GPIO19', index: 5, frequency: '440 Hz' },
      { key: 'B4', gpio: 'GPIO21', index: 6, frequency: '494 Hz' },
      { key: 'C5', gpio: 'GPIO22', index: 7, frequency: '523 Hz' }
    ],
    concepts: [
      { title: '数组把相关的值放在一起', text: 'keys[] 按顺序存放八个 GPIO 编号，notes[] 存放对应的八个频率。索引 0 对应第一个琴键和 262 Hz；索引 7 对应最后一个琴键和 523 Hz。修改 notes 数组即可改变音阶，无需重写输入逻辑。' },
      { title: '扫描输入并做出单一选择', text: 'for 循环逐个检查每个 INPUT_PULLUP 按钮是否为 LOW。一旦找到，就保存对应的频率并跳出循环。因此若同时按住多个键，靠前的键优先。这是单音乐器：一次只播放一个音符。' },
      { title: '静音也是一种状态', text: '每一轮循环都以 frequency = 0 开始。如果没有按钮按下，这个零值传给 ledcWriteTone() 就会停止发声。若没有明确的“松开”状态，演奏者松手后前一个音符可能会持续。短暂的延时限制循环的重复频率。' }
    ],
    experiment: {
      prediction: '松开最后按住的琴键时，程序必须向压电片发送什么？',
      action: '开启声音，运行仿真并逐个按住 3D 琴键。音符之间松开，然后弹奏第一个 C 和另一端更高的 C。面板上的琴键也可以用来操作。',
      observe: '按住琴键会选择其频率，松开则停止音符。高音 C 的频率约为低音 C 的两倍，因此两者相差一个八度。',
      why: '琴键本身并不包含发声器。程序把它的输入映射到频率数组中的某个数值，再把这个数值送给唯一的压电片输出。回到零即产生静音。'
    },
    troubleshooting: ['实物上的音符一直不停：确认按钮松开时变为 HIGH，且每轮循环都会把 frequency 重置为零。', '弹错了琴键：检查两个数组的顺序是否一致，以及每个按钮是否把分配的 GPIO 接到 GND，而不是接到其他输入。'],
    takeaway: '好用的输入界面需要明确的按下、保持和松开行为。数组和循环让同一套逻辑可以扩展到许多按钮。'
  },
  motor: {
    interaction: '拖动电机可调整其驱动占空比。',
    concepts: [
      { title: 'GPIO 给的是指令，不是电机电源', text: 'MOSFET 是一种在此用作电子开关的三极管。它的栅极（G）是控制输入，漏极（D）朝向电机负极，源极（S）朝向地。请以具体封装或转接板的引脚图为准，不要假定引脚顺序。对于堵转电流 ≤300 mA 的 3 V 示例电机，使用 2×AA 电池盒、AO3400A G/D/S 转接板和 1N5819 二极管。栅极电阻为 100 Ω，下拉电阻为 10 kΩ。完整接线见步骤指南。' },
      { title: '电感让电流持续流动', text: '电机绕组把能量储存在磁场中。突然关断可能产生很大的电压尖峰。续流二极管为这股电流提供通路，其阴极朝向电机正极。共地为 GPIO 的栅极信号提供了有意义的电压参考。' },
      { title: '占空比控制平均驱动', text: '在 20 kHz 下，LEDC 每秒把 MOSFET 开关数千次。DUTY 存放所选数值；255 中的 128 约为 50% 的通电时间。ledcWrite() 施加该值，外设负责维持。实际转速还取决于负载、电源、摩擦和电机特性；占空比百分比并不是实测的转速（RPM）。' }
    ],
    experiment: {
      prediction: 'PWM 占空比为 50% 时，真实电机一定会以最大转速的一半旋转吗？',
      action: '启动仿真并拖动电机改变占空比。比较零、较小占空比和高占空比。观察方向保持不变，而示意转速发生变化。',
      observe: '占空比降低时，模型减速或停止；占空比升高时加速。控件显示的是 PWM 占空比，而不是实测的轴转速。真实电机可能需要一个最小占空比来克服摩擦并启动。',
      why: 'PWM 改变的是平均电气驱动，它并不测量或保证转速。当需要在负载变化时保持精确转速时，需要转速计或编码器以及反馈控制器。'
    },
    troubleshooting: ['电机启动时 ESP32 复位：请使用合适的独立电机电源，保持共地，并检查去耦、接线和堵转电流要求。', '电机或三极管发热：断开电源，检查 MOSFET 的 3.3 V 驱动能力、二极管方向、电机负载以及元件的电流额定值。'],
    takeaway: '把 GPIO 用作控制信号，保护开关电路，并区分请求的驱动与实际测得的运动。'
  },
  temperature: {
    interaction: '拖动温度传感器，体验更暖和更冷的环境。',
    concepts: [
      { title: '数字传感器完成转换', text: 'DHT22 在内部测量温度和相对湿度，并通过一根线发送编码数据。GPIO27 读取的是这种数字通信，而不是测量与温度成比例的模拟电压。DHT 库负责处理时序细节。' },
      { title: '给传感器留出时间', text: '两次读数之间示例至少等待两秒，因为 DHT22 是响应较慢的环境传感器。更快地轮询并不会产生新的信息。真实传感器还需要时间才能与环境空气温度一致；改变浏览器中的数值只是加速的示意。' },
      { title: '使用前先检查数值', text: 'readTemperature() 默认返回摄氏温度；readHumidity() 返回百分比形式的相对湿度。测量失败可能返回 NaN。isnan() 会在打印或做出控制决策之前捕获这种情况，避免把错误误认为零度。' }
    ],
    experiment: {
      prediction: '如果传感器读取失败，用“0 °C”替代缺失的数值是否安全？',
      action: '运行仿真并拖动 DHT22，在较冷与较暖的环境间切换。比较温度读数，然后查看示例代码中的 isnan() 检查。',
      observe: '仿真温度随环境控件变化。硬件代码中有一条单独的“Sensor read failed”分支，而不是假装每次读取都成功。',
      why: '只有有效的测量才能描述真实世界。把数据与错误区分开，可防止加热器、警报器或显示屏对虚构的读数作出反应。真实变化和真实传感器更新都比引导演示要慢。'
    },
    troubleshooting: ['真实草图反复报告读取失败：请核对传感器引脚排列、DHT22 型号、共地以及数据线到 3V3 的上拉电阻。', '数值不立即更新：两次请求之间至少间隔两秒，并给传感器时间适应环境。不要触摸电子部分以免使其升温。'],
    takeaway: '有用的传感包括正确的单位、合适的采样间隔，以及对缺失或无效数据的明确处理。'
  },
  servo: {
    interaction: '拖动舵机摇臂以选择目标角度。',
    concepts: [
      { title: '请求一个位置', text: '航模舵机内含电机、齿轮、位置传感器和控制器。ESP32 通过发送脉冲来请求目标位置，舵机内部的控制器会朝该位置运动。这与直接开关一个裸直流电机不同，后者没有内置的位置控制。' },
      { title: '脉冲宽度有特定含义', text: '示例使用 50 Hz 的帧，即每 20 ms 一个脉冲，配置脉宽为 1000 到 2000 µs。库会把 write(angle) 映射到该脉宽范围。与调节 LED 亮度不同，这个信号传达的是位置，而不是直接设置电机的平均功率。' },
      { title: '目标不等于测量结果', text: 'ESP32 草图接收不到舵机的实际角度。它只发送所请求的位置，实际角度取决于舵机及其校准。运动电流由独立电源承担。先尝试保守的范围，可避免把机构顶到限位。' }
    ],
    experiment: {
      prediction: '如果请求 90°，ESP32 会自动知道摇臂真的到达了 90° 吗？',
      action: '运行仿真，把舵机摇臂从一个目标拖到另一个目标。用目标角度控件比较 20°、90° 和 160°。',
      observe: '示意摇臂会跟随请求的角度。读数描述的是目标，而不是回传给 ESP32 的传感器测量值。真实舵机在负载下可能移动更慢或达不到目标。',
      why: '舵机会闭合自身的内部位置环，但这里使用的三线接口并不会把实际位置回传给草图。要实现精确定位，仍需机械校准。'
    },
    troubleshooting: ['开发板复位或舵机抖动：请使用额定参数合适的外部电源，并确保共地可靠。舵机不应从 GPIO 或 3V3 供电轨获取运动电流。', '摇臂顶住限位嗡嗡作响：断开电源，减小角度或脉宽范围。扩大扫描范围前请查看该舵机的具体限位。'],
    takeaway: '舵机控制通过脉宽发送目标。安全的电源和校准过的机械限位，与请求的角度同样重要。'
  },
  stepper: {
    interaction: '点击步进电机可把目标推进 45°，拖动则可直接选择。',
    concepts: [
      { title: '旋转磁场', text: 'ULN2003 驱动器按顺序切换电机线圈，把转子从一个位置拉到下一个位置。ESP32 提供四路控制信号，外部电源为线圈供电。库中的 16、18、17、19 顺序与这种接法的相序一致。' },
      { title: '把步数转换为角度', text: '28BYJ-48 的齿轮把内部的高速旋转减速为较慢的输出。在这个四拍示例中，2048 步约等于输出轴一圈，因此约 512 步为四分之一圈。实际减速比各有差异。半步控制的每圈步数则不同。' },
      { title: '谨慎计步', text: 'TARGET_DEGREES 被转换为步数，由 motor.step() 在 setup() 中执行一次。这是相对当前起始位置的移动。每次复位或上传都会再次运行 setup()，从而再移动一次；草图没有原点参考。之后线圈保持通电。没有位置反馈，程序无法检测堵转或丢步。' }
    ],
    experiment: {
      prediction: '按示例的 2048 步模型，转 90° 大约需要多少步？',
      action: '运行仿真并点击步进电机，使目标以 45° 为步长推进。拖动或使用滑块比较四分之一圈、半圈和整圈。',
      observe: '目标角度按受控方向推进。在示例模型中，90° 约对应 512 步，180° 约对应 1024 步。角度控件改变的是目标，而不是速度。',
      why: '软件把期望的旋转转换为一系列步。只有在电机跟随该序列时，计步才有效；真实机构需要足够的扭矩，并在必要时配备原点开关或位置反馈。'
    },
    troubleshooting: ['电机只振动不转动：检查 IN1–IN4 的接线和库的 1-3-2-4 构造函数顺序。同时确认电机与电源电压匹配。', '最终位置有偏差：降低速度或负载，并核对实际减速比。草图本身无法检测丢步。'],
    takeaway: '步进定位是一连串被计数的指令。只有当电机能跟随这些指令、且机构有已知参考点时，它才可靠。'
  },
  plant: {
    interaction: '点击土壤或显示屏可改变仿真的湿度水平。',
    snippets: [
      {
        title: '1. 不使用 OLED 读取土壤传感器',
        description: '先上传这段程序，并打开 115200 波特率的串口监视器。在相同探头深度下，分别记录干燥培养土和浇透沥干培养土中的几个稳定读数。把这两个参考值作为综合项目中的 DRY 和 WET。保持传感器电子部分干燥。',
        code: `// 校准不需要 OLED 或显示库。
const int SOIL_PIN = 34;

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);
  analogSetPinAttenuation(SOIL_PIN, ADC_11db);
}

void loop() {
  int raw = analogRead(SOIL_PIN);
  Serial.print("Soil raw reading: ");
  Serial.println(raw);
  delay(500);
}`
      },
      {
        title: '2. 查找 OLED 的 I²C 地址',
        description: '连接 OLED 的电源、地、SDA21 和 SCL22，然后上传这段程序。打开 115200 波特率的串口监视器并按 EN。当 I²C 总线上只有 OLED 时，把报告的地址用于 display.begin()。地址有应答只说明通信正常，并不代表不同的显示芯片兼容 SSD1306。',
        code: `#include <Wire.h>

void setup() {
  Serial.begin(115200);
  delay(500);
  Wire.begin(21, 22);
  Serial.println("Scanning I2C addresses...");
  bool found = false;
  for (uint8_t address = 0x08; address <= 0x77; address++) {
    Wire.beginTransmission(address);
    if (Wire.endTransmission() == 0) {
      Serial.printf("Device at 0x%02X\\n", address);
      found = true;
    }
  }
  if (!found) {
    Serial.println("No devices replied. Check power and wiring.");
  }
}

void loop() {
  delay(1000); // 按 EN 再次扫描。
}`
      }
    ],
    concepts: [
      { title: '先校准，再接显示屏', text: '运行综合项目前，先用下面这段仅用串口的校准草图。在相同插入深度下，记录干燥培养土和刚浇透并沥干培养土中的稳定读数，把这些不同的数值填入 DRY 和 WET。示例中的 3000 和 1300 只是占位值，并不是你探头的实测值。即使 OLED 不存在或初始化失败，这段独立草图也能工作。' },
      { title: '映射、约束、判断', text: 'map(raw, DRY, WET, 0, 100) 把两个参考读数转换为相对百分比。constrain() 把超出区间的值限制在 0–100。低于 30% 时，示例会提示你检查土壤。这个百分比既不是含水量的绝对测量值，也不是通用的浇水规则。' },
      { title: '先寻址屏幕，再发送画面', text: 'I²C 即 Inter-Integrated Circuit，是一种共享的两线通信总线。SDA 在 GPIO21 上承载数据，SCL 在 GPIO22 上承载时钟。0x3C 是以十六进制表示的器件地址，不是引脚号。下面的扫描程序会检查哪个地址有应答。clearDisplay()、setCursor() 和 print() 把内容绘制到内存缓冲区，display.display() 再把完成的缓冲区发送到 OLED。' }
    ],
    experiment: {
      prediction: '当 DRY = 3000、WET = 1300 时，原始读数下降会使显示的湿度百分比上升还是下降？',
      action: '运行仿真并点击土壤或 OLED，逐步切换仿真湿度水平。用滑块比较 20%、30% 和 70%。此控件改变的是模型数值，而不是真实的即时浇水过程。',
      observe: '仿真土壤越湿，相对百分比越高。低于 30% 时提醒你检查土壤；达到 30% 及以上时，示例的消息会改变。',
      why: '因为干燥参考值大于湿润参考值，映射反转了数值方向。消息使用该校准标尺上的一个简单阈值。真实浇水决策需要综合考虑植物、土壤和传感器位置。'
    },
    troubleshooting: ['百分比方向反了，或卡在某个端点：记录实际的干燥/湿润原始值，替换两个常量，并确保 DRY 与 WET 不相同。', 'OLED 一直空白：检查 3.3 V 兼容性、SDA/SCL 接线、I²C 地址以及最后的 display.display() 调用。别让湿度探头的电子部分沾水。'],
    takeaway: '一个有意义的信息面板始于校准，然后把读数转换为标注清晰的相对值，并据此做出有用的决策。'
  },
  force: {
    interaction: '按住压力垫施加压力，松开即移除。',
    concepts: [
      { title: '压力改变电流通路', text: '按下 FSR 的感应区域时，其阻值下降。在分压电路中它位于 10 kΩ 电阻之上，随着压力增大，会把 GPIO34 拉向 3.3 V。ESP32 观察的是这一电压变化，而不是直接的机械力。' },
      { title: '相对值不等于校准值', text: 'FSR 是非线性的，其响应会因接触面积、安装方式和先前受力情况而不同。没有合适的校准模型，原始 ADC 数值不能标注为牛顿。本课特意使用相对压力和 LED 亮度来展示变化趋势。' },
      { title: '选择有用的响应方式', text: '示例把 12 位输入范围映射到 8 位 PWM，因此读数越高，LED 越亮。对于简单的按下检测，阈值可能比连续的亮度值更有用。对多个采样求平均可降低噪声，但响应会稍慢一些。' }
    ],
    experiment: {
      prediction: '松开压力垫时，分压读数应保持高位，还是回到未按下时的水平？',
      action: '启动仿真，按住 3D 压力垫后松开。可在按住时拖动，或用压力控件探索不同的输入水平。',
      observe: '施加压力会提高示意输入值并使 LED 变亮。松开压力垫会移除仿真力，数值回到接近零。这些值始终是相对值，并非声称测得以牛顿为单位的力。',
      why: '压力降低分压上臂电阻，使 ADC 电压升高。松开则过程相反。LED 是输入趋势的输出表示，并不是经过校准的测力计。'
    },
    troubleshooting: ['读数始终不变：检查 FSR 和 10 kΩ 电阻是否构成以 GPIO34 为节点的分压电路，而不是把输入直接接到电源轨上。', '每次按压的读数不同：使用一致的接触表面和安装方式，并考虑求平均。让力度保持在传感器额定范围内。'],
    takeaway: '传感器不必假装精确也能发挥作用。如实标注相对测量值，并选择你的应用所需的响应方式。'
  },
  wifi: {
    interaction: '点击已连接的 LED，发送一个虚拟的开/关请求。',
    concepts: [
      { title: '开发板也能创建网络', text: '在站点模式下，设备加入现有的 Wi-Fi 网络。本示例改用接入点模式：WiFi.softAP("ESP32-Lab") 创建一个你的手机可以加入的本地网络。ESP32 通常使用本地地址 192.168.4.1，无需互联网连接。' },
      { title: '请求变为输出', text: 'WebServer 监听 HTTP 80 端口。请求 / 会显示页面；/on 把 GPIO23 置为 HIGH，/off 把它置为 LOW。页面上的链接会发送这些请求。浏览器并不直接改变引脚，而是由 ESP32 的请求处理函数完成电气变化。' },
      { title: '让服务器保持响应', text: 'server.handleClient() 在 loop() 中反复运行，以处理到来的请求。长时间的阻塞延时会让页面响应变慢。示例网络是开放的，仅用于本地学习；给 softAP() 传入第二个至少 8 个字符的参数即可添加网络密码。' }
    ],
    experiment: {
      prediction: '如果 ESP32 的 Wi-Fi 网络没有连接互联网，手机还能控制这个 LED 吗？',
      action: '运行浏览器仿真，点击 LED 或使用其开/关控件。要体验真实网络，请上传草图，用手机加入 ESP32-Lab 并打开 http://192.168.4.1。',
      observe: '每次虚拟请求都会改变演示中的 LED 状态。在真实开发板上，手机向 ESP32 请求 /on 或 /off，相应的处理函数改变 GPIO23。本网站本身不会连接到你的硬件。',
      why: '整个交互可以完全发生在本地网络内：手机 → HTTP 请求 → ESP32 处理函数 → GPIO 输出。浏览器课程演示了这条路径；真正创建接入点和服务器的是你上传的草图。'
    },
    troubleshooting: ['手机自动离开 ESP32-Lab：即使该网络没有互联网，也要选择保持连接，然后使用数字形式的本地地址。', '页面无法加载或没有响应：确认串口打印的地址，使用 http:// 而不是 https://，并让 server.handleClient() 持续运行，不要有长时间的阻塞任务。'],
    takeaway: '联网项目依然遵循同样的模式：输入、判断、输出。这里的输入以网络请求的形式到来，而不是物理按钮。'
  }
};
for (const lesson of lessons) {
  const { interaction, ...learning } = learningNotes[lesson.id];
  lesson.interaction = interaction;
  lesson.learning = learning;
}

const part = (name, kicker, description, facts, tip) => ({ name, kicker, description, facts, tip });
export const parts = {
  module: part('ESP32-WROOM-32', '大脑', '这个屏蔽罩内是 ESP32 处理器、Flash 存储器和射频电路。你的程序在此运行，并控制开发板周围的引脚。', [spec('CPU', '双核 Xtensa LX6'), spec('时钟', '最高 240 MHz'), spec('SRAM', '片内 520 KB'), spec('典型模组 Flash', '4 MB')], '本课程使用原版 ESP32。ESP32-C3、S3 等其他家庭成员的能力和引脚排列有所不同。'),
  antenna: part('PCB 天线', '无线连接', '模组末端的花纹铜箔负责收发用于 Wi-Fi 和 Bluetooth 的 2.4 GHz 无线电信号。', [spec('Wi-Fi', '802.11 b/g/n, 2.4 GHz'), spec('Bluetooth', 'Classic + Bluetooth Low Energy')], '尽量让金属、导线和外壳远离天线端，以改善无线性能。'),
  usb: part('Micro-USB 接口', '供电 + 编程', 'USB 为开发板供电，并通过 USB 转 UART 桥接芯片传输串口数据。这款原版 ESP32 模组没有原生 USB。', [spec('USB 输入', '5 V'), spec('数据通路', 'USB 转 UART 桥接'), spec('典型桥接芯片', 'CP2102 或 CH340，因板而异')], '仅能充电的线缆只能供电，无法上传代码。请使用支持数据传输的线缆。'),
  regulator: part('3.3 V 稳压器', '稳定供电', '稳压器把开发板的 5 V 电源转换为 ESP32 和合适外设所用的 3.3 V 供电轨。', [spec('板载逻辑', '3.3 V'), spec('GPIO 耐压', '不兼容 5 V')], '耗电较大的电机和舵机需要合适的独立电源，并共地。'),
  en: part('EN / 复位按钮', '重新开始', '按下 EN 会把使能线拉低并复位处理器。松开后，你的草图会重新开始运行。', [spec('信号', '芯片使能 / 复位'), spec('效果', '重新运行 setup()')], '复位开发板不会擦除已上传的程序。'),
  boot: part('BOOT 按钮', '上传模式', 'BOOT 把 GPIO0 接地。复位时按住它，可选择用于上传固件的串口下载模式。', [spec('引脚', 'GPIO0'), spec('作用', '启动配置输入')], '如果上传一直停留在“Connecting”，按住 BOOT 直到开始上传，再松开。'),
  power: part('电源引脚', '电源 + 地', '3V3 提供开发板稳压后的逻辑电压。GND 是共同的电气参考点。不同 DevKit 克隆板的 VIN/5V 标注和电源走线各不相同。', [spec('外设逻辑供电轨', '3.3 V'), spec('地', '由所连接的电路共用')], '使用 VIN 或把外部电源与 USB 混用前，请查看你所用开发板的具体原理图。切勿向 GPIO 施加 5 V。'),
  gpio: part('通用 I/O', '连接接口', 'GPIO 引脚读取输入并控制输出。部分引脚还可承载 PWM、模拟输入、I²C、SPI 或 UART 信号。', [spec('逻辑', '0 V / 3.3 V'), spec('GPIO34–39', '仅作输入；无内部上拉电阻'), spec('GPIO6–11', '由模组 Flash 占用'), spec('ADC1', '可在 Wi-Fi 运行时进行模拟读取')], '初学者电路应避开启动配置引脚。GPIO16 和 17 在这块 WROOM 板上可用，但在其他模组上可能被保留。'),
  led: part('LED + 电阻', '看得见的输出', '当电流从阳极流向阴极时，发光二极管就会发光。串联电阻把电流限制在安全范围内。', [spec('示例引脚', 'GPIO23'), spec('串联电阻', '330 Ω'), spec('阳极', '通常引脚较长'), spec('阴极', '通常引脚较短 / 带平边')], '只要保持串联，电阻放在 LED 的任一侧都可以。'),
  button: part('轻触按钮', '数字输入', '按下按钮会接通其开关触点。配合 INPUT_PULLUP 并接地，按下时读数为 LOW。', [spec('示例输入', 'GPIO18'), spec('松开', 'HIGH'), spec('按下', 'LOW')], '机械开关会抖动。把按钮用作计数器或切换开关前，需要加入消抖。'),
  potentiometer: part('电位器', '可调分压器', '旋转的滑动端沿电阻轨道移动。外侧引脚接 3V3 和 GND 时，中间引脚提供可调电压。', [spec('典型阻值', '10 kΩ'), spec('滑动端输入', 'GPIO34 / ADC1'), spec('读取分辨率', '12 bit')], '连接 ESP32 ADC 的分压电路应使用 3.3 V，而不是 5 V。'),
  rgb: part('RGB LED', '三色一体', '独立的红、绿、蓝发光单元可用 PWM 混合。本示例使用共阴极 LED。', [spec('输出', 'GPIO25 / 26 / 27'), spec('电阻', '每种颜色一个'), spec('公共端', 'GND')], '请查看 LED 数据手册确认引脚顺序。共阳极 LED 需要不同的接法和反向控制。'),
  ldr: part('光敏电阻', '光变电阻', '光照增强时，LDR 的阻值下降。固定电阻把这一阻值变化转换为可测量的电压。', [spec('ADC', 'GPIO34'), spec('分压电阻', '10 kΩ'), spec('测量值', '相对光照强度')], '原始 ADC 值并不是勒克斯。请在使用电路的房间里校准开关阈值。'),
  distance: part('HC-SR04 测距传感器', '聆听回波', '一个换能器发出超声波，另一个聆听反射回波。两者的时间差即可得出到物体的距离。', [spec('标准模块供电', '5 V'), spec('Trig / Echo', 'GPIO23 / GPIO34'), spec('Echo 分压', '2.2 kΩ + 3.3 kΩ')], '标准 HC-SR04 输出 5 V 的 Echo 信号。连接到 ESP32 之前，请使用本课所示的分压电路。'),
  buzzer: part('无源压电片', '电压变声音', '压电片会随电压变化而弯曲。以可听频率重复这种运动就会产生音调。', [spec('输出', 'GPIO25'), spec('音调', '由频率决定'), spec('驱动 API', 'ledcWriteTone()')], '小型无源压电片可以使用这个电路。扬声器或大电流蜂鸣器需要合适的驱动器。'),
  motor: part('直流电机 + MOSFET', '受控运动', '三极管切换电机的外部电源。GPIO 控制三极管，并不承载电机电流。', [spec('控制', 'GPIO25 PWM'), spec('驱动器', '3.3 V 逻辑电平 N 沟道 MOSFET'), spec('保护', '续流二极管')], '把电机电源的地与 ESP32 的地相连。选择电源、三极管和二极管时，请查看电机的堵转电流。'),
  temperature: part('DHT22 环境传感器', '感知室内环境', 'DHT22 通过数字数据线报告温度和相对湿度。传感器库负责处理其对时序要求严格的通信。', [spec('数据', 'GPIO27'), spec('此处供电', '3.3 V'), spec('读取间隔', '至少 2 秒')], '裸露的传感器需要在数据线上加上拉电阻。许多转接模块已经内置。'),
  servo: part('航模舵机', '按指令定位', '舵机内含电机、齿轮和反馈电路。重复的控制脉冲告诉它期望的位置。', [spec('信号', 'GPIO18'), spec('脉冲重复频率', '50 Hz'), spec('电源', '外部稳压电源')], '不要强行扳动摇臂，也不要指令超出机构的限位。不同舵机的实际角度范围各不相同。'),
  stepper: part('28BYJ-48 + ULN2003', '计步', '驱动器按顺序给电机线圈通电。齿轮把内部的小步距转换为较慢的输出轴运动。', [spec('输入', 'GPIO16 / 17 / 18 / 19'), spec('电机版本', '5 V'), spec('四拍一圈', '约 2048 步')], '草图只统计请求的步数；没有额外反馈时，它无法检测电机堵转。'),
  oled: part('SSD1306 OLED 显示屏', '代码的小窗口', '这块 128×64 显示屏使用 I²C 总线，因此绘制文字和简单图形只需两根数据线。', [spec('SDA', 'GPIO21'), spec('SCL', 'GPIO22'), spec('常见地址', '0x3C'), spec('此处供电', '兼容 3.3 V 的模块')], '如果屏幕一直空白，请核对其 I²C 地址，并在绘制后调用 display.display()。'),
  fsr: part('力敏电阻', '触觉感知', '按压感应垫会使其阻值减小。分压电路让 ESP32 能检测被按压的强度。', [spec('输入', 'GPIO34 / ADC1'), spec('分压电阻', '10 kΩ'), spec('输出', '相对压力')], '其响应是非线性的，且取决于接触面积。不要把未经校准的 ADC 值标注为以牛顿为单位的力。'),
  wifi: part('Wi-Fi 接入点', '你的开发板，你的网络', 'ESP32 可以创建本地 Wi-Fi 网络并提供网页。连接到该网络的手机可以向开发板发送请求。', [spec('网络', 'ESP32-Lab'), spec('默认地址', '192.168.4.1'), spec('射频频段', '2.4 GHz')], '浏览器课程只是本地场景演示。把草图上传到实物开发板，才能使用真实的 Wi-Fi 网络。')
};
