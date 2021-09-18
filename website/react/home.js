const { createElement, useState, useEffect, useRef } = React;
import { globalState, setGlobalState, doNav} from "/state.js"
const html = htm.bind(createElement);

function Token() {
    return html`
      <div class="row-fluid">
        <div class="span4">
          <h2>XENO Token</h2>
          <p>The governance DAO for LKR is Xenomorph
          <br/>- DAO members receive 100% of the NEAR fees from LKR (and future games)
          <br/>- DAO members can vote on content/balance of the game
          <br/><br/>1. To become a DAO member visit ref.finance pool
          <br/>2. Swap NEAR for XENO
          <br/>3. Congratulations you are a member
          </p>
        </div>
      </div>
    `; 
}

function Trade() {
    return html`
      <div class="row-fluid">
        <div class="span4">
          <h2>NFT Trader</h2>
          <p>Visit <a href="/trade/buy" onClick=${(e)=> doNav(e,"/trade/buy")}>NFT Trader</a> tab to enter the auction house
          <br/>The currency for all items is NEAR
          <br/>- Auction fees are 10%
          <br/><br/>1. Login with NEAR
          <br/>2. Click sell to sell items minimum price is 0.1 NEAR
          <br/>3. Click buy to purchase anothers NFT
          </p>
        </div>
      </div>
    `; 
}

function Refining() {
    return html`
      <div class="row-fluid">
        <div class="span4">
          <h2>Refining</h2>
          <p>Visit @employee and buy Zelgo Mer or Daiyen Fooels
          <br/>Zelgo Mer is used to refine armor.
          <br/>- Armor is safe to +4
          <br/>Daiyen Fooels is used to refine weapons.
          <br/>- Weapons are safe to +4
          <br/><br/>1. Double-Click the scroll you wish to use.
          <br/>2. Click on the weapon or armor to enchant
          <br/>3. Try not to break it!
          </p>
        </div>
      </div>
    `; 
}

function Beginner() {
    return html`
  <div class="row-fluid">
    <div class="span4">
      <h2>Beginner Guide</h2>
      <p>  1. Go to @beginner and stay here until level 5
      <br/>2. Next visit @aron and pick a class "(swordman, knight, wizard, shaman)"
      <br/>3. Try @weakly next to increase your level
      <br/>4. After visit @skel
      <br/>5. Maps coming soon
      </p>
    </div>
  </div>
    `; 
}

function HowToPlay() {
    return html`
      <div class="row-fluid">
        <div class="span4">
          <h2>How to Play</h2>
           <p>    1. LKR is a browser game!
           <br/>  2. Visit the <a href="/play" onClick=${(e)=> doNav(e, "/play")}>Play</a> tab to start playing
           <br/>  3. Use the NFT Trader tab to auction items
           <br/>  Dont forget to have fun, the game is in early stages!
          </p>
        </div>
      </div>
    `; 
}

function Progress() {
    return html`
      <div class="row-fluid">
        <div class="span4">
          <h2>Current Progess (Pre Alpha - 0.0.1)</h2>
           <p>    <strike>1. Objects and tiles</strike>
           <br/>  2. Sprites
           <br/>  3. Movement
           <br/>  4. Monsters
           <br/>  5. Inventory
           <br/>  6. Spells
           <br/>  7. Auction House
          </p>
        </div>
      </div>
    `; 
}

export function Home({}) {
    var path = globalState.path;

    var content = html`<${HowToPlay} />`
    if (path == "/home/beginner")
        content = html`<${Beginner} />`;
    if (path == "/home/progress")
        content = html`<${Progress} />`;
    if (path == "/home/refining")
        content = html`<${Refining} />`;
    if (path == "/home/trade")
        content = html`<${Trade} />`;
    if (path == "/home/token")
        content = html`<${Token} />`;

    return html`
    <div class="container-fluid">
      <div class="row-fluid">
        <div class="span3">
          <div class="well sidebar-nav">
            <ul class="nav nav-list">
              <li class="nav-header">Info</li>
              <li class=${path == "/" ? "active" : ""}><a href="/" onClick=${(e)=> doNav(e, "/")}>How to play</a></li>
              <li class=${path == "/home/progress" ? "active" : ""}><a href="/home/progress" onClick=${(e)=> doNav(e, "/home/progress")}>Game Progress</a></li>
              <li class=${path == "/home/beginner" ? "active" : ""}><a href="/home/beginner" onClick=${(e)=> doNav(e, "/home/beginner")}>Beginner Guide</a></li>
              <li class=${path == "/home/refining" ? "active" : ""}><a href="/home/refining" onClick=${(e)=> doNav(e, "/home/refining")}>Refining</a></li>
              <li class=${path == "/home/trade" ? "active" : ""}><a href="/home/trade" onClick=${(e)=> doNav(e, "/home/trade")}><img src="old/assets/img/item/43.jpg" style=${{height: "23px", padding: "0px"}}></img> NFT Trader</a></li>
              <li class=${path == "/home/token" ? "active" : ""}><a href="/home/token" onClick=${(e)=> doNav(e, "/home/token")}>XENO Token</a></li>
            </ul>
          </div>
        </div>
        <div class="span9">
          ${content}
          <div class="row-fluid"/>
        </div>
      </div>

      <hr/>
      <footer>
        <p>© The Last Kingdom: Revival</p>
      </footer>
    </div>
    `;
}
