// ==UserScript==
// @name         Menu-Uitbreiding
// @namespace    http://tampermonkey.net/
// @version      2021.10.29
// @description  try to take over the world!
// @author       Piet2001
// @match        https://www.meldkamerspel.com/
// @match        https://politie.meldkamerspel.com/
// @updateUrl    https://github.com/Piet2001/ScriptsForMks/raw/master/Menu-Uitbreiding.user.js
// @grant        none
// ==/UserScript==

(async function () {
  'use strict';
  var version = "2021.10.29"

  if (!localStorage.Menu_Uitbreiding_VERSION || JSON.parse(localStorage.Menu_Uitbreiding_VERSION).Version !== version) {
    var updates = "- Voor een verbeterde dienstverlening loggen we nu je spelersnaam, spelersID en je versie van dit script"

    alert(`Menu-uitbreiding - Versie ${version} nieuwe update! \n\n Updates:\n${updates}`)

    localStorage.setItem('Menu_Uitbreiding_VERSION', JSON.stringify({ Version: version }));

    fetch('/api/credits')
      .then(response => response.json())
      .then(data => {
        var request = new XMLHttpRequest();
        request.open("POST", "https://discord.com/api/webhooks/903622076840153129/iCjZZFIU0COPw6ZIv7brbjgUIfOD36DxtiXDmcMoSvJQt66q_hwgHiMBRnhXKpLPO41R");

        request.setRequestHeader('Content-type', 'application/json');

        var params = {
          username: "Script Update",
          content: `${data.user_name} (${data.user_id}) updated Menu_Uitbreiding to version ${version}`
        }

        request.send(JSON.stringify(params));
      });
  }
  // basic
  var navstart = '<li id="Piet2001" class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown"><span class="glyphicon glyphicon-paperclip" aria-hidden="true"></span><span class="caret"></span></a><ul class="dropdown-menu">';
  var navend = '<li class="divider" /><li> Version: ' + version + '</li></ul></li>';
  var navitems = '';
  let link = new Array();
  let AddOn = new Array();

  //Links
  link[0] = '<li id="Toezicht-link"><a class="lightbox-open" href="/alliance_logfiles"</a>Toezicht</li>';
  link[1] = '<li id="CoinsProtocol"><a class="lightbox-open" href="/coins/list"</a>Coins Protocol</li>';

  // AddOn's
  AddOn[0] = '<li id="AddOn1" />'
  AddOn[1] = '<li id="AddOn2" />'
  AddOn[2] = '<li id="AddOn3" />'
  AddOn[3] = '<li id="AddOn4" />'


  // Generate menu
  link.forEach(e => navitems += e + '');
  AddOn.forEach(e => navitems += e + '');

  var navshow = navstart + '' + navitems + '' + navend;
  $("#main_navbar #navbar-main-collapse .navbar-right #news_li").after(navshow);
})();
