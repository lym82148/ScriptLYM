// ==UserScript==
// @name         Common
// @namespace    http://tampermonkey.net/
// @version      4
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
    async: async function (obj, time = 100) {
        if (typeof obj == 'number') {// 参数是数字
            await this.sleep(obj);
        }
        else if (obj instanceof $) {// 参数是jQuery对象
            while (!$(obj.selector).length) {
                await this.sleep(time);
            }
            return $(obj.selector);
        }
        else if (obj) { // 参数是方法
            var res;
            while (true) {
                res = obj();
                if (res instanceof $) {
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
        return res.length ? res[0].deployLink : 'javascript:alert("deploy link not found for service:' + name + '")';
    },
    getApproveUsers: function (curUser) {
        return this.teamMembers.filter((a) => a.userName != curUser);
    },
    start: function () {
        return {
            startTime: Date.now(),
            end: function () { console.log(`用时${(Date.now() - this.startTime) / 1000}秒`) }
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
};

