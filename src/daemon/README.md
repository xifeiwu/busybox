## Intro

Daemon feature: manage child processes by daemon process.

Daemon scripts and their spawn configs are located in `src/2-daemon-scripts/`.

## Structure

├── README.md
├── command.ts                  CLI interface for daemon operations
├── index.ts
├── service.test.ts
└── service.ts                  Daemon service functions
