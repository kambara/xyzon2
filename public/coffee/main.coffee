$ ->
  xyGraphArea = new XYGraphArea()
  new KakakuSearch(xyGraphArea)
  initCategorySelection()
  initAxisMenu(xyGraphArea)

# カテゴリメニューを切り替えると再検索
initCategorySelection = ->
  $("form.search").each (i, formElem) ->
    $(formElem).find("select[name='category']").change (event) ->
      $(formElem).submit()

initAxisMenu = (xyGraphArea) ->
  $('#x-axis-menu').change ->
    value = $(this).val()
    $.log value
    xyGraphArea.switchXAxis value
  $('#y-axis-menu').change ->
    value = $(this).val()
    $.log value
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
