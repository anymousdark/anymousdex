# AnymousDEX

A sci-fi terminal emulator and system monitor — a fork of
[eDEX-UI](https://github.com/GitSquared/edex-ui) 2.2.8, rebuilt with its own
identity, a Nord-first default look and a cleaner install.

> Unofficial fork. Not affiliated with or endorsed by the original eDEX-UI
> author.

![AnymousDEX icon](media/anymousdex.png)

## What it is

AnymousDEX keeps the eDEX-UI engine — terminal, tabs, system and network
monitoring, file browser, on-screen keyboard and theme system — and changes the
presentation:

- **AnymousDEX theme by default**: Nord palette, softer background grid, subtle
  CRT scanlines, gentle text glow, rounded file tiles and keys, more breathing
  room between panels.
- Larger, more readable terminal (Fira Mono 17px, cyan block cursor).
- New name, icon and installer metadata.
- Upstream sponsor banners, teaser GIFs and marketing screenshots removed.
- Automated Windows build via GitHub Actions.
- Update checker points at this repository.

## Features

- Full terminal emulator with tabs, colors, mouse events and `curses` support.
- Real-time CPU, RAM, swap and process monitoring.
- Network monitor with GeoIP, active connections and transfer rates.
- Directory viewer that follows the terminal's working directory.
- Touch support with an on-screen keyboard.
- Themes, keyboard layouts and CSS injections for customization.

## Download

Grab the installer from the [Releases](../../releases) page. Builds are unsigned,
so Windows SmartScreen may ask for confirmation.

## Build from source

Requirements: Node.js 16, Python and Visual Studio Build Tools (C++ workload)
for the `node-pty` native module.

```bash
npm install
cd src && npm install && cd ..
npx electron-rebuild -f -w node-pty
npx electron-builder build -w -c.directories.app=src
```

The installer is written to `dist/`.

## Credits

Based on **eDEX-UI** by Gabriel "Squared" Saillard and contributors
(<https://github.com/GitSquared/edex-ui>), archived in October 2021 and
licensed under GPL-3.0. See [NOTICE](NOTICE) for the list of modifications.

## License

GPL-3.0. See [LICENSE](LICENSE).
