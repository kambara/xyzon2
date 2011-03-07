# ItemContainerとAxisScale(軸)を管理

class XYGraphArea
  constructor: ->
    @graphItems = []
    @xAxis = new Axis(AxisType.LowestPrice)
    @yAxis = new Axis(AxisType.PvRanking)
    @reset_()

    # ItemContainer
    @itemContainer = @createItemContainer()
    $(document.body).append(@itemContainer)

    # Selector
    @selector = new Selector()
    @selector.hide()

    $(window).resize =>
      @onWindowResize()

    @onWindowResize()

  reset_: ->
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

    # ラベル
    $('#x-axis-label').text(@xAxis.getLabel())
    $('#y-axis-label').text(@yAxis.getLabel())

    # 古いAxisScaleを消して作り直す
    @xAxisScale.remove() if (@xAxisScale)
    @yAxisScale.remove() if (@yAxisScale)
    @xAxisScale = @xAxis.getScale(ScaleMode.HORIZONTAL)
    @yAxisScale = @yAxis.getScale(ScaleMode.VERTICAL)

    # AxisRangeを再設定（初回は0個なので関係ない）
    for graphItem in @graphItems
      @updateRangeAndMoveItem_(graphItem)

  # 軸を変更
  switchXAxis: (axisType) ->
    delete @xAxis
    @xAxis = new Axis(axisType)
    @reset_()
    @onWindowResize()

  switchYAxis: (axisType) ->
    delete @yAxis
    @yAxis = new Axis(axisType)
    @reset_()
    @onWindowResize()

  onWindowResize: ->
    @width  = $(window).width() - $('#x-menu-box').outerWidth() - 100
    @height = $(window).height() - $('#header').outerHeight() - 34

    # Resize ItemContainer
    @itemContainer.width(@width).height(@height).css({
      left: $('#x-menu-box').outerWidth()
      top:  $('#header').outerHeight()
    })

    # itemContainer 再描画
    @adjustGraphItems()

    # Resize AxisScale
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

    # Selector Limit
    @selector.setLimitRect(rect.left,
                           rect.top,
                           rect.width,
                           rect.height)
    # Move Axis Label
    yMenuBox = $('#y-menu-box')
    yMenuBox.css({
      left: $(window).width() - yMenuBox.outerWidth()
      top:  rect.top - yMenuBox.outerHeight()
    })

  createItemContainer: ->
    div = $("<div/>").unselectable().css({
      border: "1px solid #555"
      "background-color": "#FFF"
      position: 'absolute'
      cursor: "crosshair"
      overflow: "hidden"
      "float": "left"
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
    for item in @graphItems
      item.inactivateTip()

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
    for item in @graphItems
      item.activateTip()

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
    $.each(@graphItems, (i, item) =>
      item.animateMoveTo(
        @calcXCoord(item.getAxisValue(@xAxis.axisType)),
        @calcYCoord(item.getAxisValue(@yAxis.axisType))
      )
    )

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

  calcXCoord: (value) ->
    if @xAxis.isLogScale()
      Math.round(
        @width *
          (Math.log(value) -
            @xCurrentAxisRange.getLogFirst()) /
              @xCurrentAxisRange.getLogDifference())
    else
      Math.round(
        @width *
          (value - @xCurrentAxisRange.first) /
            @xCurrentAxisRange.getDifference())

  calcYCoord: (value) ->
    if @yAxis.isLogScale()
      Math.round(
        @height *
          (Math.log(value) -
            @yCurrentAxisRange.getLogFirst()) /
              @yCurrentAxisRange.getLogDifference()
      )
    else
      Math.round(
        @height *
          (value - @yCurrentAxisRange.first) /
            @yCurrentAxisRange.getDifference()
      )

  appendItem: (itemXmlElem) ->
    graphItem = new XYGraphItem(itemXmlElem)
    return if (!graphItem.getLowestPrice()) # 値段は必須
    #$.log(graphItem.getLowestPrice())

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
    paddingRight = 100
    paddingBottom = 120

    @xMaxAxisRange = @extendRange(xRange,
                                          paddingRight,
                                          @width,
                                          @xAxis.isLogScale())
    @yMaxAxisRange = @extendRange(yRange,
                                          paddingBottom,
                                          @height,
                                          @yAxis.isLogScale())
    if (@rangeHistories.length == 0)
        @setCurrentAxisRange(xRange, yRange)

  extendRange: (range, lastPaddingPixel, lengthPixel, isLog) ->
    if (isLog)
      range.last = Math.exp(
        range.getLogLast() +
          (lastPaddingPixel *
            range.getLogDifference() / lengthPixel)
      )
    else
      range.last = range.last +
        (lastPaddingPixel *
          range.getDifference() / lengthPixel)
    range

  setCurrentAxisRange: (xRange, yRange) ->
    @xCurrentAxisRange = xRange
    @yCurrentAxisRange = yRange
    @xAxisScale.setRange(xRange)
    @yAxisScale.setRange(yRange)
    @adjustGraphItems()

