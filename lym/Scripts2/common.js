// ==UserScript==
// @name         Common
// @namespace    http://tampermonkey.net/
// @version      22
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
        //         { "userName": "Tony (Sichao) Qian" },
        { "userName": "Diri (Jianwei) Guo" },
    ],
    approvers: {
        automation: [{ "userName": "Jane (Wenjing) Liu" }]
    },
    localConfigs: { "swaggerTMConfig": "swaggerTMConfig", "idTMConfig": "idTMConfig" },
    urls: {
        "OctopusShop": "https://deploy.iherb.net/app#/projects/shop",
        "OctopusCSPortal": "https://deploy.iherb.net/app#/projects/cs-portal",
        "CDJenkinsCS": "https://jenkins.iherb.io/job/backoffice-cs/job",
        "CDJenkinsBuildNow": "build?delay=0sec",
        "CIJenkinsCSSearch": "https://jenkins-ci.iherb.net/job/backoffice/job/CS/search/?q=",
        "CIJenkinsPromosSearch": "https://jenkins-ci.iherb.net/job/backoffice/job/promos/search/?q=",
        CSConfigValueEdit: (a) => `https://bitbucket.org/iherbllc/backoffice.cs.config/src/master/${a}/override/values.la-test.yaml?mode=edit&spa=0&at=master&fileviewer=file-view-default`,
        CSConfigValuePreprodEdit: (a) => `https://bitbucket.org/iherbllc/backoffice.cs.config/src/master/${a}/override/values.oregon-central-preprod-0.yaml?mode=edit&spa=0&at=master&fileviewer=file-view-default`,
        CSConfigValueProdEdit: (a) => `https://bitbucket.org/iherbllc/backoffice.cs.config/src/master/${a}/override/values.oregon-central-0.yaml?mode=edit&spa=0&at=master&fileviewer=file-view-default`,
        PromosConfigValueEdit: (a) => `https://bitbucket.org/iherbllc/backoffice.reward.config/src/master/${a}/override/values.la-test.yaml?mode=edit&spa=0&at=master&fileviewer=file-view-default`,
        PromosConfigValuePreprodEdit: (a) => `https://bitbucket.org/iherbllc/backoffice.reward.config/src/master/${a}/override/values.oregon-central-preprod-0.yaml?mode=edit&spa=0&at=master&fileviewer=file-view-default`,
        PromosConfigValueProdEdit: (a) => `https://bitbucket.org/iherbllc/backoffice.reward.config/src/master/${a}/override/values.oregon-central-0.yaml?mode=edit&spa=0&at=master&fileviewer=file-view-default`,
        //         CSConfigValue:(a)=>`https://bitbucket.org/iherbllc/backoffice.cs.config/src/master/${a}/override/values.la-test.yaml`,
        "DataDog": "https://app.datadoghq.com/infrastructure?filter=",
        BackOfficeTestSwaggerOld: (a) => `https://backoffice-${a}.internal.iherbtest.io/swagger/index.html`,
        BackOfficeProdSwaggerOld: (a) => `https://backoffice-${a}.central.iherb.io/swagger/index.html`,
        BackOfficeTestSwagger: (a) => `https://${a}.backoffice.iherbtest.net/swagger/index.html`,
        BackOfficeProdSwagger: (a) => `https://${a}.backoffice.iherb.net/swagger/index.html`,
        TfsLog: (a) => `https://tfs.iherb.net/tfs/iHerb%20Projects%20Collection/8c0065ee-bf13-4864-b26d-6c887fc45f05/_apis/build/builds/${a}/logs/3`,
        JenkinsLog: (a) => `https://jenkins-ci.iherb.net${a}/wfapi/changesets`,
        JiraStoryLink: (a) => `https://iherbglobal.atlassian.net/browse/${a}`,
        JiraFilterLink: "https://iherbglobal.atlassian.net/issues/?filter=11293",
        JiraSprintLink: (a) => `https://iherbglobal.atlassian.net/secure/RapidBoard.jspa?rapidView=374&assignee=${a}`,
        BackOfficeConfigFile: (a) => (b) => `https://bitbucket.org/iherbllc/backoffice.${a}/raw/${b}/src/${a}.API/appsettings.json`,
        BackOfficeConfigFileDev: (a) => (b) => `https://bitbucket.org/iherbllc/backoffice.${a}/raw/${b}/src/${a}.API/appsettings.Development.json`,
        RepositoryListApi: (a) => `https://bitbucket.org/!api/internal/dashboard/repositories?pagelen=100&page=${a}&q=`,
        BranchListApi: (a) => `https://bitbucket.org/!api/internal/repositories/iherbllc/${a}/branch-list/?sort=ahead&pagelen=30&fields=values.name`,
        //         RancherTest: "https://rancher.iherb.io/p/c-djzp4:p-pccbf/workloads#deployment:backoffice-cs:",
        RancherTest: "https://rancher.iherb.io/p/c-djzp4:p-pccbf/workload/deployment:backoffice-cs:",
        //         RancherProd: "https://rancher.iherb.io/p/c-457vx:p-n6tcc/workloads#deployment:backoffice-cs:",
        RancherProd: "https://rancher.iherb.io/p/c-457vx:p-n6tcc/workload/deployment:backoffice-cs:",
        RancherPromosTest: "https://rancher.iherb.io/p/c-djzp4:p-pccbf/workloads#deployment:backoffice-cs:",
        RancherPromosProd: "https://rancher.iherb.io/p/c-457vx:p-n6tcc/workloads#deployment:backoffice-cs:",
        BitbucketRepo: "https://bitbucket.org/iherbllc/",
        KibanaTest: (a) => `https://es-test.iherb.net/_plugin/kibana/app/kibana#/discover?_g=(filters:!(),refreshInterval:(display:Off,pause:!f,value:0),time:(from:now-15m,mode:quick,to:now))&_a=(columns:!(kubernetes.container_name,message,log),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'backoffice-cs-*',key:kubernetes.container_name,negate:!f,type:phrase,value:${a}),query:(match:(kubernetes.container_name:(query:${a},type:phrase))))),index:'backoffice-cs-*',interval:auto,query:(match_all:()),sort:!('@timestamp',desc))`,
        KibanaProd: (a) => `https://es-prod.iherb.net/_plugin/kibana/app/kibana#/discover?_g=(refreshInterval:(pause:!t,value:0),time:(from:now-15m,mode:quick,to:now))&_a=(columns:!(kubernetes.container_name,message,log),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'!'backoffice-cs!'',key:kubernetes.container_name,negate:!f,params:(query:${a},type:phrase),type:phrase,value:${a}),query:(match:(kubernetes.container_name:(query:${a},type:phrase))))),index:'!'backoffice-cs!'',interval:auto,query:(language:lucene,query:''),sort:!('@timestamp',desc))`
    },
    serviceConfigs: {},
    init: async function () {
        this.serviceConfigs = [
            {
                "name": "legacy.checkout-web",
                "fullslug": "iherbllc/legacy.checkout-web",
                "defaultBranch": "staging",
                "CILinks": {
                    "ShopService": "https://tfs.iherb.net/tfs/iHerb%20Projects%20Collection/iHerbDev/Orders%20and%20Communications/_build/index?context=mine&path=%5CWebDev&definitionId=1053",
                    "DataContract": "https://tfs.iherb.net/tfs/iHerb%20Projects%20Collection/iHerbDev/Cart/_build/index?context=allDefinitions&path=%5CWebDev&definitionId=1067"
                },
                "CDLinks": {
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
                "CILinks": {
                    "Release": "https://tfs.iherb.net/tfs/iHerb%20Projects%20Collection/iHerbDev/Orders%20and%20Communications/_build/index?definitionId=763",
                },
                "CDLinks": {
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
            //                 "CILinks": {
            //                     "Jenkins": `${this.urls.CIJenkinsCSSearch}cs-customer-service`
            //                 },
            //                 "CDLinks": {
            //                     "Jenkins":  `${this.urls.CDJenkinsCS}/cs-customer-service/${this.urls.CDJenkinsBuildNow}`
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
                "CILinks": {
                    //                     "Jenkins": `${this.urls.CIJenkinsCSSearch}cs-customer-service`
                },
                "CDLinks": {
                    //                     "Jenkins":  `${this.urls.CDJenkinsCS}/cs-customer-service/${this.urls.CDJenkinsBuildNow}`
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
                "CILinks": {
                    "Jenkins": "https://jenkins-ci.iherb.net/job/backoffice/job/RewardCampaign/search/?q=manager-reward-service",
                },
                "CDLinks": {
                    "Jenkins": "https://jenkins.iherb.io/job/backoffice/job/RewardCampaign/job/promos-manager-reward-service/build?delay=0sec"
                },
                "configLinks": {

                },
                "envLinks": {
                    "Test": "https://reward-portal-service.backoffice.iherbtest.net/swagger/index.html",
                    "Prod": "https://promos-backoffice-manager-reward-api.backoffice.iherb.net/swagger/index.html"
                },
                "projectConfigFile": (a) => `https://bitbucket.org/iherbllc/backoffice.promos.manager.rewardservice/raw/${a}/src/iHerb.BackOffice.Promos.Manager.RewardService.API/appsettings.json`,
                "projectConfigFileDev": (a) => `https://bitbucket.org/iherbllc/backoffice.promos.manager.rewardservice/raw/${a}/src/iHerb.BackOffice.Promos.Manager.RewardService.API/appsettings.Development.json`,
                "rancherLinks": {
                    "Prod": "https://rancher.iherb.io/p/c-457vx:p-ndbxv/workload/deployment:backoffice-reward:promos-manager-reward-service"
                }
            },
            {
                "name": "User",
                "envLinks": {
                    "Test": "https://user-external-api.internal.iherbtest.io/swagger/index.html",
                    "Prod": "https://user-external-api.central.iherb.io/swagger/index.html"
                },
            },
            {
                "name": "NewCsPortal",
                "envLinks": {
                    "Test": "https://cs-portal.backoffice.iherbtest.net/rewards/hyperwallet",
                    "Prod": "https://cs-portal.iherb.net/rewards/hyperwallet"
                },
            },
            {
                "name": "RewardPortal",
                "envLinks": {
                    "Test": "https://rewards-web.backoffice.iherbtest.net/rewards",
                    "Prod": "https://rewards-web.backoffice.iherb.net/rewards"
                },
            },
            {
                "name": "RewardPortalEx",
                "envLinks": {
                    "Test": "https://rewards-web.backoffice.iherbtest.net/rewards",
                    "Prod": "https://rewards-web.backoffice.iherb.net/rewards"
                },
            },
            { "name": "backoffice.cs.reward.service" },
            {
                "name": "backoffice.cs.job",
                "projectConfigFile": (a) => `https://bitbucket.org/iherbllc/backoffice.cs.job/raw/${a}/src/backoffice.cs.job/appsettings.json`,
                "projectConfigFileDev": (a) => `https://bitbucket.org/iherbllc/backoffice.cs.job/raw/${a}/src/backoffice.cs.job/appsettings.Development.json`,
                "hangfireLinks": {}
            },
            {
                "name": "users.privacy.syncjob",
                "projectConfigFile": (b) => `https://bitbucket.org/iherbllc/users.privacy.syncjob/raw/${b}/src/Users.Privacy.SyncJob/appsettings.json`,
                "projectConfigFileDev": (b) => `https://bitbucket.org/iherbllc/users.privacy.syncjob/raw/${b}/src/Users.Privacy.SyncJob/appsettings.Development.json`,
                "hangfireLinks": {}
            },
            {
                "name": "backoffice.cs.zendesk.syncjob",
                "projectConfigFile": (b) => `https://bitbucket.org/iherbllc/backoffice.cs.zendesk.syncjob/raw/${b}/src/CS.Zendesk.SyncJob/appsettings.json`,
                "projectConfigFileDev": (b) => `https://bitbucket.org/iherbllc/backoffice.cs.zendesk.syncjob/raw/${b}/src/CS.Zendesk.SyncJob/appsettings.Development.json`,
                "logLinks": {
                    "Test": "https://es-test.iherb.net/_plugin/kibana/app/kibana#/discover?_g=(filters:!(),refreshInterval:(display:Off,pause:!f,value:0),time:(from:now-15m,mode:quick,to:now))&_a=(columns:!(kubernetes.container_name,message,log),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'backoffice-cs-*',key:kubernetes.container_name,negate:!f,type:phrase,value:cs-zendesk-syncjob),query:(match:(kubernetes.container_name:(query:cs-zendesk-syncjob,type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'backoffice-cs-*',key:log,negate:!t,type:phrase,value:HttpClientDelegatingHandler),query:(match:(log:(query:HttpClientDelegatingHandler,type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'backoffice-cs-*',key:log,negate:!t,params:!(AddTicket,AddChat,AddUser),type:phrases,value:'AddTicket,%20AddChat,%20AddUser'),query:(bool:(minimum_should_match:1,should:!((match_phrase:(log:AddTicket)),(match_phrase:(log:AddChat)),(match_phrase:(log:AddUser)))))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'backoffice-cs-*',key:log,negate:!t,params:!(SyncTicket,SyncChat,SyncUser),type:phrases,value:'SyncTicket,%20SyncChat,%20SyncUser'),query:(bool:(minimum_should_match:1,should:!((match_phrase:(log:SyncTicket)),(match_phrase:(log:SyncChat)),(match_phrase:(log:SyncUser))))))),index:'backoffice-cs-*',interval:auto,query:(match_all:()),sort:!('@timestamp',desc))",
                    "Prod": "https://es-prod.iherb.net/_plugin/kibana/app/kibana#/discover?_g=(filters:!(),refreshInterval:(display:Off,pause:!f,value:0),time:(from:now-12h,mode:quick,to:now))&_a=(columns:!(kubernetes.container_name,message,log),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'backoffice-cs-*',key:kubernetes.container_name,negate:!f,params:(query:cs-zendesk-syncjob,type:phrase),type:phrase,value:cs-zendesk-syncjob),query:(match:(kubernetes.container_name:(query:cs-zendesk-syncjob,type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'backoffice-cs-*',key:log,negate:!t,params:(query:HttpClientDelegatingHandler,type:phrase),type:phrase,value:HttpClientDelegatingHandler),query:(match:(log:(query:HttpClientDelegatingHandler,type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'backoffice-cs-*',key:log,negate:!t,params:!(AddTicket,AddChat,AddUser),type:phrases,value:'AddTicket,%20AddChat,%20AddUser'),query:(bool:(minimum_should_match:1,should:!((match_phrase:(log:AddTicket)),(match_phrase:(log:AddChat)),(match_phrase:(log:AddUser)))))),('$state':(store:appState),meta:(alias:!n,disabled:!t,index:'backoffice-cs-*',key:log,negate:!t,params:!(SyncTicket,SyncChat,SyncUser),type:phrases,value:'SyncTicket,%20SyncChat,%20SyncUser'),query:(bool:(minimum_should_match:1,should:!((match_phrase:(log:SyncTicket)),(match_phrase:(log:SyncChat)),(match_phrase:(log:SyncUser))))))),index:'!'backoffice-cs!'',interval:auto,query:(language:lucene,query:''),sort:!('@timestamp',desc))"
                },
                "hangfireLinks": {}
            },
            {
                "name": "backoffice.cs.proxy.service",
                "projectConfigFileDev": (b) => `https://bitbucket.org/iherbllc/backoffice.cs.proxy.service/raw/${b}/src/Backoffice.CS.Proxy.Service.API/appsettings.Development.json`
            },
            {
                "name": "backoffice.cs.customer.service",
                "logLinks": {
                    "Test": "https://es-test.iherb.net/_plugin/kibana/app/kibana#/discover?_g=(filters:!(),refreshInterval:(display:Off,pause:!f,value:0),time:(from:now-15m,mode:quick,to:now))&_a=(columns:!(kubernetes.container_name,message,log),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'backoffice-cs-*',key:kubernetes.container_name,negate:!f,type:phrase,value:cs-customer-service),query:(match:(kubernetes.container_name:(query:cs-customer-service,type:phrase))))),index:'backoffice-cs-*',interval:auto,query:(match_all:()),sort:!('@timestamp',desc))",
                    "Prod": "https://es-prod.iherb.net/_plugin/kibana/app/kibana#/discover?_g=(refreshInterval:(pause:!t,value:0),time:(from:now-15m,mode:quick,to:now))&_a=(columns:!(kubernetes.container_name,message,log),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'!'backoffice-cs!'',key:kubernetes.container_name,negate:!f,params:(query:cs-customer-service,type:phrase),type:phrase,value:cs-customer-service),query:(match:(kubernetes.container_name:(query:cs-customer-service,type:phrase))))),index:'!'backoffice-cs!'',interval:auto,query:(language:lucene,query:''),sort:!('@timestamp',desc))"
                }
            },
            {
                "name": "backoffice.cs.reward.core.service",
                "logLinks": {
                    "Test": "https://es-test.iherb.net/_plugin/kibana/app/kibana#/discover?_g=(filters:!(),refreshInterval:(display:Off,pause:!f,value:0),time:(from:now-15m,mode:quick,to:now))&_a=(columns:!(kubernetes.container_name,message,log),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'backoffice-cs-*',key:kubernetes.container_name,negate:!f,type:phrase,value:cs-reward-core-service),query:(match:(kubernetes.container_name:(query:cs-reward-core-service,type:phrase))))),index:'backoffice-cs-*',interval:auto,query:(match_all:()),sort:!('@timestamp',desc))",
                    "Prod": "https://es-prod.iherb.net/_plugin/kibana/app/kibana#/discover?_g=(refreshInterval:(pause:!t,value:0),time:(from:now-15m,mode:quick,to:now))&_a=(columns:!(kubernetes.container_name,message,log),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'!'backoffice-cs!'',key:kubernetes.container_name,negate:!f,params:(query:cs-reward-core-service,type:phrase),type:phrase,value:cs-reward-core-service),query:(match:(kubernetes.container_name:(query:cs-reward-core-service,type:phrase))))),index:'!'backoffice-cs!'',interval:auto,query:(language:lucene,query:''),sort:!('@timestamp',desc))"
                }
            },
            { "name": "backoffice.cs.reward.bonus.service" },
            {
                "name": "backoffice.cs.user.authentication",
                "CILinks": {
                    "Jenkins": "https://jenkins-ci.iherb.net/search/?q=iherb.cs.user.authentication"
                },
                "CDLinks": {
                    "Jenkins": "https://jenkins-ci.iherb.net/search/?q=iherb.cs.user.authentication"
                },
            },
            {
                "name": "backoffice.cs.user.authentication.ui",
                "jenkinsName": "NuGet%20iHerb.CS.User.Authentication.UI",
                "CILinks": {
                    "Jenkins": "https://jenkins-ci.iherb.net/search/?q=iherb.cs.user.authentication.ui"
                },
                "CDLinks": {
                    "Jenkins": "https://jenkins-ci.iherb.net/search/?q=iherb.cs.user.authentication.ui"
                },
            },
            {
                "name": "backoffice.infrastructure.mailservice",
                "jenkinsName": "backoffice-infrastructure-mailservice",
                "configLinks": {
                    "Test": "https://bitbucket.org/iherbllc/backoffice.reward.config/src/master/backoffice-infrastructure-mailservice/override/values.la-test.yaml?mode=edit&spa=0&at=master&fileviewer=file-view-default",
                    "Prod": "https://bitbucket.org/iherbllc/backoffice.reward.config/src/master/backoffice-infrastructure-mailservice/override/values.oregon-central-0.yaml?mode=edit&spa=0&at=master&fileviewer=file-view-default",
                },
                "projectConfigFile": (b) => `https://bitbucket.org/iherbllc/backoffice.infrastructure.mailservice/raw/${b}/src/iHerb.BackOffice.Infrastructure.MailService.Api/appsettings.json`,
                "projectConfigFileDev": (b) => `https://bitbucket.org/iherbllc/backoffice.infrastructure.mailservice/raw/${b}/src/iHerb.BackOffice.Infrastructure.MailService.Api/appsettings.Development.json`,
                "CILinks": {
                    "Jenkins": "https://jenkins-ci.iherb.net/search/?q=backoffice-infrastructure-mailservice"
                },
                "CDLinks": {
                    "Jenkins": "https://jenkins.iherb.io/job/backoffice/job/RewardCampaign/job/backoffice-infrastructure-mailservice/build?delay=0sec"
                },
                "logLinks": {
                    "Test": "https://es-test.iherb.net/_plugin/kibana/app/kibana#/discover?_g=(filters:!(),refreshInterval:(display:Off,pause:!f,value:0),time:(from:now-15m,mode:quick,to:now))&_a=(columns:!(kubernetes.container_name,message,log),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'backoffice-cs-*',key:kubernetes.container_name,negate:!f,type:phrase,value:backoffice-infrastructure-mailservice),query:(match:(kubernetes.container_name:(query:backoffice-infrastructure-mailservice,type:phrase))))),index:'backoffice-reward-*',interval:auto,query:(match_all:()),sort:!('@timestamp',desc))",
                    "Prod": "https://es-prod.iherb.net/_plugin/kibana/app/kibana#/discover?_g=(refreshInterval:(pause:!t,value:0),time:(from:now-15m,mode:quick,to:now))&_a=(columns:!(kubernetes.container_name,message,log),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'!'backoffice-cs!'',key:kubernetes.container_name,negate:!f,params:(query:cs-reward-core-service,type:phrase),type:phrase,value:cs-reward-core-service),query:(match:(kubernetes.container_name:(query:cs-reward-core-service,type:phrase))))),index:'!'backoffice-cs!'',interval:auto,query:(language:lucene,query:''),sort:!('@timestamp',desc))"
                }
            },
            {
                "name": "legacy.csportal-zendesk",
                "jenkinsName": "csportal-zendesk",
                "CILinks": {
                    "Jenkins": "https://jenkins-ci.iherb.net/job/checkout/job/csportal-zendesk/job/csportal-zendesk/",
                },
                "logLinks": {
                    "Prod": "https://es-prod.iherb.net/_plugin/kibana/app/kibana#/discover?_g=(refreshInterval:(pause:!t,value:0),time:(from:now-24h,mode:quick,to:now))&_a=(columns:!(message,kubernetes.container_name),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'!'backoffice-cs!'',key:kubernetes.container_name,negate:!f,params:(query:zendesk,type:phrase),type:phrase,value:zendesk),query:(match:(kubernetes.container_name:(query:zendesk,type:phrase))))),index:checkout,interval:auto,query:(language:lucene,query:''),sort:!('@timestamp',desc))"
                }
            },
            {
                "name": "rewards-csportal",
                "envLinks": {
                    "Test": "https://rewards-csportal.internal.iherbtest.io/swagger/index.html",
                    "Preprod": "https://rewards-csportal.central.iherbpreprod.io/swagger/index.html",
                    "Prod": "https://rewards-csportal.central.iherb.io/swagger/index.html",
                }
            },
            {
                "name": "rewards-cashout-csportal",
                "envLinks": {
                    "Test": "https://rewards-cashout-csportal.internal.iherbtest.io/swagger/index.html",
                    "Preprod": "https://rewards-cashout-csportal.central.iherbpreprod.io/swagger/index.html",
                    "Prod": "https://rewards-cashout-csportal.central.iherb.io/swagger/index.html",
                }
            },
            {
                "name": "rewards",
                "envLinks": {
                    "Test": "https://rewards.internal.iherbtest.io/swagger/index.html",
                    "Preprod": "https://rewards.central.iherbpreprod.io/swagger/index.html",
                    "Prod": "https://rewards.central.iherb.io/swagger/index.html",
                }
            }
        ];
        for (var item of this.serviceConfigs) {
            if (item.name.startsWith('backoffice.') || item.name == 'users.privacy.syncjob') {
                item.nameEx = item.name.replace('backoffice.', '');
                item.projectName = item.nameEx.replace(/\.\w/g, (word) => word.toUpperCase()).replace(/^cs./, 'CS.');
                item.jenkinsName = item.jenkinsName || item.nameEx.replace(/\./g, '-');
                item.fullslug = item.fullslug || `iherbllc${item.name}`;
                item.defaultBranch = item.defaultBranch || 'master';
                item.CILinks = item.CILinks || {};
                item.CDLinks = item.CDLinks || {};
                item.configLinks = item.configLinks || {};
                item.envLinks = item.envLinks || {};
                item.logLinks = item.logLinks || {};
                item.rancherLinks = item.rancherLinks || {};
                item.definitionIds = item.definitionIds || {};
                item.CDLinks.Jenkins = item.CDLinks.Jenkins || `${this.urls.CDJenkinsCS}/${item.jenkinsName}/${this.urls.CDJenkinsBuildNow}`;
                if (item.name.startsWith('backoffice.cs.') || item.name == 'users.privacy.syncjob') {
                    item.CILinks.Jenkins = item.CILinks.Jenkins || `${this.urls.CIJenkinsCSSearch}${item.jenkinsName}`;
                    item.configLinks.Test = item.configLinks.Test || this.urls.CSConfigValueEdit(item.jenkinsName);
                    item.configLinks.Preprod = item.configLinks.Preprod || this.urls.CSConfigValuePreprodEdit(item.jenkinsName);
                    item.configLinks.Prod = item.configLinks.Prod || this.urls.CSConfigValueProdEdit(item.jenkinsName);
                    item.rancherLinks.Test = item.rancherLinks.Test || this.urls.RancherTest + item.jenkinsName;
                    item.rancherLinks.Prod = item.rancherLinks.Prod || this.urls.RancherProd + item.jenkinsName;
                } else if (item.name.startsWith('backoffice.promos.')) {
                    item.CILinks.Jenkins = item.CILinks.Jenkins || `${this.urls.CIJenkinsPromosSearch}${item.jenkinsName}`;
                    item.configLinks.Test = item.configLinks.Test || this.urls.PromosConfigValueEdit(item.jenkinsName);
                    item.configLinks.Preprod = item.configLinks.Preprod || this.urls.PromosConfigValuePreprodEdit(item.jenkinsName);
                    item.configLinks.Prod = item.configLinks.Prod || this.urls.PromosConfigValueProdEdit(item.jenkinsName);
                    item.rancherLinks.Test = item.rancherLinks.Test || this.urls.RancherPromosTest + item.jenkinsName;
                    item.rancherLinks.Prod = item.rancherLinks.Prod || this.urls.RancherPromosProd + item.jenkinsName;
                }
                item.envLinks.Test = item.envLinks.Test || this.urls.BackOfficeTestSwagger(item.jenkinsName.replace(/^backoffice-/, ''));
                item.envLinks.Prod = item.envLinks.Prod || this.urls.BackOfficeProdSwagger(item.jenkinsName.replace(/^backoffice-/, ''));
                if (item.hangfireLinks) {
                    item.hangfireLinks.Test = item.envLinks.Test.match(/.*\/\/.*?\//)[0] + 'hangfire/jobs/processing';
                    item.hangfireLinks.Prod = item.envLinks.Prod.match(/.*\/\/.*?\//)[0] + 'hangfire/jobs/processing';
                }
                item.definitionIds[item.jenkinsName] = item.definitionIds[item.jenkinsName] || `${item.CDLinks.Jenkins}`;
                item.projectConfigFile = item.projectConfigFile || this.urls.BackOfficeConfigFile(item.projectName);
                item.projectConfigFileDev = item.projectConfigFileDev || this.urls.BackOfficeConfigFileDev(item.projectName);
                item.repoLinks = item.repoLinks || {};
                item.repoLinks.Bitbucket = item.repoLinks.Bitbucket || this.urls.BitbucketRepo + item.name;
                item.logLinks.Test = item.logLinks.Test || this.urls.KibanaTest(item.jenkinsName);
                item.logLinks.Prod = item.logLinks.Prod || this.urls.KibanaProd(item.jenkinsName);

            }
        }
        this.cleanValues();
    },
    consts: {
        'lymTMfinished': 'lymTMfinished'
    },
    keys: {
        'TfsBuildId': 'TfsBuildId', 'GMailBody': 'GMailBody', 'Tfs': 'Tfs', 'Jenkins': 'Jenkins', 'Swagger': 'Swagger', 'swaggerBodyTextArea': 'swaggerBodyTextArea', 'RepositoryList': 'RepositoryList'
    },
    swaggers: {
        "https://rewards-web.backoffice.iherbtest.net/rewards/create": [
            "reward-portal-service.backoffice.iherbtest.net"

        ],
        "https://rewards-web.backoffice.iherb.net/rewards": [
            "promos-backoffice-manager-reward-api.backoffice.iherb.net"
        ],
        "https://cs-portal.backoffice.iherbtest.net/rewards/hyperwallet": [
            "localhost:5000",
            "localhost:54319",
            "backoffice-cs-reward-core-service.internal.iherbtest.io",
            "cs-reward-core-service.backoffice.iherbtest.net",
            "localhost:56322",
            "backoffice-cs-customer-service.internal.iherbtest.io",
            "cs-customer-service.backoffice.iherbtest.net",
            "localhost:44300",
            "backoffice-cs-reward-service.internal.iherbtest.io",
            "cs-reward-service.backoffice.iherbtest.net",
            "localhost:44312",
            "backoffice-cs-reward-bonus-service.internal.iherbtest.io",
            "cs-reward-bonus-service.backoffice.iherbtest.net",
            "backoffice-cs-gateway.internal.iherbtest.io",
            "cs-zendesk-syncjob.backoffice.iherbtest.net"
        ],
        "https://cs-portal.iherb.net/rewards/hyperwallet": [
            "backoffice-cs-reward-core-service.central.iherb.io",
            "cs-reward-core-service.backoffice.iherb.net",
            "backoffice-cs-customer-service.central.iherb.io",
            "cs-customer-service.backoffice.iherb.net",
            "backoffice-cs-reward-service.central.iherb.io",
            "cs-reward-service.backoffice.iherb.net",
            "cs-reward-bonus-service.backoffice.iherb.net",
        ]
    },
    searchConfigByHost(location) {
        for (var a of this.serviceConfigs) {
            for (let key in a.envLinks) {
                if (this.sameHost(a.envLinks[key], location)) { return a; }
            }
            for (let key in a.hangfireLinks) {
                if (this.sameHost(a.hangfireLinks[key], location)) { return a; }
            }
            for (let key in a.rancherLinks) {
                if (this.samePath(a.rancherLinks[key], location)) { return a; }
            }
        }
        return null;
    },
    sameHost(a, b) {
        try {
            var urlA = new URL(a);
            var urlB = new URL(b);
            return urlA.host == urlB.host;
        } catch (e) {
            console.log(e, a, b);
            return false;
        }
    },
    searchConfigByUrl_CanDeleteAfter20200601(url) {
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
        if (res.length && res[0].CILinks) {
            var key = Object.keys(res[0].CILinks);
            var value = res[0].CILinks[key];
            if (value) {
                return `${value}#refresh`;
            }
        }
    },
    getDefaultBranch: function (name) {
        var res = this.serviceConfigs.filter((a) => a.name == name);
        return res.length ? res[0].defaultBranch : 'master';
    },
    getCILinks: function (name) {
        var res = this.serviceConfigs.filter((a) => a.name == name);
        return res.length ? res[0].CILinks : { 'N/A': 'javascript:alert("build link not found for service:' + name + '")' };
    },
    getCDLinks: function (name) {
        var res = this.serviceConfigs.filter((a) => a.name == name);
        return res.length ? res[0].CDLinks : { 'N/A': 'javascript:alert("deploy link not found for service:' + name + '")' };
    },
    getConfigLinks: function (name) {
        var res = this.serviceConfigs.filter((a) => a.name == name);
        return res.length ? res[0].configLinks : { 'N/A': 'javascript:alert("config link not found for service:' + name + '")' };
    },
    getEnvLinks: function (name) {
        var res = this.serviceConfigs.filter((a) => a.name == name);
        return res.length ? res[0].envLinks : { 'N/A': 'javascript:alert("env link not found for service:' + name + '")' };
    },
    getLogLinks: function (name) {
        var res = this.serviceConfigs.filter((a) => a.name == name);
        return res.length ? res[0].logLinks : { 'N/A': 'javascript:alert("log link not found for service:' + name + '")' };
    },
    getRancherLinks: function (name) {
        var res = this.serviceConfigs.filter((a) => a.name == name);
        return res.length ? res[0].rancherLinks : { 'N/A': 'javascript:alert("rancher link not found for service:' + name + '")' };
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
        if (swagger.startsWith('localhost') || swagger.endsWith('.iherbtest.net') || swagger.endsWith('.internal.iherbtest.io')) {
            return 'https://cs-portal.backoffice.iherbtest.net/customers';
        } else {
            return 'https://cs-portal.iherb.net/customers'
        }
        //         for (var key in this.swaggers) {
        //             for (var item of this.swaggers[key]) {
        //                 if (item == swagger) {
        //                     return key;
        //                 }
        //             }
        //         }
        //         return null;
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
    changeEvent: new Event('change', { bubbles: true }),
    originSet: Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set,
    originSetTextArea: Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set,
    originSetSelect: Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set,
    originSetOption: Object.getOwnPropertyDescriptor(HTMLOptionElement.prototype, 'selected').set,


    // for react change input value
    reactSet(obj, val) {
        var event = this.inputEvent;
        obj = this.transferJqueryObj(obj);
        var eventObj = obj;
        if (obj instanceof HTMLInputElement) {
            this.originSet.call(obj, val);
        } else if (obj instanceof HTMLTextAreaElement) {
            this.originSetTextArea.call(obj, val);
        } else if (obj instanceof HTMLSelectElement) {
            event = this.changeEvent;
        } else if (obj instanceof HTMLOptionElement) {
            this.originSetOption.call(obj, val);
            event = this.changeEvent;
            eventObj = obj.parentNode;
        }
        eventObj.dispatchEvent(event);
    },
    async get(url, success, error) {
        try {
            await $.ajax({
                url: url, success: success, error: error
            }).promise();
        } catch (e) { console.log(e); }
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
        //         val[id].push(newItem);
        var alwaysTopIndex = val[id].findIndex(b => b.alwaysTop);
        if (alwaysTopIndex == -1) { alwaysTopIndex = val[id].length; }
        val[id].splice(alwaysTopIndex, 0, newItem);
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
    async getJenkinsLogEx(id, callback, key, $) {
        var val = this.getJenkinsLogFromCache();
        var url = this.urls.JenkinsLog(id);
        if (key in val) {
            if (callback) {
                callback(val[key]);
            }
            //             return new Promise((a) => a());
        } else {
            this.setValue(url, key);
            var resolve = (data) => {
                if (data) {
                    var commits = [null];
                    data.forEach(b => commits = commits.concat(b.commits, null));
                    console.log('commits', commits);
                    if (callback) {
                        callback(commits);
                    }
                    var val = this.getValue(this.keys.Jenkins);
                    val[key] = commits;
                    this.setValueNotExpired(this.keys.Jenkins, val);
                }
            }
            $.ajax(url, { success: resolve });
        }
    },
    transferJenkinsName_can_delete_if_20200701(jenkinsName) {
        switch (jenkinsName) {
            case "promos-manager-api": return "promos-manager-reward-service";
            default: return jenkinsName;
        }
    },
    getServiceNameByJenkinsName(jenkinsName) {
        if (jenkinsName == null) { return ''; }
        var res = this.serviceConfigs.filter((a) => a.jenkinsName == jenkinsName);
        return res.length ? res[0].name : '';
    },
    samePath(a, b) {
        try {
            var urlA = new URL(a);
            var urlB = new URL(b);
            if (urlA.host.includes('/rancher.') && urlB.host.includes('/rancher.')) {
                let pathA = urlA.pathname.match(/\/[^\/]*\/[^\/]*/)[0];
                let pathB = urlB.pathname.match(/\/[^\/]*\/[^\/]*/)[0];
                if (pathA == null || pathB == null) {
                    return false;
                }
                if (pathA == pathB) {
                    return true;
                }
            }
            var pathA = urlA.pathname.match(/\/[^\/]*/)[0];
            var pathB = urlB.pathname.match(/\/[^\/]*/)[0];
            if (pathA == '/hangfire' && pathB == '/hangfire') {
                return true;
            }
            return urlA.href.startsWith(urlB.href);
        } catch (e) {
            console.log(e, a, b);
            return false;
        }
    },
    generateRelativeLinks(serviceName, $, currentUrl = '') {
        //         var buildDiv = $('<div style="margin-left:15px;font-weight:bold;display:inline">CI:</div>');
        //         var deployDiv = $('<div style="margin-left:20px;font-weight:bold;display:inline">CD:</div>');
        //         var configDiv = $('<div style="margin-left:20px;font-weight:bold;display:inline">Config:</div>');
        //         var envDiv = $('<div style="margin-left:20px;font-weight:bold;display:inline">Env:</div>');
        //         var logDiv = $('<div style="margin-left:20px;font-weight:bold;display:inline">Log:</div>');
        //         var rancherDiv = $('<div style="margin-left:20px;font-weight:bold;display:inline">Rancher:</div>');
        var wrapDiv = $('<div></div>');//.append(buildDiv).append(deployDiv).append(configDiv).append(envDiv).append(logDiv).append(rancherDiv);
        var links = ['Repo', 'CI', 'CD', 'Config', 'Hangfire', 'Env', 'Log', 'Rancher'];
        var curConfig = this.serviceConfigs.filter((a) => a.name == serviceName)[0] || {};
        for (let key in curConfig) {
            if (key.endsWith('Links')) {
                var prefix = key.replace(/Links/g, '');
                prefix = prefix.substring(0, 1).toUpperCase() + prefix.substring(1);
                let div = $(`<div style="margin-left:20px;font-weight:bold;display:inline">${prefix}:</div>`);
                let index = links.indexOf(prefix);
                if (index == -1) {
                    links.push(div);
                } else {
                    links[index] = div;
                }
                for (let d in curConfig[key]) {
                    if (this.sameHost(currentUrl, curConfig[key][d]) && this.samePath(currentUrl, curConfig[key][d])) { continue; }
                    //                     if (currentUrl.startsWith(curConfig[key][d])) { continue; }
                    $(lymTM.createLink(d, curConfig[key][d])).css({ 'margin-left': '6px', 'font-weight': 'normal' }).appendTo(div);
                }
            }
        }
        for (let value of links.filter(a => typeof (a) != "string")) {
            wrapDiv.append(value);
        }
        wrapDiv.children().first().css('margin-left', '15px');
        //         var CILinks = lymTM.getCILinks(serviceName);
        //         for (let d in CILinks) {
        //             if (currentUrl.startsWith(CILinks[d])) { continue; }
        //             $(lymTM.createLink(d, CILinks[d])).css({ 'margin-left': '6px', 'font-weight': 'normal' }).appendTo(buildDiv);
        //         }
        //         var CDLinks = lymTM.getCDLinks(serviceName);
        //         for (let d in CDLinks) {
        //             if (currentUrl.startsWith(CDLinks[d])) { continue; }
        //             $(lymTM.createLink(d, CDLinks[d])).css({ 'margin-left': '6px', 'font-weight': 'normal' }).appendTo(deployDiv);
        //         }
        //         var configLinks = lymTM.getConfigLinks(serviceName);
        //         for (let d in configLinks) {
        //             if (currentUrl.startsWith(configLinks[d])) { continue; }
        //             $(lymTM.createLink(d, configLinks[d])).css({ 'margin-left': '6px', 'font-weight': 'normal' }).appendTo(configDiv);
        //         }
        //         var envLinks = lymTM.getEnvLinks(serviceName);
        //         for (let d in envLinks) {
        //             if (currentUrl.startsWith(envLinks[d])) { continue; }
        //             $(lymTM.createLink(d, envLinks[d])).css({ 'margin-left': '6px', 'font-weight': 'normal' }).appendTo(envDiv);
        //         }
        //         var logLinks = lymTM.getLogLinks(serviceName);
        //         for (let d in logLinks) {
        //             if (currentUrl.startsWith(logLinks[d])) { continue; }
        //             $(lymTM.createLink(d, logLinks[d])).css({ 'margin-left': '6px', 'font-weight': 'normal' }).appendTo(logDiv);
        //         }
        //         var rancherLinks = lymTM.getRancherLinks(serviceName);
        //         for (let d in rancherLinks) {
        //             if (currentUrl.startsWith(rancherLinks[d])) { continue; }
        //             $(lymTM.createLink(d, rancherLinks[d])).css({ 'margin-left': '6px', 'font-weight': 'normal' }).appendTo(rancherDiv);
        //         }
        return wrapDiv;
    },
    generateFilter($, input) {
        var repositoryList = lymTM.getValue(lymTM.keys.RepositoryList);
        if (!repositoryList) {
            console.log('repositoryList is null');
            repositoryList = [];
        }
        var div = document.createElement('div');
        div.style.color = 'red';
        div.style.fontSize = '16px';
        div.innerHTML = 'Filter: ';
        div.style.marginLeft = '10px';
        var divWrap = document.createElement('div');
        divWrap.setAttribute('name', 'div-filter-wrap')
        divWrap.append(div);
        var listDiv = document.createElement('div');
        listDiv.id = 'listDivFilterRes';
        var res = repositoryList;
        var regK = /\/[^\/]*\/repos\/[^\/]*/i;
        for (var i = 0; i < res.length; i++) {
            var item = res[i];
            var divItem = document.createElement('div');
            divItem.style.margin = '2px';
            var a = document.createElement('a');
            a.style.fontSize = '16px';
            a.style.margin = '5px';
            a.style.padding = '2px';
            a.href = item.link;
            a.innerHTML = item.name;
            a.lid = item.name.toLowerCase();
            a.style.display = 'none';
            divItem.append(a);
            listDiv.append(divItem);
            item.a = a;
            var relativeLinksDiv = lymTM.generateRelativeLinks(item.name, $);
            relativeLinksDiv.hide();
            divItem.append(relativeLinksDiv[0]);
        }
        res = res.map(function (a) { return a.a; });
        var $listDiv = $(listDiv);
        $listDiv.find('div').css({ 'font-size': '14px', 'margin-left': '10px' });
        $listDiv.children('div').children('div').css({ 'margin-left': '0px' });
        $listDiv.find('a').css({ 'font-size': '14px', 'margin-left': '3px' });
        div.after(listDiv);
        var divOther = document.createElement('div');
        divOther.style.fontSize = '14px';
        divOther.style.marginTop = '3px';
        divOther.style.marginLeft = '10px';
        divOther.style.fontWeight = 'bold';
        listDiv.after(divOther);
        var divRefresh = document.createElement('div');
        var aRefresh = document.createElement('a');
        aRefresh.setAttribute('name', 'div-filter-refresh');
        aRefresh.innerHTML = 'No repository match exactly. Refresh cache?';
        aRefresh.style.color = '#ff6e6e'
        aRefresh.style.display = 'none';
        aRefresh.style.marginLeft = '10px';
        aRefresh.target = '_blank';
        aRefresh.href = 'javascript:void(0);';
        divRefresh.append(aRefresh);
        listDiv.after(divRefresh);
        var hr = document.createElement('hr');
        hr.style.marginBottom = '0px';
        divOther.after(hr);

        var filterFun = function () {
            div.innerHTML = 'Filter: ' + str;
            var first = true;
            curList = [];
            var maxCount = 2;
            var otherCount = 0;
            for (var i = 0; i < res.length; i++) {
                if (str != '' && res[i].lid.indexOf(str) >= 0) {
                    if (first) {
                        res[i].style.backgroundColor = lineColor;
                        first = false;
                        curList.curIndex = 0;
                    } else {
                        res[i].style.backgroundColor = '';
                    }
                    if (curList.length <= maxCount) {
                        res[i].style.display = '';
                        res[i].nextSibling.style.display = 'inline';
                        curList.push(res[i]);
                    } else {
                        res[i].style.display = 'none';
                        res[i].nextSibling.style.display = 'none';
                        otherCount++;
                    }
                } else {
                    res[i].style.display = 'none';
                    res[i].nextSibling.style.display = 'none';
                }
            }
            if (otherCount) {
                divOther.innerHTML = 'other ' + otherCount + ' records...';
            }
            else {
                divOther.innerHTML = '';
            }
            if (curList.length || str.length == 0) {
                aRefresh.style.display = 'none';
            } else {
                aRefresh.style.display = '';
                var srcArr = [];
                for (i = 0; i < res.length; i++) {
                    let distance = lymTM.levenshtein(str, res[i].lid);
                    let distanceEx = distance;
                    if (str.length < res[i].lid.length) {
                        distanceEx = distance - Math.abs(str.length - res[i].lid.length);
                    }
                    srcArr.push({ i: i, distanceEx: distanceEx, lid: res[i].lid });
                }
                srcArr.sort((a, b) => a.distanceEx - b.distanceEx);
                var filtered = srcArr.filter(a => a.distanceEx == srcArr[0].distanceEx);
                var renderArr = [];
                if (filtered.length == 1) {
                    renderArr.push(filtered[0]);
                }
                else {
                    var filteredEx = filtered.filter(a => a.lid.length >= str.length);
                    if (filteredEx.length > 0) {
                        renderArr.push(filteredEx[0], filteredEx[1]);
                    }
                    else {
                        renderArr.push(filtered[0], filtered[1]);
                    }
                }
                first = true;
                for (let i = 0; i < renderArr.length; i++) {
                    if (first) {
                        res[renderArr[i].i].style.backgroundColor = lineColor;
                        first = false;
                        curList.curIndex = 0;
                    } else {
                        res[renderArr[i].i].style.backgroundColor = '';
                    }
                    res[renderArr[i].i].style.display = '';
                    res[renderArr[i].i].nextSibling.style.display = 'inline';
                    curList.push(res[renderArr[i].i]);
                }
            }
        };
        var str = '';
        var ignoreKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'];
        var curList = [];
        var lineColor = 'lightgrey';
        var moveFun = function (a) {
            if (curList.length == 0) { return; }
            let className = 'curtmlink';
            if (curList.subLink) {
                curList.subLink.removeClass(className).css('background-color', '');
            }
            curList[curList.curIndex].style.backgroundColor = '';
            if (a < 2) {
                var nextIndex = curList.curIndex + a;
                if (nextIndex < 0) {
                    nextIndex = curList.length - 1;
                } else if (nextIndex >= curList.length) {
                    nextIndex = 0;
                }
                curList[nextIndex].style.backgroundColor = lineColor;
                curList.curIndex = nextIndex;
                curList.subLink = null;
            } else {
                let links = $(curList[curList.curIndex]).next('div').find('a');
                let nextIndex = 0;
                let curIndex = links.index($(curList.subLink));
                if (a == 2) {
                    if (curIndex == -1) {
                        nextIndex = links.length - 1;
                    } else {
                        nextIndex = curIndex - 1;
                    }
                }
                else if (a == 3) {
                    if (curIndex == -1) {
                        nextIndex = 0;
                    } else {
                        nextIndex = curIndex + 1;
                    }
                }
                if ((nextIndex < 0 || nextIndex >= links.length)) {
                    curList[curList.curIndex].style.backgroundColor = lineColor;
                    curList.subLink = null;
                } else {
                    curList.subLink = links.eq(nextIndex).addClass(className).css('background-color', lineColor);
                }
            }

        };
        document.onkeydown = function (e) {
            e.stopPropagation();
            if (e.target.tagName == 'INPUT' || e.target.tagName == 'TEXTAREA') {
                return;
            }
            if (e.key == 'Shift' || e.ctrlKey && e.key != 'Enter') {
                return;
            }
            var arrow;
            if (e.key.length > 1) {
                if (e.key == 'Backspace') {
                    str = str.substr(0, str.length - 1);
                } else if ((arrow = ignoreKey.indexOf(e.key)) >= 0) {
                    if (arrow == 0) {
                        moveFun(-1);
                    } else if (arrow == 1) {
                        moveFun(1);
                    } else if (arrow == 2 || arrow == 4 && e.shiftKey) {
                        moveFun(2);
                    } else if (arrow == 3 || arrow == 4) {
                        moveFun(3);
                    }
                    return false;
                }
                else if (e.key == 'Enter') {
                    if (curList.length) {
                        if (curList.subLink) {
                            if (e.ctrlKey) {
                                curList.subLink[0].target = '_blank';
                            } else {
                                curList.subLink[0].target = '';
                            }
                            curList.subLink[0].click();
                        } else {
                            if (curList[curList.curIndex].tagName == 'A') {
                                if (e.ctrlKey) {
                                    curList[curList.curIndex].target = '_blank';
                                } else {
                                    curList[curList.curIndex].target = '';
                                }
                                curList[curList.curIndex].click();
                            } else {
                                if (e.ctrlKey) {
                                    curList[curList.curIndex].getElementsByTagName('a')[1].target = '_blank';
                                } else {
                                    curList[curList.curIndex].getElementsByTagName('a')[1].target = '';
                                }
                                curList[curList.curIndex].getElementsByTagName('a')[1].click();
                            }
                        }
                    }
                    return false;
                }
                else if (e.key.startsWith('F')) {
                }
                else {
                    str = '';
                }
            } else {
                if (e.key == 'v' && e.ctrlKey) {
                    return;
                }
                else if (e.key == ' ') {
                    str = '';
                } else {
                    str += e.key.toLowerCase();
                }
            }
            filterFun();
            if (e.key.length <= 1) {
                return false;
            }
        };

        document.onpaste = (e) => {
            if (e.target.tagName == 'INPUT' || e.target.tagName == 'TEXTAREA') {
                return;
            }
            str = e.clipboardData.getData('Text').toLowerCase();
            filterFun();
        };
        if (input != null) {
            str = input;
            filterFun();
        }
        return divWrap;
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
    runJob(func, ts, immediately = true) {
        var processing = false;
        var job = async () => {
            if (processing) {
                return;
            } else {
                processing = true;
                try {
                    await func();
                } catch (e) {
                    console.log(e);
                }
                processing = false;
            }
        };
        setInterval(job, ts);
        if (immediately) {
            setTimeout(job, 0);
        }
    },
    alreadyDone(obj) {
        var res = this.transferJqueryObj(obj);
        return res.lymTMDone;
    },
    done(obj) {
        var res = this.transferJqueryObj(obj);
        res.lymTMDone = true;
    },
    async doOnceBy(obj, func) {
        if (!this.alreadyDone(obj)) {
            await func();
            this.done(obj);
        }
    },
    levenshtein(a, b) {
        var dp = [0];
        for (let j = 1; j <= b.length; j++) dp[j] = j;
        var t1, t2;
        for (let i = 1; i <= a.length; i++) {
            t1 = dp[0]++;
            for (let j = 1; j <= b.length; j++) {
                t2 = dp[j];
                if (a[i - 1] == b[j - 1])
                    dp[j] = t1;
                else
                    dp[j] = Math.min(t1, Math.min(dp[j - 1], dp[j])) + 1;
                t1 = t2;
            }
        }
        return dp[b.length];
    }
};
lymTM.init();
