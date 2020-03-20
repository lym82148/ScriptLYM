// ==UserScript==
// @name         Swagger
// @namespace    http://tampermonkey.net/
// @version      1
// @description  swagger
// @author       Yiming Liu
// @match        https://localhost:44300/swagger/*
// ==/UserScript==

(async function wrap() {
    // force async at first
    await lymTM.async();
    var time = lymTM.start();
    await process(wrap, time);
    // log execution time
    time.end();
})();

async function process(func, time) {
  
}
