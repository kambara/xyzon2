ScaleMode = {
    HORIZONTAL: 1
    VERTICAL:   2
}

# Abstract Class
class AxisScale
  constructor: (thick, scaleMode, unit) ->
    @markColor = "#333"
    @thickness = thick
    @length = 1
    @scaleMode = scaleMode || ScaleMode.HORIZONTAL
    @unit = unit || ""
    @textClassName = "_canvas_text_"

    # Init Container
    @innerContainer = $('<div/>').css({
      position: 'absolute',
      'z-index': 100,
      'background-color': '#FF7F00'
    })
    $(document.body).append(@innerContainer)

    # Init Canvas
    @canvas = $('<canvas/>').css({
      width: 10,
      height: 10
    }).get(0)
    @innerContainer.append(@canvas)
    @ctx = @getContext(@canvas)

  remove: ->
    if (@innerContainer)
      $(@canvas).remove()
      $(@ctx).remove()
      $(@innerContainer).remove()

  getWidth: ->
    if (@scaleMode == ScaleMode.HORIZONTAL)
      @length
    else
      @thickness

  getHeight: ->
    if (@scaleMode == ScaleMode.HORIZONTAL)
      @thickness
    else
      @length

  setLength: (value) ->
    @length = value
    $(@innerContainer).width(@getWidth()).height(@getHeight())
    $(@canvas).attr({
      width: @getWidth(),
      height: @getHeight()
    })
    @update_()

  setPosition: (x, y) ->
    @innerContainer.css({
      left: x
      top:  y
    })

  isHorizontal: ->
    return (@scaleMode == ScaleMode.HORIZONTAL)

  hv: (hValue, vValue) ->
    if @isHorizontal()
      hValue
    else
      vValue

  getScaleLength: ->
    return @hv(
        @getWidth(),
        @getHeight())

  getContext: (canvasElem) ->
    if (typeof(G_vmlCanvasManager) != 'undefined') # IE
        canvasElem = G_vmlCanvasManager.initElement(canvasElem)
    return canvasElem.getContext('2d')

  appendText: (text, pos, offset) ->
    return if (pos < 0)
    return if (pos > @getScaleLength())

    $('<span/>').addClass(@textClassName).css({
      position: "absolute"
      'font-size': 13
      color: '#333'
      left: @hv(pos, offset)
      top:  @hv(offset, pos)
    }).text(
      text + @unit
    ).appendTo(@innerContainer)

  removeAllTexts: ->
    $(@innerContainer).find(
        "span." + @textClassName
    ).remove()

  setRange: (range) ->
    @range = range
    @update_()

  update_: ->
    return if (!@range)
    @ctx.clearRect(0, 0, @getWidth(), @getHeight())
    @removeAllTexts()
    labeledNumberTable = {}

    num100000Marks = @drawMarks(@range,
                                        100000,
                                        5,
                                        18,
                                        true,
                                        labeledNumberTable)
    if (num100000Marks <= 4)
        num10000Marks = @drawMarks(@range,
                                           10000,
                                           3,
                                           14,
                                           (num100000Marks <= 1),
                                           labeledNumberTable)
        if (num10000Marks <= 4)
            num1000Marks = @drawMarks(@range,
                                              1000,
                                              1,
                                              8,
                                              (num10000Marks <= 1),
                                              labeledNumberTable)
            if (num1000Marks <= 4)
                num100Marks = @drawMarks(@range,
                                                 100,
                                                 1,
                                                 8,
                                                 (num1000Marks <= 1),
                                                 labeledNumberTable)
                if (num100Marks <= 4)
                    @drawMarks(@range,
                                   10,
                                   1,
                                   8,
                                   (num100Marks <= 1),
                                   labeledNumberTable)

  drawMarks: (range, unit, lineWidth, lineLength, labelIsShown, labeledNumberTable) ->
    if (range.getDifference() < 1)
        return 0
    interval = unit * @getScaleLength() / range.getDifference()
    rightScaleValue = Math.floor(range.last / unit) * unit
    rightOffset = interval * (range.last - rightScaleValue) / unit
    count = 0
    while (true)
        if (count > 100)
            $.log('Too many!')
            break
        pos = @getScaleLength() - rightOffset - interval * count
        break if (pos < 0)

        @drawMark(pos, lineWidth, lineLength)
        #if (labelIsShown) {# TODO: 判定を距離に変える
        if (interval > 40)
            value = rightScaleValue - unit * count
            if (!labeledNumberTable[value])
                @appendText(value.toString(),
                                pos - 3,
                                lineLength)
                labeledNumberTable[value] = true
        count++
    return count

  drawMark: (pos, lineWidth, lineLength) ->
    if (@scaleMode == ScaleMode.HORIZONTAL)
        @drawLine(
            pos, 0,
            pos, lineLength,
            lineWidth,
            lineLength)
    else
        @drawLine(
            0, pos,
            lineLength, pos,
            lineWidth,
            lineLength)

  drawLine: (x1, y1, x2, y2, lineWidth, lineLength) ->
    @ctx.strokeStyle = "#333"
    @ctx.lineWidth = lineWidth
    @ctx.beginPath()
    @ctx.moveTo(x1, y1)
    @ctx.lineTo(x2, y2)
    @ctx.stroke()
