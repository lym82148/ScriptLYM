(function () {
    var time = 150;
    var res = window.prompt();
    var re = /<!--[\S\s]+?-->/g;
    res = res.replace(re, '');
    var appSettings = /<appSettings>[\s\S]+<\/appSettings>/;
    var config = appSettings.exec(res);
    var add = /=\s*"[^"]*/g;
    var keyArr = config.toString().match(add);;
    var rep = /=\s*"/;
    var obj = $('input[placeholder=键]').last();
    if (obj.val() == '' && keyArr.length % 2 == 0) {
        var i = 0;
        !function st() {
            if (i > 0) {
                obj = obj.parents('tr').find('input[type=text]:eq(1)').val(keyArr[i++].replace(rep, '')).change().end().next('tr').find('input[type=text]:eq(0)');
            }
            if (i < keyArr.length && obj.length > 0) {
                obj.val(keyArr[i++].replace(rep, '')).change();
                setTimeout(st, time);
            } else {
                var total = keyArr.length / 2;
                var realAdd = i / 2;
                if (total == realAdd) {
                    console.log('total: ' + total);
                } else {
                    console.error('total: ' + total + ' , add: ' + realAdd);
                }
            }
        }();
    }
})();