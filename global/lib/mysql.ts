import mysql, { type Pool, type PoolOptions } from 'mysql2/promise';

declare global {
  var __mysqlPool: Pool | undefined;
}

export const getDb = () => {
  if (global.__mysqlPool) {
    return global.__mysqlPool;
  }

  const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'] as const;
  const missingEnv = requiredEnv.filter((key) => !process.env[key]);

  if (missingEnv.length > 0) {
    throw new Error(`Faltan variables de entorno para MySQL: ${missingEnv.join(', ')}`);
  }

  const poolOptions: PoolOptions = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };

  const pool = mysql.createPool(poolOptions);

  if (process.env.NODE_ENV !== 'production') {
    global.__mysqlPool = pool;
  }

  return pool;
};
