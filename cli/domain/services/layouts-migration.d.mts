/** A planned move from the legacy layouts folder to the standalone home. */
export interface LayoutsMigrationPlan {
  required: boolean;
  from: string;
  to: string;
  files: string[];
  overwrites: string[];
}

export declare function planLayoutsMigration(options: {
  outputDir: string;
  layoutsDir: string;
  legacyFiles?: string[];
  targetFiles?: string[];
}): LayoutsMigrationPlan;
