// ==UserScript==
// @name         SAP sneltoets
// @namespace    http://tampermonkey.net/
// @version      2023.03.13
// @description  try to take over the world!
// @author       Piet2001
// @match        https://www.meldkamerspel.com/*
// @grant        none
// ==/UserScript==

(function () {
    $(document).keydown(function (e) {
        if (!($("input").is(":focus"))) {
            switch (e.keyCode) {
                case 82: // R
                    try {
                        $('.alert_notify_alliance').click()
                    } catch (err) {
                        console.error(err.message, "Sneltoets > SAP");
                    }
                    break;
            }
            return e.returnValue;
        }
    })
})();