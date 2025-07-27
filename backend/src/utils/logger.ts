export function logInfo(message: string): void {
  if (process.env.NODE_ENV !== 'production') {
    console.log(message);
  }
}

export function logError(message: string, error?: any): void {
  console.error(message, error);
}

export function logWarn(message: string): void {
  console.warn(message);
}
