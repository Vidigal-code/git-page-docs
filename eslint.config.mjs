import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const config = [
    {
        // Never lint build output / generated artifacts (post src→frontend move,
        // the Next build dir is frontend/.next).
        ignores: [
            "**/node_modules/**",
            "**/.next/**",
            "**/out/**",
            "cli/prebuilt/**",
            "coverage/**",
            "**/*.tsbuildinfo",
        ],
    },
    {
        settings: {
            next: {
                rootDir: "frontend/",
            },
        },
    },
    ...compat.extends("next/core-web-vitals"),
    {
        files: ["frontend/src/**/*.{js,jsx,ts,tsx}"],
        rules: {
            "@next/next/no-html-link-for-pages": "off",
            "no-console": "warn",
        },
    },
    {
        files: ["frontend/src/app/**/*.{js,jsx,ts,tsx}"],
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
        files: ["frontend/src/page-slices/**/*.{js,jsx,ts,tsx}"],
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
        files: ["frontend/src/processes/**/*.{js,jsx,ts,tsx}"],
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
        files: ["frontend/src/widgets/**/*.{js,jsx,ts,tsx}"],
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
        files: ["frontend/src/features/**/*.{js,jsx,ts,tsx}"],
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
        files: ["frontend/src/entities/**/*.{js,jsx,ts,tsx}"],
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
        files: ["frontend/src/shared/**/*.{js,jsx,ts,tsx}"],
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
    {
        files: ["cli/application/**/*.{js,mjs,ts,tsx}"],
        rules: {
            "no-restricted-imports": [
                "warn",
                {
                    patterns: [
                        {
                            group: [
                                "../presentation/**",
                                "../../presentation/**",
                                "../ui/**",
                                "../../ui/**",
                                "../options/**",
                                "../../options/**",
                                "../runtime/**",
                                "../../runtime/**",
                                "../infrastructure/**",
                                "../../infrastructure/**",
                            ],
                            message: "Application layer must stay independent from presentation and infrastructure details.",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["cli/domain/**/*.{js,mjs,ts,tsx}"],
        rules: {
            "no-restricted-imports": [
                "warn",
                {
                    patterns: [
                        {
                            group: [
                                "../application/**",
                                "../../application/**",
                                "../presentation/**",
                                "../../presentation/**",
                                "../infrastructure/**",
                                "../../infrastructure/**",
                                "../runtime/**",
                                "../../runtime/**",
                            ],
                            message: "Domain layer cannot depend on upper layers.",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["cli/infrastructure/**/*.{js,mjs,ts,tsx}"],
        rules: {
            "no-restricted-imports": [
                "warn",
                {
                    patterns: [
                        {
                            group: ["../presentation/**", "../../presentation/**"],
                            message: "Infrastructure must not depend on presentation layer.",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["tools/smoke/**/*.{js,mjs,ts,tsx}"],
        rules: {
            "no-restricted-imports": [
                "warn",
                {
                    patterns: [
                        {
                            group: [
                                "../../cli/data/**",
                                "../../cli/builders/**",
                                "../../cli/application/**",
                                "../../cli/runtime/**",
                                "../../cli/options/**",
                                "../../cli/ui/**",
                                "../../cli/home/**",
                            ],
                            message: "Smoke tools should depend on stable contracts from cli/contracts.",
                        },
                    ],
                },
            ],
        },
    },
];

export default config;
