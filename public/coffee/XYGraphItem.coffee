class XYGraphItem
  constructor: (itemElem) ->
    @item = $(itemElem)
    @tipIsActive = true
    @initImage() ## @bubble @image @triangle @caption

  getAxisValue: (axisType) ->
    switch(axisType)
      when AxisType.SaleDate ## 発売日
        @getSaleDateTimeAgo()
      when AxisType.PvRanking ## 売れ筋
        @getPvRanking()
      when AxisType.TotalScoreAve ## 満足度
        @getTotalScoreAve()
      when AxisType.LowestPrice
        @getLowestPrice()
      when AxisType.NumOfBbs
        @getNumOfBbs()
      when AxisType.MonitorSize
        @getMonitorSize()
      when AxisType.HDDSize
        @getHDDSize()
      when AxisType.MemorySize
        @getMemorySize()
      when AxisType.Noise
        @getNoise()
      when AxisType.Weight
        @getWeight()
      else
        $.log "No such AxisType: " + axisType

  #
  # 各種値
  #
  getProductName: ->
    @item.find("ProductName").eq(0).text()

  getProductID: ->
    @item.find('ProductID').eq(0).text()

  getMakerName: ->
    @item.find('MakerName').eq(0).text()

  getSaleDateString: ->
    @item.find('SaleDate').eq(0).text()

  getSaleDate: ->
    m = @getSaleDateString().match(/(\d+)年(\d+)月(\d+)日/)
    if m
      new Date(parseInt(m[1]),
               parseInt(m[2]) - 1,
               parseInt(m[3]))
    else
      null

  getSaleDateTime: ->
    date = @getSaleDate()
    if date
      date.getTime()
    else
      null

  getSaleDateTimeAgo: ->
    dateTime = @getSaleDateTime()
    if dateTime
      (new Date()).getTime() - dateTime
    else
      null

  getComment: ->
    @item.find('Comment').eq(0).text()

  getMonitorSize: ->
    m = @getComment().match(/(画面|液晶|モニタ)サイズ：([\d\.]+)インチ/)
    if m
      parseFloat(m[2])
    else
      NaN

  getHDDSize: ->
    m = @getComment().match(/HDD容量：([\d\.]+)(TB|GB)/)
    if m
      if m[2] == 'TB'
        parseFloat(m[1]) * 1000
      else
        parseFloat(m[1])
    else
      NaN

  getMemorySize: ->
    m = @getComment().match(/メモリ容量：([\d\.]+)GB/)
    if m
      parseFloat(m[1])
    else
      NaN

  getNoise: ->
    m = @getComment().match(/騒音値：([\d\.]+)db/)
    if m
      parseFloat(m[1])
    else
      NaN

  getWeight: ->
    m = @getComment().match(/重さ：([\d\.]+)g/)
    if m
      parseFloat(m[1])
    else
      NaN

  getCategoryName: ->
    @item.find('CategoryName').eq(0).text()

  getSubCategoryName: ->
    ary = @getCategoryName().split('>')
    ary[ary.length - 1]

  getPvRanking: ->
    parseInt( @item.find('PvRanking').eq(0).text() )

  getPvRankingLog: ->
    Math.log(@getPvRanking())

  getTotalScoreAve: ->
    s = @item.find('TotalScoreAve').eq(0).text()
    parseFloat(s)

  getImageUrl: ->
    @item.find('ImageUrl').eq(0).text()

  getItemPageUrl: ->
    @item.find("ItemPageUrl").eq(0).text()

  getBbsPageUrl: ->
    @item.find('BbsPageUrl').eq(0).text()

  getReviewPageUrl: ->
    @item.find('ReviewPageUrl').eq(0).text()

  getLowestPrice: ->
    parseInt( @item.find('LowestPrice').eq(0).text() )

  getNumOfBbs: ->
    parseInt( @item.find('NumOfBbs').eq(0).text() )

  getMediumImageInfo: ->
    ImageInfo.medium(@item)

  getLargeImageInfo: ->
    ImageInfo.large(@item)

  getFullscaleImageInfo: ->
    ImageInfo.fullscale(@item)

  getImageScale: ->
    score = @getTotalScoreAve()
    scale = (if score
      (score*score) / (5*5)
    else
      (3*3) / (5*5)
    )
    min = 0.2
    if scale > min then scale else min

  #
  # 画像
  #
  initImage: ->
    self = this
    @thumb = if ($(window).width() > 1800) then @getLargeImageInfo() else @getMediumImageInfo()
    w = Math.round(@thumb.width  * @getImageScale())
    h = Math.round(@thumb.height * @getImageScale())
    borderColor = '#BBB'

    @bubble = $('<div/>').css({
      position: 'absolute',
      left: 0,
      top: 0,
      'z-index': self.getBubbleZIndex()
      'line-height': 0
    })

    @image = $('<img/>').attr({
      src: self.thumb.url
    }).css({
      width: w
      height: h
      border: '1px solid ' + borderColor
      padding: 3
      cursor: 'pointer'
      'border-radius': 4
      '-moz-border-radius': 4
      'background-color': '#FFF'
      'box-shadow': '3px 3px 6px rgba(0, 0, 0, 0.4)'
      '-moz-box-shadow': '3px 3px 6px rgba(0, 0, 0, 0.4)'
    }).mouseover( =>
      @onMouseover()
    ).mouseout( =>
      @onMouseout()
    ).mousedown( (event) =>
      @onMousedown(event)
    ).mousemove( (event) =>
      event.preventDefault()
    ).appendTo(@bubble)

    @highlightIfInterested()

    ## 吹出し
    @triangle = $('<div/>').css({
      width: 0
      height: 0
      'margin-left': 10
      'border-top':   '8px solid #666'
      'border-left':  '5px solid transparent'
      'border-right': '5px solid transparent'
    }).appendTo(@bubble)

    ## テキスト
    @caption = $("<div/>").text(
      @getProductName()
    ).css({
      position: 'absolute',
      left: 0,
      top: 0,
      'z-index': self.getCaptionZIndex()
      padding: '2px 6px 6px 12px'
      width: 130
      color: '#666'
      'border-top': '1px solid ' + borderColor
      'background-color': '#FFF'
      'font-size': '80%'
      'line-height': '1em'
    })

  interest: ->
    if window.localStorage
      localStorage.setItem(@getProductID(), '1')

  uninterest: ->
    if window.localStorage
      localStorage.removeItem(@getProductID())

  isInterested: ->
    if window.localStorage
      localStorage.getItem(@getProductID())
    else
      null

  highlightIfInterested: ->
    @image.css({
      'background-color': if @isInterested() then '#FFBF00' else '#FFF'
    })
    @bubble.css({
      'z-index': @getBubbleZIndex()
    })

  onMouseover: ->
    @highlight()

  onMouseout: ->
    @offlight()

  onMousedown: (event) ->
    event.stopPropagation()
    delete @detail if (@detail)
    @detail = new XYGraphDetail(this)

  getTextColor: ->
    scale = Math.floor(0xFF * (1 - @getImageScale()))
    color = (scale << 16) | (scale << 8) | scale
    '#' + color.toString(16)

  highlight: ->
    @bubble.css({
      'z-index': 5000 + 1
    })
    @caption.css({
      'z-index': 5000
      'background-color': "#FFBF00"
      'font-weight': 'bold'
      color: '#444'
      'border-top': '1px solid #444'
    })
    @image.css({
      border: '1px solid #444'
    })

  offlight: ->
    self = this
    @bubble.css({
      "z-index": self.getBubbleZIndex()
    })
    @caption.css({
      'z-index': self.getCaptionZIndex()
      'background-color': '#FFF'
      'font-weight': 'normal'
      color: '#666'
      'border-top': '1px solid #BBB'
    })
    @image.css({
      border: '1px solid #BBB'
    })

  #
  # Tip
  #
  # activateTip: ->
  #   @tipIsActive = true
  #   @image.css({
  #       cursor: "pointer"
  #   })

  # inactivateTip: ->
  #   @tipIsActive = false
  #   @image.css({
  #       cursor: "crosshair"
  #   })

  isDetailShowing: ->
    return false if (!@detail)
    @detail.isAlive

  removeDetail: ->
    @detail.fadeoutAndRemove() if @detail

  # isTipRight: ->
  #   (@bubble.offset().left < 400)

  # createTip: -> # Summary tip while mouseover
  #   self = this
  #   summaryHtml = ([
  #     @getLowestPrice() + "円",
  #     "満足度" + @getTotalScoreAve()
  #   ]).join("<br />")
  #   isRight = @isTipRight()
  #   @image.qtip({
  #       content: {
  #           title: self.getProductName(),
  #           text: summaryHtml
  #       },
  #       style: {
  #           name: "dark",
  #           tip: {
  #               corner: if isRight then "leftTop" else "rightTop"
  #           },
  #           border: {
  #               radius: 3
  #           }
  #       },
  #       position: {
  #           corner: {
  #               target: if isRight then "rightTop" else "leftTop",
  #               tooltip: if isRight then "leftTop" else "rightTop"
  #           },
  #           adjust: {
  #               y: 10
  #           }
  #       },
  #       show: {
  #           ready: true,
  #           delay: 0
  #       },
  #       api: {
  #           beforeShow: (-> self.tipIsActive)
  #       }
  #   })

  getBubbleZIndex: ->
    if @isInterested()
      @getCaptionZIndex() + 2000
    else
      @getCaptionZIndex() + 1000

  getCaptionZIndex: ->
    return 0 if !@getPvRankingLog()
    Math.round(
        1000 * @getImageScale()
            + 100 * (15 - @getPvRankingLog())/15
    )

  render: (container) ->
    $(container).append(@bubble)
    $(container).append(@caption)

  show: ->
    @bubble.show()
    @caption.show()

  hide: ->
    @bubble.hide()
    @caption.hide()

  moveTo: (x, y) ->
    self = this
    @bubble.css({
      left: self.getBubbleLeft(x),
      top:  self.getBubbleTop(y)
    })
    @caption.css({
      left: self.getCaptionLeft(x)
      top:  self.getCaptionTop(y)
    })

  animateMoveTo: (x, y) ->
    self = this
    @bubble.stop()
    @bubble.animate({
      left: self.getBubbleLeft(x)
      top:  self.getBubbleTop(y)
    }, {
      duration: "fast"
    })
    @caption.stop()
    @caption.animate({
      left: self.getCaptionLeft(x)
      top:  self.getCaptionTop(y)
    }, {
      duration: "fast"
    })

  getBubbleLeft: (x) ->
    x - (10 + 5)

  getBubbleTop: (y) ->
    y - @bubble.height()

  getCaptionLeft: (x) ->
    @getBubbleLeft(x) + @bubble.width() - 6

  getCaptionTop: (y) ->
    @getBubbleTop(y)
