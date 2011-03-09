class XYGraphDetail
  constructor: (@graphItem) ->
    @isAlive = true
    @appendImage(@graphItem)

  appendImage: (graphItem) ->
    self = this
    offset = graphItem.image.offset()
    fullscale = graphItem.getFullscaleImageInfo()

    image = $("<img/>").attr({
      src: graphItem.thumb.url
    }).css({
      width:  '100%'
      height: '100%'
    }).mousemove((event) ->
      event.preventDefault()
    )

    @container = $('<div/>').css({
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
      'z-index': 6000 + 1
      'box-shadow': '3px 3px 10px rgba(0, 0, 0, 0.3)'
      '-moz-box-shadow': '3px 3px 10px rgba(0, 0, 0, 0.3)'
    }).append(image).appendTo(document.body)

    title = $(
      """
      <h2 style='margin: 0; padding: 5px 15px; font-size: 110%; background-color: #444'>
        <a href='#{graphItem.getItemPageUrl()}' target='_blank' style='color: #FFF;'>
          #{graphItem.getProductName()}
        </a>
      </h2>
      """
    )
    checkbox = $('<input type="checkbox" />').change( =>
      if checkbox.attr('checked')
        @graphItem.interest()
        @container.css('background-color': '#FFBF00')
      else
        @graphItem.uninterest()
        @container.css('background-color': '#FFF')
    )

    if localStorage.getItem(graphItem.getProductID())
      checkbox.attr('checked', true)

    checkLabel = $('<label style="cursor: pointer;" />').append(checkbox).append('興味あり')
    checkLabelContainer = $('<div style="float:right; margin: 5px 10px;" />').append(checkLabel)
    description = $(
      """
      <div>
        <ul>
          <li>#{graphItem.getLowestPrice()} 円</li>
          <li>満足度 #{(graphItem.getTotalScoreAve() || '?')}</li>
          <li>売れ筋ランキング： #{graphItem.getPvRanking()} 位</li>
          <li>発売日： #{(graphItem.getSaleDateString() || '不明')}</li>
        </ul>
        <p style='font-size: 90%; margin-left: 15px'>
          #{graphItem.getComment()}
          <br />
          <a href='#{graphItem.getReviewPageUrl()}' target='_blank'>レビュー</a>
          |
          <a href='#{graphItem.getBbsPageUrl()}' target='_blank'>クチコミ</a>
        </p>
      </div>
      """
    )

    @body = $('<div/>').css({
      position: "absolute"
      left: 0
      top:  0
      width: 300
      height: fullscale.height + 4
      border: '1px solid #444'
      color: '#444'
      'font-size': '90%'
      'background-color': '#EEE'
      'z-index': 6000
      'padding': '0px'
      overflow: 'auto'
    }).append(
      title
    ).append(
      checkLabelContainer
    ).append(
      description
    ).mousedown( (event) ->
      event.stopPropagation()
    ).hide().appendTo(document.body)

    # 表示位置計算
    # 画像の位置で拡大
    w = fullscale.width + @body.width() + 30
    h = fullscale.height + 10
    left = offset.left - (fullscale.width - graphItem.image.width())/2
    top = offset.top - (h - graphItem.image.height())/2
    right = left + w
    bottom = top + h
    rightMargin = $(window).width() - right ## 右にどれくらい空いているか
    tipWidth = @body.width()

    if (left < 0)
      # 左にはみ出していたら戻す
      left = 0
    else if (right > $(window).width())
      # 右にはみ出していたら戻す
      left = $(window).width() - w
    if (top < 0)
      # 上にはみ出していたら戻す
      top = 0
    else if (bottom > $(window).height())
      # 下にはみ出していたら戻す
      top = $(window).height() - h

    # 拡大
    @container.animate({
      left: left
      top: top
      width:  fullscale.width
      height: fullscale.height
    }, "fast", null, (=>
      # bodyの位置調整
      offset = @container.offset()
      @body.css({
        left: offset.left + @container.width()
        top:  offset.top
      }).fadeIn('fast')
      image.attr({
        src: fullscale.url
      })
    ))

  fadeoutAndRemove: () ->
    return if (!@isAlive)
    self = this
    @body.remove() if @body
    offset = @graphItem.image.offset()
    @container.animate({
      left: offset.left,
      top:  offset.top,
      width:  self.graphItem.image.width(),
      height: self.graphItem.image.height()
    }, "fast", null, =>
      @remove()
    )

  remove: () ->
    return if !@isAlive
    @body.remove() if @body
    @container.remove() if @container
    @isAlive = false
    @graphItem.highlightIfInterested()
