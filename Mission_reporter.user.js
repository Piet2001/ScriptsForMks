// ==UserScript==
// @name         Mission Reporter
// @namespace    http://tampermonkey.net/
// @version      2026.06.20.2
// @description  try to take over the world!
// @author       Piet2001 & LSS-Manager
// @match        https://www.meldkamerspel.com/missions/*
// @match        https://politie.meldkamerspel.com/missions/*
// @grant        none
// ==/UserScript==

(async function () {
    'use strict';

    var versie = "2026.06.20.2"
    if (!localStorage.MissionReporter_version || JSON.parse(localStorage.MissionReporter_version).Version !== versie) {
        var updates = "- Voor een verbeterde dienstverlening loggen we nu je spelersnaam, spelersID en je versie van dit script"

        localStorage.setItem('MissionReporter_version', JSON.stringify({ Version: versie }));

        fetch('/api/credits')
            .then(response => response.json())
            .then(data => {
                var request = new XMLHttpRequest();
                request.open("POST", "https://discord.com/api/webhooks/942122343730413598/jcuaJt4ZbviUIujCp5o6WmUStMvTSpYcglLzjOqaWvAFHLOkirw6FzSG9Y63RU1yo0Zf");

                request.setRequestHeader('Content-type', 'application/json');

                var params = {
                    username: "Script Update",
                    content: `${data.user_name} (${data.user_id}) updated MissionReporter to version ${versie}`
                }

                request.send(JSON.stringify(params));

                var script = "MissionReporter"
                var message = `${data.user_name} (${data.user_id}) updated to version ${versie}`

                $.get(`https://script.google.com/macros/s/AKfycbxDJhR048SL8-LbQrNZ1xc20wC-NB8FLukE_8S9WQivko8MyWp5HgONTExscDKv2fQ5/exec?script=${script}&message=${message}`)
            });
    }

    const STORAGE_KEY = 'sap_mjr_sent_mission_ids_daily';

    function getLocalDateKey() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function readDailyMissionStore() {
        const today = getLocalDateKey();

        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return { date: today, ids: [] };
            }

            const parsed = JSON.parse(raw);
            if (!parsed || parsed.date !== today || !Array.isArray(parsed.ids)) {
                return { date: today, ids: [] };
            }

            return parsed;
        } catch {
            return { date: today, ids: [] };
        }
    }

    function writeDailyMissionStore(store) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }
    
    const missionHelp = $('#mission_help');
    const missionlink = missionHelp.attr('href');
    let missionID = null;
    if (missionHelp && missionlink) {
        missionID = $('#mission_general_info').attr('data-mission-type');
        const overlay = $('#mission_general_info').attr('data-overlay-index') ?? null;
        const additive = $('#mission_general_info').attr('data-additive-overlays') ?? null;
        if (overlay !== null) {
            missionID = `${missionID}-${overlay}`
        }
        if (additive !== null) {
            missionID = `${missionID}/${additive}`
        }
    }

    if (!missionID) {
        return;
    }

    const store = readDailyMissionStore();
    if (store.ids.includes(missionID)) {
        return;
    }

    await fetch("https://piet2001-mks.hf.space/missions/log", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            mission: missionID,
        }),
    });

    store.ids.push(missionID);
    writeDailyMissionStore(store);

})();
