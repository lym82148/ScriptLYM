// ==UserScript==
// @name         Bitbucket
// @namespace    http://tampermonkey.net/
// @version      5
// @description  pull request approver、build link、deploy link
// @author       Yiming Liu
// @include      mailto:*
// @match        https://bitbucket.org/*
// ==/UserScript==

(async function wrap() {
    // force async at first
    await lymTM.async();
    var time = lymTM.start();
    await process(wrap, time);
    // log execution time
    time.end();
})();

async function process(func, time) {
    // error url from source tree
    if (location.href.startsWith('https://bitbucket.org//')) {
        $('#error').prepend($(lymTM.createLabel('Redirecting')).css('font-size', '36px'));
        location.href = location.href.replace('https://bitbucket.org//', 'https://bitbucket.org/');
        return;
    }

    // dashboard mail link
    if (location.href.includes('//bitbucket.org/dashboard/overview')) {
        var rows = await lymTM.async($('tr[data-qa=jira-issue-row]'));
        var mailto = lymTM.getMailTo({ to: 'xiaoyu.luo@iherb.com', subject: 'Weekly Report ' + lymTM.dateFormat(new Date(), 'MM-dd') });
        var mailLink = $(lymTM.createLink('Mail All', mailto)).attr('target', '_blank').css({ 'margin-left': '20px', 'font-size': '20px', 'font-weight': 'normal' });
        mailLink.click(async function () {
            var rows = $('tr[data-qa=jira-issue-row]');
            rows.closest('div').next('p').find('button').click();
            rows = await lymTM.async($('tr[data-qa=jira-issue-row]'));
            var arr = rows.map((a, b) => transferRowToModel(b)).sort(a => a.serviceName + a.storyId);
            console.log(arr);
            var res = makeWeeklyReport(arr);
            console.log(res);
            lymTM.copy(res);
        });
        rows.closest('table').parent().parent().prev().find('h2').append(mailLink);
        return;
    }

    // "ol.aui-nav-breadcrumbs" for page pull-requests/new
    // "div:has(div>a[type]):not(:has(div>div>a[type])):first" for page pull-requests/
    var bread = await lymTM.async($('ol.aui-nav-breadcrumbs,div:has(div>a[type]):not(:has(div>div>a[type])):first'));
    // 在关键元素 bread 加载完成后 计时开始
    time.reset();

    // 展开左边栏 才能获取serviceName
    $('button[data-qa-id=expand-collapse-button][aria-expanded=false]').click();
    await lymTM.async();
    // get serviceName after bread, since bread will change by user click
    var serviceName = await lymTM.async(() => $('div.css-1xaaz5m').html());
    // 目标分支
    var targetBranch = lymTM.getDefaultBranch(serviceName);
    // 当前用户名
    var curUserName = $('#bb-bootstrap').data('current-user').displayName;
    // 审核者列表
    var approveUsers = lymTM.getApproveUsers(curUserName);
    console.table({ curUserName, serviceName });

    // Build Links Deploy Links
    var buildDiv = $('<div style="margin-left:15px;font-weight:bold;display:inline">build:</div>');
    var deployDiv = $('<div style="margin-left:20px;font-weight:bold;display:inline">deploy:</div>');
    var configDiv = $('<div style="margin-left:20px;font-weight:bold;display:inline">config:</div>');
    var wrapDiv = $('<div></div>').append(buildDiv).append(deployDiv).append(configDiv);
    var buildLinks = lymTM.getBuildLinks(serviceName);
    for (var a in buildLinks) {
        $(lymTM.createLink(a, buildLinks[a])).css({ 'margin-left': '6px', 'font-weight': 'normal' }).appendTo(buildDiv);
    }
    var deployLinks = lymTM.getDeployLinks(serviceName);
    for (var b in deployLinks) {
        $(lymTM.createLink(b, deployLinks[b])).css({ 'margin-left': '6px', 'font-weight': 'normal' }).appendTo(deployDiv);
    }
    var configLinks = lymTM.getConfigLinks(serviceName);
    for (var c in configLinks) {
        $(lymTM.createLink(c, configLinks[c])).css({ 'margin-left': '6px', 'font-weight': 'normal' }).appendTo(configDiv);
    }
    bread.append(wrapDiv);

    // when page change bread is removed, run script again
    lymTM.nodeRemoveCallback(bread, func);
    // when page change bread is inserted, move children, bind event again
    lymTM.nodeInsertCallback(bread, async function callback() {
        await lymTM.async();
        var $this = $(this);
        $this.children(':not([class])').remove().appendTo($this);
        lymTM.nodeInsertCallback($this, callback);
    });

    // 不是创建分支页面
    if (!$('#id_reviewers_group').length) {
        return;
    }

    // 选默认分支
    var chooseBranch = async function () {
        $('#id_dest_group div.branch-field>a.select2-choice').mousedown();
        await lymTM.async();
        $('#select2-drop ul.select2-result-sub>li').filter((a, b) => b.textContent == targetBranch).mouseup();
        await lymTM.async();
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
function transferRowToModel(row) {
    var link = $(row).find('td a');
    var href = link.attr('href');
    var textNode = link.prop('lastChild');
    var arr = textNode.wholeText.split('-');
    var serviceName = arr.length == 1 ? '' : arr[0].trim();
    var content = textNode.wholeText.replace(serviceName, '').replace('-', '').trim();
    var storyId = link.find('span').text();
    var statusText = link.end().find('td>div>span').text();
    return { storyId, href, serviceName, content, statusText };
}
function makeWeeklyReport(arr) {
    var res = '<p style="font-weight:normal;font-size:16px">What We did:</p>';
    var groupList = Object.create(null);
    for (var item of arr) {
        item.serviceName = item.serviceName || '&nbsp;';
        if (!(item.serviceName in groupList)) {
            groupList[item.serviceName] = [];
        }
        groupList[item.serviceName].push(item);
    }
    for (var service in groupList) {
        res += `<ul><li style="font-weight:normal;font-size:16px">${service}`;
        for (var story of groupList[service]) {
            res += `<ul style="font-weight:normal;font-size:13px"><li><a href="${story.href}">${story.storyId}</a> ${story.content} <span style="font-weight:bolder">(${story.statusText})<span></li></ul>`;
        }
        res += '</li></ul>';
    }
    res += '<p style="font-weight:normal;font-size:16px">What we will do:</p><ul> <li>CS Portal &amp; WCF Shop Service support</li></ul>';
    return res;
}





