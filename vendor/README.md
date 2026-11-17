# Vendored native binaries

`node-pty/win32-x64/` contains the prebuilt `node-pty` 0.10.1 native modules for
Electron 12 on Windows x64:

- `pty.node`
- `conpty.node`
- `conpty_console_list.node`
- `winpty-agent.exe`
- `winpty.dll`

They were extracted from the official eDEX-UI 2.2.8 Windows build, which ships
the same `node-pty` version and the same Electron major (12), so the ABI matches.

Using them lets GitHub Actions produce the installer without a Visual Studio C++
toolchain. If you prefer compiling locally, delete this folder from the build
step and run `npx electron-rebuild -f -w node-pty` inside `src/` instead.

`node-pty` is licensed under MIT; see `src/node_modules/node-pty/LICENSE` after
installing dependencies.
