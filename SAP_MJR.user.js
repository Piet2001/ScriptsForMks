// ==UserScript==
// @name         SAP_MJR
// @namespace    http://tampermonkey.net/
// @version      2024.05.28
// @description  try to take over the world!
// @author       Piet2001 & LSS-Manager
// @match        https://www.meldkamerspel.com/*
// @match        https://politie.meldkamerspel.com/*
// @grant        none
// ==/UserScript==

var runPage = false;

(async function () {
    'use strict';

    setlocalstorageitems()
    setnavitems()

    function setlocalstorageitems() {
        if (!localStorage.SAP_MJR_Shortcut) {
            localStorage.setItem("SAP_MJR_Shortcut", 'off');
        }
    }

    function setnavitems() {
        var navSAP_MJR_Shortcut = '<a role="presentation" href="#" id="setSAP_MJR_Shortcut" data-SAP_MJR_Shortcut="' + localStorage.getItem('SAP_MJR_Shortcut') + '" >SAP_MJR Sneltoets (R): <strong><span id="showSAP_MJR_Shortcut">' + (localStorage.getItem('SAP_MJR_Shortcut') == 'on' ? 'Aan' : 'Uit') + '</span></strong></a>';
        $("ul .dropdown-menu[aria-labelledby='menu_alliance'] >> a[href='/freunde']").parent().after(navSAP_MJR_Shortcut);
    }

    $("#setSAP_MJR_Shortcut").click(function () {
        if (localStorage.getItem('SAP_MJR_Shortcut') == 'on') {
            localStorage.setItem("SAP_MJR_Shortcut", 'off');
        } else {
            localStorage.setItem("SAP_MJR_Shortcut", 'on');
        }
        $("#showSAP_MJR_Shortcut").html((localStorage.getItem('SAP_MJR_Shortcut') == 'on' ? 'Aan' : 'Uit'));
    });

    function checkurl() {
        var url = window.location.pathname.split("/");
        $.each(url, function (index, value) {
            if (value == 'missions') {
                runPage = true;
            }
        });
        return runPage;
    }

    var versie = "2024.05.28"
    if (!localStorage.SAP_MJR_VERSION || JSON.parse(localStorage.SAP_MJR_VERSION).Version !== versie) {
        var updates = "Suppport voor uitgeschakelde meldingen"

        alert(`SAP_MRJ - Versie ${versie} nieuwe update! \n\n Updates:\n${updates}`)

        localStorage.setItem('SAP_MJR_VERSION', JSON.stringify({ Version: versie }));

        fetch('/api/credits')
            .then(response => response.json())
            .then(data => {
                var request = new XMLHttpRequest();
                request.open("POST", "https://discord.com/api/webhooks/942122343730413598/jcuaJt4ZbviUIujCp5o6WmUStMvTSpYcglLzjOqaWvAFHLOkirw6FzSG9Y63RU1yo0Zf");

                request.setRequestHeader('Content-type', 'application/json');

                var params = {
                    username: "Script Update",
                    content: `${data.user_name} (${data.user_id}) updated SAP_MJR to version ${versie}`
                }

                request.send(JSON.stringify(params));
            });
    }
    if (!localStorage.SAP_MJR || JSON.parse(localStorage.SAP_MJR).lastUpdate < (new Date().getTime() - 5 * 1000 * 60)) {
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
                let missionID = $('#mission_help').attr('href').split("/").pop().replace(/\?.*/, '');
                const overlay = new URLSearchParams($('#mission_help').attr('href').split("/").pop()).get('overlay_index')
                if (overlay !== null) {
                    missionID = `${missionID}-${overlay}`
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
                    return "HGL/Hondengeleider"
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
                    return "Strandvoetuig/PM-OR"
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
        const initButtons = () => {
            let btnMarkup =
                '<div class="btn-group" style="margin-left: 5px; margin-right: 5px;">';

            btnMarkup +=
                '<a href="#" class="btn btn-success btn-sm alert_notify_alliance" title="Alarmeren, vrijgeven en chatbericht">';
            btnMarkup +=
                '<img class="icon icons8-Phone-Filled" src="/images/icons8-phone_filled.svg" width="18" height="18">';
            btnMarkup +=
                '<img class="icon icons8-Share" src="/images/icons8-share.svg" width="20" height="20">';
            btnMarkup +=
                '<span class="glyphicon glyphicon-bullhorn" style="font-size: 13px;"></span>';
            btnMarkup += '</a></div>';

            let optionsBtnMarkup =
                '<a href="#" id="openAllianceShareOptions" class="btn btn-sm btn-default" title="Berichten" style="margin: 0">';
            optionsBtnMarkup +=
                '<span class="glyphicon glyphicon-option-horizontal"></span></a>';

            optionsBtnMarkup +=
                '<div class="btn btn-sm btn-default" style="margin:0; padding: 1px; display: none;" id="allianceShareOptions"><input type="text" id="allianceShareText" value="' +
                messages[0] +
                '">';
            optionsBtnMarkup +=
                '<label style="margin-left: 2px; margin-right: 2px;"><input type="checkbox" ' +
                ` id="postToChat" name="postToChat" value="true" ${alliance_chat_setting ? 'checked="true"' : ''}>` +
                'Naar Team Chat' +
                '</label>';

            optionsBtnMarkup += '<div style="text-align: left;"><ul>';
            $.each(messages, (index, msg) => {
                optionsBtnMarkup +=
                    '<li class="custom_AllianceShareText">' + msg + '</li>';
            });
            optionsBtnMarkup += '</ul></div>';
            optionsBtnMarkup += '</div>';

            $('.alert_next_alliance')
                .parent()
                .append(btnMarkup);

            $('.alert_notify_alliance')
                .first()
                .parent()
                .prepend(optionsBtnMarkup);

            $('#openAllianceShareOptions').click(() => {
                $('#allianceShareOptions').show();
                $('#openAllianceShareOptions').hide();
            });

            $('.custom_AllianceShareText').click(function () {
                $('#allianceShareText').val($(this).text());
            });

            $('.alert_notify_alliance').append(
                '<span style="margin-left: 5px;" class="glyphicon glyphicon-arrow-right"></span>'
            );

            $('.alert_notify_alliance').click(AlliancePressed);
        };

        // Add Keylisteners
        const shortcutKeys = 82;
        var test = true;

        $(document).keydown(e => {
            if (!($("input").is(":focus"))) {
                if (localStorage.getItem('SAP_MJR_Shortcut') === 'on') {
                    switch (e.keyCode) {
                        case shortcutKeys:
                            AlliancePressed()
                            break;
                    }
                    return e.returnValue;
                }
            }
        });

        const AlliancePressed = () => {
            if (test && possible_to_share) {
                test = false;
                const missionSharel = $('#mission_alliance_share_btn').attr('href');
                if (missionSharel) {
                    processAllianceShare();
                }
            }
            else {
                alert("Deze inzet is onder de deelgrens. Gebruik de normale deelknop om alsnog te delen!")
            }
        }


        const processAllianceShare = () => {
            $('#allianceShareOptions').hide();
            $('#openAllianceShareOptions').show();

            const sendToAlliance = $('#postToChat').is(':checked') ? 1 : 0;
            const missionShareLink = $('#mission_alliance_share_btn').attr('href');
            const missionId = missionShareLink
                .replace('/missions/', '')
                .replace('/alliance', '');
            const csrfToken = $('meta[name="csrf-token"]').attr('content');
            const message = $('#allianceShareText').val();

            $('.alert_notify_alliance').html('Delen...');
            $.ajax({
                url: missionShareLink,
                headers: {
                    'MJR': "1",
                },
                success() {
                    $('.alert_notify_alliance').html('Chat...');
                    $.ajax({
                        type: 'POST',
                        url: `/mission_replies`,
                        headers: {
                            'MJR': "1",
                        },
                        data: {
                            authenticity_token: csrfToken,
                            mission_reply: {
                                alliance_chat: sendToAlliance,
                                content: message,
                                mission_id: missionId,
                            },
                        },
                        success() {
                            $('.alert_notify_alliance').html('Alarmeren...');
                            $('.alert_next')
                                .first()
                                .click();
                        },
                    });
                },
            });
        };

        const transformMessages = async callback => {
            try {
                const missionHelp = $('#mission_help');
                const missionlink = missionHelp.attr('href');
                if (missionHelp && missionlink) {
                    let missionID = $('#mission_help').attr('href').split("/").pop().replace(/\?.*/, '');
                    const overlay = new URLSearchParams($('#mission_help').attr('href').split("/").pop()).get('overlay_index')
                    if (overlay !== null) {
                        missionID = `${missionID}-${overlay}`
                    }

                    if (requirements[missionID] == undefined || !localStorage.SAP_MJR || JSON.parse(localStorage.SAP_MJR).lastUpdate < (new Date().getTime() - 5 * 1000 * 60)) await getRequirements();
                    let credits = 0;
                    let mission = requirements[missionID];
                    if (mission.additional.guard_mission) {
                        credits = parseInt($('#col_left').text().split('Verdiensten: ')[1].split(` ${I18n.translations.nl_NL.javascript.credits}`)[0].split('.').join('')) ?? 0;
                        messages = messagesplanned.map(message => {
                            message = message.replace(/%CREDITS%/g, credits?.toLocaleString() || '');
                            return message;
                        });
                        alliance_chat_setting = planned_chat_setting ? true : false;
                        planned_alliance_chat_credits_setting ? alliance_chat_setting = parseInt(credits) >= planned_alliance_chat_credits ? true : false : '';
                        possible_to_share = true;

                    }
                    else {
                        messages = messages.map(message => {
                            credits = mission.average_credits ?? 0;
                            message = message.replace(/%CREDITS%/g, credits?.toLocaleString() || '');
                            return message;
                        });
                        alliance_chat_credits_setting ? alliance_chat_setting = parseInt(credits) >= alliance_chat_credits ? true : false : '';
                        if (credits >= alliance_credits || ignore_min_credits_to_share) {
                            possible_to_share = true
                        }
                    }
                    callback();
                };
            } catch (e) {
                console.log('Error transforming messages', e.message);
            }
        };

        let messagesplanned = ["Geplande inzet: %CREDITS% Credits"]
        let messages = ["~%CREDITS% Credits | Afvullen vanaf " + getFillTime() + " | Sluitvoertuig: " + getSluitvoertuig()]

        transformMessages(() => {
            initButtons();
        });
    }
}
