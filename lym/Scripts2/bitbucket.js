// ==UserScript==
// @name         Test
// @namespace    http://tampermonkey.net/
// @version      1
// @description  try to take over the world!
// @author       You
// @match        https://bitbucket.org/*/pull-requests/new/*
// @match        https://bitbucket.org/*/pull-requests/update/*
// @grant        none
// ==/UserScript==

(function () {
    var curUserName = $('body').data('current-user').displayName;
    while (true) {
        await tamperMonkey.sleep(1000);
        console.log(curUserName);
    }
    console.log(3);
})();
function getDefaultBranch(serviceName) {
    var branchName = '';
    switch (serviceName) {
        case 'legacy.checkout-web':
            branchName ='staging';
            break;
        default:
            branchName = 'master';
            break;
    }
    return branchName;
};
var defaultUserList = [
    { userName: 'Terry Luo'},
    { userName: 'Yiming Liu' }
];