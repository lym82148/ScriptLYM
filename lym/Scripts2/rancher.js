// ==UserScript==
// @name         Rancher
// @namespace    http://tampermonkey.net/
// @version      7
// @description  link jenkins
// @author       Yiming Liu
// @include      https://rancher.iherb.io/*
// @include      https://rancher-nonprod.iherb.net/*
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


async function process(func, time) {
    setTimeout(repositoryFilterThread, 1000);
    var hash = location.hash.substr(1);
    if (hash) {
        var checkbox = await lymTM.async(() => $(`input[nodeid="${hash}"]:checkbox`));
        var link = checkbox.closest('tr').find('td[data-title^="Name:"]>a>i');
        link.click();
    }
    lymTM.runJob(relativeDivThread, 100);
    // generate configMap button
    // generate viewLog button
    lymTM.runJob(configMapThread, 100);
    lymTM.runJob(refreshLogBtnThread, 100);

    lymTM.runJob(configLinkThread, 100);
    lymTM.runJob(workLoadLinkThread, 100);


    var url = `${location.origin}/v3/project/${location.href.match(/\/([^\/]*:[^\/]*)\//)[1]}/workloads`;
    console.log(url);

}
async function workLoadLinkThread() {
    if (location.href.includes('/workload/')) {
        return;
    }
    var h1Text = $('h1').text().trim();
    if (!h1Text.includes(':')) { return; }
    var statusLabel = $('h1');
    if (!lymTM.alreadyDone(statusLabel)) {
        var id = h1Text.split(':').pop().trim();
        var namespace = $('label:contains(Namespace)').next('p').text();
        var nodeId = `deployment:${namespace}:${id}`;
        console.log('nodeId:', nodeId);
        var link = lymTM.createLink(id);
        link.target = '';
        link.style.fontSize = '';
        statusLabel.html(h1Text.split(':').shift() + ': ');
        statusLabel.append(link);
        link.onclick = async function () {
            var ev = document.createEvent('HTMLEvents');
            ev.initEvent('click', false, true);
            $('ul.nav-main a:contains(Workloads)').click();
            debugger;
            $(`tr.main-row:has(input[nodeid="${nodeId}"])`).find('td[data-title="Name: "]>a:not([name])>i').click();
        };
        lymTM.done(statusLabel);
    }
}
async function configLinkThread() {
    if (!location.pathname.endsWith('/workloads')) {
        return;
    }
    var statusLabel = await lymTM.async(() => $('table.sortable-table tr.main-row>td[data-title="Name: "]'));
    if (!lymTM.alreadyDone(statusLabel)) {
        var link = lymTM.createLink('config');
        link.style.float = 'right';
        link.name = 'tm_config_link'
        link.target = '';
        statusLabel.prepend(link);
        statusLabel.on('click', `[name=${link.name}]`, getConfigEvent);

        lymTM.done(statusLabel);
    }
}
async function gotoConfig(nodeId) {
    var ev = document.createEvent('HTMLEvents');
    ev.initEvent('mouseenter', false, true);
    $('a[role=button]:contains(Resources)').closest('div')[0].dispatchEvent(ev);
    var menu = await lymTM.async(() => $('#ember-basic-dropdown-wormhole li:contains(Config Maps)>a'));
    menu.click();
    $(`input[nodeid="${nodeId}"]`).closest('tr').children('td[data-title="Name: "]').find('a').click();
}
async function getConfigEvent() {
    var nodeId = $(this).closest('tr').find('input[nodeid]').attr('nodeid');
    if (nodeId) {
        nodeId = nodeId.replace('deployment:', '');
    }
    console.log('nodeId:', nodeId);
    await gotoConfig(nodeId);
}

async function refreshLogBtnThread() {
    var statusLabel = await lymTM.async(() => $('div.container-log .console-status'));
    if (!lymTM.alreadyDone(statusLabel)) {
        var btnWrap = $('div.container-log>.footer-actions');
        var closeBtn = btnWrap.children(':contains(Close)');
        var refreshLogBtn = closeBtn.clone();
        refreshLogBtn.removeClass('bg-primary').addClass('bg-warning').html('Refresh');
        refreshLogBtn.click(async function () {
            closeBtn.click();
            await showLog(lastClickBtn);
        });
        closeBtn.after(refreshLogBtn).after(' ');
        lymTM.done(statusLabel);
    }
}
async function relativeDivThread() {
    // jquery version low
    var title = await lymTM.async(() => $('h1:contains(Workload)'));
    if (!lymTM.alreadyDone(title)) {
        var rancherName = title.text().trim().match(/^Workload: (.*)/)[1];
        console.log('rancherName:', serviceName);
        var serviceName = lymTM.getServiceNameByJenkinsName(rancherName);
        console.log('serviceName:', serviceName);
        var relativeDiv = lymTM.generateRelativeLinks(serviceName, $, location.href);
        // 移除 rancher 链接 避免歧义
        relativeDiv.children(':contains(Rancher)').remove();
        relativeDiv.css({ 'float': 'left', 'width': '70%' }).children().css({ 'float': 'left' });
        title.closest('div').after(relativeDiv);
        lymTM.done(title);
    }
}
var lastClickBtn;
async function showLog(btn) {
    var ev = document.createEvent('HTMLEvents');
    ev.initEvent('mouseenter', false, true);
    btn.dispatchEvent(ev);
    ev.button = 0;// left button
    ev.initEvent('mousedown', false, true);
    btn.dispatchEvent(ev);
    // if old menu exist, wait a while
    if ($('span.pull-left:contains(View Logs)').length) {
        await lymTM.async(100);
    }
    var logBtn = await lymTM.async(() => $('span.pull-left:contains(View Logs)'), 1000);
    console.log(logBtn)
    logBtn.click();
}
async function configMapThread() {
    if (location.href.includes('/workload/')) {
        var bulkActionsDiv = await lymTM.async(() => $('.bulk-actions'));
        if (!lymTM.alreadyDone(bulkActionsDiv)) {
            var configLink = bulkActionsDiv.children().last().clone();
            configLink.html('configMap').removeClass('btn-disabled bg-default').addClass('bg-primary').css({ 'float': 'right' });
            configLink.click(async (e) => {
                var nodes = $('.bg-info label:contains("Namespace:")').closest('div')[0].childNodes;
                var namespace = [].map.call(nodes, (a, b) => a.nodeType == 3 ? a.textContent.trim() : null).filter(a => a).join();
                var id = $('h1').text().trim().replace('Workload: ', '');
                var nodeId = `${namespace}:${id}`;
                console.log(nodeId);
                await gotoConfig(nodeId);
            });
            await lymTM.async(() => bulkActionsDiv.closest('thead').width() != 0);
            bulkActionsDiv.parent().width(bulkActionsDiv.closest('thead').width());
            bulkActionsDiv.append(configLink).css('width', '100%');
            lymTM.done(bulkActionsDiv);
        }

        $('td .more-actions').each((a, b) => {
            if (!lymTM.alreadyDone(b)) {
                var viewLogLink = $('<a href="javascript:void(0);" class="icon icon-file pull-left" style="font-size: 18px;"></a>').mousedown(async function (e) {
                    if (e.button != 0) { return; }
                    var menuBtn = $(this).next()[0];
                    $(menuBtn).mousedown(function () {
                        lastClickBtn = this;
                    });
                    await showLog(menuBtn);
                });
                $(b).before(viewLogLink);
                lymTM.done(b);
            }
        });
    }
}

async function repositoryFilterThread() {
    if ($._data(document, 'events').keydown && $._data(document, 'events').keydown[0]) {
        $._data(document, 'events').keydown[0] = null;
    }
    var divWrap = lymTM.generateFilter($);
    var aRefresh = $(divWrap).find('[name=div-filter-refresh]').css({ 'cursor': 'default', 'text-decoration': 'none' }).attr('target', '_self').html('No repository match exactly.');
    let header = await lymTM.async(() => $('main'));
    header.children(`div[name=${divWrap.getAttribute('name')}]`).remove();
    header.prepend(divWrap);
}

