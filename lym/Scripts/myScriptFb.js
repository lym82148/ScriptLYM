// ==UserScript==
// @name         FbDeleteFriends
// @namespace    http://tampermonkey.net/
// @version      1.1
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
                    var tmp = document.getElementsByClassName('_39g5')[i];
                    do {
                        tmp = tmp.parentNode;
                    } while (tmp.tagName != 'LI');
                    tmp.seen = true;
                    if (document.getElementsByClassName('_39g5')[i].text.indexOf(',') >= 0) {
                        //console.log(document.getElementsByClassName('_39g5')[i].previousElementSibling.children[0].href)
                        count++;
                        if (count > 100) {
                            return;
                        }
                    } else {
                        console.log(document.getElementsByClassName('_39g5')[i])
                        tmp.style.display = 'none';
                    }

                }
                for (i = 0; i < document.getElementsByClassName('_698').length; i++) {
                    if (!document.getElementsByClassName('_698')[i].seen) {
                        document.getElementsByClassName('_698')[i].style.display = 'none';
                    }

                }
            }
        }, 100);
    };

    var k = document.createElement('button');
    k.style.margin = '5px'
    k.innerText = '过滤好友';
    k.onclick = cl;
    document.getElementById('u_0_a').append(k);


})();


