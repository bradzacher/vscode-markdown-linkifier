import * as vscode from 'vscode';

import { getRootForUri } from './getRootForUri';
import type { Match } from './recursivelyFindAll';
import { recursivelyFindAll } from './recursivelyFindAll';

type Finder = {
  dispose: () => void;
  findAll: (document: vscode.TextDocument) => ReadonlyArray<Match>;
};

const CACHE = new Map<string, ReadonlyArray<Match>>();
function clearCacheForUri(uri: vscode.Uri): void {
  const root = getRootForUri(uri);
  CACHE.delete(root);
}

function cachedFileFinder(): Finder {
  const watcher = vscode.workspace.createFileSystemWatcher('**/*.md');

  watcher.onDidCreate(clearCacheForUri);
  watcher.onDidDelete(clearCacheForUri);

  return {
    dispose() {
      watcher.dispose();
    },
    findAll(document) {
      const root = getRootForUri(document.uri);
      const cached = CACHE.get(root);
      if (cached) {
        return cached;
      }

      const fresh = recursivelyFindAll(document);
      CACHE.set(root, fresh);
      return fresh;
    },
  };
}

export { cachedFileFinder };
export type { Finder };
