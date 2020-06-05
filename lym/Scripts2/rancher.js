// ==UserScript==
// @name         Rancher
// @namespace    http://tampermonkey.net/
// @version      2
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
    // jquery version low
    var title = await lymTM.async(() => $('h1:contains(Workload)'));
    var rancherName = title.text().trim().match(/^Workload: (.*)/)[1];
    console.log('rancherName:', serviceName);
    var serviceName = lymTM.getServiceNameByJenkinsName(rancherName);
    console.log('serviceName:', serviceName);
    var relativeDiv = lymTM.generateRelativeLinks(serviceName, $, location.href);
    relativeDiv.css({ 'float': 'left', 'width': '70%' }).children().css({ 'float': 'left' });
    title.closest('div').after(relativeDiv);
}