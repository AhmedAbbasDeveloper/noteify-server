export default {
  type: "postgres",
  url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/noteify-db",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  entities: ["src/entity/*.ts"],
  migrations: ["src/migration/*.ts"],
  cli: {
    entitiesDir: "src/entity",
    migrationsDir: "src/migration"
  }
}
