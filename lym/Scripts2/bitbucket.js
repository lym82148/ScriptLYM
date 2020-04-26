// ==UserScript==
// @name         Bitbucket
// @namespace    http://tampermonkey.net/
// @version      13
// @description  pull request approver、build link、deploy link
// @author       Yiming Liu
// @include      mailto:*
// @match        https://bitbucket.org/*
// @match        https://iherbglobal.atlassian.net/issues/?filter=*
// @match        https://bitbucket.org/iherbllc/*config*.yaml?*mode=edit*
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
    if (location.href.includes('config') && location.search.includes('mode=edit')) {
        var originConfig = $('div.codehilite>pre').text();
        var existConfigs = Object.create(null);
        var headConfigsRegx = /[\s\S]*\nconfigmap:\n  data:\n/;
        var matchRes = $('div.codehilite>pre').text().match(headConfigsRegx);
        var headConfigs;
        if (matchRes) {
            headConfigs = matchRes[0];
        } else {
            headConfigs = originConfig;
        }
        $('div.codehilite>pre').text().replace(headConfigs, '').split(/\n/).filter(a => a).forEach(a => {
            var arr = a.split(': ');
            if (arr.length != 2) {
                console.log(`error when split config '${a}' by ': '`);
            }
            if (arr[0].trim() in existConfigs) {
                console.warn(`duplicated config '${arr[0]}: ${existConfigs[arr[0]]}' '${a}'`);
            } else {
                existConfigs[arr[0].trim()] = arr[1].trim();
            }
        })

        var jenkinsName = location.href.replace(/^.*\/master\/|/, '').split('/').shift();
        //         jenkinsName = jenkinsName.replace(/^backoffice-/, '');
        console.log(jenkinsName);
        var copyConfigStr;
        var processing = false;
        var link = $(lymTM.createButton('', () => {
            if (processing) { return; } console.log(copyConfigStr);
            lymTM.copy(copyConfigStr);
            link.fadeOut(200);
            setTimeout(() => link.fadeIn(200), 200)
        })).css({ 'display': 'inline', 'outline': 'none', 'margin-left': '40px' });
        var selectBranchAction = async function () {
            processing = true;
            link.fadeOut();
            ClearRenderDiff();
            var branchName = this.value;
            var projectConfigs = Object.create(null);
            var configUrl = lymTM.getProjectConfigFile(jenkinsName, branchName);
            console.log(configUrl);
            await lymTM.get(configUrl, (res) => {
                var json = JSON.parse(res);
                projectConfigs = lymTM.transferConfigJson(json);
            });
            var configUrlDev = lymTM.getProjectConfigFileDev(jenkinsName, branchName);
            console.log(configUrlDev);
            await lymTM.get(configUrlDev, (res) => {
                var json = JSON.parse(res);
                $.extend(projectConfigs, lymTM.transferConfigJson(json));
            });
            //             console.log("projectConfigs",projectConfigs);
            MergeConfig(projectConfigs);
            link.fadeIn();
            processing = false;
        }
        var projectNewAddConfig;
        var existRedundantConfig;
        var differentConfig;
        function ClearRenderDiff() {
            copyConfigStr = '';
            $(`pre.CodeMirror-line`).each((a, b) => { b.style.backgroundColor = null; b.title = ''; });
            projectNewAddConfig = existRedundantConfig = differentConfig = new Map();
        }
        function RenderDiff() {
            var entity;
            var configLines = $('div.CodeMirror-code>div:contains(configmap:)').next('div:contains(data:)').nextAll();
            var keyList = [];
            configLines.each((index, line) => {
                var $line = $(line);
                var preChild = $line.find('pre').children();
                var key = preChild.text().replace(/: .*$/, '').replace(/\u200B/g, '').trim();
                keyList.push(key);
                var value = preChild.text().replace(/^.*?: /, '').trim();
                if (!key) { return; }
                var newTransparent = '#00ff7b33';
                var redundantTransparent = '#ff8c0033';
                var redundantAdjustment = '#ff000033'
                var white = 'white';
                //                 console.log(key);
                if (existRedundantConfig.get(key) != undefined) {
                    if (value != existRedundantConfig.get(key)) {
                        // 变更状态 value 不一致的 key
                        preChild.find('span:lt(2)').css('background-color', redundantAdjustment);
                        preChild.css('background-color', newTransparent).attr('title', `original value【${existRedundantConfig.get(key)}】`);
                    } else {
                        // 未变更状态 多余的 key
                        preChild.css('background-color', redundantTransparent).attr('title', 'the config is not in project');
                    }
                } else if (key in existConfigs) {
                    if (value != existConfigs[key]) {
                        // 变更状态 value 不一致的 key
                        preChild.find('span:lt(2)').css('background-color', white);
                        preChild.css('background-color', newTransparent).attr('title', `original value【${existConfigs[key]}】`);
                    } else {
                        // 未变更状态 value 不一致的 key
                        var entity = differentConfig.get(key);
                        if (entity != undefined) {
                            preChild.find('span:lt(2)').css('background-color', white);
                            preChild.css('background-color', redundantTransparent).attr('title', `the value in project is 【${entity[1]}】`).mousedown(((a) => () => lymTM.copy(a))(entity[1]));
                        }
                    }
                } else {
                    // 新增的 key
                    preChild.css('background-color', newTransparent).attr('title', 'new config');
                }

            });
            var errKeyList = keyList.filter(i => keyList.indexOf(i) != keyList.lastIndexOf(i));
            configLines.each((index, line) => {
                var $line = $(line);
                var lineTag = $line.children('div>div');
                var preChild = $line.find('pre').children();
                var lineText = preChild.text().replace(/\u200B/g, '');
                var key = lineText.replace(/: .*$/, '').trim();
                var error = 'red';
                var titleContent = '';
                var cssObj = { 'padding': '0 0 0 1.5em', 'line-height': '16px', 'margin': '0px' };
                if (key.trim() == '') { return; }
                if (errKeyList.includes(key)) {
                    // 重复的 key
                    titleContent = `Duplicate key:${key}`;
                    lineTag.addClass('aui-message aui-message-warning').css(cssObj).attr('title', titleContent);
                }
                else if (!lineText.includes(': ')) {
                    // 没有冒号空格分隔的配置项
                    if (lineText.includes('：')) {
                        titleContent = `config must include ': ' instead of '：'`;
                    } else {
                        titleContent = `config must include ': '`;
                    }
                    lineTag.addClass('aui-message aui-message-warning').css(cssObj).attr('title', titleContent);
                } else {
                    lineTag.removeClass('aui-message aui-message-warning').attr('title', '');
                }
            });
        }
        function MergeConfig(projectConfigs) {
            projectNewAddConfig = new Map(Object.keys(projectConfigs).filter(x => !(x in existConfigs)).map(x => [x, projectConfigs[x]]));
            existRedundantConfig = new Map(Object.keys(existConfigs).filter(x => !(x in projectConfigs)).map(x => [x, existConfigs[x]]));
            differentConfig = new Map(Object.keys(projectConfigs).filter(x => x in existConfigs && existConfigs[x] != projectConfigs[x].toString()).map(x => [x, [existConfigs[x], projectConfigs[x]]]));
            console.log("existRedundantConfig", existRedundantConfig);
            console.log("projectNewAddConfig", projectNewAddConfig);
            console.log("differentConfig", differentConfig);
            // do not order by key, order by updated time
            // projectConfigs will not overwrite existConfigs
            //             $.extend(projectConfigs, existConfigs);
            //             var keysArr = new Array(...Object.keys(projectConfigs)).sort();
            //             console.log(keysArr);
            var configStr = '';
            //             for (var key of Object.keys(existConfigs)) {
            //                 var value = existConfigs[key];
            //                 if (key == "ASPNETCORE_ENVIRONMENT") {
            //                     configStr = `    ${key}: ${value}\n` + configStr;
            //                 } else {
            //                     configStr += `    ${key}: ${value}\n`;
            //                 }
            //             }
            //             for (key of Object.keys(projectConfigs)) {
            //                 if(key in existConfigs){continue;}
            //                 value = projectConfigs[key];
            //                 configStr += `    ${key}: ${value}\n`;
            //             }
            for (var entity of projectNewAddConfig) {
                configStr += `    ${entity[0]}: ${entity[1]}\n`;
            }
            if (projectNewAddConfig.size) {
                link.html(`Copy ${projectNewAddConfig.size} new config`);
            } else {
                link.html(`No new config`);
            }
            copyConfigStr = configStr;
        }
        debugger;
        var branches = await lymTM.getBranchesByName(jenkinsName);
        var options = '';
        for (var branchName of branches) {
            options += `<option>${branchName}</option>`;
        }
        var selectBranch = $(`<select>${options}</select>`).css({ 'margin-top': '10px', 'font-size': '16px', 'margin-bottom': '10px' });
        var useCustomer = $(lymTM.createButton('Input config json', () => {
            var res = prompt();
            if (!res) { return; }
            try {
                res = res.trim();
                if (!res.startsWith('{')) {
                    res = `{${res}}`;
                }
                res = JSON.parse(res);
                if (!(res instanceof Object)) {
                    throw "must be a json object";
                }
            } catch (e) {
                alert(e);
                return;
            }
            var configs = lymTM.transferConfigJson(res)
            ClearRenderDiff();
            MergeConfig(configs);
            lymTM.copy(copyConfigStr);
            alert('copy success');
        })).css({ 'display': 'inline', 'outline': 'none' });
        var hr = $('<hr/>').css({ 'margin': '2px', 'border': 0 });
        var div = $('<div/>')
        var wrapDivEx = $('<div/>');
        wrapDivEx.append(hr).append(selectBranch).append(div).append(useCustomer).append(link);
        $('#source-path>div:last-child').append(wrapDivEx);

        selectBranch.change(selectBranchAction);
        selectBranch.change();

        var textarea = await lymTM.async($('div.CodeMirror textarea'));
        // 支持中文输入
        textarea[0].onkeyup = async () => { await lymTM.async(100); RenderDiff() };
        // 支持删除
        textarea[0].onkeydown = RenderDiff;
        // 支持输入
        textarea[0].oninput = RenderDiff;
        // 支持右键粘贴
        textarea[0].onpaste = RenderDiff;
        // 保底方案
        setInterval(RenderDiff, 1000);
        var styleMock = $('<style>body.adg3 .aui-message::after{margin-top:0px;left:39px;top:0px}</style>')
        $('body').prepend(styleMock);
        return;
    }

    // job
    createBranchThread();
    // not need await
    createMailLinkThread();
    createMailLinkThreadEx();

    // "ol.aui-nav-breadcrumbs" for page pull-requests/new
    // "div:has(div>a[type]):not(:has(div>div>a[type]))" for page pull-requests/
    // ":has(div[data-qa])" for page repositories
    var bread = await lymTM.async($('ol.aui-nav-breadcrumbs,div:has(div>a[type]):not(:has(div>div>a[type]),:has(div[data-qa]))'));
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
    var approveUsers = lymTM.getApproveUsers(curUserName, serviceName);
    console.table({ curUserName, serviceName });

    // Build Links Deploy Links
    var wrapDiv = lymTM.generateRelativeLinks(serviceName, $);
    bread.append(wrapDiv);
    $('div[offset][aria-hidden]>div>div:first').append(wrapDiv.clone().css('line-height', 3).children().css('margin', 5).end());

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
    await lymTM.async(1000);

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
function transferRowToModelEx(row) {
    var $row = $(row);
    var link = $row.find('td a.issue-link');
    var href = location.origin + link.attr('href');
    var textNode = $row.find('td.summary a.issue-link').text();
    var arr = textNode.split('-');
    var serviceName = arr.length == 1 ? '' : arr[0].trim();
    var content = textNode.replace(serviceName, '').replace('-', '').trim();
    var storyId = link.data('issue-key');
    var statusText = $row.find('td.status').text().trim();
    return { storyId, href, serviceName, content, statusText };
}
function makeWeeklyReport(arr) {
    var res = '<p style="font-weight:normal;font-size:20px">What we did:</p>';
    var groupList = Object.create(null);
    var willDoList = Object.create(null);
    for (var item of arr) {
        item.serviceName = item.serviceName || '&nbsp;';
        if (item.statusText == 'Not Started') {
            if (!(item.serviceName in willDoList)) {
                willDoList[item.serviceName] = [];
            }
            willDoList[item.serviceName].push(item);
        } else {
            if (!(item.serviceName in groupList)) {
                groupList[item.serviceName] = [];
            }
            groupList[item.serviceName].push(item);
        }
    }
    for (var service in groupList) {
        res += `<ul><li style="font-weight:normal;font-size:16px">${service}`;
        for (var story of groupList[service]) {
            res += `<ul style="font-weight:normal;font-size:13px"><li><a href="${story.href}">${story.storyId}</a> ${story.content} <span style="font-weight:bolder">(${story.statusText})<span></li></ul>`;
        }
        res += '</li></ul>';
    }
    var willDoStr = '';
    for (var willDoService in willDoList) {
        willDoStr += `<ul><li style="font-weight:normal;font-size:16px">${willDoService}`;
        for (var willDoStory of willDoList[willDoService]) {
            willDoStr += `<ul style="font-weight:normal;font-size:13px"><li><a href="${willDoStory.href}">${willDoStory.storyId}</a> ${willDoStory.content} <span style="font-weight:bolder">(${willDoStory.statusText})<span></li></ul>`;
        }
        willDoStr += '</li></ul>';
    }
    if (!willDoStr) {
        res += '<p style="font-weight:normal;font-size:20px">What we will do:</p><ul style="font-weight:normal;font-size:16px"><li>CS Portal &amp; WCF Shop Service support</li></ul>';
    } else {
        res += '<p style="font-weight:normal;font-size:20px">What we will do:</p>' + willDoStr;
    }
    return res;
}

async function createBranchThread() {
    // as a job thread,force async a at first
    await lymTM.async();
    var node = await lymTM.async($('#branch-name-prefix'));
    lymTM.nodeRemoveCallback(node, createBranchThread);
    var createBranchForm = $('#create-branch-form');
    var userName = $('#bb-bootstrap').data('current-user').displayName.split(' ')[0];
    var newBranchNameInput = $('input[name=branchName]');
    lymTM.reactSet(newBranchNameInput, `${userName}/${newBranchNameInput.val()}`);
    var currentBranchName = $('#select-branch>div').text();
    var repoName = $('#select-repository>div').text().replace('iherbllc/', '');
    var targetBranchName = lymTM.getDefaultBranch(repoName);
    if (currentBranchName != targetBranchName) {
        lymTM.reactSet($('#select-branch input'), targetBranchName);
        var item = await lymTM.async(() => $('body>div:last div:nth-child(2):first>div').filter((a, b) => b.textContent == targetBranchName));
        item.click();
    }

}
var filterLink = $(lymTM.createLink('Recent Work', lymTM.urls.JiraFilterLink)).attr('target', '_blank').css({ 'margin-left': '20px', 'font-size': '20px', 'font-weight': 'normal' });
var sprintLink = $(lymTM.createLink('Active Sprint', lymTM.urls.JiraSprintLink)).attr('target', '_blank').css({ 'margin-left': '20px', 'font-size': '20px', 'font-weight': 'normal' });
async function createMailLinkThread() {
    // as a job thread,force async a at first
    await lymTM.async();
    var h2 = await lymTM.async($('h2:contains(Jira Software issues)'));
    h2.append(sprintLink).append(filterLink);
    var rows = await lymTM.async($('tr[data-qa=jira-issue-row]'));
    // dashboard mail link
    if (location.href.includes('//bitbucket.org/dashboard/overview')) {
        lymTM.nodeRemoveCallback(rows.closest('table'), createMailLinkThread);
        var mailto = lymTM.getMailTo({ to: 'xiaoyu.luo@iherb.com', subject: 'Weekly Report ' + getFriday() });
        var mailLink = $(lymTM.createLink('Mail All', mailto)).attr('target', '_blank').css({ 'margin-left': '20px', 'font-size': '20px', 'font-weight': 'normal' });
        mailLink.click(async function () {
            var rows = $('tr[data-qa=jira-issue-row]');
            rows.closest('div').next('p').find('button').click();
            rows = await lymTM.async($('tr[data-qa=jira-issue-row]'));
            var arr = rows.map((a, b) => transferRowToModel(b)).sort(a => a.serviceName + a.storyId);
            console.log(arr);
            var res = makeWeeklyReport(arr);
            console.log(res);
            //             lymTM.copy(res);
            lymTM.setValue(lymTM.keys.GMailBody, res);
        });
        h2.append(mailLink);
    }
}
async function createMailLinkThreadEx() {
    // as a job thread,force async a at first
    await lymTM.async();
    // filter mail link
    if (location.href.includes('iherbglobal.atlassian.net/issues/?filter=')) {
        lymTM.nodeInsertCallback($('div.navigator-content'), createMailLinkThreadEx);
        if ($('div.issue-table-info-bar>div.aui-item>a[href^=mailto]').length) {
            return;
        }
        var rows = await lymTM.async($('tr.issuerow'));
        var mailto = lymTM.getMailTo({ to: 'xiaoyu.luo@iherb.com', subject: 'Weekly Report ' + getFriday() });
        var mailLink = $(lymTM.createLink('Mail All', mailto)).attr('target', '_blank').css({ 'margin-left': '20px', 'font-size': '20px', 'font-weight': 'normal' });
        mailLink.click(async function () {
            var rows = $('tr.issuerow');
            var arr = rows.map((a, b) => transferRowToModelEx(b)).sort(a => a.serviceName + a.storyId).toArray();
            console.log(arr);
            var res = makeWeeklyReport(arr);
            console.log(res);
            //             lymTM.copy(res);
            lymTM.setValue(lymTM.keys.GMailBody, res);
        });
        var node = await lymTM.async(() => $('tr.issuerow').closest('table').closest('div.issue-table-container').prev().children(':eq(0)'));
        if (!node.has('a[href^=mailto]').length) {
            node.append(mailLink);
        }
    }
}
function getFriday() {
    var date = new Date();
    var dayOfWeek = date.getDay();
    var friday = new Date(+date + (5 - dayOfWeek) * 86400000);
    return lymTM.dateFormat(friday, 'MM-dd');
}


