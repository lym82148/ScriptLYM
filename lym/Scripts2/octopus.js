// ==UserScript==
// @name         Octopus
// @namespace    http://tampermonkey.net/
// @version      6
// @description  CD
// @author       Yiming Liu
// @match        https://deploy.iherb.net/app
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

var buildId;
async function process(wrap, time) {

    // 等待内容加载
    await lymTM.async($('main div.sticky-outer-wrapper~'));
    // 有可能 job 再次调用
    if (!buildId) {
        buildId = lymTM.getValue(lymTM.keys.TfsBuildId);
        console.log(`buildId:${buildId}`);
        // buildId 只能包含数字和.
        if (!/^\d|\.$/.test(buildId)) {
            buildId = '';
        }
        lymTM.removeValue(lymTM.keys.TfsBuildId);
    }
    var node = await lymTM.async($('div.sticky-outer-wrapper:last~'));
    lymTM.nodeRemoveCallback(node, wrap);
    // 在关键元素 buildLink 加载完成后 计时开始
    time.reset();
    tfsThread();
    if (buildId) {
        var buildLink = await lymTM.async($(`td div>a:contains("${buildId}"):not(:has(div))`));
        // 列头所在行 1 ~ n
        var index = buildLink.closest('td').css({ 'border': `solid ${colors.border} 1px`, 'border-right': 'none' }).closest('tr').css('background-color', colors.background).index();
        console.log(`index:${index}`);
        if (index < 0) { return; }

        // 内容所在行 0 ~ n-1
        var row = buildLink.closest('div:has(table)').next().find(`tr:eq(${index - 1})`);
        row.css('background-color', colors.background).children('td').css({ 'border': `solid ${colors.border} 1px`, 'border-left': 'none', 'border-right': 'none' });
    }

}
var colors = { 'background': '#f1ffff', 'border': '#7777ff' };
async function tfsThread() {
    var list = $('a[target=_self]:not(:has(div)):not([title])');
    for (var i = 0; i < list.length; i++) {
        var b = list[i];
        var buildId = b.textContent;
        if (!buildId) { return; }
        var buildIdEx = buildId.match(/\d{4,}/g)[0];
        if (!buildIdEx) { return; }
        await lymTM.getTfsLogEx(buildIdEx, (title) => b.title = title);
    }
}