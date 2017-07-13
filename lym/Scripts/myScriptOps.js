// ==UserScript==
// @name         OpsAutoEmail
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  try to take over the world!
// @author       You
// @match        https://omcops.bmw.com.cn/Operation/Release/ReleasePlanDetails/*
// @grant        none
// ==/UserScript==

(function () {
    $('body').append('<style>.hideForCopy{display:none;}</style>');
    var cFun = function (tmp) {
        if (div === undefined) {
            div = document.createElement('div');
        }
        div.innerHTML = tmp;
        $('body').children().addClass('hideForCopy');
        document.body.appendChild(div);
        document.execCommand('SelectAll');
        document.execCommand('Copy');
        document.execCommand('UnSelect');
        document.body.removeChild(div);
        $('body').children().removeClass('hideForCopy');
        return true;
    };
    var copy = function () {
        var data = {};
        data.serviceName = $("input#Service").val() || '';
        data.userName = $("input#DevOwner").val() || 'Yiming';
        data.releaseEnv = $("input#ReleaseEnv").val() || '';
        data.releaseNote = $('label[for=ReleaseNotes]').last().parents('div.form-group').children('div').last().html();
        //releaseNote=releaseNote.split('\n').map(function(a,b){if(a){return a.trim();}}).filter(function(a){return a;}).join('\r\n');
        data.tagName = $('input#GitRepoRefTag').val();
        data.url = location.href;
        for (var a in data) {
            model = model.replace('{{' + a + '}}', data[a]);
        }
        cFun(model);
        var x = $(this).hide(1000);
        function st() { x.show(); }
        setTimeout(st, 2000);
    };
    var serviceName = $("input#Service").val() || '';
    var releaseEnv = $("input#ReleaseEnv").val() || '';
    var title = 'deploy ' + serviceName + ' to ' + releaseEnv;
    var cc = 'DL-bmwconnected-bumper <bmwconnected-bumper@list.bmw.com>';
    var mailto = 'Wang Bonnie, US-CN <Bonnie.Wang@bmw.com>; Shao Zach, US-CN <Zach.Shao@bmw.com>';
    var content = '';

    content = 'Hi, bonnie & zach\r\n\r\n' + serviceName + ' 申请发' + releaseEnv + ' 环境，需要ops上approve。\r\n\r\n\r\n\r\n';

    //mailto = 'Liu Yiming, (Yiming.SH.Liu@partner.bmw.com)';
    //cc = mailto;

    mailto = encodeURIComponent(mailto);
    content = encodeURIComponent(content);
    title = encodeURIComponent(title);
    cc = encodeURIComponent(cc);
    $('h1').append('<a style="color:red;text-decoration:underline" href="mailto:' + mailto + '&cc=' + cc + '&subject=' + title + '&body=' + content + '"> Click Here To Email </a>').find('a').click(copy);

    var div;
    /*jshint multistr:true */
    var model = '<div>\
\
<p class="MsoNormal"><span lang="EN-US">&nbsp;</span></p>\
\
<table class="MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="1023" style="width: 767.25pt; margin-left: 37.85pt;">\
<tbody><tr style="mso-yfti-irow:0;mso-yfti-firstrow:yes;height:15.0pt">\
<td width="192" nowrap="" style="width:144.0pt;border:solid windowtext 1.0pt;\
background:#9BC2E6;padding:0cm 5.4pt 0cm 5.4pt;height:15.0pt">\
<p class="MsoNormal"><span style="font-family:宋体">部署应用</span><span lang="EN-US"><o:p></o:p></span></p>\
</td>\
<td width="831" nowrap="" valign="bottom" style="width:623.25pt;border:solid windowtext 1.0pt;\
border-left:none;padding:0cm 5.4pt 0cm 5.4pt;height:15.0pt">\
<p class="MsoNormal"><span lang="EN-US"><a href="{{url}}"><span style="font-size: 10.5pt; font-family: Helvetica, sans-serif; color: rgb(66, 139, 202); background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;">{{serviceName}}</span></a><o:p></o:p></span></p>\
</td>\
</tr>\
<tr style="mso-yfti-irow:1;height:15.0pt">\
<td width="192" nowrap="" style="width:144.0pt;border:solid windowtext 1.0pt;\
border-top:none;background:#9BC2E6;padding:0cm 5.4pt 0cm 5.4pt;height:15.0pt">\
<p class="MsoNormal"><span style="font-family:宋体">部署环境</span><span lang="EN-US"><o:p></o:p></span></p>\
</td>\
<td width="831" nowrap="" valign="bottom" style="width:623.25pt;border-top:none;\
border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;\
padding:0cm 5.4pt 0cm 5.4pt;height:15.0pt">\
<p class="MsoNormal"><span lang="EN-US">{{releaseEnv}}<o:p></o:p></span></p>\
</td>\
</tr>\
<tr style="mso-yfti-irow:2;height:17.0pt">\
<td width="192" nowrap="" style="width:144.0pt;border:solid windowtext 1.0pt;\
border-top:none;background:#9BC2E6;padding:0cm 5.4pt 0cm 5.4pt;height:17.0pt">\
<p class="MsoNormal"><span style="font-family:宋体">部署内容</span><span lang="EN-US"><o:p></o:p></span></p>\
</td>\
<td width="831" valign="bottom" style="width:623.25pt;border-top:none;border-left:\
none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;\
padding:0cm 5.4pt 0cm 5.4pt;height:17.0pt">\
<p class="MsoNormal"><span lang="EN-US">{{releaseNote}}<o:p></o:p></span></p>\
</td>\
</tr>\
<tr style="mso-yfti-irow:3;height:15.0pt">\
<td width="192" nowrap="" style="width:144.0pt;border:solid windowtext 1.0pt;\
border-top:none;background:#9BC2E6;padding:0cm 5.4pt 0cm 5.4pt;height:15.0pt">\
<p class="MsoNormal"><span style="font-family:宋体">部署包地址</span><span lang="EN-US"><o:p></o:p></span></p>\
</td>\
<td width="831" nowrap="" valign="bottom" style="width:623.25pt;border-top:none;\
border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;\
padding:0cm 5.4pt 0cm 5.4pt;height:15.0pt"></td>\
</tr>\
<tr style="mso-yfti-irow:4;height:15.65pt">\
<td width="192" nowrap="" style="width:144.0pt;border:solid windowtext 1.0pt;\
border-top:none;background:#9BC2E6;padding:0cm 5.4pt 0cm 5.4pt;height:15.65pt">\
<p class="MsoNormal"><span lang="EN-US" style="font-family:宋体">Tag</span><span lang="EN-US"><o:p></o:p></span></p>\
</td>\
<td width="831" valign="bottom" style="width:623.25pt;border-top:none;border-left:\
none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;\
padding:0cm 5.4pt 0cm 5.4pt;height:15.65pt">\
<p class="MsoNormal"><span lang="EN-US" style="font-size: 10.5pt; font-family: Helvetica, sans-serif; color: rgb(31, 73, 125); background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;">{{tagName}}</span><span lang="EN-US"><o:p></o:p></span></p>\
</td>\
</tr>\
<tr style="mso-yfti-irow:5;height:7.1pt">\
<td width="192" nowrap="" style="width:144.0pt;border:solid windowtext 1.0pt;\
border-top:none;background:#9BC2E6;padding:0cm 5.4pt 0cm 5.4pt;height:7.1pt">\
<p class="MsoNormal"><span style="font-family:宋体">配置变更</span><span lang="EN-US"><o:p></o:p></span></p>\
</td>\
<td width="831" valign="bottom" style="width:623.25pt;border-top:none;border-left:\
none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;\
padding:0cm 5.4pt 0cm 5.4pt;height:7.1pt"></td>\
</tr>\
<tr style="mso-yfti-irow:6;height:17.9pt">\
<td width="192" nowrap="" style="width:144.0pt;border:solid windowtext 1.0pt;\
border-top:none;background:#9BC2E6;padding:0cm 5.4pt 0cm 5.4pt;height:17.9pt">\
<p class="MsoNormal"><span style="font-family:宋体">数据库变更</span><span lang="EN-US"><o:p></o:p></span></p>\
</td>\
<td width="831" valign="bottom" style="width:623.25pt;border-top:none;border-left:\
none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;\
padding:0cm 5.4pt 0cm 5.4pt;height:17.9pt">\
<p class="MsoNormal"><span style="font-family:宋体;color:#1F497D">无</span><span lang="EN-US"><o:p></o:p></span></p>\
</td>\
</tr>\
<tr style="mso-yfti-irow:7;height:4.85pt">\
<td width="192" nowrap="" style="width:144.0pt;border:solid windowtext 1.0pt;\
border-top:none;background:#9BC2E6;padding:0cm 5.4pt 0cm 5.4pt;height:4.85pt">\
<p class="MsoNormal"><span style="font-family:宋体">其他组件</span><span lang="EN-US"><o:p></o:p></span></p>\
</td>\
<td width="831" valign="bottom" style="width:623.25pt;border-top:none;border-left:\
none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;\
padding:0cm 5.4pt 0cm 5.4pt;height:4.85pt">\
<p class="MsoNormal"><span style="font-family:宋体;color:#1F497D">无</span><span lang="EN-US"><o:p></o:p></span></p>\
</td>\
</tr>\
<tr style="mso-yfti-irow:8;height:15.0pt">\
<td width="192" nowrap="" style="width:144.0pt;border:solid windowtext 1.0pt;\
border-top:none;background:#9BC2E6;padding:0cm 5.4pt 0cm 5.4pt;height:15.0pt">\
<p class="MsoNormal"><span lang="EN-US">INT</span><span style="font-family:宋体">计划部署时间</span><span lang="EN-US"><o:p></o:p></span></p>\
</td>\
<td width="831" nowrap="" valign="bottom" style="width:623.25pt;border-top:none;\
border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;\
padding:0cm 5.4pt 0cm 5.4pt;height:15.0pt">\
<p class="MsoNormal"><span style="font-family:宋体;color:#1F497D">无</span><span lang="EN-US"><o:p></o:p></span></p>\
</td>\
</tr>\
<tr style="mso-yfti-irow:9;height:15.0pt">\
<td width="192" nowrap="" style="width:144.0pt;border:solid windowtext 1.0pt;\
border-top:none;background:#9BC2E6;padding:0cm 5.4pt 0cm 5.4pt;height:15.0pt">\
<p class="MsoNormal"><span lang="EN-US">Prod</span><span style="font-family:宋体">计划部署时间</span><span lang="EN-US"><o:p></o:p></span></p>\
</td>\
<td width="831" nowrap="" valign="bottom" style="width:623.25pt;border-top:none;\
border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;\
padding:0cm 5.4pt 0cm 5.4pt;height:15.0pt">\
<p class="MsoNormal"><span style="font-family:宋体;color:#1F497D">无</span><span lang="EN-US"><o:p></o:p></span></p>\
</td>\
</tr>\
<tr style="mso-yfti-irow:10;mso-yfti-lastrow:yes;height:15.0pt">\
<td width="192" nowrap="" style="width:144.0pt;border:solid windowtext 1.0pt;\
border-top:none;background:#9BC2E6;padding:0cm 5.4pt 0cm 5.4pt;height:15.0pt">\
<p class="MsoNormal"><span style="font-family:宋体">相关人员</span><span lang="EN-US"><o:p></o:p></span></p>\
</td>\
<td width="831" nowrap="" valign="bottom" style="width:623.25pt;border-top:none;\
border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;\
padding:0cm 5.4pt 0cm 5.4pt;height:15.0pt">\
<p class="MsoNormal"><span lang="EN-US" style="font-family:宋体;color:#1F497D">{{userName}}</span><span lang="EN-US"><o:p></o:p></span></p>\
</td>\
</tr>\
</tbody></table>\
\
<p class="MsoNormal"><span lang="EN-US">&nbsp;</span></p></div>';

})();