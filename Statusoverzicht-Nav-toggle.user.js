// ==UserScript==
// @name         Statusoverzicht-Nav-toggle
// @version      1.0.0
// @author       Piet2001 | Jan (jxn_30)
// @include      https://www.meldkamerspel.com/statusoverzicht
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    document.body.innerHTML += `<a class="btn btn-default" style="position: fixed; top: 1rem; right: 1rem; z-index: 10000;" onclick="$('.navbar-fixed-top').toggle()">Verberg/Toon</a>`
})();
