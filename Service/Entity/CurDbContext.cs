using System;
using System.Data.Entity;

namespace Service.Entity
{
    public class CurDbContext: DbContext
    {
        public CurDbContext() : base("DefaultConnection")
        {

        }
        public CurDbContext(string connectionString) : base(connectionString)
        {

        }
        public const string SchemaName = "dbo";
        public DbSet<TestTable> TestTable { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Configurations.Add(new TestTableConfiguration());
        }
    
    }
}