// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import safeql from "@ts-safeql/eslint-plugin/config";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  safeql.configs.connections({
    // The URL of the database:
    databaseUrl: "postgres://postgres:postgres@localhost:5432/calorie_tracker",
    // Check all of the queries that are used with the `sql` tag:
    targets: [{ tag: "db", transform: "{type}[]"}],
    overrides: {
      types: {
        _text: "ArrayParameter<string[]>"
      }
    }
  }),
);