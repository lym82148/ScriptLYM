// ==UserScript==
// @name         Bitbucket
// @namespace    http://tampermonkey.net/
// @version      29
// @description  pull request approver、build link、deploy link
// @author       Yiming Liu
// @include      mailto:*
// @match        https://bitbucket.org/*
// @match        https://iherbglobal.atlassian.net/secure/RapidBoard.jspa*
// @match        https://iherbglobal.atlassian.net/browse/*
// @match        https://iherbglobal.atlassian.net/rest*
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
    lymTM.runJob(pullrequestNotifyThread, 100);
    setTimeout(repositoryFilterThread, 0);
    setTimeout(refreshRepositoryListThread, 0);
    lymTM.runJob(rapidBoardStoryTransmitThread, 300);
    lymTM.runJob(findRepositoryTableThread, 300);
    lymTM.runJob(updateRepositoryLinkThread, 300);
    if (location.href.startsWith('https://bitbucket.org/dashboard/repositories')) {
        findInputAndFocus();
    }
    // error url from source tree
    if (location.href.startsWith('https://bitbucket.org//')) {
        $('#error').prepend($(lymTM.createLabel('Redirecting')).css('font-size', '36px'));
        location.href = location.href.replace('https://bitbucket.org//', 'https://bitbucket.org/');
        return;
    }
    //     if(location.href.includes('config')){
    //         var jenkinsNameFromConfigPage = location.href.match(/.*\/(.*)\/override\/.*/)[1];
    //         var serviceNameFromConfigPage = lymTM.getServiceNameByJenkinsName(jenkinsNameFromConfigPage);
    //         var relativeDiv = lymTM.generateRelativeLinks(serviceNameFromConfigPage,$,location.href);
    //         var breadFromConfigPage = await lymTM.async(()=>$('ol.aui-nav-breadcrumbs,div:has(div>a[type]):not(:has(div>div>a[type]),:has(div[data-qa]))'));
    //         breadFromConfigPage.append(relativeDiv);
    //     }
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
            //             if (arr.length != 2) {
            //                 console.log(`error when split config '${a}' by ': '`);
            //                 return;
            //             }
            if (arr[0].trim() in existConfigs) {
                console.warn(`duplicated config '${arr[0]}: ${existConfigs[arr[0]]}' '${a}'`);
            } else {
                if (arr.length > 2) {
                    let key = arr.shift();
                    let value = arr.join(': ').trim();
                    value = trimValue(value);
                    existConfigs[key.trim()] = value;
                }
                else if (arr.length < 2) {
                    console.log(`error when split config '${a}' by ': '`);
                    return;
                }
                else {
                    let value = arr[1].trim();
                    value = trimValue(value);
                    existConfigs[arr[0].trim()] = value;
                }
            }
        })

        var jenkinsName = location.href.replace(/^.*\/src\/(master|\w*)\//, '').split('/').shift();
        //         jenkinsName = jenkinsName.replace(/^backoffice-/, '');
        console.log(jenkinsName);
        var copyConfigStr;
        var copyConfigSortStr;
        var processing = false;
        var link = $(lymTM.createButton('', () => {
            if (processing) { return; } console.log(copyConfigStr);
            lymTM.copy(copyConfigStr);
            link.fadeOut(200);
            setTimeout(() => link.fadeIn(200), 200)
        })).css({ 'display': 'inline', 'outline': 'none', 'margin-left': '40px' });
        var lastProjectConfigs;
        var checkboxSmartFilter = $('<label><input type="checkbox"/>SmartFilter</label>');
        checkboxSmartFilter.css({ 'background-color': 'lightgrey', 'padding': '2px 5px 2px 0px', 'font-size': '16px', 'margin-left': '15px' });
        checkboxSmartFilter.children().prop('checked', true).change(() => {
            if (lastProjectConfigs) {
                MergeConfig(lastProjectConfigs);
            }
        });
        var linkSort = $(lymTM.createButton('', () => {
            if (processing) { return; } console.log(copyConfigSortStr);
            lymTM.copy(copyConfigSortStr);
            linkSort.fadeOut(200);
            setTimeout(() => linkSort.fadeIn(200), 200)
        })).css({ 'display': 'inline', 'outline': 'none', 'margin-left': '40px' });
        var selectBranchAction = async function () {
            processing = true;
            link.fadeOut();
            linkSort.fadeOut();
            ClearRenderDiff();
            var branchName = this.value;
            var projectConfigs = Object.create(null);
            var configUrl = lymTM.getProjectConfigFile(jenkinsName, branchName);
            console.log(configUrl);
            await lymTM.get(configUrl, (res) => {
                res = res.replace(/\n\s*\/\/.*/g, '');
                var json = JSON.parse(res);
                projectConfigs = lymTM.transferConfigJson(json);
            });
            var configUrlDev = lymTM.getProjectConfigFileDev(jenkinsName, branchName);
            console.log(configUrlDev);
            await lymTM.get(configUrlDev, (res) => {
                res = res.replace(/\n\s*\/\/.*/g, '');
                var json = JSON.parse(res);
                $.extend(projectConfigs, lymTM.transferConfigJson(json));
            });
            //             console.log("projectConfigs",projectConfigs);
            MergeConfig(projectConfigs);
            link.fadeIn();
            linkSort.fadeIn();
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
            var configLines = $('div.CodeMirror-code>div:contains(configmap:)+div:contains(data:)').nextAll();
            if (!configLines.length) {
                configLines = $('div.CodeMirror-code>div:contains(data:)').nextAll();
            }
            if (!configLines.length) {
                configLines = $('div.CodeMirror-code').children();
            }
            var keyList = [];
            configLines.each((index, line) => {
                var $line = $(line);
                var preChild = $line.find('pre').children();
                var key = preChild.text().replace(/: .*$/, '').replace(/\u200B/g, '').trim();
                keyList.push(key);
                var value = preChild.text().replace(/^.*?: /, '').trim();
                value = trimValue(value);
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
                        if (key == 'ASPNETCORE_ENVIRONMENT') {
                        } else {
                            // 未变更状态 多余的 key
                            preChild.css('background-color', redundantTransparent).attr('title', 'the config is not in project');
                        }
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
                            preChild.css('background-color', redundantTransparent).attr('title', `the value in project is 【${entity[1]}】`);
                            if ($._data(preChild[0], 'events') == null || !$._data(preChild[0], 'events').dblclick) {
                                preChild.dblclick(((a) => () => {
                                    lymTM.copy(a);
                                    lymTM.alert(`copy value ${a}`)
                                })(entity[1]));
                            }
                        } else {
                            preChild.css('background-color', '').attr('title', '').find('span:lt(2)').css('background-color', '');
                        }
                    }
                } else {
                    // 新增的 key
                    preChild.css('background-color', newTransparent).attr('title', 'new config');
                }

            });
            var errKeyList = keyList.filter(i => keyList.indexOf(i) != keyList.lastIndexOf(i));
            var fileName = location.pathname.split('/').pop();
            var env = 'test';
            var envConfig = 'Development';
            var envName = 'test';
            if (fileName.includes('test')) {
                env = 'test'; envConfig = 'Development'; envName = 'test';
            } else if (fileName.includes('preprod')) {
                env = 'preprod'; envConfig = 'Staging'; envName = 'preprod';
            } else if (fileName.includes('central')) {
                env = 'central'; envConfig = 'Production'; envName = 'prod';
            }
            var commitBtn = $('button.save-button:contains(Commit)');
            if (jenkinsNameFromConfigPage && commitBtn.length && !commitBtn.data('add-click-tm')) {
                commitBtn.click(async () => {
                    var textarea = await lymTM.async(() => $('#id_message:visible'));
                    textarea.val(`${envName} ${jenkinsNameFromConfigPage} `);
                });
                commitBtn.data('add-click-tm', 'add');
            }
            configLines.each((index, line) => {
                var $line = $(line);
                var lineTag = $line.children('div>div');
                var preChild = $line.find('pre').children();
                var lineText = preChild.text().replace(/\u200B/g, '');
                var key = lineText.replace(/: .*$/, '').trim();
                var value = lineText.replace(/^.*?: /, '').trim();
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
                }
                else if (key == 'ASPNETCORE_ENVIRONMENT' && value != envConfig) {
                    lineTag.addClass('aui-message aui-message-warning').css(cssObj).attr('title', `error value ${value}, should be ${envConfig} `);
                }
                else if (value > Math.pow(2, 31) - 1) {
                    lineTag.addClass('aui-message aui-message-warning').css(cssObj).attr('title', `number ${value} is too large for int32, should be '${value}' `);
                }
                else if (value == '*') {
                    lineTag.addClass('aui-message aui-message-warning').css(cssObj).attr('title', 'error value *, should be "*" ');
                } else if (/ConnectionString/i.test(key) && /Data *Source|Server/i.test(value)) {
                    lineTag.addClass('aui-message aui-message-warning').css(cssObj).attr('title', 'ConnectionString should be in scret');
                } else if (/^https?:\/\/.*iherb.*/.test(value.toLowerCase()) && !value.toLowerCase().includes(env)) {
                    if ((key == 'CorsSettings__AllowOrigins')
                        || value.includes('https://s3.images-iherb.com')
                        || value.includes('//iherb.okta.com/oauth2')
                        || envConfig == 'Production' &&
                        (value.includes('//iherb.zendesk.com/api')
                            || value.includes('//secauthext.iherb.net/core')
                            || value.includes('//secauthext.iherb.net/core/resources')
                            || value.includes('https://catalog.app.iherb.com/')
                            || value.includes('https://orders-returns-csportal.central.iherb.io')
                            || value.includes('https://fraud.iherb.net')
                            || value.includes('https://order.iherb.net')
                            || value.includes('https://ordermodification.iherb.net')
                            || value.includes('https://warehousegateway.iherb.net')
                            || value.includes('https://backoffice-search.iherb.net')
                            || value.includes('//catalog.app.iherb.com')
                            || value.includes('//www.iherb.com')
                            || value.includes('https://csportal.iherb.net')
                            || value.includes('https://cs-portal.iherb.net')
                            || value.includes('backoffice.iherb.net'))
                    ) {
                    } else {
                        lineTag.addClass('aui-message aui-message-warning').css(cssObj).attr('title', `url does not contain ${env}`);
                    }
                }
                else {
                    lineTag.removeClass('aui-message aui-message-warning').attr('title', '');
                }
            });
        }
        function MergeConfig(projectConfigs) {
            lastProjectConfigs = projectConfigs;
            projectNewAddConfig = new Map(Object.keys(projectConfigs).filter(x => !(x in existConfigs)).map(x => [x, projectConfigs[x]]));
            existRedundantConfig = new Map(Object.keys(existConfigs).filter(x => !(x in projectConfigs)).map(x => [x, existConfigs[x]]));
            differentConfig = new Map(Object.keys(projectConfigs).filter(
                x => x in existConfigs
                    && existConfigs[x] != projectConfigs[x].toString()
                    && existConfigs[x] != `'${projectConfigs[x].toString()}'`
                    && existConfigs[x] != `"${projectConfigs[x].toString()}"`
            ).map(x => [x, [existConfigs[x], projectConfigs[x]]]));
            console.log("existRedundantConfig", existRedundantConfig);
            console.log("projectNewAddConfig", projectNewAddConfig);
            console.log("differentConfig", differentConfig);
            // do not order by key, order by updated time
            // projectConfigs will not overwrite existConfigs
            //             $.extend(projectConfigs, existConfigs);
            //             var keysArr = new Array(...Object.keys(projectConfigs)).sort();
            //             console.log(keysArr);
            var configSortStr = '';
            var keysArr = new Array(...Object.keys(existConfigs)).sort();
            for (let key of keysArr) {
                let value = existConfigs[key];
                if (key == "ASPNETCORE_ENVIRONMENT") {
                    configSortStr = `    ${key}: ${value}\n` + configSortStr;
                } else {
                    configSortStr += `    ${key}: ${value}\n`;
                }
            }
            //             for (key of Object.keys(projectConfigs)) {
            //                 if(key in existConfigs){continue;}
            //                 value = projectConfigs[key];
            //                 configStr += `    ${key}: ${value}\n`;
            //             }
            var configStr = '';
            var smartFilter = checkboxSmartFilter.children().prop('checked');
            var keyFilterList = [
                "UserAuthorizationSyncConfig__SyncIntervalSeconds",
                "UserAuthorizationSyncConfig__UserAuthorizationEndpointUri",
            ];
            var smartFilterRes = "";
            var configCount = 0;
            var smartFilterCount = 0;
            var configStrTitle = "";
            for (let entity of projectNewAddConfig) {
                let value = entity[1].toString();
                if (value == '*' ||
                    value.startsWith('{') && value.endsWith('}')) {
                    value = `'${value}'`;
                }
                if (smartFilter) {
                    if (keyFilterList.includes(entity[0])
                        || entity[0].startsWith("ConnectionStrings__")) {
                        smartFilterCount++;
                        smartFilterRes += `+    ${entity[0]}: ${value}\n`;
                        continue;
                    }
                }
                configCount++;
                configStr += `    ${entity[0]}: ${value}\n`;
                configStrTitle += `+    ${entity[0]}: ${value}\n`;
            }
            checkboxSmartFilter[0].childNodes[1].nodeValue = `SmartFilter ${smartFilterCount} config`;
            checkboxSmartFilter.attr('title', smartFilterRes);
            if (projectNewAddConfig.size) {
                link.html(`Copy ${configCount} new config`).attr('title', configStrTitle);
            } else {
                link.html(`No new config`);
            }
            linkSort.html(`Copy sort exist config`);
            copyConfigSortStr = headConfigs + configSortStr;
            copyConfigStr = configStr;
        }
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
        wrapDivEx.append(hr).append(selectBranch).append(div).append(useCustomer).append(link).append(checkboxSmartFilter).append(linkSort);
        $('#source-path>div:last-child').append(wrapDivEx);

        selectBranch.change(selectBranchAction);
        selectBranch.change();

        var textarea = await lymTM.async(() => $('div.CodeMirror textarea'));
        // 支持中文输入
        textarea[0].onkeyup = async () => { await lymTM.async(100); RenderDiff() };
        // 支持删除
        textarea[0].onkeydown = RenderDiff;
        // 支持输入
        textarea[0].oninput = RenderDiff;
        // 支持右键粘贴
        textarea[0].onpaste = RenderDiff;
        // 保底方案
        lymTM.runJob(RenderDiff, 1000);
        var styleMock = $('<style>body.adg3 .aui-message::after{margin-top:0px;left:39px;top:0px;cursor:default;}</style>')
        $('body').prepend(styleMock);
        //         return;
    }

    // job
    createBranchThread();
    // not need await
    lymTM.runJob(createMailLinkThread, 300);
    lymTM.runJob(createMailLinkThreadEx, 300);
    lymTM.runJob(copyLinkThread, 300);
    // 当前用户Id
    var curUserId = $('#bb-bootstrap').data('atlassian-id');
    sprintLink.attr('href', lymTM.urls.JiraSprintLink(curUserId));
    // "ol.aui-nav-breadcrumbs" for page pull-requests/new
    // "div:has(div>a[type]):not(:has(div>div>a[type]))" for page pull-requests/
    // ":has(div[data-qa])" for page repositories
    var bread = await lymTM.async(() => $('ol.aui-nav-breadcrumbs,div:has(div>a[type]):not(:has(div>div>a[type]),:has(div[data-qa]),:has(button))'));
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

    var jenkinsNameFromConfigPage;
    if (serviceName.endsWith('config')) {
        var match1 = location.href.match(/.*\/(.*)\/override\/.*/);
        if (match1) {
            jenkinsNameFromConfigPage = match1[1];
        } else {
            var match2 = location.href.match(/.*\/(.*)\//);
            jenkinsNameFromConfigPage = match2[1];
            if (jenkinsNameFromConfigPage == 'commits') {
                jenkinsNameFromConfigPage = $('div.commit-message>p:first').text().split(' ')[1];
            }
        }
        console.log('jenkinsNameFromConfigPage:', jenkinsNameFromConfigPage);
        serviceName = lymTM.getServiceNameByJenkinsName(jenkinsNameFromConfigPage);
    }
    // Build Links Deploy Links
    var wrapDiv = lymTM.generateRelativeLinks(serviceName, $, location.href);
    if (!bread.is(':visible')) {
        bread = await lymTM.async(() => $('ol.aui-nav-breadcrumbs,div:has(div>a[type]):not(:has(div>div>a[type]),:has(div[data-qa])):visible'));
    }
    await lymTM.doOnceBy(bread, () => bread.append(wrapDiv));
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
        await lymTM.async(500);// remove this may cause choose branch error
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

    let submitAndNotifyButton = $('<button class="aui-button aui-button-warning">Submit and notify</button>');
    let submitPrButton = $('#submitPrButton');
    submitPrButton.after(submitAndNotifyButton);
    submitAndNotifyButton.click(function () {
        let key = serviceName + $('span.select2-chosen:even').text();
        console.log(key);
        lymTM.setValue(key, key);
        //         submitPrButton.click();
    });

    // 预热搜索列表
    await search(approveUsers, true);
    // 等待搜索结果加载准备
    await lymTM.async(3000);

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
function trimValue(value) {
    if ((/^'.*'$/).test(value)) {
        return value.substr(1, value.length - 2);
    }
    return value;
}
async function findInputAndFocus() {
    var searchInput = await lymTM.async(() => $('#search-repository-input'));
    searchInput.focus();
}

async function search(list, isWarmUp) {
    var input = await lymTM.async(() => $('#react-select-BitbucketPullRequestReviewers-input'));
    input.focus();
    for (var i in list) {
        console.log('search for username:' + list[i].userName);
        lymTM.reactSet(input, list[i].userName);
        if (!isWarmUp) {
            // wait for 1000ms at most
            let btn = await lymTM.async(() => $(`.reviewers-react-container .fabric-user-picker__option>span>div>span>span:not([role]):contains("${list[i].userName}")`), 1000);
            btn.click();
        }
    }
    input.blur();
}
function transferRowToModel(row) {
    var link = $(row).find('td a');
    var href = link.attr('href');
    var textNode = link.prop('lastChild').getElementsByTagName('span')[1];
    var arr = (textNode.wholeText || textNode.textContent).split('-');
    var serviceName = arr.length == 1 ? 'Backend' : arr[0].trim();
    var content = (textNode.wholeText || textNode.textContent).replace(serviceName, '').replace('-', '').trim();
    var storyId = link.find('span:first').text();
    var statusText = link.end().find('td>div>span').text();
    return { storyId, href, serviceName, content, statusText };
}
function transferRowToModelEx(row) {
    var $row = $(row);
    var link = $row.find('td a.issue-link');
    var href = location.origin + link.attr('href');
    var textNode = $row.find('td.summary a.issue-link').text();
    var arr = textNode.split('-');
    var serviceName = arr.length == 1 ? 'Backend' : arr[0].trim();
    var content = textNode.replace(serviceName, '').replace('-', '').trim();
    var storyId = link.data('issue-key');
    var statusText = $row.find('td.status').text().trim();
    return { storyId, href, serviceName, content, statusText };
}
function transferRowToXls(row) {
    var $row = $(row);
    var link = $row.find('td a.issue-link');
    var href = location.origin + link.attr('href');
    var textNode = $row.find('td.summary a.issue-link').text();
    var arr = textNode.split('-');
    var serviceName = arr.length == 1 ? 'Backend' : arr[0].trim();
    var content = textNode.replace(serviceName, '').replace('-', '').trim();
    var storyId = link.data('issue-key');
    var statusText = $row.find('td.status').text().trim();
    return { storyId, href, serviceName, content, statusText, title: textNode };
}
function makeWeeklyReport(arr) {
    var res = '<p style="font-weight:normal;font-size:20px">What we did:</p>';
    var groupList = Object.create(null);
    var willDoList = Object.create(null);
    for (var item of arr) {
        item.serviceName = item.serviceName || '&nbsp;';
        if (item.statusText == 'Not Started' || item.statusText == 'Sprint Ready') {
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
function openPostWindow(url, params) {
    var newWin = window.open(),
        formStr = '';
    //设置样式为隐藏，打开新标签再跳转页面前，如果有可现实的表单选项，用户会看到表单内容数据
    formStr = '<form style="visibility:hidden;" method="POST" action="' + url + '">' +
        '<input type="hidden" name="params" value="' + params + '" />' +
        '</form>';
    newWin.document.body.innerHTML = formStr;
    newWin.document.forms[0].submit();
    return newWin;
}
var timestamp;
var buttonOk;
async function pullrequestNotifyThread() {
    if (location.href.includes('/pull-requests/')) {
        var body = $('body');
        if (lymTM.alreadyDone(body)) {
            if (timestamp) {
                var counter = Math.floor((timestamp - new Date()) / 1000);
                if (counter <= 0) {
                    timestamp = null;
                    buttonOk.click();
                    return;
                }
                buttonOk.html(`Ok ${counter}`);
            }
            return;
        }
        var serviceName = await lymTM.async(() => $('div.css-1xaaz5m').html());
        var keyNode = await lymTM.async(() => $('[data-qa=pr-branches-and-state-styles]:first>div:even>div>div'));
        var key = serviceName + keyNode.text();
        if (lymTM.getValue(key)) {
            var seconds = 20;
            timestamp = +new Date() + seconds * 1000;
            console.log(key);
            lymTM.removeValue(key);
            var mask = $('<div style="background-color: #ade2ff99;position: fixed;z-index: 9999;top: 104px;left: 75%;padding:5px;font-size:20px;">Notify?</div>');
            buttonOk = $('<button style="font-size:20px;margin:5px">Ok</button>');
            buttonOk.html(`Ok ${seconds}`);
            var buttonCancel = $('<button style="font-size:20px;margin:5px">Cancel</button>');
            buttonOk.click(async function () {
                lymTM.ajax({
                    url: "https://chat.googleapis.com/v1/spaces/AAAAgv0QhHM/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=imYSxIxeds3PwaT-m1C18TyAcmO2WNFIEkTEJAcL5FY%3D",
                    method: 'post', data: JSON.stringify({ text: `PR ${location.href}` })
                });
                timestamp = null;
                mask.hide();
            });
            buttonCancel.click(function () {
                timestamp = null;
                mask.hide();
            });
            mask.append(buttonOk, buttonCancel);
            body.append(mask);
        }
        lymTM.done(body);
    }
}
async function updateRepositoryLinkThread() {
    if (location.href.includes('bitbucket.org/dashboard')) {
        var links = await lymTM.async(() => $('a[href$="/dashboard/repositories"]'));
        for (var i = 0; i < links.length; i++) {
            let link = links.eq(i);
            if (lymTM.alreadyDone(link)) { continue; }
            link.click(findInputAndFocus);
            lymTM.done(link);
        }
    }
}
// async function focusOnFirstRow() {
//     var table = this;
//     console.log($(table).find('tr').length);
// }
var repositoryTable;
async function findRepositoryTableThread() {
    var color = 'lightgrey';
    if (location.href.includes('bitbucket.org/dashboard/repositories')) {
        await lymTM.doOnceBy(document, function () {
            $(document).keydown(function (e) {
                if (e.keyCode != 38 && e.keyCode != 40 && e.keyCode != 13) { return; }
                var cur = $(repositoryTable).find('tbody>tr[style*="background-color"]');
                var next;
                if (e.keyCode == 13) {
                    var link = cur.find('a>span:first');
                    if (e.ctrlKey) {
                        lymTM.openActive(location.origin + link.closest('a').attr('href'));
                    } else {
                        link.click();
                    }
                    return;
                }
                if (e.keyCode == 38) {
                    next = cur.prev();
                    if (next.length == 0) {
                        next = cur.siblings().last();
                    }
                } else if (e.keyCode == 40) {
                    next = cur.next();
                    if (next.length == 0) {
                        next = cur.siblings().first();
                    }
                }
                cur.css('background-color', '');
                next.css('background-color', color);
            });
        });

        repositoryTable = await lymTM.async(() => $('table:first'));
        await lymTM.doOnceBy(repositoryTable, function () {
            $(repositoryTable).find('tbody>tr:first').css('background-color', color);
            //             lymTM.nodeRemoveCallback(repositoryTable, focusOnFirstRow);
        });
    }
}
async function rapidBoardStoryTransmitThread() {
    if (location.href.includes('/secure/RapidBoard')) {
        let workLogInput = await lymTM.async(() => $('#issue-workflow-transition #log-work-time-logged:visible'));
        let estimate = +$('div.ghx-selected aui-badge.ghx-estimate').text();
        if (estimate > 0) {
            await lymTM.doOnceBy(workLogInput, function () {
                lymTM.reactSet(workLogInput, `${estimate}d`)
            });
        } else {
            await lymTM.doOnceBy(workLogInput, function () {
                workLogInput.attr('placeholder', '0 point')
            });
        }
    }
    else if (location.href.includes('iherbglobal.atlassian.net/browse/') || location.href.includes('iherbglobal.atlassian.net/rest')) {
        let workLogInput = await lymTM.async(() => jQuery('#issue-workflow-transition #log-work-time-logged:visible'));
        let estimate = +jQuery('h2:contains(Story Points)').closest('div').next().find('span:last').text();
        if (estimate > 0) {
            await lymTM.doOnceBy(workLogInput, function () {
                lymTM.reactSet(workLogInput, `${estimate}d`)
            });
        } else {
            await lymTM.doOnceBy(workLogInput, function () {
                workLogInput.attr('placeholder', '0 point')
            });
        }
    }
}
async function repositoryFilterThread(input) {
    var divWrap = lymTM.generateFilter($, input);
    var aRefresh = $(divWrap).find('[name=div-filter-refresh]')[0];
    aRefresh.onclick = async (e) => {
        e.preventDefault();
        var jq = $(aRefresh).hide(100);
        await refreshRepositoryListThread(divWrap.firstChild.innerHTML.split(' ').pop());
        jq.show(100);
    };
    let header;
    if (location.href.includes('//bitbucket.org/dashboard')) {
        var preCon = await lymTM.async(() => $('h2:contains("Jira issues")'));
        header = await lymTM.async(() => $('div[data-testid=Content]'));
        header.children(`div[name=${divWrap.getAttribute('name')}]`).remove();
        header.prepend(divWrap);
    }
    else if (location.href.includes('/pull-requests/')) {
        header = await lymTM.async(() => $('main>header:first'));
        header.children(`div[name=${divWrap.getAttribute('name')}]`).remove();
        header.prepend(divWrap);
    }
    else if (location.href.includes('//bitbucket.org/')) {
        header = await lymTM.async(() => $('div:has(div>header:not([id])):last'));
        header.children(`div[name=${divWrap.getAttribute('name')}]`).remove();
        header.prepend(divWrap);
    }
    if (lymTM.getQueryString('fileviewer') == 'file-view-default' && lymTM.getQueryString('mode') == 'edit') {
        await lymTM.async(() => document.activeElement.tagName == 'TEXTAREA');
        await lymTM.async(500);
        document.activeElement.blur();
        window.scrollBy(0, -300);
    }
}
async function refreshRepositoryListThread(refresh) {
    var repositoryList = lymTM.getValue(lymTM.keys.RepositoryList);
    if (!repositoryList || refresh) {
        var list = [];
        var curRes;
        var callApi = async function (page) {
            await lymTM.get(lymTM.urls.RepositoryListApi(page), a => {
                var nameList = a.values.map(b => {
                    var res = Object.create(null);
                    res.name = b.name;
                    res.link = b.links.html.href;
                    return res;
                });
                list.push(...nameList);
                curRes = a;
            });
        }
        var page = 1;
        do {
            await callApi(page);
            page++;
        } while (curRes.values.length == 100);
        lymTM.setValue(lymTM.keys.RepositoryList, list, 10 * 365 * 86400 * 1000);
        if (refresh) {
            await repositoryFilterThread(refresh);
        }
    }
}
// var refreshCount = 0;
// async function refreshWhenDashboardInactive(){
//     console.log(refreshCount);
//     if(location.href.endsWith('//bitbucket.org/dashboard/overview')){
//         var hours = new Date().getHours();
//         if(hours<8 || hours>18){return;}
//         if(document.hidden){
//             refreshCount++;
//             if(refreshCount>120){
//                 refreshCount = 0;
//                 location.reload();
//             }
//         }else{
//             //refreshCount = 0;
//         }
//     }
// }
async function createBranchThread() {
    // as a job thread,force async a at first
    await lymTM.async();
    var node = await lymTM.async(() => $('#branch-name-prefix'));
    lymTM.nodeRemoveCallback(node, createBranchThread);
    var createBranchForm = $('#create-branch-form');
    var userName = $('#bb-bootstrap').data('current-user').displayName.split(' ')[0].toLowerCase();
    var newBranchNameInput = $('input[name=branchName]');
    if (!newBranchNameInput.val().startsWith(`${userName}/`)) {
        lymTM.reactSet(newBranchNameInput, `${userName}/${newBranchNameInput.val().replace(/\//g, '-')}`);
    }
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
var sprintLink = $(lymTM.createLink('Active Sprint', '')).attr('target', '_blank').css({ 'margin-left': '20px', 'font-size': '20px', 'font-weight': 'normal' });
async function createMailLinkThread() {
    // as a job thread,force async a at first
    await lymTM.async();
    var h2 = await lymTM.async(() => $('h2:contains(Jira issues)'));
    if (!h2.find(sprintLink).length) {
        h2.append(sprintLink).append(filterLink);
    }
    var rows = await lymTM.async(() => $('tr[data-qa=jira-issue-row]'));
    rows.on('click', '[name=hide]', function () { var node = $(this).closest('tr').hide(300); setTimeout(() => node.remove(), 300) });
    rows.each((b, a) => {
        var $a = $(a).find('div>span>span[role=img]').closest('div');
        if (!$a.next().length) {
            $a.after($('<a name="hide"href="javascript:void(0);">hide</a>').css({ 'color': '#ff6e6e', 'margin-left': '10px', 'padding': '10px', 'font-size': '22px' }));
        }
    });
    // dashboard mail link
    if (location.href.includes('//bitbucket.org/dashboard/overview')) {
        lymTM.nodeRemoveCallback(rows.closest('table'), createMailLinkThread);
        var mailto = lymTM.getMailTo({ to: 'tony.qian@iherb.com', subject: 'Weekly Report ' + getFriday() });
        var mailLink = $(lymTM.createLink('Mail All', mailto)).attr('target', '_blank').css({ 'margin-left': '20px', 'font-size': '20px', 'font-weight': 'normal', 'display': 'none' });
        mailLink.click(async function () {
            var rows = $('tr[data-qa=jira-issue-row]');
            rows.closest('div').next('p').find('button').click();
            rows = await lymTM.async(() => $('tr[data-qa=jira-issue-row]'));
            var arr = rows.map((a, b) => transferRowToModel(b)).sort(a => a.serviceName + a.storyId);
            console.log(arr);
            var res = makeWeeklyReport(arr);
            console.log(res);
            //             lymTM.copy(res);
            lymTM.setValue(lymTM.keys.GMailBody, res);
        });
        if (!h2.find('a:contains(Mail)').length) {
            h2.append(mailLink);
        }
    }
}
async function createMailLinkThreadEx() {
    // as a job thread,force async a at first
    await lymTM.async();
    // filter mail link
    if (location.href.includes('iherbglobal.atlassian.net/issues/?filter=')) {
        lymTM.nodeInsertCallback($('div.navigator-content'), createMailLinkThreadEx);
        var rows = await lymTM.async(() => $('tr.issuerow'));
        rows.on('click', '[name=hide]', function () { var node = $(this).closest('tr').hide(300); setTimeout(() => node.remove(), 300); });
        rows.each((a, b) => {
            var row = $(b).find('td.summary>p:first');
            if (!row.find('a[name=hide]').length) {
                row.append($('<a name="hide"href="javascript:void(0);">hide</a>').css({ 'color': '#ff6e6e', 'font-size': '22px', 'float': 'right', 'margin-right': '5px' }));
            }
        });

        var mailto = lymTM.getMailTo({ to: 'tony.qian@iherb.com', subject: 'Weekly Report ' + getFriday() });
        var mailLink = $(lymTM.createLink('Mail All', mailto)).attr('target', '_blank').css({ 'margin-left': '20px', 'font-size': '20px', 'font-weight': 'normal', 'display': 'none' });
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
async function copyLinkThread() {
    // as a job thread,force async a at first
    await lymTM.async();
    // filter mail link
    if (location.href.includes('iherbglobal.atlassian.net/issues/?filter=')) {
        lymTM.nodeInsertCallback($('div.navigator-content'), copyLinkThread);
        var rows = await lymTM.async(() => $('tr.issuerow'));
        rows.on('click', '[name=hide]', function () { var node = $(this).closest('tr').hide(300); setTimeout(() => node.remove(), 300); });
        rows.each((a, b) => {
            var row = $(b).find('td.summary>p:first');
            if (!row.find('a[name=hide]').length) {
                row.append($('<a name="hide"href="javascript:void(0);">hide</a>').css({ 'color': '#ff6e6e', 'font-size': '22px', 'float': 'right', 'margin-right': '5px' }));
            }
        });

        var link = $(lymTM.createLink('Weekly Report ' + getFriday(), 'https://docs.google.com/spreadsheets/d/1lsaju8rtKsPUlQK7xR0LsUyIY9iwOjmbkNe_iBNU-TQ/edit#gid=1294713185')).attr('target', '_blank').css({ 'margin-left': '20px', 'font-size': '20px', 'font-weight': 'normal' });
        link.click(async function () {
            var rows = $('tr.issuerow');
            var arr = rows.map((a, b) => transferRowToXls(b)).sort((a, b) => {
                if (a.serviceName + a.statusText == b.serviceName + b.statusText) {
                    return 0;
                }
                return 2 * (a.serviceName + a.statusText > b.serviceName + b.statusText) - 1;
            }).toArray();
            console.log(arr);
            var res = '<table>';
            for (let i in arr) {
                let item = arr[i];
                if (item.statusText == 'Not Started') { continue; }
                res += `<tr><td><a href="${item.href}">${item.storyId}</a></td><td>${item.title}</td><td>(${item.statusText})</td></tr>`;
            }
            res += '</table>';
            console.log(res);
            lymTM.copy(res, 'html');
            //             lymTM.setValue(lymTM.keys.GMailBody, res);
        });
        var node = await lymTM.async(() => $('tr.issuerow').closest('table').closest('div.issue-table-container').prev().children(':eq(0)'));
        if (!node.has('a:contains(Weekly Report)').length) {
            node.append(link);
        }
    }
}
function getFriday() {
    var date = new Date();
    var dayOfWeek = date.getDay();
    var friday = new Date(+date + (5 - dayOfWeek) * 86400000);
    return lymTM.dateFormat(friday, 'MM-dd');
}


