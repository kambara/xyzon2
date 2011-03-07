class Selector
  constructor: ->
    @frame = @createFrame()
    $(document.body).append(@frame)

  setLimitRect: (left, top, width, height) ->
    @limitLeft = left
    @limitTop = top
    @limitRight = left + width
    @limitBottom = top + height

  show: ->
    @frame.show()

  hide: ->
    @frame.hide()

  createFrame: ->
    opacity = 0.3
    $('<div/>').css({
      position: "absolute",
      left: 0,
      top: 0,
      border: "1px solid #3333FF",
      'background-color': "#CCCCFF",
      filter: "alpha(opacity=" + (opacity*100) + ")", #IE
      '-moz-opacity': opacity, #FF
      opacity: opacity, # CSS3
      cursor: "crosshair",
      'z-index': 10000
    }).unselectable().mousemove (event) =>
      event.preventDefault()

  start: (x, y) ->
    @startX = x
    @startY = y
    @frame.css {
      left: x
      top: y
      width: 0
      height: 0
    }

  resizeTo: (x, y) ->
    x = @limitLeft if (x < @limitLeft)
    x = @limitRight if (x > @limitRight)
    y = @limitTop if (y < @limitTop)
    y = @limitBottom if (y > @limitBottom)
    newX = @startX
    newY = @startY
    newWidth = x - @startX
    newHeight = y - @startY
    if (newWidth < 0)
        newX = x
        newWidth = Math.abs(newWidth)
    if (newHeight < 0)
        newY = y
        newHeight = Math.abs(newHeight)
    @frame.css {
      left: newX
      top: newY
      width: newWidth
      height: newHeight
    }

  getPageRect: ->
    offset = @frame.offset()
    return new Rect(
        offset.left,
        offset.top,
        @frame.width(),
        @frame.height()
    )

  getRelativeRect: ->
    offset = @frame.offset()
    new Rect(
        offset.left - @limitLeft,
        offset.top - @limitTop,
        @frame.width(),
        @frame.height()
    )

