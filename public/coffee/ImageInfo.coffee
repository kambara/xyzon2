class ImageInfo
  constructor: (@url, @width, @height) ->
    if !@url
      @url    = "/img/noimage.jpg"
      @width  = 64
      @height = 42

  @medium: (item) ->
    url = ImageInfo.getUrlFrom(item)
    new ImageInfo(url, 80, 60)

  @large: (item) ->
    url = ImageInfo.getUrlFrom(item)
    url = url.replace(/\/m\//, '/l/') if url
    new ImageInfo(url, 160, 120)

  @fullscale: (item) ->
    url = ImageInfo.getUrlFrom(item)
    url = url.replace(/\/m\//, '/fullscale/') if url
    new ImageInfo(url, 626, 470)

  @getUrlFrom: (item) ->
    item.find("ImageUrl").text()