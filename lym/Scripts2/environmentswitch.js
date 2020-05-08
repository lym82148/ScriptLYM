// ==UserScript==
// @name         EnvironmentSwitch
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  test prod switch
// @author       Yiming Liu
// @include      https://*iherb*/*
// @grant        none
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
    // envLinks on swagger title
    var config = lymTM.searchConfigByHost(location);
    debugger;
    console.log(config);
    if (!config || !config.envLinks) {
        console.log('no config for environment switch');
        return;
    }
    var envLinks = config.envLinks;
    var wrapDiv = $('<div></div>')
    var targetContent = null;
    // all swagger
    if (location.href.includes('/swagger/')) {
        for (let envLinkKey in envLinks) {
            var link = createLink();
            addDataUrl(link, envLinkKey, envLinks[envLinkKey]);
            link.appendTo(wrapDiv);
        }
        targetContent = $('a[rel]:first');
        wrapDiv.css('height', '30px');

        var serviceName = config.name;
        console.log(`serviceName:${serviceName}`)
        var wrapDivEx = lymTM.generateRelativeLinks(serviceName, $, location.href);
        // 移除 env 链接 避免歧义
        wrapDivEx.children(':contains(Env)').remove();
        wrapDivEx.css('margin', '8px');
        var node = await lymTM.async($('h2.title'));
        node.after(wrapDivEx);
    }
    // new cs portal & reward portal
    else if (location.host == 'cs-portal.backoffice.iherbtest.net' || location.host == 'cs-portal.backoffice.iherb.net'
        || location.host == 'client-rewards-backoffice.internal.iherbtest.io' || location.host == 'rewards-web.backoffice.iherb.net'
        || location.host == 'rewards-web.backoffice.iherbtest.net') {
        targetContent = await lymTM.async($('div>svg:not([data-qa-element]):first'));
        targetContent = targetContent.closest('div');
        var originSpan = targetContent.children('span:contains(production),div>svg:first~span:contains(test)').first();
        if (!originSpan.length) {
            originSpan = createLink();
        }
        for (let envLinkKey in envLinks) {
            let tempSpan;
            if (lymTM.sameHost(envLinks[envLinkKey], location)) {
                tempSpan = originSpan;
            } else {
                tempSpan = originSpan.clone();
            }
            addDataUrl(tempSpan, envLinkKey, envLinks[envLinkKey]);
            tempSpan.css({ 'display': 'inline-block', 'background-color': '#ffffffb3' }).appendTo(wrapDiv);
        }
        wrapDiv.css({ 'padding': '10px' }).children(':gt(0)').css('margin-left', '6px');
    }
    // old cs portal
    else if (location.host == 'csportal-beta-test.iherb.net' || location.host == 'csportalext.iherb.net') {
        targetContent = $('div.iherb-header')
        let originSpan = targetContent.children('span:contains(production),div>svg:first~span:contains(test)').first();
        if (!originSpan.length) {
            originSpan = createLink();
        }
        let color = targetContent.css('backgroundColor');
        for (let envLinkKey in envLinks) {
            let tempSpan;
            if (lymTM.sameHost(envLinks[envLinkKey], location)) {
                tempSpan = originSpan;
            } else {
                tempSpan = originSpan.clone();
            }
            addDataUrl(tempSpan, envLinkKey, envLinks[envLinkKey]);
            // use rgb(x,x,x,0.7) insteadof #ffffffb3,cause old cs portal jquery version is too low
            tempSpan.css({ 'display': 'inline-block', 'background-color': 'rgb(255,255,255,0.7)', 'color': color }).appendTo(wrapDiv);
        }
        wrapDiv.css({ 'display': 'inline-block', 'padding': '11px', 'height': '50px' });
    }

    wrapDiv.on('mouseout', function () {
        render(this);
    });
    wrapDiv.on('mouseenter mousemove', function () {
        showAll(this);
    });
    //     wrapDiv.mousemove(function () {
    //         showAll(this);
    //     });
    render(wrapDiv);
    targetContent.append(wrapDiv);
}
function addDataUrl(link, key, url) {
    link.html(key == 'Prod' ? 'Production' : key);
    link.data('url', url);
    if (url != location.href.replace(/#.*/, '')) {
        link.css('cursor', 'pointer');
        link.click(function () { lymTM.openActive($(this).data('url')) });
    } else {
        link.css('cursor', 'default');
    }
}
function createLink() {
    var link = $(`<span></span>`);
    link.css({
        'background-color': '#ffffffb3',
        'border-radius': '3px',
        color: $('.swagger-ui .topbar').css('backgroundColor'),
        'font-size': '14px',
        'font-weight': 'normal',
        padding: '4px 8px',
        'line-height': '20px',
        'margin-left': '3px',
        'margin-right': '3px',
        display: 'inline-block',
    });
    return link;
}
function render(div) {
    $(div).children().each(function () {
        if (!lymTM.sameHost($(this).data('url'), location)) { $(this).css('opacity', '0.15'); } else { $(this).css('opacity', '1'); }
    });
}
function showAll(div) {
    $(div).children().css('opacity', '1');
}