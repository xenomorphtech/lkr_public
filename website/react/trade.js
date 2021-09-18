const { createElement, useState, useEffect, useRef } = React;
import { globalState, setGlobalState, doNav } from "/state.js"
import { near_refresh_ah, near_refresh_balance, near_login,
    nft_market_sell, nft_market_cancel, nft_market_buy } from "/near.js"

const html = htm.bind(createElement);

const item_mapping = {
    101000: {name: "Knife", icon: "/old/assets/img/item/10.jpg"},
    1010000: {name: "Knife", icon: "/old/assets/img/item/10.jpg"}
}

function refresh() {
    near_refresh_ah();
    near_refresh_balance();
}

function sellItem(token_id, price) {
    var near_price = window.nearApi.utils.format.parseNearAmount(price)
    console.log("sell", token_id, price, near_price)
    nft_market_sell(token_id, near_price)
}

function ActiveTab(items) {
    const items_html = items.map((item)=> {
        var name = item_mapping[item.index].name
        var icon = item_mapping[item.index].icon
        var price = Number(window.nearApi.utils.format.formatNearAmount(`${item.price||0}`)).toFixed(2)
        return html`
        <tr class="tablenormal"
        >
            <td><img src=${icon} /></td>
            <td>${name}</td>
            <td>${price}</td>
            <td>
              <input type="button" value="Cancel" onClick=${(e)=> nft_market_cancel(item.token_id)}/>
            </td>
        </tr>
        `
    })
    return html`
    <div id="tabs-3" class="ui-tabs-panel ui-widget-content ui-corner-bottom" role="tabpanel" 
        aria-expanded="false" aria-hidden="true"><p></p>
      <table style=${{width: "100%"}} class="imagetable">
        <tbody>
        <tr>
          <th></th>
          <th>Name</th>
          <th>Price</th>
          <th>Action</th>
        </tr>
        ${items_html}
        </tbody>
      </table>
      <p></p>
    </div>
    `
}

function SellTab(items) {
    const items_html = items.map((item)=> {
        var name = item_mapping[item.index].name
        var icon = item_mapping[item.index].icon
        var id_price = `inputPrice_${item.token_id}`
        return html`
        <tr class="tablenormal"
        >
            <td><img src=${icon} /></td>
            <td>${name}</td>
            <td>
              <input id="${id_price}" type="text" placeholder="1.0" />
            </td>
            <td>
              <input type="button" value="Sell" onClick=${(e)=> sellItem(item.token_id, document.getElementById(id_price).value)}/>
            </td>
        </tr>
        `
    })
    return html`
    <div id="tabs-3" class="ui-tabs-panel ui-widget-content ui-corner-bottom" role="tabpanel" 
        aria-expanded="false" aria-hidden="true"><p></p>
      <table style=${{width: "100%"}} class="imagetable">
        <tbody>
        <tr>
          <th></th>
          <th>Name</th>
          <th>Price</th>
          <th>Action</th>
        </tr>
        ${items_html}
        </tbody>
      </table>
      <p></p>
    </div>
    `
}

function BuyTab(items) {
    //{token_id: "5", index: 1010000, owner_id: "lkr.testnet", price: "100000", count: 1},
  //          onMouseOver=${(e)=> e.target.class = ('tableselected')} 
    const items_html = items.map((item)=> {
        var name = item_mapping[item.index].name
        var icon = item_mapping[item.index].icon
        var price = Number(window.nearApi.utils.format.formatNearAmount(`${item.price||0}`)).toFixed(2)
        return html`
        <tr class="tablenormal"
        >
            <td><img src=${icon} /></td>
            <td>${name}</td>
            <td>${item.owner_id}</td>
            <td>${price}</td>
            <td>${item.count}</td>
            <td>
             ${
                globalState.accountId == undefined 
                ? html`<input type="button" value="Login with NEAR" onClick=${(e)=> near_login()}/>`
                : html`<input type="button" value="Buy" onClick=${(e)=> nft_market_buy(item.token_id, item.price)}/>`
             }
            </td>
        </tr>
        `
    })
    return html`
    <div id="tabs-3" class="ui-tabs-panel ui-widget-content ui-corner-bottom" role="tabpanel" 
        aria-expanded="false" aria-hidden="true"><p></p>
      <table style=${{width: "100%"}} class="imagetable">
        <tbody>
        <tr>
          <th></th>
          <th>Name</th>
          <th>Seller</th>
          <th>Price</th>
          <th>Count</th>
          <th>Action</th>
        </tr>
        ${items_html}
        </tbody>
      </table>
      <p></p>
    </div>
    `
}

export function Trade({}) {
    var gs = globalState;
    var nearacc = globalState.accountId
    var a = globalState.auction;
    var class_active = "ui-state-default ui-corner-top ui-tabs-active ui-state-active"
    var class_not_active = "ui-state-default ui-corner-top"

    //console.log(a)

    var nearBalance = Number(window.nearApi.utils.format.formatNearAmount(`${gs.balance||0}`)).toFixed(2)

    var active_tab = null;
    if (gs.path == "/trade/buy")
        active_tab = BuyTab(a.query)
    if (gs.path == "/trade/sell")
        active_tab = SellTab(a.items)
    if (gs.path == "/trade/active")
        active_tab = ActiveTab(a.active)

    return html`
  <div class="span9">
            
    <div id="tabs" class="ui-tabs ui-widget ui-widget-content ui-corner-all">
      <ul class="ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all" role="tablist">
        <li class=${gs.path == "/trade/buy" ? class_active : class_not_active} role="tab" tabindex="-1" aria-controls="tabs-3" aria-labelledby="ui-id-3" aria-selected="false"><a href="/trade/buy" class="ui-tabs-anchor" onClick=${(e)=> doNav(e, "/trade/buy")}>Buy (${a.query.length})</a></li>
        ${
            nearacc == undefined
            ? null
            : [
                html`<li class=${gs.path == "/trade/sell" ? class_active : class_not_active} role="tab" tabindex="0" aria-controls="tabs-2" aria-labelledby="ui-id-2" aria-selected="true"><a href="/trade/sell" class="ui-tabs-anchor" onClick=${(e)=> doNav(e, "/trade/sell")}>Sell (${a.items.length})</a></li>`,
                html`<li class=${gs.path == "/trade/active" ? class_active : class_not_active} role="tab" tabindex="-1" aria-controls="tabs-5" aria-labelledby="ui-id-4" aria-selected="false"><a href="/trade/active" class="ui-tabs-anchor" onClick=${(e)=> doNav(e, "/trade/active")}>Active (${a.active.length})</a></li>`,
                html`<li id="charAGold" style=${{top: "3px"}}><img src="/old/assets/img/item/179.jpg"/> ${nearBalance}</li>`,
                html`<li id="refresh" style=${{top: "3px"}} onClick=${(e)=> refresh()}><img src="/old/assets/img/refresh.png" width=${40} height=${40} onClick=${(e)=> "refreshTrader()"}/></li>`,
            ]
        }
        <!--<li id="charGold"><img src="old/assets/img/item/43.jpg"/> 6,000</li>-->
      </ul>
      ${active_tab}
    </div>

  </div>
  `;
}

    //  <div id="tabs-5" aria-labelledby="ui-id-4" class="ui-tabs-panel ui-widget-content ui-corner-bottom" role="tabpanel" aria-expanded="false" aria-hidden="true" style="display: none;"><p></p><table width:100%="" class="imagetable" id="auctionTable"><tbody><tr><th>Name</th><th>Price</th><th>Action</th></tr><tr class="tablenormal" onmouseover="this.className='tableselected'" onmouseout="this.className='tablenormal'"><input value="50" type="hidden"><td><div style="float:left"><img src="assets/img/item/10.jpg"></div>Knife</td><td>5,000</td><td><input name="cancelItem" id="cancelItem_50" type="button" value="Cancel" onclick="claimButtonPressed(50)"></td></tr></tbody></table><p></p></div>
    //  <div id="tabs-4" aria-labelledby="ui-id-5" class="ui-tabs-panel ui-widget-content ui-corner-bottom" role="tabpanel" aria-expanded="false" aria-hidden="true" style="display: none;"><p></p><table width:100%="" class="imagetable" id="auctionTable"><tbody><tr><th>Name</th><th>Price</th><th>Action</th></tr><tr class="tablenormal" onmouseover="this.className='tableselected'" onmouseout="this.className='tablenormal'"><input value="50" type="hidden"><td><div style="float:left"><img src="assets/img/item/10.jpg"></div>Knife</td><td>5,000</td><td><input name="claimItem" id="claimItem_50" type="button" value="Claim" onclick="claimButtonPressed(50)"></td></tr></tbody></table><p></p></div>
