// ==UserScript==
// @name         BitbucketReviewer
// @namespace    http://tampermonkey.net/
// @version      6.6
// @description  try to take over the world!
// @author       You
// @match        http://suus0003.w10:7990/projects/cnb/repos/*
// @match        http://suus0003.w10:7990/projects/cnp/repos/*
// @match        http://suus0003.w10:7990/projects/CNB/repos/*
// @match        http://suus0003.w10:7990/projects/CNP/repos/*
// @match        http://suus0003.w10:7990//projects/CNB/repos/*
// @match        http://suus0003.w10:7990//projects/CNP/repos/*
// @match        http://suus0003.w10:7990//projects/cnb/repos/*
// @match        http://suus0003.w10:7990//projects/cnp/repos/*
// @match        http://suus0003.w10:7990/dashboard
// @match        http://suus0003.w10:7990/plugins/servlet/create-branch*
// @grant        none
// ==/UserScript==

(function () {
    var search = jQuery('#s2id_autogen1');
    var input = jQuery('#reviewers');
    var curUserName = jQuery('#current-user').data('username');
    var sleep = function (time) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve();
            }, time);
        });
    };
    if(location.hash =='#ad'){
        for(var i=0;i<document.body.children.length;){
            document.body.children[i].remove();
        }
        var waitDiv = document.createElement('div');
        waitDiv.style.color= 'red';
        waitDiv.innerHTML = 'Waiting';
        document.body.append(waitDiv);
        var startFun = function(){
            var rawUrl = location.href.replace('/browse/','/raw/');
            jQuery.ajax(rawUrl).done(function(data){
                opener.postMessage(data.documentElement.outerHTML,'*');
                close();
            }).fail(function(e){
                alert(e.status);
                close();
            });
        };
        setTimeout(startFun,0);
        return;
    }
    var getBranchName = function(serviceName){
        var branchName = 'ChinaDev';
        switch(serviceName){
            case 'DriveViolationService':
                branchName ='CN-Q4-Release';
                break;
            case 'OrderFulfillmentWorker':
                //branchName ='CN-Refactor';
                break;
            case 'PaymentGateway':
                //branchName = 'CN-v6.1-q4-release';
                break;
            case 'OrderFulfillmentFrontEnd':
                //branchName ='CN-v8.0-q2-release';
                break;
            case 'PartnerGateway':
                // branchName = 'CN-RLS-iOS-v7.0.1-Q1Release';
                break;
            case 'PremiumAirportService':
                //branchName ='CN-v8.0-q2-release';
                break;
            case 'CouponService':
                branchName ='CN-CouponCenter2.0';
                break;

        }
        return branchName;
    };
    if(jQuery('#branch-type-menu').length){
        jQuery('#branch-type-menu ul li[data-id=FEATURE]').click();
        var newName = curUserName;
        switch(newName){
            case'xyang':
                newName='yuqi';
                break;
            case 'han':
                newName='guoguang';
                break;
            case 'yliu':
                newName='yiming';
                break;
            case 'tang':
                newName='dingyou';
                break;
        }
        jQuery('#branch-name').val(newName+'/'+jQuery('#branch-name').val()).css({"min-width":'340px'});
        var branchDiv = jQuery('#branch-from-selector').click().parent();

        var chooseDev = document.createElement('a');
        chooseDev.href='javascript:void(0);';
        chooseDev.style.marginLeft = '10px';
        chooseDev.style.color = '#ff2424';
        chooseDev.innerHTML = 'Choose Default Branch';
        branchDiv.append(chooseDev);
        var startFun = async function(){
            var branchName = getBranchName(jQuery('#repository-selector span.name').text());
            while(!jQuery('#branch-from-selector-dialog-tab-pane-0>ul>li').length){
                await sleep(100);
            }
            if(jQuery('#branch-from-selector-dialog-tab-pane-0>ul>li>a[data-id*="/'+branchName+'"]:eq(0)').length){
                jQuery('#branch-from-selector-dialog-tab-pane-0>ul>li>a[data-id*="/'+branchName+'"]:eq(0)').click();
            }else if(jQuery('#branch-from-selector-dialog-tab-pane-0>ul>li>a[data-id*="/ChinaDev"]:eq(0)').length){
                jQuery('#branch-from-selector-dialog-tab-pane-0>ul>li>a[data-id*="/ChinaDev"]:eq(0)').click();
            }
            else{
                jQuery('#branch-from-selector-dialog-tab-pane-0>ul>li>a[data-id*="/dev"]:eq(0)').click();
            }
        };
        chooseDev.onclick = startFun;
        startFun();
        return;
    }

    var filterInit = function(){
        var json = localStorage.getItem('bitRepoList');
        var obj = JSON.parse(json);
        var div = document.createElement('div');
        div.style.color = 'red';
        div.style.fontSize = '32px';
        div.innerHTML = 'Filter: ';
        div.style.marginButtom = '9px';
        var listDiv = document.createElement('div');
        listDiv.id = 'listDivFilterRes';
        var res = obj.links;
        var regK = /\/[^\/]*\/repos\/[^\/]*/i;
        for (var i = 0; i < res.length; i++) {
            var item = res[i];
            var divItem = document.createElement('div');
            divItem.style.margin = '2px';
            var a = document.createElement('a');
            a.lid = item.lid;
            a.style.fontSize = '18px';
            a.style.margin = '5px';
            a.style.padding = '2px';
            if(location.href.toLowerCase().startsWith('http://suus0003.w10:7990/dashboard') ||location.href.indexOf('pull-requests/')>0 ){
                a.href = item.href + '?at=ChinaDev';
            }else{
                a.href = location.href.replace(regK,'/'+item.location+'/repos/'+item.lid);
            }
            a.innerHTML = item.name;
            a.style.display = 'none';
            divItem.append(a);
            listDiv.append(divItem);
            item.a = a;
        }
        res = res.map(function (a) { return a.a; });
        if(location.href.toLowerCase().startsWith('http://suus0003.w10:7990/dashboard')){
            jQuery('h3:first').append(div);
        }else{
            jQuery('h2:first').append(div);
        }
        div.after(listDiv);
        var divOther = document.createElement('div');
        divOther.style.fontSize = '18px';
        divOther.style.marginTop = '7px';
        divOther.style.fontWeight = 'bold';
        listDiv.after(divOther);

        var filterFun = function () {
            div.innerHTML = 'Filter: ' + str;
            var first = true;
            curList = [];
            var maxCount = 2;
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
        jQuery('.focused').removeClass('focused');
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
            if (e.key.length <= 1) {
                return false;
            }
        };

        document.onpaste = (e) => {
            if (!auto) { return; }
            str = e.clipboardData.getData('Text').toLowerCase();
            filterFun();
        };
        var auto = true;
    };
    var json = localStorage.getItem('bitRepoList');
    var obj = JSON.parse(json);
    if(obj && new Date(obj.expireTime) > new Date()){
        filterInit();
    }
    else{
        var ajax1 = jQuery.ajax('http://suus0003.w10:7990/rest/api/latest/projects/CNB/repos?start=0&limit=200');
        var ajax2 = jQuery.ajax('http://suus0003.w10:7990/rest/api/latest/projects/CNP/repos?start=0&limit=200');
        jQuery.when(ajax1,ajax2).then(function(data1,data2){
            var linksObj1 =  data1[0].values.map(function(b){return {href:b.links.self[0].href,name:b.name,lid:b.name.toLowerCase(),location:'CNB'};});
            var linksObj2 =  data2[0].values.map(function(b){return {href:b.links.self[0].href,name:b.name,lid:b.name.toLowerCase(),location:'CNP'};});
            var linksObj = linksObj1.concat(linksObj2);
            var json =JSON.stringify({ links:linksObj,expireTime:new Date(+new Date()+86400e3)});
            localStorage.setItem('bitRepoList',json);
            filterInit();
        });
    }


    var defaultUserList = [//{ userName: 'shi', displayName: 'Baoyu SHI' },
                           { userName: 'han', displayName: 'Guoguang Han' },
                           //{ userName: 'xyang', displayName: 'Yuqi Zhao' },
                           { userName: 'tang', displayName: 'Dingyou Tang' },
                           { userName: 'yazhou', displayName: 'Yazhou Zhao' },
                           { userName: 'Liang.Fan', displayName: 'Liang.Fan' },
                           //{ userName: 'xia', displayName: 'Yongming Xia' },
                           { userName: 'yliu', displayName: 'Yiming SH Liu' }];
    var filterUserList = defaultUserList.filter(function (a) { return a.userName != curUserName; });
    var ul = jQuery('#s2id_reviewers ul:eq(0)');
    var tabFun = function (e) {
        if (e.key == 'Tab') {
            var curList = jQuery('#s2id_reviewers ul:eq(0)>li:visible span[data-username]').map(function (a, b) { return jQuery(b).data('username'); }).toArray();
            var secFilterUserList = filterUserList.filter(function (a) { return curList.indexOf(a.userName) < 0; });
            if (!secFilterUserList.length) {
                return;
            }
            for (var i = 0; i < secFilterUserList.length; i++) {
                var element = module.replace(/{{userName}}/g, secFilterUserList[i].userName).replace(/{{displayName}}/g, secFilterUserList[i].displayName);
                ul.prepend(element);
            }
            if (input.val() === '') {
                input.val(secFilterUserList.map(function (a) { return a.userName; }).join('|!|'));
            } else {
                input.val(input.val() + '|!|' + secFilterUserList.map(function (a) { return a.userName; }).join('|!|'));
            }
        }
    };
    search.attr('placeholder', 'press TAB to add default reviewers').keydown(tabFun);
    search.css('min-width', '250px');

    /*jshint multistr:true*/
    var module = '<li class="select2-search-choice">\
<div><div class="avatar-with-name" title="{{displayName}}"><span class="aui-avatar aui-avatar-xsmall user-avatar" data-username="{{userName}}"><span class="aui-avatar-inner">\
<img src="http://www.gravatar.com/avatar/57e6d28e6ba87d3532b70b02ca1bb0fb.jpg?s=32&amp;d=mm" alt="{{displayName}}"></span></span><span class="display-name">{{displayName}}</span></div></div>\
<a href="#" onclick="jQuery(this).closest(\'.select2-search-choice\').hide();jQuery(\'#reviewers\').val(jQuery(\'#s2id_reviewers ul:eq(0)>li:visible span[data-username]\').map(function(a,b){return jQuery(b).data(\'username\')}).toArray().join(\'|!|\'));"\
class="select2-search-choice-close" tabindex="-1"></a></li>';
    var sleep = function (time) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve();
            }, time);
        });
    };
    tabFun({ key: 'Tab' });
    var startFun = async function(){
        while(jQuery('#s2id_reviewers ul:eq(0)>li:visible span[data-username]').map(function (a, b) { return jQuery(b).data('username'); }).toArray().length != 0){
            await sleep(100);
        }
        tabFun({ key: 'Tab' });
    };
    var title = jQuery('h2:eq(0)');
    if (title.text().startsWith( 'Create pull request')){
        var serviceName = jQuery('#content').data('reponame');
        var branchName = getBranchName(serviceName);
        var btn = document.createElement('a');
        btn.innerHTML = 'Change To '+branchName;
        btn.style.color = 'red';
        btn.style.marginLeft = '20px';
        btn.href = location.href.replace(/targetBranch=/i, 'targetBranch='+branchName+'&targetBranchOld=');
        if (btn.href.indexOf('targetBranch=') < 0) {
            btn.href += '&targetBranch='+branchName;
        }
        title.children(':first').before(btn);
    }
    if (location.href == 'http://suus0003.w10:7990/dashboard') {
        var arr = jQuery('a').filter(function (a, b) { return b.innerHTML == 'Create pull request'; });
        for (var i = 0; i < arr.length; i++) {
            var serviceName = jQuery(arr[i]).closest('tr').find('span.name').text();
            var branchName = getBranchName(serviceName);
            arr[i].href = arr[i].href.replace(/targetBranch=/i, 'targetBranch='+branchName+'&targetBranchOld=');
            if (arr[i].href.indexOf('targetBranch=') < 0) {
                arr[i].href += '&targetBranch='+branchName;
            }
        }
    }
    var service = jQuery('#content').data('reponame')||'';
    var jenkins = document.createElement('a');
    jenkins.innerHTML = 'Jenkins';
    jenkins.target = '_blank';
    jenkins.style.fontSize='24px';
    jenkins.style.color = '#ff6e6e';
    jenkins.style.textDecoration='underline';
    var opsName = service;
    var jenkinsService = service;
    var until = getBranchName(service);
    switch(service){
        case 'BmwGateway':
            jenkinsService = 'gateway';
            opsName = 'BTCAPIServer';
            break;
        case 'PaymentCenter':
            jenkinsService = 'payment';
            opsName = 'PaymentService';
            break;
        case 'OrderFulfillmentWorker':
            jenkinsService = 'orderfullfilmentworker';
            opsName = 'OrderFullfilmentWorker';
            break;
        case 'PartnerGateway':
            jenkinsService = 'enterpriseportal';
            opsName = 'EnterprisePortal';
            break;
        case 'PremiumAirportService':
            jenkinsService = 'premiumairportdpservice';
            opsName = 'PremiumAirportDPService';
            break;
        case 'CDPreActivationService':
            jenkinsService = 'cdpreactivation';
            opsName = 'cdpreactivation';
            break;
        case 'FuelCardService':
            jenkinsService = 'recharge';
            opsName = 'rechargeservice';
            break;
        case 'ChargingNowService':
            jenkinsService = 'chargingstation';
            opsName = 'chargingstation';
            break;
        case 'BmwServiceManager':
            jenkinsService = 'apphub';
            opsName = 'btcservicemanager';
            break;
        case 'VehicleCenter':
            jenkinsService = 'vehicle';
            opsName = 'vehicleservice';
            break;
        case 'UserCenter':
            jenkinsService = 'usercenter';
            opsName = 'BMWUserCenter';
            break;
    }
    jenkins.href = 'http://suus0006.w10:8080/#'+jenkinsService.toLowerCase();
    var commitLink = document.createElement('a');
    commitLink.style.color = '#ff6e6e';
    commitLink.style.marginLeft = '100px';
    commitLink.style.fontSize = '24px';
    commitLink.style.marginBottom = '10px';
    commitLink.style.display = 'block';
    commitLink.style.textDecoration='underline';
    commitLink.innerHTML = 'Get Deploy Status From Ops';
    commitLink.href = 'javascript:void(0);';
    commitLink.onclick = () => {
        commitLink.innerHTML = 'Starting Task';
        commitLink.style.color = 'pink';
        setTimeout(function () {
            commitLink.innerHTML = 'Get Deploy Status From Ops';
            commitLink.style.color = '#ff6e6e';
        }, 1000);
        if(!jQuery('h2:first').text().startsWith('Commits')){
            commitLink.href = 'http://suus0003.w10:7990/projects/CNB/repos/'+service+'/commits?until='+until;
        }else{
            commitLink.href = 'javascript:void(0);';
        }
        window.open('https://omcops.bmw.com.cn/#' + opsName, null, "height=11,width=11,status=no,toolbar=no,scrollbars=no,menubar=no,location=no,top=" + (window.screenTop + 900) + ",left=" + (window.screenLeft + 500));
    };
    if(jQuery('.pull-request-metadata').length){
        jQuery('.pull-request-metadata').after(jenkins).after(commitLink);
    }
    else if(jQuery('.repository-breadcrumbs').length){
        jenkins.style.marginLeft='100px';
        jQuery('.repository-breadcrumbs').append(jenkins).append(commitLink);;
    }
    var envArr = ["", "Build", "Dev", 'Int', 'Stg', 'Prod'];
    window.onmessage = function (e) {
        var arr = e.data.result.data;
        console.log(e.data);
        var gitCommitId;
        var gitRepoTag;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].Status != 'Deployed'&&arr[i].Status != 'Promoted') { continue; }
            gitCommitId = arr[i].GitRepoCommitId.split(',').pop();
            break;
        }
        // if(jQuery('span.tag[data-names*='+gitRepoTag+']').length){
        if( jQuery('td.commit>a.commitid[data-commitid*='+gitCommitId+']')){
            if(jQuery('td.commit>a.commitid[data-commitid*='+gitCommitId+']').closest('td').find('span.ops>a').length){
                var ele =jQuery('td.commit>a.commitid[data-commitid*='+gitCommitId+']').closest('td').find('span.ops>a')[0];
            }else{
                var span =document.createElement('span');
                span.className='ops';
                var ele = document.createElement('a');
                ele.style.color = 'red';
                ele.style.fontWeight = 'bolder';
                ele.style.fontSize = '18px'  ;
                ele.style.marginLeft='5px';
                span.append(ele);
                // jQuery('span.tag[data-names*='+gitRepoTag+']').closest('tr').find('td.commit').append(span);
                jQuery('td.commit>a.commitid[data-commitid*='+gitCommitId+']').closest('td').append(span);
            }
            if (envArr.indexOf(ele.innerHTML) < envArr.indexOf(e.data.result.env)) {
                ele.innerHTML = e.data.result.env;
                ele.href = 'https://omcops.bmw.com.cn/Operation/Release/ReleaseManagement/' + e.data.result.env + '-' + opsName;
            }
        }
    };
    startFun();
})();