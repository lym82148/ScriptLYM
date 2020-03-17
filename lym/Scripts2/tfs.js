// ==UserScript==
// @name         Tfs
// @namespace    http://tampermonkey.net/
// @version      2
// @description  CI
// @author       Yiming Liu
// @match        https://tfs.iherb.net/tfs/iHerb%20Projects%20Collection/iHerbDev/Orders%20and%20Communications/_build/index*
// @grant        none
// ==/UserScript==

(async function wrap() {
    var time = lymTM.start();
    await process(wrap, time);
    time.end();
})();

async function process(wrap, time) {
    if (lymTM.getQueryString('definitionId') == 1053) {
        var buildList = await lymTM.async($('div.summary-build-row span.build-status-column'));
        // when DOM is changed, run script again
        lymTM.nodeRemoveCallback(buildList, func);

        buildList.before('<span style="display:table-cell"></span>');
        buildList.filter(':has([title=succeeded])').each(
            (a, b) => {
                var buildId = $(b).siblings('.build-detail-link-column').text();
                $(lymTM.createLink('deploy', `https://deploy.iherb.net/app#/projects/shop/overview#${buildId}`)).css({ 'font-size': '14px', 'margin-left': '4px' }).appendTo($(b).prev());
            }
        );
    }
}
