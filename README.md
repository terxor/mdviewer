# mdviewer - local server for markdown files

runtime dependencies:

- `bs4`
- `markdown2`
- `pygments`

To regenerate syntax css:

```
pygmentize -S default -f html > static/pygments.css
```

dev dependencies:

- `sass`: `sudo npm install -g sass`

extras:

```
npx prettier static/js/ --write
```


## TODO

- Fix search of terms with special symbols like 'vector<int>'


