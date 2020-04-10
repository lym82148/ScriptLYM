// ==UserScript==
// @name         Swagger
// @namespace    http://tampermonkey.net/
// @version      7
// @description  swagger
// @author       Yiming Liu
// all swaggers
// @match        *://*/swagger/*
// get token from reward portal
// @match        https://client-rewards-backoffice.internal.iherbtest.io/rewards/create*
// @match        https://rewards-web.backoffice.iherbtest.net/rewards/create*
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
        return;
    } else {
        // cs portal page
        if (location.host == 'client-rewards-backoffice.internal.iherbtest.io' || location.host == 'security-identity-test.iherb.net') {
            var value = $.cookie('AccessToken');
            console.log(value);
            if (value) {
                lymTM.setValue(location.href, value);
            } else {
                var loginForm = await lymTM.async($('form:has(#password)'));
                var jobId = setTimeout(async () => {
                    await lymTM.async(() => loginForm.find('#username').val());
                    loginForm.find('#rememberMe').prop('checked', true).end().submit();
                }, 1500);
                lymTM.maskDiv(jobId);
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
