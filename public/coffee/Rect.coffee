class Rect
  constructor: (@x, @y, @width, @height) ->
  getLeft: () -> @x
  getTop: () -> @y
  getRight: () -> @x + @width
  getBottom: () -> @y + @height
