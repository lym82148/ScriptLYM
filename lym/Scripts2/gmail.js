// ==UserScript==
// @name         GMail
// @namespace    http://tampermonkey.net/
// @version      4
// @description  send weekly report
// @author       Yiming Liu
// @match        https://mail.google.com/mail/u/0/*
// @grant        none
// ==/UserScript==

(async function wrap() {
    // force async at first
    await lymTM.async();
    var time = lymTM.start();
    await process(wrap, time);
    // log execution time
    time.end();
})();

async function process(wrap, time) {
    var key = lymTM.keys.GMailBody;
    var res = lymTM.getValue(key);
    lymTM.removeValue(key);
    var bodyDiv = await lymTM.async($('div[aria-label="Message Body"]'));
    await lymTM.async($('div[role=toolbar]:visible'));
    bodyDiv.html(res);
}

