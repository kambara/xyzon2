class Point
  constructor: (@x, @y) ->

  subtract: (p) ->
    new Point(@x - p.x, @y - p.y)
