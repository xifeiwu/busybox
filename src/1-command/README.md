## How to debug command

- way1, extract logic to a handler function and export it, run the handler in a test file, and debug it in `ts-node` mode
- way2, link bin to .ts file by command ./src/0-generate-bin/bin.ts, add console in .ts file, and run the bin