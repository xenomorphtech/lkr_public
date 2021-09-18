const { createElement, useState, useEffect, useRef } = React;
import { globalState, setGlobalState, doNav} from "/state.js"
const html = htm.bind(createElement);

export function Play({}) {
    return html`
        <iframe src="/wasm/lkr.html" style=${{border: "0", display: "block", width: "100vw", height: "95vh", marginTop: "-20px"}}>Your browser doesn't support iFrames.</iframe>
    `;
}
