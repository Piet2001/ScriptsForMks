// ==UserScript==
// @name         resendShareMessageMJR
// @namespace    http://tampermonkey.net/
// @version      2025.07.15.1
// @description  try to take over the world!
// @author       Piet2001 & LSS-Manager
// @match        https://www.meldkamerspel.com/*
// @match        https://politie.meldkamerspel.com/*
// @grant        none
// ==/UserScript==

var runPage = false;

(async function () {
    'use strict';

    function checkurl() {
        var url = window.location.pathname.split("/");
        $.each(url, function (index, value) {
            if (value == 'missions') {
                runPage = true;
            }
        });
        return runPage;
    }

    var versie = "2025.07.15.1"
    if (!localStorage.resendShareMessageMJR_VERSION || JSON.parse(localStorage.resendShareMessageMJR_VERSION).Version !== versie) {
        var updates = "Fix issue met additive overlays"

        alert(`ResentShareMessageMJR - Versie ${versie} nieuwe update! \n\n Updates:\n${updates}`)

        localStorage.setItem('resendShareMessageMJR_VERSION', JSON.stringify({ Version: versie }));

        fetch('/api/credits')
            .then(response => response.json())
            .then(data => {

                var script = "resendShareMessageMJR"
                var message = `${data.user_name} (${data.user_id}) updated to version ${versie}`

                $.get(`https://script.google.com/macros/s/AKfycbxDJhR048SL8-LbQrNZ1xc20wC-NB8FLukE_8S9WQivko8MyWp5HgONTExscDKv2fQ5/exec?script=${script}&message=${message}`)
            });
    }

    if (!localStorage.resendShareMessageMJR || JSON.parse(localStorage.resendShareMessageMJR).lastUpdate < (new Date().getTime() - 5 * 1000 * 60)) {
        fetch('/api/allianceinfo')
            .then(response => response.json())
            .then(data => {
                if (data.id === 528) {
                    RunScript()
                }
                else {
                    alert("U zit niet in het juiste team om gebruik te maken van dit script")
                }
            });
    }
    else {
        if (checkurl()) {
            RunScript()
        }
    }
})();

function RunScript() {

    let alliance_credits = 5000;
    let ignore_min_credits_to_share = false;
    let possible_to_share = false;
    let minOpenTime = 2

    var requirements = localStorage.MKS_requirements === undefined ? {} : JSON.parse(localStorage.MKS_requirements)
    let alliance_chat_setting = false; // Standaard instelling wel/niet in chat posten
    let alliance_chat_credits_setting = false; // Alleen in chat plaatsen als boven ingesteld aantal credits. Deze instelling overschrijft de vorige instelling.
    let alliance_chat_credits = 5000; // aantal credits wanneer die in de chat moet worden geplaatst

    let planned_chat_setting = false; // Instelling of geplande inzetten standaard in de chat komen
    let planned_alliance_chat_credits_setting = false; // Alleen in chat plaatsen als boven ingesteld aantal credits. Deze instelling overschrijft de vorige instelling.
    let planned_alliance_chat_credits = 10000; // aantal credits wanneer geplande inzetten in de chat moet worden geplaatst

    const getFillTime = () => {
        let time = new Date();
        let hours = time.getHours() + minOpenTime;
        if (hours > 23) {
            hours -= 24
        }
        let mins = (time.getMinutes() < 10 ? '0' : '') + time.getMinutes();

        return `${hours}:${mins}`
    }

    const getSluitvoertuig = () => {
        try {
            const missionHelp = $('#mission_help');
            const missionlink = missionHelp.attr('href');
            if (missionHelp && missionlink) {
                let missionID = $('#mission_general_info').attr('data-mission-type');
                const overlay = $('#mission_general_info').attr('data-overlay-index') ?? null;
                const additive = $('#mission_general_info').attr('data-additive-overlays') ?? null;
                if (overlay !== null) {
                    missionID = `${missionID}-${overlay}`
                }
                if (additive !== null) {
                    missionID = `${missionID}/${additive}`
                }

                let mission = requirements[missionID];

                if (mission.requirements.elw3 > 0 && typeof (mission.chances.elw3) == "undefined") {
                    return "CO"
                }
                else if (mission.requirements.mobile_command_vehicles > 0 && typeof (mission.chances.mobile_command_vehicles) == "undefined") {
                    return "HOD"
                }
                else if (mission.requirements.battalion_chief_vehicles > 0 && typeof (mission.chances.battalion_chief_vehicles) == "undefined") {
                    return "OVD-B/HOD"
                }
                else if (mission.requirements.spokesman > 0 && typeof (mission.chances.spokesman) == "undefined") {
                    return "VL"
                }
                else if (mission.requirements.police_helicopters > 0 && typeof (mission.chances.police_helicopters) == "undefined") {
                    return "ZULU"
                }
                else if (mission.requirements.hondengeleider > 0 && typeof (mission.chances.hondengeleider) == "undefined") {
                    return "HGL"
                }
                else if (mission.requirements.detention_unit > 0 && typeof (mission.chances.detention_unit) == "undefined") {
                    return "ME-AE"
                }
                else if (mission.requirements.at_c > 0 && typeof (mission.chances.at_c) == "undefined") {
                    return "AT-C"
                }
                else if (mission.requirements.lebefkw > 0 && typeof (mission.chances.lebefkw) == "undefined") {
                    return "ME-C"
                }
                else if (mission.requirements.mobile_air_vehicles > 0 && typeof (mission.chances.mobile_air_vehicles) == "undefined") {
                    return "AB"
                }
                else if (mission.requirements.boats > 0 && typeof (mission.chances.boats) == "undefined") {
                    return "WOA/BA-RB"
                }
                else if (mission.requirements.water_rescue > 0 && typeof (mission.chances.water_rescue) == "undefined") {
                    return "Strandvoertuig/PM-OR"
                }
                else if (mission.requirements.coastal_guard_boat > 0 && typeof (mission.chances.coastal_guard_boat) == "undefined") {
                    return "KW-Boot"
                }
                else {
                    return "Onbekend, meld aan vrijgever"
                }
            }
        }
        catch {
            return "Geen data"
        }
    }

    function getRequirements() {
        try {
            return new Promise(resolve => {

                $.ajax({
                    url: "https://raw.githubusercontent.com/Piet2001/Inzetten/main/complete.json",
                    method: "GET",
                    success: function (data, textStatus) {
                        data = JSON.parse(data);
                        data.forEach((mission) => { requirements[mission.id] = mission })
                        localStorage.MKS_requirements = JSON.stringify(requirements);
                        resolve(data)
                        localStorage.setItem('SAP_MJR', JSON.stringify({ lastUpdate: new Date().getTime() }));
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        setTimeout(async function () {
                            answer = await getRequirements()
                            resolve(answer)
                        }, 30000)
                    }
                })
            });
        } catch (err) { console.error(err.message) }
    };

    if (window.location.pathname.indexOf("/missions/") === 0) {
        // Create Button and add event listener

        var button = `<div class="btn-group" style="margin-left: 5px; margin-right: 5px;">
        <a href="#" class="btn btn-success btn-sm send_share_message" title="Stuur deelbericht">
        <span class="glyphicon glyphicon-bullhorn" style="font-size: 13px;"></span></a></div>`

        $('.mission_reply_content').parent().append(button)

        $('.send_share_message').click(async function () {
            const missionId = (window.location.href.split("/").pop().replace('#', ''))
            const csrfToken = $('meta[name="csrf-token"]').attr('content');
            let messagesplanned = ["Geplande inzet: %CREDITS% Credits"]
            let messages = ["~%CREDITS% Credits | Afvullen vanaf " + getFillTime() + " | Sluitvoertuig: " + getSluitvoertuig()]
            var messageToPost = ""
            const missionHelp = $('#mission_help');
            const missionlink = missionHelp.attr('href');
            if (missionHelp && missionlink) {
                let missionID = $('#mission_general_info').attr('data-mission-type');
                const overlay = $('#mission_general_info').attr('data-overlay-index') ?? null;
                const additive = $('#mission_general_info').attr('data-additive-overlays') ?? null;
                if (overlay !== null) {
                    missionID = `${missionID}-${overlay}`
                }
                if (additive !== null) {
                    missionID = `${missionID}/${additive}`
                }

                if (requirements[missionID] == undefined || !localStorage.SAP_MJR || JSON.parse(localStorage.SAP_MJR).lastUpdate < (new Date().getTime() - 5 * 1000 * 60)) await getRequirements();
                let credits = 0;
                let mission = requirements[missionID];
                if (mission.additional.guard_mission) {
                    credits = parseInt($('#col_left').text().split('Verdiensten: ')[1].split(` ${I18n.translations.nl_NL.javascript.credits}`)[0].split('.').join('')) ?? 0;
                    messages = messagesplanned.map(message => {
                        message = message.replace(/%CREDITS%/g, credits?.toLocaleString() || '');
                        messageToPost = message;
                    });
                }
                else {
                    messages = messages.map(message => {
                        credits = mission.average_credits ?? 0;
                        message = message.replace(/%CREDITS%/g, credits?.toLocaleString() || '');
                        messageToPost = message;
                    });
                }
            }

            $.ajax({
                type: 'POST',
                url: `/mission_replies`,
                headers: {
                    'MJR': "1",
                },
                data: {
                    authenticity_token: csrfToken,
                    mission_reply: {
                        alliance_chat: 0,
                        content: messageToPost,
                        mission_id: missionId,
                    },
                },
            });

            window.location.reload();
        })
    }
}
