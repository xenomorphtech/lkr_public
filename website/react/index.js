const { createElement, useState, useEffect, useRef } = React;
import { buildInitialState, wireUpGlobalState, globalState, setGlobalState, doNav} from "/state.js"
import { near_login } from "/near.js"

const html = htm.bind(createElement);

import { Home } from "/react/home.js"
import { Trade } from "/react/trade.js"
import { Play } from "/react/play.js"

export function Index() {
    const [s, hook_setGlobalState0] = useState(buildInitialState());
    wireUpGlobalState(s, hook_setGlobalState0);

    var path = s.path;
    var balance = s.remote.balance;

    var content = html`<${Home} />`
    if (path.startsWith("/trade"))
        content = html`<${Trade} />`;
    if (path == "/play")
        content = html`<${Play} />`;

    var nearacc = s.accountId;

    return [html`
    <div class="navbar navbar-inverse navbar-fixed-top">
      <div class="navbar-inner">
        <div class="container-fluid">
          <button type="button" class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="brand" href="/" onClick=${(e)=> doNav(e, '/')}>LKR</a>
          <div class="nav-collapse collapse">
            <p class="navbar-text pull-right">
             ${
                nearacc == "" || nearacc == undefined 
                ? html`<a href="#" class="navbar-link" onClick=${(e)=> {near_login(); return false;}}>Login with NEAR</a>`
                : html`<a href="" class="navbar-link">${nearacc}</a>`
             }
             
            </p>
            <ul class="nav">
              <li class=${path == "/" || path.startsWith("/home") ? "active" : ""}><a href="/" onClick=${(e)=> doNav(e, '/')}>Home</a></li>
              <li class=${path == "/play" ? "active" : ""}><a href="/play" onClick=${(e)=> doNav(e, '/play')}>Play</a></li>
              <li class=${path.startsWith("/trade") ? "active" : ""}><a href="/trade/buy" onClick=${(e)=> doNav(e, '/trade/buy')}>NFT Trader</a></li>
            </ul>
          </div><!--/.nav-collapse -->
        </div>
      </div>
    </div>
    `,
    content
    ]
}
