class LogAxisScale extends AxisScale
  constructor: (thick, scaleMode, unit, @paddingHead=0, @paddingFoot=0) ->
    super(thick, scaleMode, unit, @paddingHead, @paddingFoot)

  getLogPos: (value, range) ->
    @paddingHead +
      (Math.log(value) - range.getLogFirst()) *
      @getScaleBodyLength() / range.getLogDifference()

  update_: ->
    return if (!@range)
    # 消去
    @ctx.clearRect(0, 0, @getWidth(), @getHeight())
    @removeAllTexts()

    prevPos = 0
    for i in [0..6] # 1000000まで
        value = Math.pow(10, i)
        pos = @getLogPos(value, @range)
        return if (pos > @getScaleLength())
        return if (pos < -1000)

        @drawMark(pos, 3, 14)
        @appendText(value.toString(),
                        pos - 10,
                        14 + 3)
        prevPos = pos

        for j in [2..9] # ラベル用
            value2 = value * j
            pos2 = @getLogPos(value2, @range)
            return if (pos2 > @getScaleLength())
            break if (pos2 - prevPos < 5)
            @drawMark(pos2, 1, 8)
            if (pos2 - prevPos > 15)
                @appendText(value2.toString(),
                                pos2 - 10,
                                8 + 3)
            prevPos = pos2
