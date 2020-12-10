// ==UserScript==
// @name         Sonar
// @namespace    http://tampermonkey.net/
// @version      2
// @description  try to take over the world!
// @author       You
// @match        https://sonarcloud.io/project/configuration?analysisMode=BitbucketManual*
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
    await updateToken();
}
async function updateToken() {
    console.log('looking for labelLan');
    var labelLan = await lymTM.async($('label[for=build__make]:contains("C, C++ or ObjC")'));
    labelLan.click();
    console.log('looking for labelOs');
    var labelOs = await lymTM.async($('label[for=os__linux]:contains("Linux")'));
    labelOs.click();
    console.log('looking for tokenLi');
    var tokenLi = await lymTM.async($('li.big-spacer-bottom:has(code:contains(SONAR_TOKEN))'));
    var editButton = await lymTM.async(() => tokenLi.next().find('button:last'));
    editButton.click();
    console.log('looking for tokenInput');
    var tokenInput = await lymTM.async($('div[aria-label="Provide a token"] input:text'));
    lymTM.reactSet(tokenInput, "1b4b8904879cb44bec13b17f11e6261319169470");
    console.log('looking for submitBtn');
    var submitBtn = tokenInput.closest('form').find('button:submit');
    submitBtn.click();
    $('li.big-spacer-bottom:has(code:contains(SONAR_TOKEN))').next().find('code').css('color', 'red');
    var mask = $('<div style="background-color: #ade2ff99;position: fixed;z-index: 9999;top: 20%;left: 30%;padding:5px;font-size:20px;"></div>');
    var text = $("<span>Set token=<span style='color:red'>1b4b8904879cb44bec13b17f11e6261319169470</span> success!<br/>Run CI now.</span>");
    var buttonOk = $('<button style="font-size:20px;margin:5px;margin-left:45%;display:block;">Ok</button>');
    var seconds = 10;
    buttonOk.html(`OK ${seconds}`);
    var timestamp = +new Date() + seconds * 1000;
    buttonOk.click(async function () {
        timestamp = null;
        mask.hide();
    });
    setInterval(function () {
        if (timestamp) {
            var counter = Math.floor((timestamp - new Date()) / 1000);
            if (counter <= 0) {
                timestamp = null;
                buttonOk.click();
                return;
            }
            buttonOk.html(`Ok ${counter}`);
        }
    }, 100);
    mask.append(text, buttonOk);
    $('body').append(mask);
}