# Agent Instructions

## General Instructions
- You can be less verbose than in general, the generated code is most important. I'll ask for clarification if needed.
- Edit this file whenever I give general instructions on how to behave
- Maintain a README.md:
    - Before reading source files, check README.md for the general structure and what to expect.
    - Whenever making or discovering changes, update README.md accordingly.

## Commands
- **Environment**: There's a nix-shell environment, see `shell.nix` (e.g. `nix-shell --run "bun check"` or `nix-shell -p <pkg>`).
- **Check Project**: Use `nix-shell --run "bun check"` (or `bun check` in nix-shell) to run Svelte and TypeScript checks. 
- **Usage**: It is not necessary to run the check after every single change, but only on request or with large changes

## Architectural Notes
- This project uses **Svelte 5**, so make sure to work in runes mode.
- This project uses typescript, so strict type compliance wherever possible
- Styling is handled via **Tailwind CSS** (v4).

