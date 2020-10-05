# vscode-markdown-linkifier

Creates quick local markdown links using [[name]] syntax.

I built this extension to help me write notes for my Dungeons and Dragons campaign.

This extension does two things inside markdown files:

1. whenever you type `[[`, it will provide auto-completions based on the other markdown files in your workspace.

   ![screenshot of autocomplete](https://raw.githubusercontent.com/bradzacher/vscode-markdown-linkifier/main/screenshot_autocomplete.png)

2. it will linkify these `[[name]]` segments to allow you to quick-open the file.

   ![screenshot of links](https://raw.githubusercontent.com/bradzacher/vscode-markdown-linkifier/main/screenshot_links.png)

How does it work?
It simply scans your workspace for `.md` files, and treats all underscores in filenames as spaces.
For example, the filename `Alden_d'Orien.md` will autocomplete as `Alden d'Orien`.

Autocomplete and linking is done irrespective of relative location between files (unless `roots` is set - see below).

## Options

### `markdown-linkifier.ignore.file`

A list of file names that should be skipped when finding markdown files.
This will match the file at any depth.

The default ignores `README.md` as usually this is not a file you want to link to.

### `markdown-linkifier.ignore.folder`

A list of folder names that should be skipped when finding markdown files.
This will match the folder at any depth.

The default ignores some obviously ignorable folders: `.git`, `.vscode` and `node_modules`.

### `markdown-linkifier.ignore.path`

A list of paths to skip when finding markdown files.
Unlike `ignore.file` and `ignore.folder`, `ignore.path` is a path relative to the workspace root.

This enables you to exclude specific paths from being matched. For example, you might want to specifically ignore the folder `foo/bar/baz`, but not all folders called `baz`.

### `markdown-linkifier.roots`

When set, your workspace will be separated into `N + 1` logical sets - one for each provided root, and one additional set for everything else.

If you've got multiple documentation spaces in your workspace, this option will let you separate them so that you don't get autocomplete / links from a different space.

For example, I keep D&D notes for all of my campaigns in the same git repo, but I don't want to cross-link between campaigns, so I have this set to `['eberron', 'infinite-empire']`, so that my notes in `eberron` do not link to my notes in `infinte-empire`.

If this is not set, then you will just get 1 logical set - the catch-all everything set.
