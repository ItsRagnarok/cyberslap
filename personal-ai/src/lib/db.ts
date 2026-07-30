import postgres from "postgres";

declare global {
  // eslint-disable-next-line no-var
  var __pai_sql: ReturnType<typeof postgres> | undefined;
}

export const sql =
  global.__pai_sql ??
  postgres(process.env.DATABASE_URL!, {
    ssl: "require",
    max: 5,
  });

if (process.env.NODE_ENV !== "production") {
  global.__pai_sql = sql;
}
