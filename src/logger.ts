import { Utils } from "./utils"

export class ErrorLogger {
    static CANNOT_DELETE(
        filepath: string,
        error: unknown
    ): string {
        return `Не удалось удалить файл ${filepath} по ошибке:\n${(error as Error).message}`
    }
    static CANNOT_READ(
        filepath: string,
        error: unknown
    ): string {
        return `Не удалось прочитать файл ${filepath} по ошибке:\n${(error as Error).message}`
    }
    static CANNOT_WRITE(
        filepath: string,
        error: unknown
    ): string {
        return `Не удалось записать данные в файл ${filepath} по ошибке:\n${(error as Error).message}`
    }
    static INVALID_JSON(
        filepath: string,
        error: unknown
    ): string {
        return `Невалидный JSON в файле ${filepath}\n${(error as Error).message}`
    }
}

export enum LogType {
    SUCCESS = "SUCCESS",
    WARN = "WARN",
    FAIL = "FAIL"
}

export class Logger {
    private prefixes = {
        [LogType.SUCCESS]: Utils.COLORS.green + "[SUCCESS]:" + Utils.COLORS.reset,
        [LogType.WARN]: Utils.COLORS.yellow + "[WARN]:" + Utils.COLORS.reset,
        [LogType.FAIL]: Utils.COLORS.red + "[FAIL]:" + Utils.COLORS.reset
    }

    makeLog(
        type: LogType,
        body: string="Неизвестная ошибка"
    ): void {
        const prefix = this.prefixes[type]
        console.log(prefix, body)
    }
}

export class FileError extends Error {
    cause ?: unknown
    constructor(message: string, options?: { cause?: unknown }) {
        super(message);
        this.name = "FileError";
        if (options?.cause) this.cause = options.cause;
    }
}