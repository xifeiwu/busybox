export function out(value: any) {
  console.log(value);
  if (process.connected && process.send) {
    /** Child process will exit by the error EPipe if the error is not catched here */
    process.send(value, err => {
      console.log(`err`);
      console.log(err);
    });
  }
}

export function responseError(err: Error | string) {
  let message: string = err as string;
  if (err instanceof Error) {
    message = err.stack ? err.stack : err.message;
  }
  return message;
}
