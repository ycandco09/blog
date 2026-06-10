---
title: "堆溢出利用基础"
description: "本文介绍glibc堆管理器中堆溢出的基本原理与利用方法"
author: your-name
date: 2024-03-15
updated: 2024-06-20
tags: [heap, glibc, pwn, exploitation]
category: Pwn
type: note
slug: heap-overflow-basic
draft: false
difficulty: easy
series: heap-exploitation
order: 1
status: published
featured: true
---

## 概述

堆溢出是二进制漏洞利用中最经典的漏洞类型之一。本文将介绍 glibc 堆管理器的基本原理，以及如何通过堆溢出来实现任意地址写。

## 堆管理器基础

### chunk 结构

在 glibc 中，每个堆块（chunk）都有一个头部结构：

```c
struct malloc_chunk {
    size_t prev_size;
    size_t size;
    struct malloc_chunk *fd;
    struct malloc_chunk *bk;
}
```

### 常用宏

```c
#define PREV_INUSE 0x1
#define IS_MMAPPED 0x2
#define NON_MAIN_ARENA 0x4
```

## 堆溢出原理

当向堆块中写入的数据超过了堆块的实际大小时，就会发生堆溢出：

$$ \text{overflow\_bytes} = \text{write\_size} - \text{chunk\_size} $$

如果 $ \text{overflow\_bytes} > 0 $，就有可能覆盖相邻 chunk 的头部信息。

## 利用技巧

| 技巧 | 难度 | 适用版本 |
|------|------|---------|
| Fastbin Attack | 入门 | < 2.26 |
| Unsorted Bin Attack | 中级 | < 2.29 |
| Tcache Poisoning | 中级 | >= 2.26 |
| House of Force | 困难 | < 2.29 |

### Tcache 攻击示例

```python
# pwntools 示例
from pwn import *

# 分配两个chunk
malloc(0x20)  # chunk A
malloc(0x20)  # chunk B

# 溢出chunk A，覆盖chunk B的fd指针
# 使其指向目标地址
overflow("A" * 0x20 + p64(target_addr))
```

## 防御措施

1. **使用最新版 glibc**：新版本增加了很多安全检查
2. **开启安全编译选项**：Full RELRO, PIE, NX
3. **Safe Unlinking**：glibc 2.26+ 引入

## 总结

堆溢出漏洞的利用需要深入理解堆管理器的内部机制，但随着 glibc 版本的更新，利用难度也在不断增加。
