// ==UserScript==
// @name         EnvironmentSwitch
// @namespace    http://tampermonkey.net/
// @version      3
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
    console.log(config);
    if (!config || !config.envLinks) {
        console.log('no config for environment switch');
        return;
    }
    var envLinks = config.envLinks;
    var hangfireLinks = config.hangfireLinks;
    var rancherLinks = config.rancherLinks;
    var wrapDiv = $('<div></div>')
    var targetContent = null;
    // all swagger
    if (location.href.includes('/swagger/')) {
        for (let envLinkKey in envLinks) {
            var link = createLink();
            addDataUrl(link, envLinkKey, envLinks[envLinkKey]);
            link.appendTo(wrapDiv);
        }
        targetContent = $('a.link:first').css('max-width', '360px');
        wrapDiv.css({ 'width': '250px' });
        var serviceName = config.name;
        console.log(`serviceName:${serviceName}`)
        var wrapDivEx = lymTM.generateRelativeLinks(serviceName, $, location.href);
        // 移除 env 链接 避免歧义
        wrapDivEx.children(':contains(Env)').remove();
        wrapDivEx.css('margin', '8px');
        var node = await lymTM.async($('h2.title'));
        node.after(wrapDivEx);
        targetContent.closest('div.topbar').css({ 'position': 'fixed', 'width': '100%', 'margin-top': '-52px' });
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
    else if (location.href.includes('/hangfire')) {
        for (let key in hangfireLinks) {
            let link = createLink();
            addDataUrl(link, key, hangfireLinks[key]);
            link.appendTo(wrapDiv);
        }
        wrapDiv.css({ 'float': 'left', 'margin': '11px 10px 11px 0px' });
        targetContent = $('.navbar-header').css({ 'margin-left': '10px' });
        $('.navbar-collapse').css({ 'background-color': '#e2e2e2', 'padding-right': '10px' });

        let wrapDivEx = lymTM.generateRelativeLinks(config.name, $, location.href);
        // 移除 env 链接 避免歧义
        wrapDivEx.children(':contains(Hangfire)').remove();
        wrapDivEx.css({ 'margin-top': '10px', 'margin-bottom': '0px', 'display': 'none' }).append($('<hr/>').css({ 'margin-top': '10px', 'margin-bottom': '0px', 'border': 'solid 1px #e7e7e7' }));
        $('.container:first').prepend(wrapDivEx);
        wrapDivEx.show(100);
        for (var i = 0; i <= 40; i += 5) {
            await lymTM.async(3);
            $('body').css('margin-top', `${i}px`);
        }
    }
    else if (location.href.includes('/rancher.')) {
        for (let key in rancherLinks) {
            let link = createLink();
            addDataUrl(link, key, rancherLinks[key]);
            link.appendTo(wrapDiv);
        }
        targetContent = $('<li style="padding-left:15px"></li>');
        // use lamda here,cause new jquery version in rancher
        var menu = await lymTM.async(() => $('ul.nav-main>li.nav-item.dropdown'));
        menu.after(targetContent);
    }
    else {
        // other site
        return;
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
    if (!lymTM.sameHost(url, location.href)
        || url.includes('/rancher.') && location.origin.includes('/rancher.') && !lymTM.samePath(url, location.href)) {
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
        var url = $(this).data('url');
        if (!lymTM.sameHost(url, location)
            || url.includes('/rancher.') && location.origin.includes('/rancher.') && !lymTM.samePath(url, location.href)) {
            $(this).css('opacity', '0.15');
        }
        else {
            $(this).css('opacity', '1');
        }
    });
}
function showAll(div) {
    $(div).children().css('opacity', '1');
}