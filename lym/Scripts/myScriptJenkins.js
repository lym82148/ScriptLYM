// ==UserScript==
// @name         Jenkins
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  try to take over the world!
// @author       You
// @match        http://suus0006.w10:8080/
// @grant        none
// ==/UserScript==

(function () {
    console.log('输入 c 切换筛选');
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
    div.innerHTML = 'Filter: ';
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
        if (!auto) { return; }
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
        if (!auto) { return; }
        str = e.clipboardData.getData('Text').toLowerCase();
        filterFun();
    };
    var auto = true;
    var saveStr = '';
    Object.defineProperty(window, "c", {
        Configurable: true,
        get: function () {
            auto = !auto;
            var res;
            if (auto) {
                div.style.display = '';
                str = saveStr;
                res = ("已开启筛选");
            } else {
                div.style.display = 'none';
                saveStr = str;
                str = '';
                res = ("已关闭筛选");
            }
            filterFun();
            return res;
        }
    });
})();