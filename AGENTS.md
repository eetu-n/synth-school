# Agent Instructions

## General Instructions
- You can be less verbose than in general, the generated code is most important. I'll ask for clarification if needed.
- Edit this file whenever I give general instructions on how to behave
- Do not assume the user wants more than explicitly asked for; keep implementations strictly minimal to what was requested.
- Do not write or invent description fields, explanatory text, or similar content unless explicitly asked.
- Do not write any user facing text, except for simple things such as aria labels or obvious button labels — write in a TODO instead when text is needed.
- Code comments should be used when necessary, but not when just re-iterating things that are clear from reading the code.
- Maintain a README.md:
    - Before reading source files, check README.md for the general structure and what to expect.
    - Whenever making or discovering structural or architectural changes, update README.md accordingly.
    - Do not include any cosmetic, implementation or other insignificant details in the readme.
    - Also do not include comments that are evident from filenames, or list files unnecessarily.
    - Subfolders may have their own README.md

## Commands
- **Environment**: There's a nix-shell environment, see `shell.nix` (e.g. `nix-shell --run "bun check"` or `nix-shell -p <pkg>`).
- **Check Project**: Use `nix-shell --run "bun check"` (or `bun check` in nix-shell) to run Svelte and TypeScript checks. 
- **Usage**: It is not necessary to run the check after every single change, but only on request or with large changes

## Architectural Notes
- This project uses **Svelte 5**, so make sure to work in runes mode.
- This project uses typescript, so strict type compliance wherever possible
- Styling is handled via **Tailwind CSS** (v4).

