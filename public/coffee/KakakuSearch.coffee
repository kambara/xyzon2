class KakakuSearch
  @COMPLETE: 'complete'
  @ITEM_ELEMENT: 'item_element'
  @ERROR: 'error'

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
      @errors = []
      error.find("Message").each (i, elem) =>
        @errors.push( @errorJa($(elem).text()) )
        $.log(@errorJa($(elem).text()))
      true
    else
      false

  @errorMessagesTable: {
    'ItemNotFound': '該当する商品がひとつもありませんでした。'
    'TooManyItemsRequested': '制限値を超えたアイテム数のリクエストがありました。'
    'InvalidParameterValue': 'パラメータの値が入っていないか、不正です。'
    'No registration': '登録されていないアクセスキーです。'
    'Exceeded daily maximum': '１日のアクセス制限を超えました。'
    'Too many accesses': '制限を超えたアクセスがありました。'
    'Blocked IP address': '禁止されているIPからのアクセスです。'
    'InternalServerError': 'サーバは、処理を完了できませんでした。'
  }

  errorJa: (msg) ->
    KakakuSearch.errorMessagesTable[msg] || msg

  parseXML: (xml, page) ->
    xml = $(xml)
    $.log 'Parse page ' + page
    if @isError(xml)
      @trigger(KakakuSearch.ERROR, [@errors])
      return
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
