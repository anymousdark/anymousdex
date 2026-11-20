// anyDEXpro - built-in mini text editor
class TextEditor {
    constructor() {
        this.filePath = null;
        this.dirty = false;
        this.visible = false;
        this.root = null;
        this.area = null;
        this.gutter = null;
        this.fontSize = 1.55;
        this.wrap = false;
        this._statsTimer = null;
        this._lineCount = 0;

        try {
            this.wrap = localStorage.getItem("anyDEXpro.editor.wrap") === "1";
            const size = Number(localStorage.getItem("anyDEXpro.editor.fontSize"));
            if (size >= 1.1 && size <= 3) this.fontSize = size;
        } catch (e) {}
    }

    _electron() {
        return require("@electron/remote");
    }

    ensureDom() {
        if (this.root) return this.root;

        const overlay = document.createElement("div");
        overlay.id = "textEditorOverlay";
        overlay.innerHTML = `
            <header>
                <div class="te-title">
                    <strong>EDITOR</strong>
                    <span class="te-name">untitled.txt</span>
                    <span class="te-dirty" title="Unsaved changes">&#9679;</span>
                </div>
                <button type="button" data-action="new" title="New file (Ctrl+N)">NEW</button>
                <button type="button" data-action="open" title="Open file (Ctrl+O)">OPEN</button>
                <button type="button" data-action="save" title="Save (Ctrl+S)">SAVE</button>
                <button type="button" data-action="saveas" title="Save as (Ctrl+Alt+S)">SAVE AS</button>
                <button type="button" data-action="smaller" title="Decrease font size">A-</button>
                <button type="button" data-action="bigger" title="Increase font size">A+</button>
                <button type="button" data-action="wrap" title="Toggle word wrap">WRAP</button>
                <button type="button" data-action="close" title="Close (Esc)">CLOSE</button>
            </header>
            <main>
                <pre id="textEditorGutter"></pre>
                <textarea id="textEditorArea" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off"></textarea>
            </main>
            <footer>
                <span class="te-path">no file</span>
                <span class="te-pos">Ln 1, Col 1</span>
                <span class="te-words">0 words</span>
                <span class="te-chars">0 chars</span>
                <span>UTF-8</span>
            </footer>`;
        document.body.appendChild(overlay);

        this.root = overlay;
        this.area = overlay.querySelector("#textEditorArea");
        this.gutter = overlay.querySelector("#textEditorGutter");
        this.nameEl = overlay.querySelector(".te-name");
        this.dirtyEl = overlay.querySelector(".te-dirty");
        this.pathEl = overlay.querySelector(".te-path");
        this.posEl = overlay.querySelector(".te-pos");
        this.wordsEl = overlay.querySelector(".te-words");
        this.charsEl = overlay.querySelector(".te-chars");

        overlay.querySelector("header").addEventListener("click", e => {
            const action = e.target && e.target.dataset ? e.target.dataset.action : null;
            if (!action) return;
            switch (action) {
                case "new": this.newFile(); break;
                case "open": this.openFileDialog(); break;
                case "save": this.save(); break;
                case "saveas": this.saveAs(); break;
                case "close": this.close(); break;
                case "wrap": this.toggleWrap(); break;
                case "smaller": this.setFontSize(this.fontSize - 0.1); break;
                case "bigger": this.setFontSize(this.fontSize + 0.1); break;
            }
        });

        this.area.addEventListener("input", () => {
            this.setDirty(true);
            this.queueStatus();
        });
        this.area.addEventListener("scroll", () => {
            this.gutter.scrollTop = this.area.scrollTop;
        });
        this.area.addEventListener("click", () => this.updateStatus());
        this.area.addEventListener("keyup", () => this.updateStatus());
        this.area.addEventListener("keydown", e => this.handleKey(e));

        this.applyPreferences();
        this.updateLineNumbers();
        this.updateStatus();

        return overlay;
    }

    handleKey(e) {
        const mod = e.ctrlKey || e.metaKey;

        if (e.key === "Escape") {
            e.preventDefault();
            this.close();
            return;
        }
        if (e.key === "Tab") {
            e.preventDefault();
            const start = this.area.selectionStart;
            const end = this.area.selectionEnd;
            const value = this.area.value;
            if (start === end) {
                this.area.value = value.slice(0, start) + "    " + value.slice(end);
                this.area.selectionStart = this.area.selectionEnd = start + 4;
            } else {
                const lineStart = value.lastIndexOf("\n", start - 1) + 1;
                const block = value.slice(lineStart, end);
                const shifted = block.split("\n").map(line => "    " + line).join("\n");
                this.area.value = value.slice(0, lineStart) + shifted + value.slice(end);
                this.area.selectionStart = lineStart;
                this.area.selectionEnd = lineStart + shifted.length;
            }
            this.setDirty(true);
            this.queueStatus();
            return;
        }
        if (!mod) return;

        const key = e.key.toLowerCase();
        if (key === "s") {
            e.preventDefault();
            e.stopPropagation();
            if (e.altKey) this.saveAs();
            else this.save();
        } else if (key === "o") {
            e.preventDefault();
            e.stopPropagation();
            this.openFileDialog();
        } else if (key === "n") {
            e.preventDefault();
            e.stopPropagation();
            this.newFile();
        } else if (key === "w") {
            e.preventDefault();
            e.stopPropagation();
            this.close();
        } else if (key === "=" || key === "+") {
            e.preventDefault();
            this.setFontSize(this.fontSize + 0.1);
        } else if (key === "-") {
            e.preventDefault();
            this.setFontSize(this.fontSize - 0.1);
        }
    }

    toggle() {
        if (this.visible) this.close();
        else this.open();
    }

    open(filePath) {
        this.ensureDom();
        this.root.classList.add("open");
        this.visible = true;
        document.body.classList.add("editorOpen");

        if (filePath) this.load(filePath);

        setTimeout(() => {
            this.area.focus();
            this.updateStatus();
        }, 30);
    }

    close() {
        if (!this.visible) return;
        if (!this.confirmDiscard()) return;

        this.root.classList.remove("open");
        this.visible = false;
        document.body.classList.remove("editorOpen");
        if (window.term && window.term[window.currentTerm] && window.term[window.currentTerm].term) {
            window.term[window.currentTerm].term.focus();
        }
        if (window.desktopShell) window.desktopShell.restoreKeyboardAfterApps();
    }

    setDirty(dirty) {
        this.dirty = dirty;
        if (this.dirtyEl) this.dirtyEl.classList.toggle("on", dirty);
    }

    setFontSize(size) {
        this.fontSize = Math.min(3, Math.max(1.1, Math.round(size * 100) / 100));
        this.applyPreferences();
        this.updateLineNumbers();
    }

    toggleWrap() {
        this.wrap = !this.wrap;
        this.applyPreferences();
        try { localStorage.setItem("anyDEXpro.editor.wrap", this.wrap ? "1" : "0"); } catch (e) {}
    }

    applyPreferences() {
        if (!this.area) return;
        this.area.classList.toggle("wrap", this.wrap);
        this.root.classList.toggle("wrap", this.wrap);
        this.area.style.fontSize = this.fontSize + "vh";
        this.gutter.style.fontSize = this.fontSize + "vh";
        this.gutter.style.display = this.wrap ? "none" : "";
        this.root.querySelector('button[data-action="wrap"]').style.opacity = this.wrap ? "1" : "0.55";
        try { localStorage.setItem("anyDEXpro.editor.fontSize", String(this.fontSize)); } catch (e) {}
    }

    queueStatus() {
        if (this._statsTimer) return;
        this._statsTimer = setTimeout(() => {
            this._statsTimer = null;
            this.updateLineNumbers();
            this.updateStatus();
        }, 80);
    }

    updateLineNumbers() {
        if (!this.area || !this.gutter) return;
        const lines = this.area.value.split("\n").length;
        if (lines === this._lineCount) return;
        this._lineCount = lines;
        let out = "";
        for (let i = 1; i <= lines; i++) out += i + "\n";
        this.gutter.textContent = out;
        this.gutter.scrollTop = this.area.scrollTop;
    }

    updateStatus() {
        if (!this.area) return;
        const value = this.area.value;
        const pos = this.area.selectionStart;
        const before = value.slice(0, pos);
        const line = before.split("\n").length;
        const col = pos - before.lastIndexOf("\n");
        const words = (value.match(/\S+/g) || []).length;

        this.posEl.textContent = `Ln ${line}, Col ${col}`;
        this.wordsEl.textContent = `${words} word${words === 1 ? "" : "s"}`;
        this.charsEl.textContent = `${value.length} char${value.length === 1 ? "" : "s"}`;
        this.pathEl.textContent = this.filePath || "no file";
        this.pathEl.title = this.filePath || "";
        this.nameEl.textContent = this.filePath ? this.filePath.split(/[\\/]/).pop() : "untitled.txt";
    }

    confirmDiscard() {
        if (!this.dirty) return true;

        const choice = this._electron().dialog.showMessageBoxSync({
            type: "warning",
            buttons: ["Save", "Discard", "Cancel"],
            defaultId: 0,
            cancelId: 2,
            noLink: true,
            title: "anyDEXpro Editor",
            message: "This file has unsaved changes.",
            detail: this.filePath || "untitled.txt"
        });

        if (choice === 0) return this.save();
        if (choice === 1) return true;
        return false;
    }

    newFile() {
        this.ensureDom();
        if (!this.confirmDiscard()) return;
        this.filePath = null;
        this.area.value = "";
        this.setDirty(false);
        this._lineCount = -1;
        this.updateLineNumbers();
        this.updateStatus();
        this.area.focus();
    }

    async openFileDialog() {
        this.ensureDom();
        if (!this.confirmDiscard()) return;

        const res = this._electron().dialog.showOpenDialogSync({
            title: "Open file",
            properties: ["openFile"],
            filters: [
                { name: "Text and code", extensions: ["txt", "md", "markdown", "json", "js", "ts", "jsx", "tsx", "css", "html", "htm", "xml", "yml", "yaml", "ini", "cfg", "conf", "log", "sh", "bat", "ps1", "py", "c", "h", "cpp", "hpp", "cs", "java", "go", "rs", "rb", "php", "sql", "csv"] },
                { name: "All files", extensions: ["*"] }
            ]
        });
        if (!res || !res.length) return;
        this.load(res[0]);
    }

    load(filePath) {
        try {
            const fs = require("fs");
            const content = fs.readFileSync(filePath, "utf8");
            this.filePath = filePath;
            this.area.value = content;
            this.setDirty(false);
            this._lineCount = -1;
            this.updateLineNumbers();
            this.updateStatus();
            this.area.scrollTop = 0;
            this.area.selectionStart = this.area.selectionEnd = 0;
            this.area.focus();
        } catch (e) {
            this._electron().dialog.showErrorBox("anyDEXpro Editor", `Could not open file:\n${e.message}`);
        }
    }

    save() {
        if (!this.filePath) return this.saveAs();
        try {
            require("fs").writeFileSync(this.filePath, this.area.value, "utf8");
            this.setDirty(false);
            this.updateStatus();
            return true;
        } catch (e) {
            this._electron().dialog.showErrorBox("anyDEXpro Editor", `Could not save file:\n${e.message}`);
            return false;
        }
    }

    saveAs() {
        const res = this._electron().dialog.showSaveDialogSync({
            title: "Save file as",
            defaultPath: this.filePath || "untitled.txt",
            filters: [
                { name: "Text file", extensions: ["txt"] },
                { name: "Markdown", extensions: ["md"] },
                { name: "All files", extensions: ["*"] }
            ]
        });
        if (!res) return false;
        this.filePath = res;
        return this.save();
    }
}

window.TextEditor = TextEditor;
