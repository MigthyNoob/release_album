const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';

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
        border-radius: 2.75rem;
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

    .play:hover, .play:focus-visible {
        color: var(--hover);
        border-color: var(--hover);
        background: rgba(226, 126, 49, 0.1);
    }

    .timeline { flex: 1 1 10rem; min-width: 0; display: flex; }

    input[type="range"] {
        width: 100%;
        margin: 0;
        accent-color: var(--base);
        cursor: pointer;
        outline-color: var(--hover);
    }

    input[type="range"]:hover { accent-color: var(--hover); }
</style>

<div class="player" role="group" aria-label="Музичний програвач">
    <div class="timeline">
        <input class="seek" type="range" min="0" max="0" value="0" disabled aria-hidden="true">
    </div>

    <button class="play" type="button" aria-label="Відтворити">${playIcon}</button>
</div>
`;

class MusicPlayer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.shadowRoot.querySelector(".play").addEventListener("click", () => this._redirect());
    }

    _redirect() {
        const url = this.getAttribute("src") || this.getAttribute("href");
      if (url) window.open(url, "_blank");

    }
}

if (!customElements.get("music-player")) {
    customElements.define("music-player", MusicPlayer);
}
