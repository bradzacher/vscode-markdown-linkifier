import type { DocumentLinkProvider } from 'vscode';
import { DocumentLink, Position, Range, Uri } from 'vscode';

import { recursivelyFindAll } from './utils/recursivelyFindAll';

const LINK_REGEX = /\[\[[^\\]+?\]\]/u;
const enum State {
  Searching,
  InsideLink,
}

type Match = {
  line: number;
  start: number;
  end: number;
  text: string;
};

// eslint-disable-next-line complexity -- state machine
function parseLine(line: string, lineNum: number): ReadonlyArray<Match> {
  const matches: Array<Match> = [];
  let state = State.Searching;
  let linkStart: number | null = null;
  let linkText: string | null = null;
  for (let col = 0; col < line.length; col += 1) {
    const char = line[col];
    switch (char) {
      case '[':
        if (state !== State.Searching) {
          continue;
        }

        if (line[col + 1] === '[') {
          state = State.InsideLink;
          linkStart = col;
          linkText = '';
          col += 1;
        }
        break;

      case ']':
        if (state !== State.InsideLink) {
          continue;
        }

        if (line[col + 1] === ']') {
          if (linkStart == null || linkText == null) {
            throw new Error('Unexpected parser state');
          }
          matches.push({
            line: lineNum,
            start: linkStart,
            end: col + 2,
            text: linkText,
          });

          state = State.Searching;
          linkStart = null;
          col += 1;
        }
        break;

      case '\\':
        col += 1;
        break;

      default:
        if (state === State.InsideLink && linkText != null) {
          linkText += char;
        }
        break;
    }
  }

  return matches;
}

export const linkProvider: DocumentLinkProvider = {
  provideDocumentLinks(document) {
    const lines = document.getText().split('\n');

    const matches: Array<Match> = [];
    for (let lineNum = 0; lineNum < lines.length; lineNum += 1) {
      const line = lines[lineNum];
      if (!LINK_REGEX.test(line)) {
        continue;
      }

      matches.push(...parseLine(line, lineNum));
    }

    if (matches.length === 0) {
      return [];
    }

    const files = new Map<string, Uri>();
    recursivelyFindAll(document).forEach(file => {
      files.set(file.name, Uri.file(file.absolute));
    });

    return matches
      .map(match => {
        const uri = files.get(match.text);
        if (!uri) {
          return null;
        }
        return new DocumentLink(
          new Range(
            new Position(match.line, match.start),
            new Position(match.line, match.end),
          ),
          uri,
        );
      })
      .filter((match): match is DocumentLink => match != null);
  },
};
