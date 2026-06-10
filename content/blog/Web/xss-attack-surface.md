---
title: "XSS 攻击面分析"
description: "现代Web应用中XSS攻击面的系统化分析方法"
author: your-name
date: 2024-04-20
tags: [xss, web, security]
category: Web
type: research
draft: false
difficulty: medium
status: published
featured: true
---

## 概述

跨站脚本攻击（XSS）仍然是 OWASP Top 10 中最常见的 Web 安全漏洞之一。

## 攻击面分类

### 反射型 XSS

最常见的类型，攻击载荷通过 URL 参数传入：

```
https://example.com/search?q=<script>alert(1)</script>
```

### 存储型 XSS

攻击载荷被存储在服务器端，每次访问页面时触发。

### DOM-based XSS

纯客户端 XSS，通过修改 DOM 环境触发：

```javascript
// 危险的代码模式
document.getElementById("output").innerHTML = location.hash.slice(1);
```

## 防御策略

1. **输出编码**：根据上下文选择合适的编码方式
2. **Content Security Policy (CSP)**：限制可执行的脚本来源
3. **输入验证**：白名单验证而非黑名单过滤

## 总结

XSS 防御需要纵深防御策略，单一措施往往不够。
