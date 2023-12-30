// ==UserScript==
// @name         Uncheck alliance chat
// @namespace    http://tampermonkey.net/
// @version      2023.12.30
// @description  try to take over the world!
// @author       Piet2001
// @match        https://www.meldkamerspel.com/missions/*
// @match        https://politie.meldkamerspel.com/missions/*
// @grant        none
// ==/UserScript==

(async function () {
    'use strict';
    document.getElementById('mission_reply_alliance_chat').checked = false;
})();
