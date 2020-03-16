// ==UserScript==
// @name         Bitbucket
// @namespace    http://tampermonkey.net/
// @version      3
// @description  pull request approver、build link、deploy link
// @author       Yiming Liu
// @match        https://bitbucket.org/*
// @grant        none
// ==/UserScript==


(async function () {
    // Service Name
    var serviceName = await lymTM.async(() => $('div.css-1xaaz5m').html());
    var bread = $(`ol.aui-nav-breadcrumbs>li>a:first,a[title="${serviceName}"]`).parent().siblings(':last');

    // Build Link
    var buildLink = $(lymTM.createLink('Build', lymTM.getBuildLink(serviceName))).css('margin-left', '20px');
    bread.append(buildLink);

    // Deploy Link
    var deployLink = $(lymTM.createLink('Deploy', lymTM.getDeployLink(serviceName))).css('margin-left', '20px');
    bread.append(deployLink);

    // 不是创建分支页面
    if (!$('#id_reviewers_group').length) {
        return;
    }

    var curUserName = $('#bb-bootstrap').data('current-user').displayName;
    console.table({ curUserName, serviceName });

    var targetBranch = lymTM.getDefaultBranch(serviceName);
    var chooseBranch = async function () {
        // 选默认分支
        $('#id_dest_group div.branch-field>a.select2-choice').mousedown();
        await lymTM.async();
        $('#select2-drop ul.select2-result-sub>li').filter((a, b) => { return b.textContent == targetBranch; }).mouseup();
    }
    await chooseBranch();
    // 选择分支提示链接
    $('div.branch-field:eq(1)').before(lymTM.createLinkButton('Choose ' + targetBranch, chooseBranch)).css('margin-top', '3px').closest('div.branch-field-container').css('margin-top', '3px');

    // 审核者列表
    var approveUsers = lymTM.getApproveUsers(curUserName);
    // 选择审核者提示链接
    var element = $('<div class="field-group"><label></label></div>');
    element.append(lymTM.createLinkButton('Add  ' + approveUsers.map((a, b) => a.userName).join(' & '), () => tabFun({ key: 'Tab' })));
    $('#id_reviewers_group').before(element);

    // 预热搜索列表
    await search(approveUsers, true);
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
    await tabFun({ key: 'Tab' });

})();

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

