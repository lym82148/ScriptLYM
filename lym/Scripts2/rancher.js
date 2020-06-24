// ==UserScript==
// @name         Rancher
// @namespace    http://tampermonkey.net/
// @version      3
// @description  link jenkins
// @author       Yiming Liu
// @include      https://rancher.iherb.io/*
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
    lymTM.runJob(relativeDivThread, 100);
    // generate configMap button
    // generate viewLog button
    lymTM.runJob(configMapThread, 100);
    lymTM.runJob(refreshLogBtnThread, 100);

    var url = `${location.origin}/v3/project/${location.href.match(/\/([^\/]*:[^\/]*)\//)[1]}/workloads`;
    console.log(url);

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
            configLink.click((e) => {
                var newUrl = location.href.replace(/\/workload\/deployment:/, '/config-maps/');
                lymTM.open(newUrl);
            });
            bulkActionsDiv.append(configLink).css('width', '100%');
            lymTM.done(bulkActionsDiv);
        }

        $('td .more-actions').each((a, b) => {
            if (!lymTM.alreadyDone(b)) {
                var viewLogLink = $('<a href="javascript:void(0);" class="icon icon-file pull-left" style="font-size: 18px;"></a>').mousedown(async function () {
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
