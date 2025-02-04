import path from "path";

export default class nConsole {
    static log = (...args : any[]): void => {
        log('info', ...args);
    }

    static info = (...args : any[]): void => {
        log('info', ...args);
    }

    static warn = (...args : any[]): void => {
        log('warn', ...args);
    }

    static error = (...args : any[]): void => {
        log('error', ...args);
    }
}

function log(level: keyof Console, ...args : any[]) {
    const caller = getCallerFile();
    const message = args.shift();
    const compiledTemplate = `[${new Date().toISOString()}] - ${caller} - ${level.toUpperCase()} - ${message}`;
    (console as any)[level](compiledTemplate, ...args);
}

function getCallerFile(): string {
    const err = new Error();
    const stack = err.stack?.split("\n")[4]; // Adjust index if needed

    const allFiles = (err.stack?.split("\n") || [])
        .map((stackLine) => getFileFromStackLine(stackLine));

    return allFiles.find((stackFile) => stackFile && stackFile !== 'NikoragLogger.ts') || 'unknown';
}

function getFileFromStackLine(stackLine : string): string | undefined{
    const match = stackLine.match(/([^\/]+):(\d+):(\d+)\)?$/);
    return match ? match[1] : undefined;
}