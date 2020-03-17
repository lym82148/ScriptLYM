// ==UserScript==
// @name         Bitbucket
// @namespace    http://tampermonkey.net/
// @version      4
// @description  pull request approver、build link、deploy link
// @author       Yiming Liu
// @match        https://bitbucket.org/*
// ==/UserScript==

(async function wrap() {
    var time = lymTM.start();
    await process(wrap);
    time.end();
})();
async function process(func) {
    // error url from source tree
    if (location.href.startsWith('https://bitbucket.org//')) {
        $('#error').prepend($(lymTM.createLabel('Redirecting')).css('font-size', '36px'));
        location.href = location.href.replace('https://bitbucket.org//', 'https://bitbucket.org/');
    }

    // Service Name
    var serviceName = await lymTM.async(() => $('div.css-1xaaz5m').html());
    // 目标分支
    var targetBranch = lymTM.getDefaultBranch(serviceName);
    // 当前用户名
    var curUserName = $('#bb-bootstrap').data('current-user').displayName;
    // 审核者列表
    var approveUsers = lymTM.getApproveUsers(curUserName);
    console.table({ curUserName, serviceName });

    var bread = await lymTM.async($('ol.aui-nav-breadcrumbs,div.sc-hAXbOi,div.hkbPbT'));

    // when page change
    bread.on('DOMNodeRemovedFromDocument', func);
    var newDiv = $('<div></div>').appendTo(bread);

    // Build Link
    $(lymTM.createLink('Build', lymTM.getBuildLink(serviceName))).css('margin-left', '20px').appendTo(newDiv);

    // Deploy Link
    $(lymTM.createLink('Deploy', lymTM.getDeployLink(serviceName))).css('margin-left', '20px').appendTo(newDiv);


    // 不是创建分支页面
    if (!$('#id_reviewers_group').length) {
        return;
    }

    // 选默认分支
    var chooseBranch = async function () {
        $('#id_dest_group div.branch-field>a.select2-choice').mousedown();
        await lymTM.async();
        $('#select2-drop ul.select2-result-sub>li').filter((a, b) => b.textContent == targetBranch).mouseup();
    }
    await chooseBranch();

    // 选择分支提示链接
    $('div.branch-field:eq(1)').before(lymTM.createButton('Choose ' + targetBranch, chooseBranch)).css('margin-top', '3px').closest('div.branch-field-container').css('margin-top', '3px');

    // 选择审核者提示链接
    var element = $('<div class="field-group"><label></label></div>');
    element.append(lymTM.createButton('Add  ' + approveUsers.map((a, b) => a.userName).join(' 、 '), () => tabFun({ key: 'Tab' })));
    $('#id_reviewers_group').before(element);

    // 预热搜索列表
    await search(approveUsers, true);;
    // 隐藏搜索列表
    $('#select2-drop-mask').click();
    // 等待搜索结果加载准备
    await lymTM.async(500);

    var tabFun = async function (e) {
        if (e.key == 'Tab') {
            var curList = $('#id_reviewers_group ul.select2-choices>li.select2-search-choice').map((a, b) => b.textContent.trim()).toArray();
            var secFilterUserList = approveUsers.filter((a) => !curList.includes(a.userName));
            await search(secFilterUserList);
        }
    };
    // 触发搜索
    await tabFun({ key: 'Tab' });

}

var event = document.createEvent('HTMLEvents');
// 事件类型，是否冒泡，是否阻止浏览器的默认行为
event.initEvent("input", false, true);
async function search(list, isWarmUp) {
    for (var i in list) {
        var input = $('#id_reviewers_group ul.select2-choices>li.select2-search-field>input').click();
        console.log('search for username:' + list[i].userName);
        input.val(list[i].userName).get(0).dispatchEvent(event);
        await lymTM.async();
        if (!isWarmUp) {
            // 选择搜索结果的第一项
            $('#select2-drop>ul>li').mouseup();
        }
    }
}






