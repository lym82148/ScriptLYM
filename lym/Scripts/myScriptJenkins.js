// ==UserScript==
// @name         Jenkins
// @namespace    http://tampermonkey.net/
// @version      0.4
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
    var ignoreKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    var div = document.createElement('div');
    div.style.color = 'red';
    div.style.fontSize = '32px';
    div.innerHTML = 'Filter: ';
    document.getElementById('systemmessage').append(div);
    var curList = [];
    var lineColor = 'lightgrey';
    var moveFun = function (a) {
        if (curList.length == 0) { return; }
        var nextIndex = curList.curIndex + a;
        if (nextIndex < 0) {
            nextIndex = curList.length - 1;
        } else if (nextIndex >= curList.length) {
            nextIndex = 0;
        }
        curList[curList.curIndex].style.backgroundColor = '';
        curList[nextIndex].style.backgroundColor = lineColor;
        curList.curIndex = nextIndex;
    };

    var filterFun = function () {
        div.innerHTML = 'Filter: ' + str;
        var first = true;
        curList = [];
        for (var i = 0; i < res.length; i++) {
            if (res[i].lid.indexOf(str) >= 0) {
                if (first) {
                    res[i].style.backgroundColor = lineColor;
                    first = false;
                    curList.curIndex = 0;
                } else {
                    res[i].style.backgroundColor = '';
                }
                res[i].style.display = '';
                curList.push(res[i]);
            } else {
                res[i].style.display = 'none';
            }
        }
    };
    onkeydown = function (e) {
        if (!auto) { return; }
        var arrow;
        if (e.key.length > 1) {
            if (e.key == 'Backspace') {
                str = str.substr(0, str.length - 1);
            } else if ((arrow = ignoreKey.indexOf(e.key)) >= 0) {
                if (arrow == 0 || arrow == 2) {
                    moveFun(-1);
                } else if (arrow == 1 || arrow == 3) {
                    moveFun(1);
                }
                return false;
            }
            else if (e.key == 'Enter') {
                if (curList.length) {
                    curList[curList.curIndex].getElementsByTagName('a')[1].click();
                }
                return;
            }
            else {
                str = '';
            }
        } else {
            if (e.key == 'v' && e.ctrlKey) {
                return;
            }
            else if (e.key == ' ') {
                return false;
            } else {
                str += e.key.toLowerCase();
            }
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