# ItemContainerとAxisScale(軸)を管理

class XYGraphArea
  constructor: ->
    params = Util.getLocationParams()
    @subCategoryName = if params['sub'] then decodeURIComponent(params['sub']) else null
    if @subCategoryName
      $('#sub-category').text(@subCategoryName)
    @categoryList = new CategoryList()
    @graphItems = []
    @paddingTop = 70
    @paddingBottom = 10
    @paddingLeft = 30
    @paddingRight = 200
    if ($(window).width() > 1600)
      @paddingTop += 80
      @paddingRight += 80

    # ItemContainer初期化
    @itemContainer = @createItemContainer().appendTo(document.body)

    # Selector初期化
    @selector = new Selector()
    @selector.hide()

    # Axis初期化
    @xAxis = new Axis(AxisType.LowestPrice)
    @yAxis = new Axis(AxisType.PvRanking)
    @onAxisReset()

    # リサイズ
    @onWindowResize()
    $(window).resize => @onWindowResize()

    # 検索開始
    kakakuSearch = new KakakuSearch()
    kakakuSearch.bind(KakakuSearch.ITEM_ELEMENT, ( (evt, elem) =>
      @appendItem elem
    ))
    kakakuSearch.bind(KakakuSearch.COMPLETE, ( =>
      @updateRecommendCategory()
    ))

  onAxisReset: ->
    # Rangeなど初期化
    @minXValue_ = null
    @maxXValue_ = null
    @minYValue_ = null
    @maxYValue_ = null
    @xMaxAxisRange = new Range(0, 0)
    @yMaxAxisRange = new Range(0, 0)
    @xCurrentAxisRange = new Range(0, 0)
    @yCurrentAxisRange = new Range(0, 0)
    @rangeHistories = []

    # ラベル書き換え
    $('#x-axis-label').text(@xAxis.getLabel())
    $('#y-axis-label').text(@yAxis.getLabel())

    # 古いAxisScaleを消して作り直す
    @xAxisScale.remove() if @xAxisScale
    @yAxisScale.remove() if @yAxisScale
    @xAxisScale = @xAxis.createScale(ScaleMode.HORIZONTAL, @paddingLeft, @paddingRight)
    @yAxisScale = @yAxis.createScale(ScaleMode.VERTICAL, @paddingTop, @paddingBottom)

    # AxisRangeを再設定（初回は0個なので関係ない）
    for graphItem in @graphItems
      @updateRangeAndMoveItem_(graphItem)

  # 軸を変更
  switchXAxis: (axisType) ->
    delete @xAxis
    @xAxis = new Axis(axisType)
    @onAxisReset()
    @onWindowResize()

  switchYAxis: (axisType) ->
    delete @yAxis
    @yAxis = new Axis(axisType)
    @onAxisReset()
    @onWindowResize()

  onWindowResize: ->
    $('body').height( $(window).height() ) ## 画面全体でマウスイベント取得するため
    @width  = $(window).width() - $('#x-menu-box').outerWidth() - 100
    @height = $(window).height() - $('#header').outerHeight() - 50

    # ItemContainerをリサイズ
    @itemContainer.width(@width).height(@height).css({
      left: $('#x-menu-box').outerWidth()
      top:  $('#header').outerHeight()
    })

    # ItemContainerを再描画
    @adjustGraphItems()

    # ItemContainerにあわせてAxisScaleをリサイズ
    offset = @itemContainer.offset()
    rect = {
      left:   offset.left
      top:    offset.top
      width:  @itemContainer.outerWidth()
      height: @itemContainer.outerHeight()
    }
    @xAxisScale.setPosition(rect.left,
                            rect.top + rect.height)
    @yAxisScale.setPosition(rect.left + rect.width,
                            rect.top)
    @xAxisScale.setLength(rect.width)
    @yAxisScale.setLength(rect.height)

    # SelectorのLimit
    @selector.setLimitRect(offset.left,
                           offset.top,
                           @itemContainer.innerWidth(),
                           @itemContainer.innerHeight())
    # Move Axis Label
    yMenuBox = $('#y-menu-box')
    yMenuBox.css({
      left: $(window).width() - yMenuBox.outerWidth()
      top:  rect.top - yMenuBox.outerHeight()
    })

  createItemContainer: ->
    div = $("<div/>").unselectable().css({
      border: "1px solid #555"
      'background-color': "#FFF"
      position: 'absolute'
      cursor:   "crosshair"
      overflow: "hidden"
    }).mousedown((event) =>
      @onMousedown(event)
    )

    $("body").mousedown(() =>
      @removeAllDetail()
    ).mousemove((event) =>
      @onMousemove(event)
    ).mouseup((event) =>
      @onMouseup(event)
    )
    return div

  onMousedown: (event) ->
    event.preventDefault()
    event.stopPropagation()
    return if @dragging
    if @isAnyDetailShowing()
      @removeAllDetail()
      return

    @dragging = true
    @selector.start(event.pageX, event.pageY)
    @selector.show()
    # for item in @graphItems
    #   item.inactivateTip()

  isAnyDetailShowing: ->
    $.any(@graphItems, (i, item) -> item.isDetailShowing())

  removeAllDetail: ->
    for item in @graphItems
      item.removeDetail()

  onMousemove: (event) ->
    event.preventDefault()
    return if (!@dragging)
    @selector.resizeTo(event.pageX,
                           event.pageY)

  onMouseup: (event) ->
    return if (!@dragging)
    @dragging = false
    @selector.resizeTo(event.pageX,
                           event.pageY)
    rect = @selector.getRelativeRect()
    @selector.hide()

    if rect.width < 3 && rect.height < 3
      @zoomOut()
    else
      @zoomIn(
        new Range(
          @calcXValue(rect.getLeft()),
          @calcXValue(rect.getRight())
        ),
        new Range(
          @calcYValue(rect.getTop()),
          @calcYValue(rect.getBottom())
        )
      )
    # for item in @graphItems
    #   item.activateTip()

  setLocationHash: (xRange, yRange) ->
    params = []
    $.each({
      x1: if xRange then xRange.first else null,
      x2: if xRange then xRange.last  else null,
      y1: if yRange then yRange.first else null,
      y2: if yRange then yRange.last  else null
    }, (key, value) ->
        if value
          params.push(key + "=" + value)
    )
    url = location.href.split("#")[0]
    location.href = url + "#" + params.join("&")

  zoomIn: (xRange, yRange) ->
    @rangeHistories.push({
        xAxisRange: @xCurrentAxisRange,
        yAxisRange: @yCurrentAxisRange
    })
    @setCurrentAxisRange(xRange, yRange)
    #@setLocationHash(xRange, yRange)

  zoomOut: ->
    return if (@rangeHistories.length == 0)
    ranges = @rangeHistories.pop()
    if (@rangeHistories.length == 0)
        @setCurrentAxisRange(@xMaxAxisRange, @yMaxAxisRange)
    else
        @setCurrentAxisRange(ranges.xAxisRange, ranges.yAxisRange)

  adjustGraphItems: ->
    for item in @graphItems
      xValue = item.getAxisValue(@xAxis.axisType)
      yValue = item.getAxisValue(@yAxis.axisType)
      if xValue? and !isNaN(xValue) and yValue? and !isNaN(yValue)
        item.animateMoveTo(
          @calcXCoord(xValue),
          @calcYCoord(yValue)
        )
        item.show()
      else
        item.hide()

  #
  # 座標から値に変換
  #
  calcXValue: (x) ->
    if @xAxis.isLogScale()
      Math.exp(
        @xCurrentAxisRange.getLogFirst() +
          (@xCurrentAxisRange.getLogDifference() * x / @width)
      )
    else
      @xCurrentAxisRange.first +
      (@xCurrentAxisRange.getDifference() * x / @width)

  calcYValue: (y) ->
    if @yAxis.isLogScale()
      Math.exp(
        @yCurrentAxisRange.getLogFirst() +
          (@yCurrentAxisRange.getLogDifference() * y / @height)
      )
    else
      @yCurrentAxisRange.first +
        (@yCurrentAxisRange.getDifference() * y / @height)

  #
  # 値から実際の座標に変換
  #
  calcXCoord: (value) ->
    @paddingLeft +
    Math.round(
      if @xAxis.isLogScale()
        @getBodyWidth() *
        (Math.log(value) - @xCurrentAxisRange.getLogFirst()) /
        @xCurrentAxisRange.getLogDifference()
      else
        @getBodyWidth() *
        (value - @xCurrentAxisRange.first) /
        @xCurrentAxisRange.getDifference()
    )

  calcYCoord: (value) ->
    @paddingTop +
    Math.round(
      if @yAxis.isLogScale()
        @getBodyHeight() *
        (Math.log(value) - @yCurrentAxisRange.getLogFirst()) /
        @yCurrentAxisRange.getLogDifference()
      else
        @getBodyHeight() *
        (value - @yCurrentAxisRange.first) /
        @yCurrentAxisRange.getDifference()
    )

  getBodyWidth: ->
    @width - @paddingLeft - @paddingRight

  getBodyHeight: ->
    @height - @paddingTop - @paddingBottom

  #
  # アイテム追加
  #
  appendItem: (itemXmlElem) ->
    graphItem = new XYGraphItem(itemXmlElem)
    return if (!graphItem.getLowestPrice()) # 値段は必須

    # アイテムは追加しなくてもカテゴリリストには追加しておく
    @categoryList.add(graphItem.getCategoryName())

    # サブカテゴリが指定されている場合は絞り込む
    if @subCategoryName
      return if (@subCategoryName != graphItem.getSubCategoryName())

    @graphItems.push(graphItem)
    graphItem.render(@itemContainer)
    @updateRangeAndMoveItem_(graphItem)

  updateRangeAndMoveItem_: (graphItem) ->
    # 値が無効の商品（日付が不明など）は除外する
    if (graphItem.getAxisValue(@yAxis.axisType))
        graphItem.show()
    else
        graphItem.hide()
        return

    # Rangeを更新．Rangeを更新したら再描画
    xValue = graphItem.getAxisValue(@xAxis.axisType)
    yValue = graphItem.getAxisValue(@yAxis.axisType)
    @updateRange_(xValue, yValue)
    graphItem.moveTo(
        @calcXCoord(xValue),
        @calcYCoord(yValue)
    )

  updateRange_: (xValue, yValue) ->
    xChanged = false
    yChanged = false
    if (@minXValue_ == null || xValue < @minXValue_)
        @minXValue_ = xValue
        xChanged = true
    if (@maxXValue_ == null || xValue > @maxXValue_)
        @maxXValue_ = xValue
        xChanged = true
    if (@minYValue_ == null || yValue < @minYValue_)
        @minYValue_ = yValue
        yChanged = true
    if (@maxYValue_ == null || yValue > @maxYValue_)
        @maxYValue_ = yValue
        yChanged = true
    if (xChanged || yChanged)
        @setMaxAxisRange(
            new Range(@minXValue_, @maxXValue_),
            new Range(@minYValue_, @maxYValue_)
        )

  setMaxAxisRange: (xRange, yRange) ->
    @xMaxAxisRange = xRange
    @yMaxAxisRange = yRange
    if (@rangeHistories.length == 0)
      @setCurrentAxisRange(xRange, yRange)

  setCurrentAxisRange: (xRange, yRange) ->
    @xCurrentAxisRange = xRange
    @yCurrentAxisRange = yRange
    @xAxisScale.setRange(xRange)
    @yAxisScale.setRange(yRange)
    @adjustGraphItems()

  updateRecommendCategory: () ->
    params = Util.getLocationParams()
    categoryKey = params['category']
    if categoryKey and categoryKey != 'ALL'
      names = @categoryList.recommendSub(categoryKey).slice(0, 3)
      @appendRecommendSubCategories(categoryKey, names)
    else
      names = @categoryList.recommend().slice(0, 3)
      @appendRecommendCategories(names)

  appendRecommendCategories: (names) ->
    container = $('#sub-category')
    params = Util.getLocationParams()
    keyword = params['keyword']
    for name in names
      key = Category.getKeyFrom(name)
      link = $('<a/>').attr({
        href: "/search?keyword=#{keyword}&category=#{key}"
      }).addClass('recommend').text(name)
      container.append(link)

  appendRecommendSubCategories: (categoryKey, names) ->
    container = $('#sub-category')
    params = Util.getLocationParams()
    keyword = params['keyword']
    for name in names
      continue if @subCategoryName and (name == @subCategoryName)
      sub = encodeURIComponent(name)
      link = $('<a/>').attr({
        href: "/search?keyword=#{keyword}&category=#{categoryKey}&sub=#{sub}"
      }).addClass('recommend').text(name)
      container.append(link)
