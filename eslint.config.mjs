// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import safeql from "@ts-safeql/eslint-plugin/config";

export default tseslint.config(
  {
    ignores: ["node_modules", "dist", "client"],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  safeql.configs.connections({
    overrides: {
      columns: {
        "account_action_context.context": "ActionContext[ActionContextName]",
        "account_action_context.action_name": "ActionContextName"
      },
      types: {
        jsonb: "any"
      }
    },
    // The URL of the database:
    databaseUrl: "postgres://postgres:postgres@localhost:5432/calorie_tracker",
    // Check all of the queries that are used with the `sql` tag:
    targets: [{ wrapper: "client.query" }],
  })
);