# Change log

## 2026-04-10

- Use Claude Code for development assistance.

## Earlier

1. Actual command logic is located in src/command file, bin/command is just a script to spawn it's related file in src/command, it will append accurate param for command script. @deprecated as it will start more threads.

1. Use the shell script as shebang line for .ts bin command, for more compatible.