// ==UserScript==
// @name         Octopus
// @namespace    http://tampermonkey.net/
// @version      2
// @description  CD
// @author       Yiming Liu
// @match        https://deploy.iherb.net/app
// @grant        none
// ==/UserScript==

(async function wrap() {
    debugger;
    var time = lymTM.start();
    await process(wrap, time);
    time.end();
})();

async function process(wrap, time) {

    // 等待内容加载
    await lymTM.async($('main div.sticky-outer-wrapper~'));
    // 计时开始
    time.reset();

    var buildId = location.hash.split('#').pop();
    console.log(`buildId:${buildId}`);

    // buildId 只能包含数字和.
    if (!/^\d|\.$/.test(buildId)) {
        return;
    }

    var buildLink = $(`a:contains("${buildId}"):not(:has(div))`);
    // 列头所在行 1 ~ n
    var index = buildLink.closest('td').css({ 'border': `solid ${colors.border} 1px`, 'border-right': 'none' }).closest('tr').css('background-color', colors.background).index();
    console.log(`index:${index}`);
    if (index < 0) { return; }

    // 内容所在行 0 ~ n-1
    var row = buildLink.closest('div:has(table)').next().find(`tr:eq(${index - 1})`);
    row.css('background-color', colors.background).children('td').css({ 'border': `solid ${colors.border} 1px`, 'border-left': 'none', 'border-right': 'none' });

}
var colors = { 'background': '#f1ffff', 'border': '#7777ff' };
