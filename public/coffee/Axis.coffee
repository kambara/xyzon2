AxisType = {
  SaleDate:      'SaleDate'
  PvRanking:     'PvRanking'
  TotalScoreAve: 'TotalScoreAve' # 満足度
  LowestPrice:   'LowestPrice'
  NumOfBbs:      'NumOfBbs'

  MonitorSize:   'MonitorSize'
  HDDSize:       'HDDSize'
  MemorySize:    'MemorySize'
  Noise:         'Noise'
  Weight:        'Weight'
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
      when AxisType.MonitorSize
        'インチ'
      when AxisType.HDDSize
        'GB'
      when AxisType.MemorySize
        'GB'
      when AxisType.Noise
        'db'
      when AxisType.Weight
        'g'
      else ''

  getLabel: ->
    switch (@axisType)
      when AxisType.SaleDate
        '新しい'
      when AxisType.PvRanking
        '高い'
      when AxisType.TotalScoreAve
        '低い'
      when AxisType.LowestPrice
        '安い'
      when AxisType.NumOfBbs
        '少ない'
      when AxisType.MonitorSize
        '小さい'
      when AxisType.HDDSize
        '少ない'
      when AxisType.MemorySize
        '少ない'
      when AxisType.Noise
        '静か'
      when AxisType.Weight
        '軽い'
      else ''

  isLogScale: () ->
    return (@axisType.toString() == AxisType.PvRanking)

  createScale: (scaleMode, paddingHead=0, paddingFoot=0, desc=false) ->
    thick = if (scaleMode == ScaleMode.HORIZONTAL) then 50 else 100
    if @isLogScale()
      new LogAxisScale(thick, scaleMode, @getUnit(), paddingHead, paddingFoot)
    else
      new AxisScale(thick, scaleMode, @getUnit(), paddingHead, paddingFoot)
