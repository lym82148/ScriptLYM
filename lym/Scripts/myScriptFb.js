// ==UserScript==
// @name         FbDeleteFriends
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  try to take over the world!
// @author       You
// @match        https://www.facebook.com/profile.php*
// @grant        none
// ==/UserScript==

(function () {
    var cl = function () {
        tkes = setInterval(() => {
            document.scrollingElement.scrollTop += 1000;
            if (document.getElementById('medley_header_movies') != null) {
                clearInterval(tkes);
                var count = 0;
                for (var i = 0; i < document.getElementsByClassName('_39g5').length; i++) {
                    if (document.getElementsByClassName('_39g5')[i].text.indexOf(',') >= 0) {
                        window.open(document.getElementsByClassName('_39g5')[i].previousElementSibling.children[0].href)
                        count++;
                        if (count > 100) {
                            return;
                        }
                    }

                }
            }
        }, 100);
    };
    var k = document.createElement('button');
    k.innerText = '查找待删好友';
    k.onclick = cl;
    document.getElementById('u_0_a').append(k);


})();


