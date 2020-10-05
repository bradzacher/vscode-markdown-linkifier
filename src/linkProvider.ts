import type { DocumentLinkProvider, TextDocument } from 'vscode';
import { DocumentLink, Position, Range, Uri } from 'vscode';

import type { Finder } from './utils/cachedFileFinder';

const LINK_REGEX = /\[\[[^\\]+?\]\]/u;
const enum State {
  Searching,
  InsideLink,
}

type ParsedMatch = {
  line: number;
  start: number;
  end: number;
  text: string;
};

// eslint-disable-next-line complexity -- state machine
function parseLine(line: string, lineNum: number): ReadonlyArray<ParsedMatch> {
  const matches: Array<ParsedMatch> = [];
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

type ParsedMatchWithDocument = ParsedMatch & {
  document: TextDocument;
  range: Range;
};

function linkProvider(finder: Finder): DocumentLinkProvider {
  const LINK_MATCHES = new WeakMap<DocumentLink, ParsedMatchWithDocument>();

  return {
    provideDocumentLinks(document) {
      const lines = document.getText().split('\n');

      const matches: Array<ParsedMatch> = [];
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

      return matches.map(match => {
        const range = new Range(
          new Position(match.line, match.start),
          new Position(match.line, match.end),
        );
        const link = new DocumentLink(
          new Range(
            new Position(match.line, match.start),
            new Position(match.line, match.end),
          ),
        );

        // store the link information so we can resolve it later
        LINK_MATCHES.set(link, { ...match, document, range });
        return link;
      });
    },

    resolveDocumentLink(link) {
      const linkMatch = LINK_MATCHES.get(link);
      if (linkMatch == null) {
        return null;
      }

      const match = finder
        .findAll(linkMatch.document)
        .find(found => found.name === linkMatch.text);
      if (match == null) {
        return null;
      }

      return new DocumentLink(linkMatch.range, Uri.file(match.absolute));
    },
  };
}

export { linkProvider };
