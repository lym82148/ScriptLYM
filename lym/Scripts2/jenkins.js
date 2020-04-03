// ==UserScript==
// @name         Jenkins
// @namespace    http://tampermonkey.net/
// @version      4
// @description  CI CD
// @author       Yiming Liu
// @match        https://jenkins-ci.iherb.net/*
// @match        https://jenkins.iherb.io/*
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
    // if search result is only one, then goto that result
    if (location.href.includes("/search/?q=")) {
        var resultLinks = $('#main-panel>ol>li>a');
        if (resultLinks.length == 1) {
            var jobId = setTimeout(() => resultLinks[0].click(), 1000);
            $('html').css('background-color', '#475fa585');
            $('*').click(() => {
                $('html').css('background-color', '');
                clearTimeout(jobId);
            });
        }
        return;
    }

    // CI job name
    CIjobName = $('title').text().split(/\s|\(/).shift();
    console.log(`CIjobName:${CIjobName}`);
    if (!CIjobName) { return; }
    var serviceName = lymTM.getServiceNameByJenkinsName(CIjobName);
    console.log(`serviceName:${serviceName}`);
    if (serviceName) {
        var wrapDiv = lymTM.generateRelativeLinks(serviceName, $, location.href);
    }
    jQuery('#main-panel').prepend(wrapDiv);
    // CI
    if (location.host == 'jenkins-ci.iherb.net') {
        setInterval(renderDeployLink, 1000);
    } else if (location.host == 'jenkins.iherb.io') { // CD
        var CDjobName = $('a.breadcrumbBarAnchor:last').text().split(/\s|\(/).shift();
        console.log(CDjobName);
        jQuery('input[value=VERSION]').next().val(lymTM.getValue(CDjobName)).change();
        lymTM.removeValue(CDjobName);
    }
}
// page has already used $
var $ = jQuery;
var CIjobName;
async function renderDeployLink() {
    $('tr.build-row div.build-controls>div.build-badge').each(async (a, b) => {
        var $b = $(b);
        var buildNo = $b.closest('td').find('a.display-name').text().trim();
        var version = $b.parent().next().text().split(':').pop().trim();
        // "".trim() return object is String {""}
        if (!version.length) { return; }
        var commitNode = await lymTM.async($(`div.jobName:contains(${buildNo})~div.stage-start-box>div:last`));
        // deploy link not in left column
        var leftNeedDeploy = !$b.find('a:contains(deploy)').length;
        // deploy link not in right table
        var rightNeedDeploy = !commitNode.find('a:contains(deploy)').length;
        if (leftNeedDeploy || rightNeedDeploy) {
            var deployLink = lymTM.createLink('deploy', lymTM.getDeployUrlByDefinitionId(CIjobName));
            deployLink.style.float = 'left';
            $(deployLink).click(() => lymTM.setValue(CIjobName, version));
            if (leftNeedDeploy) {
                $b.prepend(deployLink);
            }
            if (rightNeedDeploy) {
                if (leftNeedDeploy) {
                    var cloneDeployLink = $(deployLink).clone().css('margin', '0px 15px').click(() => lymTM.setValue(CIjobName, version));
                    commitNode.append(cloneDeployLink);
                } else {
                    commitNode.append($(deployLink).css('margin', '0px 15px'));
                }
            }
        }
    });
}
