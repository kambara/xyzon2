class KakakuSearch
  @COMPLETE: 'complete'
  @ITEM_ELEMENT: 'item_element'

  constructor: ->
    @dispatcher_ = $(this)
    @maxPages = 0
    @fetchFirstPage()

  bind: (evt, func) ->
    @dispatcher_.bind(evt, func)

  trigger: (evt, args=[]) ->
    @dispatcher_.trigger(evt, args)

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
        ## TODO: Areaに通知。おすすめカテゴリを更新する。（dispatchしたい）
        @trigger(KakakuSearch.COMPLETE)
    )

  isError: (xml) ->
    xml = $(xml)
    error = xml.find("Error")
    if (error.length > 0)
      error.find("Message").each (i, elem) ->
        $.log($(elem).text())
      true
    else
      false

  parseXML: (xml, page) ->
    xml = $(xml)
    $.log 'Parse page ' + page
    return if @isError(xml)
    if page is 1
      numOfResult = parseInt(xml.find("NumOfResult").text())
      allPageNum = Math.ceil(numOfResult/20)
      max = 3
      @maxPages = if (allPageNum <= max) then allPageNum else max
    ## Itemをグラフに追加
    xml.find("Item").each (index, elem) =>
      @trigger(KakakuSearch.ITEM_ELEMENT, [elem])

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
