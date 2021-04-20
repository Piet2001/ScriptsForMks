// ==UserScript==
// @name         Menu-Uitbreiding
// @namespace    http://tampermonkey.net/
// @version      2021.04.20.10.15
// @description  try to take over the world!
// @author       Piet2001
// @match        https://www.meldkamerspel.com/
// @updateUrl    https://github.com/Piet2001/ScriptsForMks/raw/master/Menu-Uitbreiding.user.js
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  var version = "2021.04.20.10.15"
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