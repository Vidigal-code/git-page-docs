"use client";

import type { FormEvent } from "react";

interface SourceViewerSearchFormProps {
  owner: string;
  repo: string;
  branch: string;
  ownerLabel: string;
  repoLabel: string;
  branchLabel: string;
  submitLabel: string;
  onOwnerChange: (value: string) => void;
  onRepoChange: (value: string) => void;
  onBranchChange: (value: string) => void;
  onSubmit: () => void;
  classNames: {
    form: string;
    input: string;
    button: string;
  };
}

export function SourceViewerSearchForm({
  owner,
  repo,
  branch,
  ownerLabel,
  repoLabel,
  branchLabel,
  submitLabel,
  onOwnerChange,
  onRepoChange,
  onBranchChange,
  onSubmit,
  classNames,
}: SourceViewerSearchFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className={classNames.form} onSubmit={handleSubmit}>
      <input
        className={classNames.input}
        value={owner}
        onChange={(event) => onOwnerChange(event.target.value)}
        placeholder={ownerLabel}
        aria-label={ownerLabel}
        autoComplete="off"
      />
      <input
        className={classNames.input}
        value={repo}
        onChange={(event) => onRepoChange(event.target.value)}
        placeholder={repoLabel}
        aria-label={repoLabel}
        autoComplete="off"
      />
      <input
        className={classNames.input}
        value={branch}
        onChange={(event) => onBranchChange(event.target.value)}
        placeholder={branchLabel}
        aria-label={branchLabel}
        autoComplete="off"
      />
      <button type="submit" className={classNames.button}>
        {submitLabel}
      </button>
    </form>
  );
}
