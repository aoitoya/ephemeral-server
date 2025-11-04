/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
class Logger {
  error(...data: any[]) {
    this.log('error', ...data)
  }

  info(...data: any[]) {
    this.log('info', ...data)
  }

  log(...params: ['error' | 'info' | 'warn', ...any] | any[]) {
    const timestamp = new Date().toISOString()

    if (params.length > 1 && ['error', 'info', 'warn'].includes(params[0])) {
      if (params[0] === 'info') {
        console.info(`${timestamp} [INFO]`, ...params.slice(1))
        return
      }

      if (params[0] === 'warn') {
        console.warn(`${timestamp} [WARN]`, ...params.slice(1))
        return
      }

      if (params[0] === 'error') {
        console.error(`${timestamp} [ERROR]`, ...params.slice(1))
        return
      }
    }

    console.log(`${timestamp} [LOG]`, ...params)
  }

  warn(...data: any[]) {
    this.log('warn', ...data)
  }
}

const logger = new Logger()

export default logger
