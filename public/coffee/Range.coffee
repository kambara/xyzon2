class Range
  constructor: (@first, @last) ->

  getDifference: ->
    @last - @first

  getLogFirst: ->
    Math.log(@first)

  getLogLast: ->
    Math.log(@last)

  getLogDifference: ->
    @getLogLast() - @getLogFirst()

  toString: ->
    @first + " " + @last
