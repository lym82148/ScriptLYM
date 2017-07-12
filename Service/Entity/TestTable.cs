using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;

namespace Service.Entity
{
    public class TestTable
    {
        public const string DKH = "dkh";
        public const string JXS = "jxs";
        public const string JXSLS = "jxsls";
        public const string DKHLS = "dkhls";
        public TestTable()
        {
            CreatedAt = DateTime.Now;
            UpdatedAt = DateTime.Now;
        }
        public int Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public static void SaveJxs(CurDbContext dbContext, string[] arr)
        {
            dbContext.TestTable.RemoveRange(dbContext.TestTable.Where(a => a.Type == JXS));
            dbContext.TestTable.AddRange(arr.Select(a => new TestTable { Name = a, Type = JXS }));
            dbContext.SaveChanges();
        }
        public static void SaveDkh(CurDbContext dbContext, string[] arr)
        {
            dbContext.TestTable.RemoveRange(dbContext.TestTable.Where(a => a.Type == DKH));
            dbContext.TestTable.AddRange(arr.Select(a => new TestTable { Name = a, Type = DKH }));
            dbContext.SaveChanges();
        }
        public static void SaveJxsLs(CurDbContext dbContext, string[] arr)
        {
            dbContext.TestTable.RemoveRange(dbContext.TestTable.Where(a => a.Type == JXSLS));
            dbContext.TestTable.AddRange(arr.Select(a => new TestTable { Name = a, Type = JXSLS }));
            dbContext.SaveChanges();
        }
        public static void SaveDkhLs(CurDbContext dbContext, string[] arr)
        {
            dbContext.TestTable.RemoveRange(dbContext.TestTable.Where(a => a.Type == DKHLS));
            dbContext.TestTable.AddRange(arr.Select(a => new TestTable { Name = a, Type = DKHLS }));
            dbContext.SaveChanges();
        }
        public static List<string> GetDkh(CurDbContext dbContext)
        {
            return dbContext.TestTable.Where(a => a.Type == DKH || a.Type == DKHLS).Select(a => a.Name).ToList().Select(a => Rename(a)).ToList();
        }
        public static List<string> GetJxs(CurDbContext dbContext)
        {
            return dbContext.TestTable.Where(a => a.Type == JXS || a.Type == JXSLS).Select(a => a.Name).ToList().Select(a => Rename(a)).ToList();
        }
        public static List<string> GetDkhLS(CurDbContext dbContext)
        {
            return dbContext.TestTable.Where(a => a.Type == DKHLS).Select(a => a.Name).ToList().Select(a => Rename(a)).ToList();
        }
        public static List<string> GetJxsLS(CurDbContext dbContext)
        {
            return dbContext.TestTable.Where(a =>  a.Type == JXSLS).Select(a => a.Name).ToList().Select(a => Rename(a)).ToList();
        }
        public static string Rename(string src)
        {
            return src.Replace('(', '（').Replace(')', '）');
        }
    }
    public class TestTableConfiguration : EntityTypeConfiguration<TestTable>
    {
        public const string TableName = "test_table";
        public TestTableConfiguration()
        {
            ToTable(TableName, CurDbContext.SchemaName);
            HasKey(c => c.Id);
            Property(c => c.CreatedAt).HasColumnName("created_at").IsRequired();
            Property(c => c.UpdatedAt).HasColumnName("updated_at").IsRequired();
            Property(c => c.Name).HasColumnName("name").IsRequired();
            Property(c => c.Type).HasColumnName("type").IsRequired();
        }
    }
}