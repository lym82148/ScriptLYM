// ==UserScript==
// @name         Common
// @namespace    http://tampermonkey.net/
// @version      6
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
    async: async function (obj, time = 100) {
        if (typeof obj == 'number') {// 参数是数字
            await this.sleep(obj);
        }
        else if (("$" in unsafeWindow || "$" in window) && obj instanceof $) {// 参数是jQuery对象
            while (!$(obj.selector).length) {
                await this.sleep(time);
            }
            return $(obj.selector);
        }
        else if (obj) { // 参数是方法
            var res;
            while (true) {
                res = obj();
                if (("$" in unsafeWindow || "$" in window) && res instanceof $) {
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
        //                 { "userName": "Tony (Sichao) Qian" },
        //                 { "userName": "Diri (Jianwei) Guo" },

    ],
    urls: {
        "Octopus": "https://deploy.iherb.net/app#/projects/shop/overview"
    },
    serviceConfigs: {},
    init() {
        this.serviceConfigs = [
            {
                "name": "legacy.checkout-web",
                "fullslug": "iherbllc/legacy.checkout-web",
                "defaultBranch": "staging",
                "buildLinks": {
                    "ShopService": "https://tfs.iherb.net/tfs/iHerb%20Projects%20Collection/iHerbDev/Orders%20and%20Communications/_build/index?context=mine&path=%5CWebDev&definitionId=1053&_a=completed",
                    "DataContract": "https://tfs.iherb.net/tfs/iHerb%20Projects%20Collection/iHerbDev/Cart/_build/index?context=allDefinitions&path=%5CWebDev&definitionId=1067"
                },
                "deployLinks": {
                    "ShopService": this.urls.Octopus
                },
                "definitionId": {
                    "1053": this.urls.Octopus,
                    "1067": ""
                },
                "configLinks": {
                    "Config": "https://deploy.iherb.net/app#/projects/shop/variables"
                }
            },
            {
                "name": "backoffice.cs.proxy.service",
                "fullslug": "iherbllc/backoffice.cs.proxy.service",
                "defaultBranch": "master",
                "buildLinks": {
                    "Master": "https://jenkins-ci.iherb.net/job/backoffice/job/CS/job/cs-proxy-service(master)/",
                },
                "deployLinks": {
                    "Master": "https://jenkins.iherb.io/job/backoffice/job/CS/job/cs-proxy-service/"
                },
                "configLinks": {
                    "Config": "https://bitbucket.org/iherbllc/backoffice.cs.config/src/master/cs-proxy-service/"
                }
            },
        ]
    },
    keys: {
        'TfsBuildId': 'TfsBuildId', 'GMailBody': 'GMailBody'
    },
    swaggers: {
        "localhost:44300": "https://client-rewards-backoffice.internal.iherbtest.io/rewards/create#swagger",
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
        return this.swaggers[swagger];
    },
    nodeRemoveCallback: function (node, callback) {
        node.on('DOMNodeRemovedFromDocument', callback);
    },
    nodeInsertCallback: function (node, callback) {
        // use 'one' to avoid endless loop
        node.one('DOMNodeInserted', callback);
    },
    setValue: function (k, v) {
        if (k) {
            GM_setValue(k, { value: v, expire: Date.now() + 600000 });
        }
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
    dateFormat: function (date, fmt = 'yyyy-MM-dd HH:mm:ss') {
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
    open: function (url) {
        return GM_openInTab(url);
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
    }
};
lymTM.init();
