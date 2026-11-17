# HyperTerm UI

A sci-fi terminal emulator and system monitor for Windows, macOS and Linux.
HyperTerm UI is a fork of [eDEX-UI](https://github.com/GitSquared/edex-ui) 2.2.8
with a Nord-first visual pass, a cleaner default look and its own build pipeline.

> **Unofficial fork.** This project is not affiliated with or endorsed by the
> original eDEX-UI author.

![HyperTerm UI icon](media/hyperterm.png)

## What's different

- New **nord-plus** theme: Nord palette, softer background grid, subtle CRT
  scanlines, typography glow, rounded file tiles and keyboard keys, roomier
  spacing between panels.
- Larger, more readable terminal by default (Fira Mono 17px, cyan block cursor).
- Rebranded app name, icon and installer.
- GitHub Actions workflow that builds the Windows installer and attaches it to
  every tagged release.

Everything else — the terminal, the system/network monitors, the file explorer,
the on-screen keyboard, themes and settings — comes from eDEX-UI 2.2.8.

## Features

- Full terminal emulator with tabs, colors, mouse events and `curses` support.
- Real-time CPU, RAM, swap and process monitoring.
- Network monitor with GeoIP, active connections and transfer rates.
- Directory viewer that follows the terminal's current working directory.
- Touch support with an on-screen keyboard.
- Themes, keyboard layouts and CSS injections for deep customization.

## Download

Grab the latest installer from the [Releases](../../releases) page.
The installer is unsigned, so Windows SmartScreen may ask for confirmation.

## Build from source

Requirements: Node.js 16, Python and Visual Studio Build Tools (C++ workload)
to compile the `node-pty` native module.

```bash
npm install
cd src && npm install && cd ..
npx electron-rebuild -f -w node-pty
npx electron-builder build -w -c.directories.app=src
```

The installer is written to `dist/`.

## Credits

HyperTerm UI is based on **eDEX-UI** by Gabriel "Squared" Saillard and
contributors: <https://github.com/GitSquared/edex-ui>.
The original project was archived in October 2021 and is licensed under
GPL-3.0.

Changes in this fork are documented in the commit history. See [NOTICE](NOTICE)
for attribution details.

## License

GPL-3.0. See [LICENSE](LICENSE).
