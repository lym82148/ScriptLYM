namespace Service.Migration
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class DKH_JXS : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.test_table", "name", c => c.String(nullable: false));
            AddColumn("dbo.test_table", "type", c => c.String(nullable: false));
            DropColumn("dbo.test_table", "content");
        }
        
        public override void Down()
        {
            AddColumn("dbo.test_table", "content", c => c.String(nullable: false));
            DropColumn("dbo.test_table", "type");
            DropColumn("dbo.test_table", "name");
        }
    }
}
