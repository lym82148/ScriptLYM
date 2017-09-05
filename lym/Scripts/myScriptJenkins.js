// ==UserScript==
// @name         Jenkins
// @namespace    http://tampermonkey.net/
// @version      1.2
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
            var curA = document.getElementsBySelector('li.item .model-link.inside');
            if (curA.length > 1) {
                var curText = curA[1].text || '';
                curText = curText.replace(/^China-/, '').replace(/-.*/, '').replace(/-h5$/i, '');
                if (curText == 'Gateway') {
                    curText = 'BTCAPIServer';
                }
                var divLinkConfig = document.createElement('div');
                divLinkConfig.style.height = '50px';
                var divs = ['Build', 'Dev', 'Int', 'Prod '];
                for (var di = 0; di < divs.length; di++) {
                    var divTmp = document.createElement('a');
                    divTmp.style.color = 'blue';
                    divTmp.style.fontSize = '26px';
                    divTmp.innerHTML = 'Conf';
                    divTmp.target = '_blank';
                    divTmp.href = 'https://omcops.bmw.com.cn/Configuration/DeployConfiguration/NewChange#' + curText + '-' + divs[di];
                    divTmp.style.marginLeft = '0px';
                    divTmp.style.marginRight = '36px';
                    divTmp.style.textDecoration = 'underline';
                    if (di == 0) {
                        divTmp.href = 'javascript:void(0);';
                        divTmp.style.color = 'grey';
                    }
                    else if (di == 3) {
                        divTmp.style.color = 'red';
                    }
                    divLinkConfig.append(divTmp);
                }
                father.prepend(divLinkConfig);

                var divLink = document.createElement('div');
                divLink.style.height = '50px';
                for (var di = 0; di < divs.length; di++) {
                    var divTmp = document.createElement('a');
                    divTmp.style.color = 'blue';
                    divTmp.style.fontSize = '32px';
                    divTmp.innerHTML = divs[di];
                    divTmp.target = '_blank';
                    divTmp.href = 'https://omcops.bmw.com.cn/Operation/Release/ReleasePlanIndex/' + divs[di] + '-' + curText;
                    divTmp.style.marginLeft = '0px';
                    divTmp.style.marginRight = '32px';
                    divTmp.style.textDecoration = 'underline';
                    if (di == 3) {
                        divTmp.style.color = 'red';
                    }
                    divLink.append(divTmp);
                }
                father.prepend(divLink);
            }

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
        var deployArr = document.getElementsBySelector('#buildHistory tr .icon-blue');
        if (deployArr.length > 0) {
            var cli = function (obj) {
                window.open('https://omcops.bmw.com.cn/Operation/Release/ReleasePlanIndex/Build-' + curText + "#" + obj.num);
                obj.blur();
            };
            for (var dei = 0 ; dei < deployArr.length; dei++) {
                if (dei == 10) { break; }
                var id = document.getElementsBySelector('#buildHistory tr .icon-blue')[dei].parentElement.parentElement.next().text.replace('#', '').replace('​', '');
                var ele = document.createElement('a');
                ele.innerHTML = 'Deploy';
                ele.num = id;
                ele.onclick = function (a) { return function () { cli(a); }; }(ele);
                ele.href = 'javascript:void(0);';
                deployArr[dei].parentElement.parentElement.parentElement.next(1).firstElementChild.prepend(ele);
                // console.log(1)
            }
        }

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
            document.body.scrollTop = 0;
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
        if (e.ctrlKey && e.key != 'Enter') {
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
                            curList[curList.curIndex].getElementsByTagName('a')[1].target = '_blank';
                        } else {
                            curList[curList.curIndex].getElementsByTagName('a')[1].target = '';
                        }
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