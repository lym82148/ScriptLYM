using System;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using lym.Models;
using System.IO;
using System.Text;
using System.Collections.Generic;
using Spire.Xls;
using Service.Entity;
using System.Drawing;
using ICSharpCode.SharpZipLib.Zip;
using System.Text.RegularExpressions;
using System.Threading;

namespace lym.Controllers
{
    public class ExcelController : Controller
    {
        CurDbContext dbContext = new CurDbContext();
        public ActionResult Index()
        {
            ViewBag.DhkList = TestTable.GetDkhLS(dbContext);
            ViewBag.JxsList = TestTable.GetJxsLS(dbContext);
            return View();
        }
        public ActionResult Upload()
        {
            Save();
            
            TransForm();
            return new EmptyResult();
        }

        private void Save()
        {
            var jxs = Request.Form["jxs"].ToString();
            var arr = jxs.Split(new char[] { '\n', '\r', ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries);
            if (!string.IsNullOrEmpty(jxs))
            {
                TestTable.SaveJxs(dbContext, arr);
            }
            var dkh = Request.Form["dkh"].ToString();
            arr = dkh.Split(new char[] { '\n', '\r', ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries);
            if (!string.IsNullOrEmpty(dkh))
            {
                TestTable.SaveDkh(dbContext, arr);
            }
            var renj = Request.Form["renj"].ToString();
            arr = renj.Split(new char[] { '\n', '\r', ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries);
            TestTable.SaveJxsLs(dbContext, arr);
            var rend = Request.Form["rend"].ToString();
            arr = rend.Split(new char[] { '\n', '\r', ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries);
            TestTable.SaveDkhLs(dbContext, arr);
        }



        private void CreateBook(Record[] recordArr)
        {
            var dkhList = TestTable.GetDkh(dbContext);
            var jxsList = TestTable.GetJxs(dbContext);
            var del = Request.Form["del"].ToString();
            IEnumerable<string> delArr = del.Split(new char[] { '\n', '\r', ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries);
            var del2 = Request.Form["del2"].ToString();
            IEnumerable<string> delArr2 = del2.Split(new char[] { '\n', '\r', ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries);

            Regex re = new Regex(@"\d");
            delArr = delArr.Distinct().Where(a => a.All(b => re.IsMatch(b.ToString())));
            delArr2 = delArr2.Distinct().Where(a => a.All(b => re.IsMatch(b.ToString())));

            Workbook book = new Workbook()
            {
                DefaultFontSize = 11,
                DefaultFontName = "宋体"
            };
            Workbook book2 = new Workbook()
            {
                DefaultFontSize = 11,
                DefaultFontName = "宋体"
            };
            var index = 4;
            for (int i = 0; i < 2; i++)
            {
                book.Worksheets.Add("Sheet" + index++);
            }
            index = 0;
            var sheet1 = book.Worksheets[index++];
            var sheet2 = book.Worksheets[index++];
            var stsSheet = book.Worksheets[index++];
            var dkhSheet = book.Worksheets[index++];
            var dlsSheet = book.Worksheets[index++];
            index = 0;
            var tsSheet = book2.Worksheets[index++];
            stsSheet.Name = "删特殊";
            dkhSheet.Name = "大客户";
            dlsSheet.Name = "代理商";
            tsSheet.Name = "条数统计";

            var record = new Record();
            var sheet2Index = new Index();
            sheet2.Range[sheet2Index.X, sheet2Index.Y++].Text = nameof(record.发票代码);
            sheet2.Range[sheet2Index.X, sheet2Index.Y++].Text = nameof(record.发票号码);
            sheet2.Range[sheet2Index.X, sheet2Index.Y++].Text = nameof(record.开具时间);
            sheet2.Range[sheet2Index.X, sheet2Index.Y++].Text = nameof(record.净价值);
            sheet2.Range[sheet2Index.X, sheet2Index.Y++].Text = nameof(record.税率);
            sheet2.Range[sheet2Index.X, sheet2Index.Y++].Text = nameof(record.税额);
            sheet2.Range[sheet2Index.X, sheet2Index.Y++].Text = nameof(record.合计);
            sheet2.Range[sheet2Index.X, sheet2Index.Y++].Text = nameof(record.代理商);
            SetTitleStyle(sheet2, sheet2Index);
            sheet2Index.NextRow();

            var stsIndex = new Index();
            stsSheet.Range[stsIndex.X, stsIndex.Y++].Text = nameof(record.发票代码);
            stsSheet.Range[stsIndex.X, stsIndex.Y++].Text = nameof(record.发票号码);
            stsSheet.Range[stsIndex.X, stsIndex.Y++].Text = nameof(record.开具时间);
            stsSheet.Range[stsIndex.X, stsIndex.Y++].Text = nameof(record.净价值);
            stsSheet.Range[stsIndex.X, stsIndex.Y++].Text = nameof(record.税额);
            stsSheet.Range[stsIndex.X, stsIndex.Y++].Text = nameof(record.合计);
            stsSheet.Range[stsIndex.X, stsIndex.Y++].Text = nameof(record.代理商);
            stsSheet.Range[stsIndex.X, stsIndex.Y++].Text = nameof(record.分类);
            SetTitleStyle(stsSheet, stsIndex);
            stsIndex.NextRow();

            var dkhIndex = new Index();
            dkhSheet.Range[dkhIndex.X, dkhIndex.Y++].Text = nameof(record.发票代码);
            dkhSheet.Range[dkhIndex.X, dkhIndex.Y++].Text = nameof(record.发票号码);
            dkhSheet.Range[dkhIndex.X, dkhIndex.Y++].Text = nameof(record.开具时间);
            dkhSheet.Range[dkhIndex.X, dkhIndex.Y++].Text = nameof(record.净价值);
            dkhSheet.Range[dkhIndex.X, dkhIndex.Y++].Text = nameof(record.税额);
            dkhSheet.Range[dkhIndex.X, dkhIndex.Y++].Text = nameof(record.合计);
            dkhSheet.Range[dkhIndex.X, dkhIndex.Y++].Text = nameof(record.代理商);
            dkhSheet.Range[dkhIndex.X, dkhIndex.Y++].Text = nameof(record.分类);
            SetTitleStyle(dkhSheet, dkhIndex);
            dkhIndex.NextRow();

            var dlsIndex = new Index();
            dlsSheet.Range[dlsIndex.X, dlsIndex.Y++].Text = nameof(record.发票代码);
            dlsSheet.Range[dlsIndex.X, dlsIndex.Y++].Text = nameof(record.发票号码);
            dlsSheet.Range[dlsIndex.X, dlsIndex.Y++].Text = nameof(record.开具时间);
            dlsSheet.Range[dlsIndex.X, dlsIndex.Y++].Text = nameof(record.净价值);
            dlsSheet.Range[dlsIndex.X, dlsIndex.Y++].Text = nameof(record.税额);
            dlsSheet.Range[dlsIndex.X, dlsIndex.Y++].Text = nameof(record.合计);
            dlsSheet.Range[dlsIndex.X, dlsIndex.Y++].Text = nameof(record.代理商);
            dlsSheet.Range[dlsIndex.X, dlsIndex.Y++].Text = nameof(record.分类);
            SetTitleStyle(dlsSheet, dlsIndex);
            dlsIndex.NextRow();

            var tsIndex = new Index();
            tsSheet.Range[tsIndex.X, tsIndex.Y++].Text = nameof(record.代理商);
            tsSheet.Range[tsIndex.X, tsIndex.Y++].Text = nameof(record.分类);
            tsSheet.Range[tsIndex.X, tsIndex.Y++].Text = nameof(record.数量);
            SetTitleStyle(tsSheet, tsIndex);
            tsIndex.NextRow();

            var inDkh = false;
            var inDls = false;
            var dic = new Dictionary<string, int>();
            var add = 0;
            var inStsSheet = false;
            var curInStsSheet = false;
            Record curRecord = null;
            for (int i = 0; i < recordArr.Length; i++)
            {
                record = recordArr[i];
                for (int j = 0; j < record.Length; j++)
                {
                    sheet1.Range[i + 1, j + 1].Text = record[j];
                }
                inDkh = dkhList.Contains(record.代理商);
                inDls = jxsList.Contains(record.代理商);
                inStsSheet = (inDkh || inDls) && !delArr.Contains(record.发票号码);
                if (record.Sheet2Allow)
                {
                    sheet2.Range[sheet2Index.X, sheet2Index.Y++].Text = record.发票代码;
                    sheet2.Range[sheet2Index.X, sheet2Index.Y++].Text = record.发票号码;
                    sheet2.Range[sheet2Index.X, sheet2Index.Y++].Text = record.开具时间;
                    sheet2.Range[sheet2Index.X, sheet2Index.Y++].NumberValue = record.净价值;
                    sheet2.Range[sheet2Index.X, sheet2Index.Y++].NumberValue = record.税率;
                    sheet2.Range[sheet2Index.X, sheet2Index.Y++].NumberValue = record.税额;
                    sheet2.Range[sheet2Index.X, sheet2Index.Y++].Formula = "=+D" + sheet2Index.X + "+F" + sheet2Index.X;
                    sheet2.Range[sheet2Index.X, sheet2Index.Y++].Text = record.代理商;
                    if (record.Sheet2Yellow)
                    {
                        sheet2.Range[sheet2Index.X, 1, sheet2Index.X, sheet2Index.Y - 1].Style.Color = Color.Yellow;
                    }
                    sheet2Index.NextRow();
                    if (curRecord != null && !delArr2.Contains(curRecord.发票号码))
                    {
                        if (curInStsSheet)
                        {
                            if (dic.ContainsKey(curRecord.代理商))
                            {
                                dic[curRecord.代理商] += add;
                            }
                            else
                            {
                                dic.Add(curRecord.代理商, add);
                            }
                        }
                    }
                    add = 0;
                    curRecord = record;
                    curInStsSheet = inStsSheet;
                }
                else
                {
                    add += record.数量;
                }

                if (inStsSheet)
                {
                    stsSheet.Range[stsIndex.X, stsIndex.Y++].Text = record.发票代码;
                    stsSheet.Range[stsIndex.X, stsIndex.Y++].Text = record.发票号码;
                    stsSheet.Range[stsIndex.X, stsIndex.Y++].Text = record.开具时间;
                    stsSheet.Range[stsIndex.X, stsIndex.Y++].NumberValue = record.净价值;
                    stsSheet.Range[stsIndex.X, stsIndex.Y++].NumberValue = record.税额;
                    stsSheet.Range[stsIndex.X, stsIndex.Y++].Formula = "=+D" + stsIndex.X + "+E" + stsIndex.X;
                    stsSheet.Range[stsIndex.X, stsIndex.Y++].Text = record.代理商;
                    stsSheet.Range[stsIndex.X, stsIndex.Y++].Text = inDkh ? "大客户" : "代理商";
                    stsIndex.NextRow();
                    if (inDkh)
                    {
                        dkhSheet.Range[dkhIndex.X, dkhIndex.Y++].Text = record.发票代码;
                        dkhSheet.Range[dkhIndex.X, dkhIndex.Y++].Text = record.发票号码;
                        dkhSheet.Range[dkhIndex.X, dkhIndex.Y++].Text = record.开具时间;
                        dkhSheet.Range[dkhIndex.X, dkhIndex.Y++].NumberValue = record.净价值;
                        dkhSheet.Range[dkhIndex.X, dkhIndex.Y++].NumberValue = record.税额;
                        dkhSheet.Range[dkhIndex.X, dkhIndex.Y++].Formula = "=+D" + dkhIndex.X + "+E" + dkhIndex.X;
                        dkhSheet.Range[dkhIndex.X, dkhIndex.Y++].Text = record.代理商;
                        dkhSheet.Range[dkhIndex.X, dkhIndex.Y++].Text = "大客户";
                        dkhIndex.NextRow();
                    }
                    if (inDls)
                    {
                        dlsSheet.Range[dlsIndex.X, dlsIndex.Y++].Text = record.发票代码;
                        dlsSheet.Range[dlsIndex.X, dlsIndex.Y++].Text = record.发票号码;
                        dlsSheet.Range[dlsIndex.X, dlsIndex.Y++].Text = record.开具时间;
                        dlsSheet.Range[dlsIndex.X, dlsIndex.Y++].NumberValue = record.净价值;
                        dlsSheet.Range[dlsIndex.X, dlsIndex.Y++].NumberValue = record.税额;
                        dlsSheet.Range[dlsIndex.X, dlsIndex.Y++].Formula = "=+D" + dlsIndex.X + "+E" + dlsIndex.X;
                        dlsSheet.Range[dlsIndex.X, dlsIndex.Y++].Text = record.代理商;
                        dlsSheet.Range[dlsIndex.X, dlsIndex.Y++].Text = "代理商";
                        dlsIndex.NextRow();
                    }
                }

            }
            // 记录最后的条目
            if (curRecord != null && !delArr2.Contains(curRecord.发票号码))
            {
                if (curInStsSheet)
                {
                    if (dic.ContainsKey(curRecord.代理商))
                    {
                        dic[curRecord.代理商] += add;
                    }
                    else
                    {
                        dic.Add(curRecord.代理商, add);
                    }
                }
            }
            foreach (var item in dic)
            {
                tsSheet.Range[tsIndex.X, tsIndex.Y++].Text = item.Key;
                tsSheet.Range[tsIndex.X, tsIndex.Y++].Text = dkhList.Contains(item.Key) ? "大客户" : "代理商";
                tsSheet.Range[tsIndex.X, tsIndex.Y++].NumberValue = item.Value;
                tsIndex.NextRow();
            }

            // 筛选
            //sheet1.ListObjects.Create("Table66", sheet1.Range[1, 1, sheet1.LastRow, 2]);
            sheet2.ListObjects.Create("Table22", sheet2.Range[1, 1, sheet2.LastRow, sheet2.LastColumn]);
            stsSheet.ListObjects.Create("Table33", stsSheet.Range[1, 1, stsSheet.LastRow, stsSheet.LastColumn]);
            dlsSheet.ListObjects.Create("Table44", dlsSheet.Range[1, 1, dlsSheet.LastRow, dlsSheet.LastColumn]);
            dkhSheet.ListObjects.Create("Table55", dkhSheet.Range[1, 1, dkhSheet.LastRow, dkhSheet.LastColumn]);
            //sheet1.ListObjects[0].BuiltInTableStyle = TableBuiltInStyles.TableStyleLight9;
            //sheet2.ListObjects[0].BuiltInTableStyle = TableBuiltInStyles.TableStyleLight9;
            //stsSheet.ListObjects[0].BuiltInTableStyle = TableBuiltInStyles.TableStyleLight9;
            //dlsSheet.ListObjects[0].BuiltInTableStyle = TableBuiltInStyles.TableStyleLight9;
            //dkhSheet.ListObjects[0].BuiltInTableStyle = TableBuiltInStyles.TableStyleLight9;
            tsSheet.ListObjects.Create("Table77", tsSheet.Range[1, 1, tsSheet.LastRow, 2]);

            // 求和
            stsSheet.Range[stsIndex.X, 4].Formula = stsIndex.FormularSum(4);
            stsSheet.Range[stsIndex.X, 5].Formula = stsIndex.FormularSum(5);
            stsSheet.Range[stsIndex.X, 6].Formula = stsIndex.FormularSum(6);

            dlsSheet.Range[dlsIndex.X, 4].Formula = dlsIndex.FormularSum(4);
            dlsSheet.Range[dlsIndex.X, 5].Formula = dlsIndex.FormularSum(5);
            dlsSheet.Range[dlsIndex.X, 6].Formula = dlsIndex.FormularSum(6);

            dkhSheet.Range[dkhIndex.X, 4].Formula = dkhIndex.FormularSum(4);
            dkhSheet.Range[dkhIndex.X, 5].Formula = dkhIndex.FormularSum(5);
            dkhSheet.Range[dkhIndex.X, 6].Formula = dkhIndex.FormularSum(6);

            tsSheet.Range[tsIndex.X, 2].Formula = tsIndex.FormularSum(3);

            // 数字格式
            sheet2.Columns[3].NumberFormat = Record.NumberFormat;
            sheet2.Columns[4].NumberFormat = Record.NumberFormat;
            sheet2.Columns[5].NumberFormat = Record.NumberFormat;
            sheet2.Columns[6].NumberFormat = Record.NumberFormat;

            stsSheet.Columns[3].NumberFormat = Record.NumberFormat;
            stsSheet.Columns[4].NumberFormat = Record.NumberFormat;
            stsSheet.Columns[5].NumberFormat = Record.NumberFormat;
            dlsSheet.Columns[3].NumberFormat = Record.NumberFormat;
            dlsSheet.Columns[4].NumberFormat = Record.NumberFormat;
            dlsSheet.Columns[5].NumberFormat = Record.NumberFormat;
            dkhSheet.Columns[3].NumberFormat = Record.NumberFormat;
            dkhSheet.Columns[4].NumberFormat = Record.NumberFormat;
            dkhSheet.Columns[5].NumberFormat = Record.NumberFormat;

            // 计算所有公式
            book.CalculateAllValue();
            book2.CalculateAllValue();

            // 自动宽度
            for (int i = 0; i < 26; i++)
            {
                sheet1.AutoFitColumn(i + 1);
            }
            for (int i = 0; i < 8; i++)
            {
                sheet2.AutoFitColumn(i + 1);
                stsSheet.AutoFitColumn(i + 1);
                dlsSheet.AutoFitColumn(i + 1);
                dkhSheet.AutoFitColumn(i + 1);
            }
            for (int i = 0; i < 2; i++)
            {
                tsSheet.AutoFitColumn(i + 1);
            }

            var ms = new MemoryStream();
            book.SaveToStream(ms, FileFormat.Version2010);
            var ms2 = new MemoryStream();
            book2.SaveToStream(ms2, FileFormat.Version2010);
            var time = DateTime.Now.ToString("yyyy-MM-dd HH.mm");
            MemoryStream[] list = new[] { ms, ms2 };
            string[] nameList = new[] { "金税_" + time + ".xlsx", "条数统计_" + time + ".xlsx" };
            var stream = Zip(list, nameList);
            stream.CopyTo(Response.OutputStream);
            Response.AddHeader("Content-Disposition", "attachment; filename=output_" + time + ".zip");

        }

        private void SetTitleStyle(Worksheet sheet, Index index)
        {
            sheet.Range[index.X, 1, index.X, index.Y - 1].Style.Color = Color.FromArgb(191, 191, 191);
        }

        private void TransForm()
        {
            if (Request.Files != null && Request.Files.Count == 1)
            {
                var file = Request.Files[0];
                var sr = new StreamReader(file.InputStream, Encoding.Default);
                var src = sr.ReadToEnd();
                sr.Close();
                var arr = src.Split(new string[] { "\r\n" }, StringSplitOptions.RemoveEmptyEntries);
                var recordArr = new Record[arr.Length];
                for (int i = 0; i < arr.Length; i++)
                {
                    recordArr[i] = new Record();
                    recordArr[i].Src = arr[i].Split(new string[] { "~~" }, StringSplitOptions.None);
                }
                CreateBook(recordArr);
            }
        }

        private Stream Zip(MemoryStream[] list, string[] nameList)
        {
            MemoryStream ms;
            MemoryStream ms2 = new MemoryStream();
            ZipOutputStream zipOutputStream = new ZipOutputStream(ms2);
            zipOutputStream.SetLevel(6);
            for (int i = 0; i < list.Length; i++)
            {
                ms = list[i];

                ZipEntry entry = new ZipEntry(nameList[i])
                {
                    IsUnicodeText = true,
                    DateTime = DateTime.Now
                };
                zipOutputStream.PutNextEntry(entry);
                ms.Position = 0;
                ms.CopyTo(zipOutputStream);
                ms.Close();
                ms.Dispose();
            }

            zipOutputStream.Finish();
            ms2.Position = 0;
            return ms2;
        }
    }
    public class Record
    {
        public string 发票代码 { get { return Src[3]; } }
        public string 发票号码 { get { return Src[4]; } }
        public string 开具时间 { get { return Src[6]; } }
        int? ltsl;
        public int 数量
        {
            get
            {
                if (Src.Length <= 4)
                {
                    return 0;
                }
                int outRes;
                if (!ltsl.HasValue && int.TryParse(Src[4], out outRes))
                {
                    ltsl = outRes;
                }
                else
                {
                    ltsl = 0;
                }
                return ltsl.Value;
            }
        }
        double? jjz;
        public double 净价值
        {
            get
            {
                if (!jjz.HasValue)
                {
                    jjz = Convert.ToDouble(Src[9]);
                }
                return jjz.Value;
            }
        }

        double? sl;
        public double 税率
        {
            get
            {
                if (!sl.HasValue)
                {
                    sl = Convert.ToDouble(Src[10]);
                }
                return sl.Value;
            }
        }
        double? se;
        public double 税额
        {
            get
            {
                if (!se.HasValue)
                {
                    se = Convert.ToDouble(Src[11]);
                }
                return se.Value;
            }
        }
        public double 合计 { get { return 净价值 + 税额; } }
        string dls;
        public string 代理商
        {
            get
            {
                if (dls == null)
                {
                    if (Src.Length > 12)
                    {
                        Src[12] = TestTable.Rename(Src[12]);
                        dls = Src[12];
                    }
                }
                return dls;
            }
        }
        public string 分类 { get; set; }
        public string[] Src { private get; set; }
        public int Length { get { return Src.Length; } }
        public string this[int i]
        {
            get
            {
                return Src[i];
            }
        }
        public bool Sheet2Allow => Src.Length > 1 && (Src[1] == "0" || Src[1] == "1");
        public bool Sheet2Yellow => Src[0] == "1";
        public const string NumberFormat = "#,##0.00_ ;[Red]-#,##0.00 ";
    }

    public class Index
    {
        public int X = 1;
        public int Y = 1;
        public double Jjz;
        public double Se;
        public double Hj;
        public void NextRow()
        {
            X++;
            Y = 1;
        }

        internal string FormularSum(int v)
        {
            var ch = 'A';
            var dch = (char)(ch + v - 1);
            var src = "=SUM(" + dch + "2:" + dch + (X - 1) + ")";
            return src;
        }
    }
}