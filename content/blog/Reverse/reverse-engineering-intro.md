---
title: "逆向工程入门指南"
description: "从零开始学习逆向工程的基本工具和方法"
author: your-name
date: 2024-05-10
tags: [reverse, ida, ghidra, assembly]
category: Reverse
type: note
draft: false
difficulty: easy
status: published
---

## 概述

逆向工程是安全研究的基础技能之一。本文介绍入门所需的基本工具和方法。

## 常用工具

- **IDA Pro / Ghidra**：静态反汇编和反编译
- **x64dbg / GDB**：动态调试
- **dd**：十六进制编辑器

## 基本流程

1. **信息收集**：`file` 命令查看文件类型
2. **静态分析**：导入 IDA，查看函数列表和字符串
3. **动态分析**：在关键函数下断点，跟踪数据流

## 示例

```asm
main:
    push    rbp
    mov     rbp, rsp
    sub     rsp, 16
    mov     DWORD PTR [rbp-4], edi
    mov     QWORD PTR [rbp-16], rsi
```

以上是一个典型的 x86_64 函数序言。

## 总结

逆向工程需要大量实践，建议从简单的 CrackMe 开始练习。
