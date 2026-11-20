// anyDEXpro - settings application
// A real preferences window for the desktop shell, not a modal form.

class SettingsApp {
    constructor(opts = {}) {
        this.themes = Array.isArray(opts.themes) ? opts.themes : [];
        this.version = opts.version || "0.0.0";
        this.visible = false;
        this.root = null;
        this.activeTab = "appearance";
        this.prefix = "anydexpro.";
    }

    static read(key, fallback) {
        try {
            const value = localStorage.getItem("anydexpro." + key);
            return value === null ? fallback : value;
        } catch (e) {
            return fallback;
        }
    }

    static write(key, value) {
        try {
            localStorage.setItem("anydexpro." + key, String(value));
        } catch (e) {}
    }

    static applyPreferences() {
        const body = document.body;
        const wallpaper = SettingsApp.read("wallpaper", "aurora");
        ["aurora", "grid", "solid", "custom"].forEach(name => body.classList.remove("xde-wallpaper-" + name));
        body.classList.add("xde-wallpaper-" + wallpaper);

        if (wallpaper === "custom") {
            const custom = SettingsApp.read("wallpaper.custom", "");
            if (custom) {
                document.documentElement.style.setProperty("--xde-wallpaper", `url("${custom}")`);
            }
        } else {
            document.documentElement.style.removeProperty("--xde-wallpaper");
        }

        body.classList.toggle("xde-no-scanlines", SettingsApp.read("scanlines", "1") !== "1");
        const nativeCursor = SettingsApp.read("cursor", "1") !== "1";
        body.classList.toggle("xde-native-cursor", nativeCursor);
        document.documentElement.classList.toggle("xde-native-cursor", nativeCursor);
        body.classList.toggle("xde-hide-desktop-icons", SettingsApp.read("desktopIcons", "1") !== "1");
        body.classList.toggle("xde-compact-panel", SettingsApp.read("compactPanel", "0") === "1");
        body.classList.toggle("xde-no-animations", SettingsApp.read("animations", "1") !== "1");
        body.classList.toggle("xde-no-shadows", SettingsApp.read("shadows", "1") !== "1");

        const scale = SettingsApp.read("fontScale", "normal");
        body.classList.toggle("xde-font-compact", scale === "compact");
        body.classList.toggle("xde-font-large", scale === "large");

        const panel = SettingsApp.read("panelSize", "normal");
        const panelHeight = panel === "compact" ? "4.4vh" : panel === "large" ? "6vh" : "5vh";
        document.documentElement.style.setProperty("--xde-panel-h", panelHeight);

        const dim = Math.min(60, Math.max(0, Number(SettingsApp.read("wallDim", "20")) || 0));
        document.documentElement.style.setProperty("--xde-wall-dim", String(dim / 100));

        const clock = SettingsApp.read("clock24", window.settings.clockHours === 12 ? "0" : "1");
        window.settings.clockHours = clock === "1" ? 24 : 12;
    }

    static applyTerminalOptions() {
        const style = SettingsApp.read("cursorStyle", "block");
        const blink = SettingsApp.read("cursorBlink", "1") === "1";
        Object.keys(window.term || {}).forEach(key => {
            try {
                const term = window.term[key];
                if (!term || !term.term || !term.term.options) return;
                term.term.options.cursorStyle = style;
                term.term.options.cursorBlink = blink;
                const size = Number(SettingsApp.read("termFontSize", window.theme.terminal.fontSize || 17));
                if (size >= 8 && size <= 32) term.term.options.fontSize = size;
            } catch (e) {}
        });
    }

    ensureDom() {
        if (this.root) return this.root;

        const shell = window.desktopShell;
        const icons = shell ? shell.ICONS : {};
        const themeCards = this.themes.map(theme => `<button type="button" class="se-theme" data-theme="${theme.name}">
            <span class="se-theme-dot" style="background:${theme.color}"></span>
            <span class="se-theme-name">${theme.name}</span>
        </button>`).join("");

        const overlay = document.createElement("div");
        overlay.id = "settingsOverlay";
        overlay.innerHTML = `
            <header class="se-head">
                <span class="se-logo">${icons.settings || ""}</span>
                <div class="se-id">
                    <strong>SETTINGS</strong>
                    <small>anyDEXpro control center</small>
                </div>
                <nav class="se-tabs">
                    <button type="button" class="active" data-tab="appearance">Appearance</button>
                    <button type="button" data-tab="windows">Windows</button>
                    <button type="button" data-tab="desktop">Desktop</button>
                    <button type="button" data-tab="terminal">Terminal</button>
                    <button type="button" data-tab="about">About</button>
                </nav>
                <button type="button" class="se-close" data-action="close" title="Close settings">${icons.close || "CLOSE"}</button>
            </header>

            <div class="se-body">
                <section class="se-pane active" data-pane="appearance">
                    <div class="se-column">
                        <div class="se-section">
                            <h4>Desktop theme</h4>
                            <p class="se-note">Palette, terminal colors and accent for the entire session. The interface reloads when a theme is applied.</p>
                            <div class="se-theme-grid">${themeCards}</div>
                        </div>
                        <div class="se-section">
                            <h4>Wallpaper</h4>
                            <div class="se-wallpaper-grid">
                                <button type="button" class="se-wallpaper" data-wallpaper="aurora"><span class="se-wall-aurora"></span><b>Aurora</b><small>layered ridges</small></button>
                                <button type="button" class="se-wallpaper" data-wallpaper="grid"><span class="se-wall-grid"></span><b>Grid</b><small>technical mesh</small></button>
                                <button type="button" class="se-wallpaper" data-wallpaper="solid"><span class="se-wall-solid"></span><b>Solid</b><small>flat dark</small></button>
                                <button type="button" class="se-wallpaper" data-wallpaper="custom"><span class="se-wall-custom"></span><b>Image</b><small>choose a file</small></button>
                            </div>
                            <div class="se-slider-row se-wall-dim-row">
                                <span>Dim</span>
                                <input type="range" id="seWallDim" min="0" max="60" step="1" value="20">
                                <output id="seWallDimValue">20 %</output>
                            </div>
                        </div>
                    </div>
                    <div class="se-column">
                        <div class="se-section">
                            <h4>Interface scale</h4>
                            <p class="se-note">Make the shell text a little easier to read.</p>
                            <div class="se-segment" data-pref="fontScale">
                                <button type="button" data-scale="compact">Compact</button>
                                <button type="button" data-scale="normal" class="active">Normal</button>
                                <button type="button" data-scale="large">Large</button>
                            </div>
                        </div>
                        <div class="se-section">
                            <h4>Effects</h4>
                            <label class="se-switch"><span>CRT scanlines<small>subtle texture over the interface</small></span><input type="checkbox" data-toggle="scanlines" checked><i></i></label>
                            <label class="se-switch"><span>Custom pointer<small>the anyDEX 32px arrow</small></span><input type="checkbox" data-toggle="cursor" checked><i></i></label>
                            <label class="se-switch"><span>Window shadows<small>depth around application windows</small></span><input type="checkbox" data-toggle="shadows" checked><i></i></label>
                        </div>
                    </div>
                </section>

                <section class="se-pane" data-pane="desktop">
                    <div class="se-column">
                        <div class="se-section">
                            <h4>Session</h4>
                            <p class="se-note">The shell behaves like a small desktop: windows, a panel, a desktop surface and a lock screen.</p>
                            <div class="se-action-grid">
                                <button type="button" data-action="desktop"><span>${icons.desktop || ""}</span><b>Show desktop</b><small>minimize everything</small></button>
                                <button type="button" data-action="keyboard"><span>${icons.keyboard || ""}</span><b>On-screen keyboard</b><small>touch input for the terminal</small></button>
                                <button type="button" data-action="lock"><span>${icons.power || ""}</span><b>Lock session</b><small>keep the workspace hidden</small></button>
                                <button type="button" data-action="menu"><span>${icons.logo || ""}</span><b>Open start menu</b><small>applications and actions</small></button>
                            </div>
                        </div>
                        <div class="se-section">
                            <h4>Panel clock</h4>
                            <div class="se-segment" data-pref="clock">
                                <button type="button" data-clock="24" class="active">24 hours</button>
                                <button type="button" data-clock="12">12 hours</button>
                            </div>
                        </div>
                    </div>
                    <div class="se-column">
                        <div class="se-section">
                            <h4>Terminal window</h4>
                            <p class="se-note">Window actions are also available from the title bar and the panel.</p>
                            <div class="se-action-grid">
                                <button type="button" data-action="term-min"><span>${icons.terminal || ""}</span><b>Minimize terminal</b><small>send it to the panel</small></button>
                                <button type="button" data-action="term-max"><span>${icons.fullscreen || ""}</span><b>Maximize terminal</b><small>focus mode</small></button>
                                <button type="button" data-action="files"><span>${icons.files || ""}</span><b>Open files</b><small>focus the file browser</small></button>
                                <button type="button" data-action="advanced"><span>${icons.settings || ""}</span><b>Advanced settings</b><small>shell, cwd and environment</small></button>
                            </div>
                        </div>
                        <div class="se-section">
                            <h4>Working directory</h4>
                            <div class="se-readout"><span>SHELL</span><b id="seShellPath">--</b></div>
                            <div class="se-readout"><span>START IN</span><b id="seCwd">--</b></div>
                        </div>
                    </div>
                </section>

                <section class="se-pane" data-pane="windows">
                    <div class="se-column">
                        <div class="se-section">
                            <h4>Panel</h4>
                            <p class="se-note">Height of the taskbar at the bottom of the screen.</p>
                            <div class="se-segment" data-pref="panelSize">
                                <button type="button" data-panel="compact">Compact</button>
                                <button type="button" data-panel="normal" class="active">Normal</button>
                                <button type="button" data-panel="large">Large</button>
                            </div>
                        </div>
                        <div class="se-section">
                            <h4>Visual effects</h4>
                            <label class="se-switch"><span>Animations<small>window, menu and tab transitions</small></span><input type="checkbox" data-toggle="animations" checked><i></i></label>
                            <label class="se-switch"><span>Window shadows<small>depth around application windows</small></span><input type="checkbox" data-toggle="shadows" checked><i></i></label>
                            <label class="se-switch"><span>Compact panel<small>icons only, no labels</small></span><input type="checkbox" data-toggle="compactPanel"><i></i></label>
                        </div>
                    </div>
                    <div class="se-column">
                        <div class="se-section">
                            <h4>Application windows</h4>
                            <p class="se-note">Drag a title bar to move the window. Double-click it to maximize. Every app keeps running while minimized.</p>
                            <div class="se-action-grid">
                                <button type="button" data-action="term-min"><span>${icons.terminal || ""}</span><b>Minimize terminal</b><small>send it to the panel</small></button>
                                <button type="button" data-action="term-max"><span>${icons.fullscreen || ""}</span><b>Maximize terminal</b><small>focus mode</small></button>
                                <button type="button" data-action="files"><span>${icons.files || ""}</span><b>Files window</b><small>show or hide the file browser</small></button>
                                <button type="button" data-action="desktop"><span>${icons.desktop || ""}</span><b>Show desktop</b><small>hide every window</small></button>
                            </div>
                        </div>
                        <div class="se-section">
                            <h4>Session</h4>
                            <div class="se-action-grid">
                                <button type="button" data-action="config"><span>${icons.folder_open || ""}</span><b>Config folder</b><small>themes, layouts and settings</small></button>
                                <button type="button" data-action="reload"><span>${icons.settings || ""}</span><b>Reload interface</b><small>restart the desktop UI</small></button>
                                <button type="button" data-action="lock"><span>${icons.power || ""}</span><b>Lock session</b><small>hide the workspace</small></button>
                                <button type="button" class="danger" data-action="exit"><span>${icons.power || ""}</span><b>Exit anyDEXpro</b><small>close the session</small></button>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="se-pane" data-pane="terminal">
                    <div class="se-column">
                        <div class="se-section">
                            <h4>Terminal text</h4>
                            <p class="se-note">Adjust the terminal font without leaving the session.</p>
                            <div class="se-slider-row">
                                <input type="range" id="seTermFont" min="11" max="26" step="1" value="17">
                                <output id="seTermFontValue">17 px</output>
                            </div>
                            <div class="se-terminal-preview" id="seTermPreview">
                                <span class="se-prompt">PS C:\\Users\\p\\anyDEXpro&gt;</span> <span class="se-caret">_</span>
                                <p>anyDEXpro terminal preview</p>
                            </div>
                        </div>
                        <div class="se-section">
                            <h4>Cursor</h4>
                            <div class="se-segment" data-pref="cursorStyle">
                                <button type="button" data-cursor="block" class="active">Block</button>
                                <button type="button" data-cursor="bar">Bar</button>
                                <button type="button" data-cursor="underline">Underline</button>
                            </div>
                            <label class="se-switch"><span>Blinking cursor<small>blink the terminal caret</small></span><input type="checkbox" data-toggle="cursorBlink" checked><i></i></label>
                        </div>
                    </div>
                    <div class="se-column">
                        <div class="se-section">
                            <h4>Runtime</h4>
                            <div class="se-readout"><span>TERMINAL</span><b>PowerShell / xterm.js</b></div>
                            <div class="se-readout"><span>FONT</span><b id="seTermFontName">Fira Mono</b></div>
                            <div class="se-readout"><span>TABS</span><b id="seTermTabs">1 open</b></div>
                        </div>
                        <div class="se-section">
                            <h4>Advanced</h4>
                            <p class="se-note">Change the shell executable, starting directory, keymaps and environment variables.</p>
                            <button type="button" class="se-wide-btn" data-action="advanced">${icons.settings || ""}<span>Open advanced settings</span></button>
                        </div>
                    </div>
                </section>

                <section class="se-pane" data-pane="about">
                    <div class="se-column se-about-main">
                        <div class="se-about-brand">
                            <span class="se-about-logo">${icons.logo || ""}</span>
                            <div><strong>anyDEX<em>pro</em></strong><small>desktop workspace</small></div>
                        </div>
                        <p class="se-note">A personal desktop environment built from scratch: wallpaper, taskbar, draggable app windows, terminal, file explorer, text editor, embedded browser and this settings app.</p>
                        <div class="se-about-grid">
                            <div><span>VERSION</span><b>${this.version}</b></div>
                            <div><span>LICENSE</span><b>GPL-3.0</b></div>
                            <div><span>ELECTRON</span><b>${process.versions.electron}</b></div>
                            <div><span>CHROMIUM</span><b>${process.versions.chrome}</b></div>
                            <div><span>NODE</span><b>${process.versions.node}</b></div>
                            <div><span>PLATFORM</span><b>${require("os").platform()} ${require("os").arch()}</b></div>
                        </div>
                    </div>
                    <div class="se-column">
                        <div class="se-section">
                            <h4>Source</h4>
                            <p class="se-note">Code, releases and issue tracker.</p>
                            <button type="button" class="se-wide-btn" data-action="repo">${icons.github || ""}<span>github.com/anymousdark/anymousdex</span></button>
                        </div>
                        <div class="se-section">
                            <h4>Shortcuts</h4>
                            <div class="se-readout"><span>EDITOR</span><b>Ctrl + Shift + E</b></div>
                            <div class="se-readout"><span>BROWSER</span><b>Ctrl + Shift + B</b></div>
                            <div class="se-readout"><span>SETTINGS</span><b>Ctrl + Shift + S</b></div>
                        </div>
                    </div>
                </section>
            </div>

            <footer class="se-foot">
                <span>Changes apply instantly and are kept for the next session.</span>
                <button type="button" data-action="defaults">Restore defaults</button>
                <button type="button" class="se-primary" data-action="close">Done</button>
            </footer>`;

        document.body.appendChild(overlay);
        this.root = overlay;

        overlay.addEventListener("click", e => {
            const tab = e.target.closest("[data-tab]");
            if (tab) {
                this.showTab(tab.dataset.tab);
                return;
            }

            const theme = e.target.closest("[data-theme]");
            if (theme) {
                this.applyTheme(theme.dataset.theme);
                return;
            }

            const wallpaper = e.target.closest("[data-wallpaper]");
            if (wallpaper) {
                this.chooseWallpaper(wallpaper.dataset.wallpaper);
                return;
            }

            const scale = e.target.closest("[data-scale]");
            if (scale) {
                SettingsApp.write("fontScale", scale.dataset.scale);
                SettingsApp.applyPreferences();
                this.refresh();
                return;
            }

            const clock = e.target.closest("[data-clock]");
            if (clock) {
                SettingsApp.write("clock24", clock.dataset.clock === "24" ? "1" : "0");
                SettingsApp.applyPreferences();
                this.refresh();
                return;
            }

            const panel = e.target.closest("[data-panel]");
            if (panel) {
                SettingsApp.write("panelSize", panel.dataset.panel);
                SettingsApp.applyPreferences();
                this.refresh();
                return;
            }

            const cursor = e.target.closest("[data-cursor]");
            if (cursor) {
                SettingsApp.write("cursorStyle", cursor.dataset.cursor);
                SettingsApp.applyTerminalOptions();
                this.refresh();
                return;
            }

            const action = e.target.closest("[data-action]");
            if (!action) return;
            this.runAction(action.dataset.action);
        });

        overlay.addEventListener("change", e => {
            const input = e.target.closest("[data-toggle]");
            if (!input) return;
            SettingsApp.write(input.dataset.toggle, input.checked ? "1" : "0");
            SettingsApp.applyPreferences();
            if (input.dataset.toggle === "cursorBlink") SettingsApp.applyTerminalOptions();
            this.refresh();
        });

        const font = document.getElementById("seTermFont");
        font.addEventListener("input", () => {
            const size = Number(font.value);
            document.getElementById("seTermFontValue").textContent = size + " px";
            document.getElementById("seTermPreview").style.fontSize = (size / 17) + "em";
            this.applyTerminalFont(size, false);
        });
        font.addEventListener("change", () => {
            this.applyTerminalFont(Number(font.value), true);
        });

        const dim = document.getElementById("seWallDim");
        if (dim) {
            dim.addEventListener("input", () => {
                const value = Number(dim.value);
                document.getElementById("seWallDimValue").textContent = value + " %";
                document.documentElement.style.setProperty("--xde-wall-dim", String(value / 100));
            });
            dim.addEventListener("change", () => {
                SettingsApp.write("wallDim", Number(dim.value));
                SettingsApp.applyPreferences();
            });
        }

        document.addEventListener("keydown", e => {
            if (!this.visible) return;
            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                this.close();
            }
        }, true);

        return overlay;
    }

    bind() {}

    open() {
        this.ensureDom();
        SettingsApp.applyPreferences();
        SettingsApp.applyTerminalOptions();
        this.refresh();
        this.root.classList.add("open");
        this.visible = true;
        document.body.classList.add("settingsOpen");
    }

    close() {
        if (!this.root) return;
        this.root.classList.remove("open");
        this.visible = false;
        document.body.classList.remove("settingsOpen");
        if (window.term && window.term[window.currentTerm] && window.term[window.currentTerm].term) {
            window.term[window.currentTerm].term.focus();
        }
    }

    toggle() {
        if (this.visible) this.close();
        else this.open();
    }

    showTab(name) {
        this.activeTab = name;
        this.root.querySelectorAll(".se-tabs [data-tab]").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === name));
        this.root.querySelectorAll(".se-pane").forEach(pane => pane.classList.toggle("active", pane.dataset.pane === name));
    }

    refresh() {
        if (!this.root) return;

        this.root.querySelectorAll("[data-theme]").forEach(btn => btn.classList.toggle("active", btn.dataset.theme === window.settings.theme));

        const wallpaper = SettingsApp.read("wallpaper", "aurora");
        this.root.querySelectorAll("[data-wallpaper]").forEach(btn => btn.classList.toggle("active", btn.dataset.wallpaper === wallpaper));

        const scale = SettingsApp.read("fontScale", "normal");
        this.root.querySelectorAll("[data-scale]").forEach(btn => btn.classList.toggle("active", btn.dataset.scale === scale));

        const clock24 = SettingsApp.read("clock24", window.settings.clockHours === 12 ? "0" : "1");
        this.root.querySelectorAll("[data-clock]").forEach(btn => btn.classList.toggle("active", btn.dataset.clock === clock24));

        const panel = SettingsApp.read("panelSize", "normal");
        this.root.querySelectorAll("[data-panel]").forEach(btn => btn.classList.toggle("active", btn.dataset.panel === panel));

        const cursorStyle = SettingsApp.read("cursorStyle", "block");
        this.root.querySelectorAll("[data-cursor]").forEach(btn => btn.classList.toggle("active", btn.dataset.cursor === cursorStyle));

        const dimValue = Math.min(60, Math.max(0, Number(SettingsApp.read("wallDim", "20")) || 0));
        const dimInput = document.getElementById("seWallDim");
        if (dimInput) {
            dimInput.value = dimValue;
            document.getElementById("seWallDimValue").textContent = dimValue + " %";
        }

        const offByDefault = ["compactPanel"];
        this.root.querySelectorAll("[data-toggle]").forEach(input => {
            const fallback = offByDefault.includes(input.dataset.toggle) ? "0" : "1";
            input.checked = SettingsApp.read(input.dataset.toggle, fallback) === "1";
        });

        const font = document.getElementById("seTermFont");
        if (font) {
            const size = Number(SettingsApp.read("termFontSize", window.theme.terminal.fontSize || 17));
            font.value = size;
            document.getElementById("seTermFontValue").textContent = size + " px";
            document.getElementById("seTermPreview").style.fontSize = (size / 17) + "em";
        }

        const shellPath = document.getElementById("seShellPath");
        const cwd = document.getElementById("seCwd");
        if (shellPath) shellPath.textContent = window.settings.shell || "--";
        if (cwd) cwd.textContent = window.settings.cwd || "--";
        const tabs = document.getElementById("seTermTabs");
        if (tabs) tabs.textContent = Object.keys(window.term || {}).length + " open";
    }

    runAction(action) {
        const shell = window.desktopShell;
        switch (action) {
            case "close":
                this.close();
                break;
            case "advanced":
                this.close();
                window.openSettings();
                break;
            case "defaults":
                ["wallpaper", "wallpaper.custom", "fontScale", "scanlines", "cursor", "desktopIcons", "compactPanel", "clock24", "termFontSize", "wallDim", "panelSize", "cursorStyle", "cursorBlink", "animations", "shadows"].forEach(key => {
                    try { localStorage.removeItem("anydexpro." + key); } catch (e) {}
                });
                SettingsApp.applyPreferences();
                SettingsApp.applyTerminalOptions();
                this.refresh();
                break;
            case "config":
                try {
                    const remote = require("@electron/remote");
                    remote.shell.openPath(remote.app.getPath("userData"));
                } catch (e) {}
                break;
            case "reload":
                window.location.reload();
                break;
            case "exit":
                try { require("@electron/remote").app.quit(); } catch (e) {}
                break;
            case "repo":
                try { require("@electron/remote").shell.openExternal("https://github.com/anymousdark/anymousdex"); } catch (e) {}
                break;
            case "desktop":
                this.close();
                if (shell) shell.toggleDesktop(true);
                break;
            case "keyboard":
                if (shell) shell.toggleKeyboard();
                this.refresh();
                break;
            case "menu":
                this.close();
                if (shell) shell.openMenu();
                break;
            case "lock":
                this.close();
                if (shell) shell.lock();
                break;
            case "term-min":
                if (shell) shell.minimizeWindow("terminal");
                this.close();
                break;
            case "term-max":
                if (shell) shell.toggleMaximizeWindow("terminal");
                this.close();
                break;
            case "files":
                if (shell) shell.openApp("files");
                this.close();
                break;
        }
    }

    chooseWallpaper(name) {
        if (name === "custom") {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.addEventListener("change", () => {
                const file = input.files && input.files[0];
                if (!file || !file.path) return;
                const url = new URL("file:///" + file.path.replace(/\\/g, "/")).href;
                SettingsApp.write("wallpaper.custom", url);
                SettingsApp.write("wallpaper", "custom");
                SettingsApp.applyPreferences();
                this.refresh();
            });
            input.click();
            return;
        }
        SettingsApp.write("wallpaper", name);
        SettingsApp.applyPreferences();
        this.refresh();
    }

    applyTheme(name) {
        if (name === window.settings.theme) return;
        this.close();
        window.themeChanger(name);
    }

    applyTerminalFont(size, persist) {
        if (persist) SettingsApp.write("termFontSize", size);
        Object.keys(window.term || {}).forEach(key => {
            const term = window.term[key];
            try {
                term.term.options.fontSize = size;
                term.fit();
            } catch (e) {}
        });
    }
}

window.SettingsApp = SettingsApp;
