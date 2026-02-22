// functions/api/setup.ts
// This is a one-time setup endpoint to initialize the database schema.

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async ({ env }) => {
  try {
    const statements = [
      `DROP TABLE IF EXISTS base_websites;`,
      `CREATE TABLE base_websites (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL UNIQUE,
        name TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      // Future tables for settings, users, etc. can be added here.
    ];
    
    const batch = await env.DB.batch(statements.map(stmt => env.DB.prepare(stmt)));

    return new Response(JSON.stringify({
      message: "Database schema initialized successfully.",
      results: batch.map(res => ({ success: res.success, meta: res.meta }))
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Database setup failed:", error);
    return new Response(`Database setup failed: ${error.message}`, { status: 500 });
  }
};
