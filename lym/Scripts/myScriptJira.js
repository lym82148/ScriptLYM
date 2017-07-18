// ==UserScript==
// @name         JiraModule
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://suus0002.w10:8080/browse/*
// @grant        none
// ==/UserScript==

(function () {
    onkeydown = function (e) {
        if (e.key == 'b' && e.target.tagName == 'BODY') {
            if (!$('#summary').length) {
                $('#create-subtask').click();
            } else {
                $('#summary').val('[Server]');
                $('#customfield_10300').val('13773');
                $('#customfield_11200').val('11304');
                $('#timetracking_originalestimate').val('1d');
                $('#timetracking_remainingestimate').val('1d');
                $('#qf-create-another').prop('checked', true);
            }
        }
    };

})();