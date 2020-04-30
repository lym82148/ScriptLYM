// ==UserScript==
// @name         Swagger
// @namespace    http://tampermonkey.net/
// @version      10
// @description  swagger
// @author       Yiming Liu
// all swaggers
// @match        *://*/swagger/*
// get token from reward portal
// @match        https://client-rewards-backoffice.internal.iherbtest.io/rewards/create*
// @match        https://rewards-web.backoffice.iherbtest.net/rewards/create*
// get token from new cs portal
// @match        https://cs-portal.backoffice.iherbtest.net/rewards*
// auto login reward portal
// @match        https://security-identity-test.iherb.net/core/login*
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
    // all swagger
    if (location.href.includes('/swagger/')) {
        var swagger = location.host;
        var env = lymTM.getSwaggerEnv(swagger);
        if (!env) {
            console.log(`config not found for swagger:${swagger}`);
            var swaggerAuth = window[lymTM.localConfigs.swaggerTMConfig][location.host];
            if (swaggerAuth) {
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
        } else {
            var tab = lymTM.open(env);
            // callback and close window
            lymTM.listenOnce(env, async (a, b, c) => {
                console.log(c.value);
                tab.close();
                var btn = await lymTM.async($('button.authorize'));
                // open auth popup
                btn.click();
                var input = await lymTM.async($('div.auth-container input'));
                lymTM.reactSet(input, `Bearer ${c.value}`);
                // confirm auth
                $('button.auth.authorize').click();
                // close auth popup
                $('button.auth.btn-done').click();
            });
        }
        // envLinks on swagger title
        var config = lymTM.searchConfigByUrl(location.href);
        if (config) {
            var envLinks = config.envLinks;
            if (envLinks) {
                var wrapDiv = $('<div></div>')
                for (var d in envLinks) {
                    var link = createLink(d, envLinks[d]);
                    link.appendTo(wrapDiv);
                }
                wrapDiv.mouseout(function () {
                    render(this);
                });
                wrapDiv.mouseenter(function () {
                    showAll(this);
                });
                wrapDiv.mousemove(function () {
                    showAll(this);
                });
                render(wrapDiv);
                $('a[rel]:first').append(wrapDiv);
            }
            var serviceName = config.name;
            console.log(`serviceName:${serviceName}`)
            var wrapDivEx = lymTM.generateRelativeLinks(serviceName, $, location.href);
            wrapDivEx.css('margin', '8px');
            var node = await lymTM.async($('h2.title'));
            node.after(wrapDivEx);
        }
        var envKey = location.host.includes('central.iherb.io') ? 'prod' : 'test';
        var swaggerCache = lymTM.getSwaggerCacheFromCache();
        $('body').on('click', 'button.execute', async function () {
            await lymTM.async();
            var $this = $(this);
            var table = $this.parent().prev('.opblock-section').find('table.parameters');
            if (!table.length) { return; }
            if (table.find('td.parameters-col_description>.invalid').length) {
                console.log('invalid');
                return;
            } else {
                var id = `${envKey}_${table.closest('div.opblock').attr('id')}`;
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
                console.log(id);
                console.log(body);
                swaggerCache = lymTM.setSwaggerCache(id, body);
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
                        if (/id$/i.test(field) && !mainKey) {
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
                            if (/id$/i.test(item)) {
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
                                box.val(body.value[field]);
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
        setInterval(() => {
            $('div.try-out:not([lymtm-processed])').each((a, b) => {
                var $b = $(b);
                $b.attr('lymtm-processed', '');
                initLine($b);
                $b.prev('div:not([class])').find('select').prop('selectedIndex', 0).change();
            });
        }, 100)
        return;
    } else {
        // cs portal page
        if (location.host == 'client-rewards-backoffice.internal.iherbtest.io' || location.host == 'security-identity-test.iherb.net' || location.host == 'cs-portal.backoffice.iherbtest.net') {
            var value = $.cookie('AccessToken');
            console.log(value);
            if (value) {
                lymTM.setValue(location.href, value);
            } else {
                var loginForm = await lymTM.async($('form:has(#password)'));
                await lymTM.maskDiv(() => loginForm.find('#password').val(), () => loginForm.find('#rememberMe').prop('checked', true).end().submit());
            }
        }

    }
}
function createLink(content, url) {
    var link = $(`<span>${content}</span>`);
    link.css({
        'background-color': '#FFFFFF',
        'border-radius': '3px',
        opacity: '70%',
        color: '#89bf04',
        'font-size': '14px',
        'font-weight': 'normal',
        padding: '4px 8px',
        'line-height': '20px',
        margin: '3px',
    });
    link.data('url', url);
    if (url != location.href) {
        link.css('cursor', 'pointer');
        link.click(function () { lymTM.openActive($(this).data('url')) });
    }
    return link;
}
function render(div) {
    $(div).children().each(function () {
        if ($(this).data('url') != location.href) { $(this).css('opacity', '10%'); } else { $(this).css('opacity', '80%'); }
    });
}
function showAll(div) {
    $(div).children().css('opacity', '80%');
}
