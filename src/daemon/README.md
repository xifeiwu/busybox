## Intro

Manage child process by daemon process

## Structure

├── README.md
├── config.ts                   All configs for child process that managed by daemon
├── index.ts
├── script                      The script to run on child process
│   ├── service.ts
│   └── tcp-gateway.ts
├── service.test.ts
└── service.ts