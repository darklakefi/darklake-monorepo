const appConfig = () => ({
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  redisPassword: process.env.REDIS_PASSWORD,
});

export type AppConfig = ReturnType<typeof appConfig>;

export default appConfig;
