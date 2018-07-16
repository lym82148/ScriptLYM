using Service;
using Service.Entity;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace lym.Controllers
{
    public class HomeController : Controller
    {
        CurDbContext dbContext = new CurDbContext();

        public ActionResult Index()
        {
            Init(null);
            //return Redirect(@"~\Scripts\myScript.js");
            return View();
        }
        static void Init(object o)
        {
            var k = I();
            k.Wait();
        }

        static async Task I()
        {
            await Task.Yield();
        }
        public ActionResult About()
        {

            return View();
        }

        public ActionResult Contact()
        {
            SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString);
            con.Open();
            SqlCommand c = new SqlCommand("select count(*) from lym", con);
            var res = c.ExecuteScalar();
            con.Close();
            ViewBag.Res = res;
            return View();
        }

        public ActionResult Test()
        {
            var db = new CurDbContext();
            //db.TestTable.Add(new TestTable() { Content = "abc" });
            db.SaveChanges();
            ViewData.Add("Res", db.TestTable.Select(a => a));
            return View();
        }

        public ActionResult RedisSet(int i = 0,string v="abc")
        {

            ViewData.Add("Res", RedisManager.Set(i, "test", v));

            return View("redis");
        }
        public ActionResult RedisGet(int i = 0)
        {

            ViewData.Add("Res", RedisManager.Get(i, "test"));

            return View("redis");
        }
        public ActionResult RedisDelete(int i = 0)
        {
            ViewData.Add("Res", RedisManager.Delete(i, "test"));

            return View("redis");
        }
    }
}