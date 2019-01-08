// ==UserScript==
// @name         JiraModule
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  try to take over the world!
// @author       You
// @match        https://suus0002.w10:8080/browse/*
// @match        https://suus0002.w10:8080/secure/RapidBoard.jspa*
// @grant        none
// ==/UserScript==

(function () {
    var setModule = function m() {
        if ($('#summary').length) {
            if ($('#issuetype-suggestions').find('a:contains("Sub-task")').length || $('#issuetype-field').val() == 'Sub-task') {
                if ($('#issuetype-field').val() == 'Sub-task') {

                } else {
                    $('#issuetype-suggestions').find('a:contains("Sub-task")').closest('li').addClass('active').siblings().removeClass('active').click();
                    setTimeout(changeToSubTask, 100);
                }
                $('#summary').val('[Server]');
                $('#customfield_10300').val('13773');
                $('#customfield_11200').val('11305');
                $('#timetracking_originalestimate').val('1d');
                $('#timetracking_remainingestimate').val('1d');
            }
            else {
                $('#issuetype-field').click();
                setTimeout(m, 100);
            }
        } else {
            setTimeout(m, 100);
        }
    };
    var changeToSubTask = function m() {
        if ($('#summary').val() == '') {
            $('#summary').val('[Server]');
            $('#customfield_10300').val('13773');
            $('#customfield_11200').val('11305');
            $('#timetracking_originalestimate').val('1d');
            $('#timetracking_remainingestimate').val('1d');
        } else {
            setTimeout(m, 100);
        }
    };
    var changeToStory = function m() {
        if ($('#summary').val() == '') {
            $('#summary').val('申请');
            $('#customfield_10300').val('13329');
            $('#customfield_11200').val('11305');
        } else {
            setTimeout(m, 100);
        }
    };
    var setModuleOps = function n() {
        if ($('#summary').length) {

            if ($('#issuetype-suggestions').find('a:contains("Story")').length || $('#issuetype-field').val() == 'Story') {
                if ($('#issuetype-field').val() == 'Story') {

                } else {
                    $('#issuetype-suggestions').find('a:contains("Story")').closest('li').addClass('active').siblings().removeClass('active').click();
                    setTimeout(changeToStory, 100);
                }
                $('#summary').val('申请');
                $('#customfield_10300').val('13329');
                $('#customfield_11200').val('11305');
            }

            else {
                $('#issuetype-field').click();
                setTimeout(n, 100);
            }
        } else {
            setTimeout(n, 100);
        }
    };
    var cSubTask = function () {
        if (!$('#summary').length) {
            if ($('#create-subtask').length) {
                $('#create-subtask').click();
                setTimeout(setModule, 100);
            } else {
                alert("无法创建子任务");
            }
        }
    }
    var cOps = function () {
        $('#create_link').click();
        setTimeout(setModuleOps, 100);
    }

    $('#create-subtask').click(function () { setTimeout(setModule, 100); });
    onkeydown = function (e) {
        if (e.key == 'b' && (e.target.tagName == 'BODY' || e.target.tagName == 'A')) {
            cSubTask();
        } else if (e.key == 'n' && (e.target.tagName == 'BODY' || e.target.tagName == 'A')) {
            cOps();
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
    if ($('#create-menu').length) {
        $('#create-menu').after($('#create-menu')[0].outerHTML).next().attr('id', 'slsdi').find('a').removeClass('create-issue').attr({ id: 'sldsls', href: null, accesskey: null, style: 'background-color:#e66363' }).html('Ops').click(cOps);
        if (!$('#summary').length) {
            if ($('#create-subtask').length) {
                $('#create-menu').after($('#create-menu')[0].outerHTML).next().attr('id', 'slsdi').find('a').removeClass('create-issue').attr({ id: 'sldsls', href: null, accesskey: null, style: 'background-color:#4eb7b7' }).html('Sub Task').click(cSubTask);
            }
        }
    }

})();