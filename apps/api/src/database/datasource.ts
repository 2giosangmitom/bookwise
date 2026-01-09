// NOTE: This module is only for migration purposes

import { DataSource } from "typeorm";

export default new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false,
  migrations: ["src/database/migrations/*.ts"],
  entities: ["src/database/entities/*.ts"],
});
