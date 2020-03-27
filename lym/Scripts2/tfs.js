// ==UserScript==
// @name         Tfs
// @namespace    http://tampermonkey.net/
// @version      6
// @description  CI
// @author       Yiming Liu
// @match        https://tfs.iherb.net/tfs/iHerb%20Projects%20Collection/iHerbDev/Orders%20and%20Communications/_build/index*
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

    var definitionId = lymTM.getQueryString('definitionId');
    var deployUrl = lymTM.getDeployUrlByDefinitionId(definitionId);
    console.log(`definitionId:${definitionId}`);
    console.log(`deployUrl:${deployUrl}`);
    if (deployUrl) {
        var buildList = await lymTM.async($('div.summary-build-row span.build-status-column'));
        // when DOM is changed, run script again
        lymTM.nodeRemoveCallback(buildList, wrap);
        // clean old table cell
        $('div.summary-build-row span[mycell]').remove();
        buildList.before('<span mycell style="display:table-cell"></span>');
        buildList.filter(':has([title=succeeded])').each(
            (a, b) => {
                var buildId = $(b).siblings('.build-detail-link-column').text().replace('#', '');
                var deployLink = $(lymTM.createLink('deploy', deployUrl));
                deployLink.click(() => { lymTM.setValue(lymTM.keys.TfsBuildId, buildId) });
                deployLink.css({ 'font-size': '14px', 'margin-left': '4px' }).appendTo($(b).prev());
            }
        );
    }
}
