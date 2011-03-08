(function() {
  var Axis, AxisScale, AxisType, Category, CategoryList, ImageInfo, KakakuSearch, LogAxisScale, Point, Range, Rect, ScaleMode, Selector, Util, XYGraphArea, XYGraphDetail, XYGraphItem, initAxisMenu, initCategorySelection;
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
    NumOfBbs: 'NumOfBbs',
    MonitorSize: 'MonitorSize',
    HDDSize: 'HDDSize',
    MemorySize: 'MemorySize',
    Noise: 'Noise',
    Weight: 'Weight'
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
        case AxisType.MonitorSize:
          return 'インチ';
        case AxisType.HDDSize:
          return 'GB';
        case AxisType.MemorySize:
          return 'GB';
        case AxisType.Noise:
          return 'db';
        case AxisType.Weight:
          return 'g';
        default:
          return '';
      }
    };
    Axis.prototype.getLabel = function() {
      switch (this.axisType) {
        case AxisType.SaleDate:
          return '新しい';
        case AxisType.PvRanking:
          return '高い';
        case AxisType.TotalScoreAve:
          return '低い';
        case AxisType.LowestPrice:
          return '安い';
        case AxisType.NumOfBbs:
          return '少ない';
        case AxisType.MonitorSize:
          return '小さい';
        case AxisType.HDDSize:
          return '少ない';
        case AxisType.MemorySize:
          return '少ない';
        case AxisType.Noise:
          return '静か';
        case AxisType.Weight:
          return '軽い';
        default:
          return '';
      }
    };
    Axis.prototype.isLogScale = function() {
      return this.axisType.toString() === AxisType.PvRanking;
    };
    Axis.prototype.createScale = function(scaleMode, paddingHead, paddingFoot, desc) {
      var thick;
      if (paddingHead == null) {
        paddingHead = 0;
      }
      if (paddingFoot == null) {
        paddingFoot = 0;
      }
      if (desc == null) {
        desc = false;
      }
      thick = scaleMode === ScaleMode.HORIZONTAL ? 50 : 100;
      if (this.isLogScale()) {
        return new LogAxisScale(thick, scaleMode, this.getUnit(), paddingHead, paddingFoot);
      } else {
        return new AxisScale(thick, scaleMode, this.getUnit(), paddingHead, paddingFoot);
      }
    };
    return Axis;
  })();
  ScaleMode = {
    HORIZONTAL: 1,
    VERTICAL: 2
  };
  AxisScale = (function() {
    function AxisScale(thick, scaleMode, unit, paddingHead, paddingFoot) {
      this.paddingHead = paddingHead != null ? paddingHead : 0;
      this.paddingFoot = paddingFoot != null ? paddingFoot : 0;
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
      }).appendTo(document.body);
      this.canvas = $('<canvas/>').width(10).height(10);
      this.innerContainer.append(this.canvas);
      this.ctx = this.getContext(this.canvas.get(0));
    }
    AxisScale.prototype.remove = function() {
      if (this.innerContainer) {
        this.canvas.remove();
        return this.innerContainer.remove();
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
      this.innerContainer.width(this.getWidth()).height(this.getHeight());
      this.canvas.width(this.getWidth()).height(this.getHeight()).attr({
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
    AxisScale.prototype.getScaleBodyLength = function() {
      return this.getScaleLength() - this.paddingHead - this.paddingFoot;
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
        top: this.hv(offset, pos),
        '-webkit-transform': 'rotate(20deg)',
        '-moz-transform': 'rotate(20deg)'
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
      var labeledNumberTable, num100000Marks, num10000Marks, num1000Marks, num100Marks, num10Marks;
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
              num10Marks = this.drawMarks(this.range, 10, 1, 8, num100Marks <= 1, labeledNumberTable);
              if (num10Marks <= 4) {
                return this.drawMarks(this.range, 1, 1, 8, num10Marks <= 1, labeledNumberTable);
              }
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
      interval = unit * this.getScaleBodyLength() / range.getDifference();
      rightScaleValue = Math.ceil(range.last / unit) * unit;
      rightOffset = interval * (range.last - rightScaleValue) / unit;
      count = 0;
      while (true) {
        if (count > 100) {
          $.log('Too many!');
          break;
        }
        pos = this.paddingHead + this.getScaleBodyLength() - rightOffset - interval * count;
        if (pos < 0) {
          break;
        }
        this.drawMark(pos, lineWidth, lineLength);
        if (interval > 40) {
          value = rightScaleValue - unit * count;
          if (!labeledNumberTable[value]) {
            this.appendText(value.toString(), pos, lineLength);
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
      try {
        this.ctx.strokeStyle = "#333";
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        return this.ctx.stroke();
      } catch (error) {

      }
    };
    return AxisScale;
  })();
  Category = (function() {
    function Category() {}
    Category.nameToKey = {
      'パソコン': 'Pc',
      '家電': 'Kaden',
      'カメラ': 'Camera',
      'ゲーム': 'Game',
      '自動車・バイク': 'Kuruma',
      'スポーツ・アウトドア': 'Sports',
      'ベビー・キッズ': 'Baby',
      'ペット': 'Pet',
      'ビューティー・ヘルス': 'Beauty_Health'
    };
    Category.keyToName = {
      'Pc': 'パソコン',
      'Kaden': '家電',
      'Camera': 'カメラ',
      'Game': 'ゲーム',
      'Kuruma': '自動車・バイク',
      'Sports': 'スポーツ・アウトドア',
      'Baby': 'ベビー・キッズ',
      'Pet': 'ペット',
      'Beauty_Health': 'ビューティー・ヘルス'
    };
    Category.getKeyFrom = function(ja) {
      return Category.nameToKey[ja];
    };
    Category.getNameFrom = function(key) {
      return Category.keyToName[key];
    };
    return Category;
  })();
  CategoryList = (function() {
    function CategoryList() {
      this.categories_ = [];
    }
    CategoryList.prototype.add = function(categoryName) {
      return this.categories_.push(categoryName.split('>'));
    };
    CategoryList.prototype.recommend = function() {
      var buf, cat, name, _i, _len, _ref;
      buf = {};
      _ref = this.categories_;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cat = _ref[_i];
        name = cat[0];
        buf[name] = buf[name] ? buf[name] + 1 : 1;
      }
      return this.sortObj(buf);
    };
    CategoryList.prototype.recommendSub = function(categoryKey) {
      var buf, cat, categoryName, name, top, _i, _len, _ref;
      categoryName = Category.getNameFrom(categoryKey);
      buf = {};
      _ref = this.categories_;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cat = _ref[_i];
        top = cat[0];
        name = cat[cat.length - 1];
        if (top === categoryName) {
          buf[name] = buf[name] ? buf[name] + 1 : 1;
        }
      }
      return this.sortObj(buf);
    };
    CategoryList.prototype.sortObj = function(obj) {
      var ary, item, name, num, _i, _j, _len, _len2, _results;
      ary = (function() {
        var _results;
        _results = [];
        for (name in obj) {
          num = obj[name];
          _results.push({
            name: name,
            num: num
          });
        }
        return _results;
      })();
      ary = ary.sort(function(a, b) {
        return b.num - a.num;
      });
      for (_i = 0, _len = ary.length; _i < _len; _i++) {
        item = ary[_i];
        $.log(item.name + " " + item.num);
      }
      _results = [];
      for (_j = 0, _len2 = ary.length; _j < _len2; _j++) {
        item = ary[_j];
        _results.push(item.name);
      }
      return _results;
    };
    return CategoryList;
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
      return new ImageInfo(url, 626 / 2, 470 / 2);
    };
    ImageInfo.getUrlFrom = function(item) {
      return item.find("ImageUrl").text();
    };
    return ImageInfo;
  })();
  KakakuSearch = (function() {
    KakakuSearch.COMPLETE = 'complete';
    KakakuSearch.ITEM_ELEMENT = 'item_element';
    function KakakuSearch() {
      this.dispatcher_ = $(this);
      this.maxPages = 0;
      this.fetchFirstPage();
    }
    KakakuSearch.prototype.bind = function(evt, func) {
      return this.dispatcher_.bind(evt, func);
    };
    KakakuSearch.prototype.trigger = function(evt, args) {
      if (args == null) {
        args = [];
      }
      return this.dispatcher_.trigger(evt, args);
    };
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
          $.log("Loaded");
          return this.trigger(KakakuSearch.COMPLETE);
        }
      }, this));
    };
    KakakuSearch.prototype.isError = function(xml) {
      var error;
      xml = $(xml);
      error = xml.find("Error");
      if (error.length > 0) {
        error.find("Message").each(function(i, elem) {
          return $.log($(elem).text());
        });
        return true;
      } else {
        return false;
      }
    };
    KakakuSearch.prototype.parseXML = function(xml, page) {
      var allPageNum, max, numOfResult;
      xml = $(xml);
      $.log('Parse page ' + page);
      if (this.isError(xml)) {
        return;
      }
      if (page === 1) {
        numOfResult = parseInt(xml.find("NumOfResult").text());
        allPageNum = Math.ceil(numOfResult / 20);
        max = 3;
        this.maxPages = allPageNum <= max ? allPageNum : max;
      }
      return xml.find("Item").each(__bind(function(index, elem) {
        return this.trigger(KakakuSearch.ITEM_ELEMENT, [elem]);
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
    function LogAxisScale(thick, scaleMode, unit, paddingHead, paddingFoot) {
      this.paddingHead = paddingHead != null ? paddingHead : 0;
      this.paddingFoot = paddingFoot != null ? paddingFoot : 0;
      LogAxisScale.__super__.constructor.call(this, thick, scaleMode, unit, this.paddingHead, this.paddingFoot);
    }
    LogAxisScale.prototype.getLogPos = function(value, range) {
      return this.paddingHead + (Math.log(value) - range.getLogFirst()) * this.getScaleBodyLength() / range.getLogDifference();
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
  Util = (function() {
    function Util() {}
    Util.getLocationParams = function() {
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
    return Util;
  })();
  XYGraphArea = (function() {
    function XYGraphArea() {
      var kakakuSearch, params;
      params = Util.getLocationParams();
      this.subCategoryName = params['sub'] ? decodeURIComponent(params['sub']) : null;
      if (this.subCategoryName) {
        $('#sub-category').text(this.subCategoryName);
      }
      this.categoryList = new CategoryList();
      this.graphItems = [];
      this.paddingTop = 70;
      this.paddingBottom = 10;
      this.paddingLeft = 30;
      this.paddingRight = 200;
      if ($(window).width() > 1600) {
        this.paddingTop += 80;
        this.paddingRight += 80;
      }
      this.itemContainer = this.createItemContainer().appendTo(document.body);
      this.selector = new Selector();
      this.selector.hide();
      this.xAxis = new Axis(AxisType.LowestPrice);
      this.yAxis = new Axis(AxisType.PvRanking);
      this.onAxisReset();
      this.onWindowResize();
      $(window).resize(__bind(function() {
        return this.onWindowResize();
      }, this));
      kakakuSearch = new KakakuSearch();
      kakakuSearch.bind(KakakuSearch.ITEM_ELEMENT, (__bind(function(evt, elem) {
        return this.appendItem(elem);
      }, this)));
      kakakuSearch.bind(KakakuSearch.COMPLETE, (__bind(function() {
        return this.updateRecommendCategory();
      }, this)));
    }
    XYGraphArea.prototype.onAxisReset = function() {
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
      this.xAxisScale = this.xAxis.createScale(ScaleMode.HORIZONTAL, this.paddingLeft, this.paddingRight);
      this.yAxisScale = this.yAxis.createScale(ScaleMode.VERTICAL, this.paddingTop, this.paddingBottom);
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
      this.onAxisReset();
      return this.onWindowResize();
    };
    XYGraphArea.prototype.switchYAxis = function(axisType) {
      delete this.yAxis;
      this.yAxis = new Axis(axisType);
      this.onAxisReset();
      return this.onWindowResize();
    };
    XYGraphArea.prototype.onWindowResize = function() {
      var offset, rect, yMenuBox;
      $('body').height($(window).height());
      this.width = $(window).width() - $('#x-menu-box').outerWidth() - 100;
      this.height = $(window).height() - $('#header').outerHeight() - 50;
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
      this.selector.setLimitRect(offset.left, offset.top, this.itemContainer.innerWidth(), this.itemContainer.innerHeight());
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
        'background-color': "#FFF",
        position: 'absolute',
        cursor: "crosshair",
        overflow: "hidden"
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
      return this.selector.show();
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
      var rect;
      if (!this.dragging) {
        return;
      }
      this.dragging = false;
      this.selector.resizeTo(event.pageX, event.pageY);
      rect = this.selector.getRelativeRect();
      this.selector.hide();
      if (rect.width < 3 && rect.height < 3) {
        return this.zoomOut();
      } else {
        return this.zoomIn(new Range(this.calcXValue(rect.getLeft()), this.calcXValue(rect.getRight())), new Range(this.calcYValue(rect.getTop()), this.calcYValue(rect.getBottom())));
      }
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
      var item, xValue, yValue, _i, _len, _ref, _results;
      _ref = this.graphItems;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        xValue = item.getAxisValue(this.xAxis.axisType);
        yValue = item.getAxisValue(this.yAxis.axisType);
        _results.push((xValue != null) && !isNaN(xValue) && (yValue != null) && !isNaN(yValue) ? (item.animateMoveTo(this.calcXCoord(xValue), this.calcYCoord(yValue)), item.show()) : item.hide());
      }
      return _results;
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
      return this.paddingLeft + Math.round(this.xAxis.isLogScale() ? this.getBodyWidth() * (Math.log(value) - this.xCurrentAxisRange.getLogFirst()) / this.xCurrentAxisRange.getLogDifference() : this.getBodyWidth() * (value - this.xCurrentAxisRange.first) / this.xCurrentAxisRange.getDifference());
    };
    XYGraphArea.prototype.calcYCoord = function(value) {
      return this.paddingTop + Math.round(this.yAxis.isLogScale() ? this.getBodyHeight() * (Math.log(value) - this.yCurrentAxisRange.getLogFirst()) / this.yCurrentAxisRange.getLogDifference() : this.getBodyHeight() * (value - this.yCurrentAxisRange.first) / this.yCurrentAxisRange.getDifference());
    };
    XYGraphArea.prototype.getBodyWidth = function() {
      return this.width - this.paddingLeft - this.paddingRight;
    };
    XYGraphArea.prototype.getBodyHeight = function() {
      return this.height - this.paddingTop - this.paddingBottom;
    };
    XYGraphArea.prototype.appendItem = function(itemXmlElem) {
      var graphItem;
      graphItem = new XYGraphItem(itemXmlElem);
      if (!graphItem.getLowestPrice()) {
        return;
      }
      this.categoryList.add(graphItem.getCategoryName());
      if (this.subCategoryName) {
        if (this.subCategoryName !== graphItem.getSubCategoryName()) {
          return;
        }
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
      this.xMaxAxisRange = xRange;
      this.yMaxAxisRange = yRange;
      if (this.rangeHistories.length === 0) {
        return this.setCurrentAxisRange(xRange, yRange);
      }
    };
    XYGraphArea.prototype.setCurrentAxisRange = function(xRange, yRange) {
      this.xCurrentAxisRange = xRange;
      this.yCurrentAxisRange = yRange;
      this.xAxisScale.setRange(xRange);
      this.yAxisScale.setRange(yRange);
      return this.adjustGraphItems();
    };
    XYGraphArea.prototype.updateRecommendCategory = function() {
      var categoryKey, names, params;
      params = Util.getLocationParams();
      categoryKey = params['category'];
      if (categoryKey && categoryKey !== 'ALL') {
        names = this.categoryList.recommendSub(categoryKey).slice(0, 3);
        return this.appendRecommendSubCategories(categoryKey, names);
      } else {
        names = this.categoryList.recommend().slice(0, 3);
        return this.appendRecommendCategories(names);
      }
    };
    XYGraphArea.prototype.appendRecommendCategories = function(names) {
      var container, key, keyword, link, name, params, _i, _len, _results;
      container = $('#sub-category');
      params = Util.getLocationParams();
      keyword = params['keyword'];
      _results = [];
      for (_i = 0, _len = names.length; _i < _len; _i++) {
        name = names[_i];
        key = Category.getKeyFrom(name);
        link = $('<a/>').attr({
          href: "/search?keyword=" + keyword + "&category=" + key
        }).addClass('recommend').text(name);
        _results.push(container.append(link));
      }
      return _results;
    };
    XYGraphArea.prototype.appendRecommendSubCategories = function(categoryKey, names) {
      var container, keyword, link, name, params, sub, _i, _len, _results;
      container = $('#sub-category');
      params = Util.getLocationParams();
      keyword = params['keyword'];
      _results = [];
      for (_i = 0, _len = names.length; _i < _len; _i++) {
        name = names[_i];
        if (this.subCategoryName && (name === this.subCategoryName)) {
          continue;
        }
        sub = encodeURIComponent(name);
        link = $('<a/>').attr({
          href: "/search?keyword=" + keyword + "&category=" + categoryKey + "&sub=" + sub
        }).addClass('recommend').text(name);
        _results.push(container.append(link));
      }
      return _results;
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
      thumb = graphItem.thumb;
      image = $("<img/>").attr({
        src: thumb.url
      }).css({
        position: "absolute",
        left: offset.left,
        top: offset.top,
        width: graphItem.image.width(),
        height: graphItem.image.height(),
        padding: graphItem.image.css('padding'),
        border: graphItem.image.css("border"),
        'border-radius': 4,
        '-moz-border-radius': 4,
        'background-color': graphItem.image.css('background-color'),
        'z-index': 6000,
        'box-shadow': '3px 3px 10px rgba(0, 0, 0, 0.3)',
        '-moz-box-shadow': '3px 3px 10px rgba(0, 0, 0, 0.3)'
      }).mousemove(function(event) {
        return event.preventDefault();
      }).appendTo('body');
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
      tipWidth = 300 + 50;
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
      return this.image.offset().left < 330;
    };
    XYGraphDetail.prototype.appendTip = function(graphItem) {
      var isRight, self, summaryHtml, tip;
      self = this;
      summaryHtml = [graphItem.getLowestPrice() + "円", "満足度：" + (graphItem.getTotalScoreAve() || '?'), "売れ筋ランキング：" + graphItem.getPvRanking() + "位", "発売日：" + (graphItem.getSaleDateString() || '?'), graphItem.getComment()].join("<br />");
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
            max: 300
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
      this.initImage();
    }
    XYGraphItem.prototype.getAxisValue = function(axisType) {
      switch (axisType) {
        case AxisType.SaleDate:
          return this.getSaleDateTimeAgo();
        case AxisType.PvRanking:
          return this.getPvRanking();
        case AxisType.TotalScoreAve:
          return this.getTotalScoreAve();
        case AxisType.LowestPrice:
          return this.getLowestPrice();
        case AxisType.NumOfBbs:
          return this.getNumOfBbs();
        case AxisType.MonitorSize:
          return this.getMonitorSize();
        case AxisType.HDDSize:
          return this.getHDDSize();
        case AxisType.MemorySize:
          return this.getMemorySize();
        case AxisType.Noise:
          return this.getNoise();
        case AxisType.Weight:
          return this.getWeight();
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
    XYGraphItem.prototype.getSaleDateTimeAgo = function() {
      var dateTime;
      dateTime = this.getSaleDateTime();
      if (dateTime) {
        return (new Date()).getTime() - dateTime;
      } else {
        return null;
      }
    };
    XYGraphItem.prototype.getComment = function() {
      return this.item.find('Comment').eq(0).text();
    };
    XYGraphItem.prototype.getMonitorSize = function() {
      var m;
      m = this.getComment().match(/(画面|液晶|モニタ)サイズ：([\d\.]+)インチ/);
      if (m) {
        return parseFloat(m[2]);
      } else {
        return NaN;
      }
    };
    XYGraphItem.prototype.getHDDSize = function() {
      var m;
      m = this.getComment().match(/HDD容量：([\d\.]+)(TB|GB)/);
      if (m) {
        if (m[2] === 'TB') {
          return parseFloat(m[1]) * 1000;
        } else {
          return parseFloat(m[1]);
        }
      } else {
        return NaN;
      }
    };
    XYGraphItem.prototype.getMemorySize = function() {
      var m;
      m = this.getComment().match(/メモリ容量：([\d\.]+)GB/);
      if (m) {
        return parseFloat(m[1]);
      } else {
        return NaN;
      }
    };
    XYGraphItem.prototype.getNoise = function() {
      var m;
      m = this.getComment().match(/騒音値：([\d\.]+)db/);
      if (m) {
        return parseFloat(m[1]);
      } else {
        return NaN;
      }
    };
    XYGraphItem.prototype.getWeight = function() {
      var m;
      m = this.getComment().match(/重さ：([\d\.]+)g/);
      if (m) {
        return parseFloat(m[1]);
      } else {
        return NaN;
      }
    };
    XYGraphItem.prototype.getCategoryName = function() {
      return this.item.find('CategoryName').eq(0).text();
    };
    XYGraphItem.prototype.getSubCategoryName = function() {
      var ary;
      ary = this.getCategoryName().split('>');
      return ary[ary.length - 1];
    };
    XYGraphItem.prototype.getPvRanking = function() {
      return parseInt(this.item.find('PvRanking').eq(0).text());
    };
    XYGraphItem.prototype.getPvRankingLog = function() {
      return Math.log(this.getPvRanking());
    };
    XYGraphItem.prototype.getTotalScoreAve = function() {
      var s;
      s = this.item.find('TotalScoreAve').eq(0).text();
      return parseFloat(s);
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
      return parseInt(this.item.find('LowestPrice').eq(0).text());
    };
    XYGraphItem.prototype.getNumOfBbs = function() {
      return parseInt(this.item.find('NumOfBbs').eq(0).text());
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
      var min, scale, score;
      score = this.getTotalScoreAve();
      scale = (score ? (score * score) / (5 * 5) : (3 * 3) / (5 * 5));
      min = 0.2;
      if (scale > min) {
        return scale;
      } else {
        return min;
      }
    };
    XYGraphItem.prototype.initImage = function() {
      var borderColor, h, self, w;
      self = this;
      this.thumb = $(window).width() > 1600 ? this.getLargeImageInfo() : this.getMediumImageInfo();
      w = Math.round(this.thumb.width * this.getImageScale());
      h = Math.round(this.thumb.height * this.getImageScale());
      borderColor = '#BBB';
      this.bubble = $('<div/>').css({
        position: 'absolute',
        left: 0,
        top: 0,
        'z-index': self.getBubbleZIndex(),
        'line-height': 0
      });
      this.image = $('<img/>').attr({
        src: self.thumb.url
      }).css({
        width: w,
        height: h,
        border: '1px solid ' + borderColor,
        padding: 2,
        cursor: 'pointer',
        'border-radius': 4,
        '-moz-border-radius': 4,
        'background-color': '#FFF',
        'box-shadow': '3px 3px 6px rgba(0, 0, 0, 0.4)',
        '-moz-box-shadow': '3px 3px 6px rgba(0, 0, 0, 0.4)'
      }).mouseover(__bind(function() {
        return this.onMouseover();
      }, this)).mouseout(__bind(function() {
        return this.onMouseout();
      }, this)).mousedown(__bind(function(event) {
        return this.onMousedown(event);
      }, this)).mousemove(__bind(function(event) {
        return event.preventDefault();
      }, this)).appendTo(this.bubble);
      this.triangle = $('<div/>').css({
        width: 0,
        height: 0,
        'margin-left': 10,
        'border-top': '8px solid #666',
        'border-left': '5px solid transparent',
        'border-right': '5px solid transparent'
      }).appendTo(this.bubble);
      return this.caption = $("<div/>").text(this.getProductName()).css({
        position: 'absolute',
        left: 0,
        top: 0,
        'z-index': self.getCaptionZIndex(),
        padding: '2px 6px 6px 12px',
        width: 130,
        color: '#444',
        'border-top': '1px solid ' + borderColor,
        'background-color': '#FFF',
        'font-size': '80%',
        'line-height': '1em'
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
    XYGraphItem.prototype.getTextColor = function() {
      var color, scale;
      scale = Math.floor(0xFF * (1 - this.getImageScale()));
      color = (scale << 16) | (scale << 8) | scale;
      return '#' + color.toString(16);
    };
    XYGraphItem.prototype.highlight = function() {
      this.bubble.css({
        'z-index': 5000 + 1
      });
      return this.caption.css({
        'z-index': 5000,
        'background-color': "#FFBF00",
        'font-weight': 'bold'
      });
    };
    XYGraphItem.prototype.offlight = function() {
      var self;
      self = this;
      this.bubble.css({
        "z-index": self.getBubbleZIndex()
      });
      return this.caption.css({
        'z-index': self.getCaptionZIndex(),
        'background-color': '#FFF',
        'font-weight': 'normal'
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
    XYGraphItem.prototype.getBubbleZIndex = function() {
      return this.getCaptionZIndex() + 1000;
    };
    XYGraphItem.prototype.getCaptionZIndex = function() {
      if (!this.getPvRankingLog()) {
        return 0;
      }
      return Math.round(1000 * this.getImageScale(), +100 * (15 - this.getPvRankingLog()) / 15);
    };
    XYGraphItem.prototype.render = function(container) {
      $(container).append(this.bubble);
      return $(container).append(this.caption);
    };
    XYGraphItem.prototype.show = function() {
      this.bubble.show();
      return this.caption.show();
    };
    XYGraphItem.prototype.hide = function() {
      this.bubble.hide();
      return this.caption.hide();
    };
    XYGraphItem.prototype.moveTo = function(x, y) {
      var self;
      self = this;
      this.bubble.css({
        left: self.getBubbleLeft(x),
        top: self.getBubbleTop(y)
      });
      return this.moveCaptionTo(x, y);
    };
    XYGraphItem.prototype.moveCaptionTo = function(x, y) {
      var self;
      self = this;
      return this.caption.css({
        left: self.getCaptionLeft(x),
        top: self.getCaptionTop(y)
      });
    };
    XYGraphItem.prototype.animateMoveTo = function(x, y) {
      var self;
      self = this;
      this.bubble.stop();
      return this.bubble.animate({
        left: self.getBubbleLeft(x),
        top: self.getBubbleTop(y)
      }, {
        duration: "fast",
        complete: __bind(function() {
          return this.moveCaptionTo(x, y);
        }, this)
      });
    };
    XYGraphItem.prototype.getBubbleLeft = function(x) {
      return x - (10 + 5);
    };
    XYGraphItem.prototype.getBubbleTop = function(y) {
      return y - this.bubble.height();
    };
    XYGraphItem.prototype.getCaptionLeft = function(x) {
      return this.getBubbleLeft(x) + this.bubble.width() - 6;
    };
    XYGraphItem.prototype.getCaptionTop = function(y) {
      return this.getBubbleTop(y);
    };
    return XYGraphItem;
  })();
  $(function() {
    var xyGraphArea;
    xyGraphArea = new XYGraphArea();
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
    var item, xMenuItems, yMenuItems, _i, _j, _len, _len2;
    xMenuItems = [['値段', AxisType.LowestPrice], ['売れ筋', AxisType.PvRanking], ['発売日', AxisType.SaleDate], ['クチコミ数', AxisType.NumOfBbs], ['満足度', AxisType.TotalScoreAve], ['モニタサイズ', AxisType.MonitorSize], ['HDD容量', AxisType.HDDSize], ['メモリ容量', AxisType.MemorySize], ['騒音値', AxisType.Noise], ['重さ', AxisType.Weight]];
    yMenuItems = [['売れ筋', AxisType.PvRanking], ['値段', AxisType.LowestPrice], ['発売日', AxisType.SaleDate], ['クチコミ数', AxisType.NumOfBbs], ['満足度', AxisType.TotalScoreAve], ['モニタサイズ', AxisType.MonitorSize], ['HDD容量', AxisType.HDDSize], ['メモリ容量', AxisType.MemorySize], ['騒音値', AxisType.Noise], ['重さ', AxisType.Weight]];
    for (_i = 0, _len = xMenuItems.length; _i < _len; _i++) {
      item = xMenuItems[_i];
      $('#x-axis-menu').append($('<option/>').text(item[0]).val(item[1]));
    }
    for (_j = 0, _len2 = yMenuItems.length; _j < _len2; _j++) {
      item = yMenuItems[_j];
      $('#y-axis-menu').append($('<option/>').text(item[0]).val(item[1]));
    }
    $('#x-axis-menu').change(function() {
      var value;
      value = $(this).val();
      return xyGraphArea.switchXAxis(value);
    });
    return $('#y-axis-menu').change(function() {
      var value;
      value = $(this).val();
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
