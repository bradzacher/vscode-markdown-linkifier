import type { CompletionItemProvider } from 'vscode';
import * as vscode from 'vscode';

import { recursivelyFindAll } from './utils/recursivelyFindAll';

function getSearchText(line: string): string | null {
  for (let i = line.length - 1; i > 0; i -= 1) {
    const current = line[i];
    const previous = line[i - 1];
    if (current === ']' && previous === ']') {
      // there was a closing token so exit
      return null;
    }
    if (current === '[' && previous === '[') {
      return line.substring(i + 1);
    }
  }

  return null;
}

export const competionProvider: CompletionItemProvider = {
  provideCompletionItems(document, position) {
    // get all text until the `position` and check if it reads `console.`
    // and if so then complete if `log`, `warn`, and `error`
    const linePrefix = document
      .lineAt(position)
      .text.substr(0, position.character);
    const searchText = getSearchText(linePrefix);

    if (searchText == null) {
      return [];
    }

    const workspace = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workspace) {
      return [];
    }

    const matches = recursivelyFindAll(document);

    return matches.map(
      match =>
        new vscode.CompletionItem(match.name, vscode.CompletionItemKind.File),
    );
  },
};
