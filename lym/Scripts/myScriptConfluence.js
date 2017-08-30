// ==UserScript==
// @name         Confluence
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  try to take over the world!
// @author       You
// @match        http://suus0001.w10:8090/*
// @grant        none
// ==/UserScript==

(function () {
    var sideDiv = $('.aui-sidebar-body');
    if (!sideDiv.length) {
        sideDiv = $('.acs-side-bar');
    }
    if (!sideDiv.length) {
        return;
    }
    var filterDiv = document.createElement('div');
    filterDiv.style.paddingLeft = '10px';

    var getTree = function (data, div) {
        div.innerHTML = '';
        var res = $(data).find('#main-content .output-block');
        res.find('h3').css({ "margin-top": '0px', "font-size": "15px", "font-weight": "bolder" });
        res.find('ul').css("margin-top", '0px');
        res.find('a').css("display", 'none');
        res.find('li').css("display", 'none');
        res.find('a').map(function (a, b) { b.lid = b.innerText.replace(/\s|_/g, '').toLowerCase(); });
        $(div).append(res);
        //filterFun();
    };
    var div = document.createElement('div');
    div.style.color = 'red';
    div.style.fontSize = '32px';
    div.innerHTML = 'Filter: ';
    div.style.marginButtom = '9px';
    var dbDiv = document.createElement('div');
    dbDiv.style.minHeight = '20px';
    dbDiv.innerHTML = 'loading';
    var apiDiv = document.createElement('div');
    apiDiv.innerHTML = 'loading';
    apiDiv.style.minHeight = '20px';

    filterDiv.append(div);
    filterDiv.append(dbDiv);
    var hr = document.createElement('hr');
    hr.style.borderColor = 'pink';
    filterDiv.append(hr);
    filterDiv.append(apiDiv);

    var ajax1 = $.ajax('http://suus0001.w10:8090/display/UC/API').then(function (data) {
        getTree(data, apiDiv);
    });
    var ajax2 = $.ajax('http://suus0001.w10:8090/display/UC/Model+%28DB%29+design').then(function (data) {
        getTree(data, dbDiv);
    });
    var filterAction = function (div) {
        if (div.childElementCount == 0) { return; }
        var res = $(div).find('a');
        var maxCount = curList.length + 10;
        for (var i = 0; i < res.length; i++) {
            if (res[i].lid.indexOf(str) >= 0 && str.length > 0) {
                if (curList.length == 0) {
                    res[i].style.backgroundColor = lineColor;
                    curList.curIndex = 0;
                } else {
                    res[i].style.backgroundColor = '';
                }
                if (curList.length >= maxCount) {
                    // res[i].style.display = 'none';
                    // $(res[i]).parent('li').css('display','none');
                    // $(res[i]).parent('li').parent('ul').parent('li').css('display','none');
                } else {
                    res[i].style.display = '';
                    $(res[i]).parent('li').css('display', '');
                    $(res[i]).parent('li').parent('ul').parent('li').css('display', '');
                    curList.push(res[i]);
                }
            } else {
                // res[i].style.display = 'none';
                // $(res[i]).parent('li').css('display','none');
                // $(res[i]).parent('li').parent('ul').parent('li').css('display','none');
            }
        }
    };
    var filterFun = function () {
        div.innerHTML = 'Filter: ' + str;
        curList = [];
        if (sideDiv[0].scrollTop != 0) {

        }
        if ('start' in filterFun) {
            if (str.length > 0 && str.replace(/c/g, '') != '') {
                if (filterFun.start == 0) {
                    filterFun.top = sideDiv[0].scrollTop;
                    sideDiv[0].scrollTop = 0;
                }
                filterFun.start++;
            }
            else {
                filterFun.start = 0;
                if (sideDiv[0].scrollTop == 0) {
                    sideDiv[0].scrollTop = filterFun.top;
                }
            }
        } else {
            filterFun.start = 0;
        }
        $(filterDiv).find('a').css("display", 'none');
        $(filterDiv).find('li').css("display", 'none');
        filterAction(dbDiv);
        filterAction(apiDiv);


    };
    $.when(ajax1, ajax2).then(filterFun);
    sideDiv.prepend(filterDiv);

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
        if (e.ctrlKey && e.key == 'Control') {
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
                        if (e.ctrlKey) {
                            curList[curList.curIndex].target = '_blank';
                        } else {
                            curList[curList.curIndex].target = '';
                        }
                        curList[curList.curIndex].click();
                    } else {
                        if (e.ctrlKey) {
                            curList[curList.curIndex].target = '_blank';
                        } else {
                            curList[curList.curIndex].target = '';
                        }
                        curList[curList.curIndex].getElementsByTagName('a')[1].click();
                    }
                }
                return false;
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
        if (e.key.length == 1) {
            return false;
        }
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
    $('.favourite-space-icon>button').css({ top: 'unset', "margin-top": '-18px' });

})();