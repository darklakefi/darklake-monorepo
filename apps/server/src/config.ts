const appConfig = () => ({
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  redisPassword: process.env.REDIS_PASSWORD,
  solanaRpcHttpUrl: process.env.SOLANA_RPC_HTTP_URL,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
});

export type AppConfig = ReturnType<typeof appConfig>;

export default appConfig;
