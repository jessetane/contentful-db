# contentful-db
[Contentful](https://www.contentful.com/) database downloader / parser for use in the browser.

## Why
If you have <= 1k entries, your database is likely to compress very well (Contentful's content delivery API uses gzip) which means it's generally quite feasible to download the entire thing at page load.

## How
`XMLHttpRequest`

## Example
``` javascript
var Contentful = require('contentful-db')

var db = new Contentful({
  space: 'WWW',
  key: 'XXX',
  contentTypes: {
    'YYY': 'pages',
    'ZZZ': 'menus'
  }
})

db.load(function () {
  console.log(db.entries)
  var pages = db.find({ type: 'pages' })
  console.log(pages)
})
```

## License
Public Domain
