// ==UserScript==
// @name         SumDaily local
// @namespace    http://tampermonkey.net/
// @version      2021.09.11
// @description  Daily sum of mission totals
// @author       Piet2001 | LSS-Manager
// @match        https://www.meldkamerspel.com/credits/daily*
// @match        https://politie.meldkamerspel.com/credits/daily*
// @grant        none
// ==/UserScript==

(function () {

    let anzahl_pro_einsatz = document.querySelectorAll("#iframe-inside-container > table > tbody > tr > td:nth-child(3)");
    let credit_pro_einsatz = document.querySelectorAll("#iframe-inside-container > table > tbody > tr > td:nth-child(1)");
    let einsatz_titel = document.querySelectorAll("#iframe-inside-container > table > tbody > tr > td:nth-child(4)");
    let sum_einsaetze = 0;
    let cre_einsaetze = 0;
    let sum_patienten = 0;
    let cre_patienten = 0;
    let sum_gefangene = 0;
    let cre_gefangene = 0;
    let sum_verband = 0;
    let cre_verband = 0;
    let sum_verbande = 0;
    let cre_verbande = 0;

    let css = '' +
        '#num_label {margin-right: 5px;padding: 5px 0px 5px 5px;border: 1.5px solid black;font-size: inherit;border-radius: 5px;}' +
        '#num_anzahl {background: #333;padding: 4.5px;margin-left: 5px;margin-right: 1px;}' +
        '#num_icon {margin-right: 5px;}',

        head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');

    style.type = 'text/css';
    if (style.styleSheet) style.styleSheet.cssText = css;
    else style.appendChild(document.createTextNode(css));
    head.appendChild(style);

    if (anzahl_pro_einsatz !== null && credit_pro_einsatz !== null && einsatz_titel !== null) {
        for (let i = 0; i < anzahl_pro_einsatz.length; i++) {
            //Zähle Anzahl behandelter Patienten
            if (einsatz_titel[i].innerText.match('Patiënten behandeling') ||
                einsatz_titel[i].innerText.match('Patiënten behandeling en transport')) {
                let anzahl = anzahl_pro_einsatz[i].innerHTML;
                sum_patienten = sum_patienten + Number(anzahl.replace(" x", "").replace(/[,.]/g, '').replace(/\D/g, ''));
            }
            //Zähle Ausbauten, abgebrochene Einsätze, Verbandseinlieferungen und Ausbildung nicht dazu
            else if (einsatz_titel[i].innerText.match('uitgebreid') ||
                einsatz_titel[i].innerText.match('gekocht') ||
                einsatz_titel[i].innerText.match('Afgebroken') ||
                einsatz_titel[i].innerText.match('Opleiding') ||
                einsatz_titel[i].innerText.match('uitgebreid') ||
                einsatz_titel[i].innerText.match('gebouwd') ||
                einsatz_titel[i].innerText.match('Terugbetaald') ||
                einsatz_titel[i].innerText.match('gesloopt')) {
            }
            else if (einsatz_titel[i].innerText.match('Arrestanten getransporteerd')) {
                let anzahl = anzahl_pro_einsatz[i].innerHTML;
                sum_gefangene = sum_gefangene + Number(anzahl.replace(" x", "").replace(/[,.]/g, '').replace(/\D/g, ''));
            }
            else if (einsatz_titel[i].innerText.match('Teamopname')) {
                let anzahl = anzahl_pro_einsatz[i].innerHTML;
                sum_verbande = sum_verbande + Number(anzahl.replace(" x", "").replace(/[,.]/g, '').replace(/\D/g, ''));
            }
            else if (einsatz_titel[i].innerText.match('\\[Team\\]')) {
                let anzahl = anzahl_pro_einsatz[i].innerHTML;
                sum_verband = sum_verband + Number(anzahl.replace(" x", "").replace(/[,.]/g, '').replace(/\D/g, ''));
            }
            //Alles andere sind normale Einsätze und können gezählt werden
            else {
                let anzahl = anzahl_pro_einsatz[i].innerHTML;
                sum_einsaetze = sum_einsaetze + Number(anzahl.replace(" x", "").replace(/[,.]/g, '').replace(/\D/g, ''));
            }
        }
        for (let i = 0; i < credit_pro_einsatz.length; i++) {
            //Zähle Anzahl behandelter Patienten
            if (einsatz_titel[i].innerText.match('Patiënten behandeling') ||
                einsatz_titel[i].innerText.match('Patiënten behandeling en transport')) {
                let anzahl = credit_pro_einsatz[i].innerHTML;
                cre_patienten = cre_patienten + Number(anzahl.replace(/[,.]/g, '').replace(/\D/g, ''));
            }
            //Zähle Ausbauten, abgebrochene Einsätze, Verbandseinlieferungen und Ausbildung nicht dazu
            else if (einsatz_titel[i].innerText.match('uitgebreid') ||
                einsatz_titel[i].innerText.match('gekocht') ||
                einsatz_titel[i].innerText.match('Afgebroken') ||
                einsatz_titel[i].innerText.match('Opleiding') ||
                einsatz_titel[i].innerText.match('uitgebreid') ||
                einsatz_titel[i].innerText.match('gebouwd') ||
                einsatz_titel[i].innerText.match('Terugbetaald') ||
                einsatz_titel[i].innerText.match('gesloopt')) {
            }
            else if (einsatz_titel[i].innerText.match('Arrestanten getransporteerd')) {
                let anzahl = credit_pro_einsatz[i].innerHTML;
                cre_gefangene = cre_gefangene + Number(anzahl.replace(/[,.]/g, '').replace(/\D/g, ''));
            }
            else if (einsatz_titel[i].innerText.match('Teamopname')) {
                let anzahl = credit_pro_einsatz[i].innerHTML;
                cre_verbande = cre_verbande + Number(anzahl.replace(/[,.]/g, '').replace(/\D/g, ''));
            }
            else if (einsatz_titel[i].innerText.match('\\[Team\\]')) {
                let anzahl = credit_pro_einsatz[i].innerHTML;
                cre_verband = cre_verband + Number(anzahl.replace(/[,.]/g, '').replace(/\D/g, ''));
            }
            //Alles andere sind normale Einsätze und können gezählt werden
            else {
                let anzahl = credit_pro_einsatz[i].innerHTML;
                cre_einsaetze = cre_einsaetze + Number(anzahl.replace(/[,.]/g, '').replace(/\D/g, ''));
            }
        }
        let tables = document.querySelectorAll("#iframe-inside-container > table");
        let table = tables[0];
        if (typeof table !== 'undefined' && table !== null)
            table.insertAdjacentHTML('beforebegin',
                '<div class="label label-danger" id="num_label"><i class="glyphicon glyphicon-fire" id="num_icon"></i>' +
                'Aantal / Credits meldingen' + '<span id="num_anzahl">' + sum_einsaetze.toLocaleString() + ' / ' + cre_einsaetze.toLocaleString() + '</span></div>' +

                '<div class="label label-warning" id="num_label"><i class="glyphicon glyphicon-plus" id="num_icon"></i>' +
                'Aantal / Credits patiënten' + '<span id="num_anzahl">' + sum_patienten.toLocaleString() + ' / ' + cre_patienten.toLocaleString() + '</span></div>' +

                '<div class="label label-success" id="num_label"><i class="glyphicon glyphicon-plus" id="num_icon"></i>' +
                'Aantal / Credits gevangenen' + '<span id="num_anzahl">' + sum_gefangene.toLocaleString() + ' / ' + cre_gefangene.toLocaleString() + '</span></div>' +

                '<div class="label label-danger" id="num_label"><i class="glyphicon glyphicon-fire" id="num_icon"></i>' +
                'Aantal / Credits Teammeldingen' + '<span id="num_anzahl">' + sum_verband.toLocaleString() + ' / ' + cre_verband.toLocaleString() + '</span></div>' +

                '<div class="label label-info" id="num_label"><i class="glyphicon glyphicon-plus" id="num_icon"></i>' +
                'Aantal / Credits Teamopnames' + '<span id="num_anzahl">' + sum_verbande.toLocaleString() + ' / ' + cre_verbande.toLocaleString() + '</span></div><br><br>');
    }
})();
