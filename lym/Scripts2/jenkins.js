// ==UserScript==
// @name         Jenkins
// @namespace    http://tampermonkey.net/
// @version      8
// @description  CI CD
// @author       Yiming Liu
// @match        https://jenkins-ci.iherb.net/*
// @match        https://jenkins.iherb.io/*
// @grant        none
// ==/UserScript==

(async function wrap() {
    // force async at first
    await lymTM.async();
    var time = lymTM.start();
    await process(wrap, time);
    // log execution time
    time.end();
})();
async function process(wrap, time) {
    // if search result is only one, then goto that result
    if (location.href.includes("/search/?q=")) {
        var resultLinks = $('#main-panel>ol>li>a');
        if (location.hash == '#refresh') {
            resultLinks.each((a, b) => {
                lymTM.open(`${b.href}#refresh`);
            });
            close();
        } else {
            if (resultLinks.length == 1) {
                await lymTM.maskDiv(null, () => resultLinks[0].click(), $);
            }
        }
        return;
    }
    // if login
    if (location.pathname.startsWith("/login")) {
        // todo
        var submitBtn = await lymTM.async($('form input:submit'));
        $('#remember_me').prop('checked', true);
        await lymTM.maskDiv(() => $('input[name=j_password]').val(), () => submitBtn.click());
        return;
    }
    // log page
    if (location.href.endsWith('/wfapi/changesets')) {
        var arr = JSON.parse($('pre').text());
        var commits = [null];
        arr.forEach(b => commits = commits.concat(b.commits, null));
        console.log('commits', commits);
        lymTM.setValue(location.href, commits);
        return;
    }

    // CI job name
    //     CIjobName = $('title').text().split(/\s|\(/).shift();
    //      CIjobName = $('title').text().replace(/(\w|\s|»)*» /,'').split(/\s|\(/).shift()
    CIjobName = jQuery('a[title="Back to Project"],a[title=Up]').attr('href').split('/').filter(a => a && a != '..').last().split(/\s|\(/).shift();
    console.log(`CIjobName:${CIjobName}`);
    if (!CIjobName) { return; }
    var serviceName = lymTM.getServiceNameByJenkinsName(CIjobName);
    console.log(`serviceName:${serviceName}`);
    if (serviceName) {
        var wrapDiv = lymTM.generateRelativeLinks(serviceName, $, location.href);
    }
    jQuery('#breadcrumbs').append(wrapDiv);
    //     jQuery('#main-panel').prepend(wrapDiv);
    // CI
    if (location.host == 'jenkins-ci.iherb.net') {
        setInterval(renderDeployLink, 1000);
        setInterval(getJenkinsLog, 1000);
    } else if (location.host == 'jenkins.iherb.io') { // CD
        //         var CDjobName = $('a.breadcrumbBarAnchor:last').text().split(/\s|\(/).shift();
        var CDjobName = CIjobName;
        console.log(`CDjobName:${CDjobName}`);
        var processList = Object.create(null);
        var deployList = Object.create(null);
        $('tr.build-row div.build-controls>div.build-badge').toArray().forEach((b) => {
            var $b = $(b);
            var td = $b.closest('td');
            var successResult = td.find('img').attr('title');
            if (!successResult) { return; }
            successResult = successResult.split(' ').first();
            if (successResult != 'Success') { return; }
            var buildNo = td.find('a.display-name').text().replace(/\u200B/g, '').trim();
            var textContent = td.children('div.desc').text().replace(/\u200b/g, '');
            var time = new Date(+td.children('div[time]').attr('time'));
            var envReg = textContent.match(/ env: (\S*)/);
            var env;
            if (envReg && envReg[1]) {
                env = envReg[1];
            }
            var versionReg = textContent.match(/Package: \S*:(\S*) /);
            var version;
            if (versionReg && versionReg[1]) {
                version = versionReg[1];
            }
            if (env && version) {
                if (env in deployList) {
                    return;
                }
                deployList[env] = { env, version };
                if (!(version in processList)) {
                    processList[version] = [];
                }
                processList[version].push({ env, time });
            }
        });
        console.log(processList);
        function refreshLogJob() {
            var options = jQuery('input[value=VERSION]').next('select').children();
            for (var j = 0; j < options.length; j++) {
                var option = options.eq(j);
                var packageNameKey = `${CDjobName}:${option.val()}`;
                var val = lymTM.getJenkinsLogFromCache();
                var version = packageNameKey.split(':').last();
                var dataTitle = option.attr('data-title');
                if (dataTitle && dataTitle != 'refresh to get log') {
                    continue;
                }
                dataTitle = '';
                var title = '';
                if (packageNameKey in val) {
                    if (val[packageNameKey]) {
                        var node = $(transferLog(val[packageNameKey]));
                        title = [].join.call(node.map((a, b) => b.textContent), '\n');
                        dataTitle = val[packageNameKey];
                    } else {
                        dataTitle = title = 'no changes';
                    }
                }
                if (!title) {
                    dataTitle = title = 'refresh to get log';
                    option.html(`☆ ${option.val()}`);
                } else {
                    option.html(`★ ${option.val()}`);
                }
                option.attr('data-title', dataTitle).attr('title', title);
                var envList = processList[option.val()];
                if (envList) {
                    var summary = '';
                    for (var envItem of envList) {
                        summary += ` 【${envItem.env} ${lymTM.dateFormat(envItem.time, 'MM-dd hh:mm')}】`;
                    }
                    option.html(option.html() + summary);
                }
                if (option.is(':selected')) {
                    refreshDiv();
                }
            }
        }
        var divCommit = $('<div></div>');
        function refreshDiv() {
            var title = jQuery('input[value=VERSION]').next().find(':selected').attr('data-title');
            if (title) {
                if (title.startsWith('[')) {
                    divCommit.html(transferLog(title));
                } else {
                    divCommit.html(`<div style='color:red'>${title}</div>`);
                }
            } else {
                divCommit.html('');
            }
        };
        refreshLogJob();
        setInterval(refreshLogJob, 300);
        jQuery('input[value=VERSION]').next().change(refreshDiv).after(divCommit);
        var curVersion = lymTM.getValue(CDjobName);
        var versionSelect = jQuery('input[value=VERSION]').next();
        if (curVersion) {
            versionSelect.val(curVersion);
            lymTM.removeValue(CDjobName);
        }
        versionSelect.change().css({ 'font-size': '22px' });
        var refreshBtn = $(lymTM.createButton('Refresh Log')).click(() => {
            var refreshLink = lymTM.getRefreshLogLink(serviceName);
            if (!refreshLink) {
                alert(`refreshLink not found for jenkinsName:${serviceName}`);
                return;
            }
            lymTM.open(refreshLink);
        });
        versionSelect.css({ 'padding-bottom': '7px' }).after(refreshBtn.css({ 'margin': '5px', 'display': 'inline' }));
    }

}
var CIJenkinsOrigin = new URL(lymTM.urls.CIJenkinsCSSearch).origin;
function transferLog(title) {
    var res = '';
    console.log(title)
    var arr = JSON.parse(title);
    if (arr.length) {
        for (var i = arr.length - 1; i >= 0; i--) {
            if (arr[i] == null) {
                res += '<hr/>';
                continue;
            }
            var splitArr = arr[i].message.trim().split(' ');
            var storyId = splitArr.shift();
            var wrapMessage = arr[i].message;
            if (/^\w*-\d*$/.test(storyId)) {
                wrapMessage = `<a href='${lymTM.urls.JiraStoryLink(storyId)}' target='_blank'>${storyId}</a> ${splitArr.join(' ')}`;
            }
            res += `<div>${lymTM.dateFormat(new Date(arr[i].timestamp), 'yyyy-MM-dd hh:mm:ss')}<span style='font-weight:bolder'> ${arr[i].authorJenkinsId} </span><span>${wrapMessage}</span> `;
            var item = lymTM.createLink(arr[i].commitId.substring(0, 7), `${CIJenkinsOrigin}${arr[i].consoleUrl}`);
            item.style.fontSize = '13px';
            res += item.outerHTML;
            res += '</div>';
        }
    }
    return res;
}
// page has already used $
var $ = jQuery;
var CIjobName;
async function renderDeployLink() {
    $('tr.build-row div.build-controls>div.build-badge').each(async (a, b) => {
        var $b = $(b);
        var buildNo = $b.closest('td').find('a.display-name').text().replace(/\u200B/g, '').trim();
        var version = $b.parent().next().text().split(':').pop().trim().replace(/\u200b/g, '');
        // "".trim() return object is String {""}
        if (!version.length) { return; }
        var commitNode = $(`div.jobName:contains(${buildNo})~div.stage-start-box>div:last`);
        // deploy link not in left column
        var leftNeedDeploy = !$b.find('a:contains(deploy)').length;
        // deploy link not in right table
        var rightNeedDeploy = !commitNode.find('a:contains(deploy)').length;
        if (leftNeedDeploy || rightNeedDeploy) {
            var deployLink = lymTM.createLink('deploy', lymTM.getDeployUrlByDefinitionId(CIjobName));
            deployLink.style.float = 'left';
            $(deployLink).click(() => lymTM.setValue(CIjobName, version));
            if (leftNeedDeploy) {
                $b.prepend(deployLink);
            }
            if (rightNeedDeploy) {
                if (leftNeedDeploy) {
                    var cloneDeployLink = $(deployLink).clone().css('margin', '0px 15px').click(() => lymTM.setValue(CIjobName, version));
                    commitNode.append(cloneDeployLink);
                } else {
                    commitNode.append($(deployLink).css('margin', '0px 15px'));
                }
            }
        }
    });
}
var finishPackages = [];
var processingPackages = [];
async function getJenkinsLog() {
    var changeList = await lymTM.async($('td.stage-start .stage-start-box:has(div.changeset-box)'));
    var allPackages = changeList.prev().text().replace(/\u200b/g, '').split('#').filter(a => a);
    if (location.hash == '#refresh') {
        if (!allPackages.filter(a => !finishPackages.includes(a)).length) {
            close();
        }
    }
    for (var i = 0; i < changeList.length; i++) {
        var item = changeList.eq(i);
        var buildId = item.prev().text().trim().replace('#', '').replace(/\u200b/g, '');
        var packageName = $(`.pane.build-name:has([href$="/${buildId}/"])`).siblings('.desc').text().trim().replace(/\u200b/g, '');
        if (item.find('.no-changes').length) {
            lymTM.setJenkinsLogNoChange(`${location.pathname}${buildId}`, `${packageName}`);
            if (!finishPackages.includes(buildId)) {
                finishPackages.push(buildId);
            }
            continue;
        }
        else if (buildId && packageName) {
            if (!processingPackages.includes(buildId)) {
                processingPackages.push(buildId);
                await lymTM.getJenkinsLogEx(`${location.pathname}${buildId}`, () => {
                    if (!finishPackages.includes(buildId)) {
                        finishPackages.push(buildId);
                    }
                    if (processingPackages.includes(buildId)) {
                        processingPackages.splice(processingPackages.indexOf(buildId), 1);
                    }
                }, `${packageName}`);
            }
        } else {
            if (!finishPackages.includes(buildId)) {
                finishPackages.push(buildId);
            }
        }
    }
}
