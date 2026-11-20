// anyDEXpro - embedded web browser
class EmbeddedBrowser {
    constructor() {
        this.visible = false;
        this.root = null;
        this.webview = null;
        this.lastUrl = null;
        this.homeUrl = new URL("assets/browser_home.html", window.location.href).href;
        this._loadingTimer = null;
    }

    ensureDom() {
        if (this.root) return this.root;

        const overlay = document.createElement("div");
        overlay.id = "browserOverlay";
        overlay.innerHTML = `
            <header>
                <div class="br-brand">
                    <strong>WEB</strong>
                    <span class="br-page-title">Start page</span>
                </div>
                <div class="br-nav">
                    <button type="button" data-action="back" title="Back">BACK</button>
                    <button type="button" data-action="forward" title="Forward">FWD</button>
                    <button type="button" data-action="reload" title="Reload">RELOAD</button>
                </div>
                <form class="br-address">
                    <span class="br-scheme">LOCAL</span>
                    <input type="text" spellcheck="false" autocomplete="off" placeholder="Search with DuckDuckGo or enter an address">
                </form>
                <button type="button" data-action="home" title="Start page">HOME</button>
                <button type="button" data-action="external" title="Open in default browser">EXT</button>
                <button type="button" data-action="close" title="Close (Ctrl+Shift+B)">CLOSE</button>
            </header>
            <div class="br-progress"><span></span></div>
            <div class="br-stage"></div>`;

        document.body.appendChild(overlay);

        this.root = overlay;
        this.stage = overlay.querySelector(".br-stage");
        this.titleEl = overlay.querySelector(".br-page-title");
        this.form = overlay.querySelector(".br-address");
        this.input = overlay.querySelector(".br-address input");
        this.schemeEl = overlay.querySelector(".br-scheme");
        this.progress = overlay.querySelector(".br-progress span");
        this.backBtn = overlay.querySelector('button[data-action="back"]');
        this.forwardBtn = overlay.querySelector('button[data-action="forward"]');

        overlay.querySelector("header").addEventListener("click", e => {
            const action = e.target && e.target.dataset ? e.target.dataset.action : null;
            if (!action) return;
            switch (action) {
                case "back": if (this.webview && this.webview.canGoBack()) this.webview.goBack(); break;
                case "forward": if (this.webview && this.webview.canGoForward()) this.webview.goForward(); break;
                case "reload": if (this.webview) this.webview.reload(); break;
                case "home": this.navigate(this.homeUrl); break;
                case "external": this.openExternal(); break;
                case "close": this.close(); break;
            }
        });

        this.form.addEventListener("submit", e => {
            e.preventDefault();
            this.navigate(this.input.value);
        });

        this.input.addEventListener("keydown", e => {
            if (e.key === "Escape") {
                e.preventDefault();
                this.close();
            }
        });

        return overlay;
    }

    createWebview(src) {
        const webview = document.createElement("webview");
        webview.id = "browserView";
        webview.setAttribute("partition", "persist:anyDEXpro-browser");
        webview.setAttribute("webpreferences", "contextIsolation=yes, nodeIntegration=no");
        webview.setAttribute("allowpopups", "");

        webview.addEventListener("did-start-loading", () => this.setLoading(true));
        webview.addEventListener("did-stop-loading", () => this.setLoading(false));
        webview.addEventListener("did-navigate", e => {
            this.updateAddress(e.url);
            this.updateNav();
        });
        webview.addEventListener("did-navigate-in-page", e => {
            if (e.isMainFrame) this.updateAddress(e.url);
            this.updateNav();
        });
        webview.addEventListener("page-title-updated", e => {
            this.titleEl.textContent = e.title || "Untitled";
            this.titleEl.title = e.title || "";
        });
        webview.addEventListener("did-fail-load", e => {
            if (e.errorCode === -3) return; // aborted navigation
            this.titleEl.textContent = "Could not load page";
            this.schemeEl.textContent = "ERROR";
            this.setLoading(false);
        });
        webview.addEventListener("new-window", e => {
            e.preventDefault();
            if (/^https?:/i.test(e.url)) {
                this.navigate(e.url);
            } else if (/^mailto:/i.test(e.url)) {
                require("electron").shell.openExternal(e.url);
            }
        });

        this.stage.appendChild(webview);
        this.webview = webview;
        webview.src = src;
        return webview;
    }

    open(url) {
        this.ensureDom();
        this.root.classList.add("open");
        this.visible = true;
        document.body.classList.add("browserOpen");

        const target = url || this.lastUrl || this.homeUrl;
        if (!this.webview) {
            this.createWebview(target);
            this.updateAddress(target);
        } else if (url) {
            this.navigate(url);
        }

        setTimeout(() => {
            if (this.input) this.input.focus();
        }, 60);
    }

    close() {
        if (!this.visible) return;

        if (this.webview) {
            const current = this.webview.getURL();
            if (current) this.lastUrl = current;
            this.webview.stop();
            this.webview.remove();
            this.webview = null;
        }

        this.root.classList.remove("open");
        this.visible = false;
        document.body.classList.remove("browserOpen");
        this.setLoading(false);
        if (window.term && window.term[window.currentTerm] && window.term[window.currentTerm].term) {
            window.term[window.currentTerm].term.focus();
        }
        if (window.desktopShell) window.desktopShell.restoreKeyboardAfterApps();
    }

    toggle() {
        if (this.visible) this.close();
        else this.open();
    }

    normalize(input) {
        let value = String(input || "").trim();
        if (!value) return null;

        if (/^anymous:\/\/home$/i.test(value)) return this.homeUrl;
        if (/^(javascript|data|vbscript):/i.test(value)) return null;
        if (/^https?:\/\//i.test(value)) return value;
        if (/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/i.test(value)) return "http://" + value;
        if (/^[\w.-]+\.[a-z]{2,}(:\d+)?(\/|$)/i.test(value)) return "https://" + value;
        if (/^[\w.-]+:\d+(\/|$)/.test(value)) return "http://" + value;

        return "https://duckduckgo.com/?q=" + encodeURIComponent(value);
    }

    navigate(input) {
        const url = this.normalize(input);
        if (!url) return;
        this.ensureDom();
        if (!this.webview) {
            this.createWebview(url);
        } else {
            this.webview.loadURL(url);
        }
        this.updateAddress(url);
        this.setLoading(true);
    }

    updateAddress(url) {
        if (!url) return;
        if (url.startsWith("file://")) {
            this.input.value = "";
            this.schemeEl.textContent = "LOCAL";
            return;
        }
        this.input.value = url;
        try {
            const parsed = new URL(url);
            this.schemeEl.textContent = parsed.protocol.replace(":", "").toUpperCase();
        } catch (e) {
            this.schemeEl.textContent = "WEB";
        }
    }

    updateNav() {
        if (!this.webview) return;
        this.backBtn.disabled = !this.webview.canGoBack();
        this.forwardBtn.disabled = !this.webview.canGoForward();
    }

    setLoading(loading) {
        if (!this.root) return;
        if (loading) {
            this.root.classList.add("loading");
            this.root.classList.remove("loaded");
            if (this._loadingTimer) clearTimeout(this._loadingTimer);
            this._loadingTimer = setTimeout(() => {
                if (this.visible) {
                    this.root.classList.remove("loading");
                    this.root.classList.add("loaded");
                }
            }, 8000);
        } else {
            if (this._loadingTimer) clearTimeout(this._loadingTimer);
            this.root.classList.remove("loading");
            this.root.classList.add("loaded");
        }
        this.updateNav();
    }

    openExternal() {
        if (!this.webview) return;
        const url = this.webview.getURL();
        if (url && /^https?:/i.test(url)) {
            require("electron").shell.openExternal(url);
        }
    }
}

window.EmbeddedBrowser = EmbeddedBrowser;
