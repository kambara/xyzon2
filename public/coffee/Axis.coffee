AxisType = {
  SaleDate:      'SaleDate'
  PvRanking:     'PvRanking'
  TotalScoreAve: 'TotalScoreAve' # 満足度
  LowestPrice:   'LowestPrice'
  NumOfBbs:      'NumOfBbs'
}

class Axis
  constructor: (@axisType) ->

  getUnit:() ->
    switch (@axisType.toString())
      when AxisType.SaleDate
        '日前'
      when AxisType.PvRanking
        '位'
      when AxisType.TotalScoreAve
        ''
      when AxisType.LowestPrice
        '円'
      when AxisType.NumOfBbs
        '件'
      else ''

  getLabel: ->
    switch (@axisType)
      when AxisType.SaleDate
        '古い'
      when AxisType.PvRanking
        '高い'
      when AxisType.TotalScoreAve
        '低い'
      when AxisType.LowestPrice
        '安い'
      when AxisType.NumOfBbs
        '少ない'
      else ''

  isLogScale: () ->
    return (@axisType.toString() == AxisType.PvRanking)

  getScale: (scaleMode) ->
    thick = if (scaleMode == ScaleMode.HORIZONTAL) then 34 else 100
    if @isLogScale()
      new LogAxisScale(thick, scaleMode, @getUnit())
    else
      new AxisScale(thick, scaleMode, @getUnit())
