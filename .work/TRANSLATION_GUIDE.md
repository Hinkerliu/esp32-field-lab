# 翻译约定（ESP32 Field Lab 中文本地化）

## 目标
把站点全部**用户可见文案**翻译为简体中文，保持所有交互功能、代码逻辑、DOM 结构、id/class 名完整不变。

## 必须保留原文（不翻译）
- 代码标识符、变量名、函数名、对象 key、CSS 类名、HTML id、data-* 属性名
- 电气/技术专有名词的通用写法：ESP32、GPIO、Wi-Fi、Bluetooth、BLE、I2C、SPI、PWM、ADC、DAC、UART、USB、LED、OLED、GND、VCC、3V3、5V、A0、DIN、DOUT、SCK、SDA、SCL、CS、MOSI、MISO、TX、RX、Hz、kHz、MHz、mA、V、Ω、kΩ、µF、BAT、LDO、EN、BOOT、SoC、CPU、SRAM、Flash、RTC、DMA、PWM、Servo、Stepper
- 引脚丝印与元件型号：DOIT ESP32 DEVKIT V1、ESP32-WROOM-32、INMP441、HC-SR04、BTHome 等
- 品牌名与链接地址、 license 文本
- 代码字符串字面量中用于程序逻辑的值（如 `Serial.println("Hello, ESP32!")` 里的输出文本可视情况翻译，但不得改动引号/转义/API 调用）

## 应当翻译
- 界面按钮、导航、tooltip、aria-label、title、提示语、对话框、toast
- 16 课的全部正文：title、shortTitle、category、description、objectives、steps、wiring 注释、explanation、specs 的 label、concepts、experiment 各字段、challenge、question 的 text/options/explanation、troubleshooting、takeaway、interaction
- guides.js 中的引导文案、步骤说明
- build*.js 中的项目说明、元件清单、装配说明、验证提示
- scene.js / diagrams.js 中面向读者的说明性文字与 callout（引脚标签保持缩写）
- 代码注释（`//` 与 `/* */`）译成中文，但保持注释符号与代码
- README.md 的说明文字（保留代码块与命令）

## 风格
- 简洁、准确、教程口吻；使用「你」而非「您」
- 单位与数字之间加空格：3.3 V、115200 baud、5 min → 5 分钟
- 首次出现的技术术语可写「中文（English）」，之后用中文
- 中文句号「。」，逗号「，」，冒号「：」
- 不要改变字符串中的占位符（如 `${x}`、`%s`、`\n`）与模板插值

## 硬性要求
- 只改字符串字面量与注释/文案，绝不改动任何语法结构、变量名、函数名、属性名
- 每个文件改完立即 `node --check <file>`（JS）确认语法通过
- 禁止翻译 CSS/JS 中作为程序键的字符串（如 `data-tab="overview"`、`role="tab"`、枚举值 `'success'`/`'warning'`）
- HTML 的 `lang="en"` 改为 `lang="zh-CN"`，`<title>` 与 meta description 翻译
