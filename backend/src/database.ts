import { Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  user: "admin",
  password: "123",
  database: "aula_db",
  port: 5432,
});

export default pool;
