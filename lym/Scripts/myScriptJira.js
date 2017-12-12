// ==UserScript==
// @name         JiraModule
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  try to take over the world!
// @author       You
// @match        http://suus0002.w10:8080/browse/*
// @match        http://suus0002.w10:8080/secure/RapidBoard.jspa*
// @grant        none
// ==/UserScript==

(function () {
    var setModule = function m() {
        if ($('#summary').length) {
            $('#summary').val('[Server]');
            $('#customfield_10300').val('13773');
            $('#customfield_11200').val('11305');
            $('#timetracking_originalestimate').val('1d');
            $('#timetracking_remainingestimate').val('1d');
            //$('#qf-create-another').prop('checked', true);
        } else {
            setTimeout(m, 100);
        }
    };
    var setModuleOps = function n() {
        if ($('#summary').length) {
            // $('#issuetype-field').val('Story');
            $('#issuetype-field').next().find('a:contains("Story")').click();
            $('#summary').val('申请');
            $('#customfield_10300').val('13329');
            $('#customfield_11200').val('11305');
        } else {
            setTimeout(n, 100);
        }
    };
    $('#create-subtask').click(function () { setTimeout(setModule, 100); });
    onkeydown = function (e) {
        if (e.key == 'b' && (e.target.tagName == 'BODY' || e.target.tagName == 'A')) {
            if (!$('#summary').length) {
                if ($('#create-subtask').length) {
                    $('#create-subtask').click();
                    setTimeout(setModule, 100);
                } else {
                    alert("无法创建子任务");
                }
            }
        } else if (e.key == 'n' && (e.target.tagName == 'BODY' || e.target.tagName == 'A')) {
            $('#create_link').click();
            setTimeout(setModuleOps, 100);
        }
    };
    var omc = 'omc.cn.support <omc.cn.support@bmwgroup.com>; ';
    var cc = 'DL-bmwconnected-bumper <bmwconnected-bumper@list.bmw.com>';
    var content = $('#description-val').text().trim().replace(/\r\n/g, "\n").replace(/\n/g, "\r\n\t");
    if (content == 'Click to add description') {
        content = '';
    }
    var subject = $('#summary-val').text().trim();
    var body = 'Hi ops team:\r\n\r\n\t';
    body += subject + "\r\n\r\n\t";
    body += "Jira任务\r\n\t" + location.href + "\r\n\r\n\t";
    body += content;
    body = encodeURIComponent(body);
    subject = encodeURIComponent(subject);
    var template = '<ul class="toolbar-group pluggable-ops"><li class="toolbar-item"><a id="auto-mail" class="toolbar-trigger"  href="mailto:' + omc + '&cc=' + cc + '&subject=' + subject + '&body=' + body + '"><span class="trigger-label" style="color:rgb(255, 76, 76);">Mail To Ops</span></a></li></ul>';
    if ($('#customfield_10300-val').text().trim() == "Clutch") {
        $('.toolbar-split-left').append(template);
    }


})();