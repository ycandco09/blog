---
title: "glibc堆管理源码分析"
description: "glibc malloc/free 核心实现源码注释版，方便逆向分析时快速查阅"
category: Pwn
type: material
file_path: /materials/Pwn/glibc-heap-analysis.pdf
size: 2.3MB
date: 2024-02-10
tags: [glibc, heap, source-code]
---

# glibc 堆管理源码分析

## 概述

本文档是 glibc malloc/free 核心源码的注释版本。

## 核心函数

- `__libc_malloc()` - 内存分配入口
- `_int_malloc()` - 核心分配逻辑
- `_int_free()` - 核心释放逻辑

## 关键数据结构

详见附件 PDF。
