import type { LoggerInitOptions, LoggerOptions } from '@/types/log';
import { TaskConfig } from '@/config/globalVar';
import { defLogger, EmptyLogger, SimpleLogger } from './def';
import { resolvePath } from '../path';
import { getPRCDate } from '../pure';

export { defLogger };
export const emptyLogger = new EmptyLogger() as unknown as Logger;

export class Logger extends SimpleLogger {
  constructor(protected options: LoggerOptions = {}, public name = 'default') {
    super(options);
    this.mergeOptions({ ...options, fileSplit: 'day' } as LoggerOptions);
    const thisTime = getPRCDate(),
      thisFullYear = thisTime.getFullYear(),
      thisMonth = thisTime.getMonth() + 1;
    if (options.fileSplit === 'day') {
      this.setFilename(`${thisFullYear}-${thisMonth}-${thisTime.getDate()}`);
    } else {
      this.setFilename(`${thisFullYear}-${thisMonth}`);
    }
  }

  protected setFilename(file: string) {
    this.errorFile = resolvePath(`./logs/bt_error-${file}.log`);
    this.logFile = resolvePath(`./logs/bt_combined-${file}.log`);
  }

  static setEmoji(useEmoji = true) {
    if (!useEmoji) {
      return;
    }
    SimpleLogger.emojis = {
      error: '❓',
      warn: '❔',
      info: '👻',
      verbose: '💬',
      debug: '🐛',
    };
  }

  static async init({ br, useEmoji }: LoggerInitOptions = {}) {
    this.setEmoji(useEmoji || TaskConfig.log.useEmoji);
    SimpleLogger.pushValue = '';
    SimpleLogger.brChar = br || TaskConfig.message.br || '\n';
  }
}

export const logger = new Logger({
  console: TaskConfig.log.consoleLevel,
  file: TaskConfig.log.fileLevel,
  push: TaskConfig.log.pushLevel,
  payload: process.env.BILITOOLS_IS_ASYNC && TaskConfig.USERID,
});