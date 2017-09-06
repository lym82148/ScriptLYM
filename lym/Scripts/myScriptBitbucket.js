// ==UserScript==
// @name         BitbucketReviewer
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  try to take over the world!
// @author       You
// @match        http://suus0003.w10:7990/projects/cnb/repos/*
// @match        http://suus0003.w10:7990/projects/CNB/repos/*
// @match        http://suus0003.w10:7990//projects/CNB/repos/*
// @match        http://suus0003.w10:7990//projects/cnb/repos/*
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
    if(jQuery('#branch-type-menu').length){
        jQuery('#branch-type-menu ul li[data-id=FEATURE]').click();
        jQuery('#branch-name').val(curUserName+'/'+jQuery('#branch-name').val()).css({"min-width":'340px'});
        var branchDiv = jQuery('#branch-from-selector').click().parent();
        var chooseDev = document.createElement('a');
        chooseDev.href='javascript:void(0);';
        chooseDev.style.marginLeft = '10px';
        chooseDev.style.color = '#ff2424';
        chooseDev.innerHTML = 'choose dev';
        branchDiv.append(chooseDev);
        var startFun = async function(){
            while(!jQuery('#branch-from-selector-dialog-tab-pane-0>ul>li').length){
                await sleep(100);
            }
            if(jQuery('#branch-from-selector-dialog-tab-pane-0>ul>li>a[data-id*="/dev"]:eq(0)').length){
                jQuery('#branch-from-selector-dialog-tab-pane-0>ul>li>a[data-id*="/dev"]:eq(0)').click();
            }else{
                jQuery('#branch-from-selector-dialog-tab-pane-0>ul>li>a[data-id*="/ChinaDev"]:eq(0)').click();
            }
        };
        chooseDev.onclick = startFun;
        startFun();
        return;
    }
    var defaultUserList = [{ userName: 'shi', displayName: 'Baoyu SHI' },
                           { userName: 'han', displayName: 'Guoguang Han' },
                           { userName: 'xyang', displayName: 'Yuqi Zhao' },
                           { userName: 'xia', displayName: 'Yongming Xia' },
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
    if (title.html() == 'Create pull request') {
        var btn = document.createElement('a');
        btn.innerHTML = 'Change To Dev';
        btn.style.color = 'red';
        btn.style.marginLeft = '20px';

        btn.href = location.href.replace(/targetBranch=/i, 'targetBranch=dev&targetBranchOld=');
        if (btn.href.indexOf('targetBranch=') < 0) {
            btn.href += '&targetBranch=dev';
        }
        title.append(btn);
    }
    if (location.href == 'http://suus0003.w10:7990/dashboard') {
        var arr = jQuery('a').filter(function (a, b) { return b.innerHTML == 'Create pull request'; });
        for (var i = 0; i < arr.length; i++) {
            arr[i].href = arr[i].href.replace(/targetBranch=/i, 'targetBranch=dev&targetBranchOld=');
            if (arr[i].href.indexOf('targetBranch=') < 0) {
                arr[i].href += '&targetBranch=dev';
            }
        }
    }
    var service = jQuery('#content').data('reponame');
    var jenkinsService;
    var jenkins = document.createElement('a');
    jenkins.innerHTML = 'Jenkins';
    jenkins.target = '_blank';
    jenkins.style.fontSize='24px';
    jenkins.style.color = '#ff6e6e';
    jenkins.style.textDecoration='underline';
    var opsName = service;
    var until = 'dev';
    switch(service){
        case 'BmwGateway':
            jenkinsService = 'gateway';
            opsName = 'BTCAPIServer';
            until = 'ChinaDev';
            break;
        case 'PaymentGateway':
            jenkinsService = 'payment';
            opsName = 'PaymentService';
            break;
        case 'OrderFulfillmentWorker':
            jenkinsService = 'orderfullfilmentworker';
            opsName = 'OrderFullfilmentWorker';
            break;
    }
    jenkins.href = 'http://suus0006.w10:8080/#'+jenkinsService;
    var commitLink = document.createElement('a');
    commitLink.innerHTML = 'Commits';
    commitLink.style.color = '#ff6e6e';
    commitLink.style.marginLeft = '100px';
    commitLink.style.fontSize = '24px';
    commitLink.style.marginBottom = '10px';
    commitLink.style.display = 'block';
    commitLink.style.textDecoration='underline';
    commitLink.href = 'http://suus0003.w10:7990/projects/CNB/repos/'+service+'/commits?until='+until;
    if(jQuery('h2').html()=='Commits'){
        commitLink.innerHTML = 'Get Deploy Status From Ops';
        commitLink.style.color = 'red';
        commitLink.href = 'javascript:void(0);';
        commitLink.onclick = () => {
            window.open('https://omcops.bmw.com.cn/#' + opsName, null, "height=11,width=11,status=no,toolbar=no,scrollbars=no,menubar=no,location=no,top=" + (window.screenTop + 900) + ",left=" + (window.screenLeft + 500));
            commitLink.innerHTML = 'Starting Task';
            commitLink.style.color = 'pink';
            setTimeout(function () {
                commitLink.innerHTML = 'Get Deploy Status From Ops';
                commitLink.style.color = 'red';
            }, 1000);
        };
    }
    if(jQuery('.pull-request-metadata').length){
        jQuery('.pull-request-metadata').after(jenkins).after(commitLink);
    }
    else if(jQuery('.repository-breadcrumbs').length){
        jenkins.style.marginLeft='100px';
        jQuery('.repository-breadcrumbs').append(jenkins).append(commitLink);;
    }
    var envArr = ["", "Build", "Dev", 'Int', 'Stg', 'Prod'];
    window.onmessage = function (e) {
        var arr = e.data.Data;
        console.log(e.data);
        var gitRepoTag;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].Status != 5 && arr[i].Status != 7) { continue; }
            gitRepoTag = arr[i].GitRepoTag.replace(/[^\d]*/i,'');
            break;
        }
        if(jQuery('span.tag[data-names*='+gitRepoTag+']').length){
            if(jQuery('span.tag[data-names*='+gitRepoTag+']').closest('tr').find('td.commit>span.ops>a').length){
                var ele =jQuery('span.tag[data-names*='+gitRepoTag+']').closest('tr').find('td.commit>span.ops>a')[0];
            }else{
                var span =document.createElement('span');
                span.className='ops';
                var ele = document.createElement('a');
                ele.style.color = 'red';
                ele.style.fontWeight = 'bolder';
                ele.style.fontSize = '18px'  ;
                ele.style.marginLeft='5px';
                span.append(ele);
                jQuery('span.tag[data-names*='+gitRepoTag+']').closest('tr').find('td.commit').append(span);
            }
            if (envArr.indexOf(ele.innerHTML) < envArr.indexOf(e.data.Environment)) {
                ele.innerHTML = e.data.Environment;
                ele.href = 'https://omcops.bmw.com.cn/Operation/Release/ReleasePlanIndex/' + e.data.Environment + '-' + opsName;
            }
        }
    };
    startFun();
})();