class KakakuSearch
  constructor: (@xyGraph) ->
    @maxPages = 0
    @fetchFirstPage()

  fetchFirstPage: ->
    $.get(@makeSearchURL(1), (xml) =>
      @parseXML(xml, 1)
      if @maxPages > 1
        @loadedCount = 1
        @fetchRestPages()
    )

  fetchRestPages: ->
    for page in [2..@maxPages]
      @fetchAndParseXML(page)

  fetchAndParseXML: (page) ->
    $.get(@makeSearchURL(page), (xml) =>
      @parseXML(xml, page)
      @loadedCount += 1
      if @loadedCount >= @maxPages
        $.log "Loaded"
    )

  isError: (xml) ->
    xml = $(xml)
    error = xml.find("Error")
    if (error.length > 0)
      error.find("Message").each (i, elem) ->
        $.log("Page "+ page + ": " + $(elem).text())
      true
    else
      false

  parseXML: (xml, page) ->
    xml = $(xml)
    return if @isError(xml)
    if page is 1
      numOfResult = parseInt(xml.find("NumOfResult").text())
      allPageNum = Math.ceil(numOfResult/20)
      max = 3
      @maxPages = if (allPageNum <= max) then allPageNum else max

    $.log 'Parse page ' + page
    ## Itemをグラフに追加
    xml.find("Item").each (index, elem) =>
      @xyGraph.appendItem elem

  makeSearchURL: (page) ->
    params = @getLocationParams()
    [
        "/ajax/search",
        params["category"],
        params["keyword"],
        page.toString(),
        "xml"
    ].join("/")

  getLocationParams: ->
    return {} if (location.search.length <= 1)
    pairs = location.search.substr(1).split("&")
    params = {}
    for i in [0...pairs.length]
      pair = pairs[i].split("=")
      if pair.length == 2
        params[pair[0]] = pair[1]
    params
