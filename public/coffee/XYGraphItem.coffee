class XYGraphItem
  constructor: (itemElem) ->
    @item = $(itemElem)
    @tipIsActive = true
    @initImage() ## @bubble @image @triangle @caption

  getAxisValue: (axisType) ->
    switch(axisType)
      when AxisType.SaleDate
        @getSaleDateTime()
      when AxisType.PvRanking
        @getPvRanking()
      when AxisType.TotalScoreAve
        @getTotalScoreAve()
      when AxisType.LowestPrice
        @getLowestPrice()
      when AxisType.NumOfBbs
        @getNumOfBbs()
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

  getComment: ->
    @item.find('Comment').eq(0).text()

  getCategoryName: ->
    @item.find('CategoryName').eq(0).text()

  getPvRanking: ->
    @parseIntOrNull( @item.find('PvRanking').eq(0).text() )

  getPvRankingLog: ->
    Math.log(@getPvRanking())

  getTotalScoreAve: ->
    s = @item.find('TotalScoreAve').eq(0).text()
    return null if !s
    f = parseFloat(s)
    return null if isNaN(f)
    f

  getImageUrl: ->
    @item.find('ImageUrl').eq(0).text()

  getItemPageUrl: ->
    @item.find("ItemPageUrl").eq(0).text()

  getBbsPageUrl: ->
    @item.find('BbsPageUrl').eq(0).text()

  getReviewPageUrl: ->
    @item.find('ReviewPageUrl').eq(0).text()

  getLowestPrice: ->
    @parseIntOrNull( @item.find('LowestPrice').eq(0).text() )

  getNumOfBbs: ->
    @parseIntOrNull( @item.find('NumOfBbs').eq(0).text() )

  parseIntOrNull: (str) ->
    return null if !str
    i = parseInt(str)
    return null if isNaN(i)
    i

  getMediumImageInfo: ->
    ImageInfo.medium(@item)

  getLargeImageInfo: ->
    ImageInfo.large(@item)

  getFullscaleImageInfo: ->
    ImageInfo.fullscale(@item)

  getImageScale: ->
    score = @getTotalScoreAve()
    if score
      (score*score) / (5*5)
    else
      (2.5*2.5) / (5*5)

  getReviewComments: ->
    comments = []
    @item.find("CustomerReviews > Review").each((index, elem) ->
        comments.push({
            summary: $(elem).find("Summary").text(),
            content: $(elem).find("Content").text(),
            rating:  $(elem).find("Rating").number()
        })
    )
    comments

  #
  # 画像
  #
  initImage: ->
    self = this
    thumb = @getMediumImageInfo()
    w = Math.round(thumb.width  * @getImageScale())
    h = Math.round(thumb.height * @getImageScale())
    z = @getZIndex()
    borderColor = '#666'

    @bubble = $('<div/>').css({
      position: 'absolute',
      left: 0,
      top: 0,
      'z-index': z
      'line-height': 0
    })

    @image = $('<img/>').attr({
      src: thumb.url
    }).css({
      width: w
      height: h
      border: '1px solid ' + borderColor
      padding: 2
      'border-radius': 5
      'background-color': '#FFF'
      cursor: 'pointer'
    }).mouseover( =>
      @onMouseover()
    ).mouseout( =>
      @onMouseout()
    ).mousedown( (event) =>
      @onMousedown(event)
    ).mousemove( (event) =>
      event.preventDefault()
    ).appendTo(@bubble)

    ## 吹出し
    @triangle = $('<div/>').css({
      width: 0
      height: 0
      'margin-left': 10
      'border-top':   '8px solid ' + borderColor
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
      'z-index': 0
      padding: '3px 8px'
      width: 130
      color: self.getTextColor()
      'border': '2px solid #FFF'
      'border-radius': 6
      'background-color': '#EEE'
      'font-size': '80%'
      'line-height': '1em'
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
      'z-index': 2000
    })
    @caption.css({
      'z-index': 2000
      'background-color': "#FF9933"
    })

  offlight: ->
    self = this
    @bubble.css({
      "z-index": self.getZIndex()
    })
    @caption.css({
      'z-index': 0
      'background-color': '#EEE'
    })

  #
  # Tip
  #
  activateTip: ->
    @tipIsActive = true
    @image.css({
        cursor: "pointer"
    })

  inactivateTip: ->
    @tipIsActive = false
    @image.css({
        cursor: "crosshair"
    })

  isDetailShowing: ->
    return false if (!@detail)
    @detail.isAlive

  removeDetail: ->
    @detail.fadeoutAndRemove() if @detail

  isTipRight: ->
    (@bubble.offset().left < 400)

  createTip: -> # Summary tip while mouseover
    self = this
    summaryHtml = ([
      @getLowestPrice() + "円",
      "満足度" + @getTotalScoreAve()
    ]).join("<br />")
    isRight = @isTipRight()
    @image.qtip({
        content: {
            title: self.getProductName(),
            text: summaryHtml
        },
        style: {
            name: "dark",
            tip: {
                corner: if isRight then "leftTop" else "rightTop"
            },
            border: {
                radius: 3
            }
        },
        position: {
            corner: {
                target: if isRight then "rightTop" else "leftTop",
                tooltip: if isRight then "leftTop" else "rightTop"
            },
            adjust: {
                y: 10
            }
        },
        show: {
            ready: true,
            delay: 0
        },
        api: {
            beforeShow: (-> self.tipIsActive)
        }
    })

  getZIndex: ->
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

  hide: ->
    @bubble.hide()

  moveTo: (x, y) ->
    self = this
    @bubble.css({
      left: self.getBubbleLeft(x),
      top:  self.getBubbleTop(y)
    })
    @moveCaptionTo(x, y)

  moveCaptionTo: (x, y) ->
    self = this
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
      duration: "fast",
      complete: =>
        @moveCaptionTo(x, y)
    })

  getBubbleLeft: (x) ->
    ## triangle の margin-left + width/2
    x - (10 + 5)

  getBubbleTop: (y) ->
    y - @bubble.height()

  getCaptionLeft: (x) ->
    x - (10 + 5)

  getCaptionTop: (y) ->
    y