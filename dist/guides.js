// 针对原版 30 引脚 ESP32 DevKit V1 的入门引导。
// targets 描述的是语义上的元件和引脚，而不是面包板孔位坐标。
// `connection` 指 lesson.wiring 中从零开始计数的行；多个步骤可能
// 解释同一条连接的不同细节。
const step = (id, title, text, targets, view = 'connection', connection) => ({
  id, title, text, targets, view,
  ...(Number.isInteger(connection) ? { connection } : {})
});

export const guides = {
  board: [
    step('board-usb', '从 USB 接口开始', '这个小接口用于插入 Micro-USB 数据线。数据线从电脑获取电源，并传输程序上传和消息。请使用支持数据传输的数据线：有些充电线只能供电，无法上传程序。', ['part:usb'], 'usb', 0),
    step('board-ground', 'GND 是共用的零电位', 'GND 表示接地：这是电路的公共 0 V 参考点和回流路径。把元件的接地端连接到 GND 引脚，这样它和 ESP32 对“零伏”的含义才能达成一致。它和信号引脚不是一回事。', ['pin:GND'], 'board', 1),
    step('board-power', '3V3 为小型元件供电', '3V3 表示 3.3 伏。这个电源引脚为合适的低功耗传感器供电；当程序调用 digitalWrite() 时，它的电压不会改变。稳压器从 USB 电源产生这条供电轨。GPIO 输入同样使用 3.3 V 逻辑电平，但它们是独立的引脚，不能承受 5 V。', ['pin:3V3', 'part:regulator'], 'board', 2),
    step('board-signal', '带编号的 GPIO 传输信号', 'GPIO 表示通用输入/输出。程序可以读取或控制 GPIO：以 GND 为参考，HIGH 约为 3.3 V，LOW 约为 0 V。“GPIO23”指的是标有 23 的引脚，而不是排针上的第二十三个位置。', ['pin:23', 'part:module', 'pin:GND'], 'board')
  ],
  blink: [
    step('blink-output', '找到 GPIO23 和电阻', 'GPIO23 是受控输出。通过一个 330 Ω 电阻把它连接到 LED 的正极引脚（称为阳极）。电阻用于限流；LED 不能直接跨接在输出和地之间而不加限流措施。', ['pin:23', 'component:resistor:330', 'component:led'], 'connection', 0),
    step('blink-return', '为 LED 提供回流路径', '把 LED 的负极引脚（阴极）连接到 GND。它通常是 LED 本体平边旁那条较短的引脚。接地让电流路径回到开发板；如果把 LED 接反，它通常不会亮。', ['component:led', 'pin:GND'], 'connection', 1),
    step('blink-cycle', '观察一次完整的闪烁', '启动仿真，点按 LED 来改变时序。GPIO23 为 HIGH 时 LED 点亮，为 LOW 时熄灭。一次完整的闪烁包括点亮时间和熄灭时间。串联电阻始终留在电路中。', ['pin:23', 'component:led', 'component:resistor:330', 'pin:GND'], 'circuit')
  ],
  button: [
    step('button-input', '用 GPIO18 作为输入', '把 GPIO18 连接到按键的开关一侧。程序中的 INPUT_PULLUP 会让未按下时的输入保持稳定 HIGH。对于这个按键电路，这个内部上拉替代了单独的外接电阻。', ['pin:18', 'component:button'], 'connection', 0),
    step('button-ground', '按下时接地', '把开关的另一侧连接到 GND。按下按键时会把 GPIO18 接地，因此输入读到 LOW。很多四脚按键同一侧的两只脚内部已经相连；要选择只在按下时才导通的触点。', ['component:button', 'pin:GND'], 'connection', 1),
    step('button-indicator', '为 LED 使用独立的输出', 'GPIO23 通过一个 330 Ω 电阻驱动指示灯。LED 的阴极回到 GND。GPIO18 读取按键，GPIO23 控制灯。程序用“是否按下”这个条件把这两件事联系起来。', ['pin:23', 'component:resistor:330', 'component:led', 'pin:GND'], 'connection', 2),
    step('button-try', '按住，然后松开', '启动仿真并按住按键。观察输入变为 LOW，同时 LED 点亮。松开后恢复 HIGH，LED 熄灭。LOW 描述的是电平；“按下”描述的是这个电平在此接法中的含义。', ['component:button', 'component:led', 'pin:18'], 'circuit')
  ],
  potentiometer: [
    step('pot-power', '为两个外侧端子供电', '把电位器的一个外侧端子接到 3V3，另一个接到 GND。这两个端子是电阻轨道的两端。这里要用 3.3 V，因为中间端子将接入 ESP32 的输入。', ['pin:3V3', 'pin:GND', 'component:potentiometer'], 'connection', 0),
    step('pot-wiper', '读取中间端子', '中间端子是滑动端：转动旋钮会改变它相对于两端的电压。把它连接到 GPIO34。模数转换器（ADC）会把这个变化的电压转换成数字。GPIO34 只能作为输入，不能驱动 LED。', ['component:potentiometer', 'pin:34'], 'connection', 1),
    step('pot-output', '把结果发送给 LED', '把 GPIO23 经 330 Ω 电阻和 LED 连接到 GND。脉冲宽度调制（PWM）会快速开关这个输出。占空比指的是处于高电平的时间比例。程序把输入的数字映射为这个比例，从而让 LED 变亮或变暗。', ['pin:23', 'component:resistor:330', 'component:led', 'pin:GND'], 'connection', 2),
    step('pot-try', '把旋钮位置变成亮度', '启动仿真并拖动旋钮。跟随这条链路：旋钮位置改变电压，ADC 把电压变成数字，PWM 再把数字变成亮度。真实的 ADC 读数会有噪声，并且可能在达到 3.3 V 之前就到达量程上限。', ['component:potentiometer', 'pin:34', 'component:led'], 'circuit')
  ],
  rgb: [
    step('rgb-red', '让红色拥有独立通路', '通过一个 330 Ω 电阻把 GPIO25 连接到共阴极 RGB LED 的红色阳极。一个 RGB 封装里有三个发光体。请查阅数据手册确认引脚顺序；仅凭外形无法判断哪只脚是红色。', ['pin:25', 'component:resistor:330', 'component:rgb'], 'connection', 0),
    step('rgb-green', '加入绿色通道', '通过第二个 330 Ω 电阻把 GPIO26 连接到绿色阳极。每种颜色都需要自己的电阻，因为三个发光体的电气特性不同。程序可以独立于红色来改变这个通道。', ['pin:26', 'component:resistor:330', 'component:rgb'], 'connection', 1),
    step('rgb-blue', '加入蓝色通道', '通过第三个 330 Ω 电阻把 GPIO27 连接到蓝色阳极。程序根据所选色相计算出三个亮度值。色相角是一种颜色选择，并不是发送到某个引脚的电压。', ['pin:27', 'component:resistor:330', 'component:rgb'], 'connection', 2),
    step('rgb-ground', '把共阴极接到 GND', '共阴极是三个发光体共用的负极连接。把它接到 GND。本指南假设使用的是共阴极器件；共阳极 LED 需要不同的接法，并且亮度控制要反过来。', ['component:rgb', 'pin:GND'], 'connection', 3),
    step('rgb-try', '混合三种光', '运行仿真，点按 RGB LED 来改变颜色，或拖动以连续改变色相。红光和绿光叠加可以呈现黄色。看到的颜色来自三条独立电流通路的共同作用。', ['component:rgb', 'pin:25', 'pin:26', 'pin:27'], 'circuit')
  ],
  light: [
    step('light-upper', '从 3V3 开始搭建分压电路', '把光敏电阻（LDR）接在 3V3 和 GPIO34 的连接点之间。光线越亮，它的阻值越低。3V3 引脚为分压电路供电；GPIO34 只测量中间点的电压。', ['pin:3V3', 'component:ldr', 'pin:34'], 'connection', 0),
    step('light-lower', '完成到地的分压电路', '把一个 10 kΩ 电阻从 GPIO34 连接点接到 GND。LDR 和这个固定电阻对电源电压进行分压。在这种接法下，光线越亮，测得的电压越高；遮住传感器则电压降低。', ['pin:34', 'component:resistor:10k', 'pin:GND'], 'connection', 1),
    step('light-output', '连接小夜灯输出', 'GPIO23 通过一个独立的 330 Ω 电阻驱动 LED 接到 GND。不要把这只限流电阻和 10 kΩ 的传感器电阻混淆。当光照读数低于阈值时，程序会点亮 LED。', ['pin:23', 'component:led', 'component:resistor:330', 'pin:GND'], 'connection', 2),
    step('light-try', '遮住传感器', '运行仿真，然后按住 LDR 把它遮住。输入下降，小夜灯点亮。松开后恢复环境光。真实电路需要根据实际环境中的读数来选定阈值。', ['component:ldr', 'component:led', 'pin:34'], 'circuit')
  ],
  distance: [
    step('distance-power', '按额定电压给传感器供电', '标准的 HC-SR04 需要 VCC 接 5 V、GND 接地。请使用合适的 5 V 电源，并把它的地与 ESP32 的 GND 相连。传感器需要 5 V 供电，并不意味着 ESP32 的 GPIO 引脚能承受 5 V。', ['component:distance', 'component:supply', 'pin:GND'], 'connection', 0),
    step('distance-trigger', '从 GPIO23 发送触发信号', '把 GPIO23 连接到 Trig。一个短脉冲会请求传感器发射超声波。大多数 HC-SR04 模块能接受 3.3 V 的触发信号；如果你的模块没有响应，请查阅其规格说明。', ['pin:23', 'component:distance'], 'connection', 1),
    step('distance-echo', '先降低 Echo 信号电压', 'Echo 端子可能输出 5 V，因此不要直接接到 GPIO34。在 Echo 和 GPIO34 连接点之间串入一个 2.2 kΩ 电阻。这是两电阻分压电路的上半部分。', ['component:distance', 'component:resistor:2.2k', 'pin:34'], 'connection', 2),
    step('distance-divider', '完成保护性分压电路', '把一个 3.3 kΩ 电阻从 GPIO34 连接点接到 GND。两个电阻合在一起把 5 V 的 Echo 信号降到约 3 V。GPIO34 读取这个安全信号；它只能作为输入，无法产生触发信号。', ['pin:34', 'component:resistor:3.3k', 'pin:GND'], 'connection', 3),
    step('distance-try', '移动障碍物', '运行仿真，拖动障碍物靠近或远离。真实传感器测量声音的往返时间，再把传播距离除以二。没有收到回波表示测量缺失，并不能证明距离为零。', ['component:distance'], 'circuit')
  ],
  sound: [
    step('sound-signal', '驱动一个小型无源蜂鸣片', '通过 100 Ω 把 GPIO25 连接到小型无源蜂鸣片的正极端。变化的输出使它振动。这个例子并不是用于直接驱动低阻抗扬声器或大电流蜂鸣器的电路。', ['pin:25', 'component:resistor:100', 'component:buzzer'], 'connection', 0),
    step('sound-return', '把它的负极端接到 GND', '蜂鸣片的另一端子回到 GND，构成完整的电信号通路。要发出可选音高的音符，请使用无源蜂鸣片。有源蜂鸣器自带振荡器，通电后通常只发出固定音高。', ['component:buzzer', 'pin:GND'], 'connection', 1),
    step('sound-try', '听频率如何变成音高', '启用 Sound（声音），运行仿真，点按或拖动蜂鸣片来改变频率。频率越高，听起来音高越高；把 440 Hz 加倍到 880 Hz，音高会升高一个八度。给 ledcWriteTone() 传入零会停止真实的声音。', ['component:buzzer', 'pin:25'], 'circuit')
  ],
  piano: [
    step('piano-first', '连接前四个琴键', '把 C、D、E、F 四个按键分别接在 GPIO13、GPIO14、GPIO16、GPIO17 与 GND 之间。每个输入都使用 INPUT_PULLUP，因此按住琴键时读到 LOW。在这块开发板上，GPIO16 和 GPIO17 可能标注为 RX2 和 TX2。', ['pin:13', 'pin:14', 'pin:16', 'pin:17', 'pin:GND', 'component:piano'], 'connection', 0),
    step('piano-second', '为其他琴键分配独立输入', '把 G、A、B 和高音 C 分别接到 GPIO18、GPIO19、GPIO21 和 GPIO22，每个都通过各自的按键接到 GND。地线是共用的，但八路信号输入彼此独立，这样程序才能识别按下的琴键。', ['pin:18', 'pin:19', 'pin:21', 'pin:22', 'pin:GND', 'component:piano'], 'connection', 1),
    step('piano-output', '共用一个声音输出', '通过 100 Ω 把 GPIO25 连接到小型无源蜂鸣片，再把它的另一端子接到 GND。所有琴键都选择这同一个输出的频率。这个例子一次只播放一个音符，而不是给每个琴键配一个蜂鸣器。', ['pin:25', 'component:resistor:100', 'component:buzzer', 'pin:GND'], 'connection', 2),
    step('piano-try', '按住一个琴键聆听', '启用 Sound（声音）并运行仿真。按住一个 3D 琴键，然后松开。notes 数组把每个输入映射为一个频率；松开琴键后输出恢复静音。第一个 C 和最后一个 C 相差一个八度。', ['component:piano', 'component:buzzer'], 'circuit')
  ],
  motor: [
    step('motor-gate', '把控制信号送到晶体管', 'GPIO25 通过 100 Ω 连接到 G，即 MOSFET 的栅极（控制端）。再加一个 10 kΩ 电阻从 G 接地，使它在未被驱动时保持关断。示例使用的是带 G/D/S 标注端子的 AO3400A 转接板，适合 3.3 V 的栅极信号。', ['pin:25', 'component:driver', 'component:resistor:100', 'component:resistor:10k', 'pin:GND'], 'connection', 0),
    step('motor-ground', '共用接地参考', '把 S（MOSFET 的源极）连接到电机电源的地和 ESP32 的 GND。栅极信号正是以这个零伏参考点来测量的。电机的大电流应通过电源线回流，而不是经过 GPIO 引脚。', ['component:driver', 'component:supply', 'pin:GND'], 'connection', 1),
    step('motor-drain', '让晶体管切换电机电流', '把电机负极接到 D（MOSFET 的漏极）。晶体管负责接通或断开这条电流通路。请遵循转接板上的标注和厂商的引脚图，包括图示的观察方向；不同封装的栅极、漏极和源极位置各不相同。', ['component:motor', 'component:driver'], 'connection', 2),
    step('motor-supply', '单独为电机供电', '把电机正极接到与其电压和启动电流相匹配的电源。示例使用一台 3 V 电机，其规定的堵转电流不超过 300 mA，并配一个 2×AA 电池盒（约 3 V）。ESP32 仍由 USB 供电。切勿用 GPIO25 或 3V3 给电机供电。', ['component:motor', 'component:supply'], 'connection', 3),
    step('motor-diode', '为储存的电流提供安全通路', '在电机两端并联续流二极管。示例用的 1N5819 上，色环所标的一端是阴极：把这一端接到电机正极，另一端接到 D。它负责处理关断后线圈里的电流。然后运行仿真并拖动电机，探索占空比。', ['component:diode', 'component:motor', 'component:driver'], 'connection', 3)
  ],
  temperature: [
    step('temperature-power', '用 3V3 给传感器供电', '把 DHT22 的电源端子（通常称为 VCC）接到 3V3。VCC 表示传感器的正电源连接。请查看你手上的裸传感器或转接模块的引脚图；其端子顺序可能与其他版本不同。', ['pin:3V3', 'component:temperature'], 'connection', 0),
    step('temperature-data', '为数据线设置空闲电平', '把 DHT22 的数据线接到 GPIO27。裸传感器还需要在数据线与 3V3 之间接一个 10 kΩ 上拉电阻；有些模块已经内置。这个引脚传输的是数字信息，而不是与温度成正比的模拟电压。', ['pin:27', 'pin:3V3', 'component:resistor:10k', 'component:temperature'], 'connection', 1),
    step('temperature-ground', '连接传感器的接地', '把 DHT22 的 GND 端子接到 ESP32 的 GND，使电源和数据共用零伏参考点。在四脚裸 DHT22 上，空闲的那个端子不能代替 GND。请遵循其数据手册。', ['component:temperature', 'pin:GND'], 'connection', 2),
    step('temperature-try', '改变周围温度', '运行仿真，拖动传感器来体验更热或更冷的环境。浏览器会改变一个模型数值。真实的 DHT22 响应较慢，两次读取应至少间隔两秒；读取失败的情况需要单独处理。', ['component:temperature', 'pin:27'], 'circuit')
  ],
  servo: [
    step('servo-signal', '通过 GPIO18 发送位置指令', '把 GPIO18 连接到舵机的信号线。程序发送的脉冲，其宽度代表请求的目标位置。这根线只传递指令，不提供电机转动所需的电流。请查看舵机的接头和引线颜色。', ['pin:18', 'component:servo'], 'connection', 0),
    step('servo-power', '用合适的电源为转动供电', '把舵机的正电源线接到与其额定值匹配的稳压外部电源，SG90 通常是 5 V。电源必须能提供转动电流。不要用 ESP32 的 GPIO 或 3V3 引脚给舵机供电。', ['component:supply', 'component:servo'], 'connection', 1),
    step('servo-ground', '把两地线相连', '把舵机的地线和外部电源的地接到 ESP32 的 GND。这为位置脉冲提供共同的电压参考。即使正电源是独立的，也仍需这根地线连接，控制信号才有意义。', ['component:servo', 'component:supply', 'pin:GND'], 'connection', 2),
    step('servo-try', '选择安全的目标角度', '运行仿真，拖动舵盘选择角度。读数显示的是请求的目标值，而不是实测反馈。在真实硬件上，先从保守的角度范围开始，并在到达机械限位前停止；切勿强行让舵盘顶住齿轮。', ['component:servo', 'pin:18'], 'circuit')
  ],
  stepper: [
    step('stepper-first', '连接驱动器的前几个输入', '把 GPIO16 和 GPIO17 连接到 ULN2003 板的 IN1 和 IN2。这些是低电流控制信号。在这块 DevKit 上，GPIO16 可能标注为 RX2，GPIO17 为 TX2；程序按它们的 GPIO 编号使用。', ['pin:16', 'pin:17', 'component:driver'], 'connection', 0),
    step('stepper-second', '连接其余输入', '把 GPIO18 和 GPIO19 连接到 IN3 和 IN4。四路输入让驱动器依次给线圈通电。请保持这里所示的接线顺序；示例中的 Stepper 构造函数特意按 1-3-2-4 的顺序列出引脚。', ['pin:18', 'pin:19', 'component:driver'], 'connection', 1),
    step('stepper-power', '给驱动器供电并共地', '对于 28BYJ-48 的 5 V 版本，把合适的外部 5 V 电源接到驱动器正极，地接到驱动器负极。再把该地与 ESP32 的 GND 相连。线圈电流由驱动器提供，GPIO 引脚不提供。', ['component:supply', 'component:driver', 'pin:GND'], 'connection', 2),
    step('stepper-plug', '把电机插入驱动器', '电机的五线插头插入 ULN2003 上匹配的插座。驱动器位于 ESP32 的小控制信号和电机线圈之间。不要把电机引线直接接到 GPIO 引脚来替代这个连接。', ['component:stepper', 'component:driver'], 'connection', 3),
    step('stepper-try', '计算一次相对移动', '运行仿真，点按步进电机使其目标前进 45°。硬件程序是相对于当前起始位置移动的。复位或上传程序会让它再次移动；它不会回到已知的归零位置。没有反馈时，它无法检测丢步。', ['component:stepper', 'component:driver'], 'circuit')
  ],
  plant: [
    step('plant-sensor-power', '给兼容的湿度传感器供电', '使用额定工作电压为 3.3 V 的电容式传感器。把它的 VCC 接到 3V3，GND 接到开发板的地。这样既能给传感器供电，又能让它的输出适合 ESP32 输入。让电子部分保持在土壤上方，避免进水。', ['pin:3V3', 'pin:GND', 'component:soil'], 'connection', 0),
    step('plant-analog', '读取传感器的模拟输出', '把传感器的模拟输出端子接到 GPIO34。这个只能作为输入的引脚测量的是电压，而不是直接的湿度值。程序把你测得的干燥和湿润参考值转换成相对百分比，因此校准是让读数有意义的一部分。', ['component:soil', 'pin:34'], 'connection', 1),
    step('plant-bus', '通过两根线发送显示数据', '把 GPIO21 连接到 OLED 的 SDA，GPIO22 连接到 SCL。SDA 传输数据，SCL 提供为其计时的时钟。这两根 I²C 信号线让程序可以向显示屏发送文字和图形。', ['pin:21', 'pin:22', 'component:oled'], 'connection', 2),
    step('plant-display-power', '既要接信号也要给屏幕供电', '兼容 3.3 V 的 OLED 还需要把 VCC 接到 3V3、GND 接地。仅接 SDA 和 SCL 并不能给它供电。如果屏幕一直不亮，请核对模块的 I²C 地址，通常是 0x3C。', ['pin:3V3', 'pin:GND', 'component:oled'], 'connection', 3),
    step('plant-try', '跟踪从传感直到屏幕的全过程', '运行仿真，点按土壤或 OLED 来改变模拟湿度。读数被映射到相对刻度，再用来选择显示的信息。真实土壤不会瞬间响应，而且这个百分比并不是含水量的绝对测量值。', ['component:soil', 'component:oled', 'pin:34'], 'circuit')
  ],
  force: [
    step('force-upper', '让压力改变电阻', '把力敏电阻（FSR）接在 3V3 和 GPIO34 连接点之间。按压传感垫会降低其阻值。3V3 引脚为这个电路供电；GPIO34 测量连接点电压，不能驱动输出。', ['pin:3V3', 'component:fsr', 'pin:34'], 'connection', 0),
    step('force-lower', '把电阻变成电压', '在 GPIO34 连接点和 GND 之间接一个 10 kΩ 电阻。FSR 和这个电阻共同构成分压器。压力越大，上方电阻越小，连接点电压就越高。没有这条下方通路，预定的测量电路就不完整。', ['pin:34', 'component:resistor:10k', 'pin:GND'], 'connection', 1),
    step('force-output', '用 LED 显示输入', '把 GPIO23 经 330 Ω 电阻和 LED 接到 GND。程序把输入读数映射为 PWM 亮度。330 Ω 的 LED 电阻和 10 kΩ 的传感器电阻作用不同，不能互换。', ['pin:23', 'component:resistor:330', 'component:led', 'pin:GND'], 'connection', 2),
    step('force-try', '先施加压力，再移除', '运行仿真并按住传感垫。图示读数和 LED 亮度上升；松开即移除压力。把读数当作相对压力：接触面积和安装方式会影响真实的 FSR，因此未经校准的 ADC 值并不是以牛顿为单位的测量结果。', ['component:fsr', 'component:led', 'pin:34'], 'circuit')
  ],
  wifi: [
    step('wifi-output', '从熟悉的 LED 输出开始', '通过 330 Ω 把 GPIO23 连接到 LED 阳极。和闪烁课程一样，电阻仍然起到限流作用。无线控制只是改变了指令的来源；LED 仍需要一个接线正确的输出电路。', ['pin:23', 'component:resistor:330', 'component:led'], 'connection', 0),
    step('wifi-ground', '完成 LED 电路', '把 LED 阴极接到 ESP32 的 GND。无线消息无法替代这条电气回流路径。GPIO23 根据请求处理函数变为 HIGH 或 LOW，只有 LED 电路完整时电流才能流动。', ['component:led', 'pin:GND'], 'connection', 1),
    step('wifi-usb', '先通过 USB 上传程序', '连接一根支持数据传输的 Micro-USB 数据线，以上传程序并给开发板供电。随后 ESP32 会创建自己的本地 Wi-Fi 网络。这里 USB 仅用于初始烧录和供电；手机后续的控制请求通过无线电波传来。', ['part:usb', 'part:module'], 'usb', 2),
    step('wifi-network', '加入开发板的本地网络', '把程序上传到真实硬件后，在手机上加入 ESP32-Lab 网络，并打开 http://192.168.4.1。页面由 ESP32 本身提供，因此这个连接不需要互联网。当手机提示“无互联网”时，请保持连接。', ['part:antenna', 'part:module'], 'board'),
    step('wifi-try', '把请求变成引脚变化', '运行浏览器仿真，点按 LED 发送一个虚拟的开关请求。在真实硬件上，网页请求 /on 或 /off，ESP32 随即改变 GPIO23。本网站只在本地演示这条链路，并不会自动连接到你的实体开发板。', ['part:antenna', 'pin:23', 'component:led'], 'circuit')
  ]
};
