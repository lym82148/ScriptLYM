// ==UserScript==
// @name         Confluence
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  try to take over the world!
// @author       You
// @match        http://suus0001.w10:8090/*
// @grant        none
// ==/UserScript==

(function () {
    var sideDiv = $('.aui-sidebar-body');
    if (!sideDiv.length) {
        sideDiv = $('.acs-side-bar');
    }
    if (!sideDiv.length) {
        return;
    }
    var filterDiv = document.createElement('div');
    filterDiv.style.paddingLeft = '10px';

    var getTree = function (data, div) {
        div.innerHTML = '';
        var res = $(data).find('#main-content .output-block');
        res.find('h3').css({ "margin-top": '0px', "font-size": "15px", "font-weight": "bolder" });
        res.find('ul').css("margin-top", '0px');
        res.find('a').css("display", 'none');
        res.find('li').css("display", 'none');
        res.find('a').map(function (a, b) { b.lid = b.innerText.replace(/\s|_/g, '').toLowerCase(); });
        $(div).append(res);
        //filterFun();
    };
    var div = document.createElement('div');
    div.style.color = 'red';
    div.style.fontSize = '32px';
    div.innerHTML = 'Filter: ';
    div.style.marginButtom = '9px';
    var dbDiv = document.createElement('div');
    dbDiv.style.minHeight = '20px';
    dbDiv.innerHTML = 'loading';
    var apiDiv = document.createElement('div');
    apiDiv.innerHTML = 'loading';
    apiDiv.style.minHeight = '20px';

    filterDiv.append(div);
    filterDiv.append(dbDiv);
    var hr = document.createElement('hr');
    hr.style.borderColor = 'pink';
    filterDiv.append(hr);
    filterDiv.append(apiDiv);
    hr = document.createElement('hr');
    hr.style.borderColor = 'pink';
    filterDiv.append(hr);
    var ajax1 = $.ajax('http://suus0001.w10:8090/display/UC/API').then(function (data) {
        getTree(data, apiDiv);
    });
    var ajax2 = $.ajax('http://suus0001.w10:8090/display/UC/Model+%28DB%29+design').then(function (data) {
        getTree(data, dbDiv);
    });
    var filterAction = function (div) {
        if (div.childElementCount == 0) { return; }
        var res = $(div).find('a');
        var maxCount = curList.length + 10;
        for (var i = 0; i < res.length; i++) {
            if (res[i].lid.indexOf(str) >= 0 && str.length > 0) {
                if (curList.length == 0) {
                    res[i].style.backgroundColor = lineColor;
                    curList.curIndex = 0;
                } else {
                    res[i].style.backgroundColor = '';
                }
                if (curList.length >= maxCount) {
                    // res[i].style.display = 'none';
                    // $(res[i]).parent('li').css('display','none');
                    // $(res[i]).parent('li').parent('ul').parent('li').css('display','none');
                } else {
                    res[i].style.display = '';
                    $(res[i]).parent('li').css('display', '');
                    $(res[i]).parent('li').parent('ul').parent('li').css('display', '');
                    curList.push(res[i]);
                }
            } else {
                // res[i].style.display = 'none';
                // $(res[i]).parent('li').css('display','none');
                // $(res[i]).parent('li').parent('ul').parent('li').css('display','none');
            }
        }
    };
    var filterFun = function () {
        div.innerHTML = 'Filter: ' + str;
        curList = [];
        if ('start' in filterFun) {
            if (str.length > 0 && str.replace(/c/g, '') != '') {
                if (filterFun.start == 0) {
                    filterFun.top = sideDiv[0].scrollTop;
                    sideDiv[0].scrollTop = 0;
                }
                filterFun.start++;
            }
        } else {
            filterFun.start = 0;
        }
        $(filterDiv).find('a').css("display", 'none');
        $(filterDiv).find('li').css("display", 'none');
        filterAction(dbDiv);
        filterAction(apiDiv);
        if ('start' in filterFun) {
            if (str.length == 0) {
                filterFun.start = 0;
                if (sideDiv[0].scrollTop == 0) {
                    sideDiv[0].scrollTop = filterFun.top;
                }
            }
        }

    };
    $.when(ajax1, ajax2).then(filterFun);
    sideDiv.prepend(filterDiv);

    var str = '';
    var ignoreKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    var curList = [];
    var lineColor = 'lightgrey';
    var moveFun = function (a) {
        if (curList.length == 0) { return; }
        var nextIndex = curList.curIndex + a;
        if (nextIndex < 0) {
            nextIndex = curList.length - 1;
        } else if (nextIndex >= curList.length) {
            nextIndex = 0;
        }
        curList[curList.curIndex].style.backgroundColor = '';
        curList[nextIndex].style.backgroundColor = lineColor;
        curList.curIndex = nextIndex;
    };

    onkeydown = function (e) {
        if (!auto) { return; }
        if (e.target.tagName == 'INPUT') {
            return;
        }
        if (e.ctrlKey && e.key != 'Enter') {
            return;
        }
        var arrow;
        if (e.key.length > 1) {
            if (e.key == 'Backspace') {
                str = str.substr(0, str.length - 1);
            } else if ((arrow = ignoreKey.indexOf(e.key)) >= 0) {
                if (arrow == 0 || arrow == 2) {
                    moveFun(-1);
                } else if (arrow == 1 || arrow == 3) {
                    moveFun(1);
                }
                return false;
            }
            else if (e.key == 'Enter') {
                if (curList.length) {
                    if (curList[curList.curIndex].tagName == 'A') {
                        if (e.ctrlKey) {
                            curList[curList.curIndex].target = '_blank';
                        } else {
                            curList[curList.curIndex].target = '';
                        }
                        curList[curList.curIndex].click();
                    } else {
                        if (e.ctrlKey) {
                            curList[curList.curIndex].target = '_blank';
                        } else {
                            curList[curList.curIndex].target = '';
                        }
                        curList[curList.curIndex].getElementsByTagName('a')[1].click();
                    }
                }
                return false;
            }
            else {
                str = '';
            }
        } else {
            if (e.key == 'v' && e.ctrlKey) {
                return;
            }
            else if (e.key == ' ') {
                return false;
            } else {
                str += e.key.toLowerCase();
            }
        }
        filterFun();
        if (e.key.length == 1) {
            return false;
        }
    };

    document.onpaste = (e) => {
        if (!auto) { return; }
        str = e.clipboardData.getData('Text').toLowerCase();
        filterFun();
    };
    var auto = true;
    var saveStr = '';
    Object.defineProperty(window, "c", {
        Configurable: true,
        get: function () {
            auto = !auto;
            var res;
            if (auto) {
                div.style.display = '';
                str = saveStr;
                res = ("已开启筛选");
            } else {
                div.style.display = 'none';
                saveStr = str;
                str = '';
                res = ("已关闭筛选");
            }
            filterFun();
            return res;
        }
    });
    $('.favourite-space-icon>button').css({ top: 'unset', "margin-top": '-18px' });

    if (location.href.startsWith('http://suus0001.w10:8090/')) {
        var changeName = function (name) {
            var r = /(_\w|^\w)/g;
            return name.replace(r, ($1) =>$1.replace('_', '').toUpperCase());
        };
        var tableName = $('.confluenceTh:contains(Table):contains(Name):first').next().text().trim();
        if (!tableName) {
            tableName = $('h1#title-text>a:first').text().trim();
        }
        var tableNameCode = changeName(tableName);
        tableNameCode = tableNameCode.replace(/s$/, '');
        var columnsRow = $('.confluenceTh:contains(Column):contains(Name):first').closest('table').find('tbody tr');
        if (!columnsRow.length) {
            columnsRow = $('td.confluenceTd:contains(Column Name)').closest('tr').siblings();
            if (!columnsRow.length) {
                columnsRow = $('td.confluenceTd:contains(Column Name)').closest('thead').next().find('tr');
            }
        }

        if (!tableName || !columnsRow.length) {
            return;
        }
        var columns = [];
        for (var i = 0; i < columnsRow.length; i++) {
            var tds = columnsRow.eq(i).find('td');
            if (tds.eq(0).text().trim() == 'Id') { continue; }
            columns.push({
                name: tds.eq(0).text().trim(),
                code: changeName(tds.eq(0).text().trim()),
                type: tds.eq(1).text().trim(),
                desc: tds.eq(3).text().trim()
            });
        }
        var serviceName = $('#breadcrumbs>li:last').text().replace(/Service.*/, '').trim();
        console.log(tableName);
        console.log(columns);
        var divCopy = document.createElement('pre');
        $('body').append('<style>.hideForCopy{display:none;}</style>');
        var cFun = function (tmp) {
            divCopy.innerText = tmp;
            $('body').children().addClass('hideForCopy');
            document.body.appendChild(divCopy);
            document.execCommand('SelectAll');
            document.execCommand('Copy');
            document.execCommand('UnSelect');
            document.body.removeChild(divCopy);
            $('body').children().removeClass('hideForCopy');
        };
        var copy = function () {
            divExport.innerHTML = 'Copying...';
            divExport.style.color = 'pink';
            setTimeout(function () {
                divExport.innerHTML = 'Copy Code';
                divExport.style.color = 'red';
            }, 400);
            var data = { tableName: tableName, tableNameCode: tableNameCode, serviceName: serviceName, columns: "", columnsScript: "" };
            var stringDefault = ' = string.Empty;';
            var statusDefault = ' = 1;'
            var dateDefault = ' = DateTime.UtcNow;';
            for (var i = 0; i < columns.length; i++) {
                var type = 'string';
                var length = 0;
                var defaultValue = '';
                var textType = columns[i].type.toLowerCase();
                switch (textType) {
                    case 'int':
                    case 'tinyint':
                        type = 'int';
                        if (columns[i].code == 'Status') {
                            defaultValue = statusDefault;
                        }
                        break;
                    case 'string':
                    case 'nvarchar':
                    case 'varchar':
                        type = 'string';
                        defaultValue = stringDefault;
                        break;
                    case 'datetime':
                    case 'date':
                    case 'time':
                        type = 'DateTime';
                        defaultValue = dateDefault;
                        break;
                    case 'uniqueidentifier':
                    case 'guid':
                        type = 'Guid';
                        break;
                    case 'decimal':
                        type = 'decimal';
                        break;
                    case 'float':
                        type = 'float';
                        break;
                    case 'double':
                        type = 'double';
                        break;
                    default:
                        if (textType.startsWith('decimal')) {
                            type = 'decimal';
                        } else if (textType.startsWith('nvarchar')) {
                            type = 'string';
                            defaultValue = stringDefault;
                            lengthReg = textType.match(/\((.*)\)/);
                            if (lengthReg && lengthReg.length == 2) {
                                length = +lengthReg[1];
                            }
                        } else if (textType.indexOf('enum') >= 0) {
                            type = 'int';
                        } else {
                            type = textType;
                        }
                        break;
                }
                data.columns += "        /// <summary>\r\n";
                data.columns += "        /// " + columns[i].desc + "\r\n";
                data.columns += "        /// </summary>\r\n";
                data.columns += "        public " + type + " " + columns[i].code + " { get; set; }" + defaultValue + '\r\n';
                data.columnsScript += "            Property(p => p." + columns[i].code + ").HasColumnName(\"" + columns[i].name + "\")" + (length > 0 ? ".HasMaxLength(" + length + ")" : "") + ".IsRequired();\r\n";
            }
            var copyModel = model;
            for (var a in data) {
                copyModel = copyModel.replace(new RegExp('{{' + a + '}}', 'g'), data[a]);
            }
            cFun(copyModel);
        };
        var divExport = document.createElement('a');
        divExport.style.color = 'red';
        divExport.innerHTML = 'Copy Code';
        divExport.style.marginLeft = '9px';
        divExport.onclick = copy;
        divExport.style.textDecoration = 'underline';
        divExport.href = 'javascript:void(0);';
        $('h1#title-text>a:first').after(divExport);
        var column = "        public string ParentOrderNo { get; set; } = string.Empty;\r\n";
        var columnScript = "            Property(p => p.ParentOrderNo).HasColumnName(\"parent_order_no\").HasMaxLength(50).IsRequired();\r\n";
        /*jshint multistr:true */
        var model = "using Common;\r\n\
using System;\r\n\
using System.ComponentModel.DataAnnotations.Schema;\r\n\
using System.Data.Entity.ModelConfiguration;\r\n\
using System.Diagnostics.CodeAnalysis;\r\n\
\r\n\
namespace {{serviceName}}.DataAccess\r\n\
{\r\n\
[ExcludeFromCodeCoverage]\r\n\
public class {{tableNameCode}} : IEntity\r\n\
{\r\n\
public int Id { get; set; }\r\n\
{{columns}}\r\n\
}\r\n\
\r\n\
[ExcludeFromCodeCoverage]\r\n\
public class {{tableNameCode}}Configuration : EntityTypeConfiguration<{{tableNameCode}}>\r\n\
{\r\n\
public {{tableNameCode}}Configuration()\r\n\
{\r\n\
ToTable(\"{{tableName}}\", {{serviceName}}ServiceContext.SchemaName);\r\n\
HasKey(p => p.Id).Property(p => p.Id).HasColumnName(\"id\").HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity);\r\n\
{{columnsScript}}\r\n\
}\r\n\
}\r\n\
\r\n\
public interface I{{tableNameCode}}Repository : IRepository<{{tableNameCode}}> { }\r\n\
\r\n\
[ExcludeFromCodeCoverage]\r\n\
public class {{tableNameCode}}Repository : {{serviceName}}DbRepository<{{tableNameCode}}>, I{{tableNameCode}}Repository\r\n\
{\r\n\
public {{tableNameCode}}Repository(I{{serviceName}}DbFactory dbFactory) : base(dbFactory) { }\r\n\
}\r\n\
}";
    }
})();