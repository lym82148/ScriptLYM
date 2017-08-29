// ==UserScript==
// @name         OpsFilter
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  try to take over the world!
// @author       You
// @match        https://omcops.bmw.com.cn/Configuration/DeployConfiguration/NewChange*
// @match        https://omcops.bmw.com.cn/Operation/Release/ReleasePlanIndex*
// @match        https://omcops.bmw.com.cn/Operation/Release/ReleaseJobIndex*
// @match        https://omcops.bmw.com.cn/Operation/Release/ReleaseManagement*
// @grant        none
// ==/UserScript==

(function () {
    console.log('输入 c 切换筛选');
    var div = document.createElement('div');
    div.style.color = 'red';
    div.style.fontSize = '32px';
    div.innerHTML = 'Filter: ';
    var isAll = location.href.toLowerCase().startsWith('https://omcops.bmw.com.cn/Operation/Release/ReleaseManagement/'.toLowerCase()) && location.href.toLowerCase().endsWith('-all');
    if (!isAll) {
        $('h1').append(div);
    }
    var isDeloy = location.href.toLowerCase().startsWith('https://omcops.bmw.com.cn/Operation/Release/ReleasePlanIndex/Dev-'.toLowerCase())
    || location.href.toLowerCase().startsWith('https://omcops.bmw.com.cn/Operation/Release/ReleasePlanIndex/Int-'.toLowerCase())
    || location.href.toLowerCase().startsWith('https://omcops.bmw.com.cn/Operation/Release/ReleasePlanIndex/Prod-'.toLowerCase());
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
        if (isAll) {
            return;
        }
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
    var reg = /^https:\/\/omcops.bmw.com.cn\/Operation\/Release\/ReleasePlanIndex.*/i;
    if (reg.test(location.href)) {
        if (location.hash != '') {
            var id = location.hash.replace('#', '');
            var find = function () {
                var idLinks = $('#tbList>tbody>tr>td>a[href*="/job/"]');
                if (idLinks.length) {
                    for (var i = 0; i < idLinks.length; i++) {
                        if (idLinks[i].text == id) {
                            var tr = $(idLinks[i]).closest('tr');
                            if (tr.length) {
                                tr.css('backgroundColor', 'rgba(0, 55, 255, 0.18)');
                                tr.find('a:lt(4)').css({ 'color': 'red', 'font-weight': 'bolder' });
                            }
                        }
                    }
                } else {
                    setTimeout(find, 100);
                }
            };
            setTimeout(find, 100);
        }
        var waitTable = function () {
            var idLinks = $('#tbList>tbody>tr>td>a[href*="/job/"]');
            if (idLinks.length) {
                var deployNow, promoteNow;
                for (var i = 0; i < $('td>a.btn[href*=ReleasePlanSchedule]').length; i++) {
                    if ($('td>a.btn[href*=ReleasePlanSchedule]').eq(i).next('a').length) {
                        continue;
                    }
                    deployNow = document.createElement('a');
                    deployNow.className = 'btn btn-info';
                    deployNow.innerHTML = 'DNow';
                    deployNow.style.marginLeft = '10px';
                    $(deployNow).click(function () {
                        var id = $(this).closest('tr').find('td>a[href*="/job/"]').text();
                        var href = $(this).prev()[0].href;
                        sessionStorage.setItem('OpsDeployId', href.split('/').pop());
                        $(this).prev()[0].click();
                        $(this).addClass('disabled');
                        $(this).prev().addClass('disabled');
                    });
                    $('td>a.btn[href*=ReleasePlanSchedule]')[i].after(deployNow);
                    $(deployNow).addClass('btn-sm').prev().addClass('btn-sm');
                }
                for (var i = 0; i < $('td>a.btn[href*=ReleasePlanPromote]').length; i++) {
                    if ($('td>a.btn[href*=ReleasePlanPromote]').eq(i).next('a').length) {
                        continue;
                    }
                    promoteNow = document.createElement('a');
                    promoteNow.className = 'btn btn-info';
                    promoteNow.innerHTML = 'Now';
                    promoteNow.style.marginLeft = '10px';
                    promoteNow.target = '_blank';
                    $(promoteNow).click(function () {
                        var id = $(this).closest('tr').find('td>a[href*="/job/"]').text();
                        var href = $(this).prev()[0].href;
                        $(this).attr('href', href + '#ap');
                        $(this)[0].click();
                    });
                    $('td>a.btn[href*=ReleasePlanPromote]')[i].after(promoteNow);
                    $(promoteNow).addClass('btn-sm').prev().addClass('btn-sm');
                }
            }
            // else {
            //     setTimeout(waitTable, 100);
            // }
        };
        setInterval(waitTable, 300);

    }
    var regMain = /^https:\/\/omcops.bmw.com.cn\/Operation\/Release\/ReleaseManagement.*/i;
    var pageLengthFlag = false;
    if (regMain.test(location.href)) {
        var waitMain = function () {
            if ($('#tbPlanList tr').length > 1) {
                var trs = $('#tbPlanList>tbody>tr');
                var id = sessionStorage.getItem('OpsDeployId');
                if (!id) {
                    return;
                }
                for (var i = 0; i < trs.length; i++) {
                    if (trs[i].getAttribute('planid') == id) {
                        pageLengthFlag = true;
                        var schedule = $(trs[i]).find('.btn.btn-primary');
                        var waitAlert = function () {
                            var alertId = $('#mdPlanId').val();
                            if (alertId == id) {
                                $('#createJobModal button.btn-primary')[0].click();
                                sessionStorage.removeItem('OpsDeployId');
                            } else {
                                setTimeout(waitAlert, 100);
                            }
                        };
                        setTimeout(waitAlert, 100);
                        schedule[0].click();
                    }
                }
                if (!pageLengthFlag) {
                    pageLengthFlag = true;
                    $('[name=tbPlanList_length]').val(100).change();
                    setTimeout(waitMain, 100);
                }
            }
            else {
                setTimeout(waitMain, 100);
            }
        };
        setTimeout(waitMain, 100);
        setInterval(function () {
            var promoteNow;
            for (var i = 0; i < $('td>a.btn[href*=ReleasePlanPromote]').length; i++) {
                if ($('td>a.btn[href*=ReleasePlanPromote]').eq(i).next('a').length) {
                    continue;
                }
                promoteNow = document.createElement('a');
                promoteNow.className = 'btn btn-info';
                promoteNow.innerHTML = 'Now';
                promoteNow.style.marginLeft = '10px';
                promoteNow.target = '_blank';
                $(promoteNow).click(function () {
                    var id = $(this).closest('tr').find('td>a[href*="/job/"]').text();
                    var href = $(this).prev()[0].href;
                    $(this).attr('href', href + '#ap');
                    $(this)[0].click();
                });
                $('td>a.btn[href*=ReleasePlanPromote]')[i].after(promoteNow);
                $(promoteNow).addClass('btn-sm').prev().addClass('btn-sm');
            }
        }, 300);

    }
    if (isDeloy) {
        // var autoRefresh = document.createElement('input');
        // autoRefresh.type = 'checkbox';
        // autoRefresh.style.margin = '5px';
        // var interval;
        // autoRefresh.onchange = function () {
        //     if (autoRefresh.checked) {
        //         $('#tbList').dataTable().fnDraw();
        //         interval = setInterval("$('#tbList').dataTable().fnDraw();", 60000);
        //     } else {
        //         clearInterval(interval);
        //     }
        // };
        // var autoRefreshLabel = document.createElement('label');
        // autoRefreshLabel.innerHTML = 'AutoRefresh';
        // autoRefreshLabel.style.border = '1px solid';
        // autoRefreshLabel.style.padding = '5px';
        // autoRefreshLabel.style.backgroundColor = 'rgba(0, 55, 255, 0.18)';
        // autoRefreshLabel.prepend(autoRefresh);
        // $('h1').prepend(autoRefreshLabel);
        // autoRefresh.checked = true;
        // $(autoRefresh).change();
    }
})();