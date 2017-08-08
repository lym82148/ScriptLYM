// ==UserScript==
// @name         Jenkins
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  try to take over the world!
// @author       You
// @match        http://suus0006.w10:8080/
// @match        http://suus0006.w10:8080/job/*
// @grant        none
// ==/UserScript==

(function () {
    var jenkinsKey = 'jenkinsServices';
    var res = [];
    var div = document.createElement('div');
    div.style.color = 'red';
    div.style.fontSize = '32px';
    div.innerHTML = 'Filter: ';
    div.style.marginButtom = '9px';

    if (document.getElementById('projectstatus') == null) {
        json = localStorage.getItem(jenkinsKey);
        res = JSON.parse(JSON.parse(json));
        var father = document.getElementById('main-panel');
        if (res != null && father != null) {
            console.log('输入 c 切换筛选');
            father.prepend(div);
            var listDiv = document.createElement('div');
            listDiv.id = 'listDivFilterRes';
            for (var i = 0; i < res.length; i++) {
                var item = res[i];
                var divItem = document.createElement('div');
                divItem.style.margin = '2px';
                var a = document.createElement('a');
                a.lid = item.id.toLowerCase();
                a.style.fontSize = '18px';
                a.style.margin = '5px';
                a.style.padding = '2px';
                a.href = a.lid.replace('job_', '/job/');
                a.innerHTML = item.id.replace('job_', '');
                a.style.display = 'none';
                divItem.append(a);
                listDiv.append(divItem);
                item.a = a;
            }
            res = res.map(function (a) { return a.a; });
            div.after(listDiv);
            var divOther = document.createElement('div');
            divOther.style.fontSize = '18px';
            divOther.style.marginTop = '7px';
            divOther.style.fontWeight = 'bold';
            listDiv.after(divOther);
        }
        var filterFun = function () {
            div.innerHTML = 'Filter: ' + str;
            var first = true;
            curList = [];
            var maxCount = 5;
            var otherCount = 0;
            for (var i = 0; i < res.length; i++) {
                if (str != '' && res[i].lid.indexOf(str) >= 0) {
                    if (first) {
                        res[i].style.backgroundColor = lineColor;
                        first = false;
                        curList.curIndex = 0;
                    } else {
                        res[i].style.backgroundColor = '';
                    }
                    if (curList.length <= maxCount) {
                        res[i].style.display = '';
                        curList.push(res[i]);
                    } else {
                        res[i].style.display = 'none';
                        otherCount++;
                    }
                } else {
                    res[i].style.display = 'none';
                }
            }
            if (otherCount) {
                divOther.innerHTML = 'other ' + otherCount + ' records...';
            } else {
                divOther.innerHTML = '';
            }
        };
    } else {
        console.log('输入 c 切换筛选');
        var trs = document.getElementById('projectstatus').getElementsByTagName('tr');
        for (var i = 0; i < trs.length; i++) {
            if (trs[i].id != '') {
                trs[i].lid = trs[i].id.toLowerCase();
                res.push(trs[i]);
            }
        }
        localStorage.setItem(jenkinsKey, JSON.stringify(res.map(function (a) { return { id: a.id }; })));
        document.getElementById('systemmessage').append(div);
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
    }
    var str = '';
    var ignoreKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
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

    onkeydown = function (e) {
        if (!auto) { return; }
        if (e.target.tagName == 'INPUT') {
            return;
        }
        if (e.ctrlKey) {
            return;
        }
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
                    if (curList[curList.curIndex].tagName == 'A') {
                        curList[curList.curIndex].click();
                    } else {
                        curList[curList.curIndex].getElementsByTagName('a')[1].click();
                    }
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