// ==UserScript==
// @name         Jenkins
// @namespace    http://tampermonkey.net/
// @version      1
// @description  CI CD
// @author       Yiming Liu
// @match        https://jenkins-ci.iherb.net/*
// @match        https://jenkins.iherb.io/*
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

}
