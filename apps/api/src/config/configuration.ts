export type AppConfig = {
  port: number;
  nodeEnv: string;
  databaseUrl?: string;
};

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL,
});
