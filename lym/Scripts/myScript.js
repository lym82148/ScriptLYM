﻿// ==UserScript==
// @name         CheckConfig
// @namespace    http://tampermonkey.net/
// @version      3.9
// @description  try to take over the world!
// @author       You
// @match        https://portal.azure.cn/*
// @match        https://omcops.bmw.com.cn/Configuration/DeployConfiguration/NewChange*
// @grant        none
// ==/UserScript==

(function ds(oldJsonConfig,oldXmlConfig) {
    //narr
    var time = 150;
    //var omc = $('pre').find('[class=str]').map(function (a, b) { if (b.innerHTML.indexOf('"appsetting_') == 0) return b.innerHTML.replace('"appsetting_', '').replace('"', ''); }).toArray();
    var omc = [];
    var envs = ['build','dev','int','stg','prod'];
    var omcNew = $('#service-list');
    if (!("r" in window)) {
        Object.defineProperty(window, "r", {
            Configurable: true,
            get: function () { ds(); }
        });
        if(omcNew.length){
            var paDiv = document.createElement('div');
            var paTitle = document.createElement('span');
            paTitle.innerHTML="Old Config ";
            paTitle.style.fontWeight = 'bolder';
            paTitle.style.marginLeft='10px';
            paDiv.append(paTitle);
            var expandBtn = document.createElement('span');
            expandBtn.className='btn btn-info';
            expandBtn.innerHTML="Expand";
            expandBtn.style.display='none';
            expandBtn.style.marginLeft='10px';
            expandBtn.onclick = function(){
                jsonDiv.style.display='';
                collapseBtn.style.display='';
                expandBtn.style.display='none';
            };
            var collapseBtn = document.createElement('span');
            collapseBtn.className='btn btn-primary';
            collapseBtn.innerHTML="Collapse";
            collapseBtn.style.marginLeft='10px';
            collapseBtn.onclick = function(){
                jsonDiv.style.display='none';
                expandBtn.style.display='';
                collapseBtn.style.display='none';
            };
            var jsonDiv=document.createElement('pre');
            jsonDiv.style.marginTop='10px';
            paDiv.className='col-md-12';
            paDiv.append(expandBtn);
            paDiv.append(collapseBtn);
            var promoteBtn = document.createElement('span');
            promoteBtn.className='btn btn-danger';
            promoteBtn.innerHTML="Promote";
            promoteBtn.style.marginLeft='10px';
            promoteBtn.style.display = 'none';
            promoteBtn.onclick = function(){
                var env = this.getAttribute('data-env');
                if($.inst.obj.find('li:contains(-'+env+')').length){
                    var oldConfig= $.config.omcObj;
                    $.inst.obj.find('li:contains(-'+env+')').click();
                    $('#comp-list>li:eq(0)').click();
                    ds(oldConfig);
                }
            };
            paDiv.append(promoteBtn);
            paDiv.append(jsonDiv);
            $('.row.clearfix').append(paDiv);

            $.config.ini_dataOld = $.config.ini_data;
            $.config.ini_data = function(data){
                try{
                    $.config.omcArr = data.map(function(a){return a.Name.replace(/-instance$/,'');});
                    $.config.omcValueArr = data.map(function(a){return a.Value;});
                    var obj = {};
                    data.forEach(function(a){
                        if(a.ParentToName =="properties" ){
                            var key = a.Name.replace(/-instance$/,'');
                            obj[key]= a.Value;
                        }
                    });
                    $.config.omcObj= obj;
                    jsonDiv.innerHTML = format_json(JSON.stringify( $.config.omcObj));
                    paTitle.innerHTML = $.inst.obj.find('li.active').text().split('-').pop();
                    var index = envs.indexOf(paTitle.innerHTML);
                    if(index>= 0 && index < envs.length - 1){
                        var newEnv = envs.indexOf(paTitle.innerHTML);
                        promoteBtn.innerHTML = 'Promote To '+envs[index+1];
                        promoteBtn.setAttribute('data-env',envs[index+1]);
                        promoteBtn.style.display = '';
                    }else{
                        promoteBtn.style.display = 'none';
                    }

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
                if(arr[i].innerText.toLowerCase()==service.toLowerCase()){
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
            var curText = service;
            var browse = 'WebApiHost/Web.config';
            switch(curText){
                case 'DriveViolationService':
                    break;
                case 'PaymentService':
                    curText = 'PaymentGateway';
                    browse = 'PaymentService/Web.config';
                    break;
                case 'OrderFulfillmentFrontEnd':
                    browse = 'OrderService/Web.config';
                    break;
                case 'BTCAPIServer':
                    curText = 'bmwgateway';
                    browse = 'BTCAPIServer/Web.config';
                    break;
                case 'EnterprisePortal':
                    curText = 'EnterprisePortal';
                    browse = 'WebHost/Web.config';
                    break;
                default:
                    return;
                    break;
            }
            var configLink = document.createElement('a');
            configLink.innerHTML = 'Get Config From Git';
            configLink.style.color = 'red';
            configLink.style.marginLeft = '40px';
            configLink.style.textDecoration = 'underline';
            configLink.style.fontSize = '20px';
            configLink.style.marginBottom = '10px';
            configLink.href = 'javascript:void(0);';
            configLink.target = '_blank';
            configLink.onclick = () => {
                window.open('http://suus0003.w10:7990/projects/CNB/repos/' + curText +'/browse/'+ browse+'?at=ChinaDev#ad', null, "height=11,width=11,status=no,toolbar=no,scrollbars=no,menubar=no,location=no,top=" + (window.screenTop + 200) + ",left=" + (window.screenLeft + 600));
                configLink.innerHTML = 'Starting Task';
                configLink.style.color = 'pink';
                setTimeout(function () {
                    configLink.innerHTML = 'Get Config From Git';
                    configLink.style.color = 'red';
                }, 1000);
            };
            $('h1').append(configLink);
            window.onmessage = function (e) {
                ds(null,e.data);
            };
            window.alertOld = window.alert;
            window.alert = function (a) {
                if (a!==true) {
                    window.alertOld(a);
                }else{
                    var env = $.inst.obj.find('li.active').text().split('-').pop();
                    env= env.substr(0,1).toUpperCase()+env.substr(1);
                    var service = $.svc.obj.find('li.active').text();
                    location.href = 'https://omcops.bmw.com.cn/Configuration/DeployConfiguration/Index/'+env+'-'+service;
                }
            };
        }
        else {
            setTimeout('console.log("输入 r 更新配置");', 5000);
        }
        return;
    }
    if(oldJsonConfig){
        var okeys = Object.keys(oldJsonConfig);
        var ovalues = Object.values(oldJsonConfig);
        var keyArr = [];
        for(var i=0;i<okeys.length;i++){
            keyArr.push(okeys[i],ovalues[i]);
        }
        var rep = '';
    }else{
        var res = oldXmlConfig || window.prompt();
        if (!res) { return; }
        var re = /<!--[\S\s]+?-->/g;
        res = res.replace(re, '');
        var appSettings = /<appSettings>[\s\S]+<\/appSettings>/;
        var config = appSettings.exec(res);
        if (config == null) { config = res; }
        var add = /=\s*"[^"]*/g;
        var keyArr = config.toString().match(add);
        var rep = /=\s*"/;
    }
    omc = $.config.omcArr||[];
    if (omc.length && keyArr.length % 2 == 0) {
        var keyArr2 = keyArr.filter(function (a, b) { return b % 2 == 0; }).map(function (a) { return a.replace(rep, ''); });
        var diff = function (a, b) {
            return a.filter(function (i) { return b.indexOf(i) < 0; });
        };

        var cj1 = diff(omc, keyArr2);
        var cj2 = diff(keyArr2, omc);
        var cj2str = cj2.join('"\r\n"');
        var cj1str = cj1.join('"\r\n"');
        console.clear();
        if (cj2str == '') {
            alert("没有需要增加的配置。");
            console.log("没有需要增加的配置。\r\n ");
        } else {
            cj2str = '"' + cj2str + '"';
            console.warn("增加的配置：");
            console.log(cj2str);
        }
        console.log('');
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
            var warnFlag;
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
                }else{
                    var oldV = keyArr[i + 1].replace(rep, '');
                    var newV = $.config.omcValueArr[omc.indexOf(key)];
                    if( oldV!==newV ){
                        if(!warnFlag){
                            console.log('');
                            console.warn("不同的配置");
                            warnFlag = true;
                        }
                        console.log('%c'+key,'font-weight:bolder');
                        console.log('%c'+oldV,'color:grey');
                        console.log('%c'+newV,'color:grey');
                        console.log('');
                    }
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

    function format_json(txt, compress) {
        var indentChar = '&nbsp;&nbsp;&nbsp;&nbsp;';
        if (/^\s*$/.test(txt)) {
            //alert('txt is empty');
            return '';
        }
        try {
            var data = eval('(' + txt + ')');
            txt = txt.replace(new RegExp("\"{","gm"), "{").replace(new RegExp("}\"","gm"), "}");
            txt = txt.replace(new RegExp("\\\\\\\"","gm"), "\"");
            txt = txt.replace(new RegExp("\\\\\\\"","gm"), "\"");
            txt = txt.replace(new RegExp("\\\\\\\"","gm"), "\"");

            txt = txt.replace(new RegExp("&nbsp;","gm"), "");

            //        console.log(txt);
            data = eval('(' + txt + ')');
        } catch (e) {
            //alert('txt format error: '+e.description,'err');
            return txt;
        }
        ;
        var draw = [], last = false, This = this, line = compress ? ''
        : '<br/>', nodeCount = 0, maxDepth = 0;
        var notify = function(name, value, isLast, indent, formObj) {
            if (indent == 0) {
                //draw.push('<table>');
            }
            nodeCount++;
            for (var i = 0, tab = ''; i < indent; i++)
                tab += indentChar;
            tab = compress ? '' : tab;
            maxDepth = ++indent;
            if (value && value.constructor == Array) {
                draw.push(tab + (formObj ? ('"' + name + '":') : '') + '['
                          + line);
                for (var i = 0; i < value.length; i++)
                    notify(i, value[i], i == value.length - 1, indent,
                           false);
                draw.push(tab + ']' + (isLast ? line : (',' + line)));
            } else if (value && typeof value == 'object') {
                draw.push(tab + (formObj ? ('"' + name + '":') : '') + '{'
                          + line);
                var len = 0, i = 0;
                for ( var key in value)
                    len++;
                for ( var key in value)
                    notify(key, value[key], ++i == len, indent, true);
                draw.push(tab + '}' + (isLast ? line : (',' + line)));
            } else {
                if (typeof value == 'string')
                    value = '"' + value + '"';
                draw.push(tab + (formObj ? ('"' + name + '":') : '')
                          + value + (isLast ? '' : ',') + line);
            }
            ;
        };
        var isLast = true, indent = 0;

        notify('', data, isLast, indent, false);
        return draw.join('');
    }
})();


