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


## TODO

- Fix search of terms with special symbols like 'vector<int>'

- Make file links to be able to open in new tabs
- Reload button (maybe)

- Bug: splitlines on None in fuzzysearch (L=43)
