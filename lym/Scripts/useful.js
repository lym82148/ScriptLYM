var keyStr = "";
var code = "pqwertyuio";

onkeydown = function (a) {
    if (a.keyCode == 13) {
        var date = new Date();
        var res = [];
        if (date.getHours() < 12) {
            res.push("" + getStr(date.getHours()) + getStr(date.getMinutes()));
        } else {
            res.push("" + getStr(date.getHours()) + getStr(date.getMinutes()));
            res.push("" + getStr((date.getHours() - 12)) + getStr(date.getMinutes()));
        }
        date = new Date(date - 60000);
        if (date.getHours() < 12) {
            res.push("" + getStr(date.getHours()) + getStr(date.getMinutes()));
        } else {
            res.push("" + getStr(date.getHours()) + getStr(date.getMinutes()));
            res.push("" + getStr((date.getHours() - 12)) + getStr(date.getMinutes()));
        }
        keyStr = keyStr.toLowerCase();
        var des = "";

        for (var i = 0; i < keyStr.length; i++) {
            des += code.indexOf(keyStr[i]);
        }
        console.log(res[0]);
        if (res.indexOf(des) >= 0) {
            document.getElementById('form1').style.display = "block";
            document.getElementById('sdsm').style.display = "none";
        }
        keyStr = "";
    } else {
        keyStr += a.key;
    }
    console.log(a)
}

function getStr(a) {
    if (a < 10) {
        return "0" + a;
    } else {
        return a;
    }
}
