import * as vscode from 'vscode';

import { competionProvider } from './completionProvider';
import { linkProvider } from './linkProvider';
import { cachedFileFinder } from './utils/cachedFileFinder';

export function activate(extensionContext: vscode.ExtensionContext): void {
  const finder = cachedFileFinder();

  extensionContext.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      'markdown',
      competionProvider(finder),
      '[', // triggered whenever a '[' is being typed
    ),
    vscode.languages.registerDocumentLinkProvider(
      'markdown',
      linkProvider(finder),
    ),
    finder,
  );
}
