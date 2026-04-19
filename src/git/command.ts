import {execFileSync} from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {Command} from 'commander';
import {durationToMs} from '../../modules/lib/js/transform/date';

function formatGitCommitDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function shellSingleQuote(s: string): string {
  return `'${s.replace(/'/g, `'\"'\"'`)}'`;
}

/**
 * Rewrite author/committer date for each commit in `from^..to` by adding `durationMs` to that
 * commit's original author time (seconds from %at).
 */
function rewriteCommitDatesInRange(from: string, to: string, durationMs: number): void {
  const revSpec = `${from}^..${to}`;
  let commits: string[];
  try {
    commits = execFileSync('git', ['rev-list', '--reverse', revSpec], {encoding: 'utf8'})
      .trim()
      .split('\n')
      .filter(Boolean);
  } catch (e) {
    throw new Error(
      `ag amend: failed to list commits for ${revSpec}. Is --from an ancestor of --to, and not the repo root without a parent? (${String(
        (e as Error).message ?? e
      )})`
    );
  }
  if (commits.length === 0) {
    throw new Error(`ag amend: no commits in range ${revSpec}; check --from / --to`);
  }
  const lines = ['case "$GIT_COMMIT" in'];
  for (const sha of commits) {
    const atSec = parseInt(
      execFileSync('git', ['log', '-1', '--format=%at', sha], {encoding: 'utf8'}).trim(),
      10
    );
    const newMs = atSec * 1000 + durationMs;
    const dateStr = formatGitCommitDate(new Date(newMs));
    lines.push(`  ${sha}) export GIT_AUTHOR_DATE=${shellSingleQuote(dateStr)}; export GIT_COMMITTER_DATE=${shellSingleQuote(dateStr)} ;;`);
  }
  lines.push('esac');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ag-amend-'));
  const scriptPath = path.join(dir, 'env-filter.sh');
  fs.writeFileSync(scriptPath, `${lines.join('\n')}\n`, {mode: 0o755});
  try {
    const envFilter = `. ${shellSingleQuote(scriptPath)}`;
    execFileSync('git', ['filter-branch', '-f', `--env-filter=${envFilter}`, '--', revSpec], {
      stdio: 'inherit',
    });
  } finally {
    fs.rmSync(dir, {recursive: true, force: true});
  }
}

const program = new Command();
program.name('ag').description('Assist git workflows');

program
  .command('amend')
  .description(
    'Set commit date: without --from/--to, amends HEAD to now + duration. With --from and --to, shifts author/committer date of each commit in from^..to by duration (from each commit\'s original author time).'
  )
  .requiredOption('-d, --duration <str>', 'offset (duration string for durationToMs), e.g. 1h, -30m')
  .option('--from <rev>', 'range start (inclusive); must be used with --to')
  .option('--to <rev>', 'range end (inclusive); must be used with --from')
  .action((options: {duration: string; from?: string; to?: string}) => {
    const ms = durationToMs(options.duration);
    const from = options.from?.trim();
    const to = options.to?.trim();
    const hasFrom = Boolean(from);
    const hasTo = Boolean(to);
    if (hasFrom !== hasTo) {
      throw new Error('ag amend: --from and --to must be given together');
    }
    if (hasFrom && hasTo) {
      rewriteCommitDatesInRange(from!, to!, ms);
      return;
    }
    const when = new Date(Date.now() + ms);
    const dateStr = formatGitCommitDate(when);
    execFileSync('git', ['commit', '--amend', '--no-edit', '--date', dateStr, '--no-verify'], {
      stdio: 'inherit',
    });
  });

program.parse(process.argv);
