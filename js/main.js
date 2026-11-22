const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
const pauseIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
const volumeIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1-3.29-2.5-4.03v8.05c1.5-.73 2.5-2.25 2.5-4.02z"/></svg>';

const template = document.createElement("template");
template.innerHTML = `
<style>
    :host {
        --base: #af6527;
        --hover: #e27e31;
        display: block;
        color: var(--base);
        font-family: inherit;
        font-weight: 600;
        text-transform: uppercase;
    }

    * { box-sizing: border-box; }

    .player {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 1rem;
        width: 100%;
        padding: 1rem;
        background: #111111de;
        border-radius: 0.75rem;
    }

    .play {
        display: grid;
        place-items: center;
        flex: none;
        width: 2.75rem;
        height: 2.75rem;
        padding: 0;
        color: var(--base);
        background: transparent;
        border: 1px solid var(--base);
        border-radius: 50%;
        cursor: pointer;
        transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
    }

    .play svg { width: 1.1rem; height: 1.1rem; fill: currentColor; }

    .play:hover:not(:disabled), .play:focus-visible {
        color: var(--hover);
        border-color: var(--hover);
        background: rgba(226, 126, 49, 0.1);
    }

    .timeline { flex: 1 1 12rem; min-width: 0; }

    .volume {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 0 1 8rem;
    }

    .volume svg {
        flex: none;
        width: 1.1rem;
        height: 1.1rem;
        fill: currentColor;
        color: var(--base);
        transition: color 0.15s ease;
    }

    .volume:hover svg, .volume:focus-within svg { color: var(--hover); }

    input[type="range"] {
        width: 100%;
        margin: 0;
        accent-color: var(--base);
        cursor: pointer;
        outline-color: var(--hover);
    }

    input[type="range"]:hover,
    input[type="range"]:focus-visible { accent-color: var(--hover); }

    :disabled { opacity: 0.5; cursor: not-allowed; }
</style>

<div class="player" role="group" aria-label="Музичний програвач">
    <button class="play" type="button" aria-label="Відтворити">${playIcon}</button>

    <div class="timeline">
        <input class="seek" type="range" min="0" max="0" step="0.01" value="0" aria-label="Перемотка">
    </div>

    <div class="volume">
        ${volumeIcon}
        <input class="volume-range" type="range" min="0" max="1" step="0.01" value="1" aria-label="Гучність">
    </div>
</div>
`;

class MusicPlayer extends HTMLElement {
    static get observedAttributes() {
        return ["src"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.audio = new Audio();
        this.audio.preload = "metadata";

        this.ui = {
            play: this.shadowRoot.querySelector(".play"),
            seek: this.shadowRoot.querySelector(".seek"),
            volume: this.shadowRoot.querySelector(".volume-range"),
        };

        this._controls = [this.ui.play, this.ui.seek, this.ui.volume];

        this._sync = this._sync.bind(this);
        this._updateSeek = this._updateSeek.bind(this);

        this.audio.addEventListener("loadedmetadata", this._updateSeek);
        this.audio.addEventListener("durationchange", this._updateSeek);
        this.audio.addEventListener("timeupdate", this._updateSeek);
        this.audio.addEventListener("play", this._sync);
        this.audio.addEventListener("pause", this._sync);
        this.audio.addEventListener("error", () => this._disable());

        this.ui.play.addEventListener("click", () => this.toggle());
        this.ui.seek.addEventListener("input", () => {
            this.audio.currentTime = Number(this.ui.seek.value);
            this._updateSeek();
        });
        this.ui.volume.addEventListener("input", () => {
            this.audio.volume = Number(this.ui.volume.value);
        });
    }

    connectedCallback() {
        this._load();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this.isConnected) this._load();
    }

    toggle() {
        if (!this.getAttribute("src")) return;

        if (!this.audio.paused) {
            this.audio.pause();
            return;
        }

        const playback = this.audio.play();
        if (playback && typeof playback.catch === "function") {
            playback.catch(() => this._disable());
        }
    }

    _load() {
        const src = this.getAttribute("src") || "";

        this.audio.pause();
        this.ui.seek.max = 0;
        this.ui.seek.value = 0;
        this._sync();

        if (!src) {
            this.audio.removeAttribute("src");
            this._disable();
            return;
        }

        this._controls.forEach((control) => { control.disabled = false; });
        this.audio.src = src;
        this.audio.load();
    }

    _disable() {
        this._controls.forEach((control) => { control.disabled = true; });
    }

    _sync() {
        const playing = !this.audio.paused && !this.audio.ended;
        this.ui.play.innerHTML = playing ? pauseIcon : playIcon;
        this.ui.play.setAttribute("aria-label", playing ? "Пауза" : "Відтворити");
    }

    _updateSeek() {
        const duration = Number.isFinite(this.audio.duration) ? this.audio.duration : 0;
        const position = this.audio.currentTime || 0;

        this.ui.seek.max = duration;
        this.ui.seek.value = position;
    }
}

if (!customElements.get("music-player")) {
    customElements.define("music-player", MusicPlayer);
}
