class Util
  @getLocationParams: ->
    return {} if (location.search.length <= 1)
    pairs = location.search.substr(1).split("&")
    params = {}
    for i in [0...pairs.length]
      pair = pairs[i].split("=")
      if pair.length == 2
        params[pair[0]] = pair[1]
    params
