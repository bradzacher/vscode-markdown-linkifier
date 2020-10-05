import * as vscode from 'vscode';

import { toStringSet } from './toStringSet';

type Config = {
  fileIgnoreList: ReadonlySet<string>;
  folderIgnoreList: ReadonlySet<string>;
  pathIgnoreList: ReadonlyArray<string>;
  roots: ReadonlyArray<string>;
};

function getConfig(): Config {
  const config = vscode.workspace.getConfiguration('markdown-linkifier');
  const fileIgnoreList = toStringSet(
    config.get<ReadonlyArray<string>>('ignore.file'),
  );
  const folderIgnoreList = toStringSet(
    config.get<ReadonlyArray<string>>('ignore.folder'),
  );
  const pathIgnoreList = config.get<ReadonlyArray<string>>('ignore.path') ?? [];
  const roots = config.get<ReadonlyArray<string>>('roots') ?? [];

  return {
    fileIgnoreList,
    folderIgnoreList,
    pathIgnoreList,
    roots,
  };
}

export { getConfig };
export type { Config };
