import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { getConfig } from './getConfig';
import { getRootForUri } from './getRootForUri';

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

  const config = getConfig();
  const fileRoot = getRootForUri(document.uri);

  let pathIgnoreList = [...config.pathIgnoreList];

  // ignore the configured roots if we're doing a workspace root search
  if (config.roots.length && fileRoot === workspaceRoot) {
    pathIgnoreList.push(...config.roots);
  }

  // make the path ignores absolute
  pathIgnoreList = pathIgnoreList.map(pathIgnore =>
    path.join(workspaceRoot, pathIgnore),
  );

  const matches = recursivelyFindAllHelper(
    fileRoot,
    config.fileIgnoreList,
    config.folderIgnoreList,
    config.pathIgnoreList,
  );

  return matches;
}

export { recursivelyFindAll };
export type { Match };
