// ==UserScript==
// @name         Common
// @namespace    http://tampermonkey.net/
// @version      10
// @description  configs & util
// @author       Yiming Liu
// @include      *
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        unsafeWindow
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// @grant        GM_setClipboard
// @grant        GM_openInTab
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// ==/UserScript==

// unsafeWindow for Chrome console, window for other UserScript
unsafeWindow.lymTM = window.lymTM = {
    sleep: function (time) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve();
            }, time);
        });
    },
    transferJqueryObj: function (obj) {
        return this.isJqueryObj(obj) ? obj[0] : obj;
    },
    isJqueryObj: function (obj) {
        return ("jQuery" in unsafeWindow || "jQuery" in window) && obj instanceof jQuery;
    },
    async: async function (obj, time = 100) {
        if (typeof obj == 'number') {// 参数是数字
            await this.sleep(obj);
        }
        else if (this.isJqueryObj(obj)) {// 参数是jQuery对象
            while (!jQuery(obj.selector).length) {
                await this.sleep(time);
            }
            return jQuery(obj.selector);
        }
        else if (obj) { // 参数是方法
            var res;
            while (true) {
                res = obj();
                if (this.isJqueryObj(res)) {
                    if (res.length) {
                        break;
                    }
                } else if (res) {
                    break;
                }
                await this.sleep(time);
            }
            return res;
        } else { // 没有参数
            await this.sleep(0);
        }
    },
    createLabel: function (text) {
        var obj = document.createElement('label');
        obj.style.color = '#ff6e6e';
        obj.style.fontSize = '16px';
        obj.innerHTML = text;
        return obj;
    },
    createLink: function (text, href = 'javascript:void(0);') {
        var obj = document.createElement('a');
        obj.style.color = '#ff6e6e';
        obj.style.fontSize = '16px';
        obj.style.textDecoration = 'underline';
        obj.href = href;
        obj.target = '_blank';
        obj.innerHTML = text;
        return obj;
    },
    createButton: function (text, func) {
        var obj = document.createElement('a');
        obj.style.color = '#ff6e6e';
        obj.style.fontSize = '16px';
        obj.style.display = 'block';
        obj.style.textDecoration = 'underline';
        obj.href = 'javascript:void(0);';
        obj.onclick = func;
        obj.innerHTML = text;
        return obj;
    },
    teamMembers: [
        { "userName": "Terry (Xiaoyu) Luo" },
        { "userName": "Yiming Liu" },
        { "userName": "Tony (Sichao) Qian" },
        { "userName": "Diri (Jianwei) Guo" },

    ],
    urls: {
        "OctopusShop": "https://deploy.iherb.net/app#/projects/shop",
        "OctopusCSPortal": "https://deploy.iherb.net/app#/projects/cs-portal",
        "CDJenkinsCS": "https://jenkins.iherb.io/job/backoffice/job/CS/job",
        "CDJenkinsBuildNow": "build?delay=0sec",
        "CIJenkinsCSSearch": "https://jenkins-ci.iherb.net/job/backoffice/job/CS/search/?q=",
        "CSConfig": "https://bitbucket.org/iherbllc/backoffice.cs.config/src/master",
        "DataDog": "https://app.datadoghq.com/infrastructure?filter=",
        BackOfficeTestSwagger: (a) => `https://backoffice-${a}.internal.iherbtest.io/swagger/index.html`,
        BackOfficeProdSwagger: (a) => `https://backoffice-${a}.central.iherb.io/swagger/index.html`,
        TfsLog: (a) => `https://tfs.iherb.net/tfs/iHerb%20Projects%20Collection/8c0065ee-bf13-4864-b26d-6c887fc45f05/_apis/build/builds/${a}/logs/3`,
    },
    serviceConfigs: {},
    init: async function () {
        this.serviceConfigs = [
            {
                "name": "legacy.checkout-web",
                "fullslug": "iherbllc/legacy.checkout-web",
                "defaultBranch": "staging",
                "buildLinks": {
                    "ShopService": "https://tfs.iherb.net/tfs/iHerb%20Projects%20Collection/iHerbDev/Orders%20and%20Communications/_build/index?context=mine&path=%5CWebDev&definitionId=1053",
                    "DataContract": "https://tfs.iherb.net/tfs/iHerb%20Projects%20Collection/iHerbDev/Cart/_build/index?context=allDefinitions&path=%5CWebDev&definitionId=1067"
                },
                "deployLinks": {
                    "ShopService": `${this.urls.OctopusShop}/overview`
                },
                "definitionIds": {
                    "1053": `${this.urls.OctopusShop}/overview`
                },
                "configLinks": {
                    "Config": `${this.urls.OctopusShop}/variables`
                },
                "envLinks": {
                    "DataDog": `${this.urls.DataDog}SHOP%24SFV`
                },
            },
            {
                "name": "legacy.customerservice",
                "fullslug": "iherbllc/legacy.customerservice",
                "defaultBranch": "master",
                "buildLinks": {
                    "Release": "https://tfs.iherb.net/tfs/iHerb%20Projects%20Collection/iHerbDev/Orders%20and%20Communications/_build/index?definitionId=763",
                },
                "deployLinks": {
                    "Release": `${this.urls.OctopusCSPortal}/overview`
                },
                "configLinks": {
                    "Config": `${this.urls.OctopusCSPortal}/variables`
                },
                "definitionIds": {
                    "763": `${this.urls.OctopusCSPortal}/overview`
                },
                "envLinks": {
                    "Test": "https://csportal-beta-test.iherb.net/",
                    "Prod": "https://csportalext.iherb.net/",
                },
            },
            // example
            //             {
            //                 "name": "backoffice.cs.customer.service",
            //                 "fullslug": "iherbllc/backoffice.cs.customer.service",
            //                 "defaultBranch": "master",
            //                 "buildLinks": {
            //                     "Jenkins": `${this.urls.CIJenkinsCSSearch}cs-customer-service`
            //                 },
            //                 "deployLinks": {
            //                     "Jenkins":  `${this.urls.CDJenkinsCS}/cs-customer-service/`
            //                 },
            //                 "configLinks": {
            //                     "Config": `${this.urls.CSConfig}/cs-customer-service/`
            //                 },
            //                 "envLinks": {
            //                     "Test": this.urls.BackOfficeTestSwagger('cs-customer-service'),
            //                     "Prod": this.urls.BackOfficeProdSwagger('cs-customer-service'),
            //                 },
            //                 "definitionIds": {
            //                     "cs-customer-service": `${this.urls.CDJenkinsCS}/cs-customer-service/${this.urls.CDJenkinsBuildNow}`
            //                 }
            //             },

            {
                "name": "backoffice.promos.manager.rewardservice",
                "jenkinsName": "promos-manager-reward-service",
                "fullslug": "iherbllc/backoffice.promos.manager.rewardservice",
                "defaultBranch": "master",
                "buildLinks": {
                    "Jenkins": "https://jenkins-ci.iherb.net/job/backoffice/job/RewardCampaign/search/?q=promos-manager-reward-service",
                },
                "deployLinks": {
                    "Jenkins": "https://jenkins.iherb.io/job/backoffice/job/RewardCampaign/job/promos-manager-reward-service/"
                },
                "configLinks": {
                    "Config": ""
                },
                "envLinks": {
                    "Test": "",
                },
            },
            { "name": "backoffice.cs.reward.service" },
            { "name": "backoffice.cs.proxy.service" },
            { "name": "backoffice.cs.customer.service" },
            { "name": "backoffice.cs.reward.core.service" },

        ];
        for (var item of this.serviceConfigs) {
            if (item.name.startsWith('backoffice.')) {
                item.jenkinsName = item.name.replace('backoffice.', '').replace(/\./g, '-');
                item.fullslug = item.fullslug || `iherbllc${item.name}`;
                item.defaultBranch = item.defaultBranch || 'master';
                item.buildLinks = item.buildLinks || {};
                item.deployLinks = item.deployLinks || {};
                item.configLinks = item.configLinks || {};
                item.envLinks = item.envLinks || {};
                item.definitionIds = item.definitionIds || {};
                item.buildLinks.Jenkins = item.buildLinks.Jenkins || `${this.urls.CIJenkinsCSSearch}${item.jenkinsName}`;
                item.deployLinks.Jenkins = item.deployLinks.Jenkins || `${this.urls.CDJenkinsCS}/${item.jenkinsName}/`;
                item.configLinks.Config = item.configLinks.Config || `${this.urls.CSConfig}/${item.jenkinsName}/`;
                item.envLinks.Test = item.envLinks.Test || this.urls.BackOfficeTestSwagger(item.jenkinsName);
                item.envLinks.Prod = item.envLinks.Prod || this.urls.BackOfficeProdSwagger(item.jenkinsName);
                item.definitionIds[item.jenkinsName] = item.definitionIds[item.jenkinsName] || `${this.urls.CDJenkinsCS}/${item.jenkinsName}/${this.urls.CDJenkinsBuildNow}`;
            }
        }
        this.async(() => this.cleanValues());
    },
    keys: {
        'TfsBuildId': 'TfsBuildId', 'GMailBody': 'GMailBody', 'Tfs': 'Tfs'
    },
    swaggers: {
        "https://client-rewards-backoffice.internal.iherbtest.io/rewards/create": [
            "localhost:44300",
            "backoffice-cs-reward-service.internal.iherbtest.io",
        ],
    },
    searchConfigByUrl(url) {
        for (var a of this.serviceConfigs) {
            for (var key in a.envLinks) {
                if (a.envLinks[key] == url) { return a; }
            }
        }
        return null;
    },
    getDeployUrlByDefinitionId(id) {
        for (var a of this.serviceConfigs) {
            for (var key in a.definitionIds) {
                if (key == id) { return a.definitionIds[key] }
            }
        }
        return '';
    },
    getDefaultBranch: function (name) {
        var res = this.serviceConfigs.filter((a) => a.name == name);
        return res.length ? res[0].defaultBranch : 'master';
    },
    getBuildLinks: function (name) {
        var res = this.serviceConfigs.filter((a) => a.name == name);
        return res.length ? res[0].buildLinks : { 'N/A': 'javascript:alert("build link not found for service:' + name + '")' };
    },
    getDeployLinks: function (name) {
        var res = this.serviceConfigs.filter((a) => a.name == name);
        return res.length ? res[0].deployLinks : { 'N/A': 'javascript:alert("deploy link not found for service:' + name + '")' };
    },
    getConfigLinks: function (name) {
        var res = this.serviceConfigs.filter((a) => a.name == name);
        return res.length ? res[0].configLinks : { 'N/A': 'javascript:alert("config link not found for service:' + name + '")' };
    },
    getEnvLinks: function (name) {
        var res = this.serviceConfigs.filter((a) => a.name == name);
        return res.length ? res[0].envLinks : { 'N/A': 'javascript:alert("env link not found for service:' + name + '")' };
    },
    getApproveUsers: function (curUser) {
        return this.teamMembers.filter((a) => a.userName != curUser);
    },
    start: function () {
        return {
            startTime: Date.now(),
            reset: function () { this.startTime = Date.now(); },
            end: function (txt = '总') { console.log(`${txt}用时${(Date.now() - this.startTime) / 1000}秒`) }
        };
    },
    getQueryString: function (name) {
        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return unescape(r[2]);
        }
        return null;
    },
    getSwaggerEnv: function (swagger) {
        for (var key in this.swaggers) {
            for (var item of this.swaggers[key]) {
                if (item == swagger) {
                    return key;
                }
            }
        }
        return null;
    },
    nodeRemoveCallback: function (node, callback) {
        node.on('DOMNodeRemovedFromDocument', callback);
    },
    nodeInsertCallback: function (node, callback) {
        // use 'one' to avoid endless loop
        node.one('DOMNodeInserted', callback);
    },
    setValue: function (k, v, t = 600000) {
        if (k) {
            GM_setValue(k, { value: v, expire: Date.now() + t });
        }
    },
    setValueNotExpired: function (k, v) {
        this.setValue(k, v, Number.MAX_SAFE_INTEGER);
    },
    getValue: function (k) {
        var res = GM_getValue(k);
        if (res && res.expire > Date.now()) {
            return res.value;
        } else {
            this.removeValue(k);
        }
    },
    removeValue: function (k) {
        GM_deleteValue(k);
    },
    listValues: function () {
        return GM_listValues();
    },
    cleanValues: function () {
        for (var a of this.listValues()) {
            this.getValue(a);
        }
    },
    copy: function (data) {
        GM_setClipboard(data, 'text');
    },
    getMailTo: function (obj) {
        var to = escape(obj.to || '');
        var cc = escape(obj.cc || '');
        var bcc = escape(obj.bcc || '');
        var subject = escape(obj.subject || '');
        var body = escape(obj.body || '');
        return `mailto:${to}?cc=${cc}&bcc=${bcc}&subject=${subject}&body=${body}`;
    },
    dateFormat: function (date, fmt = 'yyyy-MM-dd hh:mm:ss') {
        var o = {
            "M+": date.getMonth() + 1, //月份
            "d+": date.getDate(), //日
            "h+": date.getHours(), //小时
            "m+": date.getMinutes(), //分
            "s+": date.getSeconds(), //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    },
    open: function (url, option) {
        return GM_openInTab(url);
    },
    openActive: function (url) {
        return GM_openInTab(url, { 'active': true });
    },
    addListener: function (key, callback) {
        // function(name, old_value, new_value, remote)
        return GM_addValueChangeListener(key, callback);
    },
    removeListener: function (id) {
        return GM_removeValueChangeListener(id);
    },
    listenOnce: function (key, callback) {
        var id;
        var m = (a, b, c, d) => {
            callback(a, b, c, d);
            this.removeListener(id);
        };
        id = this.addListener(key, m);
        return id;
    },
    inputEvent: new Event('input', { bubbles: true }),
    originSet: Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set,
    // for react change input value
    reactSet(obj, val) {
        obj = this.transferJqueryObj(obj);
        this.originSet.call(obj, val);
        obj.dispatchEvent(this.inputEvent);
    },
    getTfsLog(id, callback) {
        var val = this.getTfsLogFromCache(id);
        if (id in val) {
            callback(val[id]);
            return new Promise((a) => a());
        } else {
            return $.ajax({
                url: this.urls.TfsLog(id), success: res => {
                    var title = this.transLog(res);
                    val = this.getValue(this.keys.Tfs);
                    val[id] = title;
                    this.setValueNotExpired(this.keys.Tfs, val);
                    callback(title);
                }
            }).promise();
        }
    },
    getTfsLogFromCache(id) {
        var val = this.getValue(this.keys.Tfs);
        if (val == null) {
            val = {};
            this.setValueNotExpired(this.keys.Tfs, val);
        }
        return val;
    },
    getTfsLogEx(id, callback) {
        var val = this.getTfsLogFromCache(id);
        var url = this.urls.TfsLog(id);
        if (id in val) {
            callback(val[id]);
            return new Promise((a) => a());
        } else {
            var tab = this.open(url);
            return new Promise(resolve => {
                lymTM.listenOnce(url, async (a, b, c) => {
                    tab.close();
                    callback(c.value);
                    var val = this.getValue(this.keys.Tfs);
                    val[id] = c.value;
                    this.setValueNotExpired(this.keys.Tfs, val);
                    resolve();
                });
            });
        }
    },
    transLog(log) {
        var lines = log.split('\n');
        var flag = false;
        var title = '';
        for (var line of lines) {
            if (line.includes('Previous HEAD position was')) { flag = true; }
            if (flag) {
                var arr = line.split(' ');
                var date = new Date(arr[0]);
                arr[0] = lymTM.dateFormat(date);
                title = `${arr.join(' ')}\n\n` + title;
            }
            if (line.includes('HEAD is now at')) { break; }
        }
        return title;
    },
    getServiceNameByJenkinsName(jenkinsName) {
        var res = this.serviceConfigs.filter((a) => a.jenkinsName == jenkinsName);
        return res.length ? res[0].name : '';
    },
    generateRelativeLinks(serviceName, $, currentUrl = '') {
        var buildDiv = $('<div style="margin-left:15px;font-weight:bold;display:inline">CI:</div>');
        var deployDiv = $('<div style="margin-left:20px;font-weight:bold;display:inline">CD:</div>');
        var configDiv = $('<div style="margin-left:20px;font-weight:bold;display:inline">Config:</div>');
        var envDiv = $('<div style="margin-left:20px;font-weight:bold;display:inline">Env:</div>');
        var wrapDiv = $('<div></div>').append(buildDiv).append(deployDiv).append(configDiv).append(envDiv);
        var buildLinks = lymTM.getBuildLinks(serviceName);
        for (var a in buildLinks) {
            if (currentUrl.startsWith(buildLinks[a])) { continue; }
            $(lymTM.createLink(a, buildLinks[a])).css({ 'margin-left': '6px', 'font-weight': 'normal' }).appendTo(buildDiv);
        }
        var deployLinks = lymTM.getDeployLinks(serviceName);
        for (var b in deployLinks) {
            if (currentUrl.startsWith(deployLinks[b])) { continue; }
            $(lymTM.createLink(b, deployLinks[b])).css({ 'margin-left': '6px', 'font-weight': 'normal' }).appendTo(deployDiv);
        }
        var configLinks = lymTM.getConfigLinks(serviceName);
        for (var c in configLinks) {
            if (currentUrl.startsWith(configLinks[c])) { continue; }
            $(lymTM.createLink(c, configLinks[c])).css({ 'margin-left': '6px', 'font-weight': 'normal' }).appendTo(configDiv);
        }
        var envLinks = lymTM.getEnvLinks(serviceName);
        for (var d in envLinks) {
            if (currentUrl.startsWith(envLinks[d])) { continue; }
            $(lymTM.createLink(d, envLinks[d])).css({ 'margin-left': '6px', 'font-weight': 'normal' }).appendTo(envDiv);
        }
        return wrapDiv;
    },
};
lymTM.init();
