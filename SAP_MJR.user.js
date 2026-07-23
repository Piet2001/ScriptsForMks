// ==UserScript==
// @name         SAP_MJR
// @namespace    http://tampermonkey.net/
// @version      2026.07.23.02
// @description  try to take over the world!
// @author       Piet2001 & LSS-Manager
// @match        https://www.meldkamerspel.com/*
// @match        https://politie.meldkamerspel.com/*
// @grant        none
// ==/UserScript==

// ── IndexedDB helpers ────────────────────────────────────────────────────────
let _db;
const dbName = "SAP_MJR";
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
      // Existing DB without the store: bump version to trigger onupgradeneeded.
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

  setlocalstorageitems();
  setnavitems();

  function setlocalstorageitems() {
    if (!localStorage.SAP_MJR_Shortcut) {
      localStorage.setItem("SAP_MJR_Shortcut", "off");
    }
  }

  function setnavitems() {
    var navSAP_MJR_Shortcut =
      '<a role="presentation" href="#" id="setSAP_MJR_Shortcut" data-SAP_MJR_Shortcut="' +
      localStorage.getItem("SAP_MJR_Shortcut") +
      '" >SAP_MJR Sneltoets (R): <strong><span id="showSAP_MJR_Shortcut">' +
      (localStorage.getItem("SAP_MJR_Shortcut") == "on" ? "Aan" : "Uit") +
      "</span></strong></a>";
    $(
      "ul .dropdown-menu[aria-labelledby='menu_alliance'] >> a[href='/freunde']",
    )
      .parent()
      .after(navSAP_MJR_Shortcut);
  }

  $("#setSAP_MJR_Shortcut").click(function () {
    if (localStorage.getItem("SAP_MJR_Shortcut") == "on") {
      localStorage.setItem("SAP_MJR_Shortcut", "off");
    } else {
      localStorage.setItem("SAP_MJR_Shortcut", "on");
    }
    $("#showSAP_MJR_Shortcut").html(
      localStorage.getItem("SAP_MJR_Shortcut") == "on" ? "Aan" : "Uit",
    );
  });

  function checkurl() {
    var url = window.location.pathname.split("/");
    $.each(url, function (index, value) {
      if (value == "missions") {
        runPage = true;
      }
    });
    return runPage;
  }

  var versie = "2026.07.23.02";
  const versionState = getParsedLocalStorageItem("SAP_MJR_VERSION", {});
  if (versionState.Version !== versie) {
    var updates =
      "Migratie naar IndexedDB voor betere prestaties en betrouwbaarheid.\n";

    alert(
      `SAP_MJR - Versie ${versie} nieuwe update! \n\n Updates:\n${updates}`,
    );

    localStorage.setItem(
      "SAP_MJR_VERSION",
      JSON.stringify({ Version: versie }),
    );

    fetch("/api/credits")
      .then((response) => response.json())
      .then((data) => {
        var request = new XMLHttpRequest();
        request.open(
          "POST",
          "https://discord.com/api/webhooks/1384978318918422609/RSVREOP2MmWdSm0F_C-NWuoQ24co1Y_kKicqtLrl5ijWo4EuPUNRlK_HYXN5Y1nHnDKJ",
        );

        request.setRequestHeader("Content-type", "application/json");

        var params = {
          username: "Script Update",
          content: `${data.user_name} (${data.user_id}) updated SAP_MJR to version ${versie}`,
        };

        request.send(JSON.stringify(params));

        var script = "SAP_MJR";
        var message = `${data.user_name} (${data.user_id}) updated to version ${versie}`;

        $.get(
          `https://script.google.com/macros/s/AKfycbxDJhR048SL8-LbQrNZ1xc20wC-NB8FLukE_8S9WQivko8MyWp5HgONTExscDKv2fQ5/exec?script=${script}&message=${message}`,
        );
      });
  }
  const scriptState = getParsedLocalStorageItem("SAP_MJR", { lastUpdate: 0 });
  if (scriptState.lastUpdate < new Date().getTime() - 5 * 1000 * 60) {
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
      const missionID = getMissionReporterMissionId();
      if (missionID) {
        if (!missionReportTriggered) {
          missionReportTriggered = true;
          void reportMissionIfNeeded(missionID);
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
          return "HGL/Hondengeleider";
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
          return "Strandvoetuig/PM-OR";
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

      // Use cached requirements when they are still fresh.
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
    const initButtons = () => {
      if ($(".alert_notify_alliance").length > 0) {
        return;
      }

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
      btnMarkup += "</a></div>";

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
        ` id="postToChat" name="postToChat" value="true" ${alliance_chat_setting ? 'checked="true"' : ""}>` +
        "Naar Team Chat" +
        "</label>";

      optionsBtnMarkup += '<div style="text-align: left;"><ul>';
      $.each(messages, (index, msg) => {
        optionsBtnMarkup +=
          '<li class="custom_AllianceShareText">' + msg + "</li>";
      });
      optionsBtnMarkup += "</ul></div>";
      optionsBtnMarkup += "</div>";

      const allianceButton = $(".alert_next_alliance");
      if (!allianceButton.length) {
        return;
      }

      allianceButton.parent().append(btnMarkup);

      $(".alert_notify_alliance").first().parent().prepend(optionsBtnMarkup);

      $("#openAllianceShareOptions").click(() => {
        $("#allianceShareOptions").show();
        $("#openAllianceShareOptions").hide();
      });

      $(".custom_AllianceShareText").click(function () {
        $("#allianceShareText").val($(this).text());
      });

      $(".alert_notify_alliance").append(
        '<span style="margin-left: 5px;" class="glyphicon glyphicon-arrow-right"></span>',
      );

      $(".alert_notify_alliance").click(AlliancePressed);
    };

    const observeAndInitButtons = () => {
      if ($(".alert_next_alliance").length) {
        initButtons();
        return;
      }

      const observer = new MutationObserver(() => {
        if ($(".alert_next_alliance").length) {
          initButtons();
          observer.disconnect();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    };

    // Add Keylisteners
    const shortcutKeys = 82;
    var test = true;

    $(document).keydown((e) => {
      if (!$("input").is(":focus")) {
        if (localStorage.getItem("SAP_MJR_Shortcut") === "on") {
          switch (e.keyCode) {
            case shortcutKeys:
              AlliancePressed();
              break;
          }
          return e.returnValue;
        }
      }
    });

    const AlliancePressed = () => {
      if (test && possible_to_share) {
        test = false;
        const missionSharel = $("#mission_alliance_share_btn").attr("href");
        if (missionSharel) {
          processAllianceShare();
        }
      } else {
        alert(
          "Deze inzet is onder de deelgrens. Gebruik de normale deelknop om alsnog te delen!",
        );
      }
    };

    const processAllianceShare = () => {
      $("#allianceShareOptions").hide();
      $("#openAllianceShareOptions").show();

      const sendToAlliance = $("#postToChat").is(":checked") ? 1 : 0;
      const missionShareLink = $("#mission_alliance_share_btn").attr("href");
      const missionId = missionShareLink
        .replace("/missions/", "")
        .replace("/alliance", "");
      const csrfToken = $('meta[name="csrf-token"]').attr("content");
      const message = $("#allianceShareText").val();

      $(".alert_notify_alliance").html("Delen...");
      $.ajax({
        url: missionShareLink,
        headers: {
          MJR: "1",
        },
        success() {
          $(".alert_notify_alliance").html("Chat...");
          $.ajax({
            type: "POST",
            url: `/mission_replies`,
            headers: {
              MJR: "1",
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
              $(".alert_notify_alliance").html("Alarmeren...");
              $(".alert_next").first().click();
            },
          });
        },
      });
    };

    const transformMessages = async (callback) => {
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

          const sharedState = getParsedLocalStorageItem("SAP_MJR", {
            lastUpdate: 0,
          });
          if (
            requirements[missionID] == undefined ||
            sharedState.lastUpdate < new Date().getTime() - 5 * 1000 * 60
          )
            await getRequirements();

          // Rebuild the default message after requirements are available,
          // so Sluitvoertuig is not stuck on an early "Geen data" value.
          messages = [
            "~%CREDITS% Credits | Afvullen vanaf " +
              getFillTime() +
              " | Sluitvoertuig: " +
              getSluitvoertuig(),
          ];

          let credits = 0;
          let mission = requirements[missionID];
          if (!mission || !mission.additional) {
            callback();
            return;
          }
          if (mission.additional.guard_mission) {
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
              return message;
            });
            alliance_chat_setting = planned_chat_setting ? true : false;
            planned_alliance_chat_credits_setting
              ? (alliance_chat_setting =
                  parseInt(credits) >= planned_alliance_chat_credits
                    ? true
                    : false)
              : "";
            possible_to_share = true;
          } else {
            messages = messages.map((message) => {
              credits = mission.average_credits ?? 0;
              message = message.replace(
                /%CREDITS%/g,
                credits?.toLocaleString() || "",
              );
              return message;
            });
            alliance_chat_credits_setting
              ? (alliance_chat_setting =
                  parseInt(credits) >= alliance_chat_credits ? true : false)
              : "";
            if (credits >= alliance_credits || ignore_min_credits_to_share) {
              possible_to_share = true;
            }
          }
          callback();
        }
      } catch (e) {
        console.log("Error transforming messages", e.message);
      }
    };

    let messagesplanned = ["Geplande inzet: %CREDITS% Credits"];
    let messages = [
      "~%CREDITS% Credits | Afvullen vanaf " +
        getFillTime() +
        " | Sluitvoertuig: " +
        getSluitvoertuig(),
    ];

    transformMessages(() => {
      observeAndInitButtons();
    });
  }
}
