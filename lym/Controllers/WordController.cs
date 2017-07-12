using ICSharpCode.SharpZipLib.Zip;
using Service;
using Service.Entity;
using Spire.Doc;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using PdfFormat = Spire.Pdf.FileFormat;
using PdfDocument = Spire.Pdf.PdfDocument;
using Spire.Pdf.Graphics;
using System.Drawing;
using System.Text;

namespace lym.Controllers
{
    public class WordController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public ActionResult Upload()
        {
            if (Request.Files.Count == 1)
            {
                Split();
            }
            else
            {
                Concat();
            }
            return new EmptyResult();
        }
        private bool IsPdf => Request.Files[0].FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase);
        private bool OutputDoc => Request.Form["type"].ToString() == "0";
        private void Concat()
        {
            if (IsPdf)
            {
                PdfDocument pdf = new PdfDocument();
                List<Stream> list = new List<Stream>();
                MemoryStream ms;
                for (int i = 1; i < Request.Files.Count; i++)
                {
                    ms = new MemoryStream();
                    pdf.LoadFromStream(Request.Files[i].InputStream);
                    pdf.SaveToStream(ms);
                    list.Add(ms);
                }
                //MemoryStream mres = new MemoryStream();
                //PdfDocument.MergeFiles(list.ToArray()).Save(mres);
                //pdf.LoadFromStream(mres);
                //mres = new MemoryStream();
                //pdf.SaveToStream(Response.OutputStream, PdfFormat.PDF);
                //doc.SaveToStream(Response.OutputStream,FileFormat.Docx);

                PdfDocument.MergeFiles(list.ToArray()).Save(Response.OutputStream);



                Response.AddHeader("Content-Disposition", "attachment; filename=output_" + DateTime.Now.ToString("yyyy-MM-dd HH.mm") + ".pdf");
            }
            else
            {
                Document doc1 = new Document();
                doc1.LoadFromStream(Request.Files[0].InputStream, FileFormat.Auto);
                Document doc2 = new Document();
                Section sec;
                for (int i = 1; i < Request.Files.Count; i++)
                {
                    doc2.LoadFromStream(Request.Files[i].InputStream, FileFormat.Auto);
                    sec = doc2.Sections[0];
                    doc1.Sections.Add(sec.Clone());
                }
                doc1.SaveToStream(Response.OutputStream, doc1.DetectedFormatType);
                Response.AddHeader("Content-Disposition", "attachment; filename=output_" + DateTime.Now.ToString("yyyy-MM-dd HH.mm") + ".doc");

            }
        }

        private void Split()
        {
            List<dynamic> list = new List<dynamic>(); ;
            if (IsPdf)
            {
                PdfDocument pdf = new PdfDocument();
                pdf.LoadFromStream(Request.Files[0].InputStream);
                PdfDocument pdf2;
                for (int i = 0; i < pdf.Pages.Count; i++)
                {
                    pdf2 = new PdfDocument();
                    var page = pdf2.Pages.Add(pdf.Pages[i].Size, new PdfMargins(0));
                    pdf.Pages[i].CreateTemplate().Draw(page, new PointF(0, 0));
                    list.Add(pdf2);
                }
            }
            else
            {
                Document document = new Document();
                document.LoadFromStream(Request.Files[0].InputStream, FileFormat.Auto);
                //定义一个新的文档对象
                Document newWord;
                //遍历源文档的所有section，克隆每个section并将其添加至一个新的word文档，然后保存文档
                for (int i = 0; i < document.Sections.Count; i++)
                {
                    newWord = new Document();
                    newWord.Sections.Add(document.Sections[i].Clone());
                    //newWord.SaveToFile($"{test}output\\o_{i}.docx");

                    list.Add(newWord);
                }
            }
            var stream = Zip(list);
            stream.CopyTo(Response.OutputStream);
            Response.AddHeader("Content-Disposition", "attachment; filename=output_" + DateTime.Now.ToString("yyyy-MM-dd HH.mm") + ".zip");
        }

        private Stream Zip(List<dynamic> list)
        {
            var fileName = Request.Files[0].FileName.Split('\\').LastOrDefault();
            var outputName = fileName.Split('.').FirstOrDefault();
            MemoryStream ms;
            MemoryStream ms2 = new MemoryStream();
            ZipOutputStream zipOutputStream = new ZipOutputStream(ms2);
            zipOutputStream.SetLevel(6);
            string endName = OutputDoc ? ".docx" : ".pdf";

            for (int i = 0; i < list.Count; i++)
            {
                ms = new MemoryStream();
                var secondName = "";
                if (IsPdf)
                {
                    list[i].SaveToStream(ms);
                    //list[i].SaveToStream(ms);
                }
                else
                {
                    if (i == list.Count - 1)
                    {
                        list[i].SaveToStream(ms, FileFormat.Txt);
                        ms.Position = 0;
                        StreamReader sr = new StreamReader(ms);
                        var res = sr.ReadToEnd();
                        sr.Close();
                        ms.Close();
                        ms.Dispose();
                        if (string.IsNullOrEmpty(res.Trim('\r', '\n', ' ')))
                        {
                            continue;
                        }
                        else
                        {
                            ms = new MemoryStream();
                        }
                    }
                    //list[i].SaveToStream(ms, FileFormat.PDF);
                    //Document D;D.SaveToStream(ms, FileFormat.Docx);

                    var title = ((Spire.Doc.Documents.Paragraph)((list[i].Sections[0].Body).ChildObjects[2])).Text;

                    if (title != null)
                    {
                        var arr = title.Split('：', '（');
                        if (arr.Length > 1)
                        {
                            secondName = "_" + arr[1];
                        }
                    }
                    if (OutputDoc)
                    {
                        list[i].SaveToStream(ms, FileFormat.Docx);
                    }
                    else
                    {
                        list[i].SaveToStream(ms, FileFormat.PDF);
                    }
                }

                ZipEntry entry = new ZipEntry(outputName + "-" + (i + 1) + secondName + endName)
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
}