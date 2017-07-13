// ==UserScript==
// @name         Jenkins
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        http://suus0006.w10:8080/
// @grant        none
// ==/UserScript==

(function () {
    var trs = document.getElementById('projectstatus').getElementsByTagName('tr');
    var res = [];
    for (var i = 0; i < trs.length; i++) {
        if (trs[i].id != '') {
            trs[i].lid = trs[i].id.toLowerCase();
            res.push(trs[i]);
        }
    }
    var str = '';
    var specialKey = [' '];
    var div = document.createElement('div');
    div.style.color = 'red';
    div.style.fontSize = '32px';
    document.getElementById('systemmessage').append(div);
    var filterFun = function () {
        div.innerHTML = 'Filter: ' + str;
        for (var i = 0; i < res.length; i++) {
            if (res[i].lid.indexOf(str) >= 0) {
                res[i].style.display = '';
            } else {
                res[i].style.display = 'none';
            }
        }
    };
    onkeydown = function (e) {
        if (specialKey.indexOf(e.key) >= 0 || e.key.length > 1) {
            if (e.key == 'Backspace') {
                str = str.substr(0, str.length - 1);
            } else if (e.key == 'Shift') {

            }
            else {
                str = '';
            }
        } else {
            if (e.key == 'v' && e.ctrlKey) {
                return;
            }
            str += e.key.toLowerCase();
        }
        filterFun();
    };

    document.onpaste = (e) => {
        str = e.clipboardData.getData('Text').toLowerCase();
        filterFun();
    };
})();