// ==UserScript==
// @name         JiraModule
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  try to take over the world!
// @author       You
// @match        http://suus0002.w10:8080/browse/*
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
        }
    };

})();