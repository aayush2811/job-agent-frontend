const isDev = process.env.NODE_ENV !== 'production';

function write(level: 'debug' | 'info' | 'warn' | 'error', scope: string, message: string, meta?: unknown) {
  if (level === 'debug' && !isDev) return;

  const prefix = `[${scope}] ${message}`;
  if (level === 'error') {
    console.error(prefix, meta !== undefined ? meta : '');
  } else if (level === 'warn') {
    console.warn(prefix, meta !== undefined ? meta : '');
  } else if (level === 'debug') {
    console.debug(prefix, meta !== undefined ? meta : '');
  } else if (isDev) {
    console.log(prefix, meta !== undefined ? meta : '');
  }
}

export const logger = {
  debug: (scope: string, message: string, meta?: unknown) => write('debug', scope, message, meta),
  info: (scope: string, message: string, meta?: unknown) => write('info', scope, message, meta),
  warn: (scope: string, message: string, meta?: unknown) => write('warn', scope, message, meta),
  error: (scope: string, message: string, meta?: unknown) => write('error', scope, message, meta),
};
