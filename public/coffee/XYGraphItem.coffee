class XYGraphItem
  constructor: (itemElem) ->
    @item = $(itemElem)
    @tipIsActive = true
    @image = @createImage()

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
      score / 5
    else
      2.5 / 5

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

  createImage: ->
    self = this
    thumb = @getLargeImageInfo()
    w = Math.round(thumb.width  * self.getImageScale())
    h = Math.round(thumb.height * self.getImageScale())

    container = $('<div/>').css({
      position: 'absolute',
      left: 0,
      top: 0,

      'z-index': self.getZIndex()
      width: 100
      'line-height': 0
#        height: h
#        width: '100px'
#        overflow: 'hidden'
    })

    @img = $('<img/>').attr({
      src: thumb.url
    }).css({
      width: w
      height: h
      border: '1px solid #777'
      padding: 2
      'border-radius': 5
      'background-color': '#FFF'
      cursor: 'pointer'
    }).appendTo(container)

    @img.mouseover( ->
      self.onMouseover()
    ).mouseout( ->
      self.onMouseout()
    ).mousedown( (event) ->
      self.onMousedown(event)
    ).mousemove( (event) ->
      event.preventDefault()
    )

    $('<div/>').css({
      width: 0
      height: 0
      'margin-left': 10
      'border-top':   '8px solid #777'
      'border-left':  '5px solid transparent'
      'border-right': '5px solid transparent'
    }).appendTo(container)

    @title = $("<div/>").text(
      @getProductName()
    ).css({
      padding: '3px 6px'
      width: 130
      color: self.getTextColor()
      'font-size': '80%'
      'line-height': '1em'
    }).appendTo(container)

    container

  getTextColor: ->
    scale = Math.floor(0xFF * (1 - @getImageScale()))
    color = (scale << 16) | (scale << 8) | scale
    '#' + color.toString(16)

  highlight: ->
    @image.css({
        "z-index": 2000
    })
    @title.css({
        "background-color": "#FF9933"
    })

  offlight: ->
    self = this
    @image.css({
        "z-index": self.getZIndex()
    })
    @title.css({
        "background-color": 'transparent'
    })

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
    (@image.offset().left < 400)

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

#  appendTo: (container) -> # obsolete
#    container.append(@image)

  render: (container) ->
    $(container).append(@image)

  show: ->
    @image.show()

  hide: ->
    @image.hide()

  moveTo: (x, y) ->
    @image.css({
        left: x,
        top: y
    })

  animateMoveTo: (x, y) ->
    @_x = x
    @_y = y
    self = this
    @image.stop()
    @image.animate({
      left: x
      top: y
    }, {
      duration: "fast",
      complete: ->
        ##self.moveRandom()
    })

  moveRandom: ->
    self = this
    setTimeout(
      (-> self.moveRandomLeft()),
      1000 + Math.random() * 5000)

  moveRandomLeft: ->
    self = this
    @image.animate({
        left: @_x - self.image.width() * Math.random(),
        top: @_y - self.image.height() * Math.random()
    }, {
        duration: "slow",
        complete: ->
            setTimeout(
              (-> self.moveRandomRight()),
              1000 + Math.random() * 4000)
    })

  moveRandomRight: ->
    self = this
    @image.animate({
        left: @_x,
        top: @_y
    }, {
        duration: "slow",
        complete: ->
            setTimeout(
              (-> self.moveRandomLeft()),
              1000 + Math.random() * 4000)
    })

  onMouseover: ->
    @highlight()

  onMouseout: ->
    @offlight()

  onMousedown: (event) ->
    event.stopPropagation()
    if (@detail)
        delete @detail
    @detail = new XYGraphDetail(this)
