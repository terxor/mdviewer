# mdviewer - local server for markdown files

runtime dependencies:

- `flask`
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

- Fix tables: no wrapping and add horiz scroll
- Fix search of terms with special symbols like 'vector<int>'
- Fix performance/snappiness

- Fix TOC scroll (auto-scroll conflict) in large docs
  - Reproduce issue: click on last heading in large doc

- Fix main scroll issue
  - Reproduce issue: scroll to mid of some large page, switch to another large
    page (it is auto scrolled)
