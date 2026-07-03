// ==UserScript==
// @name         Fix URL Spaces
// @namespace    http://tampermonkey.net/
// @version      2026.07.03
// @description  Remove accidental spaces from meldkamerspel URL paths.
// @author       Piet2001
// @match        https://www.meldkamerspel.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const { origin, pathname, search, hash } = window.location;

    // Remove literal whitespace and encoded spaces from the path only.
    const cleanedPathname = pathname
        .replace(/\s+/g, '')
        .replace(/%20/gi, '');

    if (cleanedPathname !== pathname) {
        const cleanUrl = `${origin}${cleanedPathname}${search}${hash}`;
        window.location.replace(cleanUrl);
    }
})();
