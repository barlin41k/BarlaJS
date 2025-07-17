import * as path from "path"
import * as fs from "fs"
import * as asyncFS from "fs/promises"

export class Utils {
    static readonly COLORS = {
        reset: "\u001b[0m",
        red: "\u001b[31m",
        green: "\u001b[32m",
        yellow: "\u001b[33m",
        blue: "\u001b[34m",
        magenta: "\u001b[35m",
        cyan: "\u001b[36m",
        white: "\u001b[37m",
    } as const;

    static async asyncGetFilePath(
        filepath: string
    ): Promise<string> {
        const extension = path.extname(filepath)
        return extension ? path.resolve(filepath) : path.resolve(filepath + ".json")
    }
    static syncGetFilePath(
        filepath: string
    ): string {
        const extension = path.extname(filepath)
        return extension ? path.resolve(filepath) : path.resolve(filepath + ".json")
    }
    
    static async asyncCheckFile(
        filepath: string
    ): Promise<boolean> {
        try {
            await asyncFS.access(filepath);
            return true
        } catch {
            return false
        }
    }
    static syncCheckFile(
        filepath: string
    ): boolean {
        return fs.existsSync(filepath)
    }

    static RemoveKey(
        data: Record<string, any>,
        key: string
    ): Record<string, any> {
        const { [key]: _, ...newData } = data
        return newData
    }
}