// ==UserScript==
// @name         OpsFilter
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  try to take over the world!
// @author       You
// @match        https://omcops.bmw.com.cn/Configuration/DeployConfiguration/NewChange*
// @match        https://omcops.bmw.com.cn/Operation/Release/ReleasePlanIndex*
// @match        https://omcops.bmw.com.cn/Operation/Release/ReleaseJobIndex*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    console.log('输入 c 切换筛选');
    var div = document.createElement('div');
    div.style.color = 'red';
    div.style.fontSize = '32px';
    div.innerHTML = 'Filter: ';
    $('h1').append(div);
    var services = $('.input-group-addon:eq(0)').next();
    var res = services.find('li');
    var dropdown = services.find('button[data-toggle=dropdown]');
    for (var i = 0; i < res.length; i++) {
        res[i].lText = res[i].innerText.toLowerCase();
    }
    var str = '';
    var ignoreKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    var curList = [];
    var lineColor = 'lightgrey';
    var moveFun = function (a) {
        if (curList.length == 0) { return; }
        var nextIndex;
        var x = Math.floor(curList.curIndex / 3);
        var y = curList.curIndex % 3;
        var xList = Math.floor((curList.length - 1) / 3);
        var yList = (curList.length - 1) % 3;;
        function checkHasError() {
            if (nextIndex >= curList.length) {
                return true;
            } else if (nextIndex < 0) {
                return true;
            }
            return false;
        }
        switch (a) {
            case 0:
                nextIndex = Math.round((x - 1) * 3 + y);
                if (checkHasError()) {
                    if (yList < y) {
                        nextIndex = (xList - 1) * 3 + y;
                    } else {
                        nextIndex = (xList) * 3 + y;
                    }
                }
                break;
            case 1:
                nextIndex = Math.round((x + 1) * 3 + y);
                if (checkHasError()) {
                    nextIndex = y;
                }
                break;
            case 2:
                if (y > 0) {
                    nextIndex = curList.curIndex - 1;
                } else {
                    nextIndex = curList.curIndex + 2;
                }
                if (checkHasError()) {
                    nextIndex -= 3;
                }
                break;
            case 3:
                if (y == 2) {
                    nextIndex = curList.curIndex - 2;
                } else {
                    nextIndex = curList.curIndex + 1;
                }
                if (checkHasError()) {
                    nextIndex -= 3;
                }
                break;
        }

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
            if (res[i].lText.indexOf(str) >= 0) {
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
        if (e.target.tagName == 'INPUT') {
            return;
        }
        if (e.ctrlKey) {
            return;
        }
        if (dropdown.attr('aria-expanded') != 'true') {
            dropdown[0].click();
            dropdown.blur();
        }
        if (!auto) { return; }
        var arrow;
        if (e.key.length > 1) {
            if (e.key == 'Backspace') {
                str = str.substr(0, str.length - 1);
            } else if ((arrow = ignoreKey.indexOf(e.key)) >= 0) {
                console.log(arrow);
                // if (arrow == 0 || arrow == 2) {
                //     moveFun(-1);
                // } else if (arrow == 1 || arrow == 3) {
                //     moveFun(1);
                // }
                moveFun(arrow);
                return false;
            }
            else if (e.key == 'Enter') {
                if (curList.length) {
                    curList[curList.curIndex].getElementsByTagName('a')[0].click();
                    if ($('.btn-search').length) {
                        $('.btn-search').click();
                    }
                }
                return;
            }
            else if (e.key == 'Escape') {
                if (dropdown.attr('aria-expanded') == 'true') {
                    dropdown[0].click();
                    dropdown.blur();
                }
                str = '';
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
        if (dropdown.attr('aria-expanded') != 'true') {
            dropdown[0].click();
            dropdown.blur();
            e.target.focus();
        }
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
    // Your code here...
})();