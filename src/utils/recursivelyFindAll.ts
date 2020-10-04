import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { toStringSet } from './toStringSet';

type Match = {
  name: string;
  absolute: string;
};

function recursivelyFindAllHelper(
  root: string,
  fileIgnoreList: ReadonlySet<string>,
  folderIgnoreList: ReadonlySet<string>,
  pathIgnoreList: ReadonlyArray<string>,
): Array<Match> {
  const dirContents = fs.readdirSync(root, 'utf-8');
  const files: Array<Match> = [];

  for (const item of dirContents) {
    const absolute = path.join(root, item);
    if (pathIgnoreList.some(pathIgnore => absolute.startsWith(pathIgnore))) {
      continue;
    }

    if (fs.statSync(absolute).isDirectory()) {
      if (!folderIgnoreList.has(item)) {
        const subFiles = recursivelyFindAllHelper(
          absolute,
          fileIgnoreList,
          folderIgnoreList,
          pathIgnoreList,
        );
        files.push(...subFiles);
      }
      continue;
    }

    if (fileIgnoreList.has(item)) {
      continue;
    }

    const parsed = path.parse(item);
    if (parsed.ext === '.md') {
      files.push({
        name: parsed.name.replace(/_/gu, ' '),
        absolute,
      });
    }
  }

  return files;
}

function recursivelyFindAll(document: vscode.TextDocument): Array<Match> {
  const workspace = vscode.workspace.getWorkspaceFolder(document.uri);
  if (!workspace) {
    return [];
  }
  const workspaceRoot = workspace.uri.fsPath;

  const config = vscode.workspace.getConfiguration('markdown-linkifier');
  const fileIgnoreList = toStringSet(
    config.get<ReadonlyArray<string>>('ignore.file'),
  );
  const folderIgnoreList = toStringSet(
    config.get<ReadonlyArray<string>>('ignore.folder'),
  );
  let pathIgnoreList = [
    ...(config.get<ReadonlyArray<string>>('ignore.path') ?? []),
  ];

  let fileRoot = workspaceRoot;

  // narrow the search to the specific root
  const roots = config.get<ReadonlyArray<string>>('roots');
  if (roots) {
    const matchedRoot = roots.some(rootPart => {
      const root = path.join(workspaceRoot, rootPart);
      if (document.uri.fsPath.startsWith(root)) {
        fileRoot = root;
        return true;
      }
      return false;
    });
    if (!matchedRoot) {
      pathIgnoreList.push(...roots);
    }
  }

  // make the path ignores absolute
  pathIgnoreList = pathIgnoreList.map(pathIgnore =>
    path.join(workspaceRoot, pathIgnore),
  );

  const matches = recursivelyFindAllHelper(
    fileRoot,
    fileIgnoreList,
    folderIgnoreList,
    pathIgnoreList,
  );

  return matches;
}

export { recursivelyFindAll };
export type { Match };
