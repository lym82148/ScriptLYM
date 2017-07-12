using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service
{
    public class RedisManager
    {
        public static ConnectionMultiplexer connection;
        public static ConnectionMultiplexer Con()
        {
            connection = connection ?? ConnectionMultiplexer.Connect("lym.redis.cache.chinacloudapi.cn:6380,password=rz4581P2yLORSMOtbANoyC3nywy95jKVy9ioehuYnWE=,ssl=True,abortConnect=False");
            return connection;
        }

        public static IDatabase Db(int i)
        {
            return Con().GetDatabase(i);
        }

        public static bool Set(int i ,string key, string value)
        {
            return Db(i).StringSet(key, value, TimeSpan.FromMinutes(10));
        }

        public static string Get(int i,string key)
        {
            return Db(i).StringGet(key).ToString();
        }

        public static bool Delete(int i,string v)
        {
            return Db(i).KeyDelete(v);
        }
    }
}
