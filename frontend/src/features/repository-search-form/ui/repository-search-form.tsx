import type { FormEvent } from "react";

interface RepositorySearchFormProps {
  owner: string;
  repo: string;
  ownerLabel: string;
  repoLabel: string;
  searchLabel: string;
  onOwnerChange: (value: string) => void;
  onRepoChange: (value: string) => void;
  onSubmit: () => void;
  classNames: {
    form: string;
    input: string;
    button: string;
  };
}

export function RepositorySearchForm({
  owner,
  repo,
  ownerLabel,
  repoLabel,
  searchLabel,
  onOwnerChange,
  onRepoChange,
  onSubmit,
  classNames,
}: RepositorySearchFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className={classNames.form} onSubmit={handleSubmit}>
      <input
        id="repo-owner"
        className={classNames.input}
        value={owner}
        onChange={(event) => onOwnerChange(event.target.value)}
        placeholder={ownerLabel}
        aria-label={ownerLabel}
        autoComplete="off"
      />
      <input
        id="repo-name"
        className={classNames.input}
        value={repo}
        onChange={(event) => onRepoChange(event.target.value)}
        placeholder={repoLabel}
        aria-label={repoLabel}
        autoComplete="off"
      />
      <button type="submit" className={classNames.button}>
        {searchLabel}
      </button>
    </form>
  );
}
