// ==UserScript==
// @name         BitbucketReviewer
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  try to take over the world!
// @author       You
// @match        http://suus0003.w10:7990/projects/cnb/repos/*
// @match        http://suus0003.w10:7990/projects/CNB/repos/*
// @match        http://suus0003.w10:7990//projects/CNB/repos/*
// @match        http://suus0003.w10:7990//projects/cnb/repos/*
// @match        http://suus0003.w10:7990/dashboard
// @grant        none
// ==/UserScript==

(function () {

    var search = jQuery('#s2id_autogen1');
    var input = jQuery('#reviewers');
    var curUserName = jQuery('#current-user').data('username');
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

    tabFun({ key: 'Tab' });
    setTimeout(function () {
        if (jQuery('#s2id_reviewers ul:eq(0)>li:visible span[data-username]').map(function (a, b) { return jQuery(b).data('username'); }).toArray().length == 0) {
            tabFun({ key: 'Tab' });
        }
    }, 500);
    setTimeout(function () {
        if (jQuery('#s2id_reviewers ul:eq(0)>li:visible span[data-username]').map(function (a, b) { return jQuery(b).data('username'); }).toArray().length == 0) {
            tabFun({ key: 'Tab' });
        }
    }, 1500);

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
})();