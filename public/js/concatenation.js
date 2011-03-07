(function() {
  var Axis, AxisScale, AxisType, ImageInfo, KakakuSearch, LogAxisScale, Point, Range, Rect, ScaleMode, Selector, XYGraphArea, XYGraphDetail, XYGraphItem, initAxisMenu, initCategorySelection;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  AxisType = {
    SaleDate: 'SaleDate',
    PvRanking: 'PvRanking',
    TotalScoreAve: 'TotalScoreAve',
    LowestPrice: 'LowestPrice',
    NumOfBbs: 'NumOfBbs'
  };
  Axis = (function() {
    function Axis(axisType) {
      this.axisType = axisType;
    }
    Axis.prototype.getUnit = function() {
      switch (this.axisType.toString()) {
        case AxisType.SaleDate:
          return '日前';
        case AxisType.PvRanking:
          return '位';
        case AxisType.TotalScoreAve:
          return '';
        case AxisType.LowestPrice:
          return '円';
        case AxisType.NumOfBbs:
          return '件';
        default:
          return '';
      }
    };
    Axis.prototype.getLabel = function() {
      switch (this.axisType) {
        case AxisType.SaleDate:
          return '古い';
        case AxisType.PvRanking:
          return '高い';
        case AxisType.TotalScoreAve:
          return '低い';
        case AxisType.LowestPrice:
          return '安い';
        case AxisType.NumOfBbs:
          return '少ない';
        default:
          return '';
      }
    };
    Axis.prototype.isLogScale = function() {
      return this.axisType.toString() === AxisType.PvRanking;
    };
    Axis.prototype.getScale = function(scaleMode) {
      var thick;
      thick = scaleMode === ScaleMode.HORIZONTAL ? 34 : 100;
      if (this.isLogScale()) {
        return new LogAxisScale(thick, scaleMode, this.getUnit());
      } else {
        return new AxisScale(thick, scaleMode, this.getUnit());
      }
    };
    return Axis;
  })();
  ScaleMode = {
    HORIZONTAL: 1,
    VERTICAL: 2
  };
  AxisScale = (function() {
    function AxisScale(thick, scaleMode, unit) {
      this.markColor = "#333";
      this.thickness = thick;
      this.length = 1;
      this.scaleMode = scaleMode || ScaleMode.HORIZONTAL;
      this.unit = unit || "";
      this.textClassName = "_canvas_text_";
      this.innerContainer = $('<div/>').css({
        position: 'absolute',
        'z-index': 100,
        'background-color': '#FF7F00'
      });
      $(document.body).append(this.innerContainer);
      this.canvas = $('<canvas/>').css({
        width: 10,
        height: 10
      }).get(0);
      this.innerContainer.append(this.canvas);
      this.ctx = this.getContext(this.canvas);
    }
    AxisScale.prototype.remove = function() {
      if (this.innerContainer) {
        $(this.canvas).remove();
        $(this.ctx).remove();
        return $(this.innerContainer).remove();
      }
    };
    AxisScale.prototype.getWidth = function() {
      if (this.scaleMode === ScaleMode.HORIZONTAL) {
        return this.length;
      } else {
        return this.thickness;
      }
    };
    AxisScale.prototype.getHeight = function() {
      if (this.scaleMode === ScaleMode.HORIZONTAL) {
        return this.thickness;
      } else {
        return this.length;
      }
    };
    AxisScale.prototype.setLength = function(value) {
      this.length = value;
      $(this.innerContainer).width(this.getWidth()).height(this.getHeight());
      $(this.canvas).attr({
        width: this.getWidth(),
        height: this.getHeight()
      });
      return this.update_();
    };
    AxisScale.prototype.setPosition = function(x, y) {
      return this.innerContainer.css({
        left: x,
        top: y
      });
    };
    AxisScale.prototype.isHorizontal = function() {
      return this.scaleMode === ScaleMode.HORIZONTAL;
    };
    AxisScale.prototype.hv = function(hValue, vValue) {
      if (this.isHorizontal()) {
        return hValue;
      } else {
        return vValue;
      }
    };
    AxisScale.prototype.getScaleLength = function() {
      return this.hv(this.getWidth(), this.getHeight());
    };
    AxisScale.prototype.getContext = function(canvasElem) {
      if (typeof G_vmlCanvasManager !== 'undefined') {
        canvasElem = G_vmlCanvasManager.initElement(canvasElem);
      }
      return canvasElem.getContext('2d');
    };
    AxisScale.prototype.appendText = function(text, pos, offset) {
      if (pos < 0) {
        return;
      }
      if (pos > this.getScaleLength()) {
        return;
      }
      return $('<span/>').addClass(this.textClassName).css({
        position: "absolute",
        'font-size': 13,
        color: '#333',
        left: this.hv(pos, offset),
        top: this.hv(offset, pos)
      }).text(text + this.unit).appendTo(this.innerContainer);
    };
    AxisScale.prototype.removeAllTexts = function() {
      return $(this.innerContainer).find("span." + this.textClassName).remove();
    };
    AxisScale.prototype.setRange = function(range) {
      this.range = range;
      return this.update_();
    };
    AxisScale.prototype.update_ = function() {
      var labeledNumberTable, num100000Marks, num10000Marks, num1000Marks, num100Marks;
      if (!this.range) {
        return;
      }
      this.ctx.clearRect(0, 0, this.getWidth(), this.getHeight());
      this.removeAllTexts();
      labeledNumberTable = {};
      num100000Marks = this.drawMarks(this.range, 100000, 5, 18, true, labeledNumberTable);
      if (num100000Marks <= 4) {
        num10000Marks = this.drawMarks(this.range, 10000, 3, 14, num100000Marks <= 1, labeledNumberTable);
        if (num10000Marks <= 4) {
          num1000Marks = this.drawMarks(this.range, 1000, 1, 8, num10000Marks <= 1, labeledNumberTable);
          if (num1000Marks <= 4) {
            num100Marks = this.drawMarks(this.range, 100, 1, 8, num1000Marks <= 1, labeledNumberTable);
            if (num100Marks <= 4) {
              return this.drawMarks(this.range, 10, 1, 8, num100Marks <= 1, labeledNumberTable);
            }
          }
        }
      }
    };
    AxisScale.prototype.drawMarks = function(range, unit, lineWidth, lineLength, labelIsShown, labeledNumberTable) {
      var count, interval, pos, rightOffset, rightScaleValue, value;
      if (range.getDifference() < 1) {
        return 0;
      }
      interval = unit * this.getScaleLength() / range.getDifference();
      rightScaleValue = Math.floor(range.last / unit) * unit;
      rightOffset = interval * (range.last - rightScaleValue) / unit;
      count = 0;
      while (true) {
        if (count > 100) {
          $.log('Too many!');
          break;
        }
        pos = this.getScaleLength() - rightOffset - interval * count;
        if (pos < 0) {
          break;
        }
        this.drawMark(pos, lineWidth, lineLength);
        if (interval > 40) {
          value = rightScaleValue - unit * count;
          if (!labeledNumberTable[value]) {
            this.appendText(value.toString(), pos - 3, lineLength);
            labeledNumberTable[value] = true;
          }
        }
        count++;
      }
      return count;
    };
    AxisScale.prototype.drawMark = function(pos, lineWidth, lineLength) {
      if (this.scaleMode === ScaleMode.HORIZONTAL) {
        return this.drawLine(pos, 0, pos, lineLength, lineWidth, lineLength);
      } else {
        return this.drawLine(0, pos, lineLength, pos, lineWidth, lineLength);
      }
    };
    AxisScale.prototype.drawLine = function(x1, y1, x2, y2, lineWidth, lineLength) {
      this.ctx.strokeStyle = "#333";
      this.ctx.lineWidth = lineWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      return this.ctx.stroke();
    };
    return AxisScale;
  })();
  ImageInfo = (function() {
    function ImageInfo(url, width, height) {
      this.url = url;
      this.width = width;
      this.height = height;
      if (!this.url) {
        this.url = "/img/noimage.jpg";
        this.width = 64;
        this.height = 42;
      }
    }
    ImageInfo.medium = function(item) {
      var url;
      url = ImageInfo.getUrlFrom(item);
      return new ImageInfo(url, 80, 60);
    };
    ImageInfo.large = function(item) {
      var url;
      url = ImageInfo.getUrlFrom(item);
      if (url) {
        url = url.replace(/\/m\//, '/l/');
      }
      return new ImageInfo(url, 160, 120);
    };
    ImageInfo.fullscale = function(item) {
      var url;
      url = ImageInfo.getUrlFrom(item);
      if (url) {
        url = url.replace(/\/m\//, '/fullscale/');
      }
      return new ImageInfo(url, 626, 470);
    };
    ImageInfo.getUrlFrom = function(item) {
      return item.find("ImageUrl").text();
    };
    return ImageInfo;
  })();
  KakakuSearch = (function() {
    function KakakuSearch(xyGraph) {
      this.xyGraph = xyGraph;
      this.maxPages = 0;
      this.fetchFirstPage();
    }
    KakakuSearch.prototype.fetchFirstPage = function() {
      return $.get(this.makeSearchURL(1), __bind(function(xml) {
        this.parseXML(xml, 1);
        if (this.maxPages > 1) {
          this.loadedCount = 1;
          return this.fetchRestPages();
        }
      }, this));
    };
    KakakuSearch.prototype.fetchRestPages = function() {
      var page, _ref, _results;
      _results = [];
      for (page = 2, _ref = this.maxPages; (2 <= _ref ? page <= _ref : page >= _ref); (2 <= _ref ? page += 1 : page -= 1)) {
        _results.push(this.fetchAndParseXML(page));
      }
      return _results;
    };
    KakakuSearch.prototype.fetchAndParseXML = function(page) {
      return $.get(this.makeSearchURL(page), __bind(function(xml) {
        this.parseXML(xml, page);
        this.loadedCount += 1;
        if (this.loadedCount >= this.maxPages) {
          return $.log("Loaded");
        }
      }, this));
    };
    KakakuSearch.prototype.isError = function(xml) {
      var error;
      xml = $(xml);
      error = xml.find("Error");
      if (error.length > 0) {
        error.find("Message").each(function(i, elem) {
          return $.log("Page " + page + ": " + $(elem).text());
        });
        return true;
      } else {
        return false;
      }
    };
    KakakuSearch.prototype.parseXML = function(xml, page) {
      var allPageNum, max, numOfResult;
      xml = $(xml);
      if (this.isError(xml)) {
        return;
      }
      if (page === 1) {
        numOfResult = parseInt(xml.find("NumOfResult").text());
        allPageNum = Math.ceil(numOfResult / 20);
        max = 3;
        this.maxPages = allPageNum <= max ? allPageNum : max;
      }
      $.log('Parse page ' + page);
      return xml.find("Item").each(__bind(function(index, elem) {
        return this.xyGraph.appendItem(elem);
      }, this));
    };
    KakakuSearch.prototype.makeSearchURL = function(page) {
      var params;
      params = this.getLocationParams();
      return ["/ajax/search", params["category"], params["keyword"], page.toString(), "xml"].join("/");
    };
    KakakuSearch.prototype.getLocationParams = function() {
      var i, pair, pairs, params, _ref;
      if (location.search.length <= 1) {
        return {};
      }
      pairs = location.search.substr(1).split("&");
      params = {};
      for (i = 0, _ref = pairs.length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
        pair = pairs[i].split("=");
        if (pair.length === 2) {
          params[pair[0]] = pair[1];
        }
      }
      return params;
    };
    return KakakuSearch;
  })();
  LogAxisScale = (function() {
    __extends(LogAxisScale, AxisScale);
    function LogAxisScale(thick, scaleMode, unit) {
      LogAxisScale.__super__.constructor.call(this, this, thick, scaleMode, unit);
    }
    LogAxisScale.prototype.getLogPos = function(value, range) {
      return (Math.log(value) - range.getLogFirst()) * this.getScaleLength() / range.getLogDifference();
    };
    LogAxisScale.prototype.update_ = function() {
      var i, j, pos, pos2, prevPos, value, value2, _results;
      if (!this.range) {
        return;
      }
      this.ctx.clearRect(0, 0, this.getWidth(), this.getHeight());
      this.removeAllTexts();
      prevPos = 0;
      _results = [];
      for (i = 0; i <= 6; i++) {
        value = Math.pow(10, i);
        pos = this.getLogPos(value, this.range);
        if (pos > this.getScaleLength()) {
          return;
        }
        if (pos < -1000) {
          return;
        }
        this.drawMark(pos, 3, 14);
        this.appendText(value.toString(), pos - 10, 14 + 3);
        prevPos = pos;
        for (j = 2; j <= 9; j++) {
          value2 = value * j;
          pos2 = this.getLogPos(value2, this.range);
          if (pos2 > this.getScaleLength()) {
            return;
          }
          if (pos2 - prevPos < 5) {
            break;
          }
          this.drawMark(pos2, 1, 8);
          if (pos2 - prevPos > 15) {
            this.appendText(value2.toString(), pos2 - 10, 8 + 3);
          }
          prevPos = pos2;
        }
      }
      return _results;
    };
    return LogAxisScale;
  })();
  Point = (function() {
    function Point(x, y) {
      this.x = x;
      this.y = y;
    }
    Point.prototype.subtract = function(p) {
      return new Point(this.x - p.x, this.y - p.y);
    };
    return Point;
  })();
  Range = (function() {
    function Range(first, last) {
      this.first = first;
      this.last = last;
    }
    Range.prototype.getDifference = function() {
      return this.last - this.first;
    };
    Range.prototype.getLogFirst = function() {
      return Math.log(this.first);
    };
    Range.prototype.getLogLast = function() {
      return Math.log(this.last);
    };
    Range.prototype.getLogDifference = function() {
      return this.getLogLast() - this.getLogFirst();
    };
    Range.prototype.toString = function() {
      return this.first + " " + this.last;
    };
    return Range;
  })();
  Rect = (function() {
    function Rect(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }
    Rect.prototype.getLeft = function() {
      return this.x;
    };
    Rect.prototype.getTop = function() {
      return this.y;
    };
    Rect.prototype.getRight = function() {
      return this.x + this.width;
    };
    Rect.prototype.getBottom = function() {
      return this.y + this.height;
    };
    return Rect;
  })();
  Selector = (function() {
    function Selector() {
      this.frame = this.createFrame();
      $(document.body).append(this.frame);
    }
    Selector.prototype.setLimitRect = function(left, top, width, height) {
      this.limitLeft = left;
      this.limitTop = top;
      this.limitRight = left + width;
      return this.limitBottom = top + height;
    };
    Selector.prototype.show = function() {
      return this.frame.show();
    };
    Selector.prototype.hide = function() {
      return this.frame.hide();
    };
    Selector.prototype.createFrame = function() {
      var opacity;
      opacity = 0.3;
      return $('<div/>').css({
        position: "absolute",
        left: 0,
        top: 0,
        border: "1px solid #3333FF",
        'background-color': "#CCCCFF",
        filter: "alpha(opacity=" + (opacity * 100) + ")",
        '-moz-opacity': opacity,
        opacity: opacity,
        cursor: "crosshair",
        'z-index': 10000
      }).unselectable().mousemove(__bind(function(event) {
        return event.preventDefault();
      }, this));
    };
    Selector.prototype.start = function(x, y) {
      this.startX = x;
      this.startY = y;
      return this.frame.css({
        left: x,
        top: y,
        width: 0,
        height: 0
      });
    };
    Selector.prototype.resizeTo = function(x, y) {
      var newHeight, newWidth, newX, newY;
      if (x < this.limitLeft) {
        x = this.limitLeft;
      }
      if (x > this.limitRight) {
        x = this.limitRight;
      }
      if (y < this.limitTop) {
        y = this.limitTop;
      }
      if (y > this.limitBottom) {
        y = this.limitBottom;
      }
      newX = this.startX;
      newY = this.startY;
      newWidth = x - this.startX;
      newHeight = y - this.startY;
      if (newWidth < 0) {
        newX = x;
        newWidth = Math.abs(newWidth);
      }
      if (newHeight < 0) {
        newY = y;
        newHeight = Math.abs(newHeight);
      }
      return this.frame.css({
        left: newX,
        top: newY,
        width: newWidth,
        height: newHeight
      });
    };
    Selector.prototype.getPageRect = function() {
      var offset;
      offset = this.frame.offset();
      return new Rect(offset.left, offset.top, this.frame.width(), this.frame.height());
    };
    Selector.prototype.getRelativeRect = function() {
      var offset;
      offset = this.frame.offset();
      return new Rect(offset.left - this.limitLeft, offset.top - this.limitTop, this.frame.width(), this.frame.height());
    };
    return Selector;
  })();
  XYGraphArea = (function() {
    function XYGraphArea() {
      this.graphItems = [];
      this.xAxis = new Axis(AxisType.LowestPrice);
      this.yAxis = new Axis(AxisType.PvRanking);
      this.reset_();
      this.itemContainer = this.createItemContainer();
      $(document.body).append(this.itemContainer);
      this.selector = new Selector();
      this.selector.hide();
      $(window).resize(__bind(function() {
        return this.onWindowResize();
      }, this));
      this.onWindowResize();
    }
    XYGraphArea.prototype.reset_ = function() {
      var graphItem, _i, _len, _ref, _results;
      this.minXValue_ = null;
      this.maxXValue_ = null;
      this.minYValue_ = null;
      this.maxYValue_ = null;
      this.xMaxAxisRange = new Range(0, 0);
      this.yMaxAxisRange = new Range(0, 0);
      this.xCurrentAxisRange = new Range(0, 0);
      this.yCurrentAxisRange = new Range(0, 0);
      this.rangeHistories = [];
      $('#x-axis-label').text(this.xAxis.getLabel());
      $('#y-axis-label').text(this.yAxis.getLabel());
      if (this.xAxisScale) {
        this.xAxisScale.remove();
      }
      if (this.yAxisScale) {
        this.yAxisScale.remove();
      }
      this.xAxisScale = this.xAxis.getScale(ScaleMode.HORIZONTAL);
      this.yAxisScale = this.yAxis.getScale(ScaleMode.VERTICAL);
      _ref = this.graphItems;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        graphItem = _ref[_i];
        _results.push(this.updateRangeAndMoveItem_(graphItem));
      }
      return _results;
    };
    XYGraphArea.prototype.switchXAxis = function(axisType) {
      delete this.xAxis;
      this.xAxis = new Axis(axisType);
      this.reset_();
      return this.onWindowResize();
    };
    XYGraphArea.prototype.switchYAxis = function(axisType) {
      delete this.yAxis;
      this.yAxis = new Axis(axisType);
      this.reset_();
      return this.onWindowResize();
    };
    XYGraphArea.prototype.onWindowResize = function() {
      var offset, rect, yMenuBox;
      this.width = $(window).width() - $('#x-menu-box').outerWidth() - 100;
      this.height = $(window).height() - $('#header').outerHeight() - 34;
      this.itemContainer.width(this.width).height(this.height).css({
        left: $('#x-menu-box').outerWidth(),
        top: $('#header').outerHeight()
      });
      this.adjustGraphItems();
      offset = this.itemContainer.offset();
      rect = {
        left: offset.left,
        top: offset.top,
        width: this.itemContainer.outerWidth(),
        height: this.itemContainer.outerHeight()
      };
      this.xAxisScale.setPosition(rect.left, rect.top + rect.height);
      this.yAxisScale.setPosition(rect.left + rect.width, rect.top);
      this.xAxisScale.setLength(rect.width);
      this.yAxisScale.setLength(rect.height);
      this.selector.setLimitRect(rect.left, rect.top, rect.width, rect.height);
      yMenuBox = $('#y-menu-box');
      return yMenuBox.css({
        left: $(window).width() - yMenuBox.outerWidth(),
        top: rect.top - yMenuBox.outerHeight()
      });
    };
    XYGraphArea.prototype.createItemContainer = function() {
      var div;
      div = $("<div/>").unselectable().css({
        border: "1px solid #555",
        "background-color": "#FFF",
        position: 'absolute',
        cursor: "crosshair",
        overflow: "hidden",
        "float": "left"
      }).mousedown(__bind(function(event) {
        return this.onMousedown(event);
      }, this));
      $("body").mousedown(__bind(function() {
        return this.removeAllDetail();
      }, this)).mousemove(__bind(function(event) {
        return this.onMousemove(event);
      }, this)).mouseup(__bind(function(event) {
        return this.onMouseup(event);
      }, this));
      return div;
    };
    XYGraphArea.prototype.onMousedown = function(event) {
      var item, _i, _len, _ref, _results;
      event.preventDefault();
      event.stopPropagation();
      if (this.dragging) {
        return;
      }
      if (this.isAnyDetailShowing()) {
        this.removeAllDetail();
        return;
      }
      this.dragging = true;
      this.selector.start(event.pageX, event.pageY);
      this.selector.show();
      _ref = this.graphItems;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        _results.push(item.inactivateTip());
      }
      return _results;
    };
    XYGraphArea.prototype.isAnyDetailShowing = function() {
      return $.any(this.graphItems, function(i, item) {
        return item.isDetailShowing();
      });
    };
    XYGraphArea.prototype.removeAllDetail = function() {
      var item, _i, _len, _ref, _results;
      _ref = this.graphItems;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        _results.push(item.removeDetail());
      }
      return _results;
    };
    XYGraphArea.prototype.onMousemove = function(event) {
      event.preventDefault();
      if (!this.dragging) {
        return;
      }
      return this.selector.resizeTo(event.pageX, event.pageY);
    };
    XYGraphArea.prototype.onMouseup = function(event) {
      var item, rect, _i, _len, _ref, _results;
      if (!this.dragging) {
        return;
      }
      this.dragging = false;
      this.selector.resizeTo(event.pageX, event.pageY);
      rect = this.selector.getRelativeRect();
      this.selector.hide();
      if (rect.width < 3 && rect.height < 3) {
        this.zoomOut();
      } else {
        this.zoomIn(new Range(this.calcXValue(rect.getLeft()), this.calcXValue(rect.getRight())), new Range(this.calcYValue(rect.getTop()), this.calcYValue(rect.getBottom())));
      }
      _ref = this.graphItems;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        _results.push(item.activateTip());
      }
      return _results;
    };
    XYGraphArea.prototype.setLocationHash = function(xRange, yRange) {
      var params, url;
      params = [];
      $.each({
        x1: xRange ? xRange.first : null,
        x2: xRange ? xRange.last : null,
        y1: yRange ? yRange.first : null,
        y2: yRange ? yRange.last : null
      }, function(key, value) {
        if (value) {
          return params.push(key + "=" + value);
        }
      });
      url = location.href.split("#")[0];
      return location.href = url + "#" + params.join("&");
    };
    XYGraphArea.prototype.zoomIn = function(xRange, yRange) {
      this.rangeHistories.push({
        xAxisRange: this.xCurrentAxisRange,
        yAxisRange: this.yCurrentAxisRange
      });
      return this.setCurrentAxisRange(xRange, yRange);
    };
    XYGraphArea.prototype.zoomOut = function() {
      var ranges;
      if (this.rangeHistories.length === 0) {
        return;
      }
      ranges = this.rangeHistories.pop();
      if (this.rangeHistories.length === 0) {
        return this.setCurrentAxisRange(this.xMaxAxisRange, this.yMaxAxisRange);
      } else {
        return this.setCurrentAxisRange(ranges.xAxisRange, ranges.yAxisRange);
      }
    };
    XYGraphArea.prototype.adjustGraphItems = function() {
      return $.each(this.graphItems, __bind(function(i, item) {
        return item.animateMoveTo(this.calcXCoord(item.getAxisValue(this.xAxis.axisType)), this.calcYCoord(item.getAxisValue(this.yAxis.axisType)));
      }, this));
    };
    XYGraphArea.prototype.calcXValue = function(x) {
      if (this.xAxis.isLogScale()) {
        return Math.exp(this.xCurrentAxisRange.getLogFirst() + (this.xCurrentAxisRange.getLogDifference() * x / this.width));
      } else {
        return this.xCurrentAxisRange.first + (this.xCurrentAxisRange.getDifference() * x / this.width);
      }
    };
    XYGraphArea.prototype.calcYValue = function(y) {
      if (this.yAxis.isLogScale()) {
        return Math.exp(this.yCurrentAxisRange.getLogFirst() + (this.yCurrentAxisRange.getLogDifference() * y / this.height));
      } else {
        return this.yCurrentAxisRange.first + (this.yCurrentAxisRange.getDifference() * y / this.height);
      }
    };
    XYGraphArea.prototype.calcXCoord = function(value) {
      if (this.xAxis.isLogScale()) {
        return Math.round(this.width * (Math.log(value) - this.xCurrentAxisRange.getLogFirst()) / this.xCurrentAxisRange.getLogDifference());
      } else {
        return Math.round(this.width * (value - this.xCurrentAxisRange.first) / this.xCurrentAxisRange.getDifference());
      }
    };
    XYGraphArea.prototype.calcYCoord = function(value) {
      if (this.yAxis.isLogScale()) {
        return Math.round(this.height * (Math.log(value) - this.yCurrentAxisRange.getLogFirst()) / this.yCurrentAxisRange.getLogDifference());
      } else {
        return Math.round(this.height * (value - this.yCurrentAxisRange.first) / this.yCurrentAxisRange.getDifference());
      }
    };
    XYGraphArea.prototype.appendItem = function(itemXmlElem) {
      var graphItem;
      graphItem = new XYGraphItem(itemXmlElem);
      if (!graphItem.getLowestPrice()) {
        return;
      }
      this.graphItems.push(graphItem);
      graphItem.render(this.itemContainer);
      return this.updateRangeAndMoveItem_(graphItem);
    };
    XYGraphArea.prototype.updateRangeAndMoveItem_ = function(graphItem) {
      var xValue, yValue;
      if (graphItem.getAxisValue(this.yAxis.axisType)) {
        graphItem.show();
      } else {
        graphItem.hide();
        return;
      }
      xValue = graphItem.getAxisValue(this.xAxis.axisType);
      yValue = graphItem.getAxisValue(this.yAxis.axisType);
      this.updateRange_(xValue, yValue);
      return graphItem.moveTo(this.calcXCoord(xValue), this.calcYCoord(yValue));
    };
    XYGraphArea.prototype.updateRange_ = function(xValue, yValue) {
      var xChanged, yChanged;
      xChanged = false;
      yChanged = false;
      if (this.minXValue_ === null || xValue < this.minXValue_) {
        this.minXValue_ = xValue;
        xChanged = true;
      }
      if (this.maxXValue_ === null || xValue > this.maxXValue_) {
        this.maxXValue_ = xValue;
        xChanged = true;
      }
      if (this.minYValue_ === null || yValue < this.minYValue_) {
        this.minYValue_ = yValue;
        yChanged = true;
      }
      if (this.maxYValue_ === null || yValue > this.maxYValue_) {
        this.maxYValue_ = yValue;
        yChanged = true;
      }
      if (xChanged || yChanged) {
        return this.setMaxAxisRange(new Range(this.minXValue_, this.maxXValue_), new Range(this.minYValue_, this.maxYValue_));
      }
    };
    XYGraphArea.prototype.setMaxAxisRange = function(xRange, yRange) {
      var paddingBottom, paddingRight;
      paddingRight = 100;
      paddingBottom = 120;
      this.xMaxAxisRange = this.extendRange(xRange, paddingRight, this.width, this.xAxis.isLogScale());
      this.yMaxAxisRange = this.extendRange(yRange, paddingBottom, this.height, this.yAxis.isLogScale());
      if (this.rangeHistories.length === 0) {
        return this.setCurrentAxisRange(xRange, yRange);
      }
    };
    XYGraphArea.prototype.extendRange = function(range, lastPaddingPixel, lengthPixel, isLog) {
      if (isLog) {
        range.last = Math.exp(range.getLogLast() + (lastPaddingPixel * range.getLogDifference() / lengthPixel));
      } else {
        range.last = range.last + (lastPaddingPixel * range.getDifference() / lengthPixel);
      }
      return range;
    };
    XYGraphArea.prototype.setCurrentAxisRange = function(xRange, yRange) {
      this.xCurrentAxisRange = xRange;
      this.yCurrentAxisRange = yRange;
      this.xAxisScale.setRange(xRange);
      this.yAxisScale.setRange(yRange);
      return this.adjustGraphItems();
    };
    return XYGraphArea;
  })();
  XYGraphDetail = (function() {
    function XYGraphDetail(graphItem) {
      this.graphItem = graphItem;
      this.isAlive = true;
      this.image = this.appendImage(graphItem);
    }
    XYGraphDetail.prototype.appendImage = function(graphItem) {
      var bottom, image, left, medium, offset, right, rightMargin, self, thumb, tipWidth, top, viewportSize;
      self = this;
      offset = graphItem.image.offset();
      thumb = graphItem.getLargeImageInfo();
      image = $("<img/>").attr({
        src: thumb.url
      }).css({
        position: "absolute",
        left: offset.left,
        top: offset.top,
        width: graphItem.image.width(),
        height: graphItem.image.height(),
        padding: graphItem.image.css("padding"),
        "background-color": graphItem.image.css("background-color"),
        border: graphItem.image.css("border"),
        "z-index": 3000
      }).mousemove(function(event) {
        return event.preventDefault();
      }).appendTo("body");
      medium = graphItem.getFullscaleImageInfo();
      viewportSize = {
        width: $(window).width(),
        height: $(window).height()
      };
      left = offset.left - (medium.width - graphItem.image.width()) / 2;
      top = offset.top - (medium.height - graphItem.image.height()) / 2;
      right = left + medium.width;
      bottom = top + medium.height;
      rightMargin = viewportSize.width - (left + medium.width);
      tipWidth = 400 + 50;
      if (left < tipWidth && rightMargin < tipWidth) {
        if (left < rightMargin) {
          left = viewportSize.width - tipWidth - medium.width;
        } else {
          left = tipWidth;
        }
      }
      if (left < 0) {
        left = 0;
      } else if (right > viewportSize.width) {
        left = viewportSize.width - medium.width;
      }
      if (top < 0) {
        top = 0;
      } else if (bottom > viewportSize.height) {
        top = viewportSize.height - medium.height;
      }
      image.animate({
        left: left,
        top: top,
        width: medium.width,
        height: medium.height
      }, "fast", null, function() {
        self.tip = self.appendTip(graphItem);
        return image.attr({
          src: medium.url
        });
      });
      return image;
    };
    XYGraphDetail.prototype.isTipRight = function() {
      return this.image.offset().left < 430;
    };
    XYGraphDetail.prototype.appendTip = function(graphItem) {
      var isRight, reviewHtml, self, summaryHtml, tip;
      self = this;
      reviewHtml = $.map(graphItem.getReviewComments(), function(comment) {
        return ['<div style="border-bottom: 1px solid #333 padding:0.5em">', "<b>", comment["summary"], "</b>", "<br/>", comment["content"], "</div>"].join("");
      }).join("");
      summaryHtml = [graphItem.getLowestPrice() + "円", "満足度 " + graphItem.getTotalScoreAve(), "人気ランキング：" + graphItem.getPvRanking() + "位", "発売日：" + (graphItem.getSaleDateString() || "?")].join("<br />");
      isRight = this.isTipRight();
      tip = this.image.qtip({
        content: {
          title: '<a href="' + graphItem.getItemPageUrl() + '" target="_blank" style="color:#FFFFFF">' + graphItem.getProductName() + '</a>',
          text: summaryHtml
        },
        style: {
          name: "dark",
          tip: {
            corner: isRight ? "leftTop" : "rightTop"
          },
          border: {
            radius: 3
          },
          width: {
            max: 400
          },
          title: {
            "font-size": "110%"
          },
          button: {
            "font-size": "100%"
          }
        },
        position: {
          corner: {
            target: isRight ? "rightTop" : "leftTop",
            tooltip: isRight ? "leftTop" : "rightTop"
          },
          adjust: {
            y: 10
          }
        },
        show: {
          ready: true,
          delay: 0
        },
        hide: {
          delay: 1000,
          fixed: true
        },
        api: {
          onHide: function() {
            var offset;
            self.image.css({
              "border-color": "#DDDDDD"
            });
            offset = graphItem.image.offset();
            return self.image.animate({
              left: offset.left,
              top: offset.top,
              width: graphItem.image.width(),
              height: graphItem.image.height()
            }, "fast", null, function() {
              return self.fadeoutAndRemove();
            });
          }
        }
      }).qtip("show");
      tip.qtip("api").elements.tooltip.selectable();
      tip.qtip("api").elements.tooltip.mousedown(function(event) {
        return event.stopPropagation();
      });
      return tip;
    };
    XYGraphDetail.prototype.fadeoutAndRemove = function() {
      var offset, self;
      if (!this.isAlive) {
        return;
      }
      self = this;
      if (this.tip) {
        this.tip.qtip("destroy");
      }
      this.image.css({
        "background-color": "#DDDDDD"
      });
      offset = this.graphItem.image.offset();
      return this.image.animate({
        left: offset.left,
        top: offset.top,
        width: self.graphItem.image.width(),
        height: self.graphItem.image.height()
      }, "fast", null, function() {
        return self.remove();
      });
    };
    XYGraphDetail.prototype.remove = function() {
      if (!this.isAlive) {
        return;
      }
      if (this.tip) {
        this.tip.qtip("destroy");
      }
      if (this.image) {
        this.image.remove();
      }
      return this.isAlive = false;
    };
    return XYGraphDetail;
  })();
  XYGraphItem = (function() {
    function XYGraphItem(itemElem) {
      this.item = $(itemElem);
      this.tipIsActive = true;
      this.image = this.createImage();
    }
    XYGraphItem.prototype.getAxisValue = function(axisType) {
      switch (axisType) {
        case AxisType.SaleDate:
          return this.getSaleDateTime();
        case AxisType.PvRanking:
          return this.getPvRanking();
        case AxisType.TotalScoreAve:
          return this.getTotalScoreAve();
        case AxisType.LowestPrice:
          return this.getLowestPrice();
        case AxisType.NumOfBbs:
          return this.getNumOfBbs();
        default:
          return $.log("No such AxisType: " + axisType);
      }
    };
    XYGraphItem.prototype.getProductName = function() {
      return this.item.find("ProductName").eq(0).text();
    };
    XYGraphItem.prototype.getProductID = function() {
      return this.item.find('ProductID').eq(0).text();
    };
    XYGraphItem.prototype.getMakerName = function() {
      return this.item.find('MakerName').eq(0).text();
    };
    XYGraphItem.prototype.getSaleDateString = function() {
      return this.item.find('SaleDate').eq(0).text();
    };
    XYGraphItem.prototype.getSaleDate = function() {
      var m;
      m = this.getSaleDateString().match(/(\d+)年(\d+)月(\d+)日/);
      if (m) {
        return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
      } else {
        return null;
      }
    };
    XYGraphItem.prototype.getSaleDateTime = function() {
      var date;
      date = this.getSaleDate();
      if (date) {
        return date.getTime();
      } else {
        return null;
      }
    };
    XYGraphItem.prototype.getComment = function() {
      return this.item.find('Comment').eq(0).text();
    };
    XYGraphItem.prototype.getCategoryName = function() {
      return this.item.find('CategoryName').eq(0).text();
    };
    XYGraphItem.prototype.getPvRanking = function() {
      return this.parseIntOrNull(this.item.find('PvRanking').eq(0).text());
    };
    XYGraphItem.prototype.getPvRankingLog = function() {
      return Math.log(this.getPvRanking());
    };
    XYGraphItem.prototype.getTotalScoreAve = function() {
      var f, s;
      s = this.item.find('TotalScoreAve').eq(0).text();
      if (!s) {
        return null;
      }
      f = parseFloat(s);
      if (isNaN(f)) {
        return null;
      }
      return f;
    };
    XYGraphItem.prototype.getImageUrl = function() {
      return this.item.find('ImageUrl').eq(0).text();
    };
    XYGraphItem.prototype.getItemPageUrl = function() {
      return this.item.find("ItemPageUrl").eq(0).text();
    };
    XYGraphItem.prototype.getBbsPageUrl = function() {
      return this.item.find('BbsPageUrl').eq(0).text();
    };
    XYGraphItem.prototype.getReviewPageUrl = function() {
      return this.item.find('ReviewPageUrl').eq(0).text();
    };
    XYGraphItem.prototype.getLowestPrice = function() {
      return this.parseIntOrNull(this.item.find('LowestPrice').eq(0).text());
    };
    XYGraphItem.prototype.getNumOfBbs = function() {
      return this.parseIntOrNull(this.item.find('NumOfBbs').eq(0).text());
    };
    XYGraphItem.prototype.parseIntOrNull = function(str) {
      var i;
      if (!str) {
        return null;
      }
      i = parseInt(str);
      if (isNaN(i)) {
        return null;
      }
      return i;
    };
    XYGraphItem.prototype.getMediumImageInfo = function() {
      return ImageInfo.medium(this.item);
    };
    XYGraphItem.prototype.getLargeImageInfo = function() {
      return ImageInfo.large(this.item);
    };
    XYGraphItem.prototype.getFullscaleImageInfo = function() {
      return ImageInfo.fullscale(this.item);
    };
    XYGraphItem.prototype.getImageScale = function() {
      var score;
      score = this.getTotalScoreAve();
      if (score) {
        return score / 5;
      } else {
        return 2.5 / 5;
      }
    };
    XYGraphItem.prototype.getReviewComments = function() {
      var comments;
      comments = [];
      this.item.find("CustomerReviews > Review").each(function(index, elem) {
        return comments.push({
          summary: $(elem).find("Summary").text(),
          content: $(elem).find("Content").text(),
          rating: $(elem).find("Rating").number()
        });
      });
      return comments;
    };
    XYGraphItem.prototype.createImage = function() {
      var container, h, self, thumb, w;
      self = this;
      thumb = this.getLargeImageInfo();
      w = Math.round(thumb.width * self.getImageScale());
      h = Math.round(thumb.height * self.getImageScale());
      container = $('<div/>').css({
        position: 'absolute',
        left: 0,
        top: 0,
        'z-index': self.getZIndex(),
        width: 100,
        'line-height': 0
      });
      this.img = $('<img/>').attr({
        src: thumb.url
      }).css({
        width: w,
        height: h,
        border: '1px solid #777',
        padding: 2,
        'border-radius': 5,
        'background-color': '#FFF',
        cursor: 'pointer'
      }).appendTo(container);
      this.img.mouseover(function() {
        return self.onMouseover();
      }).mouseout(function() {
        return self.onMouseout();
      }).mousedown(function(event) {
        return self.onMousedown(event);
      }).mousemove(function(event) {
        return event.preventDefault();
      });
      $('<div/>').css({
        width: 0,
        height: 0,
        'margin-left': 10,
        'border-top': '8px solid #777',
        'border-left': '5px solid transparent',
        'border-right': '5px solid transparent'
      }).appendTo(container);
      this.title = $("<div/>").text(this.getProductName()).css({
        padding: '3px 6px',
        width: 130,
        color: self.getTextColor(),
        'font-size': '80%',
        'line-height': '1em'
      }).appendTo(container);
      return container;
    };
    XYGraphItem.prototype.getTextColor = function() {
      var color, scale;
      scale = Math.floor(0xFF * (1 - this.getImageScale()));
      color = (scale << 16) | (scale << 8) | scale;
      return '#' + color.toString(16);
    };
    XYGraphItem.prototype.highlight = function() {
      this.image.css({
        "z-index": 2000
      });
      return this.title.css({
        "background-color": "#FF9933"
      });
    };
    XYGraphItem.prototype.offlight = function() {
      var self;
      self = this;
      this.image.css({
        "z-index": self.getZIndex()
      });
      return this.title.css({
        "background-color": 'transparent'
      });
    };
    XYGraphItem.prototype.activateTip = function() {
      this.tipIsActive = true;
      return this.image.css({
        cursor: "pointer"
      });
    };
    XYGraphItem.prototype.inactivateTip = function() {
      this.tipIsActive = false;
      return this.image.css({
        cursor: "crosshair"
      });
    };
    XYGraphItem.prototype.isDetailShowing = function() {
      if (!this.detail) {
        return false;
      }
      return this.detail.isAlive;
    };
    XYGraphItem.prototype.removeDetail = function() {
      if (this.detail) {
        return this.detail.fadeoutAndRemove();
      }
    };
    XYGraphItem.prototype.isTipRight = function() {
      return this.image.offset().left < 400;
    };
    XYGraphItem.prototype.createTip = function() {
      var isRight, self, summaryHtml;
      self = this;
      summaryHtml = [this.getLowestPrice() + "円", "満足度" + this.getTotalScoreAve()].join("<br />");
      isRight = this.isTipRight();
      return this.image.qtip({
        content: {
          title: self.getProductName(),
          text: summaryHtml
        },
        style: {
          name: "dark",
          tip: {
            corner: isRight ? "leftTop" : "rightTop"
          },
          border: {
            radius: 3
          }
        },
        position: {
          corner: {
            target: isRight ? "rightTop" : "leftTop",
            tooltip: isRight ? "leftTop" : "rightTop"
          },
          adjust: {
            y: 10
          }
        },
        show: {
          ready: true,
          delay: 0
        },
        api: {
          beforeShow: (function() {
            return self.tipIsActive;
          })
        }
      });
    };
    XYGraphItem.prototype.getZIndex = function() {
      if (!this.getPvRankingLog()) {
        return 0;
      }
      return Math.round(1000 * this.getImageScale(), +100 * (15 - this.getPvRankingLog()) / 15);
    };
    XYGraphItem.prototype.render = function(container) {
      return $(container).append(this.image);
    };
    XYGraphItem.prototype.show = function() {
      return this.image.show();
    };
    XYGraphItem.prototype.hide = function() {
      return this.image.hide();
    };
    XYGraphItem.prototype.moveTo = function(x, y) {
      return this.image.css({
        left: x,
        top: y
      });
    };
    XYGraphItem.prototype.animateMoveTo = function(x, y) {
      var self;
      this._x = x;
      this._y = y;
      self = this;
      this.image.stop();
      return this.image.animate({
        left: x,
        top: y
      }, {
        duration: "fast",
        complete: function() {}
      });
    };
    XYGraphItem.prototype.moveRandom = function() {
      var self;
      self = this;
      return setTimeout((function() {
        return self.moveRandomLeft();
      }), 1000 + Math.random() * 5000);
    };
    XYGraphItem.prototype.moveRandomLeft = function() {
      var self;
      self = this;
      return this.image.animate({
        left: this._x - self.image.width() * Math.random(),
        top: this._y - self.image.height() * Math.random()
      }, {
        duration: "slow",
        complete: function() {
          return setTimeout((function() {
            return self.moveRandomRight();
          }), 1000 + Math.random() * 4000);
        }
      });
    };
    XYGraphItem.prototype.moveRandomRight = function() {
      var self;
      self = this;
      return this.image.animate({
        left: this._x,
        top: this._y
      }, {
        duration: "slow",
        complete: function() {
          return setTimeout((function() {
            return self.moveRandomLeft();
          }), 1000 + Math.random() * 4000);
        }
      });
    };
    XYGraphItem.prototype.onMouseover = function() {
      return this.highlight();
    };
    XYGraphItem.prototype.onMouseout = function() {
      return this.offlight();
    };
    XYGraphItem.prototype.onMousedown = function(event) {
      event.stopPropagation();
      if (this.detail) {
        delete this.detail;
      }
      return this.detail = new XYGraphDetail(this);
    };
    return XYGraphItem;
  })();
  $(function() {
    var xyGraphArea;
    xyGraphArea = new XYGraphArea();
    new KakakuSearch(xyGraphArea);
    initCategorySelection();
    return initAxisMenu(xyGraphArea);
  });
  initCategorySelection = function() {
    return $("form.search").each(function(i, formElem) {
      return $(formElem).find("select[name='category']").change(function(event) {
        return $(formElem).submit();
      });
    });
  };
  initAxisMenu = function(xyGraphArea) {
    $('#x-axis-menu').change(function() {
      var value;
      value = $(this).val();
      $.log(value);
      return xyGraphArea.switchXAxis(value);
    });
    return $('#y-axis-menu').change(function() {
      var value;
      value = $(this).val();
      $.log(value);
      return xyGraphArea.switchYAxis(value);
    });
  };
  jQuery.fn.extend({
    integer: function() {
      return parseInt(this.text());
    },
    number: function() {
      return parseFloat(this.text());
    },
    unselectable: function() {
      return this.each(function() {
        return $(this).attr({
          unselectable: "on"
        }).css({
          "-moz-user-select": "none",
          "-khtml-user-select": "none",
          "-webkit-user-select": "none",
          "user-select": "none"
        });
      });
    },
    selectable: function() {
      return this.each(function() {
        return $(this).attr({
          unselectable: "off"
        }).css({
          "-moz-user-select": "auto",
          "-khtml-user-select": "auto",
          "-webkit-user-select": "auto",
          "user-select": "auto"
        });
      });
    }
  });
  jQuery.log = function(obj) {
    if (window.console) {
      return console.log(obj);
    }
  };
  jQuery.any = function(array, callback) {
    var i, _ref;
    for (i = 0, _ref = array.length; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
      if (callback.call(this, i, array[i])) {
        return true;
      }
    }
    return false;
  };
  jQuery.min = function(a, b) {
    if (a < b) {
      return a;
    } else {
      return b;
    }
  };
}).call(this);
