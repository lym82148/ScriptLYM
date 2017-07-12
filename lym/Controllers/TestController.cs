using Service;
using Service.Entity;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Mvc;

namespace lym.Controllers
{
    public class TestController : Controller
    {
        CurDbContext dbContext = new CurDbContext();
        int c;
        public ActionResult Index()
        {
            c = 1;
            var res = dbContext.TestTable.AsNoTracking().Where(a => a.Name == "test").FirstOrDefault();
            res.Type = "test2";
            for (int i = 0; i < 111; i++)
            {
                Thread.Sleep(2000);
            }
            var objContext = ((IObjectContextAdapter)dbContext).ObjectContext;
            var objSet = objContext.CreateObjectSet<TestTable>();
            var entityKey = objContext.CreateEntityKey(objSet.EntitySet.Name, res);

            object foundEntity;
            var exists = objContext.TryGetObjectByKey(entityKey, out foundEntity);


            var res2 = dbContext.TestTable.AsNoTracking().Where(a => a.Name == "test").FirstOrDefault();
           
            dbContext.SaveChanges();
            return View();
        }
        public ActionResult Index2()
        {
            c = 2;
            var res = dbContext.TestTable.Where(a => a.Name == "test").FirstOrDefault();
            res.Type = "test3";

            dbContext.SaveChanges();
            return View();
        }
        public ActionResult About()
        {

            dbContext.TestTable.Add(new TestTable { Name = "test", Type = "" });
            dbContext.TestTable.Add(new TestTable { Name = "test2" ,Type="" });
            dbContext.SaveChanges();
            return View();
        }
        public ActionResult About2()
        {

            var res2 = dbContext.TestTable.Where(a => a.Name == "test").FirstOrDefault();
            var res3 = dbContext.TestTable.Where(a => a.Name == "test2").FirstOrDefault();
            dbContext.TestTable.Remove(res2);
            dbContext.SaveChanges();
            return View();
        }

    }
}