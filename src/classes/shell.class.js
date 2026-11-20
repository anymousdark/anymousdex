// anyDEXpro - XFCE-inspired desktop shell
// Bottom panel, start menu, desktop surface, tray and custom pointer.

class DesktopShell {
    constructor(opts = {}) {
        this.themes = Array.isArray(opts.themes) ? opts.themes : [];
        this.version = opts.version || "0.0.0";
        this.menuOpen = false;
        this.statsTimer = null;
        this.clockTimer = null;
        this.desktopMode = false;
        this.activeCategory = "apps";
        this._zTop = 1160;
        this._maxStyles = new Map();
        this._keyboardWasVisible = false;

        this.ICONS = {
            logo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 8.2l3.8 3.8L8 15.8"/><path d="M13 15.8h3.4"/></svg>`,
            terminal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4" width="19" height="16" rx="2.5"/><path d="M6.5 9l3 3-3 3"/><path d="M12 15.5h5"/></svg>`,
            files: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
            editor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2.5h8l4 4V21.5H6z"/><path d="M14 2.5V7h5"/><path d="M9 12h6M9 15.5h6"/></svg>`,
            web: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.7 2.6 4 5.8 4 9s-1.3 6.4-4 9c-2.7-2.6-4-5.8-4-9s1.3-6.4 4-9z"/></svg>`,
            settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h7M15 7h5"/><circle cx="13" cy="7" r="2"/><path d="M4 17h5M13 17h7"/><circle cx="11" cy="17" r="2"/></svg>`,
            shortcuts: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M6 13.5h.01M9.5 13.5h.01M13 13.5h.01M16.5 13.5h.01M8 16.5h8"/></svg>`,
            keyboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M6 13.5h.01M9.5 13.5h.01M13 13.5h.01M16.5 13.5h.01M8 16.5h8"/></svg>`,
            desktop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
            power: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v9"/><path d="M7.2 5.8a8 8 0 1 0 9.6 0"/></svg>`,
            fullscreen: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>`,
            search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.2-3.2"/></svg>`,
            close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
            palette: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 0 18h1.4a2 2 0 0 0 1.6-3.2 2 2 0 0 1 1.6-3.2H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3z"/><path d="M7.5 10h.01M10 6.8h.01M14 6.8h.01M16.5 10h.01"/></svg>`,
            info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.6h.01"/></svg>`,
            github: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-4.3 1.4-4.3-2.2-6-2.7M15 21v-3.4a3 3 0 0 0-.7-2.3c2.6-.3 5.4-1.3 5.4-6a4.7 4.7 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2S17.1 2.5 15 4a11.3 11.3 0 0 0-6 0C6.9 2.5 5.6 2.9 5.6 2.9a4.3 4.3 0 0 0-.1 3.2A4.7 4.7 0 0 0 4.2 9.3c0 4.7 2.8 5.7 5.4 6a3 3 0 0 0-.7 2.3V21"/></svg>`,
            folder_open: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v1"/><path d="M3 9h18l-2.5 10.5H5z"/></svg>`
        };

        this.apps = {
            terminal: { name: "Terminal", desc: "Main shell session", icon: "terminal", category: "apps" },
            files: { name: "Files", desc: "Browse the working directory", icon: "files", category: "apps" },
            editor: { name: "Text Editor", desc: "Edit files without leaving", icon: "editor", category: "apps" },
            web: { name: "Web", desc: "Sandboxed embedded browser", icon: "web", category: "apps" },
            settings: { name: "Settings", desc: "Wallpaper, apps and windows", icon: "settings", category: "apps" },
            shortcuts: { name: "Shortcuts", desc: "Every hotkey in one place", icon: "shortcuts", category: "apps" }
        };
    }

    mount() {
        if (document.getElementById("xde_taskbar")) return this;

        this.ensureDom();
        this.bindEvents();
        this.applyInitialLayout();
        this.decorateApps();
        this.enableWindowDrag();
        this.startClock();
        this.startStats();
        this.observeOverlays();
        return this;
    }

    ensureDom() {
        const appCard = key => {
            const app = this.apps[key];
            return `<button type="button" class="xde-app" data-open="${key}" data-search="${app.name} ${app.desc}">
                <span class="xde-app-icon">${this.ICONS[app.icon]}</span>
                <span class="xde-app-text"><strong>${app.name}</strong><small>${app.desc}</small></span>
            </button>`;
        };

        const taskButton = (key, label) => `<button type="button" class="xde-task" data-open="${key}" title="${label}">
            ${this.ICONS[key === "files" ? "files" : key]}
            <span>${label}</span>
        </button>`;

        const themeButtons = this.themes.length ? this.themes.map(theme => `<button type="button" class="xde-theme" data-theme="${theme.name}" title="Switch to ${theme.name} theme">
            <span class="xde-theme-dot" style="background:${theme.color}"></span>
            <span>${theme.name}</span>
        </button>`).join("") : `<p class="xde-empty">No themes found.</p>`;

        const root = document.createElement("div");
        root.id = "xde_root";
        root.innerHTML = `
        <div id="xde_desktop" aria-hidden="true">
            <div class="xde-desktop-head">
                <div class="xde-desktop-brand"><span class="xde-logo-sm">${this.ICONS.logo}</span><strong>anyDEX<em>pro</em></strong></div>
                <div class="xde-desktop-hint">DESKTOP SESSION</div>
            </div>
            <div class="xde-desktop-icons">
                <button type="button" class="xde-dicon" data-open="terminal"><span>${this.ICONS.terminal}</span><b>Terminal</b></button>
                <button type="button" class="xde-dicon" data-open="files"><span>${this.ICONS.files}</span><b>Files</b></button>
                <button type="button" class="xde-dicon" data-open="editor"><span>${this.ICONS.editor}</span><b>Editor</b></button>
                <button type="button" class="xde-dicon" data-open="web"><span>${this.ICONS.web}</span><b>Browser</b></button>
                <button type="button" class="xde-dicon" data-open="settings"><span>${this.ICONS.settings}</span><b>Settings</b></button>
                <button type="button" class="xde-dicon" data-open="shortcuts"><span>${this.ICONS.shortcuts}</span><b>Shortcuts</b></button>
            </div>
            <div class="xde-desktop-foot">
                <span>${this.ICONS.logo}</span>
                <div><strong>anyDEXpro</strong><small>Desktop session · v${this.version}</small></div>
            </div>
        </div>

        <div id="xde_desktop_icons" aria-label="Desktop shortcuts">
            <button type="button" class="xde-dicon" data-open="terminal"><span>${this.ICONS.terminal}</span><b>Terminal</b></button>
            <button type="button" class="xde-dicon" data-open="files"><span>${this.ICONS.files}</span><b>Files</b></button>
            <button type="button" class="xde-dicon" data-open="editor"><span>${this.ICONS.editor}</span><b>Editor</b></button>
            <button type="button" class="xde-dicon" data-open="web"><span>${this.ICONS.web}</span><b>Browser</b></button>
            <button type="button" class="xde-dicon" data-open="settings"><span>${this.ICONS.settings}</span><b>Settings</b></button>
        </div>

        <div id="xde_taskbar" role="toolbar" aria-label="anyDEXpro panel">
            <button type="button" id="xde_start" class="xde-start" title="Open the anyDEXpro menu">
                <span class="xde-logo">${this.ICONS.logo}</span>
                <span class="xde-start-text"><strong>anyDEX</strong><em>pro</em></span>
            </button>
            <span class="xde-panel-sep"></span>
            <div class="xde-tasks">
                ${taskButton("terminal", "Terminal")}
                ${taskButton("files", "Files")}
                ${taskButton("editor", "Editor")}
                ${taskButton("web", "Web")}
                ${taskButton("settings", "Settings")}
            </div>
            <div class="xde-tray">
                <button type="button" class="xde-tray-btn" id="xde_show_desktop" title="Show desktop">${this.ICONS.desktop}</button>
                <button type="button" class="xde-tray-btn" id="xde_keyboard_btn" title="Show on-screen keyboard">${this.ICONS.keyboard}</button>
                <div class="xde-tray-stats" title="Live CPU and memory usage">
                    <span><i class="xde-stat-dot cpu"></i><b id="xde_cpu">CPU --</b></span>
                    <span><i class="xde-stat-dot ram"></i><b id="xde_ram">RAM --</b></span>
                </div>
                <div class="xde-clock" title="Session clock">
                    <span id="xde_clock_time">--:--</span>
                    <small id="xde_clock_date">---</small>
                </div>
                <button type="button" class="xde-tray-btn" id="xde_power" title="Session menu">${this.ICONS.power}</button>
            </div>
        </div>

        <div id="xde_menu" role="dialog" aria-label="anyDEXpro applications menu" aria-hidden="true">
            <div class="xde-menu-head">
                <span class="xde-menu-avatar">${this.ICONS.logo}</span>
                <div class="xde-menu-id"><strong>anyDEX<em>pro</em></strong><small>Application launcher</small></div>
                <button type="button" class="xde-menu-close" id="xde_menu_close" title="Close menu">${this.ICONS.close}</button>
            </div>
            <div class="xde-menu-search">
                ${this.ICONS.search}
                <input type="text" id="xde_menu_search" placeholder="Search applications and actions..." spellcheck="false" autocomplete="off" />
                <kbd>ESC</kbd>
            </div>
            <div class="xde-menu-body">
                <nav class="xde-menu-side">
                    <button type="button" class="xde-cat active" data-cat="apps"><span>${this.ICONS.terminal}</span>Applications</button>
                    <button type="button" class="xde-cat" data-cat="system"><span>${this.ICONS.settings}</span>System</button>
                    <button type="button" class="xde-cat" data-cat="appearance"><span>${this.ICONS.palette}</span>Appearance</button>
                    <button type="button" class="xde-cat" data-cat="about"><span>${this.ICONS.info}</span>About</button>
                </nav>
                <div class="xde-menu-content">
                    <div class="xde-cat-pane active" data-pane="apps">
                        <h4>Applications</h4>
                        <div class="xde-app-grid">${Object.keys(this.apps).map(appCard).join("")}</div>
                    </div>
                    <div class="xde-cat-pane" data-pane="system">
                        <h4>System actions</h4>
                        <div class="xde-app-grid">
                            <button type="button" class="xde-app" data-open="kb" data-search="keyboard touch on screen toggle"><span class="xde-app-icon">${this.ICONS.keyboard}</span><span class="xde-app-text"><strong>On-screen keyboard</strong><small>Show or hide the touch keys</small></span></button>
                            <button type="button" class="xde-app" data-open="fullscreen" data-search="fullscreen window mode"><span class="xde-app-icon">${this.ICONS.fullscreen}</span><span class="xde-app-text"><strong>Fullscreen</strong><small>Toggle the window mode</small></span></button>
                            <button type="button" class="xde-app" data-open="desktop" data-search="show desktop minimize panels"><span class="xde-app-icon">${this.ICONS.desktop}</span><span class="xde-app-text"><strong>Show desktop</strong><small>Hide panels and open the desktop</small></span></button>
                            <button type="button" class="xde-app" data-open="settings" data-search="settings configuration preferences"><span class="xde-app-icon">${this.ICONS.settings}</span><span class="xde-app-text"><strong>Settings</strong><small>Shell, theme and hardware</small></span></button>
                            <button type="button" class="xde-app" data-open="shortcuts" data-search="keyboard shortcuts hotkeys"><span class="xde-app-icon">${this.ICONS.shortcuts}</span><span class="xde-app-text"><strong>Keyboard shortcuts</strong><small>List every available shortcut</small></span></button>
                            <button type="button" class="xde-app danger" data-open="exit" data-search="exit quit close session power off"><span class="xde-app-icon">${this.ICONS.power}</span><span class="xde-app-text"><strong>Exit anyDEXpro</strong><small>Close the session</small></span></button>
                        </div>
                    </div>
                    <div class="xde-cat-pane" data-pane="appearance">
                        <h4>Desktop theme</h4>
                        <p class="xde-pane-note">The whole interface reloads with a new palette, cursor and terminal colors.</p>
                        <div class="xde-theme-grid">${themeButtons}</div>
                        <div class="xde-cursor-note"><span class="xde-cursor-preview"></span><div><strong>anymous pointer</strong><small>Custom 32px arrow · enabled</small></div></div>
                    </div>
                    <div class="xde-cat-pane" data-pane="about">
                        <h4>anyDEXpro</h4>
                        <p class="xde-about-version">Version ${this.version} · Electron ${process.versions.electron} · Chromium ${process.versions.chrome}</p>
                        <p class="xde-pane-note">A personal desktop environment with a taskbar, draggable application windows, terminal, file explorer, text editor and embedded browser. Built from open source, kept portable.</p>
                        <div class="xde-about-grid">
                            <div><span>LICENSE</span><b>GPL-3.0</b></div>
                            <div><span>PLATFORM</span><b>${require("os").platform()} ${require("os").arch()}</b></div>
                            <div><span>NODE</span><b>${process.versions.node}</b></div>
                        </div>
                        <div class="xde-about-links">
                            <button type="button" data-link="https://github.com/anymousdark/anymousdex">${this.ICONS.github}<span>Source and releases</span></button>
                        </div>
                    </div>
                    <div class="xde-cat-pane" data-pane="search">
                        <h4>Search results</h4>
                        <div class="xde-app-grid" id="xde_search_results"></div>
                        <p class="xde-empty" id="xde_search_empty" hidden>Nothing matches that search.</p>
                    </div>
                </div>
            </div>
            <div class="xde-menu-foot">
                <button type="button" data-open="settings">${this.ICONS.settings}<span>Settings</span></button>
                <button type="button" data-open="shortcuts">${this.ICONS.shortcuts}<span>Shortcuts</span></button>
                <span class="xde-foot-spacer"></span>
                <button type="button" class="danger" data-open="exit">${this.ICONS.power}<span>Exit</span></button>
            </div>
        </div>

        <div id="xde_lock" aria-hidden="true">
            <div class="xde-lock-box">
                <span class="xde-lock-logo">${this.ICONS.logo}</span>
                <strong>anyDEX<em>pro</em></strong>
                <p id="xde_lock_time">--:--</p>
                <small id="xde_lock_date">---</small>
                <button type="button" id="xde_unlock">Unlock session</button>
                <span class="xde-lock-hint">Session locked · press Enter or click to return</span>
            </div>
        </div>`;

        document.body.appendChild(root);
        this.menu = document.getElementById("xde_menu");
        this.taskbar = document.getElementById("xde_taskbar");
        this.startButton = document.getElementById("xde_start");
        this.searchInput = document.getElementById("xde_menu_search");
        this.desktop = document.getElementById("xde_desktop");
    }

    bindEvents() {
        document.getElementById("xde_menu_close").addEventListener("click", () => this.closeMenu());
        document.getElementById("xde_power").addEventListener("click", () => this.openMenu("system"));

        this.startButton.addEventListener("click", e => {
            e.stopPropagation();
            this.toggleMenu();
        });

        this.taskbar.addEventListener("click", e => {
            const btn = e.target.closest("[data-open]");
            if (!btn) return;
            this.openApp(btn.dataset.open);
        });

        this.menu.addEventListener("click", e => {
            const open = e.target.closest("[data-open]");
            if (open) {
                e.stopPropagation();
                this.openApp(open.dataset.open);
                return;
            }
            const theme = e.target.closest("[data-theme]");
            if (theme) {
                this.applyTheme(theme.dataset.theme);
                return;
            }
            const cat = e.target.closest(".xde-cat");
            if (cat) {
                this.showCategory(cat.dataset.cat);
                return;
            }
            const link = e.target.closest("[data-link]");
            if (link) {
                try {
                    require("@electron/remote").shell.openExternal(link.dataset.link);
                } catch (err) {}
                this.closeMenu();
            }
        });

        this.desktop.addEventListener("click", e => {
            const open = e.target.closest("[data-open]");
            if (open) this.openApp(open.dataset.open);
        });

        const desktopIcons = document.getElementById("xde_desktop_icons");
        if (desktopIcons) {
            desktopIcons.addEventListener("click", e => {
                const open = e.target.closest("[data-open]");
                if (open) this.openApp(open.dataset.open);
            });
        }

        document.getElementById("xde_show_desktop").addEventListener("click", () => this.toggleDesktop());
        document.getElementById("xde_keyboard_btn").addEventListener("click", () => this.toggleKeyboard());

        // Window controls live inside the terminal title bar, added after mount
        document.addEventListener("click", e => {
            const control = e.target.closest("[data-win]");
            if (!control) return;
            if (control.dataset.win === "min") this.minimizeWindow(control.dataset.for || "terminal");
            else if (control.dataset.win === "max") this.toggleMaximizeWindow(control.dataset.for || "terminal");
            else if (control.dataset.win === "close") this.minimizeWindow(control.dataset.for || "terminal");
        });

        document.getElementById("xde_unlock").addEventListener("click", () => this.unlock());
        document.getElementById("xde_lock").addEventListener("click", e => {
            if (e.target.closest("button")) this.unlock();
        });
        document.addEventListener("keydown", e => {
            if (!document.body.classList.contains("xde-locked")) return;
            if (e.key === "Enter" || e.key === "Escape" || e.key === " ") {
                e.preventDefault();
                this.unlock();
            }
        });

        this.searchInput.addEventListener("input", () => this.filterSearch());

        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && this.menuOpen) {
                e.preventDefault();
                e.stopPropagation();
                this.closeMenu();
                if (window.term && window.term[window.currentTerm]) window.term[window.currentTerm].term.focus();
            }
        });

        document.addEventListener("mousedown", e => {
            if (!this.menuOpen) return;
            if (e.target.closest("#xde_menu, #xde_start, #xde_power")) return;
            this.closeMenu();
        });

        this.searchInput.addEventListener("keydown", e => {
            if (e.key !== "Enter") return;
            const first = document.querySelector("#xde_search_results .xde-app");
            if (first) {
                this.openApp(first.dataset.open);
            } else {
                const active = document.querySelector(`.xde-cat-pane.active:not([data-pane="search"]) .xde-app`);
                if (active) this.openApp(active.dataset.open);
            }
        });
    }

    applyInitialLayout() {
        const keyboardVisible = this.keyboardVisible();
        document.body.classList.toggle("xde-kb-hidden", !keyboardVisible);
        document.getElementById("xde_keyboard_btn").classList.toggle("on", keyboardVisible);
        document.getElementById("xde_keyboard_btn").title = keyboardVisible ? "Hide on-screen keyboard" : "Show on-screen keyboard";
        if (!keyboardVisible && window.keyboard) {
            try {
                window.keyboard.detach();
            } catch (e) {}
        }
    }

    keyboardVisible() {
        try {
            return localStorage.getItem("xde.keyboard.visible") === "1";
        } catch (e) {
            return false;
        }
    }

    toggleKeyboard() {
        const show = !this.keyboardVisible();
        try {
            localStorage.setItem("xde.keyboard.visible", show ? "1" : "0");
        } catch (e) {}

        document.body.classList.toggle("xde-kb-hidden", !show);
        const btn = document.getElementById("xde_keyboard_btn");
        btn.classList.toggle("on", show);
        btn.title = show ? "Hide on-screen keyboard" : "Show on-screen keyboard";

        if (window.keyboard) {
            if (show) window.keyboard.attach();
            else window.keyboard.detach();
        }

        window.setTimeout(() => {
            try {
                if (window.term && window.term[window.currentTerm]) window.term[window.currentTerm].fit();
                window.dispatchEvent(new Event("resize"));
            } catch (e) {}
        }, 320);
    }

    toggleMenu() {
        if (this.menuOpen) this.closeMenu();
        else this.openMenu();
    }

    openMenu(category) {
        this.menuOpen = true;
        this.menu.classList.add("open");
        this.menu.setAttribute("aria-hidden", "false");
        this.startButton.classList.add("open");
        this.searchInput.value = "";
        this.showCategory(category || "apps");
        window.setTimeout(() => this.searchInput.focus(), 60);
    }

    closeMenu() {
        if (!this.menuOpen) return;
        this.menuOpen = false;
        this.menu.classList.remove("open");
        this.menu.setAttribute("aria-hidden", "true");
        this.startButton.classList.remove("open");
        this.searchInput.blur();
    }

    showCategory(name) {
        this.activeCategory = name;
        document.querySelectorAll("#xde_menu .xde-cat").forEach(btn => btn.classList.toggle("active", btn.dataset.cat === name));
        document.querySelectorAll("#xde_menu .xde-cat-pane").forEach(pane => pane.classList.toggle("active", pane.dataset.pane === name));
        document.querySelectorAll("#xde_menu .xde-cat-pane[data-pane='search']").forEach(pane => pane.classList.remove("active"));
        this.searchInput.value = "";
    }

    filterSearch() {
        const query = this.searchInput.value.trim().toLowerCase();
        const searchPane = document.querySelector("#xde_menu .xde-cat-pane[data-pane='search']");
        const results = document.getElementById("xde_search_results");
        const empty = document.getElementById("xde_search_empty");

        if (!query) {
            searchPane.classList.remove("active");
            results.innerHTML = "";
            empty.hidden = true;
            this.showCategory(this.activeCategory);
            return;
        }

        document.querySelectorAll("#xde_menu .xde-cat-pane").forEach(pane => pane.classList.remove("active"));
        searchPane.classList.add("active");

        const seen = new Set();
        const found = [];
        document.querySelectorAll("#xde_menu .xde-cat-pane:not([data-pane='search']) .xde-app").forEach(card => {
            const text = (card.dataset.search || card.textContent || "").toLowerCase();
            if (!seen.has(card.dataset.open) && text.includes(query)) {
                seen.add(card.dataset.open);
                found.push(card.outerHTML);
            }
        });

        results.innerHTML = found.join("");
        empty.hidden = found.length > 0;
    }

    openApp(app) {
        this.closeMenu();
        if (this.desktopMode && app !== "desktop") this.toggleDesktop(false);

        switch (app) {
            case "terminal":
                this.restoreWindow("terminal");
                try {
                    window.focusShellTab(0);
                    window.setTimeout(() => window.term[0].term.focus(), 80);
                } catch (e) {}
                break;
            case "files":
                this.toggleFilesWindow();
                break;
            case "editor":
                window.useAppShortcut("TEXT_EDITOR");
                break;
            case "web":
                window.useAppShortcut("WEB_BROWSER");
                break;
            case "settings":
                if (window.settingsApp) window.settingsApp.open();
                else window.openSettings();
                break;
            case "shortcuts":
                window.openShortcutsHelp();
                break;
            case "kb":
                this.toggleKeyboard();
                break;
            case "fullscreen":
                window.toggleFullScreen();
                break;
            case "desktop":
                this.toggleDesktop();
                break;
            case "exit":
                require("@electron/remote").app.quit();
                break;
        }

        const target = {
            terminal: "main_shell",
            files: "filesystem",
            editor: "textEditorOverlay",
            web: "browserOverlay",
            settings: "settingsOverlay"
        }[app];
        if (target) {
            window.setTimeout(() => this.bringToFront(document.getElementById(target)), 60);
        }
        this.hideKeyboardForApps();
    }

    decorateApps() {
        const fs = document.getElementById("filesystem");
        if (fs && !fs.querySelector(".xde-fs-close")) {
            const title = fs.querySelector("h3.title");
            if (title) {
                const icon = document.createElement("span");
                icon.className = "xde-fs-icon";
                icon.innerHTML = this.ICONS.files;
                title.insertBefore(icon, title.firstChild);
            }

            const min = document.createElement("button");
            min.type = "button";
            min.className = "xde-fs-min";
            min.title = "Minimize files";
            min.innerHTML = `<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><path d="M2 5.2h6"/></svg>`;
            min.addEventListener("click", e => {
                e.stopPropagation();
                this.minimizeWindow("files");
            });
            fs.appendChild(min);

            const close = document.createElement("button");
            close.type = "button";
            close.className = "xde-fs-close";
            close.title = "Close files";
            close.innerHTML = this.ICONS.close;
            close.addEventListener("click", e => {
                e.stopPropagation();
                this.closeFilesWindow();
            });
            fs.appendChild(close);
        }
        const termTask = document.querySelector(".xde-task[data-open='terminal']");
        if (termTask) termTask.classList.add("active");
    }

    toggleFilesWindow() {
        const fs = document.getElementById("filesystem");
        if (!fs) return;
        if (fs.classList.contains("xde-files-min")) {
            this.restoreWindow("files");
            this.flash(fs);
        } else if (fs.classList.contains("xde-window-open")) {
            this.bringToFront(fs);
            this.flash(fs);
        } else {
            fs.classList.add("xde-window-open");
            this.bringToFront(fs);
            const task = document.querySelector(".xde-task[data-open='files']");
            if (task) task.classList.add("active");
            try {
                if (window.fsDisp) {
                    const dir = window.fsDisp.cwd_path || window.settings.cwd;
                    if (window.fsDisp.cwd && window.fsDisp.cwd.length) window.fsDisp.render(window.fsDisp.cwd);
                    else if (dir) window.fsDisp.readFS(dir);
                }
            } catch (e) {}
            this.flash(fs);
        }
    }

    closeFilesWindow() {
        const fs = document.getElementById("filesystem");
        if (!fs) return;
        fs.classList.remove("xde-window-open");
        fs.classList.remove("xde-files-min");
        fs.style.zIndex = "";
        const task = document.querySelector(".xde-task[data-open='files']");
        if (task) task.classList.remove("active");
        this.restoreKeyboardAfterApps();
    }

    flash(element) {
        if (!element) return;
        element.classList.remove("xde-flash");
        void element.offsetWidth;
        element.classList.add("xde-flash");
        window.setTimeout(() => element.classList.remove("xde-flash"), 1100);
    }

    toggleDesktop(force) {
        const enable = typeof force === "boolean" ? force : !this.desktopMode;
        this.desktopMode = enable;
        document.body.classList.toggle("xde-desktop-mode", enable);

        if (enable) {
            if (window.textEditor && window.textEditor.visible) window.textEditor.close();
            if (window.browser && window.browser.visible) window.browser.close();
            if (window.keyboard) window.keyboard.detach();
        } else if (this.keyboardVisible() && window.keyboard) {
            window.keyboard.attach();
        }

        document.getElementById("xde_show_desktop").classList.toggle("on", enable);
        window.setTimeout(() => {
            try {
                if (window.term && window.term[window.currentTerm]) window.term[window.currentTerm].fit();
            } catch (e) {}
        }, 300);
    }

    applyTheme(theme) {
        this.closeMenu();
        if (theme === window.settings.theme) return;
        window.themeChanger(theme);
    }

    bringToFront(win) {
        if (!win) return;
        this._zTop = Math.min((this._zTop || 1160) + 1, 1199);
        win.style.zIndex = String(this._zTop);
    }

    hasAnyAppWindowOpen() {
        const main = document.getElementById("main_shell");
        const fs = document.getElementById("filesystem");
        const editor = document.getElementById("textEditorOverlay");
        const browser = document.getElementById("browserOverlay");
        const settings = document.getElementById("settingsOverlay");
        const termOpen = main && !main.classList.contains("xde-term-min") && main.style.display !== "none";
        return !!(termOpen ||
            (fs && fs.classList.contains("xde-window-open")) ||
            (editor && editor.classList.contains("open")) ||
            (browser && browser.classList.contains("open")) ||
            (settings && settings.classList.contains("open")));
    }

    hideKeyboardForApps() {
        this._keyboardWasVisible = this.keyboardVisible();
        try {
            localStorage.setItem("xde.keyboard.visible", "0");
        } catch (e) {}
        document.body.classList.add("xde-kb-hidden");
        document.getElementById("xde_keyboard_btn")?.classList.remove("on");
        document.getElementById("xde_keyboard_btn")?.setAttribute("title", "Show on-screen keyboard");
        if (window.keyboard) {
            try { window.keyboard.detach(); } catch (e) {}
        }
    }

    restoreKeyboardAfterApps() {
        if (!this.hasAnyAppWindowOpen()) {
            try {
                localStorage.setItem("xde.keyboard.visible", this._keyboardWasVisible ? "1" : "0");
            } catch (e) {}
            document.body.classList.toggle("xde-kb-hidden", !this._keyboardWasVisible);
            document.getElementById("xde_keyboard_btn")?.classList.toggle("on", this._keyboardWasVisible);
            document.getElementById("xde_keyboard_btn")?.setAttribute("title", this._keyboardWasVisible ? "Hide on-screen keyboard" : "Show on-screen keyboard");
            if (window.keyboard) {
                try { if (this._keyboardWasVisible) window.keyboard.attach(); } catch (e) {}
            }
        }
    }

    minimizeWindow(name) {
        document.body.classList.add(name === "files" ? "xde-files-min" : "xde-term-min");
        const task = document.querySelector(`.xde-task[data-open='${name}']`);
        if (task) task.classList.remove("active");
        this.syncWindowControls();
        this.restoreKeyboardAfterApps();
        window.setTimeout(() => window.dispatchEvent(new Event("resize")), 240);
    }

    restoreWindow(name) {
        document.body.classList.remove(name === "files" ? "xde-files-min" : "xde-term-min");
        const task = document.querySelector(`.xde-task[data-open='${name}']`);
        if (task) task.classList.add("active");
        this.syncWindowControls();
        this.hideKeyboardForApps();
        window.setTimeout(() => {
            try {
                if (window.term && window.term[window.currentTerm]) window.term[window.currentTerm].fit();
            } catch (e) {}
            window.dispatchEvent(new Event("resize"));
        }, 240);
    }

    toggleMaximizeWindow(name) {
        if (name !== "terminal") {
            this.flash(document.getElementById("filesystem"));
            return;
        }
        const win = document.getElementById("main_shell");
        const maxed = document.body.classList.toggle("xde-term-max");
        if (win) {
            if (maxed) {
                this._termInlineStyle = win.getAttribute("style") || "";
                win.removeAttribute("style");
            } else if (this._termInlineStyle) {
                win.setAttribute("style", this._termInlineStyle);
                this._termInlineStyle = "";
            }
        }
        const btn = document.getElementById("win_term_max");
        if (btn) btn.title = maxed ? "Restore terminal size" : "Maximize terminal";
        window.setTimeout(() => {
            try {
                if (window.term && window.term[window.currentTerm]) window.term[window.currentTerm].fit();
            } catch (e) {}
            window.dispatchEvent(new Event("resize"));
        }, 220);
    }

    enableWindowDrag() {
        const WINDOWS = "#main_shell, #filesystem, #settingsOverlay, #textEditorOverlay, #browserOverlay";
        const HANDLES = "#main_shell_titlebar, #filesystem > h3.title, #settingsOverlay > header, #textEditorOverlay > header, #browserOverlay > header";
        this._zTop = this._zTop || 1160;

        const raise = win => {
            if (!win || win.classList.contains("xde-locked")) return;
            this._zTop = Math.min(this._zTop + 1, 1199);
            win.style.zIndex = String(this._zTop);
        };

        const fitTerminal = () => {
            try {
                if (window.term && window.term[window.currentTerm]) window.term[window.currentTerm].fit();
            } catch (e) {}
        };

        const toFixedRect = win => {
            const rect = win.getBoundingClientRect();
            win.style.position = "fixed";
            win.style.left = rect.left + "px";
            win.style.top = rect.top + "px";
            win.style.width = rect.width + "px";
            win.style.height = rect.height + "px";
            win.style.right = "auto";
            win.style.bottom = "auto";
            win.style.margin = "0";
            return rect;
        };

        let drag = null;

        document.addEventListener("mousedown", e => {
            const win = e.target.closest ? e.target.closest(WINDOWS) : null;
            if (win) raise(win);

            const handle = e.target.closest ? e.target.closest(HANDLES) : null;
            if (!handle || e.button !== 0) return;
            if (e.target.closest("button, input, select, textarea, a, .se-tabs")) return;
            if (win && win.classList.contains("xde-win-maximized")) return;
            if (win && win.id === "main_shell" && document.body.classList.contains("xde-term-max")) return;
            if (!win) return;

            const rect = toFixedRect(win);
            drag = { win, x: e.clientX - rect.left, y: e.clientY - rect.top };
            document.body.classList.add("xde-window-dragging");
            e.preventDefault();
        });

        document.addEventListener("mousemove", e => {
            if (!drag) return;
            const panel = document.getElementById("xde_taskbar");
            const panelH = panel ? panel.getBoundingClientRect().height : 0;
            const maxLeft = Math.max(0, window.innerWidth - drag.win.offsetWidth);
            const maxTop = Math.max(0, window.innerHeight - panelH - drag.win.offsetHeight);
            drag.win.style.left = Math.min(Math.max(0, e.clientX - drag.x), maxLeft) + "px";
            drag.win.style.top = Math.min(Math.max(0, e.clientY - drag.y), maxTop) + "px";
        });

        document.addEventListener("mouseup", () => {
            if (!drag) return;
            drag = null;
            document.body.classList.remove("xde-window-dragging");
            fitTerminal();
        });

        document.addEventListener("dblclick", e => {
            if (e.target.closest("button, input, select, textarea, a, .se-tabs")) return;
            const handle = e.target.closest ? e.target.closest(HANDLES) : null;
            if (!handle) return;
            const win = e.target.closest(WINDOWS);
            if (!win) return;
            if (win.id === "main_shell") this.toggleMaximizeWindow("terminal");
            else this.toggleMaxWindow(win);
        });

        if (typeof ResizeObserver === "function") {
            const ro = new ResizeObserver(() => fitTerminal());
            const shell = document.getElementById("main_shell");
            if (shell) ro.observe(shell);
        }
    }

    toggleMaxWindow(win) {
        const maxed = win.classList.toggle("xde-win-maximized");
        if (maxed) {
            this._maxStyles.set(win, win.getAttribute("style") || "");
            win.style.removeProperty("left");
            win.style.removeProperty("top");
            win.style.removeProperty("width");
            win.style.removeProperty("height");
        } else {
            const saved = this._maxStyles.get(win);
            win.removeAttribute("style");
            if (saved) win.setAttribute("style", saved);
            this.bringToFront(win);
        }
        this.flash(win);
    }

    syncWindowControls() {
        const min = document.body.classList.contains("xde-term-min");
        const max = document.body.classList.contains("xde-term-max");
        const maxBtn = document.getElementById("win_term_max");
        if (maxBtn) maxBtn.title = max ? "Restore terminal size" : "Maximize terminal";
        const minBtn = document.getElementById("win_term_min");
        if (minBtn) minBtn.title = min ? "Restore terminal" : "Minimize terminal";
    }

    lock() {
        this.closeMenu();
        if (window.settingsApp && window.settingsApp.visible) window.settingsApp.close();
        if (this.desktopMode) this.toggleDesktop(false);
        const now = new Date();
        const time = document.getElementById("xde_lock_time");
        const date = document.getElementById("xde_lock_date");
        if (time) time.textContent = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        if (date) date.textContent = now.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long" });
        document.body.classList.add("xde-locked");
        document.getElementById("xde_lock").setAttribute("aria-hidden", "false");
        window.setTimeout(() => document.getElementById("xde_unlock").focus(), 80);
    }

    unlock() {
        document.body.classList.remove("xde-locked");
        document.getElementById("xde_lock").setAttribute("aria-hidden", "true");
        try {
            if (window.term && window.term[window.currentTerm]) window.term[window.currentTerm].term.focus();
        } catch (e) {}
    }

    startClock() {
        const tick = () => {
            const now = new Date();
            const hours12 = window.settings.clockHours === 12;
            const time = now.toLocaleTimeString(hours12 ? "en-US" : "en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: hours12
            });
            const date = now.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" });
            const timeEl = document.getElementById("xde_clock_time");
            const dateEl = document.getElementById("xde_clock_date");
            if (timeEl) timeEl.textContent = time;
            if (dateEl) dateEl.textContent = date;
        };
        tick();
        this.clockTimer = window.setInterval(tick, 15000);
    }

    startStats() {
        const update = async () => {
            if (document.hidden || !window.si) return;
            try {
                const [load, mem] = await Promise.all([window.si.currentLoad(), window.si.mem()]);
                const cpuEl = document.getElementById("xde_cpu");
                const ramEl = document.getElementById("xde_ram");
                if (cpuEl) cpuEl.textContent = "CPU " + Math.round(load.currentLoad) + "%";
                if (ramEl) ramEl.textContent = "RAM " + Math.round((mem.active / mem.total) * 100) + "%";
            } catch (e) {}
        };

        window.setTimeout(update, 2500);
        this.statsTimer = window.setInterval(update, 6000);
    }

    observeOverlays() {
        const sync = () => {
            const editor = document.querySelector(".xde-task[data-open='editor']");
            const web = document.querySelector(".xde-task[data-open='web']");
            const settings = document.querySelector(".xde-task[data-open='settings']");
            if (editor) editor.classList.toggle("active", document.body.classList.contains("editorOpen"));
            if (web) web.classList.toggle("active", document.body.classList.contains("browserOpen"));
            if (settings) settings.classList.toggle("active", document.body.classList.contains("settingsOpen"));
        };
        const observer = new MutationObserver(sync);
        observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
        sync();
    }
}
