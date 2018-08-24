using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(lym.Startup))]
namespace lym
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);

        }
    }
}
