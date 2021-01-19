// ==UserScript==
// @name         GMail
// @namespace    http://tampermonkey.net/
// @version      5
// @description  send weekly report
// @author       Yiming Liu
// @match        https://mail.google.com/mail/u/0/*
// @match        https://calendar.google.com/calendar/*
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
    if (location.href.startsWith('https://mail.google.com/mail/u/0/')) {
        var key = lymTM.keys.GMailBody;
        var res = lymTM.getValue(key);
        lymTM.removeValue(key);
        var bodyDiv = await lymTM.async($('div[aria-label="Message Body"]'));
        await lymTM.async($('div[role=toolbar]:visible'));
        bodyDiv.html(res);
    }
    lymTM.runJob(OOOThread, 100);
}
async function OOOThread() {
    if (!location.href.startsWith('https://calendar.google.com/calendar/u/0/r/eventedit')) {
        return;
    }
    var saveBtn = await lymTM.async($('div[role=button]:contains(Save)'));
    await lymTM.doOnceBy(saveBtn, async () => {
        var input = $('input:text[aria-label=Guests]');
        input.click();
        var addOOOBtn = $('<div><span style="background: #e38100;color: #fff;display: inline-block;padding: 0 24px;border-radius: 4px;line-height: 36px;cursor: pointer;width: 58px;">Add OOO</span></div>');

        addOOOBtn.click(async () => {
            var name = $('div[aria-label="Account Information"]>div>div>div:eq(1)').text() || '';
            name = name.split(' ').shift();
            // set title
            lymTM.reactSet($('input:text[aria-label=Title]'), `${name}'s OOO`);
            var guest = "cs-portal-dev";
            var listbox = await lymTM.async(() => input.closest('#tabGuests').find('div[role="listbox"]'));
            // search for guest
            lymTM.reactSet(input, guest);
            // wait for search result
            var option = await lymTM.async(() => {
                input.click();
                return listbox.find(`div[role=option]:visible:has(span:contains("${guest}")):first`);
            });
            // chose first result
            option.click();
            var chosenResult = $('#xGstLst>div[aria-label="Guests invited to this event."]:visible');
            var expandBtn = await lymTM.async(() => chosenResult.find(`div[aria-label="${guest}"] div[aria-label^="Expand "]`));
            // expand result
            expandBtn.click();
            // optional btns
            var optionalBtns = $('div[data-tooltip="Mark optional"]:visible');
            // except me
            [].shift.call(optionalBtns);
            optionalBtns.click();
        });
        saveBtn.before(addOOOBtn);
    });
}

