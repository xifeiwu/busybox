## Intro

run exported function from .ts/.js file

As some params are necessary for ts-node runtime when run .ts file, so the actual logic is run in child process, parent process are used to collect the necessary params used for .ts file to run.

## Logic

├── command.ts                a commander wrapper, get config from command input
├── run-export-in-cp.ts       run script export in child process, calculate runtime params by the script to run
├── cp-script.ts              script will run in child process
├── test
│   └── test.ts
└── types.ts

## How to test

Go to current dir, run `ts-node command.ts test/test.ts`