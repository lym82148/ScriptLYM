// ==UserScript==
// @name         CxyQueryViolation
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  try to take over the world!
// @author       You
// @match        */cooper/search/gettestdata.jsp*
// @grant        none
// ==/UserScript==

(function () {
    var left = parent.$('iframe[name=LeftFrame]');
    var right = parent.$('iframe[name=violationquery.jsp]');
    if (left.length == 0) {
        console.warn('iframe[name=LeftFrame] null');
        return;
    }
    if (right.length == 0) {
        $('li>a', left[0].contentDocument).filter(function (a, b) { return b.innerHTML == '自助查询'; }).click();
        var stm = function () {
            $('li>a', left[0].contentDocument).filter(function (a, b) { return b.innerHTML == '获取测试车牌'; }).click();
        };
        setTimeout(stm, 300);
        right = parent.$('iframe[name=violationquery.jsp]');
        if (right.length == 0) {
            console.warn('iframe[name=violationquery.jsp] null');
            return;
        }
    }
    var rowClick = function () {
        var arr = $(this).find('td');
        $('li>a', left[0].contentDocument).filter(function (a, b) { return b.innerHTML == '自助查询'; }).click();
        var inputArr = $('input[type=text]', right[0].contentDocument);
        inputArr.filter('[name=CarNumber]').val(arr.eq(1).text());
        inputArr.filter('[name=CarCode]').val(arr.eq(3).text());
        inputArr.filter('[name=CarDriver]').val(arr.eq(4).text());
        inputArr.parents('form').find('span.btn').click();
    };
    $('table:eq(0)').delegate('table.gt-table tr', 'dblclick', null, rowClick);

})();