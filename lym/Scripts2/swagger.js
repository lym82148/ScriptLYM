// ==UserScript==
// @name         Swagger
// @namespace    http://tampermonkey.net/
// @version      22
// @description  swagger
// @author       Yiming Liu
// all swaggers
// @match        *://*/swagger/*
// @match        *://*/swagger
// @match        *://*/*/swagger/*
// get token from reward portal
// @match        https://client-rewards-backoffice.internal.iherbtest.io/rewards/create*
// @match        https://rewards-web.backoffice.iherbtest.net/rewards/create*
// @match        https://rewards-web.backoffice.iherb.net/rewards*
// get token from new cs portal
// @match        https://cs-portal.backoffice.iherbtest.net/rewards*
// @match        https://cs-portal.backoffice.iherbtest.net/customers*
// @match        https://cs-portal.backoffice.iherb.net/rewards/hyperwallet*
// @match        https://cs-portal.iherb.net/customers*
// auto login reward portal
// @match        https://security-identity-test.iherb.net/core/login*
// @match        https://secauthext.iherb.net/core/login*
// @match        https://secauthext.iherb.net/core/logout*
// @match        https://security-identity-test.iherb.net/core/logout*
// @match        https://iherb.okta.com/login/login.htm*
// @match        https://iherb.okta.com/*
// @require      file://c:\iHerb\tmConfig.js
// ==/UserScript==

(async function wrap() {
    // force async at first
    await lymTM.async();
    var time = lymTM.start();
    await process(wrap, time);
    // log execution time
    time.end();
})();

async function process(func, time) {
    if (location.hostname != 'iherb.okta.com' && $('body>pre:contains(default backend - 404)').length) {
        checkDefaultBackend404Thread();
        return;
    }
    setTimeout(repositoryFilterThread, 1000);
    var authValue;
    var isProd = !location.host.includes('test') && !location.host.includes('localhost');
    var authBtn = lymTM.createButton(isProd ? 'Auth Prod' : 'Auth', async function () {
        if (authValue) {
            var autoBearer = [].filter.call($('div.auth-container h4')[0].childNodes, a => a.nodeType == 3)[0];
            if (autoBearer != null && autoBearer.nodeValue.includes('Bearer')) {
                authValue = authValue.replace('Bearer ', '');
            }
            lymTM.reactSet(this.previousSibling, authValue);
            await lymTM.async(200);
            // confirm auth
            $('button.auth.authorize').click();
            await lymTM.async(200);
            // close auth popup
            $('button.auth.btn-done').click();
        }
    });
    authBtn.style.display = 'inline';
    authBtn.style.marginLeft = '10px';
    // all swagger
    if (location.href.includes('/swagger/')) {
        lymTM.runJob(async () => {
            var node = await lymTM.async($('button.btn.authorize'));
            lymTM.doOnceBy(node, () => {
                var link = $('<button>');
                link.html('User auth list');
                link.click(() => window.open(location.origin + '/api/user/authorizations'));
                link.addClass("btn").css('margin-right', '5px');
                node.before(link);

            });
        }, 300);
        var swagger = location.host;
        var env = lymTM.getSwaggerEnv(swagger);
        var swaggerAuth = window[lymTM.localConfigs.swaggerTMConfig][location.host];
        if (swaggerAuth) {
            authValue = swaggerAuth;
            if (!isProd) {
                var btn = await lymTM.async($('button.authorize'));
                // open auth popup
                btn.click();
                var input = await lymTM.async($('div.auth-container input'));
                lymTM.reactSet(input, swaggerAuth);
                // confirm auth
                $('button.auth.authorize').click();
                // close auth popup
                $('button.auth.btn-done').click();
            }
        }
        else if (env) {
            var tab = lymTM.open(env);
            // callback and close window
            lymTM.listenOnce(env, async (a, b, c) => {
                console.log(c.value);
                tab.close();
                authValue = `Bearer ${c.value}`;
                if (!isProd) {
                    var btn = await lymTM.async($('button.authorize'));
                    // open auth popup
                    btn.click();
                    var input = await lymTM.async($('div.auth-container input'));
                    var autoBearer = [].filter.call($('div.auth-container h4')[0].childNodes, a => a.nodeType == 3)[0];
                    if (autoBearer != null && autoBearer.nodeValue.includes('Bearer')) {
                        authValue = c.value;
                    }
                    lymTM.reactSet(input, authValue);
                    // confirm auth
                    $('button.auth.authorize').click();
                    // close auth popup
                    $('button.auth.btn-done').click();
                }
            });
        }

        var envKey = location.host.includes('central.iherb.io') ? 'prod' : 'test';
        var swaggerCache = lymTM.getSwaggerCacheFromCache();
        var swaggerIndex = -1;
        $('body').on('click', 'button.execute', async function () {
            await lymTM.async();
            var $this = $(this);
            var bodySection = $this.parent().prev('.opblock-section');
            var table = bodySection.find('table.parameters');
            var bodyArea = bodySection.find('div.body-param>textarea');
            if (!table.length && !bodyArea.length) { return; }
            if (table.find('td.parameters-col_description>.invalid').length) {
                console.log('invalid');
                return;
            } else {
                var id = `${envKey}_${table.closest('div.opblock').attr('id') || bodySection.closest('div.opblock').attr('id')}`;
                var body = Object.create(null);
                table.find('tbody>tr').each((a, b) => {
                    var key = $(b).data('param-name');
                    if (!key) {
                        var keyNode = Array.prototype.filter.call($(b).find('div.parameter__name').prop('childNodes'), (a) => a.nodeType == 3).shift();
                        key = keyNode ? keyNode.textContent : '';
                    }
                    var value = '';
                    var node = $(b).find('td.parameters-col_description').find('input,select,textarea');
                    if (node.length) {
                        switch (node.prop('tagName')) {
                            case "INPUT":
                            case "TEXTAREA":
                                value = node.val();
                                break;
                            case "SELECT":
                                value = [...new Set(node.find(':selected').map((a, b) => b.value).toArray())];
                                break;
                        }
                        body[key] = value;
                    }
                });
                if (bodyArea.length) {
                    body[lymTM.keys.swaggerBodyTextArea] = bodyArea.val();
                }
                console.log(id);
                console.log(body);
                [swaggerCache, swaggerIndex] = lymTM.setSwaggerCache(id, body);
                $this.closest('div.opblock').find('div.try-out').attr('lymtm-processed', null).prev('div:has(select)').remove();
            }
        });
        console.log(swaggerCache);
        function refresh($b, guid) {
            swaggerCache = lymTM.getSwaggerCacheFromCache();
            $b.prev('div:not([class])').remove();
            initLine($b);
            $b.prev('div:not([class])').find('select').val(guid).change();
        }
        function initLine($b) {
            var block = $b.closest('div.opblock');
            var key = `${envKey}_${block.attr('id')}`;
            console.log(key);
            if (swaggerCache[key] && swaggerCache[key].length) {
                var wrapDiv = $('<div></div>');
                var select = $('<select></select>').css({ 'margin': '5px', 'font-size': '22px' });
                var editBtn = $('<input type="button" class="btn" value="Update"/>').css({ 'margin': '5px' }).click(function () {
                    var select = $(this).siblings('select');
                    var guid = select.find(':selected').val();
                    lymTM.updateSwaggerCache(key, select.find(':selected').val(), null, txt.val());
                    refresh($b, guid);
                });
                var txt = $('<input type="text" class="btn" value=""/>').css({ 'margin': '5px' }).keydown((e) => {
                    if (e.keyCode == 13) {
                        editBtn.click();
                    }
                });
                var alwaysTop = $('<input type="button" class="btn" value=""/>').css({ 'margin': '5px' }).click(function () {
                    var select = $(this).siblings('select');
                    var guid = select.find(':selected').val();
                    if (alwaysTop.val().includes('Unpin')) {
                        lymTM.updateSwaggerCache(key, guid, false, null);
                    } else {
                        lymTM.updateSwaggerCache(key, guid, true, null);
                    }
                    refresh($b, guid);
                });
                var clearBtn = $('<input type="button" class="btn" value="ClearAll"/>').css({ 'margin': '5px' }).click(function () {
                    if (confirm(`clear all cache ${key} ?`)) {
                        var select = $(this).siblings('select');
                        var guid = select.find(':selected').val();
                        lymTM.clearSwaggerCache(key);
                        refresh($b, guid);
                    }
                });
                wrapDiv.append(clearBtn).append(alwaysTop).append(txt).append(editBtn).append(select);
                for (var item of swaggerCache[key]) {
                    var mainKey = '';
                    var mainValue = '';
                    if (!item) { continue; }
                    for (var field of Object.keys(item.value)) {
                        console.log(field)
                        try {
                            if (/^\{[\s\S]*\}$/.test(item.value[field].trim())) {
                                var json = JSON.parse(item.value[field]);
                                var res = findMainKey(json);
                                if (res[0]) {
                                    mainKey = res[0];
                                    mainValue = res[1];
                                    break;
                                }
                                if (res[2] && !mainKey) {
                                    mainKey = res[2];
                                    mainValue = res[3];
                                }
                            }
                        } catch (e) {

                        }
                        if (/customerId/i.test(field)) {
                            mainKey = field;
                            mainValue = item.value[mainKey];
                            break;
                        }
                        if (/id$/i.test(field) && field != 'storeid' && !mainKey) {
                            mainKey = field;
                            mainValue = item.value[mainKey];
                        }
                    }
                    console.log(`${mainKey}:${mainValue}`)
                    mainValue = mainValue.toString().replace(/^(\w{4}).*(\w{4})$/, '$1***$2');
                    var option = $(`<option value='${item.guid}' data-json='${JSON.stringify(item)}'>${item.alwaysTop ? '★' : ''} ${mainValue} ${item.txt || ''} (${item.count})</option>`);
                    select.prepend(option);
                }
                function findMainKey(obj, res) {
                    if (!res) { res = [] };
                    for (var item of Object.keys(obj)) {
                        if (obj[item] instanceof Object) {
                            findMainKey(obj[item], res);
                        } else {
                            if (/customerId/i.test(item)) {
                                res[0] = item;
                                res[1] = obj[item];
                            }
                            if (/id$/i.test(item) && item != 'storeid') {
                                res[2] = item;
                                res[3] = obj[item];
                            }
                        }
                    }
                    return res;
                }
                function setFields() {
                    var key = `${envKey}_${block.attr('id')}`;
                    var body = swaggerCache[key][swaggerCache[key].length - 1 - select.prop('selectedIndex')];
                    var textArea = block.find('div.body-param>textarea');
                    if (textArea.length) {
                        lymTM.reactSet(textArea, body.value[lymTM.keys.swaggerBodyTextArea] || '');
                    }
                    //                     console.log(body);
                    var table = block.find('table.parameters');
                    for (var field of Object.keys(body.value)) {
                        var row = table.find(`tr div.parameter__name:contains(${field})`).closest('tr');
                        if (!row.length) continue;
                        var box = row.find('td.parameters-col_description').find('input,select,textarea:first').first();
                        switch (box.prop('tagName')) {
                            case "INPUT":
                            case "TEXTAREA":
                                lymTM.reactSet(box, body.value[field]);
                                break;
                            case "SELECT":
                                box.children().each((a, b) => { b.selected = body.value[field].includes(b.value) });
                                lymTM.reactSet(box);
                                break;
                        }

                    }
                }
                select.change(function () {
                    var tryBtn = block.find('.try-out__btn:not(.cancel)');
                    if (tryBtn.length) {
                        tryBtn.click();
                    }
                    setFields();
                    var json = select.find(':selected').data('json');
                    if (json.alwaysTop) {
                        alwaysTop.val('Unpin');
                    } else {
                        alwaysTop.val('Pin');
                    }
                    txt.val(json.txt);
                });
                $b.before(wrapDiv);
                block.find('.try-out__btn').click(async () => {
                    await lymTM.async();
                    block.find('table.parameters>tbody>tr:not([data-param-name])').each((a, b) => {
                        var keyNode = Array.prototype.filter.call($(b).find('div.parameter__name').prop('childNodes'), (a) => a.nodeType == 3).shift();
                        var keyNodeValue = keyNode ? keyNode.textContent : '';
                        b.setAttribute('data-param-name', keyNodeValue);
                    });
                    setFields();
                });
            }
        }
        lymTM.runJob(() => {
            $('div.try-out:not([lymtm-processed])').each((a, b) => {
                var $b = $(b);
                $b.attr('lymtm-processed', '');
                initLine($b);
                let select = $b.prev('div:not([class])').find('select');
                if (swaggerIndex != -1) {
                    select.prop('selectedIndex', swaggerIndex).change();
                    swaggerIndex = -1;
                } else {
                    select.prop('selectedIndex', 0).change();
                }
            });
        }, 100);
        lymTM.runJob(async () => {
            var authContent = await lymTM.async($('.auth-container input:text'));
            if (!authContent.next(authBtn).length) {
                authContent.after(authBtn);
            }
        }, 100);
        return;
    }
    else if (location.href.includes("https://secauthext.iherb.net/core/logout")
        || location.href.includes("https://security-identity-test.iherb.net/core/logout")) {
        await lymTM.maskDiv(null, () => {
            if (location.host == 'secauthext.iherb.net') {
                location.href = 'https://csportalext.iherb.net/';
            }
            else if (location.host == 'security-identity-test.iherb.net') {
                location.href = 'https://csportal-beta-test.iherb.net/';
            }
        });
    }
    else {
        // cs portal page
        if (location.host == 'rewards-web.backoffice.iherbtest.net' || location.host == 'cs-portal.backoffice.iherbtest.net'
            || location.host == 'rewards-web.backoffice.iherb.net' || location.host == 'cs-portal.iherb.net') {
            await lymTM.async($('div>svg:not([data-qa-element]):first'));
            await lymTM.async(3000);
            var oktaStorage = JSON.parse(window.sessionStorage.getItem("okta-token-storage"));
            var value;
            if (oktaStorage) {
                value = oktaStorage.accessToken.value;
            } else {
                value = $.cookie('AccessToken');
            }
            console.log(value);
            if (value) {
                lymTM.setValue(location.href, value);
            } else {
                var loginForm = await lymTM.async($('form:has(#password)'));
                await lymTM.maskDiv(() => loginForm.find('#password').val(), () => loginForm.find('#rememberMe').prop('checked', true).end().submit());
            }
        } else if (location.host == 'iherb.okta.com') {
            await lymTM.async(() => jQueryCourage('form:has(input[name=password])').length);
            var oktaForm = jQueryCourage('form:has(input[name=password])');
            if (window[lymTM.localConfigs.idTMConfig]) {
                lymTM.reactSet(oktaForm.find('input[name=password]')[0], window[lymTM.localConfigs.idTMConfig]);
                await lymTM.maskDiv(() => oktaForm.find('input[name=password]').val(), () => oktaForm.submit(), jQueryCourage);
            }
        } else if (location.host == 'security-identity-test.iherb.net' || location.host == 'secauthext.iherb.net') {
            value = $.cookie('AccessToken');
            console.log(value);
            if (value) {
                lymTM.setValue(location.href, value);
            } else {
                let loginForm = await lymTM.async($('form:has(#password)'));
                await lymTM.maskDiv(() => loginForm.find('#password').val(), () => loginForm.find('#rememberMe').prop('checked', true).end().submit());
            }
        }

    }
}

async function checkDefaultBackend404Thread() {
    var node = await lymTM.async($('body>pre:contains(default backend - 404)'));
    if (location.hostname.endsWith('.net')) {
        var serviceName = location.hostname.split('.').shift();
        var newUrl;
        if (location.hostname.endsWith('test.net')) {
            newUrl = lymTM.urls.BackOfficeTestSwaggerOld(serviceName);
        } else {
            newUrl = lymTM.urls.BackOfficeProdSwaggerOld(serviceName);
        }
        var url = new URL(newUrl);
        url.pathname = location.pathname;
        var link = lymTM.createLink(`${url}`, url);
        link.target = '_self';
        $('body').append('try ');
        $('body').append(link);
    } else if (location.hostname.endsWith('.io')) {
        let serviceName = location.hostname.split('.').shift().replace(/backoffice-/i, '');
        let newUrl;
        if (location.hostname.endsWith('test.io')) {
            newUrl = lymTM.urls.BackOfficeTestSwagger(serviceName);
        } else {
            newUrl = lymTM.urls.BackOfficeProdSwagger(serviceName);
        }
        let url = new URL(newUrl);
        url.pathname = location.pathname;
        let link = lymTM.createLink(`${url}`, url);
        link.target = '_self';
        $('body').append('try ');
        $('body').append(link);
    }
}
async function repositoryFilterThread() {
    var divWrap = lymTM.generateFilter($);
    var aRefresh = $(divWrap).find('[name=div-filter-refresh]').css({ 'cursor': 'default', 'text-decoration': 'none' }).attr('target', '_self').html('No repository match exactly.');
    let header = await lymTM.async($('hgroup.main'));
    header.children(`div[name=${divWrap.getAttribute('name')}]`).remove();
    header.prepend(divWrap);
    divWrap.style.paddingTop = '15px';
}

