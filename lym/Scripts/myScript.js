// ==UserScript==
// @name         CheckConfig
// @namespace    http://tampermonkey.net/
// @version      2.4
// @description  try to take over the world!
// @author       You
// @match        https://portal.azure.cn/*
// @match        https://omcops.bmw.com.cn/Configuration/DeployConfiguration/NewChange*
// @grant        none
// ==/UserScript==

(function ds() {
    //narr
    var time = 150;
    //var omc = $('pre').find('[class=str]').map(function (a, b) { if (b.innerHTML.indexOf('"appsetting_') == 0) return b.innerHTML.replace('"appsetting_', '').replace('"', ''); }).toArray();
    var omc = [];
    var omcNew = $('#service-list');
    if (!("r" in window)) {
        Object.defineProperty(window, "r", {
            Configurable: true,
            get: function () { ds(); }
        });
        if(omcNew.length){
            omc = $.config.omcArr||[];
            $.config.ini_dataOld = $.config.ini_data;
            $.config.ini_data = function(data){
                try{
                    $.config.omcArr = data.map(function(a){return a.Name.replace(/-instance$/,'');});
                }catch(e){
                    console.log(e);
                }
                $.config.ini_dataOld.call(this,data);
            };
            var btn = document.createElement('input');
            btn.type = 'button';
            btn.value = 'Add Config';
            btn.style.color = 'red';
            btn.onclick = function () { var x = r; };
            $('h1').append(btn);
            var index = location.hash.lastIndexOf('-');
            var service = location.hash.substring(1,index);
            var env = location.hash.substring(index+1);
            var arr = $('#service-list>li').toArray();
            for(var i=0;i<arr.length;i++){
                if(arr[i].innerText==service){
                    $('#service-list').scrollTop(arr[i].offsetTop);
                    arr[i].click();
                    var envArr = $('#inst-list>li').toArray();
                    break;
                }
            }
            for(var i=0;i<envArr.length;i++){
                if(envArr[i].innerText.toLowerCase()==(service+'-'+env).toLowerCase()){
                    envArr[i].click();
                    $('#comp-list>li:eq(0)').click();
                    break;
                }
            }
        }
        else {
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
            alert("没有需要增加的配置。");
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
        var sleep = function (time) {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    resolve();
                }, time);
            });
        };
        var divTitle = document.createElement('div');
        var update = function(){
            $('#new-config-modal .modal-body').one("DOMSubtreeModified",update);
            divTitle.innerHTML = '增加'+$('#new-config-modal .modal-body .panel:visible').length+'个配置';
        };
        update();
        var start = async function(){
            var firstFlag;
            for (var i = 0; i < keyArr.length; i += 2) {
                var key = keyArr[i].replace(rep, '');
                if (omc.indexOf(key) < 0) {
                    if(!firstFlag){
                        $('#config-list>li:eq(0)>span:eq(0)').click();
                        while(!$('#new-config-modal').is(':visible')){
                            await sleep(50);
                        }
                        $('#new-config-modal .modal-title').append($(divTitle));
                        firstFlag = true;
                    }else{
                        $('#new-config-modal .new-changes-btn').click();
                        while(!$('#new-config-modal .modal-body>.panel:last').is(':visible')){
                            await sleep(50);
                        }
                    }
                    var model = $('#new-config-modal .modal-body>.panel:last');
                    model.find('.def-name').val( key);
                    model.find('.inst-name').val( key);
                    if(model.find('.panel-heading>span:last').attr('name')=='mytip'){
                        model.find('.panel-heading>span:last').html(key);
                    }else{
                        model.find('.panel-heading').append("<span name='mytip'style='color:#ff9090;margin-left:20px;font-size:24px'>"+key+"</span>");
                    }
                    model.find('.def-rule') .val(' ');
                    model.find('.def-dvalue') .val(' ');
                    model.find('.inst-value').val(keyArr[i + 1].replace(rep, ''));
                    continue;
                }
            }
        };
        start();
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


