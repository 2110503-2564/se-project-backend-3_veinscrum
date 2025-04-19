import eslint from "@eslint/js";
import pluginJest from "eslint-plugin-jest";
import eslintPluginPrettierRecommend from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

export default tseslint.config(
    eslint.configs.recommended,
    eslintPluginPrettierRecommend,
    {
        // update this to match your test files
        files: ["**/*.spec.ts", "**/*.test.ts"],
        plugins: { jest: pluginJest },
        languageOptions: {
            globals: pluginJest.environments.globals.globals,
        },
        rules: {
            "jest/no-disabled-tests": "warn",
            "jest/no-focused-tests": "error",
            "jest/no-identical-title": "error",
            "jest/prefer-to-have-length": "warn",
            "jest/valid-expect": "error",
        },
    },
    tseslint.configs.strict,
);
