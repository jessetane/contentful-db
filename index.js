module.exports = Contentful

function Contentful (opts) {
  opts = opts || {}
  this.space = opts.space
  this.key = opts.key
  this.contentTypes = opts.contentTypes
}

Contentful.prototype.load = function (cb) {
  var request = new XMLHttpRequest()
  request.addEventListener('readystatechange', function (evt) {
    if (request.readyState !== 4) return
    if (request.status < 200 || request.status > 299) {
      return cb(new Error(request.status))
    }
    var rawEntries = request.response
    try {
      rawEntries = JSON.parse(rawEntries)
    } catch (err) {
      return cb(err)
    }
    this.entries = this._parseEntries(rawEntries)
    this.loaded = true
    cb()
  }.bind(this))
  request.open('GET', 'https://cdn.contentful.com/spaces/' + this.space + '/entries?limit=1000&access_token=' + this.key, true)
  request.send()
}

Contentful.prototype._parseEntries = function (rawEntries) {
  var entries = {}
  var types = this.contentTypes
  var items = rawEntries.items
  if (rawEntries.includes) {
    if (rawEntries.includes.Asset) {
      items = items.concat(rawEntries.includes.Asset)
    }
    if (rawEntries.includes.Entry) {
      items = items.concat(rawEntries.includes.Entry)
    }
  }
  items.forEach(function (item) {
    var type = 'assets'
    if (item.sys.contentType) {
      type = types[item.sys.contentType.sys.id] || item.sys.contentType.sys.id
    }
    var fields = item.fields
    fields.id = item.sys.id
    fields.type = type
    entries[item.sys.id] = fields
  })
  for (var item in entries) {
    item = entries[item]
    for (var field in item) {
      var value = item[field]
      if (Array.isArray(value)) {
        var resolved = []
        for (var i = 0; i < value.length; i++) {
          var subvalue = value[i]
          if (subvalue.sys) {
            subvalue = entries[subvalue.sys.id]
            if (subvalue) {
              resolved.push(subvalue)
            }
          } else {
            resolved.push(subvalue)
          }
        }
        item[field] = resolved
      } else if (value.sys && value.sys.type === 'Link') {
        item[field] = entries[value.sys.id]
      }
    }
  }
  return entries
}

Contentful.prototype.find = function (criteria) {
  var entries = this.entries
  var results = []
  for (var id in entries) {
    var object = entries[id]
    var satisfactory = true
    for (var key in criteria) {
      if (object[key] !== criteria[key]) {
        satisfactory = false
        break
      }
    }
    if (satisfactory) {
      results.push(object)
    }
  }
  return results
}
