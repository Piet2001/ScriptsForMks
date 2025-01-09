// ==UserScript==
// @name         reload
// @namespace    http://tampermonkey.net/
// @version      2025.01.09
// @description  try to take over the world!
// @author       You
// @match        https://www.meldkamerspel.com/**
// @match        https://politie.meldkamerspel.com/**
// @grant        none
// ==/UserScript==

const delay = ms => new Promise(res => setTimeout(res, ms));

(async function () {
    'use strict';
    console.log("Start")
    await delay(10 * 60 * 1000)
    window.location.reload(true);
    console.log("reload")
})();
