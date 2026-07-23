// ==UserScript==
// @name         resendShareMessageMJR
// @namespace    http://tampermonkey.net/
// @version      2026.07.23.01
// @description  try to take over the world!
// @author       Piet2001 & LSS-Manager
// @match        https://www.meldkamerspel.com/*
// @match        https://politie.meldkamerspel.com/*
// @grant        none
// ==/UserScript==

// ── IndexedDB helpers ────────────────────────────────────────────────────────
let _db;
const dbName = "RESEND_MJR";
const storeName = "data";

function initDB() {
  return new Promise((resolve, reject) => {
    const openReq = indexedDB.open(dbName, 1);

    openReq.onsuccess = (e) => {
      const db = e.target.result;
      if (db.objectStoreNames.contains(storeName)) {
        _db = db;
        resolve(_db);
        return;
      }
      const nextVersion = db.version + 1;
      db.close();
      const upgradeReq = indexedDB.open(dbName, nextVersion);
      upgradeReq.onupgradeneeded = (upgradeEvent) => {
        const upgradeDb = upgradeEvent.target.result;
        if (!upgradeDb.objectStoreNames.contains(storeName)) {
          upgradeDb.createObjectStore(storeName);
        }
      };
      upgradeReq.onsuccess = (upgradeEvent) => {
        _db = upgradeEvent.target.result;
        resolve(_db);
      };
      upgradeReq.onerror = (upgradeEvent) => reject(upgradeEvent.target.error);
      upgradeReq.onblocked = () =>
        reject(new Error("IndexedDB upgrade blocked by another tab."));
    };
    openReq.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
    openReq.onerror = (e) => reject(e.target.error);
    openReq.onblocked = () =>
      reject(new Error("IndexedDB open blocked by another tab."));
  });
}

function dbGet(key) {
  return new Promise((resolve, reject) => {
    const req = _db
      .transaction(storeName, "readonly")
      .objectStore(storeName)
      .get(key);
    req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
    req.onerror = () => reject(req.error);
  });
}

function dbSet(key, value) {
  return new Promise((resolve, reject) => {
    const req = _db
      .transaction(storeName, "readwrite")
      .objectStore(storeName)
      .put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
// ────────────────────────────────────────────────────────────────────────────

function getParsedLocalStorageItem(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

var runPage = false;

(async function () {
  "use strict";

  function checkurl() {
    var url = window.location.pathname.split("/");
    $.each(url, function (index, value) {
      if (value == "missions") {
        runPage = true;
      }
    });
    return runPage;
  }

  var versie = "2026.07.23.01";
  const versionState = getParsedLocalStorageItem(
    "resendShareMessageMJR_VERSION",
    {},
  );
  if (versionState.Version !== versie) {
    var updates =
      "Migratie naar IndexedDB voor betere prestaties en betrouwbaarheid.\n";

    alert(
      `ResentShareMessageMJR - Versie ${versie} nieuwe update! \n\n Updates:\n${updates}`,
    );

    localStorage.setItem(
      "resendShareMessageMJR_VERSION",
      JSON.stringify({ Version: versie }),
    );

    fetch("/api/credits")
      .then((response) => response.json())
      .then((data) => {
        var script = "resendShareMessageMJR";
        var message = `${data.user_name} (${data.user_id}) updated to version ${versie}`;

        $.get(
          `https://script.google.com/macros/s/AKfycbxDJhR048SL8-LbQrNZ1xc20wC-NB8FLukE_8S9WQivko8MyWp5HgONTExscDKv2fQ5/exec?script=${script}&message=${message}`,
        );
      });
  }

  const resendState = getParsedLocalStorageItem("resendShareMessageMJR", {
    lastUpdate: 0,
  });
  if (resendState.lastUpdate < new Date().getTime() - 5 * 1000 * 60) {
    fetch("/api/allianceinfo")
      .then((response) => response.json())
      .then((data) => {
        if (data.id === 528) {
          RunScript();
        } else {
          alert(
            "U zit niet in het juiste team om gebruik te maken van dit script",
          );
        }
      });
  } else {
    if (checkurl()) {
      RunScript();
    }
  }
})();

function RunScript() {
  const MISSION_REPORTER_STORAGE_KEY = "MissionReporter_sent_mission_ids_daily";
  let missionReportTriggered = false;

  let alliance_credits = 5000;
  let ignore_min_credits_to_share = false;
  let possible_to_share = false;
  let minOpenTime = 2;

  let requirements = {};
  let alliance_chat_setting = false; // Standaard instelling wel/niet in chat posten
  let alliance_chat_credits_setting = false; // Alleen in chat plaatsen als boven ingesteld aantal credits. Deze instelling overschrijft de vorige instelling.
  let alliance_chat_credits = 5000; // aantal credits wanneer die in de chat moet worden geplaatst

  let planned_chat_setting = false; // Instelling of geplande inzetten standaard in de chat komen
  let planned_alliance_chat_credits_setting = false; // Alleen in chat plaatsen als boven ingesteld aantal credits. Deze instelling overschrijft de vorige instelling.
  let planned_alliance_chat_credits = 10000; // aantal credits wanneer geplande inzetten in de chat moet worden geplaatst

  function safeGetLocalStorageItem(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function safeSetLocalStorageItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  function getLocalDateKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function readDailyMissionStore() {
    const today = getLocalDateKey();

    try {
      const raw = safeGetLocalStorageItem(MISSION_REPORTER_STORAGE_KEY);
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
    safeSetLocalStorageItem(
      MISSION_REPORTER_STORAGE_KEY,
      JSON.stringify(store),
    );
  }

  function getMissionReporterMissionId() {
    const missionHelp = $("#mission_help");
    const missionLink = missionHelp.attr("href");
    if (!missionHelp.length || !missionLink) {
      return null;
    }

    let missionID = $("#mission_general_info").attr("data-mission-type");
    const overlay =
      $("#mission_general_info").attr("data-overlay-index") ?? null;
    const additive =
      $("#mission_general_info").attr("data-additive-overlays") ?? null;
    if (!missionID) {
      return null;
    }
    if (overlay !== null) {
      missionID = `${missionID}-${overlay}`;
    }
    if (additive !== null) {
      missionID = `${missionID}/${additive}`;
    }

    return missionID;
  }

  async function reportMissionIfNeeded(missionID) {
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
  }

  const getFillTime = () => {
    let time = new Date();
    let hours = time.getHours() + minOpenTime;
    if (hours > 23) {
      hours -= 24;
    }
    let mins = (time.getMinutes() < 10 ? "0" : "") + time.getMinutes();

    return `${hours}:${mins}`;
  };

  const getSluitvoertuig = () => {
    try {
      const missionHelp = $("#mission_help");
      const missionlink = missionHelp.attr("href");
      if (missionHelp && missionlink) {
        let missionID = $("#mission_general_info").attr("data-mission-type");
        const overlay =
          $("#mission_general_info").attr("data-overlay-index") ?? null;
        const additive =
          $("#mission_general_info").attr("data-additive-overlays") ?? null;
        if (overlay !== null) {
          missionID = `${missionID}-${overlay}`;
        }
        if (additive !== null) {
          missionID = `${missionID}/${additive}`;
        }

        let mission = requirements[missionID];

        if (
          mission.requirements.elw3 > 0 &&
          typeof mission.chances.elw3 == "undefined"
        ) {
          return "CO";
        } else if (
          mission.requirements.mobile_command_vehicles > 0 &&
          typeof mission.chances.mobile_command_vehicles == "undefined"
        ) {
          return "HOD";
        } else if (
          mission.requirements.battalion_chief_vehicles > 0 &&
          typeof mission.chances.battalion_chief_vehicles == "undefined"
        ) {
          return "OVD-B/HOD";
        } else if (
          mission.requirements.spokesman > 0 &&
          typeof mission.chances.spokesman == "undefined"
        ) {
          return "VL";
        } else if (
          mission.requirements.police_helicopters > 0 &&
          typeof mission.chances.police_helicopters == "undefined"
        ) {
          return "ZULU";
        } else if (
          mission.requirements.hondengeleider > 0 &&
          typeof mission.chances.hondengeleider == "undefined"
        ) {
          return "HGL";
        } else if (
          mission.requirements.detention_unit > 0 &&
          typeof mission.chances.detention_unit == "undefined"
        ) {
          return "ME-AE";
        } else if (
          mission.requirements.at_c > 0 &&
          typeof mission.chances.at_c == "undefined"
        ) {
          return "AT-C";
        } else if (
          mission.requirements.lebefkw > 0 &&
          typeof mission.chances.lebefkw == "undefined"
        ) {
          return "ME-C";
        } else if (
          mission.requirements.mobile_air_vehicles > 0 &&
          typeof mission.chances.mobile_air_vehicles == "undefined"
        ) {
          return "AB";
        } else if (
          mission.requirements.boats > 0 &&
          typeof mission.chances.boats == "undefined"
        ) {
          return "WOA/BA-RB";
        } else if (
          mission.requirements.water_rescue > 0 &&
          typeof mission.chances.water_rescue == "undefined"
        ) {
          return "Strandvoertuig/PM-OR";
        } else if (
          mission.requirements.coastal_guard_boat > 0 &&
          typeof mission.chances.coastal_guard_boat == "undefined"
        ) {
          return "KW-Boot";
        } else {
          return "Onbekend, meld aan vrijgever";
        }
      }
    } catch {
      return "Geen data";
    }
  };

  async function getRequirements() {
    try {
      await initDB();
      let dbReq = null;
      let lastUpdated = 0;

      try {
        dbReq = await dbGet("MKS_requirements");
      } catch (dbErr) {
        console.error("IndexedDB dbGet error:", dbErr);
      }
      try {
        lastUpdated = await dbGet("MKS_requirements_lastupdated");
      } catch {
        lastUpdated = 0;
      }

      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      if (
        dbReq &&
        Object.keys(dbReq).length > 0 &&
        lastUpdated &&
        now - lastUpdated < fiveMinutes
      ) {
        requirements = dbReq;
        return requirements;
      }

      try {
        const resp = await fetch(
          "https://raw.githubusercontent.com/Piet2001/Inzetten/main/complete.json",
        );
        if (!resp.ok) throw new Error("Fetch failed");
        const text = await resp.text();
        const data = JSON.parse(text);

        requirements = {};
        data.forEach((mission) => {
          requirements[mission.id] = mission;
        });

        await dbSet("MKS_requirements", requirements);
        await dbSet("MKS_requirements_lastupdated", now);
        localStorage.setItem("SAP_MJR", JSON.stringify({ lastUpdate: now }));
        return requirements;
      } catch (fetchErr) {
        if (dbReq && Object.keys(dbReq).length > 0) {
          requirements = dbReq;
          console.warn("Fetch failed, using cached requirements:", fetchErr);
          return requirements;
        }
        console.error("Fetch failed and no cached requirements:", fetchErr);
        return {};
      }
    } catch (err) {
      console.error("getRequirements error:", err.message);
      return {};
    }
  }

  if (window.location.pathname.indexOf("/missions/") === 0) {
    // Create Button and add event listener

    var button = `<div class="btn-group" style="margin-left: 5px; margin-right: 5px;">
        <a href="#" class="btn btn-success btn-sm send_share_message" title="Stuur deelbericht">
        <span class="glyphicon glyphicon-bullhorn" style="font-size: 13px;"></span></a></div>`;

    $(".mission_reply_content").parent().append(button);

    $(".send_share_message").click(async function (e) {
      e.preventDefault();
      const missionId = window.location.href.split("/").pop().replace("#", "");
      const csrfToken = $('meta[name="csrf-token"]').attr("content");
      let messagesplanned = ["Geplande inzet: %CREDITS% Credits"];
      let messages = [
        "~%CREDITS% Credits | Afvullen vanaf " +
          getFillTime() +
          " | Sluitvoertuig: " +
          getSluitvoertuig(),
      ];
      var messageToPost = "";
      const missionHelp = $("#mission_help");
      const missionlink = missionHelp.attr("href");
      if (missionHelp && missionlink) {
        let missionID = $("#mission_general_info").attr("data-mission-type");
        const overlay =
          $("#mission_general_info").attr("data-overlay-index") ?? null;
        const additive =
          $("#mission_general_info").attr("data-additive-overlays") ?? null;
        if (overlay !== null) {
          missionID = `${missionID}-${overlay}`;
        }
        if (additive !== null) {
          missionID = `${missionID}/${additive}`;
        }

        const sharedState = getParsedLocalStorageItem("SAP_MJR", {
          lastUpdate: 0,
        });
        if (
          requirements[missionID] == undefined ||
          sharedState.lastUpdate < new Date().getTime() - 5 * 1000 * 60
        )
          await getRequirements();

        messages = [
          "~%CREDITS% Credits | Afvullen vanaf " +
            getFillTime() +
            " | Sluitvoertuig: " +
            getSluitvoertuig(),
        ];

        // Report mission if needed
        if (!missionReportTriggered) {
          missionReportTriggered = true;
          void reportMissionIfNeeded(missionID);
        }

        let credits = 0;
        let mission = requirements[missionID];
        if (!mission || !mission.additional) {
          messageToPost = messages[0] || "Inzet gedeeld";
        } else if (mission.additional.guard_mission) {
          credits =
            parseInt(
              $("#col_left")
                .text()
                .split("Verdiensten: ")[1]
                .split(` ${I18n.translations.nl_NL.javascript.credits}`)[0]
                .split(".")
                .join(""),
            ) ?? 0;
          messages = messagesplanned.map((message) => {
            message = message.replace(
              /%CREDITS%/g,
              credits?.toLocaleString() || "",
            );
            messageToPost = message;
          });
        } else {
          messages = messages.map((message) => {
            credits = mission.average_credits ?? 0;
            message = message.replace(
              /%CREDITS%/g,
              credits?.toLocaleString() || "",
            );
            messageToPost = message;
          });
        }
      }

      if (!messageToPost) {
        messageToPost = messages[0] || "Inzet gedeeld";
      }

      $.ajax({
        type: "POST",
        url: `/mission_replies`,
        headers: {
          MJR: "1",
        },
        data: {
          authenticity_token: csrfToken,
          mission_reply: {
            alliance_chat: 0,
            content: messageToPost,
            mission_id: missionId,
          },
        },
        success: function () {
          window.location.reload();
        },
        error: function (xhr, textStatus, errorThrown) {
          console.error("Kon bericht niet verzenden:", textStatus, errorThrown);
          alert("Bericht kon niet verzonden worden. Probeer opnieuw.");
        },
      });
    });
  }
}
