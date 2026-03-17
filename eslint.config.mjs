import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const config = [
    ...compat.extends("next/core-web-vitals"),
    {
        files: ["src/**/*.{js,jsx,ts,tsx}"],
        rules: {
            "no-console": "warn",
        },
    },
];

export default config;
