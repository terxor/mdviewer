# mdviewer - local server for markdown files

To regenerate syntax css:

```
pygmentize -S default -f html > static/pygments.css

# Preferred
pygmentize -S xcode -f html > static/pygments.css
```

dev dependencies:

- `sass`: `sudo npm install -g sass`

extras:

```
npx prettier static/js/ --write
```

In case you don't wish to download whole `node/npm` thing, you can
get standalone binary:

```
curl -fsSL -o sass.tar.gz https://github.com/sass/dart-sass/releases/download/1.91.0/dart-sass-1.91.0-linux-x64.tar.gz
```

## TODO

- Fix scroll in dir tree (on focus)

- Fix search of terms with special symbols like 'vector<int>'

- Make file links to be able to open in new tabs
- Reload button (maybe)

- Bug: splitlines on None in fuzzysearch (L=43)

