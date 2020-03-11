// ==UserScript==
// @name         Common
// @namespace    http://tampermonkey.net/
// @version      2
// @description  try to take over the world!
// @author       You
// @match        *
// @grant        none
// ==/UserScript==

var tamperMonkey = {};

tamperMonkey.sleep = function (time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, time);
    });
};