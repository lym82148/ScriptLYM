// ==UserScript==
// @name         OpsFilter
// @namespace    http://tampermonkey.net/
// @version      3.3
// @description  try to take over the world!
// @author       You
// @match        xxxhttps://omcops.bmw.com.cn/Configuration/DeployConfiguration/NewChange*
// @match        https://omcops.bmw.com.cn/Operation/Release/ReleasePlanIndex*
// @match        https://omcops.bmw.com.cn/Operation/Release/ReleaseJobIndex*
// @match        https://omcops.bmw.com.cn/Operation/Release/ReleaseManagement*
// @match        https://omcops.bmw.com.cn/
// @grant        none
// ==/UserScript==

(function () {
    if(location.href.startsWith('https://omcops.bmw.com.cn/#')){
        for(var i=0;i<document.body.children.length;){
            document.body.children[i].remove();
        }
        var waitDiv = document.createElement('div');
        waitDiv.style.color= 'red';
        waitDiv.innerHTML = 'Waiting';
        document.body.append(waitDiv);
        var startFun = function(){
            var service = location.hash.substr(1);
            var envs = ['Dev','Int','Stg','Prod'];
            var tasks = [];
            envs.forEach(function(a){
                var link =  'https://omcops.bmw.com.cn/Operation/Release/ReleasePlanAsync?limit=10&start=0&page=1&serviceName='+service+'&environment='+a;
                tasks.push($.ajax(link).then(function(data){
                    opener.postMessage(data,'*');
                }));
            });
            $.when(...tasks).then(function(){close();});
        };
        setTimeout( startFun,0);
        return;
    }
    var comAlert = '<div class="modal fade" data-show="true"><div class="modal-dialog" style="left:0px"><div class="modal-content"><div class="modal-header"><h4 class="modal-title">提示</h4></div><div class="modal-body">' + '' + '</div><div style="padding-left:42%;padding-right:40%;padding-bottom:20px"><button type="button" class="btn btn-primary" data-dismiss="modal" aria-hidden="true" style="width:100px" data-res="yes">确认</button></div></div></div></div>';
    comAlert = $(comAlert);
    var comClose = function (type) {
        divAlert.modal('hide');
    };
    comAlert.find('button').click(comClose);
    var comAlertAction = function (content) {
        comAlert.find('.modal-body').html(content);
        comAlert.modal('show');
    };
    a=comAlertAction;
    var sleep = function (time) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve();
            }, time);
        });
    };
    console.log('输入 c 切换筛选');
    var div = document.createElement('div');
    div.style.color = 'red';
    div.style.fontSize = '32px';
    div.innerHTML = 'Filter: ';
    var isAll = location.href.toLowerCase().startsWith('https://omcops.bmw.com.cn/Operation/Release/ReleaseManagement'.toLowerCase());
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
            var cont = location.hash.replace('#', '').split('-');
            var find = function () {
                var idLinks = $('#tbList>tbody>tr>td>a[href*="/job/"]');
                if (idLinks.length) {
                    for (var i = 0; i < idLinks.length; i++) {
                        if (idLinks[i].text == cont[0]) {
                            var tr = $(idLinks[i]).closest('tr');
                            if (tr.length) {
                                tr.css('backgroundColor', 'rgba(0, 55, 255, 0.18)');
                                tr.find('a:not(.btn):not(.pull-right)').css({ 'color': 'red', 'font-weight': 'bolder' });
                                if(tr.find('td>a.btn[href*="/ReleasePlanSchedule/"]').length){
                                    var planId = tr.find('td>a.btn[href*="/ReleasePlanSchedule/"]')[0].href.split('/').pop();
                                    var service = tr.find('td>a[href*="/ReleasePlanDetails/"]').text();
                                    sessionStorage.setItem('OpsDeployContent',JSON.stringify({service:service,id:cont[0],planId:planId,env:cont[1]}));
                                    tr.find('td>a.btn[href*="/ReleasePlanSchedule/"]')[0].click();
                                }
                            }
                        }
                    }
                } else {
                    setTimeout(find, 100);
                }
            };
            setTimeout(find, 100);
        }
        var divAlert = '<div class="modal fade" data-show="true"><div class="modal-dialog" style="left:0px"><div class="modal-content"><div class="modal-header"><h4 class="modal-title">确认</h4></div><div class="modal-body">' + '' + '</div><div style="padding-left:25%;padding-right:25%;padding-bottom:20px"><button type="button" class="btn btn-primary" data-dismiss="modal" aria-hidden="true" style="width:100px" data-res="yes">是</button><button type="button" data-res="no"  class="pull-right btn btn-danger" data-dismiss="modal"style="width:100px" aria-hidden="true">否</button></div></div></div></div>';
        divAlert = $(divAlert);
        var confirmCopy = function (type) {
            // $('.modal-backdrop').remove();
            divAlert.modal('hide');
            if ($(this).data('res') == 'no') {

            }
            else
            {
                var content = divAlert.find('.modal-body').data('content');
                sessionStorage.setItem('OpsDeployContent',JSON.stringify({service:content.service,id:content.id,planId:content.planId,env:content.env}));
                content.btn.click();
            }
        };
        divAlert.find('button').click(confirmCopy);
        var confirmBox = function (content) {
            divAlert.find('.modal-body').html('发布 '+content.service+' '+content.id+' 到 '+content.env+' 环境').data('content',content);
            divAlert.modal('show');
            console.log(content);
        };
        var waitTable = function () {
            var idLinks = $('#tbList>tbody>tr>td>a[href*="/job/"]');
            if (idLinks.length) {
                var deployNow, promoteNow, config;
                /*jshint multistr:true */
                var dropdownHtml = '<div class="btn-group" style="margin-left:10px">\
<button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown">More \
<span class="caret"></span>\
</button>\
<ul class="dropdown-menu" role="menu" name="mEnvList">\
<li><a href="#" name="Build">上 Build</a></li>\
<li><a href="#" name="Dev">上 Dev</a></li>\
<li><a href="#" name="Int">上 Int</a></li>\
<li><a href="#" name="Stg">上 Stg</a></li>\
</ul>\
</div>';
                var curEnv = $('.nav.nav-tabs>.active>a').text();
                var envs = ['Build','Dev','Int','Stg','Prod'];
                var curEnvIndex = envs.indexOf(curEnv);
                var content =JSON.parse( sessionStorage.getItem('OpsDeployContent'));
                for (var i = 0; i < $('td>a.btn[href*="/ReleasePlanSchedule/"]').length; i++) {
                    if ($('td>a.btn[href*="/ReleasePlanSchedule/"]').eq(i).next('div').length) {
                        continue;
                    }
                    if(content){
                        if(envs.indexOf(content.env)>=curEnvIndex){
                            var tr = $('td>a.btn[href*="/ReleasePlanSchedule/"]').eq(i).closest('tr');
                            if(content.id == tr.find('td>a[href*="/job/"]').text()&& content.service == tr.find('td>a[href*="/ReleasePlanDetails/"]').text()){
                                content.planId = tr.find('td>a.btn[href*="/ReleasePlanSchedule/"]')[0].href.split('/').pop();
                                sessionStorage.setItem('OpsDeployContent',JSON.stringify(content));
                                tr.css('backgroundColor', 'rgba(0, 55, 255, 0.18)');
                                tr.find('a:not(.btn):not(.pull-right)').css({ 'color': 'red', 'font-weight': 'bolder' });
                                tr.find('td>a.btn[href*="/ReleasePlanSchedule/"]')[0].click();
                            }
                        }else{
                            sessionStorage.removeItem('OpsDeployContent');
                            comAlertAction(content.service+' '+content.id+' 已成功发布到 '+content.env+' 环境');
                        }
                    }
                    // deployNow = document.createElement('a');
                    // deployNow.className = 'btn btn-info';
                    // deployNow.innerHTML = 'DNow';
                    // deployNow.style.marginLeft = '10px';
                    // $(deployNow).click(function () {
                    //     var id = $(this).closest('tr').find('td>a[href*="/job/"]').text();
                    //     var href = $(this).prev()[0].href;
                    //     sessionStorage.setItem('OpsDeployId', href.split('/').pop());
                    //     $(this).prev()[0].click();
                    //     $(this).addClass('disabled');
                    //     $(this).prev().addClass('disabled');
                    // });
                    // $('td>a.btn[href*=ReleasePlanSchedule]')[i].after(deployNow);
                    $('td>a.btn[href*="/ReleasePlanSchedule/"]:eq('+i+')').after($(dropdownHtml)).next('div').find('ul>li>a[name]').click(function(){
                        var tr = $(this).closest('tr');
                        var id = tr.find('td>a[href*="/job/"]').text();
                        var service = tr.find('td>a[href*="/ReleasePlanDetails/"]').text();
                        var deBtn = tr.find('td>a.btn[href*="/ReleasePlanSchedule/"]')[0];
                        confirmBox({service:service,id:id,planId:deBtn.href.split('/').pop(),env:this.name,btn:deBtn});
                    });
                    // $(deployNow).addClass('btn-sm').prev().addClass('btn-sm');
                }
                for(var i=0;i<envs.length;i++){
                    if(envs[i] == curEnv){
                        if(curEnv == 'Prod' && !$('ul[name=mEnvList]>li>[name=Prod]').length){
                            $('ul[name=mEnvList]').closest('div.btn-group').remove();
                            //$('ul[name=mEnvList]').append($('<li><a href="#" name="Prod">上 Prod</a></li>'));
                        }
                        break;
                    }else{
                        $('ul[name=mEnvList]>li>[name='+envs[i]+']').parent().remove();
                    }
                }

                for (var i = 0; i < $('td>a.btn[href*=ReleasePlanPromote]').length; i++) {
                    if ($('td>a.btn[href*=ReleasePlanPromote]').eq(i).next('a').length) {
                        continue;
                    }
                    promoteNow = document.createElement('a');
                    promoteNow.className = 'btn btn-info';
                    promoteNow.innerHTML = 'Now';
                    promoteNow.style.marginLeft = '10px';
                    $(promoteNow).click(function () {
                        var id = $(this).closest('tr').find('td>a[href*="/job/"]').text();
                        var href = $(this).prev()[0].href;
                        location.href = href + '#ap';
                        // $(this)[0].click();
                    });
                    $('td>a.btn[href*=ReleasePlanPromote]')[i].after(promoteNow);
                    $(promoteNow).addClass('btn-sm').prev().addClass('btn-sm');
                }
                for (var i = 0; i < $('td>a[href*=ReleasePlanEdit]').length; i++) {
                    if ($('td>a[href*=ReleasePlanEdit]').eq(i).next('a').length) {
                        continue;
                    }
                    config = document.createElement('a');
                    config.className = 'pull-right';
                    config.style.fontWeight = 'bolder';
                    config.style.fontSize = '18px';
                    config.innerHTML = 'Config';
                    config.style.marginLeft = '10px';
                    config.target = '_blank';
                    var name = $('td>a[href*=ReleasePlanEdit]:eq(' + i + ')').closest('tr').find('td>a[href*="ReleasePlanDetails"]').text();
                    config.href = 'https://omcops.bmw.com.cn/Configuration/DeployConfiguration/NewChange' + '#' + name + '-' + $('ul.nav>li.active').text();
                    $('td>a[href*=ReleasePlanEdit]')[i].after(config);
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
        window.alertOld = window.alert;
        window.alert = function (a) {
            if (!a.startsWith('Success')) {
                window.alertOld(a);
            }
        };
        var waitMain = function () {
            if ($('#tb-plan-list tr').length > 1) {
                var trs = $('#tb-plan-list>tbody>tr');
                var content = JSON.parse( sessionStorage.getItem('OpsDeployContent'));
                if (content) {
                    for (var i = 0; i < trs.length; i++) {
                        if (trs[i].getAttribute('planid') == content.planId) {
                            trs.eq(i).css('backgroundColor', 'rgba(0, 55, 255, 0.18)');
                            trs.eq(i).find('a:not(.btn):not(.pull-right)').css({ 'color': 'red', 'font-weight': 'bolder' });
                            pageLengthFlag = true;
                            var schedule = $(trs[i]).find('.btn.btn-primary');
                            var waitAlert = function () {
                                var alertId = $('#mdPlanId').val();
                                if (alertId == content.planId) {
                                    // debugger;
                                    var mo = $('#inst-list ul>li>a:first')[0];
                                    if(mo){
                                        mo.click();
                                    }
                                    $('#createJobModal button.btn-primary')[0].click();
                                    //sessionStorage.removeItem('OpsDeployContent');
                                } else {
                                    setTimeout(waitAlert, 100);
                                }
                            };
                            setTimeout(waitAlert, 100);
                            schedule[0].click();
                        }
                    }
                    // if (!pageLengthFlag) {
                    //     pageLengthFlag = true;
                    //     $('[name=tb-plan-list_length]').val(100).change();
                    //     setTimeout(waitMain, 100);
                    // }
                }
            }
            else {
                setTimeout(waitMain, 100);
            }
        };
        setTimeout(waitMain, 100);
        var curEnv = $('.nav.nav-tabs>.active>a').text();
        setInterval(function () {
            var promoteNow;
            var content = JSON.parse(sessionStorage.getItem('OpsDeployContent'));
            for (var i = 0; i < $('td>a[href*=ReleaseJobDetails]').length; i++) {
                var tr = $('td>a[href*=ReleaseJobDetails]').eq(i).closest('tr');
                var service = tr.find('td>a[href*="/ReleaseJobDetails/"]').text();
                var promoteBtn = tr.find('td>a.btn[href*=ReleasePlanPromote]');
                if (promoteBtn.length && promoteBtn.next('a').length) {
                    continue;
                }
                if (content) {
                    if(content.service == service){
                        tr.css('backgroundColor', 'rgba(0, 55, 255, 0.18)');
                        tr.find('a:not(.btn):not(.pull-right)').css({ 'color': 'red', 'font-weight': 'bolder' });
                        if(promoteBtn.length){
                            if(curEnv!='Stg'){
                                location.href = promoteBtn[0].href + '#ap';
                            }else{
                                sessionStorage.removeItem('OpsDeployContent');
                                comAlertAction(content.service+' '+content.id+' 已成功发布到 '+content.env+' 环境');
                            }
                        }
                    }
                }
                promoteNow = document.createElement('a');
                promoteNow.className = 'btn btn-info';
                promoteNow.innerHTML = 'Now';
                promoteNow.style.marginLeft = '10px';
                $(promoteNow).click(function () {
                    var id = $(this).closest('tr').find('td>a[href*="/job/"]').text();
                    var href = $(this).prev()[0].href;
                    location.href = href + '#ap';
                });
                promoteBtn.after(promoteNow);
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
    var hrefFun = async function(){
        while(!$('.nav.nav-tabs>li:first').length){
            await sleep(100);
        }
        var liArr = ['Filter:','Build','Dev','Int','Stg','Prod'];
        var model = $('.nav.nav-tabs>li:first>a');
        var href = model.attr('href').substr(0,model.attr('href').lastIndexOf('/')+1);
        var newUl = document.createElement('ul');
        newUl.className = 'nav nav-tabs';
        for(var i=0;i<liArr.length;i++){
            var currentLi = document.createElement('li');
            var currentA = document.createElement('a');
            currentA.innerHTML = liArr[i];
            currentLi.append(currentA);
            if(i>0){
                currentA.onclick = function(){
                    location.href = href+this.innerHTML+'-'+$('.btn.btn-primary.btn-text').html();
                };
            }
            newUl.append(currentLi);
        }
        $('.nav.nav-tabs').prepend($('<li><a>All&nbsp;&nbsp;&nbsp;&nbsp;:</a></li>')).after(newUl);
        $('.nav.nav-tabs').find('a:first').css({cursor:'unset','font-weight':'bolder'});
        $('.nav.nav-tabs:last').find('a:gt(0)').css({color:'#ff6a6a'});

    };
    if(!isAll){
        hrefFun();
    }
})();