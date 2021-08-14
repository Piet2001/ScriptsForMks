// ==UserScript==
// @name         SAP_MJR
// @namespace    http://tampermonkey.net/
// @version      2021.08.14.11.29
// @description  try to take over the world!
// @author       Piet2001 & LSS-Manager
// @match        https://www.meldkamerspel.com/missions/*
// @grant        none
// ==/UserScript==

(async function () {
    'use strict';
    var requirements = localStorage.MKS_requirements === undefined ? {} : JSON.parse(localStorage.MKS_requirements)
    let alliance_chat_setting = false; // Standaard instelling wel/niet in chat posten
    let alliance_chat_credits_setting = true; // Alleen in chat plaatsen als boven ingesteld aantal credits. Deze instelling overschrijft de vorige instelling.
    let alliance_chat_credits = 3000; // aantal credits wanneer die in de chat moet worden geplaatst

    let planned_chat_setting = true; // Instelling of geplande inzetten standaard in de chat komen
    let planned_alliance_chat_credits_setting = false; // Alleen in chat plaatsen als boven ingesteld aantal credits. Deze instelling overschrijft de vorige instelling.
    let planned_alliance_chat_credits = 5000; // aantal credits wanneer geplande inzetten in de chat moet worden geplaatst

    const getFillTime = () => {
        let time = new Date();
        let hours = time.getHours() + 2;
        let mins = (time.getMinutes() < 10 ? '0' : '') + time.getMinutes();

        return `${hours}:${mins}`
    }

    const getSluitvoertuig = () => {
        const missionHelp = $('#mission_help');
        const missionlink = missionHelp.attr('href');
        if (missionHelp && missionlink) {
            const missionID = missionlink
                .replace(/\?.*$/, '')
                .match(/\d*$/)[0];

            let mission = requirements[parseInt(missionID)];

            if (mission.requirements.elw3 > 0) {
                return "CO"
            }
            else if (mission.requirements.mobile_command_vehicles > 0) {
                return "HOD"
            }
            else if (mission.requirements.battalion_chief_vehicles > 0) {
                return "OVD"
            }
            else if (mission.requirements.ovdp > 0) {
                return "OVD-P"
            }
            else if (mission.requirements.mobile_air_vehicles > 0) {
                return "AB"
            }
            else {
                return "Onbekend, meld aan vrijgever"
            }
        }
    }

    function getRequirements() {
        try {
            return new Promise(resolve => {

                $.ajax({
                    url: "/einsaetze.json",
                    method: "GET",
                    success: function (data, textStatus) {
                        data.forEach((mission) => { requirements[mission.id] = mission })
                        localStorage.MKS_requirements = JSON.stringify(requirements);
                        resolve(data)
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
                switch (e.keyCode) {
                    case shortcutKeys:
                        AlliancePressed()
                        break;
                }
                return e.returnValue;
            }
        });

        const AlliancePressed = () => {
            if (test) {
                test = false;
                const missionSharel = $('#mission_alliance_share_btn').attr('href');
                if (missionSharel) {

                    var tag = document.getElementById("AMBU");
                    if (tag.style.background === "green") {
                        processAllianceShare();
                    }
                    if (tag.style.background === "red") {
                        test = true
                    }
                }
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
                url: `/missions/${missionId}/alliance`,
                headers: {
                    'X-LSS-Manager': "3.3.7"
                },
                success() {
                    $('.alert_notify_alliance').html('Chat...');
                    $.ajax({
                        type: 'POST',
                        url: `/mission_replies`,
                        headers: {
                            'X-LSS-Manager': "3.3.7",
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
                    const missionID = missionlink
                        .replace(/\?.*$/, '')
                        .match(/\d*$/)[0];

                    if (requirements[parseInt(missionID)] == undefined) await getRequirements();
                    let credits = 0;
                    let mission = requirements[parseInt(missionID)];
                    if (mission.additional.guard_mission) {
                        credits = parseInt($('#col_left').text().split('Verdiensten: ')[1].split(` ${I18n.translations.nl_NL.javascript.credits}`)[0].split('.').join('')) ?? 0;
                        messages = messagesplanned.map(message => {
                            message = message.replace(/%CREDITS%/g, credits?.toLocaleString() || '');
                            return message;
                        });
                        alliance_chat_setting = planned_chat_setting ? true : false;
                        planned_alliance_chat_credits_setting ? alliance_chat_setting = parseInt(credits) >= planned_alliance_chat_credits ? true : false : '';


                    }
                    else {
                        messages = messages.map(message => {
                            credits = mission.average_credits ?? 0;
                            message = message.replace(/%CREDITS%/g, credits?.toLocaleString() || '');
                            return message;
                        });
                        alliance_chat_credits_setting ? alliance_chat_setting = parseInt(credits) >= alliance_chat_credits ? true : false : '';
                    }
                    callback();
                };
            } catch (e) {
                console.log('Error transforming messages', e.message);
            }
        };

        let messagesplanned = ["Geplande inzet: %CREDITS% Credits"]
        let messages = ["%CREDITS% Credits | Afvullen vanaf " + getFillTime() + " | Sluitvoertuig " + getSluitvoertuig()]

        transformMessages(() => {
            initButtons();
        });
    }
})();