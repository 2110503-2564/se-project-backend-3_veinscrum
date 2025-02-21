import { type Configuration } from "lint-staged";

const config: Configuration = {
    "**/*.ts": () => "tsc -p tsconfig.json --noEmit",
};

export default config;
