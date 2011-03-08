class XYGraphDetail
  constructor: (@graphItem) ->
    @isAlive = true
    @image = @appendImage(graphItem)

  appendImage: (graphItem) ->
    self = this
    offset = graphItem.image.offset()
    thumb = graphItem.thumb
    image = $("<img/>").attr({
      src: thumb.url
    }).css({
      position: "absolute"
      left: offset.left
      top:  offset.top
      width:  graphItem.image.width()
      height: graphItem.image.height()
      padding: graphItem.image.css('padding')
      border: graphItem.image.css("border")
      'border-radius': 4
      '-moz-border-radius': 4
      'background-color': graphItem.image.css('background-color')
      'z-index': 6000
      'box-shadow': '3px 3px 10px rgba(0, 0, 0, 0.3)'
      '-moz-box-shadow': '3px 3px 10px rgba(0, 0, 0, 0.3)'
    }).mousemove((event) ->
      event.preventDefault()
    ).appendTo('body')

    # animate
    medium = graphItem.getFullscaleImageInfo()
    viewportSize = {
      width:  $(window).width()
      height: $(window).height()
    }

    left = offset.left - (medium.width - graphItem.image.width())/2
    top = offset.top - (medium.height - graphItem.image.height())/2
    right = left + medium.width
    bottom = top + medium.height
    rightMargin = viewportSize.width - (left + medium.width)
    tipWidth = 300 + 50

    if (left < tipWidth && rightMargin < tipWidth)
        # 左右両端に吹き出し用スペースがない
        if (left < rightMargin)
            # 左に寄せる
            left = viewportSize.width - tipWidth - medium.width
        else
            left = tipWidth # 右に寄せる
    if (left < 0)
        left = 0
    else if (right > viewportSize.width)
        # 右にはみ出してるかも
        left = viewportSize.width - medium.width

    if (top < 0)
        top = 0
    else if (bottom > viewportSize.height)
        # 下にはみ出してるかも
        top = viewportSize.height - medium.height

    image.animate({
        left: left,
        top: top,
        width:  medium.width,
        height: medium.height
    }, "fast", null, ->
        self.tip = self.appendTip(graphItem)
        image.attr({
            src: medium.url
        })
    )
    return image

  isTipRight: () ->
    (@image.offset().left < 330)

  appendTip: (graphItem) -> # Detail Tip
    self = this
    summaryHtml = ([
        graphItem.getLowestPrice() + "円"
        "満足度：" + (graphItem.getTotalScoreAve() || '?')
        "売れ筋ランキング：" + graphItem.getPvRanking() + "位"
        "発売日：" + (graphItem.getSaleDateString() || '?')
        graphItem.getComment()
    ]).join("<br />")

    isRight = @isTipRight()
    tip = @image.qtip({
        content: {
            title: '<a href="' +
                    graphItem.getItemPageUrl() +
                    '" target="_blank" style="color:#FFFFFF">' +
                    graphItem.getProductName() +
                    '</a>',
            text: summaryHtml
        },
        style: {
            name: "dark",
            tip: {
                corner: if isRight then "leftTop" else "rightTop"
            },
            border: {
                radius: 3
            },
            width: {
                max: 300
            },
            title: {
                "font-size": "110%"
            },
            button: {
                "font-size": "100%"
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
        hide: {
            delay: 1000,
            fixed: true
        },
        api: {
            onHide: ->
                self.image.css({
                    "border-color": "#DDDDDD"
                })
                offset = graphItem.image.offset()
                self.image.animate({
                    left: offset.left,
                    top: offset.top,
                    width:  graphItem.image.width(),
                    height: graphItem.image.height()
                }, "fast", null, ->
                    self.fadeoutAndRemove()
                )
        }
    }).qtip("show")

    tip.qtip("api").elements.tooltip.selectable()
    tip.qtip("api").elements.tooltip.mousedown((event) ->
        event.stopPropagation()
    )

    return tip

  fadeoutAndRemove: () ->
    return if (!@isAlive)
    self = this
    @tip.qtip("destroy") if @tip
    @image.css({
        "background-color": "#DDDDDD"
    })
    offset = @graphItem.image.offset()
    @image.animate({
        left: offset.left,
        top:  offset.top,
        width:  self.graphItem.image.width(),
        height: self.graphItem.image.height()
    }, "fast", null, ->
        self.remove()
    )

  remove: () ->
    return if !@isAlive
    @tip.qtip("destroy") if @tip
    @image.remove() if (@image)
    @isAlive = false
