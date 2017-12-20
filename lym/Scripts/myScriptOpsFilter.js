﻿// ==UserScript==
// @name         OpsFilter
// @namespace    http://tampermonkey.net/
// @version      3.4
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
                var link =  'https://omcops.bmw.com.cn/Operation/Release/ReleasePlanAsync?limit=10&start=0&length=10&page=1&serviceName='+service+'&Env='+a;
                tasks.push($.ajax(link).then(function(data){
                    opener.postMessage(data,'*');
                }));
            });
            $.when(...tasks).then(function(){close();});
        };
        setTimeout( startFun,0);
        return;
    }
    var releaseCon = JSON.parse(sessionStorage.getItem('OpsDeployContent'));
    if(releaseCon){
        $('h1>small').html('Releasing：'+releaseCon.service +' To '+releaseCon.env).css({'color':'#ff6c6c','font-weight':'bold'});
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
    //if (!isAll) {
    $('h1').append(div);
    //}
    var isDeloy = location.href.toLowerCase().startsWith('https://omcops.bmw.com.cn/Operation/Release/ReleasePlanIndex/Dev-'.toLowerCase())
    || location.href.toLowerCase().startsWith('https://omcops.bmw.com.cn/Operation/Release/ReleasePlanIndex/Int-'.toLowerCase())
    || location.href.toLowerCase().startsWith('https://omcops.bmw.com.cn/Operation/Release/ReleasePlanIndex/Prod-'.toLowerCase());
    var services = $('.input-group-addon:eq(0)').next();
    var res = $('.dt-button-collection[role=menu]').find('a');
    var dropdown = services.find('button[data-toggle=dropdown]');
    for (var i = 0; i < res.length; i++) {
        res[i].lText = res[i].innerText.toLowerCase();
    }
    var str = '';
    var ignoreKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    var curList = [];
    var lineColor = 'lightblue';
    var moveFun = function (a) {
        if (curList.length == 0) { return; }
        var nextIndex;
        var widMax = 5;
        var x = Math.floor(curList.curIndex / widMax);
        var y = curList.curIndex % widMax;
        var xList = Math.floor((curList.length - 1) / widMax);
        var yList = (curList.length - 1) % widMax;
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
                nextIndex = Math.round((x - 1) * widMax + y);
                if (checkHasError()) {
                    if (yList < y) {
                        nextIndex = (xList - 1) * widMax + y;
                    } else {
                        nextIndex = (xList) * widMax + y;
                    }
                }
                break;
            case 1:
                nextIndex = Math.round((x + 1) * widMax + y);
                if (checkHasError()) {
                    nextIndex = widMax;
                }
                break;
            case 2:
                if (y > 0) {
                    nextIndex = curList.curIndex - 1;
                } else {
                    nextIndex = curList.curIndex - 1 + widMax;
                }
                if (checkHasError()) {
                    nextIndex -= widMax;
                }
                break;
            case 3:
                if (y == widMax - 1) {
                    nextIndex = curList.curIndex + 1 - widMax;
                } else {
                    nextIndex = curList.curIndex + 1;
                }
                if (checkHasError()) {
                    nextIndex -= widMax;
                }
                break;
        }

        if (nextIndex < 0) {
            nextIndex = curList.length - 1;
        } else if (nextIndex >= curList.length) {
            nextIndex = 0;
        }
        curList[curList.curIndex].style.backgroundColor = '';
        curList[curList.curIndex].style.backgroundImage = '';
        curList[nextIndex].style.backgroundColor = lineColor;
        curList[nextIndex].style.backgroundImage = 'none';
        curList.curIndex = nextIndex;
    };
    var filterFun = function () {
        div.innerHTML = 'Filter: ' + str;
        var first = true;
        curList = [];
        res = $('.dt-button-collection[role=menu]').find('a');
        for (var i = 0; i < res.length; i++) {
            if (res[i].text.toLowerCase().indexOf(str) >= 0) {
                if (first) {
                    res[i].style.backgroundColor = lineColor;
                    res[i].style.backgroundImage = 'none';
                    first = false;
                    curList.curIndex = 0;
                } else {
                    res[i].style.backgroundColor = '';
                    res[i].style.backgroundImage = '';
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
            //return;
        }
        if (e.target.tagName == 'INPUT') {
            return;
        }
        if (e.ctrlKey) {
            return;
        }
        if($('.dt-buttons:eq(0)>a').is(':visible')){
            if(!$('.dt-button-collection[role=menu]').is(':visible')) {
                $('.dt-buttons:eq(0)>a').click();
            }
        }else{
            if(JSON.parse( sessionStorage.getItem('OpsDeployContent'))){

            }else{
                $('a.more:contains(More):eq(0)').click();
                $('.dt-buttons:eq(0)>a').click();
            }
        }
        // if (dropdown.attr('aria-expanded') != 'true') {
        //     dropdown[0].click();
        //     dropdown.blur();
        // }
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
                    curList[curList.curIndex].click();
                    str = '';
                }
                return;
            }
            else if (e.key == 'Escape') {
                if($('.dt-button-collection[role=menu]').is(':visible')){
                    $('.dt-button-collection[role=menu]').prev().click();
                }
                // if (dropdown.attr('aria-expanded') == 'true') {
                //     dropdown[0].click();
                //     dropdown.blur();
                // }
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

    var cParams = location.pathname.split('/').pop().split('-');
    var cEnv = cParams[0];
    var cService = cParams[1];
    $('#nav-tabs-env>li:contains('+cEnv+'):eq(0)').click();
    if(cParams.length>1&&cService!='All'){
        if(sessionStorage.getItem('OpsDeployContent')!=null){
            $('a.more:contains(More):eq(0)').attr("refreash-table",'plan_queue').click().css('display','none');
        }
        str = cService.toLowerCase();
        $('.dt-buttons:eq(0)>a').click();
        filterFun();
        if (curList.length) {
            curList[curList.curIndex].click();
            str = '';
        }
    }
    $('#nav-tabs-env li').click(()=>{
        $('#tb-plan-list tr>td').remove();
        $('#tb-job-queue tr>td').remove();
        $('#tb-plan-queue tr>td').remove();
    })
    var okFun = async function(){
        while(!$('button:contains(Ok):visible').length){
            await sleep(100);
        }
        // $('button:contains(Ok):visible').click();
        await sleep(2000);
        location.href ="https://omcops.bmw.com.cn/Operation/Release/ReleaseManagement";
    }
    var okFunJump = async function(url){
        while(!$('button:contains(Ok):visible').length){
            await sleep(100);
        }
        await sleep(2000);
        // $('button:contains(Ok):visible').click();
        location.href =url;
    }

    if (location.hash != '') {
        var cont = location.hash.replace('#', '').split('-');
        var find = function () {
            var idLinks = $('#tb-plan-list>tbody>tr>td>a[href*="/job/"]');
            if (idLinks.length) {
                for (var i = 0; i < idLinks.length; i++) {
                    if (idLinks[i].text == cont[0]) {
                        var tr = $(idLinks[i]).closest('tr');
                        if (tr.length) {
                            tr.css('backgroundColor', 'rgba(0, 55, 255, 0.18)');
                            tr.find('a:not(.btn):not(.pull-right)').css({ 'color': 'red', 'font-weight': 'bolder' });
                            if(tr.find('a:contains(Deploy)').length){
                                var jsonData = JSON.parse(tr.attr('data'));
                                var planId = jsonData.Id;
                                var service = jsonData.Service;
                                sessionStorage.setItem('OpsDeployContent',JSON.stringify({service:service,id:cont[0],planId:planId,env:cont[1]}));
                                if(tr.find('a:contains(Deploy)')[0].clicked){

                                }else{
                                    tr.find('a:contains(Deploy)')[0].clicked = true;
                                    tr.find('a:contains(Deploy)').click();
                                    var deployFun = async function(){
                                        while(!$('button[data-id='+planId+']').length){
                                            await sleep(100);
                                        }
                                        $('button[data-id='+planId+']').click();
                                        okFun();
                                    }
                                    deployFun();
                                }
                                return;
                            }
                        }
                    }
                }
                setTimeout(find, 100);
            } else {
                setTimeout(find, 100);
            }
        };
        setTimeout(find, 100);
        return;
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
            if(content.btn.clicked){

            }else{
                content.btn.clicked = true;
                content.btn.click();
                var deployFun = async function(){
                    while(!$('button[data-id='+content.planId+']').length){
                        await sleep(100);
                    }
                    $('button[data-id='+content.planId+']').click();
                    var url = 'https://omcops.bmw.com.cn/Operation/Release/ReleaseManagement/'+content.env;
                    okFunJump(url);
                }
                deployFun();
            }
            content.btn.click();
        }
    };
    divAlert.find('button').click(confirmCopy);
    var confirmBox = function (content) {
        divAlert.find('.modal-body').html('发布 '+content.service+' '+content.id+' 到 '+content.env+' 环境').data('content',content);
        divAlert.modal('show');
        console.log(content);
    };
    var promoteFlag = false;
    var waitTable = function () {
        var idLinks = $('#tb-plan-list>tbody>tr>td>a[href*="/job/"]:visible');
        if (idLinks.length) {
            var deployNow, promoteNow, config;
            /*jshint multistr:true */
            var dropdownHtml = '<div class="btn-group" style="margin-left:10px">\
<button type="button" class="btn btn-info btn-sm dropdown-toggle" data-toggle="dropdown">More \
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
            for (var i = 0; i < $('td>a.btn:contains(Deploy)').length; i++) {
                if ($('td>a.btn:contains(Deploy)').eq(i).next('div').length) {
                    continue;
                }
                if(content){
                    if(envs.indexOf(content.env)>=curEnvIndex){
                        var tr = $('td>a.btn:contains(Deploy)').eq(i).closest('tr');
                        var jsonData = JSON.parse(tr.attr('data'));
                        if(content.id == jsonData.JenkinsBuildNo&& content.service == jsonData.Service){
                            content.planId = jsonData.Id;
                            sessionStorage.setItem('OpsDeployContent',JSON.stringify(content));
                            tr.css('backgroundColor', 'rgba(0, 55, 255, 0.18)');
                            tr.find('a:not(.btn):not(.pull-right)').css({ 'color': 'red', 'font-weight': 'bolder' });
                            if(tr.find('a:contains(Deploy)')[0].clicked){

                            }else{
                                tr.find('a:contains(Deploy)')[0].clicked = true;
                                tr.find('a:contains(Deploy)').click();
                                var deployFun = async function(){
                                    while(!$('button[data-id='+jsonData.Id+']').length){
                                        await sleep(100);
                                    }
                                    $('button[data-id='+jsonData.Id+']').click();
                                    var url = 'https://omcops.bmw.com.cn/Operation/Release/ReleaseManagement/'+curEnv;
                                    okFunJump(url);
                                }
                                deployFun();
                            }
                        }
                    }else{
                        debugger;
                        sessionStorage.removeItem('OpsDeployContent');
                        $('h1>small').html('');
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
                $('td>a.btn:contains(Deploy):eq('+i+')').addClass('btn-sm').after($(dropdownHtml)).next('div').find('ul>li>a[name]').click(function(){
                    var tr = $(this).closest('tr');
                    var jsonData = JSON.parse(tr.attr('data'));
                    var id = jsonData.JenkinsBuildNo;
                    var service = jsonData.Service;
                    var deBtn = tr.find('td>a.btn:contains(Deploy)')[0];
                    confirmBox({service:service,id:id,planId:jsonData.Id,env:this.name,btn:deBtn});
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

            for (var i = 0; i < $('td>a.btn:contains(Promote)').length; i++) {
                if(content){
                    if(envs.indexOf(content.env)>=curEnvIndex){
                        var tr = $('td>a.btn:contains(Promote)').eq(i).closest('tr');
                        var jsonData = JSON.parse(tr.attr('data'));
                        if(content.id == jsonData.JenkinsBuildNo&& content.service == jsonData.Service){
                            //content.planId = tr.find('td>a.btn[href*=ReleasePlanPromote]')[0].href.split('/').pop();
                            //sessionStorage.setItem('OpsDeployContent',JSON.stringify(content));
                            tr.css('backgroundColor', 'rgba(0, 55, 255, 0.18)');
                            tr.find('a:not(.btn):not(.pull-right)').css({ 'color': 'red', 'font-weight': 'bolder' });
                            if(promoteFlag){

                            }else{
                                promoteFlag = true;
                                tr.find('a:contains(Promote)').click();
                                var deployFun = async function(){
                                    while(!$('input.valid.plan-id').length || $('input.valid.plan-id').val()!=jsonData.Id){
                                        await sleep(100);
                                    }
                                    console.log(4)
                                    $('.product-owner').val('vincent.yin@bmw.com');
                                    $('input.valid.comments').val('deploy');
                                    $('.btn-promote').click();
                                    console.log(5)
                                    //$('button[data-id='+jsonData.planId+']').click();
                                    var url = "https://omcops.bmw.com.cn/Operation/Release/ReleaseManagement/";
                                    url += envs[curEnvIndex+1]+'-'+content.service;
                                    $("#nav-tabs-env").find(".active").next().click(()=>{location.href=url;});
                                }
                                deployFun();
                            }
                        }
                    }else{
                        debugger;
                        sessionStorage.removeItem('OpsDeployContent');
                        $('h1>small').html('');
                        comAlertAction(content.service+' '+content.id+' 已成功发布到 '+content.env+' 环境');
                    }
                }
            }
            for (var i = 0; i < $('#tb-plan-list tr').find('td:eq(-2)').length; i++) {
                if ($('#tb-plan-list tr').find('td:eq(-2)').eq(i).children().length >=2) {
                    continue;
                }
                config = document.createElement('a');
                config.className = 'pull-right';
                config.style.fontWeight = 'bolder';
                config.style.fontSize = '18px';
                config.innerHTML = 'Config';
                config.style.marginLeft = '10px';
                config.target = '_blank';
                var name = $('#tb-plan-list tr').find('td:eq(-2)').eq(2).siblings().eq(0).text();
                config.href = 'https://omcops.bmw.com.cn/Configuration/DeployConfiguration/NewChange' + '#' + name + '-' + $('ul.nav>li.active').text();
                $('#tb-plan-list tr').find('td:eq(-2)').eq(i).find('a').after(config);
            }

        }
        // else {
        //     setTimeout(waitTable, 100);
        // }
    };
    setInterval(waitTable, 300);


    var regMain = /^https:\/\/omcops.bmw.com.cn\/Operation\/Release\/ReleaseManagement.*/i;
    var pageLengthFlag = false;
    if (regMain.test(location.href) && cParams.length<2) {
        // window.alertOld = window.alert;
        // window.alert = function (a) {
        //     if (!a.startsWith('Success')) {
        //         window.alertOld(a);
        //     }
        // };
        var okNotJumpFun = async function(){
            while(!$('button:contains(Ok):visible').length){
                await sleep(100);
            }
            $('button:contains(Ok):visible').click();
        }
        var waitMain = function () {
            if ($('#tb-plan-queue tr').length > 1) {
                var trs = $('#tb-plan-queue>tbody>tr');
                var content = JSON.parse( sessionStorage.getItem('OpsDeployContent'));
                if (content) {
                    for (var i = 0; i < trs.length; i++) {
                        var jsonData =JSON.parse(trs[i].getAttribute('data'));
                        if (jsonData.Id == content.planId) {
                            trs.eq(i).css('backgroundColor', 'rgba(0, 55, 255, 0.18)');
                            trs.eq(i).find('a:not(.btn):not(.pull-right)').css({ 'color': 'red', 'font-weight': 'bolder' });
                            pageLengthFlag = true;
                            var schedule = $(trs[i]).find('.btn.btn-primary');
                            if(schedule[0].clicked){

                            }else{
                                schedule[0].click();
                                schedule[0].clicked=true;
                                var waitAlert = function () {
                                    var alertId = $('.plan-id').val();
                                    if (alertId == content.planId) {
                                        // debugger;
                                        var mo = $('.inst-list ul>li>a:first')[0];
                                        if(mo){
                                            mo.click();
                                        }
                                        $('button.btn-primary.btn-create')[0].click();
                                        okNotJumpFun();
                                        //sessionStorage.removeItem('OpsDeployContent');
                                    } else {
                                        setTimeout(waitAlert, 100);
                                    }
                                };
                                setTimeout(waitAlert, 100);
                            }

                        }
                    }
                    // if (!pageLengthFlag) {
                    //     pageLengthFlag = true;
                    //     $('[name=tb-plan-list_length]').val(100).change();
                    //     setTimeout(waitMain, 100);
                    // }
                    setTimeout(waitMain, 100);
                }
            }
            else {
                setTimeout(waitMain, 100);
            }
        };
        setTimeout(waitMain, 100);
        var curEnv = $('.nav.nav-tabs>.active>a').text();
        var needJumpCheck = false;
        setInterval(function () {
            var promoteNow;
            var content = JSON.parse(sessionStorage.getItem('OpsDeployContent'));
            var needJump = true;
            for (var i = 0; i < $('#tb-job-queue td.deploymentstatus').length; i++) {
                var tr = $('#tb-job-queue td.deploymentstatus').eq(i).closest('tr');
                var jsonData = JSON.parse(tr.attr('data'));
                var service = jsonData.ServiceName;
                var time = tr.find('td:eq(3)').text().replace(' S','');
                var status = $('#tb-job-queue tr:eq(1)').find('td:eq(2)').text();
                time = +time;
                if(time>3600){
                    continue;
                }
                if(time>1800 && status =='Assigned'){
                    continue;
                }
                console.log(service)
                var promoteBtn = tr.find('td>a.btn[href*=ReleasePlanPromote]');
                if (promoteBtn.length && promoteBtn.next('a').length) {
                    continue;
                }
                if (content) {
                    if(content.service == service){
                        needJumpCheck = true;
                        needJump = false;
                        tr.css('backgroundColor', 'rgba(0, 55, 255, 0.18)');
                        tr.find('a:not(.btn):not(.pull-right)').css({ 'color': 'red', 'font-weight': 'bolder' });
                        if(promoteBtn.length){
                            if(curEnv!='Stg'){
                                location.href = promoteBtn[0].href + '#ap';
                            }else{
                                debugger;
                                sessionStorage.removeItem('OpsDeployContent');
                                $('h1>small').html('');
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

            if(needJumpCheck && needJump){
                if(curEnv!='Stg' && curEnv!='Prod'){
                    location.href ="https://omcops.bmw.com.cn/Operation/Release/ReleaseManagement/"+curEnv+'-'+content.service;
                }else{
                    debugger;
                    sessionStorage.removeItem('OpsDeployContent');
                    comAlertAction(content.service+' '+content.id+' 已成功发布到 '+content.env+' 环境');
                }

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
        //         $('#tb-plan-list').dataTable().fnDraw();
        //         interval = setInterval("$('#tb-plan-list').dataTable().fnDraw();", 60000);
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