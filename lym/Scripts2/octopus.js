// ==UserScript==
// @name         Octopus
// @namespace    http://tampermonkey.net/
// @version      1
// @description  CD
// @author       Yiming Liu
// @match        https://deploy.iherb.net/app#/projects/shop/overview*
// @grant        none
// ==/UserScript==

(async function wrap() {
    var time = lymTM.start();
    await process(wrap, time);
    time.end();
})();

async function process(wrap, time) {
    
}
