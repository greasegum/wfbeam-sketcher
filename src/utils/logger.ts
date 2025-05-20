import { format } from 'date-fns'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

class Logger {
  private static instance: Logger
  private logFile: string = 'wfbeam-sketcher.log'

  private constructor() {
    // Initialize error handling
    window.onerror = (message, source, lineno, colno, error) => {
      this.error('Unhandled Error', { message, source, lineno, colno, error })
      return false
    }

    // Handle unhandled promise rejections
    window.onunhandledrejection = (event) => {
      this.error('Unhandled Promise Rejection', { reason: event.reason })
    }

    // Override console methods
    this.overrideConsole()
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private overrideConsole() {
    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug
    }

    console.log = (...args) => {
      originalConsole.log(...args)
      this.log('info', ...args)
    }

    console.info = (...args) => {
      originalConsole.info(...args)
      this.log('info', ...args)
    }

    console.warn = (...args) => {
      originalConsole.warn(...args)
      this.log('warn', ...args)
    }

    console.error = (...args) => {
      originalConsole.error(...args)
      this.log('error', ...args)
    }

    console.debug = (...args) => {
      originalConsole.debug(...args)
      this.log('debug', ...args)
    }
  }

  private formatMessage(level: LogLevel, ...args: any[]): string {
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS')
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2)
        } catch (e) {
          return String(arg)
        }
      }
      return String(arg)
    }).join(' ')

    return `[${timestamp}] [${level.toUpperCase()}] ${message}\n`
  }

  private async writeToFile(message: string) {
    try {
      const blob = new Blob([message], { type: 'text/plain' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = this.logFile
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (error) {
      console.error('Failed to write to log file:', error)
    }
  }

  private log(level: LogLevel, ...args: any[]) {
    const formattedMessage = this.formatMessage(level, ...args)
    this.writeToFile(formattedMessage)
  }

  public info(...args: any[]) {
    this.log('info', ...args)
  }

  public warn(...args: any[]) {
    this.log('warn', ...args)
  }

  public error(...args: any[]) {
    this.log('error', ...args)
  }

  public debug(...args: any[]) {
    this.log('debug', ...args)
  }
}

// Simple browser logger for development
export const logger = {
  info: (...args: any[]) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info('[INFO]', ...args);
    }
  },
  debug: (...args: any[]) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug('[DEBUG]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args: any[]) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('[ERROR]', ...args);
    }
  },
}; 