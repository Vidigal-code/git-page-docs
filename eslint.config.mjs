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
    {
        files: ["src/app/**/*.{js,jsx,ts,tsx}"],
        rules: {
            "no-restricted-imports": [
                "warn",
                {
                    patterns: [
                        {
                            group: ["@/widgets/*/*", "@/features/*/*", "@/entities/*/*", "@/processes/*/*", "@/page-slices/*/*"],
                            message: "Use each slice public API (`@/<layer>/<slice>`) instead of deep imports.",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["src/page-slices/**/*.{js,jsx,ts,tsx}"],
        rules: {
            "no-restricted-imports": [
                "warn",
                {
                    patterns: [
                        {
                            group: ["@/app/**", "@/widgets/*/*", "@/features/*/*", "@/entities/*/*", "@/processes/*/*", "@/page-slices/*/*"],
                            message: "Pages must not depend on app internals and should consume public APIs only.",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["src/processes/**/*.{js,jsx,ts,tsx}"],
        rules: {
            "no-restricted-imports": [
                "warn",
                {
                    patterns: [
                        {
                            group: [
                                "@/app/**",
                                "@/page-slices/**",
                                "@/widgets/*/*",
                                "@/features/*/*",
                                "@/entities/*/*",
                                "!@/entities/*/server",
                                "@/processes/*/*",
                            ],
                            message: "Processes must not depend on app/page-slices internals and should consume public APIs only.",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["src/widgets/**/*.{js,jsx,ts,tsx}"],
        rules: {
            "no-restricted-imports": [
                "warn",
                {
                    patterns: [
                        {
                            group: ["@/app/**", "@/page-slices/**", "@/processes/**", "@/entities/*/*", "@/features/*/*"],
                            message: "Widgets can depend on features/entities via public API only.",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["src/features/**/*.{js,jsx,ts,tsx}"],
        rules: {
            "no-restricted-imports": [
                "warn",
                {
                    patterns: [
                        {
                            group: ["@/app/**", "@/page-slices/**", "@/processes/**", "@/widgets/**", "@/entities/*/*"],
                            message: "Features can depend only on entities/shared public APIs.",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["src/entities/**/*.{js,jsx,ts,tsx}"],
        rules: {
            "no-restricted-imports": [
                "warn",
                {
                    patterns: [
                        {
                            group: ["@/app/**", "@/page-slices/**", "@/processes/**", "@/widgets/**", "@/features/**"],
                            message: "Entities must not depend on upper layers.",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["src/shared/**/*.{js,jsx,ts,tsx}"],
        rules: {
            "no-restricted-imports": [
                "warn",
                {
                    patterns: [
                        {
                            group: ["@/app/**", "@/page-slices/**", "@/processes/**", "@/widgets/**", "@/features/**", "@/entities/**"],
                            message: "Shared must remain independent from upper layers.",
                        },
                    ],
                },
            ],
        },
    },
];

export default config;
