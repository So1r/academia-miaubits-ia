import { supabaseServer } from "@/lib/supabase";

export const resolvers = {
  JSON: {
    __parseValue: (v: any) => v,
    __serialize: (v: any) => v,
    __parseLiteral: (ast: any) => (ast.kind === "StringValue" ? ast.value : null)
  },
  Query: {
    async me() {
      // Placeholder: en producción, extrae auth del request/cookie
      return null;
    },
    async plans() {
      const sb = supabaseServer();
      const { data, error } = await sb.from("plans").select("*").eq("is_active", true);
      if (error) throw error;
      return data;
    },
    async courses(_: any, args: { tag?: string; level?: string; q?: string }) {
      const sb = supabaseServer();
      let q = sb.from("courses").select("*");
      if (args.level) q = q.eq("level", args.level);
      if (args.tag) q = q.contains("tags", [args.tag]);
      if (args.q) q = q.ilike("title", `%${args.q}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    }
  },
  Mutation: {
    async submitExercise(_: any, { input }: any) {
      // TODO: ejecutar en WebWorker (Pyodide/sql.js) y validar test_cases.
      // Placeholder minimal:
      return { passed: true, score: 100, stdout: "ok", stderr: "" };
    }
  }
};
