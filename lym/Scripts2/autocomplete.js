// ==UserScript==
// @name         AutoComplete
// @namespace    http://tampermonkey.net/
// @version      2
// @description  try to take over the world!
// @author       You
// @match        https://cs-portal.backoffice.iherbtest.net/*
// @match        https://cs-portal.iherb.net/*
// @match        https://*/swagger/*
// @match        https://*/*/swagger/*
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
    lymTM.runJob(customerIdThread, 100);
}
var customerIdListId;
async function customerIdThread() {
    if (location.href.includes('//cs-portal.backoffice.iherbtest.net/')
        || location.href.includes('//cs-portal.iherb.net/')) {
        let customerIds = $('div[data-qa-element*="customer-id"] :input').toArray();
        for (let i in customerIds) {
            let item = $(customerIds[i]);
            await lymTM.doOnceBy(item, function () {
                var idList = lymTM.getCustomerIdList((a) => lymTM.reactSet(item, a));
                item.closest('div').after(idList);
                var icon = lymTM.getDropDownIcon();
                item.after(icon);
                var eventItems = item.closest('div').click((e) => { idList.toggle(); e.stopPropagation(); });
                $('*').not(eventItems).not(eventItems.children()).click(() => idList.hide());
            });

        }
    }
    else if (location.href.includes('/swagger/')) {
        let customerIds = $('tr[data-param-name=customerId] :text').add($('tr:has(span.prop-format:contains(uuid)) :text')).toArray();
        for (let i in customerIds) {
            let item = $(customerIds[i]);
            await lymTM.doOnceBy(item, function () {
                var idList = lymTM.getCustomerIdList((a) => lymTM.reactSet(item, a));
                idList.css('width', item.css('width'));
                item.nextAll(`div[name=${idList.attr('name')}],svg`).remove();
                item.after(idList);
                var icon = lymTM.getDropDownIcon();
                icon.css({ 'position': 'relative', 'left': '-22px', 'top': '2px' });
                item.after(icon);
                var eventItems = item.add(icon).click((e) => { idList.toggle(); e.stopPropagation(); });
                $('*').not(eventItems).not(eventItems.children()).click(() => idList.hide());
            });

        }
    }

}