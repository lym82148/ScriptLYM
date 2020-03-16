// ==UserScript==
// @name         Common
// @namespace    http://tampermonkey.net/
// @version      3
// @description  configs & util
// @author       Yiming Liu
// @include      *
// @grant        none
// ==/UserScript==

window.lymTM = {
    sleep: function (time) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve();
            }, time);
        });
    },
    async: async function (func, time = 100) {
        if (typeof func == 'number') {// 参数是数字
            await this.sleep(func);
        }
        else if (func) { // 参数是方法
            var res;
            while (!(res = func())) {
                await this.sleep(time);
            }
            return res;
        } else { // 没有参数
            await this.sleep(0);
        }
    },
    createLink: function (text, href) {
        var link = document.createElement('a');
        link.style.color = '#ff6e6e';
        link.style.fontSize = '16px';
        link.style.textDecoration = 'underline';
        link.href = href;
        link.innerHTML = text;
        return link;
    },
    createLinkButton: function (text, func) {
        var link = document.createElement('a');
        link.style.color = '#ff6e6e';
        link.style.fontSize = '16px';
        link.style.display = 'block';
        link.style.textDecoration = 'underline';
        link.href = 'javascript:void(0);';
        link.onclick = func;
        link.innerHTML = text;
        return link;
    },
    teamMembers: [
        { "userName": "Terry (Xiaoyu) Luo" },
        { "userName": "Yiming Liu" },
        //         { "userName": "Tony (Sichao) Qian" },
        //         { "userName": "Diri (Jianwei) Guo" },

    ],
    serviceConfigs: [
        {
            "name": "legacy.checkout-web",
            "fullslug": "iherbllc/legacy.checkout-web",
            "defaultBranch": "staging",
            "buildLink": "https://tfs.iherb.net/tfs/iHerb%20Projects%20Collection/iHerbDev/Orders%20and%20Communications/_build/index?context=mine&path=%5CWebDev&definitionId=1053&_a=completed",
            "deployLink": "https://deploy.iherb.net/app#/projects/shop/overview",
        },
    ],
    getDefaultBranch: function (name) {
        var res = this.serviceConfigs.filter((a) => a.name == name);
        return res.length ? res[0].defaultBranch : 'master';
    },
    getBuildLink: function (name) {
        var res = this.serviceConfigs.filter((a) => a.name == name);
        return res.length ? res[0].buildLink : 'javascript:alert("build link not found for service:' + name + '")';
    },
    getDeployLink: function (name) {
        var res = this.serviceConfigs.filter((a) => a.name == name);
        return res.length ? res[0].deployLink : 'javascript:alert("build link not found for service:' + name + '")';
    },
    getApproveUsers: function (curUser) {
        return this.teamMembers.filter((a) => a.userName != curUser);
    }
};

