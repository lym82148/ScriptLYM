// ==UserScript==
// @name         Tfs
// @namespace    http://tampermonkey.net/
// @version      8
// @description  CI
// @author       Yiming Liu
// @match        https://tfs.iherb.net/tfs/iHerb%20Projects%20Collection/iHerbDev/*_build/index*
// @match        https://tfs.iherb.net/tfs/iHerb%20Projects%20Collection/*/_apis/build/builds/*/logs/3
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
    if (location.href.endsWith('/logs/3')) {
        var tag = lymTM.transLog($('pre').text());
        lymTM.setValue(location.href, tag);
    }
    var definitionId = lymTM.getQueryString('definitionId');
    var deployUrl = lymTM.getDeployUrlByDefinitionId(definitionId);
    console.log(`definitionId:${definitionId}`);
    console.log(`deployUrl:${deployUrl}`);
    // 不在配置中
    if (!deployUrl) { return; }
    var projectId = __vssPageContext.webContext.project.id;
    var buildList = await lymTM.async($('div.summary-build-row span.build-status-column'));
    // when DOM is changed, run script again
    lymTM.nodeRemoveCallback(buildList, wrap);
    // clean old table cell
    $('div.summary-build-row span[mycell]').remove();
    buildList.before('<span mycell style="display:table-cell"></span>');
    buildList.filter(':has([title=succeeded])').each(
        (a, b) => {
            var $b = $(b);
            var buildId = $b.siblings('.build-detail-link-column').text().replace('#', '');
            var deployLink = $(lymTM.createLink('deploy', deployUrl));
            deployLink.click(() => { lymTM.setValue(lymTM.keys.TfsBuildId, buildId) });
            deployLink.css({ 'font-size': '14px', 'margin-left': '4px' }).appendTo($b.prev());
            var buildIdEx = $b.closest('div').find('span.build-detail-link-column>a').attr('href').replace(/^.*buildId=/, '').split('&').shift();
            lymTM.getTfsLog(buildIdEx, (title) => deployLink.prop('title', title));
        }
    );

}
