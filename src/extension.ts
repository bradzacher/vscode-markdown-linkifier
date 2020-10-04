import * as vscode from 'vscode';

import { competionProvider } from './completionProvider';
import { linkProvider } from './linkProvider';

export function activate(extensionContext: vscode.ExtensionContext): void {
  extensionContext.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      'markdown',
      competionProvider,
      '[', // triggered whenever a '[' is being typed
    ),
    vscode.languages.registerDocumentLinkProvider('markdown', linkProvider),
  );
}
