import {
    AI_MODEL_DEFAULTS,
    OLLAMA_DEFAULT_BASE_URL,
    type AiProviderId,
} from '../../shared/config/ai-config';
import { PROVIDER_CATALOG, legacyProviderToCatalogId } from '@gitpagedocs/tools/ai';
import type { AiCliConfig, AiCliRunPlan } from '../core/models/ai-cli-config';
import {
    askText,
    askConfirm,
    askSelect,
    askMultiSelect,
    intro,
} from '../../../../cli/presentation/ui/clack';

export interface InteractiveCliAnswers {
    provider: AiProviderId;
    apiKeyOrHost: string;
    model: string;
    targetDirs: string[];
    languages: Array<'pt' | 'en' | 'es'>;
    outputDir: string;
    filePrefix: string;
    saveConfig: boolean;
    runConfigScaffold: boolean;
    contextPrompt: string;
}

function parseCommaSeparated(value: string): string[] {
    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function validateCommaSeparatedDirectories(value: string): string | undefined {
    const values = parseCommaSeparated(value);
    if (!values.length) return 'Provide at least one path.';
    return undefined;
}

const CUSTOM_MODEL = '__custom_model__';

/**
 * Ask for the model as a SELECT of the provider's real catalog models (with the
 * default marked), plus a "Custom" escape hatch — so an invalid id like "4.8"
 * can't be typed by mistake and rejected later as a 404 by the provider.
 */
async function askModel(provider: AiProviderId): Promise<string> {
    const catalogId = legacyProviderToCatalogId(provider);
    const spec = catalogId ? PROVIDER_CATALOG[catalogId] : undefined;
    const fallback = AI_MODEL_DEFAULTS[provider] || '';

    if (!spec || spec.models.length === 0) {
        return String(await askText({ message: 'Which model do you want to use?', defaultValue: fallback }));
    }

    const picked = await askSelect<string>(
        'Which model do you want to use?',
        [
            ...spec.models.map((m) => ({
                value: m.id,
                label: m.id === spec.defaultModel ? `${m.id} (default)` : m.id,
            })),
            { value: CUSTOM_MODEL, label: 'Custom — enter a model id manually' },
        ],
        spec.defaultModel,
    );

    if (picked !== CUSTOM_MODEL) return picked;

    return String(
        await askText({
            message: 'Enter the model id:',
            defaultValue: spec.defaultModel,
            validate: (value) => (value.trim() ? undefined : 'Provide a model id'),
        }),
    );
}

function toPlan(answers: InteractiveCliAnswers): AiCliRunPlan {
    const config: AiCliConfig = {
        version: 1,
        ai: {
            provider: answers.provider,
            model: answers.model,
            apiKey: answers.provider === 'ollama' ? undefined : answers.apiKeyOrHost,
            baseUrl: answers.provider === 'ollama' ? answers.apiKeyOrHost : undefined,
            paths: answers.targetDirs,
            languages: answers.languages,
            outputDir: answers.outputDir,
            filePrefix: answers.filePrefix,
            contextPrompt: answers.contextPrompt,
        },
    };

    return {
        config,
        saveConfig: answers.saveConfig,
        runConfigScaffold: answers.runConfigScaffold,
    };
}

export async function promptMissingDirectories(
    missingDirectories: string[],
): Promise<{ replacementPaths: string[]; abort: boolean }> {
    const recoveryMode = await askSelect(
        `I couldn't find ${missingDirectories.length} directory(ies): ${missingDirectories.join(', ')}`,
        [
            { value: 'fix', label: 'Fix paths now (recommended)' },
            { value: 'skip', label: 'Skip missing paths and continue' },
            { value: 'abort', label: 'Abort execution' },
        ],
        'fix',
    );

    if (recoveryMode === 'abort') {
        return { replacementPaths: [], abort: true };
    }
    if (recoveryMode === 'skip') {
        return { replacementPaths: [], abort: false };
    }

    const fixedPaths = await askText({
        message: 'Enter new paths (comma-separated):',
        validate: validateCommaSeparatedDirectories,
    });

    return {
        replacementPaths: parseCommaSeparated(String(fixedPaths || '')),
        abort: false,
    };
}

export async function promptUseExistingConfig(existingConfig: AiCliConfig): Promise<AiCliRunPlan | null> {
    const useExistingConfig = await askConfirm(
        'Found .gitpagedocsconfig. Do you want to use this configuration?',
        true,
    );

    if (!useExistingConfig) return null;

    const runConfigScaffold = await askConfirm(
        'After generating docs with AI, run the default gitpagedocs scaffolding?',
        true,
    );

    return {
        config: existingConfig,
        saveConfig: false,
        runConfigScaffold,
    };
}

export async function runAiInteractivePrompt(existingConfig?: AiCliConfig | null): Promise<AiCliRunPlan> {
    intro('🤖 GitPageDocs AI CLI — interactive mode');

    if (existingConfig) {
        const existingPlan = await promptUseExistingConfig(existingConfig);
        if (existingPlan) return existingPlan;
    }

    const provider = await askSelect<AiProviderId>(
        'Which AI provider should be used to generate documentation?',
        [
            { value: 'openai', label: 'OpenAI (GPT)' },
            { value: 'claude', label: 'Anthropic (Claude)' },
            { value: 'gemini', label: 'Google Gemini' },
            { value: 'ollama', label: 'Ollama (Local Open Source)' },
        ],
        'openai',
    );

    const apiKeyOrHost = await askText({
        message: provider === 'ollama' ? 'Ollama host URL:' : 'Provider API key:',
        defaultValue: provider === 'ollama' ? OLLAMA_DEFAULT_BASE_URL : undefined,
        validate: (input) => (input.length > 0 ? undefined : 'Required field'),
    });

    const model = await askModel(provider);

    const targetDirsRaw = await askText({
        message:
            'Paths to analyze (comma-separated). You can include multiple repositories (e.g., src,cli,../other-repo/src):',
        defaultValue: 'src,cli',
        validate: validateCommaSeparatedDirectories,
    });

    const languages = await askMultiSelect<'en' | 'pt' | 'es'>(
        'Documentation languages to generate:',
        [
            { value: 'en', label: 'English (en)' },
            { value: 'pt', label: 'Portuguese (pt)' },
            { value: 'es', label: 'Español (es)' },
        ],
        ['en', 'pt', 'es'],
    );

    const outputDir = await askText({
        message: 'Output directory for generated markdown files:',
        defaultValue: 'gitpagedocs/docs',
        validate: (value) => (value.trim() ? undefined : 'Provide an output directory'),
    });

    const filePrefix = await askText({
        message: 'Output file prefix:',
        defaultValue: 'ai-generated',
        validate: (value) => (value.trim() ? undefined : 'Provide a prefix'),
    });

    const contextPrompt = await askText({
        message: 'Extra instructions for AI (optional):',
        defaultValue:
            'You are a senior technical writer. Generate professional, clear documentation with architectural insight following FSD, SOLID, and Clean Code principles.',
    });

    const saveConfig = await askConfirm(
        'Save this configuration to .gitpagedocsconfig for future manual use?',
        true,
    );

    const runConfigScaffold = await askConfirm(
        'After generating docs with AI, run the default gitpagedocs scaffolding?',
        true,
    );

    return toPlan({
        provider,
        apiKeyOrHost,
        model,
        targetDirs: parseCommaSeparated(targetDirsRaw),
        languages,
        outputDir,
        filePrefix,
        contextPrompt,
        saveConfig,
        runConfigScaffold,
    });
}
