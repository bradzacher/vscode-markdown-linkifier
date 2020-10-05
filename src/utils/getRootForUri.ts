import * as path from 'path';
import type { Uri } from 'vscode';
import * as vscode from 'vscode';

import { getConfig } from './getConfig';

function getRootForUri(uri: Uri): string {
  const workspace = vscode.workspace.getWorkspaceFolder(uri);
  if (!workspace) {
    // who knows
    return uri.fsPath;
  }

  const workspaceRoot = workspace.uri.fsPath;
  const { roots } = getConfig();

  for (const rootPart of roots) {
    const root = path.join(workspaceRoot, rootPart);
    if (uri.fsPath.startsWith(root)) {
      return root;
    }
  }

  return workspaceRoot;
}

export { getRootForUri };
