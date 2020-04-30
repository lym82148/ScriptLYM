// ==UserScript==
// @name         Common
// @namespace    http://tampermonkey.net/
// @version      14
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
    async: async function (obj, execTime = 99999999999, time = 100) {
        var untilTime = +new Date() + execTime;
        if (typeof obj == 'number') {// 参数是数字
            await this.sleep(obj);
        }
        else if (this.isJqueryObj(obj)) {// 参数是jQuery对象
            while (!jQuery(obj.selector).length) {
                if (untilTime < new Date()) {
                    break;
                }
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
                if (untilTime < new Date()) {
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
    approvers: {
        automation: [{ "userName": "Jane (Wenjing) Liu" }]
    },
    localConfigs: { "swaggerTMConfig": "swaggerTMConfig" },
    urls: {
        "OctopusShop": "https://deploy.iherb.net/app#/projects/shop",
        "OctopusCSPortal": "https://deploy.iherb.net/app#/projects/cs-portal",
        "CDJenkinsCS": "https://jenkins.iherb.io/job/backoffice/job/CS/job",
        "CDJenkinsBuildNow": "build?delay=0sec",
        "CIJenkinsCSSearch": "https://jenkins-ci.iherb.net/job/backoffice/job/CS/search/?q=",
        CSConfigValueEdit: (a) => `https://bitbucket.org/iherbllc/backoffice.cs.config/src/master/${a}/override/values.la-test.yaml?mode=edit&spa=0&at=master&fileviewer=file-view-default`,
        CSConfigValueProdEdit: (a) => `https://bitbucket.org/iherbllc/backoffice.cs.config/src/master/${a}/override/values.oregon-central-0.yaml?mode=edit&spa=0&at=master&fileviewer=file-view-default`,
        //         CSConfigValue:(a)=>`https://bitbucket.org/iherbllc/backoffice.cs.config/src/master/${a}/override/values.la-test.yaml`,
        "DataDog": "https://app.datadoghq.com/infrastructure?filter=",
        BackOfficeTestSwagger: (a) => `https://backoffice-${a}.internal.iherbtest.io/swagger/index.html`,
        BackOfficeProdSwagger: (a) => `https://backoffice-${a}.central.iherb.io/swagger/index.html`,
        TfsLog: (a) => `https://tfs.iherb.net/tfs/iHerb%20Projects%20Collection/8c0065ee-bf13-4864-b26d-6c887fc45f05/_apis/build/builds/${a}/logs/3`,
        JenkinsLog: (a) => `https://jenkins-ci.iherb.net${a}/wfapi/changesets`,
        JiraStoryLink: (a) => `https://iherbglobal.atlassian.net/browse/${a}`,
        JiraFilterLink: "https://iherbglobal.atlassian.net/issues/?filter=11293",
        JiraSprintLink: (a) => `https://iherbglobal.atlassian.net/secure/RapidBoard.jspa?rapidView=374&assignee=${a}`,
        BackOfficeConfigFile: (a) => (b) => `https://bitbucket.org/iherbllc/backoffice.${a}/raw/${b}/src/${a}.API/appsettings.json`,
        BackOfficeConfigFileDev: (a) => (b) => `https://bitbucket.org/iherbllc/backoffice.${a}/raw/${b}/src/${a}.API/appsettings.Development.json`,
        BranchListApi: (a) => `https://bitbucket.org/!api/internal/repositories/iherbllc/${a}/branch-list/?sort=ahead&pagelen=30&fields=values.name`
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
                "name": "backoffice.csportal-automation",
                "fullslug": "iherbllc/backoffice.cs.customer.service",
                "defaultBranch": "develop",
                "buildLinks": {
                    //                     "Jenkins": `${this.urls.CIJenkinsCSSearch}cs-customer-service`
                },
                "deployLinks": {
                    //                     "Jenkins":  `${this.urls.CDJenkinsCS}/cs-customer-service/`
                },
                "configLinks": {
                    //                     "Config": `${this.urls.CSConfig}/cs-customer-service/`
                },
                "envLinks": {
                    //                     "Test": this.urls.BackOfficeTestSwagger('cs-customer-service'),
                    //                     "Prod": this.urls.BackOfficeProdSwagger('cs-customer-service'),
                },
                "definitionIds": {
                    //                     "cs-customer-service": `${this.urls.CDJenkinsCS}/cs-customer-service/${this.urls.CDJenkinsBuildNow}`
                },
                "approvers": "automation",
            },
            { "name": "backoffice.rewards-web-automation", "approvers": "automation" },
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
            {
                "name": "backoffice.cs.proxy.service",
                "projectConfigFileDev": (b) => `https://bitbucket.org/iherbllc/backoffice.cs.proxy.service/raw/${b}/src/Backoffice.CS.Proxy.Service.API/appsettings.Development.json`
            },
            { "name": "backoffice.cs.customer.service" },
            { "name": "backoffice.cs.reward.core.service" },
            {
                "name": "backoffice.infrastructure.mailservice",
                "jenkinsName": "backoffice-infrastructure-mailservice",
                "configLinks": {
                    "Test": "https://bitbucket.org/iherbllc/backoffice.reward.config/src/master/backoffice-infrastructure-mailservice/override/values.la-test.yaml?mode=edit&spa=0&at=master&fileviewer=file-view-default",
                    "Prod": "https://bitbucket.org/iherbllc/backoffice.reward.config/src/master/backoffice-infrastructure-mailservice/override/values.oregon-central-0.yaml?mode=edit&spa=0&at=master&fileviewer=file-view-default",
                },
                "projectConfigFile": (b) => `https://bitbucket.org/iherbllc/backoffice.infrastructure.mailservice/raw/${b}/src/iHerb.BackOffice.Infrastructure.MailService.Api/appsettings.json`,
                "projectConfigFileDev": (b) => `https://bitbucket.org/iherbllc/backoffice.infrastructure.mailservice/raw/${b}/src/iHerb.BackOffice.Infrastructure.MailService.Api/appsettings.Development.json`,
                "deployLinks": {
                    "Jenkins": "https://jenkins.iherb.io/job/backoffice/job/RewardCampaign/job/backoffice-infrastructure-mailservice/"
                },
            },

        ];
        for (var item of this.serviceConfigs) {
            if (item.name.startsWith('backoffice.')) {
                item.nameEx = item.name.replace('backoffice.', '');
                item.projectName = item.nameEx.replace(/\.\w/g, (word) => word.toUpperCase()).replace(/^cs./, 'CS.');
                item.jenkinsName = item.jenkinsName || item.nameEx.replace(/\./g, '-');
                item.fullslug = item.fullslug || `iherbllc${item.name}`;
                item.defaultBranch = item.defaultBranch || 'master';
                item.buildLinks = item.buildLinks || {};
                item.deployLinks = item.deployLinks || {};
                item.configLinks = item.configLinks || {};
                item.envLinks = item.envLinks || {};
                item.definitionIds = item.definitionIds || {};
                item.buildLinks.Jenkins = item.buildLinks.Jenkins || `${this.urls.CIJenkinsCSSearch}${item.jenkinsName}`;
                item.deployLinks.Jenkins = item.deployLinks.Jenkins || `${this.urls.CDJenkinsCS}/${item.jenkinsName}/`;
                item.configLinks.Test = item.configLinks.Test || this.urls.CSConfigValueEdit(item.jenkinsName);
                item.configLinks.Prod = item.configLinks.Prod || this.urls.CSConfigValueProdEdit(item.jenkinsName);
                item.envLinks.Test = item.envLinks.Test || this.urls.BackOfficeTestSwagger(item.jenkinsName.replace(/^backoffice-/, ''));
                item.envLinks.Prod = item.envLinks.Prod || this.urls.BackOfficeProdSwagger(item.jenkinsName.replace(/^backoffice-/, ''));
                item.definitionIds[item.jenkinsName] = item.definitionIds[item.jenkinsName] || `${item.deployLinks.Jenkins}${this.urls.CDJenkinsBuildNow}`;
                item.projectConfigFile = item.projectConfigFile || this.urls.BackOfficeConfigFile(item.projectName);
                item.projectConfigFileDev = item.projectConfigFileDev || this.urls.BackOfficeConfigFileDev(item.projectName);
            }
        }
        this.cleanValues();
    },
    keys: {
        'TfsBuildId': 'TfsBuildId', 'GMailBody': 'GMailBody', 'Tfs': 'Tfs', 'Jenkins': 'Jenkins', 'Swagger': 'Swagger'
    },
    swaggers: {
        "https://client-rewards-backoffice.internal.iherbtest.io/rewards/create": [
            "localhost:44300",
            "backoffice-cs-reward-service.internal.iherbtest.io"
        ],
        "https://cs-portal.backoffice.iherbtest.net/rewards/hyperwallet": [
            "localhost:5000",
            "localhost:54319",
            "backoffice-cs-reward-core-service.internal.iherbtest.io",
            "localhost:56322",
            "backoffice-cs-customer-service.internal.iherbtest.io",
        ]
    },
    searchConfigByUrl(url) {
        for (var a of this.serviceConfigs) {
            for (var key in a.envLinks) {
                if (a.envLinks[key] == url) { return a; }
            }
        }
        return null;
    },
    async getBranchesByName(jenkinsName) {
        var branchList = [];
        var res = this.serviceConfigs.filter((a) => a.jenkinsName == jenkinsName);
        if (!res.length) return branchList;
        var url = this.urls.BranchListApi(res[0].name);
        try {
            await $.ajax({
                url: url, success: (res) => {
                    branchList = res.values.map(a => a.name);
                }
            }).promise();
        } catch (e) { }
        return branchList;
    },
    getDeployUrlByDefinitionId(id) {
        for (var a of this.serviceConfigs) {
            for (var key in a.definitionIds) {
                if (key == id) { return a.definitionIds[key] }
            }
        }
        return '';
    },
    getProjectConfigFile: function (jenkinsName, branchName) {
        var res = this.serviceConfigs.filter((a) => a.jenkinsName == jenkinsName);
        return res.length ? res[0].projectConfigFile(branchName) : '';
    },
    getProjectConfigFileDev: function (jenkinsName, branchName) {
        var res = this.serviceConfigs.filter((a) => a.jenkinsName == jenkinsName);
        return res.length ? res[0].projectConfigFileDev(branchName) : '';
    },
    getRefreshLogLink: function (name) {
        var res = this.serviceConfigs.filter((a) => a.name == name);
        if (res.length && res[0].buildLinks) {
            var key = Object.keys(res[0].buildLinks);
            var value = res[0].buildLinks[key];
            if (value) {
                return `${value}#refresh`;
            }
        }
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
    getApproveUsers: function (curUser, name) {
        var res = this.serviceConfigs.filter((a) => a.name == name);
        if (res.length && res[0].approvers) {
            return this.approvers[res[0].approvers].filter((a) => a.userName != curUser);
        } else {
            return this.teamMembers.filter((a) => a.userName != curUser);
        }
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
    originSetTextArea: Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set,
    originSetSelect: Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set,
    originSetOption: Object.getOwnPropertyDescriptor(HTMLOptionElement.prototype, 'selected').set,


    // for react change input value
    reactSet(obj, val) {
        obj = this.transferJqueryObj(obj);
        if (obj instanceof HTMLInputElement) {
            this.originSet.call(obj, val);
        } else if (obj instanceof HTMLTextAreaElement) {
            this.originSetTextArea.call(obj, val);
        } else if (obj instanceof HTMLSelectElement) {
            this.originSetSelect.call(obj, val);
        } else if (obj instanceof HTMLOptionElement) {
            this.originSetOption.call(obj, val);
        }
        obj.dispatchEvent(this.inputEvent);
    },
    async get(url, success, error) {
        try {
            await $.ajax({
                url: url, success: success, error: error
            }).promise();
        } catch (e) { }
    },
    async getTfsLog(id, callback) {
        var val = this.getTfsLogFromCache(id);
        if (id in val) {
            callback(val[id]);
            return new Promise((a) => a());
        } else {
            await $.ajax({
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
    clearSwaggerCache(id) {
        var val = this.getSwaggerCacheFromCache(id);
        val[id] = [];
        this.setValueNotExpired(this.keys.Swagger, val);
    },
    updateSwaggerCache(id, key, alwaysTop, txt) {
        var val = this.getSwaggerCacheFromCache(id);
        if (val[id]) {
            var index = val[id].findIndex(a => a.guid == key);
            var model = val[id][index];
            if (model) {
                if (alwaysTop != null) {
                    model.alwaysTop = alwaysTop;
                    val[id].splice(index, 1);
                    if (model.alwaysTop) {
                        val[id].push(model);
                    } else {
                        val[id].unshift(model);
                    }
                }
                if (txt != null) { model.txt = txt; }
                this.setValueNotExpired(this.keys.Swagger, val);
            }
        }
    },
    setSwaggerCache(id, value) {
        var val = this.getSwaggerCacheFromCache(id);
        if (!val[id]) {
            val[id] = [];
        }
        var index = val[id].findIndex(b => JSON.stringify(b.value) == JSON.stringify(value));
        var newItem = Object.create(null);
        if (index >= 0) {
            var temp = val[id][index];
            delete val[id][index];
            val[id] = val[id].filter(b => b);
            newItem = temp;
            newItem.count++;
        } else {
            newItem.value = value;
            newItem.count = 1;
            newItem.guid = this.guid();
        }
        val[id].push(newItem);
        while (val[id].length > 10) {
            val[id].shift();
        }
        this.setValueNotExpired(this.keys.Swagger, val);
        return val;
    },
    getSwaggerCache(id) {
        var val = this.getSwaggerCacheFromCache(id);
        return val[id];
    },
    getSwaggerCacheFromCache() {
        var val = this.getValue(this.keys.Swagger);
        if (val == null) {
            val = Object.create(null);
            this.setValueNotExpired(this.keys.Swagger, val);
        }
        return val;
    },
    getTfsLogFromCache(id) {
        var val = this.getValue(this.keys.Tfs);
        if (val == null) {
            val = Object.create(null);
            this.setValueNotExpired(this.keys.Tfs, val);
        }
        return val;
    },
    getJenkinsLogFromCache() {
        var val = this.getValue(this.keys.Jenkins);
        if (val == null) {
            val = Object.create(null);
            this.setValueNotExpired(this.keys.Jenkins, val);
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
    setJenkinsLogNoChange(id, key) {
        var val = this.getJenkinsLogFromCache();
        var url = this.urls.JenkinsLog(id);
        if (!(key in val)) {
            val[key] = null;
            this.setValueNotExpired(this.keys.Jenkins, val);
        }
    },
    getJenkinsLogEx(id, callback, key) {
        var val = this.getJenkinsLogFromCache();
        var url = this.urls.JenkinsLog(id);
        if (key in val) {
            if (callback) {
                callback(val[key]);
            }
            return new Promise((a) => a());
        } else {
            this.setValue(url, key);
            var tab = this.open(url);
            return new Promise(resolve => {
                lymTM.listenOnce(url, async (a, b, c) => {
                    console.log('close tab:', id);
                    tab.close();
                    if (callback) {
                        callback(c.value);
                    }
                    var val = this.getValue(this.keys.Jenkins);
                    val[key] = c.value;
                    this.setValueNotExpired(this.keys.Jenkins, val);
                    resolve();
                });
            });
        }
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
    async maskDiv(condition, action, $) {
        $ = $ || unsafeWindow.$;
        var maskDiv = $('<div style="background-color: #ade2ff99;height: 5000px;position: absolute;z-index: 9999;width: 65%;top: 0px;left: 0px;"></div>');
        var maskDivEx = $('<div style="background-color: #ffc6ba99;height: 5000px;position: absolute;z-index: 9999;width: 35%;top: 0px;left: 65%;"></div>');
        var userAction = false;
        var cancelSignal = false;
        maskDiv.click(function () {
            userAction = true;
            cancelSignal = false;
            maskDiv.remove();
            maskDivEx.remove();
        });
        maskDivEx.click(function () {
            userAction = true;
            cancelSignal = true;
            maskDiv.remove();
            maskDivEx.remove();
        });
        $('body').append(maskDiv).append(maskDivEx);
        // wait user cancel or 1.5 seconds
        await lymTM.async(() => userAction, 1500);
        // wait condition, for example:chrome auto fill
        if (condition) {
            await lymTM.async(condition);
            // when user click, chrome auto fill event will trigger first,so we need to wait cancelSignal for a while;
            await lymTM.async(50);
        }
        if (!cancelSignal) {
            maskDiv.remove();
            maskDivEx.remove();
            action();
        }
    },
    transferConfigJson(json, parentKey, res) {
        if (!res) {
            res = Object.create(null);
        }
        if (!parentKey) {
            parentKey = '';
        } else {
            parentKey = `${parentKey}__`;
        }
        for (var key in json) {
            var currentKey = parentKey + key;
            if (json[key] instanceof Object) {
                this.transferConfigJson(json[key], currentKey, res);
            } else {
                if (currentKey in res) {
                    console.warn(`duplicated config '${currentKey}': '${res[currentKey]}' '${currentKey}: ${json[key]}'`);
                } else {
                    res[currentKey] = json[key];
                }
            }
        }
        return res;
    },
    guid() {
        var S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    },



};
lymTM.init();
