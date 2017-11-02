// ==UserScript==
// @name         OpsAutoEmail
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  try to take over the world!
// @author       You
// @match        https://omcops.bmw.com.cn/Operation/Release/ReleasePlanDetails/*
// @match        https://omcops.bmw.com.cn/Operation/Release/ReleasePlanPromote/*
// @grant        none
// ==/UserScript==

(function () {
    if ($('select#Priority').length) {
        $('select#Priority').val(1);
        $('#Comments').val($('#GitRepoTag').val());
        if (location.hash == '#ap') {
            if ($('#ProductOwner').val() == null) {
                $('#ProductOwner>option[value="vincent.yin@bmw.com"]').prop('selected', true);
            }
            $('#btnSubmit')[0].click();
        }
        return;
    }
    $('body').append('<style>.hideForCopy{display:none;}</style>');
    var div = document.createElement('div');
    var cFun = function (tmp) {
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
    var configRecord = '无';
    var copy = function () {
        var data = {};
        data.serviceName = $("input#Service").val() || '';
        data.userName = $("input#DevOwner").val() || 'Yiming';
        data.releaseEnv = $("input#ReleaseEnv").val() || '';
        data.releaseNote = $('label[for=ReleaseNotes]').last().parents('div.form-group').children('div').last().html();
        //releaseNote=releaseNote.split('\n').map(function(a,b){if(a){return a.trim();}}).filter(function(a){return a;}).join('\r\n');
        data.tagName = $('input#GitRepoRefTag').val();
        data.url = location.href;
        data.config = configRecord;
        var copyModel = model;
        for (var a in data) {
            copyModel = copyModel.replace('{{' + a + '}}', data[a]);
        }
        cFun(copyModel);
    };
    var serviceName = $("input#Service").val() || '';
    var releaseEnv = $("input#ReleaseEnv").val() || '';
    var title = 'deploy ' + serviceName + ' to ' + releaseEnv;
    var cc = 'DL-bmwconnected-bumper <bmwconnected-bumper@list.bmw.com>';
    var mailto = 'Wang Bonnie, US-CN <Bonnie.Wang@bmw.com>; Shao Zach, US-CN <Zach.Shao@bmw.com>; Yin Vincent, US-CN <Vincent.Yin@bmw.com>;';
    var omc = 'omc.cn.support <omc.cn.support@bmwgroup.com>; ';
    var content = 'Hi All\r\n\r\n' + serviceName + ' 申请发' + releaseEnv + ' 环境，需要ops上approve。\r\n\r\n\r\n\r\n';
    var omcContent = 'Hi All \r\n\r\n' + serviceName + ' 申请发' + releaseEnv + ' 环境，需要ops上approve。\r\n\r\n\r\n\r\n';

    //mailto = 'Liu Yiming, (Yiming.SH.Liu@partner.bmw.com)';
    //cc = mailto;

    mailto = encodeURIComponent(mailto);
    omc = encodeURIComponent(omc);
    content = encodeURIComponent(content);
    omcContent = encodeURIComponent(omcContent);
    title = encodeURIComponent(title);
    cc = encodeURIComponent(cc);
    var mailTo = document.createElement('a');
    mailTo.href = 'mailto:';
    mailTo.style.display = 'none';
    $('h1').append(mailTo);

    var link = document.createElement('a');
    link.style.color = 'red';
    link.style.textDecoration = 'underline';
    link.innerHTML = ' Click Here To Email ';
    link.onclick = function () {
        if ($(this).html() != ' Click Here To Email ') { return; }
        $(this).html('Getting Config...');
        $(this).css('color', 'pink');
        var hasConfig;
        var that = this;
        $.ajax('https://omcops.bmw.com.cn/Configuration/DeployConfiguration/Index/' + releaseEnv + '-All').then(function (data) {
            $(that).css('color', 'red');
            $(that).html(' Click Here To Email ');
            var arr = $(data).find('table tr').map(function (a, b) { if ($(b).find('td:eq(2)').text().trim() == serviceName) return b; });
            var configContent;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].cells[4].innerText.trim() == 'WaitAllows') {
                    var date = new Date(arr[i].cells[5].innerText.trim());
                    var dateMin = new Date(+new Date() - 86400000 * 3);
                    if (date > dateMin) {
                        var cells = arr[i].cells;
                        configRecord = (cells[1].innerText + cells[4].innerText + cells[5].innerText).trim().replace(/\s{2,100}/g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
                        configRecord = '<span style="color:#ff4nnnnnnnnnne4e">' + configRecord + '</span>';
                        configContent = arr[i].getAttribute('data-cache');
                        break;
                    }
                }
            }
            if (!!configContent) {
                confirmBox('' + configContent);
            } else {
                confirmCopy("noconfig");
            }
        });
        copy();
    };
    div2 = '<div class="modal fade" data-show="true"><div class="modal-dialog" style="left:0px"><div class="modal-content"><div class="modal-header"><h4 class="modal-title">确认是否包含配置</h4></div><div class="modal-body">' + '' + '</div><div style="padding-left:25%;padding-right:25%;padding-bottom:20px"><button type="button" class="btn btn-primary" data-dismiss="modal" aria-hidden="true" style="width:100px" data-res="yes">是</button><button type="button" data-res="no"  class="pull-right btn btn-danger" data-dismiss="modal"style="width:100px" aria-hidden="true">否</button></div></div></div></div>';
    div2 = $(div2);
    var confirmCopy = function (type) {
        $('.modal-backdrop').remove();
        div2.remove();
        div2.find('button').click(confirmCopy);
        if (type == "noconfig" || $(this).data('res') == 'no') {
            configRecord = '无';
            if (releaseEnv == 'Prod') {
                mailTo.href = 'mailto:' + mailto +omc + '&cc=' + cc + '&subject=' + title + '&body=' + content;
            } else {
                mailTo.href = 'mailto:' + mailto + '&cc=' + cc + '&subject=' + title + '&body=' + content;
            }
        }
        else {
            mailTo.href = 'mailto:' + mailto + omc + '&cc=' + cc + '&subject=' + title + '&body=' + omcContent;
        }
        copy();
        mailTo.click();
    };
    div2.find('button').click(confirmCopy);
    var confirmBox = function (content) {
        div2.find('.modal-body').html(content);
        div2.modal('show');
    };
    $('h1').append(link);
    //$('h1').append('<a style="color:red;text-decoration:underline" href="mailto:' + mailto + '&cc=' + cc + '&subject=' + title + '&body=' + content + '"> Click Here To Email </a>').find('a').click(copy);

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
padding:0cm 5.4pt 0cm 5.4pt;height:7.1pt">\
<p class="MsoNormal"><span style="font-family:宋体;color:#1F497D">{{config}}</span><span lang="EN-US"><o:p></o:p></span></p>\
</td>\
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