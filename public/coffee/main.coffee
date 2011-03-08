$ ->
  xyGraphArea = new XYGraphArea()
  initCategorySelection()
  initAxisMenu(xyGraphArea)

# カテゴリメニューを切り替えると再検索
initCategorySelection = ->
  $("form.search").each (i, formElem) ->
    $(formElem).find("select[name='category']").change (event) ->
      $(formElem).submit()

initAxisMenu = (xyGraphArea) ->
  xMenuItems = [
    ['値段', AxisType.LowestPrice]
    ['売れ筋', AxisType.PvRanking]
    ['発売日', AxisType.SaleDate]
    ['クチコミ数', AxisType.NumOfBbs]
    ['満足度', AxisType.TotalScoreAve]
    ['モニタサイズ', AxisType.MonitorSize]
    ['HDD容量', AxisType.HDDSize]
    ['メモリ容量', AxisType.MemorySize]
    ['騒音値', AxisType.Noise]
    ['重さ', AxisType.Weight]
  ]
  yMenuItems = [
    ['売れ筋', AxisType.PvRanking]
    ['値段', AxisType.LowestPrice]
    ['発売日', AxisType.SaleDate]
    ['クチコミ数', AxisType.NumOfBbs]
    ['満足度', AxisType.TotalScoreAve]
    ['モニタサイズ', AxisType.MonitorSize]
    ['HDD容量', AxisType.HDDSize]
    ['メモリ容量', AxisType.MemorySize]
    ['騒音値', AxisType.Noise]
    ['重さ', AxisType.Weight]
  ]
  for item in xMenuItems
    $('#x-axis-menu').append(
      $('<option/>').text(item[0]).val(item[1]))
  for item in yMenuItems
    $('#y-axis-menu').append(
      $('<option/>').text(item[0]).val(item[1]))
  $('#x-axis-menu').change ->
    value = $(this).val()
    xyGraphArea.switchXAxis value
  $('#y-axis-menu').change ->
    value = $(this).val()
    xyGraphArea.switchYAxis value

#
# Extend jQuery
#
jQuery.fn.extend {
  integer: () -> parseInt(this.text())

  number: () -> parseFloat(this.text())

  unselectable: () ->
    this.each ->
      $(this).attr({
        unselectable: "on" # IE
      }).css({
        "-moz-user-select":    "none"
        "-khtml-user-select":  "none"
        "-webkit-user-select": "none"
        "user-select": "none" # CSS3
      })

  selectable: () ->
    this.each ->
      $(this).attr({
        unselectable: "off" # IE
      }).css({
        "-moz-user-select": "auto"
        "-khtml-user-select": "auto"
        "-webkit-user-select": "auto"
        "user-select": "auto" # CSS3
      })
}


jQuery.log = (obj) ->
  if window.console
    console.log(obj)

jQuery.any = (array, callback) ->
  for i in [0...array.length]
    if callback.call(this, i, array[i])
      return true
  false

jQuery.min = (a, b) ->
  if a < b then a else b
