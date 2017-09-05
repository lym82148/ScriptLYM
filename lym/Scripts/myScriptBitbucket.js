// ==UserScript==
// @name         BitbucketReviewer
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  try to take over the world!
// @author       You
// @match        http://suus0003.w10:7990/projects/cnb/repos/*
// @match        http://suus0003.w10:7990/projects/CNB/repos/*
// @match        http://suus0003.w10:7990//projects/CNB/repos/*
// @match        http://suus0003.w10:7990//projects/cnb/repos/*
// @match        http://suus0003.w10:7990/dashboard
// @match        http://suus0003.w10:7990/plugins/servlet/create-branch*
// @match        http://suus0003.w10:7990/projects/CNB/repos/driveviolationservice/pull-requests*
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
    var regBran = /http:\/\/suus0003.w10:7990\/projects\/CNB\/repos\/driveviolationservice\/pull-requests/i;
    if(regBran.test( location.href)){
        var service = jQuery('#content').data('reposlug');
        var jenkins = document.createElement('a');
        jenkins.innerHTML = 'Jenkins';
        jenkins.target = '_blank';
        jenkins.style.fontSize='24px';
        jenkins.style.color = '#ff6e6e';
        jenkins.style.textDecoration='underline';
        jenkins.href = 'http://suus0006.w10:8080/#'+service;
        jQuery('.pull-request-metadata').after(jenkins);
        return;
    }
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
    startFun();
})();