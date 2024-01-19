#!/usr/bin/env ts-node
import {spawn} from 'child_process';
import {Transform} from 'stream';

process.stdin.setRawMode(false); // Releasing stdin
const childProcess = spawn('ssh', ['-tt', 'xifei@elif.site'], {stdio: [0,1,2]});
childProcess.on("exit", function(code, signal) {
  // Don't forget to switch pseudo terminal on again
  process.stdin.setRawMode(true); 
});
// childProcess.stdout.pipe(process.stdout, {end: false});
// childProcess.stderr.pipe(process.stderr, {end: false});
// process.stdin.resume();
// process.stdin.on('data', function (chunk) {
//   childProcess.stdin.write(chunk);
// });
// process.stdin.setRawMode(true);
// process.stdin.pipe(childProcess.stdin);

// /** test stdout, std error */
// const stdoutStream = new Transform({
//   transform(chunk: Buffer, enc, cb) {
//     console.log(`chunk`);
//     console.log(chunk);
//     console.log(chunk.toString());
//     if (chunk.byteLength === 1 && chunk[0] === 0x04) {
//       process.kill(childProcess.pid);
//       process.exit();
//     }
//     // this.push(Buffer.concat([Buffer.from(`[${port}]stdout: `), chunk]));
//     cb && cb();
//   },
//   final(cb) {
//     cb && cb();
//   }
// });