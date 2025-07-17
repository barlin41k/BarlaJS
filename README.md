# BarlaJS - удобная работа с JSON

![GitHub repo size](https://img.shields.io/github/repo-size/barlin41k/BarlaJS?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

**BarlaJS** - модуль для упрощения работы с JSON файлами, полностью написанный на языке TypeScript. Модуль предоставляет вам возможности как асинхронной, так и синхронной работы.

# Функционал

## [Документация](https://barlin41k.github.io/BarlaJS/#/)

`get` - получает данные из файла

`save` - сохраняет данные в файл

`create` - создать файл

`delete` - удалить файл

`search` - найти ключ в файле

`removeKey` - удалить ключ из файла

`isJsonEmpty` - проверить объект на пустоту

### В репозитории вы сможете найти unit-test модуля.
### Все подсказки можно найти, наводясь на метод в IDE.

# Минимальный пример
Пример показан на классе с **синхронной** работы модуля.
```ts
import { BarlaSync } from "../src";

BarlaSync.setLogging(true);
BarlaSync.create("test", {
    test: true
});
console.log(BarlaSync.search("test", "test")); // вывод: true
const data = BarlaSync.get("test");
console.log(BarlaSync.isJsonEmpty(data)) // вывод: false
console.log(BarlaSync.delete("test")); // вывод: true

```