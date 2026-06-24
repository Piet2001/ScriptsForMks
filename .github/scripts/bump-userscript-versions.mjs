import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repoRoot = process.cwd();
const today = formatToday();
const changedFiles = getChangedUserScripts();

if (changedFiles.length === 0) {
    console.log('No changed .user.js files detected.');
    process.exit(0);
}

const allUserScripts = findUserScripts(repoRoot);
let bumpCount = getHighestBumpForDate(allUserScripts, today);
const updatedFiles = [];

for (const relativeFilePath of changedFiles) {
    const absoluteFilePath = path.join(repoRoot, relativeFilePath);
    if (!fs.existsSync(absoluteFilePath)) {
        continue;
    }

    const originalContent = fs.readFileSync(absoluteFilePath, 'utf8');
    const versionMatch = originalContent.match(/^(\/\/\s*@version\s+)(\S+)$/m);
    if (!versionMatch) {
        console.warn(`Skipping ${relativeFilePath}: no @version header found.`);
        continue;
    }

    bumpCount += 1;
    const nextVersion = `${today}.${String(bumpCount).padStart(2, '0')}`;

    let updatedContent = originalContent.replace(
        /^(\/\/\s*@version\s+)\S+$/m,
        `$1${nextVersion}`,
    );

    updatedContent = updatedContent.replace(
        /\b(var|let|const)\s+(version|versie)\s*=\s*(["'])[^"']+\3/,
        `$1 $2 = $3${nextVersion}$3`,
    );

    if (updatedContent === originalContent) {
        continue;
    }

    fs.writeFileSync(absoluteFilePath, updatedContent, 'utf8');
    updatedFiles.push({ file: relativeFilePath, version: nextVersion });
}

if (updatedFiles.length === 0) {
    console.log('No version updates were required.');
    process.exit(0);
}

for (const { file, version } of updatedFiles) {
    console.log(`${file} -> ${version}`);
}

function formatToday() {
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

function getChangedUserScripts() {
    const before = process.env.GITHUB_EVENT_BEFORE;
    const sha = process.env.GITHUB_SHA;
    const zeroSha = '0000000000000000000000000000000000000000';
    const diffArgs = before && before !== zeroSha
        ? ['diff', '--name-only', before, sha]
        : ['diff-tree', '--no-commit-id', '--name-only', '-r', sha];

    const output = runGit(diffArgs);
    return [...new Set(
        output
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.endsWith('.user.js')),
    )];
}

function getHighestBumpForDate(filePaths, datePrefix) {
    let highest = 0;

    for (const relativeFilePath of filePaths) {
        const absoluteFilePath = path.join(repoRoot, relativeFilePath);
        const content = fs.readFileSync(absoluteFilePath, 'utf8');
        const versionMatch = content.match(/^\/\/\s*@version\s+(\S+)$/m);
        if (!versionMatch) {
            continue;
        }

        const parsed = parseVersion(versionMatch[1]);
        if (!parsed || parsed.date !== datePrefix) {
            continue;
        }

        highest = Math.max(highest, parsed.bump);
    }

    return highest;
}

function parseVersion(version) {
    const match = version.match(/^(\d{4}\.\d{2}\.\d{2})(?:\.(\d+))?$/);
    if (!match) {
        return null;
    }

    return {
        date: match[1],
        bump: match[2] ? Number(match[2]) : 0,
    };
}

function findUserScripts(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        if (entry.name === '.git') {
            continue;
        }

        const absolutePath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            files.push(...findUserScripts(absolutePath));
            continue;
        }

        if (entry.isFile() && entry.name.endsWith('.user.js')) {
            files.push(path.relative(repoRoot, absolutePath).replace(/\\/g, '/'));
        }
    }

    return files;
}

function runGit(args) {
    return execFileSync('git', args, {
        cwd: repoRoot,
        encoding: 'utf8',
    }).trim();
}