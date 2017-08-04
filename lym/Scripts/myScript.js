// ==UserScript==
// @name         CheckConfig
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  try to take over the world!
// @author       You
// @match        https://portal.azure.cn/*
// @match        https://omcops.bmw.com.cn/Configuration/DeployConfiguration/NewChange*
// @grant        none
// ==/UserScript==

(function ds() {
    //narr
    var time = 150;
    var omc = $('pre').find('[class=str]').map(function (a, b) { if (b.innerHTML.indexOf('"appsetting_') == 0) return b.innerHTML.replace('"appsetting_', '').replace('"', ''); }).toArray();
    if (!("r" in window)) {
        Object.defineProperty(window, "r", {
            Configurable: true,
            get: function () { ds(); }
        });
        if (omc.length) {
            var auto = true;
            setTimeout('console.log("输入 r 检测配置\\r\\n输入 v 切换自动补充");', 500);
            var keyupFun = function () {
                var appsetting = 'appsetting_';
                if (auto) {
                    if (this.value.indexOf(appsetting) != 0) {
                        this.value = appsetting + this.value;
                    }
                } else {
                    if (this.value.indexOf(appsetting) == 0) {
                        this.value = this.value.replace(appsetting, '');
                    }
                }
            };
            $('input.param-name').keyup(keyupFun);
            Object.defineProperty(window, "v", {
                Configurable: true,
                get: function () {
                    auto = !auto;
                    var res;
                    $('input.param-name').keyup();
                    if (auto) {
                        res = ("已开启自动补充");
                    } else {
                        res = ("已关闭自动补充");
                    }
                    return res;
                }
            });
            var btn = document.createElement('input');
            btn.type = 'button';
            btn.value = 'Add Config';
            btn.style.color = 'red';
            btn.onclick = function () { var x = r; };
            $('h1').append(btn);
        } else {
            setTimeout('console.log("输入 r 更新配置");', 5000);
        }
        return;
    }
    var res = window.prompt();
    if (!res) { return; }
    var re = /<!--[\S\s]+?-->/g;
    res = res.replace(re, '');
    var appSettings = /<appSettings>[\s\S]+<\/appSettings>/;
    var config = appSettings.exec(res);
    if (config == null) { config = res; }
    var add = /=\s*"[^"]*/g;
    var keyArr = config.toString().match(add);
    var rep = /=\s*"/;

    if (omc.length && keyArr.length % 2 == 0) {
        var keyArr2 = keyArr.filter(function (a, b) { return b % 2 == 0; }).map(function (a) { return a.replace(rep, ''); });
        var diff = function (a, b) {
            return a.filter(function (i) { return b.indexOf(i) < 0; });
        };

        var cj1 = diff(omc, keyArr2);
        var cj2 = diff(keyArr2, omc);
        var cj2str = cj2.join('"\r\n"');
        var cj1str = cj1.join('"\r\n"');
        if (cj2str == '') {
            console.log("没有需要增加的配置。\r\n ");
        } else {
            cj2str = '"' + cj2str + '"';
            console.warn("增加的配置：");
            console.log(cj2str);
        }
        if (cj1str == '') {
            console.log("没有多余的配置。\r\n ");
        } else {
            cj1str = '"' + cj1str + '"';
            console.warn("多余的配置：");
            console.log(cj1str);
        }
        for (var i = 0; i < keyArr.length; i += 2) {
            var key = keyArr[i].replace(rep, '');
            if (omc.indexOf(key) < 0) {
                $('input.param-name').val('appsetting_' + key);
                $('input.param-value').val(keyArr[i + 1].replace(rep, ''));
                $('.btn-add-queue').click();
            }
        }
        var h = $(document).height() - $(window).height();
        $(document).scrollTop(h);
        return;
    }

    var obj = $('input[placeholder=键]').last();
    var origin = obj.parents('table').find('span[data-bind="text: value"]').map(function (a, b) { if (!(a % 4) && b.innerHTML != '') return b; });
    if (obj.val() == "" && keyArr.length % 2 == 0) {

        var i = 0, addCount = 0, changeCount = 0, oldCount = 0;
        var originConfig;
        (function st() {
            if (i > 0) {
                if (originConfig.length) {
                    var cur = originConfig.eq(0).parents('tr').find('input[type=text]:eq(1)');
                    var value = keyArr[i++].replace(rep, '');
                    if (cur.val() != value) {
                        cur.val(value).change();
                        changeCount++;
                    } else {
                        oldCount++;
                    }
                }
                else {
                    obj = obj.parents('tr').find('input[type=text]:eq(1)').val(keyArr[i++].replace(rep, '')).change().end().next('tr').find('input[type=text]:eq(0)');
                }
            }
            if (i < keyArr.length && obj.length > 0) {
                var key = keyArr[i++].replace(rep, '');
                originConfig = origin.filter(function (a, b) { if (b.innerHTML == key) { return b; } });
                if (originConfig.length) {
                    originConfig[0].click();
                } else {
                    obj.val(key).change();
                    addCount++;
                }
                setTimeout(st, time);
            } else {
                var total = keyArr.length / 2;
                var realAdd = i / 2;
                if (total == realAdd) {
                    console.info({ "增加": addCount, "修改": changeCount, "总数": total });
                } else {
                    console.error({ "执行": realAdd, "总数": total });
                }
            }
        })();
    }
})();


