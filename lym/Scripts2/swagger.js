// ==UserScript==
// @name         Swagger
// @namespace    http://tampermonkey.net/
// @version      3
// @description  swagger
// @author       Yiming Liu
// cs portal swaggers
// @match        https://localhost:44300/swagger/*
// @match        https://backoffice-cs-reward-service.internal.iherbtest.io/swagger/*
// get token from
// @match        https://client-rewards-backoffice.internal.iherbtest.io/rewards/create*
// @match        https://rewards-web.backoffice.iherbtest.net/rewards/create*
// auto login
// @match        https://security-identity-test.iherb.net/core/login*
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
        }

        var btn = await lymTM.async($('button.authorize'));
        // 自动聚焦
        btn.click(async () => {
            // wait for DOM load
            var input = await lymTM.async($('div.auth-container input'));
            input.attr('placeholder', 'getting token...').focus();
            var tab = lymTM.open(env);
            // 关窗回调
            var listenerId = lymTM.listenOnce(env, async (a, b, c) => {
                console.log(c.value);
                lymTM.reactSet(input[0], `Bearer ${c.value}`);
                // confirm auth
                $('button.auth.authorize').click();
                // done
                $('button.auth.btn-done').click();
                // close window
                tab.close();
            });
        });
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
                // 等待浏览器填充
                await lymTM.async(() => loginForm.find('#username').val());
                loginForm.find('#rememberMe').prop('checked', true).end().submit();
            }
        }
    }
}
