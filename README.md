# AnymousDEX

A sci-fi terminal emulator and system monitor for Windows, rebuilt from the
ground up with its own identity: a Nord-first look, six built-in color themes
and a built-in text editor.

![AnymousDEX icon](media/anymousdex.png)

## What it is

AnymousDEX combines a full terminal, real-time system telemetry, a file browser,
an on-screen keyboard and a mini text editor in a single fullscreen interface.

## Features

- **Full terminal emulator** with tabs, 256-color/truecolor output, mouse events
  and `curses` support.
- **Built-in text editor** (`Ctrl+Shift+E`): open, edit and save text files
  without leaving the app. Line numbers, word wrap, font zoom, line/column and
  word counters.
- **Six original themes**: `nord-plus` (default), `void`, `ember`, `sakura`,
  `matrix` and `ice`.
- **Classic interface font**: the original United Sans UI typeface.
- Real-time CPU, RAM, swap and process monitoring.
- Network monitor with GeoIP, active connections and transfer rates.
- Directory viewer that follows the terminal's working directory.
- Touch support with an on-screen keyboard.
- Themes, keyboard layouts and CSS injections for customization.
- Single-instance lock and automatic free-port selection: no more
  `EADDRINUSE` crashes.
- Light on resources: capped terminal scrollback, throttled background
  rendering and slower telemetry polling.

## Download

Grab the single-file portable executable from the [Releases](../../releases)
page — no installation needed. Settings live in `%APPDATA%\AnymousDEX`.
Builds are unsigned, so Windows SmartScreen may ask for confirmation.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl+Shift+E` | Open/close the text editor |
| `Ctrl+Shift+S` | Settings |
| `Ctrl+Shift+K` | Shortcut editor |
| `Ctrl+Shift+F` | Fuzzy finder |
| `Ctrl+Tab` / `Ctrl+Shift+Tab` | Next/previous terminal tab |
| `Ctrl+Shift+C` / `Ctrl+Shift+V` | Copy/paste in the terminal |

Inside the editor: `Ctrl+N` new file, `Ctrl+O` open, `Ctrl+S` save,
`Ctrl+Alt+S` save as, `Ctrl+W` or `Esc` close.

## Build from source

Requirements: Node.js 16 and Python. Prebuilt `node-pty` binaries for Electron
12 are vendored in `vendor/node-pty/win32-x64`, so a C++ toolchain is not
required.

```bash
npm install
cd src && npm install --ignore-scripts && cd ..
node -e "const fs=require('fs');fs.mkdirSync('src/node_modules/node-pty/build/Release',{recursive:true});for(const f of fs.readdirSync('vendor/node-pty/win32-x64'))fs.copyFileSync('vendor/node-pty/win32-x64/'+f,'src/node_modules/node-pty/build/Release/'+f)"
npx electron-builder build -w --publish never
```

The portable executable is written to `dist/`.

## Legal

AnymousDEX is an independent fork of eDEX-UI 2.2.8, distributed under
GPL-3.0. Upstream copyright notices are preserved in [NOTICE](NOTICE),
[LICENSE](LICENSE) and the source files, as required by the license.
AnymousDEX is not affiliated with or endorsed by the upstream project.
