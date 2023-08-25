// ==UserScript==
// @name         Spoed afmeldbericht
// @namespace    http://tampermonkey.net/
// @version      2023.08.25
// @description  try to take over the world!
// @author       Piet2001
// @match        *://*.meldkamerspel.com/*
// @grant        none
// ==/UserScript==

(async function () {
    'use strict';
  
    // Alleen hieronder bewerken
    var LeaveMessage = "Mijn pager gaat, dus ik ben er vandoor"
    // Vanaf hier niet meer bewerken
  
    var btn = $('<li><a href="#" id="pagerAlarmBtn" ><span style="color: white" class="glyphicon glyphicon-alert"></a></li>');
    $("#main_navbar #navbar-main-collapse .navbar-right #news_li").after(btn);

    $( "#pagerAlarmBtn" ).click(function() {

        var authToken = $("[name='authenticity_token']").val();
        $.ajax({
            type: "POST",
            url: "/alliance_chats",
            data: {
                "utf8": "✓",
                "authenticity_token": authToken,
                "alliance_chat[message]": LeaveMessage
            }
        })
    });

})();
