// ==UserScript==
// @name         Swagger
// @namespace    http://tampermonkey.net/
// @version      2
// @description  swagger
// @author       Yiming Liu
// @match        https://localhost:44300/swagger/*

// @match        https://client-rewards-backoffice.internal.iherbtest.io/rewards/create*
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
    if (location.href.includes('/swagger/')) {
        var swagger = location.host;
        var env = lymTM.getSwaggerEnv(swagger);
        if (!env) {
            console.log(`config not found for swagger:${swagger}`);
        }

        var btn = await lymTM.async($('button.authorize'));
        // 自动聚焦
        btn.click(async () => {
            var tab = lymTM.open(env);
            // 关窗回调
            var listenerId = lymTM.listenOnce(env, async (a, b, c) => {
                $('div.auth-container input').attr('placeholder', 'paste now').focus();
                tab.close();
                //             console.log(c.value);
            });
            await lymTM.async();
            $('div.auth-container input').attr('placeholder', 'getting token...').focus();
        });
        //         $('button.auth.authorize').click();
        return;
    } else if (location.hash == '#swagger') {
        var value = $.cookie('AccessToken');
        lymTM.copy(value);
        lymTM.setValue(location.href, null);
    }
}
