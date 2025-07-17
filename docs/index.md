---
title: 👋 Добро пожаловать на документацию BarlaJS!
---

**BarlaJS** - модуль для упрощения работы с JSON файлами, полностью написанный на языке TypeScript. Модуль предоставляет вам возможности как асинхронной, так и синхронной работы.

## 📦 Установка
Библиотека в настоящее время не опубликована на **[NPM](https://www.npmjs.com/)**, поэтому установка и пользование осуществляется через клонирование репозитория **GitHub**:

1) Перейдите в папку, где будет ваша рабочая область
2) Удостоверьтесь, что у вас установлен [Git](https://git-scm.com/) и **Git Bash** (идет в комплектацию установки Git)
3) Выполните команды в **Git Bash** (либо в любом терминале с **Bash**)
```bash
git clone https://github.com/barlin41k/BarlaJS.git
```
4) Удалите ненужные файлы и директории (по надобности):
- **Директории**: *docs, test*
- **Файлы**: *README.md* 

## 🚀 Быстрый старт
```ts
/*
Проверяйте правильность пути к папке с библиотекой, чтобы получить доступ к нужным классам.
В примере, библиотека находится в папке src, а файл быстрого старта - рядом с ней
*/
import { BarlaSync } from "./src";

const startData = {
    "names": {},
    "ages": {}
};
BarlaSync.create("users", startData);

const newData = JSON.parse(JSON.stringify(startData));
newData["names"]["user01"] = "Sasha";
newData["ages"]["user01"] = 20;

BarlaSync.save("users", newData);
console.log(BarlaSync.get("users"));
// { names: { user01: 'Sasha' }, ages: { user01: 20 } }
BarlaSync.delete("users");
```