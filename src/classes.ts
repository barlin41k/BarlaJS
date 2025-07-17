import * as fs from "fs"
import * as asyncFS from "fs/promises"
import { ErrorLogger, Logger, LogType, FileError } from "./logger"
import { Utils } from "./utils"

const logger = new Logger()

/**
 * Синхронный класс BarlaJS
*/
export class BarlaAsync {
    private static logging: boolean=false
    private static log(type: LogType, msg: string) {
        if (this.logging) logger.makeLog(type, msg)
    }
    private static async getPath(filepath: string): Promise<string> {
        return await Utils.asyncGetFilePath(filepath)
    }
    static setLogging(value: boolean): void {
        this.logging = value
    }
    
    /**
     * Сохраняет объект в JSON-файл по указанному пути асинхронно.
     * @param filepath - путь к файлу
     * @param data - объект с данными для сохранения
     * @returns путь к сохранённому файлу
     * @throws вызывает ошибку, если не удалось записать файл
    */
    static async save( 
        filepath: string,
        data: Record<string, any>
    ): Promise<string> {
        const fullPath = await this.getPath(filepath)
        const json = JSON.stringify(
            data,
            null,
            2
        )
        try {
            await asyncFS.writeFile(fullPath, json, "utf-8")
            this.log(LogType.SUCCESS, `Успешно сохранён файл ${fullPath}`)
            return fullPath
        } catch (error) {
            throw new FileError(ErrorLogger.CANNOT_WRITE(fullPath, error), {cause:error})
        }
    }

    /**
     * Создает JSON-файл и сохраняет туда объект по указанному пути асинхронно.
     * @param filepath - путь к файлу
     * @param data - объект с данными для сохранения
     * @returns путь к файлу; если уже существует - не перезаписывается
     * @throws вызывает ошибку, если не удалось записать файл
    */
    static async create(
        filepath: string,
        data: Record<string, any> = {}
    ): Promise<string> {
        const fullPath = await this.getPath(filepath)
        const check = await Utils.asyncCheckFile(fullPath)
        if (check) {
            this.log(LogType.WARN, `Файл уже существует: ${fullPath}`)
            return fullPath
        } else {
            return await this.save(filepath, data);
        }
    }

    /**
     * Получает объект из JSON-файла по указанному пути асинхронно.
     * @param filepath - путь к файлу
     * @returns получаемый объект
     * @throws вызывает ошибку, если не удалось прочитать файл
    */
    static async get<T=Record<string, any>>(
        filepath: string
    ): Promise<T> {
        const fullPath = await this.getPath(filepath)
        try {
            const json = await asyncFS.readFile(fullPath, 'utf-8')
            const data = JSON.parse(json)
            this.log(LogType.SUCCESS, `Успешно получены данные из файла ${fullPath}`)
            return data as T
        } catch (error) {
            throw new FileError(ErrorLogger.CANNOT_READ(fullPath, error), {cause:error})
        }
    }

    /**
     * Удаляет JSON-файл по указанному пути асинхронно.
     * @param filepath - путь к файлу
     * @returns `true`, если файл успешно удалён
     * @throws вызывает ошибку, если не удалось удалить файл
    */
    static async delete(
        filepath: string
    ): Promise<boolean> {
        const fullPath = await this.getPath(filepath)
        try {
            await asyncFS.unlink(fullPath)
            this.log(LogType.SUCCESS, `Успешно удалён файл ${fullPath}`)
            return true
        } catch (error) {
            throw new FileError(ErrorLogger.CANNOT_DELETE(fullPath, error), {cause:error})
        }
    }

    /**
     * Ищет значение по ключу в JSON-файле по указанному пути асинхронно.
     * @param filepath - путь к файлу
     * @param key - ключ, который нужно найти
     * @returns значение ключа, если найден
     * @throws вызывает ошибку, если не удалось прочитать файл
    */
    static async search<T=unknown>(
        filepath: string,
        key: string
    ): Promise<T | null> {
        const fullPath = await this.getPath(filepath)
        try {
            const data = await this.get(filepath)
            const check = await this.isJsonEmpty(data)
            if (check) {
                return null
            }
            if (key in data) {
                this.log(LogType.SUCCESS, `Успешно найден ключ ${key}`)
                return data[key]
            } else {
                this.log(LogType.FAIL, `Не найден ключ ${key}`)
                return null
            }
        } catch (error) {
            throw new FileError(ErrorLogger.CANNOT_READ(fullPath, error), {cause:error})
        }
    }

    /**
     * Удаляет столбец вместе с его значением в JSON-файле по указанному пути асинхронно.
     * @param filepath - путь к файлу
     * @param column - столбец, который нужно удалить
     * @param saveToJson - сохранять ли изменение в файл
     * @returns новый объект без указанного ключа, либо исходный объект, если ключ отсутствует
     * @throws вызывает ошибку, если не удалось прочитать файл или файл пуст
    */
    static async removeKey<T extends Record<string, any>, K extends Extract<keyof T, string>>(
        filepath: string,
        key: K,
        saveToJson: boolean=true
    ): Promise<Omit<T, K>> {
        const fullPath = await this.getPath(filepath)
        try {
            const data = await this.get(filepath)
            const check = await this.isJsonEmpty(data)
            if (check) {
                return {} as Omit<T, K>
            }
            if (!(key in data)) {
                this.log(LogType.SUCCESS, `Ключ ${key} отсутствует`)
                return data as Omit<T, K>
            }
            const newData = Utils.RemoveKey(data, key)
            if (saveToJson) {
                await this.save(filepath, newData)
            }
            this.log(LogType.SUCCESS, `Успешно удалён ключ ${key}`)
            return newData as Omit<T, K>
        } catch (error) {
            throw new FileError(ErrorLogger.CANNOT_READ(fullPath, error), {cause:error})
        }
    }

    /**
     * Проверить структуру объекта асинхронно.
     * @param data - объект или строка JSON для проверки
     * @returns `true`, если объект пуст
    */
    static async isJsonEmpty(
        data: Record<string, any> | string
    ): Promise<boolean> {
        let obj: Record<string, any>;

        if (typeof data === "string") {
            try {
                obj = JSON.parse(data);
            } catch (error) {
                this.log(LogType.FAIL, `Ошибка парсинга JSON: ${error}`);
                throw new FileError(ErrorLogger.INVALID_JSON("Данные", error), {cause:error});
            }
        } else {
            obj = data;
        }

        if (Object.keys(obj).length === 0 || Object.values(obj).every(i => i == null)) {
            this.log(LogType.WARN, `Объект пуст`);
            return true;
        } else {
            this.log(LogType.SUCCESS, `Объект не пустой`);
            return false;
        }
    }

}

/**
 * Синхронный класс BarlaJS
*/
export class BarlaSync {
    private static logging: boolean=false
    private static log(type: LogType, msg: string) {
        if (this.logging) logger.makeLog(type, msg)
    }
    private static getPath(filepath: string): string {
        return Utils.syncGetFilePath(filepath)
    }
    static setLogging(value: boolean): void {
        this.logging = value
    }

    /**
     * Сохраняет объект в JSON-файл по указанному пути.
     * @param filepath - путь к файлу
     * @param data - объект с данными для сохранения
     * @returns путь к сохранённому файлу
     * @throws вызывает ошибку, если не удалось записать файл
    */
    static save( 
        filepath: string,
        data: Record<string, any>
    ): string {
        const fullPath = this.getPath(filepath)
        const json = JSON.stringify(
            data,
            null,
            2
        )
        try {
            fs.writeFileSync(fullPath, json, "utf-8")
            this.log(LogType.SUCCESS, `Успешно сохранен файл ${fullPath}`)
            return fullPath
        } catch (error) {
            throw new FileError(ErrorLogger.CANNOT_WRITE(fullPath, error), {cause:error})
        }
    }

    /**
     * Создает JSON-файл и сохраняет при наличии туда объект по указанному пути.
     * @param filepath - путь к файлу
     * @param data - объект с данными для сохранения
     * @returns путь к файлу; если уже существует - не перезаписывается
     * @throws вызывает ошибку, если не удалось записать файл
    */
    static create(
        filepath: string,
        data: Record<string, any> = {}
    ): string {
        const fullPath = this.getPath(filepath)
        const check = Utils.syncCheckFile(fullPath)
        if (check) {
            this.log(LogType.WARN, `Файл уже существует: ${fullPath}`)
            return fullPath
        } else {
            return this.save(filepath, data);
        }
    }

    /**
     * Получает объект из JSON-файла по указанному пути.
     * @param filepath - путь к файлу
     * @returns получаемый объект
     * @throws вызывает ошибку, если не удалось прочитать файл
    */
    static get<T=Record<string, any>>(
        filepath: string
    ): T {
        const fullPath = this.getPath(filepath)
        try {
            const json = fs.readFileSync(fullPath, 'utf-8')
            const data = JSON.parse(json)
            this.log(LogType.SUCCESS, `Успешно получены данные из файла ${fullPath}`)
            return data as T
        } catch (error) {
            throw new FileError(ErrorLogger.CANNOT_READ(fullPath, error), {cause:error})
        }
    }

    /**
     * Удаляет JSON-файл по указанному пути.
     * @param filepath - путь к файлу
     * @returns `true`, если файл успешно удалён
     * @throws вызывает ошибку, если не удалось удалить файл
    */
    static delete(
        filepath: string
    ): boolean {
        const fullPath = this.getPath(filepath)
        try {
            fs.unlinkSync(fullPath)
            this.log(LogType.SUCCESS, `Успешно удалён файл ${fullPath}`)
            return true
        } catch (error) {
            throw new FileError(ErrorLogger.CANNOT_DELETE(fullPath, error), {cause:error})
        }
    }

    /**
     * Ищет значение по ключу в JSON-файле по указанному пути.
     * @param filepath - путь к файлу
     * @param key - ключ, который нужно найти
     * @returns значение ключа, если найден
     * @throws вызывает ошибку, если не удалось прочитать файл
    */
    static search<T=unknown>(
        filepath: string,
        key: string
    ): T | null {
        const fullPath = this.getPath(filepath)
        try {
            const data = this.get(filepath)
            const check = this.isJsonEmpty(data)
            if (check) {
                return null
            }
            if (key in data) {
                this.log(LogType.SUCCESS, `Успешно найден ключ ${key}`)
                return data[key]
            } else {
                this.log(LogType.FAIL, `Не найден ключ ${key}`)
                return null
            }
        } catch (error) {
            throw new FileError(ErrorLogger.CANNOT_READ(fullPath, error), {cause:error})
        }
    }

    /**
     * Удаляет столбец вместе с его значением в JSON-файле по указанному пути.
     * @param filepath - путь к файлу
     * @param column - столбец, который нужно удалить
     * @param saveToJson - сохранять ли изменение в файл
     * @returns новый объект без указанного ключа, либо исходный объект, если ключ отсутствует
     * @throws вызывает ошибку, если не удалось прочитать файл или файл пуст
    */
    static removeKey<T extends Record<string, any>,K extends Extract<keyof T, string>>(
        filepath: string,
        key: K,
        saveToJson: boolean=true
    ): Omit<T, K> {
        const fullPath = this.getPath(filepath)
        try {
            const data = this.get(filepath)
            const check = this.isJsonEmpty(data)
            if (check) {
                return {} as Omit<T, K>
            }
            if (!(key in data)) {
                this.log(LogType.SUCCESS, `Ключ ${key} отсутствует`)
                return data as Omit<T, K>
            }
            const newData = Utils.RemoveKey(data, key)
            if (saveToJson) {
                this.save(filepath, newData)
            }
            this.log(LogType.SUCCESS, `Успешно удалён ключ ${key}`)
            return newData as Omit<T, K>
        } catch (error) {
            throw new FileError(ErrorLogger.CANNOT_READ(fullPath, error), {cause:error})
        }
    }
    
    /**
     * Проверить структуру объекта.
     * @param data - объект или строка JSON для проверки
     * @returns `true`, если объект пуст
    */
    static isJsonEmpty(
        data: Record<string, any> | string
    ): boolean {
        let obj: Record<string, any>;

        if (typeof data === "string") {
            try {
                obj = JSON.parse(data);
            } catch (error) {
                this.log(LogType.FAIL, `Ошибка парсинга JSON: ${error}`);
                throw new FileError(ErrorLogger.INVALID_JSON("Данные", error), {cause:error});
            }
        } else {
            obj = data;
        }

        if (Object.keys(obj).length === 0 || Object.values(obj).every(i => i == null)) {
            this.log(LogType.WARN, `Объект пуст`);
            return true;
        } else {
            this.log(LogType.SUCCESS, `Объект не пустой`);
            return false;
        }
    }

}