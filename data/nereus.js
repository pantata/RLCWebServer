/* -- dygraph.js -- */
!function(t){"use strict";for(var e,a,i={},r=function(){},n="memory".split(","),o="assert,clear,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn".split(",");e=n.pop();)t[e]=t[e]||i;for(;a=o.pop();)t[a]=t[a]||r}(this.console=this.console||{}),function(){"use strict";CanvasRenderingContext2D.prototype.installPattern=function(t){if("undefined"!=typeof this.isPatternInstalled)throw"Must un-install old line pattern before installing a new one.";this.isPatternInstalled=!0;var e=[0,0],a=[],i=this.beginPath,r=this.lineTo,n=this.moveTo,o=this.stroke;this.uninstallPattern=function(){this.beginPath=i,this.lineTo=r,this.moveTo=n,this.stroke=o,this.uninstallPattern=void 0,this.isPatternInstalled=void 0},this.beginPath=function(){a=[],i.call(this)},this.moveTo=function(t,e){a.push([[t,e]]),n.call(this,t,e)},this.lineTo=function(t,e){var i=a[a.length-1];i.push([t,e])},this.stroke=function(){if(0===a.length)return void o.call(this);for(var i=0;i<a.length;i++)for(var s=a[i],l=s[0][0],h=s[0][1],p=1;p<s.length;p++){var g=s[p][0],d=s[p][1];this.save();var u=g-l,c=d-h,y=Math.sqrt(u*u+c*c),_=Math.atan2(c,u);this.translate(l,h),n.call(this,0,0),this.rotate(_);for(var v=e[0],f=0;y>f;){var x=t[v];f+=e[1]?e[1]:x,f>y?(e=[v,f-y],f=y):e=[(v+1)%t.length,0],v%2===0?r.call(this,f,0):n.call(this,f,0),v=(v+1)%t.length}this.restore(),l=g,h=d}o.call(this),a=[]}},CanvasRenderingContext2D.prototype.uninstallPattern=function(){throw"Must install a line pattern before uninstalling it."}}();var DygraphOptions=function(){return function(){"use strict";var t=function(t){this.dygraph_=t,this.yAxes_=[],this.xAxis_={},this.series_={},this.global_=this.dygraph_.attrs_,this.user_=this.dygraph_.user_attrs_||{},this.labels_=[],this.highlightSeries_=this.get("highlightSeriesOpts")||{},this.reparseSeries()};t.AXIS_STRING_MAPPINGS_={y:0,Y:0,y1:0,Y1:0,y2:1,Y2:1},t.axisToIndex_=function(e){if("string"==typeof e){if(t.AXIS_STRING_MAPPINGS_.hasOwnProperty(e))return t.AXIS_STRING_MAPPINGS_[e];throw"Unknown axis : "+e}if("number"==typeof e){if(0===e||1===e)return e;throw"Dygraphs only supports two y-axes, indexed from 0-1."}if(e)throw"Unknown axis : "+e;return 0},t.prototype.reparseSeries=function(){var e=this.get("labels");if(e){this.labels_=e.slice(1),this.yAxes_=[{series:[],options:{}}],this.xAxis_={options:{}},this.series_={};var a=!this.user_.series;if(a){for(var i=0,r=0;r<this.labels_.length;r++){var n=this.labels_[r],o=this.user_[n]||{},s=0,l=o.axis;"object"==typeof l&&(s=++i,this.yAxes_[s]={series:[n],options:l}),l||this.yAxes_[0].series.push(n),this.series_[n]={idx:r,yAxis:s,options:o}}for(var r=0;r<this.labels_.length;r++){var n=this.labels_[r],o=this.series_[n].options,l=o.axis;if("string"==typeof l){if(!this.series_.hasOwnProperty(l))return void console.error("Series "+n+" wants to share a y-axis with series "+l+", which does not define its own axis.");var s=this.series_[l].yAxis;this.series_[n].yAxis=s,this.yAxes_[s].series.push(n)}}}else for(var r=0;r<this.labels_.length;r++){var n=this.labels_[r],o=this.user_.series[n]||{},s=t.axisToIndex_(o.axis);this.series_[n]={idx:r,yAxis:s,options:o},this.yAxes_[s]?this.yAxes_[s].series.push(n):this.yAxes_[s]={series:[n],options:{}}}var h=this.user_.axes||{};Dygraph.update(this.yAxes_[0].options,h.y||{}),this.yAxes_.length>1&&Dygraph.update(this.yAxes_[1].options,h.y2||{}),Dygraph.update(this.xAxis_.options,h.x||{})}},t.prototype.get=function(t){var e=this.getGlobalUser_(t);return null!==e?e:this.getGlobalDefault_(t)},t.prototype.getGlobalUser_=function(t){return this.user_.hasOwnProperty(t)?this.user_[t]:null},t.prototype.getGlobalDefault_=function(t){return this.global_.hasOwnProperty(t)?this.global_[t]:Dygraph.DEFAULT_ATTRS.hasOwnProperty(t)?Dygraph.DEFAULT_ATTRS[t]:null},t.prototype.getForAxis=function(t,e){var a,i;if("number"==typeof e)a=e,i=0===a?"y":"y2";else{if("y1"==e&&(e="y"),"y"==e)a=0;else if("y2"==e)a=1;else{if("x"!=e)throw"Unknown axis "+e;a=-1}i=e}var r=-1==a?this.xAxis_:this.yAxes_[a];if(r){var n=r.options;if(n.hasOwnProperty(t))return n[t]}if("x"!==e||"logscale"!==t){var o=this.getGlobalUser_(t);if(null!==o)return o}var s=Dygraph.DEFAULT_ATTRS.axes[i];return s.hasOwnProperty(t)?s[t]:this.getGlobalDefault_(t)},t.prototype.getForSeries=function(t,e){if(e===this.dygraph_.getHighlightSeries()&&this.highlightSeries_.hasOwnProperty(t))return this.highlightSeries_[t];if(!this.series_.hasOwnProperty(e))throw"Unknown series: "+e;var a=this.series_[e],i=a.options;return i.hasOwnProperty(t)?i[t]:this.getForAxis(t,a.yAxis)},t.prototype.numAxes=function(){return this.yAxes_.length},t.prototype.axisForSeries=function(t){return this.series_[t].yAxis},t.prototype.axisOptions=function(t){return this.yAxes_[t].options},t.prototype.seriesForAxis=function(t){return this.yAxes_[t].series},t.prototype.seriesNames=function(){return this.labels_};return t}()}(),DygraphLayout=function(){"use strict";var t=function(t){this.dygraph_=t,this.points=[],this.setNames=[],this.annotations=[],this.yAxes_=null,this.xTicks_=null,this.yTicks_=null};return t.prototype.addDataset=function(t,e){this.points.push(e),this.setNames.push(t)},t.prototype.getPlotArea=function(){return this.area_},t.prototype.computePlotArea=function(){var t={x:0,y:0};t.w=this.dygraph_.width_-t.x-this.dygraph_.getOption("rightGap"),t.h=this.dygraph_.height_;var e={chart_div:this.dygraph_.graphDiv,reserveSpaceLeft:function(e){var a={x:t.x,y:t.y,w:e,h:t.h};return t.x+=e,t.w-=e,a},reserveSpaceRight:function(e){var a={x:t.x+t.w-e,y:t.y,w:e,h:t.h};return t.w-=e,a},reserveSpaceTop:function(e){var a={x:t.x,y:t.y,w:t.w,h:e};return t.y+=e,t.h-=e,a},reserveSpaceBottom:function(e){var a={x:t.x,y:t.y+t.h-e,w:t.w,h:e};return t.h-=e,a},chartRect:function(){return{x:t.x,y:t.y,w:t.w,h:t.h}}};this.dygraph_.cascadeEvents_("layout",e),this.area_=t},t.prototype.setAnnotations=function(t){this.annotations=[];for(var e=this.dygraph_.getOption("xValueParser")||function(t){return t},a=0;a<t.length;a++){var i={};if(!t[a].xval&&void 0===t[a].x)return void console.error("Annotations must have an 'x' property");if(t[a].icon&&(!t[a].hasOwnProperty("width")||!t[a].hasOwnProperty("height")))return void console.error("Must set width and height when setting annotation.icon property");Dygraph.update(i,t[a]),i.xval||(i.xval=e(i.x)),this.annotations.push(i)}},t.prototype.setXTicks=function(t){this.xTicks_=t},t.prototype.setYAxes=function(t){this.yAxes_=t},t.prototype.evaluate=function(){this._xAxis={},this._evaluateLimits(),this._evaluateLineCharts(),this._evaluateLineTicks(),this._evaluateAnnotations()},t.prototype._evaluateLimits=function(){var t=this.dygraph_.xAxisRange();this._xAxis.minval=t[0],this._xAxis.maxval=t[1];var e=t[1]-t[0];this._xAxis.scale=0!==e?1/e:1,this.dygraph_.getOptionForAxis("logscale","x")&&(this._xAxis.xlogrange=Dygraph.log10(this._xAxis.maxval)-Dygraph.log10(this._xAxis.minval),this._xAxis.xlogscale=0!==this._xAxis.xlogrange?1/this._xAxis.xlogrange:1);for(var a=0;a<this.yAxes_.length;a++){var i=this.yAxes_[a];i.minyval=i.computedValueRange[0],i.maxyval=i.computedValueRange[1],i.yrange=i.maxyval-i.minyval,i.yscale=0!==i.yrange?1/i.yrange:1,this.dygraph_.getOption("logscale")&&(i.ylogrange=Dygraph.log10(i.maxyval)-Dygraph.log10(i.minyval),i.ylogscale=0!==i.ylogrange?1/i.ylogrange:1,(!isFinite(i.ylogrange)||isNaN(i.ylogrange))&&console.error("axis "+a+" of graph at "+i.g+" can't be displayed in log scale for range ["+i.minyval+" - "+i.maxyval+"]"))}},t.calcXNormal_=function(t,e,a){return a?(Dygraph.log10(t)-Dygraph.log10(e.minval))*e.xlogscale:(t-e.minval)*e.scale},t.calcYNormal_=function(t,e,a){if(a){var i=1-(Dygraph.log10(e)-Dygraph.log10(t.minyval))*t.ylogscale;return isFinite(i)?i:0/0}return 1-(e-t.minyval)*t.yscale},t.prototype._evaluateLineCharts=function(){for(var e=this.dygraph_.getOption("stackedGraph"),a=this.dygraph_.getOptionForAxis("logscale","x"),i=0;i<this.points.length;i++){for(var r=this.points[i],n=this.setNames[i],o=this.dygraph_.getOption("connectSeparatedPoints",n),s=this.dygraph_.axisPropertiesForSeries(n),l=this.dygraph_.attributes_.getForSeries("logscale",n),h=0;h<r.length;h++){var p=r[h];p.x=t.calcXNormal_(p.xval,this._xAxis,a);var g=p.yval;e&&(p.y_stacked=t.calcYNormal_(s,p.yval_stacked,l),null===g||isNaN(g)||(g=p.yval_stacked)),null===g&&(g=0/0,o||(p.yval=0/0)),p.y=t.calcYNormal_(s,g,l)}this.dygraph_.dataHandler_.onLineEvaluated(r,s,l)}},t.prototype._evaluateLineTicks=function(){var t,e,a,i;for(this.xticks=[],t=0;t<this.xTicks_.length;t++)e=this.xTicks_[t],a=e.label,i=this.dygraph_.toPercentXCoord(e.v),i>=0&&1>i&&this.xticks.push([i,a]);for(this.yticks=[],t=0;t<this.yAxes_.length;t++)for(var r=this.yAxes_[t],n=0;n<r.ticks.length;n++)e=r.ticks[n],a=e.label,i=this.dygraph_.toPercentYCoord(e.v,t),i>0&&1>=i&&this.yticks.push([t,i,a])},t.prototype._evaluateAnnotations=function(){var t,e={};for(t=0;t<this.annotations.length;t++){var a=this.annotations[t];e[a.xval+","+a.series]=a}if(this.annotated_points=[],this.annotations&&this.annotations.length)for(var i=0;i<this.points.length;i++){var r=this.points[i];for(t=0;t<r.length;t++){var n=r[t],o=n.xval+","+n.name;o in e&&(n.annotation=e[o],this.annotated_points.push(n))}}},t.prototype.removeAllDatasets=function(){delete this.points,delete this.setNames,delete this.setPointsLengths,delete this.setPointsOffsets,this.points=[],this.setNames=[],this.setPointsLengths=[],this.setPointsOffsets=[]},t}(),DygraphCanvasRenderer=function(){"use strict";var t=function(t,e,a,i){if(this.dygraph_=t,this.layout=i,this.element=e,this.elementContext=a,this.height=t.height_,this.width=t.width_,!this.isIE&&!Dygraph.isCanvasSupported(this.element))throw"Canvas is not supported.";if(this.area=i.getPlotArea(),this.dygraph_.isUsingExcanvas_)this._createIEClipArea();else if(!Dygraph.isAndroid()){var r=this.dygraph_.canvas_ctx_;r.beginPath(),r.rect(this.area.x,this.area.y,this.area.w,this.area.h),r.clip(),r=this.dygraph_.hidden_ctx_,r.beginPath(),r.rect(this.area.x,this.area.y,this.area.w,this.area.h),r.clip()}};return t.prototype.clear=function(){var t;if(this.isIE)try{this.clearDelay&&(this.clearDelay.cancel(),this.clearDelay=null),t=this.elementContext}catch(e){return}t=this.elementContext,t.clearRect(0,0,this.width,this.height)},t.prototype.render=function(){this._updatePoints(),this._renderLineChart()},t.prototype._createIEClipArea=function(){function t(t){if(0!==t.w&&0!==t.h){var i=document.createElement("div");i.className=e,i.style.backgroundColor=r,i.style.position="absolute",i.style.left=t.x+"px",i.style.top=t.y+"px",i.style.width=t.w+"px",i.style.height=t.h+"px",a.appendChild(i)}}for(var e="dygraph-clip-div",a=this.dygraph_.graphDiv,i=a.childNodes.length-1;i>=0;i--)a.childNodes[i].className==e&&a.removeChild(a.childNodes[i]);for(var r=document.bgColor,n=this.dygraph_.graphDiv;n!=document;){var o=n.currentStyle.backgroundColor;if(o&&"transparent"!=o){r=o;break}n=n.parentNode}var s=this.area;t({x:0,y:0,w:s.x,h:this.height}),t({x:s.x,y:0,w:this.width-s.x,h:s.y}),t({x:s.x+s.w,y:0,w:this.width-s.x-s.w,h:this.height}),t({x:s.x,y:s.y+s.h,w:this.width-s.x,h:this.height-s.h-s.y})},t._getIteratorPredicate=function(e){return e?t._predicateThatSkipsEmptyPoints:null},t._predicateThatSkipsEmptyPoints=function(t,e){return null!==t[e].yval},t._drawStyledLine=function(e,a,i,r,n,o,s){var l=e.dygraph,h=l.getBooleanOption("stepPlot",e.setName);Dygraph.isArrayLike(r)||(r=null);var p=l.getBooleanOption("drawGapEdgePoints",e.setName),g=e.points,d=e.setName,u=Dygraph.createIterator(g,0,g.length,t._getIteratorPredicate(l.getBooleanOption("connectSeparatedPoints",d))),c=r&&r.length>=2,y=e.drawingContext;y.save(),c&&y.installPattern(r);var _=t._drawSeries(e,u,i,s,n,p,h,a);t._drawPointsOnLine(e,_,o,a,s),c&&y.uninstallPattern(),y.restore()},t._drawSeries=function(t,e,a,i,r,n,o,s){var l,h,p=null,g=null,d=null,u=[],c=!0,y=t.drawingContext;y.beginPath(),y.strokeStyle=s,y.lineWidth=a;for(var _=e.array_,v=e.end_,f=e.predicate_,x=e.start_;v>x;x++){if(h=_[x],f){for(;v>x&&!f(_,x);)x++;if(x==v)break;h=_[x]}if(null===h.canvasy||h.canvasy!=h.canvasy)o&&null!==p&&(y.moveTo(p,g),y.lineTo(h.canvasx,g)),p=g=null;else{if(l=!1,n||!p){e.nextIdx_=x,e.next(),d=e.hasNext?e.peek.canvasy:null;var m=null===d||d!=d;l=!p&&m,n&&(!c&&!p||e.hasNext&&m)&&(l=!0)}null!==p?a&&(o&&(y.moveTo(p,g),y.lineTo(h.canvasx,g)),y.lineTo(h.canvasx,h.canvasy)):y.moveTo(h.canvasx,h.canvasy),(r||l)&&u.push([h.canvasx,h.canvasy,h.idx]),p=h.canvasx,g=h.canvasy}c=!1}return y.stroke(),u},t._drawPointsOnLine=function(t,e,a,i,r){for(var n=t.drawingContext,o=0;o<e.length;o++){var s=e[o];n.save(),a.call(t.dygraph,t.dygraph,t.setName,n,s[0],s[1],i,r,s[2]),n.restore()}},t.prototype._updatePoints=function(){for(var t=this.layout.points,e=t.length;e--;)for(var a=t[e],i=a.length;i--;){var r=a[i];r.canvasx=this.area.w*r.x+this.area.x,r.canvasy=this.area.h*r.y+this.area.y}},t.prototype._renderLineChart=function(t,e){var a,i,r=e||this.elementContext,n=this.layout.points,o=this.layout.setNames;this.colors=this.dygraph_.colorsMap_;var s=this.dygraph_.getOption("plotter"),l=s;Dygraph.isArrayLike(l)||(l=[l]);var h={};for(a=0;a<o.length;a++){i=o[a];var p=this.dygraph_.getOption("plotter",i);p!=s&&(h[i]=p)}for(a=0;a<l.length;a++)for(var g=l[a],d=a==l.length-1,u=0;u<n.length;u++)if(i=o[u],!t||i==t){var c=n[u],y=g;if(i in h){if(!d)continue;y=h[i]}var _=this.colors[i],v=this.dygraph_.getOption("strokeWidth",i);r.save(),r.strokeStyle=_,r.lineWidth=v,y({points:c,setName:i,drawingContext:r,color:_,strokeWidth:v,dygraph:this.dygraph_,axis:this.dygraph_.axisPropertiesForSeries(i),plotArea:this.area,seriesIndex:u,seriesCount:n.length,singleSeriesName:t,allSeriesPoints:n}),r.restore()}},t._Plotters={linePlotter:function(e){t._linePlotter(e)},fillPlotter:function(e){t._fillPlotter(e)},errorPlotter:function(e){t._errorPlotter(e)}},t._linePlotter=function(e){var a=e.dygraph,i=e.setName,r=e.strokeWidth,n=a.getNumericOption("strokeBorderWidth",i),o=a.getOption("drawPointCallback",i)||Dygraph.Circles.DEFAULT,s=a.getOption("strokePattern",i),l=a.getBooleanOption("drawPoints",i),h=a.getNumericOption("pointSize",i);n&&r&&t._drawStyledLine(e,a.getOption("strokeBorderColor",i),r+2*n,s,l,o,h),t._drawStyledLine(e,e.color,r,s,l,o,h)},t._errorPlotter=function(e){var a=e.dygraph,i=e.setName,r=a.getBooleanOption("errorBars")||a.getBooleanOption("customBars");if(r){var n=a.getBooleanOption("fillGraph",i);n&&console.warn("Can't use fillGraph option with error bars");var o,s=e.drawingContext,l=e.color,h=a.getNumericOption("fillAlpha",i),p=a.getBooleanOption("stepPlot",i),g=e.points,d=Dygraph.createIterator(g,0,g.length,t._getIteratorPredicate(a.getBooleanOption("connectSeparatedPoints",i))),u=0/0,c=0/0,y=[-1,-1],_=Dygraph.toRGB_(l),v="rgba("+_.r+","+_.g+","+_.b+","+h+")";s.fillStyle=v,s.beginPath();for(var f=function(t){return null===t||void 0===t||isNaN(t)};d.hasNext;){var x=d.next();!p&&f(x.y)||p&&!isNaN(c)&&f(c)?u=0/0:(o=[x.y_bottom,x.y_top],p&&(c=x.y),isNaN(o[0])&&(o[0]=x.y),isNaN(o[1])&&(o[1]=x.y),o[0]=e.plotArea.h*o[0]+e.plotArea.y,o[1]=e.plotArea.h*o[1]+e.plotArea.y,isNaN(u)||(p?(s.moveTo(u,y[0]),s.lineTo(x.canvasx,y[0]),s.lineTo(x.canvasx,y[1])):(s.moveTo(u,y[0]),s.lineTo(x.canvasx,o[0]),s.lineTo(x.canvasx,o[1])),s.lineTo(u,y[1]),s.closePath()),y=o,u=x.canvasx)}s.fill()}},t._fastCanvasProxy=function(t){var e=[],a=null,i=null,r=1,n=2,o=0,s=function(t){if(!(e.length<=1)){for(var a=e.length-1;a>0;a--){var i=e[a];if(i[0]==n){var o=e[a-1];o[1]==i[1]&&o[2]==i[2]&&e.splice(a,1)}}for(var a=0;a<e.length-1;){var i=e[a];i[0]==n&&e[a+1][0]==n?e.splice(a,1):a++}if(e.length>2&&!t){var s=0;e[0][0]==n&&s++;for(var l=null,h=null,a=s;a<e.length;a++){var i=e[a];if(i[0]==r)if(null===l&&null===h)l=a,h=a;else{var p=i[2];p<e[l][2]?l=a:p>e[h][2]&&(h=a)}}var g=e[l],d=e[h];e.splice(s,e.length-s),h>l?(e.push(g),e.push(d)):l>h?(e.push(d),e.push(g)):e.push(g)}}},l=function(a){s(a);for(var l=0,h=e.length;h>l;l++){var p=e[l];p[0]==r?t.lineTo(p[1],p[2]):p[0]==n&&t.moveTo(p[1],p[2])}e.length&&(i=e[e.length-1][1]),o+=e.length,e=[]},h=function(t,r,n){var o=Math.round(r);if(null===a||o!=a){var s=a-i>1,h=o-a>1,p=s||h;l(p),a=o}e.push([t,r,n])};return{moveTo:function(t,e){h(n,t,e)},lineTo:function(t,e){h(r,t,e)},stroke:function(){l(!0),t.stroke()},fill:function(){l(!0),t.fill()},beginPath:function(){l(!0),t.beginPath()},closePath:function(){l(!0),t.closePath()},_count:function(){return o}}},t._fillPlotter=function(e){if(!e.singleSeriesName&&0===e.seriesIndex){for(var a=e.dygraph,i=a.getLabels().slice(1),r=i.length;r>=0;r--)a.visibility()[r]||i.splice(r,1);var n=function(){for(var t=0;t<i.length;t++)if(a.getBooleanOption("fillGraph",i[t]))return!0;return!1}();if(n)for(var o,s,l=e.plotArea,h=e.allSeriesPoints,p=h.length,g=a.getNumericOption("fillAlpha"),d=a.getBooleanOption("stackedGraph"),u=a.getColors(),c={},y=function(t,e,a,i){if(t.lineTo(e,a),d)for(var r=i.length-1;r>=0;r--){var n=i[r];t.lineTo(n[0],n[1])}},_=p-1;_>=0;_--){var v=e.drawingContext,f=i[_];if(a.getBooleanOption("fillGraph",f)){var x=a.getBooleanOption("stepPlot",f),m=u[_],D=a.axisPropertiesForSeries(f),w=1+D.minyval*D.yscale;0>w?w=0:w>1&&(w=1),w=l.h*w+l.y;var A,b=h[_],T=Dygraph.createIterator(b,0,b.length,t._getIteratorPredicate(a.getBooleanOption("connectSeparatedPoints",f))),E=0/0,C=[-1,-1],L=Dygraph.toRGB_(m),P="rgba("+L.r+","+L.g+","+L.b+","+g+")";v.fillStyle=P,v.beginPath();var S,O=!0;(b.length>2*a.width_||Dygraph.FORCE_FAST_PROXY)&&(v=t._fastCanvasProxy(v));for(var M,R=[];T.hasNext;)if(M=T.next(),Dygraph.isOK(M.y)||x){if(d){if(!O&&S==M.xval)continue;O=!1,S=M.xval,o=c[M.canvasx];var F;F=void 0===o?w:s?o[0]:o,A=[M.canvasy,F],x?-1===C[0]?c[M.canvasx]=[M.canvasy,w]:c[M.canvasx]=[M.canvasy,C[0]]:c[M.canvasx]=M.canvasy}else A=isNaN(M.canvasy)&&x?[l.y+l.h,w]:[M.canvasy,w];isNaN(E)?(v.moveTo(M.canvasx,A[1]),v.lineTo(M.canvasx,A[0])):(x?(v.lineTo(M.canvasx,C[0]),v.lineTo(M.canvasx,A[0])):v.lineTo(M.canvasx,A[0]),d&&(R.push([E,C[1]]),R.push(s&&o?[M.canvasx,o[1]]:[M.canvasx,A[1]]))),C=A,E=M.canvasx}else y(v,E,C[1],R),R=[],E=0/0,null===M.y_stacked||isNaN(M.y_stacked)||(c[M.canvasx]=l.h*M.y_stacked+l.y);s=x,A&&M&&(y(v,M.canvasx,A[1],R),R=[]),v.fill()}}}},t}(),Dygraph=function(){"use strict";var t=function(t,e,a,i){this.is_initial_draw_=!0,this.readyFns_=[],void 0!==i?(console.warn("Using deprecated four-argument dygraph constructor"),this.__old_init__(t,e,a,i)):this.__init__(t,e,a)};return t.NAME="Dygraph",t.VERSION="1.1.1",t.__repr__=function(){return"["+t.NAME+" "+t.VERSION+"]"},t.toString=function(){return t.__repr__()},t.DEFAULT_ROLL_PERIOD=1,t.DEFAULT_WIDTH=480,t.DEFAULT_HEIGHT=320,t.ANIMATION_STEPS=12,t.ANIMATION_DURATION=200,t.KMB_LABELS=["K","M","B","T","Q"],t.KMG2_BIG_LABELS=["k","M","G","T","P","E","Z","Y"],t.KMG2_SMALL_LABELS=["m","u","n","p","f","a","z","y"],t.numberValueFormatter=function(e,a){var i=a("sigFigs");if(null!==i)return t.floatFormat(e,i);var r,n=a("digitsAfterDecimal"),o=a("maxNumberWidth"),s=a("labelsKMB"),l=a("labelsKMG2");if(r=0!==e&&(Math.abs(e)>=Math.pow(10,o)||Math.abs(e)<Math.pow(10,-n))?e.toExponential(n):""+t.round_(e,n),s||l){var h,p=[],g=[];s&&(h=1e3,p=t.KMB_LABELS),l&&(s&&console.warn("Setting both labelsKMB and labelsKMG2. Pick one!"),h=1024,p=t.KMG2_BIG_LABELS,g=t.KMG2_SMALL_LABELS);for(var d=Math.abs(e),u=t.pow(h,p.length),c=p.length-1;c>=0;c--,u/=h)if(d>=u){r=t.round_(e/u,n)+p[c];break}if(l){var y=String(e.toExponential()).split("e-");2===y.length&&y[1]>=3&&y[1]<=24&&(r=y[1]%3>0?t.round_(y[0]/t.pow(10,y[1]%3),n):Number(y[0]).toFixed(2),r+=g[Math.floor(y[1]/3)-1])}}return r},t.numberAxisLabelFormatter=function(e,a,i){return t.numberValueFormatter.call(this,e,i)},t.SHORT_MONTH_NAMES_=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],t.dateAxisLabelFormatter=function(e,a,i){var r=i("labelsUTC"),n=r?t.DateAccessorsUTC:t.DateAccessorsLocal,o=n.getFullYear(e),s=n.getMonth(e),l=n.getDate(e),h=n.getHours(e),p=n.getMinutes(e),g=n.getSeconds(e),d=n.getSeconds(e);if(a>=t.DECADAL)return""+o;if(a>=t.MONTHLY)return t.SHORT_MONTH_NAMES_[s]+"&#160;"+o;var u=3600*h+60*p+g+.001*d;return 0===u||a>=t.DAILY?t.zeropad(l)+"&#160;"+t.SHORT_MONTH_NAMES_[s]:t.hmsString_(h,p,g)},t.dateAxisFormatter=t.dateAxisLabelFormatter,t.dateValueFormatter=function(e,a){return t.dateString_(e,a("labelsUTC"))},t.Plotters=DygraphCanvasRenderer._Plotters,t.DEFAULT_ATTRS={highlightCircleSize:3,highlightSeriesOpts:null,highlightSeriesBackgroundAlpha:.5,labelsDivWidth:250,labelsDivStyles:{},labelsSeparateLines:!1,labelsShowZeroValues:!0,labelsKMB:!1,labelsKMG2:!1,showLabelsOnHighlight:!0,digitsAfterDecimal:2,maxNumberWidth:6,sigFigs:null,strokeWidth:1,strokeBorderWidth:0,strokeBorderColor:"white",axisTickSize:3,axisLabelFontSize:14,rightGap:5,showRoller:!1,xValueParser:t.dateParser,delimiter:",",sigma:2,errorBars:!1,fractions:!1,wilsonInterval:!0,customBars:!1,fillGraph:!1,fillAlpha:.15,connectSeparatedPoints:!1,stackedGraph:!1,stackedGraphNaNFill:"all",hideOverlayOnMouseOut:!0,legend:"onmouseover",stepPlot:!1,avoidMinZero:!1,xRangePad:0,yRangePad:null,drawAxesAtZero:!1,titleHeight:28,xLabelHeight:18,yLabelWidth:18,drawXAxis:!0,drawYAxis:!0,axisLineColor:"black",axisLineWidth:.3,gridLineWidth:.3,axisLabelColor:"black",axisLabelWidth:50,drawYGrid:!0,drawXGrid:!0,gridLineColor:"rgb(128,128,128)",interactionModel:null,animatedZooms:!1,showRangeSelector:!1,rangeSelectorHeight:40,rangeSelectorPlotStrokeColor:"#808FAB",rangeSelectorPlotFillColor:"#A7B1C4",showInRangeSelector:null,plotter:[t.Plotters.fillPlotter,t.Plotters.errorPlotter,t.Plotters.linePlotter],plugins:[],axes:{x:{pixelsPerLabel:70,axisLabelWidth:60,axisLabelFormatter:t.dateAxisLabelFormatter,valueFormatter:t.dateValueFormatter,drawGrid:!0,drawAxis:!0,independentTicks:!0,ticker:null},y:{axisLabelWidth:50,pixelsPerLabel:30,valueFormatter:t.numberValueFormatter,axisLabelFormatter:t.numberAxisLabelFormatter,drawGrid:!0,drawAxis:!0,independentTicks:!0,ticker:null},y2:{axisLabelWidth:50,pixelsPerLabel:30,valueFormatter:t.numberValueFormatter,axisLabelFormatter:t.numberAxisLabelFormatter,drawAxis:!0,drawGrid:!1,independentTicks:!1,ticker:null}}},t.HORIZONTAL=1,t.VERTICAL=2,t.PLUGINS=[],t.addedAnnotationCSS=!1,t.prototype.__old_init__=function(e,a,i,r){if(null!==i){for(var n=["Date"],o=0;o<i.length;o++)n.push(i[o]);t.update(r,{labels:n})}this.__init__(e,a,r)},t.prototype.__init__=function(e,a,i){if(/MSIE/.test(navigator.userAgent)&&!window.opera&&"undefined"!=typeof G_vmlCanvasManager&&"complete"!=document.readyState){var r=this;return void setTimeout(function(){r.__init__(e,a,i)},100)}if((null===i||void 0===i)&&(i={}),i=t.mapLegacyOptions_(i),"string"==typeof e&&(e=document.getElementById(e)),!e)return void console.error("Constructing dygraph with a non-existent div!");this.isUsingExcanvas_="undefined"!=typeof G_vmlCanvasManager,this.maindiv_=e,this.file_=a,this.rollPeriod_=i.rollPeriod||t.DEFAULT_ROLL_PERIOD,this.previousVerticalX_=-1,this.fractions_=i.fractions||!1,this.dateWindow_=i.dateWindow||null,this.annotations_=[],this.zoomed_x_=!1,this.zoomed_y_=!1,e.innerHTML="",""===e.style.width&&i.width&&(e.style.width=i.width+"px"),""===e.style.height&&i.height&&(e.style.height=i.height+"px"),""===e.style.height&&0===e.clientHeight&&(e.style.height=t.DEFAULT_HEIGHT+"px",""===e.style.width&&(e.style.width=t.DEFAULT_WIDTH+"px")),this.width_=e.clientWidth||i.width||0,this.height_=e.clientHeight||i.height||0,i.stackedGraph&&(i.fillGraph=!0),this.user_attrs_={},t.update(this.user_attrs_,i),this.attrs_={},t.updateDeep(this.attrs_,t.DEFAULT_ATTRS),this.boundaryIds_=[],this.setIndexByName_={},this.datasetIndex_=[],this.registeredEvents_=[],this.eventListeners_={},this.attributes_=new DygraphOptions(this),this.createInterface_(),this.plugins_=[];for(var n=t.PLUGINS.concat(this.getOption("plugins")),o=0;o<n.length;o++){var s,l=n[o];s="undefined"!=typeof l.activate?l:new l;var h={plugin:s,events:{},options:{},pluginOptions:{}},p=s.activate(this);for(var g in p)p.hasOwnProperty(g)&&(h.events[g]=p[g]);this.plugins_.push(h)}for(var o=0;o<this.plugins_.length;o++){var d=this.plugins_[o];for(var g in d.events)if(d.events.hasOwnProperty(g)){var u=d.events[g],c=[d.plugin,u];g in this.eventListeners_?this.eventListeners_[g].push(c):this.eventListeners_[g]=[c]}}this.createDragInterface_(),this.start_()},t.prototype.cascadeEvents_=function(e,a){if(!(e in this.eventListeners_))return!1;var i={dygraph:this,cancelable:!1,defaultPrevented:!1,preventDefault:function(){if(!i.cancelable)throw"Cannot call preventDefault on non-cancelable event.";i.defaultPrevented=!0},propagationStopped:!1,stopPropagation:function(){i.propagationStopped=!0}};t.update(i,a);var r=this.eventListeners_[e];if(r)for(var n=r.length-1;n>=0;n--){var o=r[n][0],s=r[n][1];if(s.call(o,i),i.propagationStopped)break}return i.defaultPrevented},t.prototype.getPluginInstance_=function(t){for(var e=0;e<this.plugins_.length;e++){var a=this.plugins_[e];if(a.plugin instanceof t)return a.plugin}return null},t.prototype.isZoomed=function(t){if(null===t||void 0===t)return this.zoomed_x_||this.zoomed_y_;if("x"===t)return this.zoomed_x_;if("y"===t)return this.zoomed_y_;throw"axis parameter is ["+t+"] must be null, 'x' or 'y'."},t.prototype.toString=function(){var t=this.maindiv_,e=t&&t.id?t.id:t;return"[Dygraph "+e+"]"},t.prototype.attr_=function(t,e){return e?this.attributes_.getForSeries(t,e):this.attributes_.get(t)},t.prototype.getOption=function(t,e){return this.attr_(t,e)},t.prototype.getNumericOption=function(t,e){return this.getOption(t,e)},t.prototype.getStringOption=function(t,e){return this.getOption(t,e)},t.prototype.getBooleanOption=function(t,e){return this.getOption(t,e)},t.prototype.getFunctionOption=function(t,e){return this.getOption(t,e)},t.prototype.getOptionForAxis=function(t,e){return this.attributes_.getForAxis(t,e)},t.prototype.optionsViewForAxis_=function(t){var e=this;return function(a){var i=e.user_attrs_.axes;return i&&i[t]&&i[t].hasOwnProperty(a)?i[t][a]:"x"===t&&"logscale"===a?!1:"undefined"!=typeof e.user_attrs_[a]?e.user_attrs_[a]:(i=e.attrs_.axes,i&&i[t]&&i[t].hasOwnProperty(a)?i[t][a]:"y"==t&&e.axes_[0].hasOwnProperty(a)?e.axes_[0][a]:"y2"==t&&e.axes_[1].hasOwnProperty(a)?e.axes_[1][a]:e.attr_(a))}},t.prototype.rollPeriod=function(){return this.rollPeriod_},t.prototype.xAxisRange=function(){return this.dateWindow_?this.dateWindow_:this.xAxisExtremes()},t.prototype.xAxisExtremes=function(){var t=this.getNumericOption("xRangePad")/this.plotter_.area.w;if(0===this.numRows())return[0-t,1+t];var e=this.rawData_[0][0],a=this.rawData_[this.rawData_.length-1][0];if(t){var i=a-e;e-=i*t,a+=i*t}return[e,a]},t.prototype.yAxisRange=function(t){if("undefined"==typeof t&&(t=0),0>t||t>=this.axes_.length)return null;var e=this.axes_[t];return[e.computedValueRange[0],e.computedValueRange[1]]},t.prototype.yAxisRanges=function(){for(var t=[],e=0;e<this.axes_.length;e++)t.push(this.yAxisRange(e));return t},t.prototype.toDomCoords=function(t,e,a){return[this.toDomXCoord(t),this.toDomYCoord(e,a)]},t.prototype.toDomXCoord=function(t){if(null===t)return null;var e=this.plotter_.area,a=this.xAxisRange();return e.x+(t-a[0])/(a[1]-a[0])*e.w},t.prototype.toDomYCoord=function(t,e){var a=this.toPercentYCoord(t,e);if(null===a)return null;var i=this.plotter_.area;return i.y+a*i.h},t.prototype.toDataCoords=function(t,e,a){return[this.toDataXCoord(t),this.toDataYCoord(e,a)]},t.prototype.toDataXCoord=function(e){if(null===e)return null;var a=this.plotter_.area,i=this.xAxisRange();if(this.attributes_.getForAxis("logscale","x")){var r=(e-a.x)/a.w,n=t.log10(i[0]),o=t.log10(i[1]),s=n+r*(o-n),l=Math.pow(t.LOG_SCALE,s);return l}return i[0]+(e-a.x)/a.w*(i[1]-i[0])},t.prototype.toDataYCoord=function(e,a){if(null===e)return null;var i=this.plotter_.area,r=this.yAxisRange(a);if("undefined"==typeof a&&(a=0),this.attributes_.getForAxis("logscale",a)){var n=(e-i.y)/i.h,o=t.log10(r[0]),s=t.log10(r[1]),l=s-n*(s-o),h=Math.pow(t.LOG_SCALE,l);return h}return r[0]+(i.y+i.h-e)/i.h*(r[1]-r[0])},t.prototype.toPercentYCoord=function(e,a){if(null===e)return null;"undefined"==typeof a&&(a=0);var i,r=this.yAxisRange(a),n=this.attributes_.getForAxis("logscale",a);if(n){var o=t.log10(r[0]),s=t.log10(r[1]);i=(s-t.log10(e))/(s-o)}else i=(r[1]-e)/(r[1]-r[0]);return i},t.prototype.toPercentXCoord=function(e){if(null===e)return null;var a,i=this.xAxisRange(),r=this.attributes_.getForAxis("logscale","x");if(r===!0){var n=t.log10(i[0]),o=t.log10(i[1]);a=(t.log10(e)-n)/(o-n)}else a=(e-i[0])/(i[1]-i[0]);return a},t.prototype.numColumns=function(){return this.rawData_?this.rawData_[0]?this.rawData_[0].length:this.attr_("labels").length:0},t.prototype.numRows=function(){return this.rawData_?this.rawData_.length:0},t.prototype.getValue=function(t,e){return 0>t||t>this.rawData_.length?null:0>e||e>this.rawData_[t].length?null:this.rawData_[t][e]},t.prototype.createInterface_=function(){var e=this.maindiv_;this.graphDiv=document.createElement("div"),this.graphDiv.style.textAlign="left",this.graphDiv.style.position="relative",e.appendChild(this.graphDiv),this.canvas_=t.createCanvas(),this.canvas_.style.position="absolute",this.hidden_=this.createPlotKitCanvas_(this.canvas_),this.canvas_ctx_=t.getContext(this.canvas_),this.hidden_ctx_=t.getContext(this.hidden_),this.resizeElements_(),this.graphDiv.appendChild(this.hidden_),this.graphDiv.appendChild(this.canvas_),this.mouseEventElement_=this.createMouseEventElement_(),this.layout_=new DygraphLayout(this);var a=this;this.mouseMoveHandler_=function(t){a.mouseMove_(t)},this.mouseOutHandler_=function(e){var i=e.target||e.fromElement,r=e.relatedTarget||e.toElement;t.isNodeContainedBy(i,a.graphDiv)&&!t.isNodeContainedBy(r,a.graphDiv)&&a.mouseOut_(e)},this.addAndTrackEvent(window,"mouseout",this.mouseOutHandler_),this.addAndTrackEvent(this.mouseEventElement_,"mousemove",this.mouseMoveHandler_),this.resizeHandler_||(this.resizeHandler_=function(t){a.resize()},this.addAndTrackEvent(window,"resize",this.resizeHandler_))},t.prototype.resizeElements_=function(){this.graphDiv.style.width=this.width_+"px",this.graphDiv.style.height=this.height_+"px";var e=t.getContextPixelRatio(this.canvas_ctx_);this.canvas_.width=this.width_*e,this.canvas_.height=this.height_*e,this.canvas_.style.width=this.width_+"px",this.canvas_.style.height=this.height_+"px",1!==e&&this.canvas_ctx_.scale(e,e);var a=t.getContextPixelRatio(this.hidden_ctx_);this.hidden_.width=this.width_*a,this.hidden_.height=this.height_*a,this.hidden_.style.width=this.width_+"px",this.hidden_.style.height=this.height_+"px",1!==a&&this.hidden_ctx_.scale(a,a)},t.prototype.destroy=function(){this.canvas_ctx_.restore(),this.hidden_ctx_.restore();for(var e=this.plugins_.length-1;e>=0;e--){var a=this.plugins_.pop();a.plugin.destroy&&a.plugin.destroy()}var i=function(t){for(;t.hasChildNodes();)i(t.firstChild),t.removeChild(t.firstChild)};this.removeTrackedEvents_(),t.removeEvent(window,"mouseout",this.mouseOutHandler_),t.removeEvent(this.mouseEventElement_,"mousemove",this.mouseMoveHandler_),t.removeEvent(window,"resize",this.resizeHandler_),this.resizeHandler_=null,i(this.maindiv_);var r=function(t){for(var e in t)"object"==typeof t[e]&&(t[e]=null)};r(this.layout_),r(this.plotter_),r(this)},t.prototype.createPlotKitCanvas_=function(e){var a=t.createCanvas();return a.style.position="absolute",a.style.top=e.style.top,a.style.left=e.style.left,a.width=this.width_,a.height=this.height_,a.style.width=this.width_+"px",a.style.height=this.height_+"px",a},t.prototype.createMouseEventElement_=function(){if(this.isUsingExcanvas_){var t=document.createElement("div");return t.style.position="absolute",t.style.backgroundColor="white",t.style.filter="alpha(opacity=0)",t.style.width=this.width_+"px",t.style.height=this.height_+"px",this.graphDiv.appendChild(t),t}return this.canvas_},t.prototype.setColors_=function(){var e=this.getLabels(),a=e.length-1;this.colors_=[],this.colorsMap_={};for(var i=this.getNumericOption("colorSaturation")||1,r=this.getNumericOption("colorValue")||.5,n=Math.ceil(a/2),o=this.getOption("colors"),s=this.visibility(),l=0;a>l;l++)if(s[l]){
var h=e[l+1],p=this.attributes_.getForSeries("color",h);if(!p)if(o)p=o[l%o.length];else{var g=l%2?n+(l+1)/2:Math.ceil((l+1)/2),d=1*g/(1+a);p=t.hsvToRGB(d,i,r)}this.colors_.push(p),this.colorsMap_[h]=p}},t.prototype.getColors=function(){return this.colors_},t.prototype.getPropertiesForSeries=function(t){for(var e=-1,a=this.getLabels(),i=1;i<a.length;i++)if(a[i]==t){e=i;break}return-1==e?null:{name:t,column:e,visible:this.visibility()[e-1],color:this.colorsMap_[t],axis:1+this.attributes_.axisForSeries(t)}},t.prototype.createRollInterface_=function(){this.roller_||(this.roller_=document.createElement("input"),this.roller_.type="text",this.roller_.style.display="none",this.graphDiv.appendChild(this.roller_));var t=this.getBooleanOption("showRoller")?"block":"none",e=this.plotter_.area,a={position:"absolute",zIndex:10,top:e.y+e.h-25+"px",left:e.x+1+"px",display:t};this.roller_.size="2",this.roller_.value=this.rollPeriod_;for(var i in a)a.hasOwnProperty(i)&&(this.roller_.style[i]=a[i]);var r=this;this.roller_.onchange=function(){r.adjustRoll(r.roller_.value)}},t.prototype.createDragInterface_=function(){var e={isZooming:!1,isPanning:!1,is2DPan:!1,dragStartX:null,dragStartY:null,dragEndX:null,dragEndY:null,dragDirection:null,prevEndX:null,prevEndY:null,prevDragDirection:null,cancelNextDblclick:!1,initialLeftmostDate:null,xUnitsPerPixel:null,dateRange:null,px:0,py:0,boundedDates:null,boundedValues:null,tarp:new t.IFrameTarp,initializeMouseDown:function(e,a,i){e.preventDefault?e.preventDefault():(e.returnValue=!1,e.cancelBubble=!0);var r=t.findPos(a.canvas_);i.px=r.x,i.py=r.y,i.dragStartX=t.dragGetX_(e,i),i.dragStartY=t.dragGetY_(e,i),i.cancelNextDblclick=!1,i.tarp.cover()},destroy:function(){var t=this;if((t.isZooming||t.isPanning)&&(t.isZooming=!1,t.dragStartX=null,t.dragStartY=null),t.isPanning){t.isPanning=!1,t.draggingDate=null,t.dateRange=null;for(var e=0;e<i.axes_.length;e++)delete i.axes_[e].draggingValue,delete i.axes_[e].dragValueRange}t.tarp.uncover()}},a=this.getOption("interactionModel"),i=this,r=function(t){return function(a){t(a,i,e)}};for(var n in a)a.hasOwnProperty(n)&&this.addAndTrackEvent(this.mouseEventElement_,n,r(a[n]));if(!a.willDestroyContextMyself){var o=function(t){e.destroy()};this.addAndTrackEvent(document,"mouseup",o)}},t.prototype.drawZoomRect_=function(e,a,i,r,n,o,s,l){var h=this.canvas_ctx_;o==t.HORIZONTAL?h.clearRect(Math.min(a,s),this.layout_.getPlotArea().y,Math.abs(a-s),this.layout_.getPlotArea().h):o==t.VERTICAL&&h.clearRect(this.layout_.getPlotArea().x,Math.min(r,l),this.layout_.getPlotArea().w,Math.abs(r-l)),e==t.HORIZONTAL?i&&a&&(h.fillStyle="rgba(128,128,128,0.33)",h.fillRect(Math.min(a,i),this.layout_.getPlotArea().y,Math.abs(i-a),this.layout_.getPlotArea().h)):e==t.VERTICAL&&n&&r&&(h.fillStyle="rgba(128,128,128,0.33)",h.fillRect(this.layout_.getPlotArea().x,Math.min(r,n),this.layout_.getPlotArea().w,Math.abs(n-r))),this.isUsingExcanvas_&&(this.currentZoomRectArgs_=[e,a,i,r,n,0,0,0])},t.prototype.clearZoomRect_=function(){this.currentZoomRectArgs_=null,this.canvas_ctx_.clearRect(0,0,this.width_,this.height_)},t.prototype.doZoomX_=function(t,e){this.currentZoomRectArgs_=null;var a=this.toDataXCoord(t),i=this.toDataXCoord(e);this.doZoomXDates_(a,i)},t.prototype.doZoomXDates_=function(t,e){var a=this.xAxisRange(),i=[t,e];this.zoomed_x_=!0;var r=this;this.doAnimatedZoom(a,i,null,null,function(){r.getFunctionOption("zoomCallback")&&r.getFunctionOption("zoomCallback").call(r,t,e,r.yAxisRanges())})},t.prototype.doZoomY_=function(t,e){this.currentZoomRectArgs_=null;for(var a=this.yAxisRanges(),i=[],r=0;r<this.axes_.length;r++){var n=this.toDataYCoord(t,r),o=this.toDataYCoord(e,r);i.push([o,n])}this.zoomed_y_=!0;var s=this;this.doAnimatedZoom(null,null,a,i,function(){if(s.getFunctionOption("zoomCallback")){var t=s.xAxisRange();s.getFunctionOption("zoomCallback").call(s,t[0],t[1],s.yAxisRanges())}})},t.zoomAnimationFunction=function(t,e){var a=1.5;return(1-Math.pow(a,-t))/(1-Math.pow(a,-e))},t.prototype.resetZoom=function(){var t=!1,e=!1,a=!1;null!==this.dateWindow_&&(t=!0,e=!0);for(var i=0;i<this.axes_.length;i++)"undefined"!=typeof this.axes_[i].valueWindow&&null!==this.axes_[i].valueWindow&&(t=!0,a=!0);if(this.clearSelection(),t){this.zoomed_x_=!1,this.zoomed_y_=!1;var r=this.rawData_[0][0],n=this.rawData_[this.rawData_.length-1][0];if(!this.getBooleanOption("animatedZooms")){for(this.dateWindow_=null,i=0;i<this.axes_.length;i++)null!==this.axes_[i].valueWindow&&delete this.axes_[i].valueWindow;return this.drawGraph_(),void(this.getFunctionOption("zoomCallback")&&this.getFunctionOption("zoomCallback").call(this,r,n,this.yAxisRanges()))}var o=null,s=null,l=null,h=null;if(e&&(o=this.xAxisRange(),s=[r,n]),a){l=this.yAxisRanges();var p=this.gatherDatasets_(this.rolledSeries_,null),g=p.extremes;for(this.computeYAxisRanges_(g),h=[],i=0;i<this.axes_.length;i++){var d=this.axes_[i];h.push(null!==d.valueRange&&void 0!==d.valueRange?d.valueRange:d.extremeRange)}}var u=this;this.doAnimatedZoom(o,s,l,h,function(){u.dateWindow_=null;for(var t=0;t<u.axes_.length;t++)null!==u.axes_[t].valueWindow&&delete u.axes_[t].valueWindow;u.getFunctionOption("zoomCallback")&&u.getFunctionOption("zoomCallback").call(u,r,n,u.yAxisRanges())})}},t.prototype.doAnimatedZoom=function(e,a,i,r,n){var o,s,l=this.getBooleanOption("animatedZooms")?t.ANIMATION_STEPS:1,h=[],p=[];if(null!==e&&null!==a)for(o=1;l>=o;o++)s=t.zoomAnimationFunction(o,l),h[o-1]=[e[0]*(1-s)+s*a[0],e[1]*(1-s)+s*a[1]];if(null!==i&&null!==r)for(o=1;l>=o;o++){s=t.zoomAnimationFunction(o,l);for(var g=[],d=0;d<this.axes_.length;d++)g.push([i[d][0]*(1-s)+s*r[d][0],i[d][1]*(1-s)+s*r[d][1]]);p[o-1]=g}var u=this;t.repeatAndCleanup(function(t){if(p.length)for(var e=0;e<u.axes_.length;e++){var a=p[t][e];u.axes_[e].valueWindow=[a[0],a[1]]}h.length&&(u.dateWindow_=h[t]),u.drawGraph_()},l,t.ANIMATION_DURATION/l,n)},t.prototype.getArea=function(){return this.plotter_.area},t.prototype.eventToDomCoords=function(e){if(e.offsetX&&e.offsetY)return[e.offsetX,e.offsetY];var a=t.findPos(this.mouseEventElement_),i=t.pageX(e)-a.x,r=t.pageY(e)-a.y;return[i,r]},t.prototype.findClosestRow=function(e){for(var a=1/0,i=-1,r=this.layout_.points,n=0;n<r.length;n++)for(var o=r[n],s=o.length,l=0;s>l;l++){var h=o[l];if(t.isValidPoint(h,!0)){var p=Math.abs(h.canvasx-e);a>p&&(a=p,i=h.idx)}}return i},t.prototype.findClosestPoint=function(e,a){for(var i,r,n,o,s,l,h,p=1/0,g=this.layout_.points.length-1;g>=0;--g)for(var d=this.layout_.points[g],u=0;u<d.length;++u)o=d[u],t.isValidPoint(o)&&(r=o.canvasx-e,n=o.canvasy-a,i=r*r+n*n,p>i&&(p=i,s=o,l=g,h=o.idx));var c=this.layout_.setNames[l];return{row:h,seriesName:c,point:s}},t.prototype.findStackedPoint=function(e,a){for(var i,r,n=this.findClosestRow(e),o=0;o<this.layout_.points.length;++o){var s=this.getLeftBoundary_(o),l=n-s,h=this.layout_.points[o];if(!(l>=h.length)){var p=h[l];if(t.isValidPoint(p)){var g=p.canvasy;if(e>p.canvasx&&l+1<h.length){var d=h[l+1];if(t.isValidPoint(d)){var u=d.canvasx-p.canvasx;if(u>0){var c=(e-p.canvasx)/u;g+=c*(d.canvasy-p.canvasy)}}}else if(e<p.canvasx&&l>0){var y=h[l-1];if(t.isValidPoint(y)){var u=p.canvasx-y.canvasx;if(u>0){var c=(p.canvasx-e)/u;g+=c*(y.canvasy-p.canvasy)}}}(0===o||a>g)&&(i=p,r=o)}}}var _=this.layout_.setNames[r];return{row:n,seriesName:_,point:i}},t.prototype.mouseMove_=function(t){var e=this.layout_.points;if(void 0!==e&&null!==e){var a=this.eventToDomCoords(t),i=a[0],r=a[1],n=this.getOption("highlightSeriesOpts"),o=!1;if(n&&!this.isSeriesLocked()){var s;s=this.getBooleanOption("stackedGraph")?this.findStackedPoint(i,r):this.findClosestPoint(i,r),o=this.setSelection(s.row,s.seriesName)}else{var l=this.findClosestRow(i);o=this.setSelection(l)}var h=this.getFunctionOption("highlightCallback");h&&o&&h.call(this,t,this.lastx_,this.selPoints_,this.lastRow_,this.highlightSet_)}},t.prototype.getLeftBoundary_=function(t){if(this.boundaryIds_[t])return this.boundaryIds_[t][0];for(var e=0;e<this.boundaryIds_.length;e++)if(void 0!==this.boundaryIds_[e])return this.boundaryIds_[e][0];return 0},t.prototype.animateSelection_=function(e){var a=10,i=30;void 0===this.fadeLevel&&(this.fadeLevel=0),void 0===this.animateId&&(this.animateId=0);var r=this.fadeLevel,n=0>e?r:a-r;if(0>=n)return void(this.fadeLevel&&this.updateSelection_(1));var o=++this.animateId,s=this;t.repeatAndCleanup(function(t){s.animateId==o&&(s.fadeLevel+=e,0===s.fadeLevel?s.clearSelection():s.updateSelection_(s.fadeLevel/a))},n,i,function(){})},t.prototype.updateSelection_=function(e){this.cascadeEvents_("select",{selectedRow:this.lastRow_,selectedX:this.lastx_,selectedPoints:this.selPoints_});var a,i=this.canvas_ctx_;if(this.getOption("highlightSeriesOpts")){i.clearRect(0,0,this.width_,this.height_);var r=1-this.getNumericOption("highlightSeriesBackgroundAlpha");if(r){var n=!0;if(n){if(void 0===e)return void this.animateSelection_(1);r*=e}i.fillStyle="rgba(255,255,255,"+r+")",i.fillRect(0,0,this.width_,this.height_)}this.plotter_._renderLineChart(this.highlightSet_,i)}else if(this.previousVerticalX_>=0){var o=0,s=this.attr_("labels");for(a=1;a<s.length;a++){var l=this.getNumericOption("highlightCircleSize",s[a]);l>o&&(o=l)}var h=this.previousVerticalX_;i.clearRect(h-o-1,0,2*o+2,this.height_)}if(this.isUsingExcanvas_&&this.currentZoomRectArgs_&&t.prototype.drawZoomRect_.apply(this,this.currentZoomRectArgs_),this.selPoints_.length>0){var p=this.selPoints_[0].canvasx;for(i.save(),a=0;a<this.selPoints_.length;a++){var g=this.selPoints_[a];if(t.isOK(g.canvasy)){var d=this.getNumericOption("highlightCircleSize",g.name),u=this.getFunctionOption("drawHighlightPointCallback",g.name),c=this.plotter_.colors[g.name];u||(u=t.Circles.DEFAULT),i.lineWidth=this.getNumericOption("strokeWidth",g.name),i.strokeStyle=c,i.fillStyle=c,u.call(this,this,g.name,i,p,g.canvasy,c,d,g.idx)}}i.restore(),this.previousVerticalX_=p}},t.prototype.setSelection=function(t,e,a){this.selPoints_=[];var i=!1;if(t!==!1&&t>=0){t!=this.lastRow_&&(i=!0),this.lastRow_=t;for(var r=0;r<this.layout_.points.length;++r){var n=this.layout_.points[r],o=t-this.getLeftBoundary_(r);if(o<n.length&&n[o].idx==t){var s=n[o];null!==s.yval&&this.selPoints_.push(s)}else for(var l=0;l<n.length;++l){var s=n[l];if(s.idx==t){null!==s.yval&&this.selPoints_.push(s);break}}}}else this.lastRow_>=0&&(i=!0),this.lastRow_=-1;return this.selPoints_.length?this.lastx_=this.selPoints_[0].xval:this.lastx_=-1,void 0!==e&&(this.highlightSet_!==e&&(i=!0),this.highlightSet_=e),void 0!==a&&(this.lockedSet_=a),i&&this.updateSelection_(void 0),i},t.prototype.mouseOut_=function(t){this.getFunctionOption("unhighlightCallback")&&this.getFunctionOption("unhighlightCallback").call(this,t),this.getBooleanOption("hideOverlayOnMouseOut")&&!this.lockedSet_&&this.clearSelection()},t.prototype.clearSelection=function(){return this.cascadeEvents_("deselect",{}),this.lockedSet_=!1,this.fadeLevel?void this.animateSelection_(-1):(this.canvas_ctx_.clearRect(0,0,this.width_,this.height_),this.fadeLevel=0,this.selPoints_=[],this.lastx_=-1,this.lastRow_=-1,void(this.highlightSet_=null))},t.prototype.getSelection=function(){if(!this.selPoints_||this.selPoints_.length<1)return-1;for(var t=0;t<this.layout_.points.length;t++)for(var e=this.layout_.points[t],a=0;a<e.length;a++)if(e[a].x==this.selPoints_[0].x)return e[a].idx;return-1},t.prototype.getHighlightSeries=function(){return this.highlightSet_},t.prototype.isSeriesLocked=function(){return this.lockedSet_},t.prototype.loadedEvent_=function(t){this.rawData_=this.parseCSV_(t),this.cascadeDataDidUpdateEvent_(),this.predraw_()},t.prototype.addXTicks_=function(){var t;t=this.dateWindow_?[this.dateWindow_[0],this.dateWindow_[1]]:this.xAxisExtremes();var e=this.optionsViewForAxis_("x"),a=e("ticker")(t[0],t[1],this.plotter_.area.w,e,this);this.layout_.setXTicks(a)},t.prototype.getHandlerClass_=function(){var e;return e=this.attr_("dataHandler")?this.attr_("dataHandler"):this.fractions_?this.getBooleanOption("errorBars")?t.DataHandlers.FractionsBarsHandler:t.DataHandlers.DefaultFractionHandler:this.getBooleanOption("customBars")?t.DataHandlers.CustomBarsHandler:this.getBooleanOption("errorBars")?t.DataHandlers.ErrorBarsHandler:t.DataHandlers.DefaultHandler},t.prototype.predraw_=function(){var t=new Date;this.dataHandler_=new(this.getHandlerClass_()),this.layout_.computePlotArea(),this.computeYAxes_(),this.is_initial_draw_||(this.canvas_ctx_.restore(),this.hidden_ctx_.restore()),this.canvas_ctx_.save(),this.hidden_ctx_.save(),this.plotter_=new DygraphCanvasRenderer(this,this.hidden_,this.hidden_ctx_,this.layout_),this.createRollInterface_(),this.cascadeEvents_("predraw"),this.rolledSeries_=[null];for(var e=1;e<this.numColumns();e++){var a=this.dataHandler_.extractSeries(this.rawData_,e,this.attributes_);this.rollPeriod_>1&&(a=this.dataHandler_.rollingAverage(a,this.rollPeriod_,this.attributes_)),this.rolledSeries_.push(a)}this.drawGraph_();var i=new Date;this.drawingTimeMs_=i-t},t.PointType=void 0,t.stackPoints_=function(t,e,a,i){for(var r=null,n=null,o=null,s=-1,l=function(e){if(!(s>=e))for(var a=e;a<t.length;++a)if(o=null,!isNaN(t[a].yval)&&null!==t[a].yval){s=a,o=t[a];break}},h=0;h<t.length;++h){var p=t[h],g=p.xval;void 0===e[g]&&(e[g]=0);var d=p.yval;isNaN(d)||null===d?"none"==i?d=0:(l(h),d=n&&o&&"none"!=i?n.yval+(o.yval-n.yval)*((g-n.xval)/(o.xval-n.xval)):n&&"all"==i?n.yval:o&&"all"==i?o.yval:0):n=p;var u=e[g];r!=g&&(u+=d,e[g]=u),r=g,p.yval_stacked=u,u>a[1]&&(a[1]=u),u<a[0]&&(a[0]=u)}},t.prototype.gatherDatasets_=function(e,a){var i,r,n,o,s,l,h=[],p=[],g=[],d={},u=e.length-1;for(i=u;i>=1;i--)if(this.visibility()[i-1]){if(a){l=e[i];var c=a[0],y=a[1];for(n=null,o=null,r=0;r<l.length;r++)l[r][0]>=c&&null===n&&(n=r),l[r][0]<=y&&(o=r);null===n&&(n=0);for(var _=n,v=!0;v&&_>0;)_--,v=null===l[_][1];null===o&&(o=l.length-1);var f=o;for(v=!0;v&&f<l.length-1;)f++,v=null===l[f][1];_!==n&&(n=_),f!==o&&(o=f),h[i-1]=[n,o],l=l.slice(n,o+1)}else l=e[i],h[i-1]=[0,l.length-1];var x=this.attr_("labels")[i],m=this.dataHandler_.getExtremeYValues(l,a,this.getBooleanOption("stepPlot",x)),D=this.dataHandler_.seriesToPoints(l,x,h[i-1][0]);this.getBooleanOption("stackedGraph")&&(s=this.attributes_.axisForSeries(x),void 0===g[s]&&(g[s]=[]),t.stackPoints_(D,g[s],m,this.getBooleanOption("stackedGraphNaNFill"))),d[x]=m,p[i]=D}return{points:p,extremes:d,boundaryIds:h}},t.prototype.drawGraph_=function(){var t=new Date,e=this.is_initial_draw_;this.is_initial_draw_=!1,this.layout_.removeAllDatasets(),this.setColors_(),this.attrs_.pointSize=.5*this.getNumericOption("highlightCircleSize");var a=this.gatherDatasets_(this.rolledSeries_,this.dateWindow_),i=a.points,r=a.extremes;this.boundaryIds_=a.boundaryIds,this.setIndexByName_={};var n=this.attr_("labels");n.length>0&&(this.setIndexByName_[n[0]]=0);for(var o=0,s=1;s<i.length;s++)this.setIndexByName_[n[s]]=s,this.visibility()[s-1]&&(this.layout_.addDataset(n[s],i[s]),this.datasetIndex_[s]=o++);this.computeYAxisRanges_(r),this.layout_.setYAxes(this.axes_),this.addXTicks_();var l=this.zoomed_x_;if(this.zoomed_x_=l,this.layout_.evaluate(),this.renderGraph_(e),this.getStringOption("timingName")){var h=new Date;console.log(this.getStringOption("timingName")+" - drawGraph: "+(h-t)+"ms")}},t.prototype.renderGraph_=function(t){this.cascadeEvents_("clearChart"),this.plotter_.clear(),this.getFunctionOption("underlayCallback")&&this.getFunctionOption("underlayCallback").call(this,this.hidden_ctx_,this.layout_.getPlotArea(),this,this);var e={canvas:this.hidden_,drawingContext:this.hidden_ctx_};if(this.cascadeEvents_("willDrawChart",e),this.plotter_.render(),this.cascadeEvents_("didDrawChart",e),this.lastRow_=-1,this.canvas_.getContext("2d").clearRect(0,0,this.width_,this.height_),null!==this.getFunctionOption("drawCallback")&&this.getFunctionOption("drawCallback").call(this,this,t),t)for(this.readyFired_=!0;this.readyFns_.length>0;){var a=this.readyFns_.pop();a(this)}},t.prototype.computeYAxes_=function(){var e,a,i,r,n;if(void 0!==this.axes_&&this.user_attrs_.hasOwnProperty("valueRange")===!1)for(e=[],i=0;i<this.axes_.length;i++)e.push(this.axes_[i].valueWindow);for(this.axes_=[],a=0;a<this.attributes_.numAxes();a++)r={g:this},t.update(r,this.attributes_.axisOptions(a)),this.axes_[a]=r;if(n=this.attr_("valueRange"),n&&(this.axes_[0].valueRange=n),void 0!==e){var o=Math.min(e.length,this.axes_.length);for(i=0;o>i;i++)this.axes_[i].valueWindow=e[i]}for(a=0;a<this.axes_.length;a++)if(0===a)r=this.optionsViewForAxis_("y"+(a?"2":"")),n=r("valueRange"),n&&(this.axes_[a].valueRange=n);else{var s=this.user_attrs_.axes;s&&s.y2&&(n=s.y2.valueRange,n&&(this.axes_[a].valueRange=n))}},t.prototype.numAxes=function(){return this.attributes_.numAxes()},t.prototype.axisPropertiesForSeries=function(t){return this.axes_[this.attributes_.axisForSeries(t)]},t.prototype.computeYAxisRanges_=function(t){for(var e,a,i,r,n,o=function(t){return isNaN(parseFloat(t))},s=this.attributes_.numAxes(),l=0;s>l;l++){var h=this.axes_[l],p=this.attributes_.getForAxis("logscale",l),g=this.attributes_.getForAxis("includeZero",l),d=this.attributes_.getForAxis("independentTicks",l);if(i=this.attributes_.seriesForAxis(l),e=!0,r=.1,null!==this.getNumericOption("yRangePad")&&(e=!1,r=this.getNumericOption("yRangePad")/this.plotter_.area.h),0===i.length)h.extremeRange=[0,1];else{for(var u,c,y=1/0,_=-(1/0),v=0;v<i.length;v++)t.hasOwnProperty(i[v])&&(u=t[i[v]][0],null!==u&&(y=Math.min(u,y)),c=t[i[v]][1],null!==c&&(_=Math.max(c,_)));g&&!p&&(y>0&&(y=0),0>_&&(_=0)),y==1/0&&(y=0),_==-(1/0)&&(_=1),a=_-y,0===a&&(0!==_?a=Math.abs(_):(_=1,a=1));var f,x;if(p)if(e)f=_+r*a,x=y;else{var m=Math.exp(Math.log(a)*r);f=_*m,x=y/m}else f=_+r*a,x=y-r*a,e&&!this.getBooleanOption("avoidMinZero")&&(0>x&&y>=0&&(x=0),f>0&&0>=_&&(f=0));h.extremeRange=[x,f]}if(h.valueWindow)h.computedValueRange=[h.valueWindow[0],h.valueWindow[1]];else if(h.valueRange){var D=o(h.valueRange[0])?h.extremeRange[0]:h.valueRange[0],w=o(h.valueRange[1])?h.extremeRange[1]:h.valueRange[1];if(!e)if(h.logscale){var m=Math.exp(Math.log(a)*r);D*=m,w/=m}else a=w-D,D-=a*r,w+=a*r;h.computedValueRange=[D,w]}else h.computedValueRange=h.extremeRange;if(d){h.independentTicks=d;var A=this.optionsViewForAxis_("y"+(l?"2":"")),b=A("ticker");h.ticks=b(h.computedValueRange[0],h.computedValueRange[1],this.plotter_.area.h,A,this),n||(n=h)}}if(void 0===n)throw'Configuration Error: At least one axis has to have the "independentTicks" option activated.';for(var l=0;s>l;l++){var h=this.axes_[l];if(!h.independentTicks){for(var A=this.optionsViewForAxis_("y"+(l?"2":"")),b=A("ticker"),T=n.ticks,E=n.computedValueRange[1]-n.computedValueRange[0],C=h.computedValueRange[1]-h.computedValueRange[0],L=[],P=0;P<T.length;P++){var S=(T[P].v-n.computedValueRange[0])/E,O=h.computedValueRange[0]+S*C;L.push(O)}h.ticks=b(h.computedValueRange[0],h.computedValueRange[1],this.plotter_.area.h,A,this,L)}}},t.prototype.detectTypeFromString_=function(t){var e=!1,a=t.indexOf("-");a>0&&"e"!=t[a-1]&&"E"!=t[a-1]||t.indexOf("/")>=0||isNaN(parseFloat(t))?e=!0:8==t.length&&t>"19700101"&&"20371231">t&&(e=!0),this.setXAxisOptions_(e)},t.prototype.setXAxisOptions_=function(e){e?(this.attrs_.xValueParser=t.dateParser,this.attrs_.axes.x.valueFormatter=t.dateValueFormatter,this.attrs_.axes.x.ticker=t.dateTicker,this.attrs_.axes.x.axisLabelFormatter=t.dateAxisLabelFormatter):(this.attrs_.xValueParser=function(t){return parseFloat(t)},this.attrs_.axes.x.valueFormatter=function(t){return t},this.attrs_.axes.x.ticker=t.numericTicks,this.attrs_.axes.x.axisLabelFormatter=this.attrs_.axes.x.valueFormatter)},t.prototype.parseCSV_=function(e){var a,i,r=[],n=t.detectLineDelimiter(e),o=e.split(n||"\n"),s=this.getStringOption("delimiter");-1==o[0].indexOf(s)&&o[0].indexOf("	")>=0&&(s="	");var l=0;"labels"in this.user_attrs_||(l=1,this.attrs_.labels=o[0].split(s),this.attributes_.reparseSeries());for(var h,p=0,g=!1,d=this.attr_("labels").length,u=!1,c=l;c<o.length;c++){var y=o[c];if(p=c,0!==y.length&&"#"!=y[0]){var _=y.split(s);if(!(_.length<2)){var v=[];if(g||(this.detectTypeFromString_(_[0]),h=this.getFunctionOption("xValueParser"),g=!0),v[0]=h(_[0],this),this.fractions_)for(i=1;i<_.length;i++)a=_[i].split("/"),2!=a.length?(console.error('Expected fractional "num/den" values in CSV data but found a value \''+_[i]+"' on line "+(1+c)+" ('"+y+"') which is not of this form."),v[i]=[0,0]):v[i]=[t.parseFloat_(a[0],c,y),t.parseFloat_(a[1],c,y)];else if(this.getBooleanOption("errorBars"))for(_.length%2!=1&&console.error("Expected alternating (value, stdev.) pairs in CSV data but line "+(1+c)+" has an odd number of values ("+(_.length-1)+"): '"+y+"'"),i=1;i<_.length;i+=2)v[(i+1)/2]=[t.parseFloat_(_[i],c,y),t.parseFloat_(_[i+1],c,y)];else if(this.getBooleanOption("customBars"))for(i=1;i<_.length;i++){var f=_[i];/^ *$/.test(f)?v[i]=[null,null,null]:(a=f.split(";"),3==a.length?v[i]=[t.parseFloat_(a[0],c,y),t.parseFloat_(a[1],c,y),t.parseFloat_(a[2],c,y)]:console.warn('When using customBars, values must be either blank or "low;center;high" tuples (got "'+f+'" on line '+(1+c)))}else for(i=1;i<_.length;i++)v[i]=t.parseFloat_(_[i],c,y);if(r.length>0&&v[0]<r[r.length-1][0]&&(u=!0),v.length!=d&&console.error("Number of columns in line "+c+" ("+v.length+") does not agree with number of labels ("+d+") "+y),0===c&&this.attr_("labels")){var x=!0;for(i=0;x&&i<v.length;i++)v[i]&&(x=!1);if(x){console.warn("The dygraphs 'labels' option is set, but the first row of CSV data ('"+y+"') appears to also contain labels. Will drop the CSV labels and use the option labels.");continue}}r.push(v)}}}return u&&(console.warn("CSV is out of order; order it correctly to speed loading."),r.sort(function(t,e){return t[0]-e[0]})),r},t.prototype.parseArray_=function(e){if(0===e.length)return console.error("Can't plot empty data set"),null;if(0===e[0].length)return console.error("Data set cannot contain an empty row"),null;var a;if(null===this.attr_("labels")){for(console.warn("Using default labels. Set labels explicitly via 'labels' in the options parameter"),this.attrs_.labels=["X"],a=1;a<e[0].length;a++)this.attrs_.labels.push("Y"+a);this.attributes_.reparseSeries()}else{var i=this.attr_("labels");if(i.length!=e[0].length)return console.error("Mismatch between number of labels ("+i+") and number of columns in array ("+e[0].length+")"),null}if(t.isDateLike(e[0][0])){this.attrs_.axes.x.valueFormatter=t.dateValueFormatter,this.attrs_.axes.x.ticker=t.dateTicker,this.attrs_.axes.x.axisLabelFormatter=t.dateAxisLabelFormatter;var r=t.clone(e);for(a=0;a<e.length;a++){if(0===r[a].length)return console.error("Row "+(1+a)+" of data is empty"),null;if(null===r[a][0]||"function"!=typeof r[a][0].getTime||isNaN(r[a][0].getTime()))return console.error("x value in row "+(1+a)+" is not a Date"),null;r[a][0]=r[a][0].getTime()}return r}return this.attrs_.axes.x.valueFormatter=function(t){return t},this.attrs_.axes.x.ticker=t.numericTicks,this.attrs_.axes.x.axisLabelFormatter=t.numberAxisLabelFormatter,e},t.prototype.parseDataTable_=function(e){var a=function(t){var e=String.fromCharCode(65+t%26);for(t=Math.floor(t/26);t>0;)e=String.fromCharCode(65+(t-1)%26)+e.toLowerCase(),t=Math.floor((t-1)/26);return e},i=e.getNumberOfColumns(),r=e.getNumberOfRows(),n=e.getColumnType(0);if("date"==n||"datetime"==n)this.attrs_.xValueParser=t.dateParser,this.attrs_.axes.x.valueFormatter=t.dateValueFormatter,this.attrs_.axes.x.ticker=t.dateTicker,this.attrs_.axes.x.axisLabelFormatter=t.dateAxisLabelFormatter;else{if("number"!=n)return console.error("only 'date', 'datetime' and 'number' types are supported for column 1 of DataTable input (Got '"+n+"')"),null;this.attrs_.xValueParser=function(t){return parseFloat(t)},this.attrs_.axes.x.valueFormatter=function(t){return t},this.attrs_.axes.x.ticker=t.numericTicks,this.attrs_.axes.x.axisLabelFormatter=this.attrs_.axes.x.valueFormatter}var o,s,l=[],h={},p=!1;for(o=1;i>o;o++){var g=e.getColumnType(o);if("number"==g)l.push(o);else if("string"==g&&this.getBooleanOption("displayAnnotations")){var d=l[l.length-1];h.hasOwnProperty(d)?h[d].push(o):h[d]=[o],p=!0}else console.error("Only 'number' is supported as a dependent type with Gviz. 'string' is only supported if displayAnnotations is true")}var u=[e.getColumnLabel(0)];for(o=0;o<l.length;o++)u.push(e.getColumnLabel(l[o])),this.getBooleanOption("errorBars")&&(o+=1);this.attrs_.labels=u,i=u.length;var c=[],y=!1,_=[];for(o=0;r>o;o++){var v=[];if("undefined"!=typeof e.getValue(o,0)&&null!==e.getValue(o,0)){if(v.push("date"==n||"datetime"==n?e.getValue(o,0).getTime():e.getValue(o,0)),this.getBooleanOption("errorBars"))for(s=0;i-1>s;s++)v.push([e.getValue(o,1+2*s),e.getValue(o,2+2*s)]);else{for(s=0;s<l.length;s++){var f=l[s];if(v.push(e.getValue(o,f)),p&&h.hasOwnProperty(f)&&null!==e.getValue(o,h[f][0])){var x={};x.series=e.getColumnLabel(f),x.xval=v[0],x.shortText=a(_.length),x.text="";for(var m=0;m<h[f].length;m++)m&&(x.text+="\n"),x.text+=e.getValue(o,h[f][m]);_.push(x)}}for(s=0;s<v.length;s++)isFinite(v[s])||(v[s]=null)}c.length>0&&v[0]<c[c.length-1][0]&&(y=!0),c.push(v)}else console.warn("Ignoring row "+o+" of DataTable because of undefined or null first column.")}y&&(console.warn("DataTable is out of order; order it correctly to speed loading."),c.sort(function(t,e){return t[0]-e[0]})),this.rawData_=c,_.length>0&&this.setAnnotations(_,!0),this.attributes_.reparseSeries()},t.prototype.cascadeDataDidUpdateEvent_=function(){this.cascadeEvents_("dataDidUpdate",{})},t.prototype.start_=function(){var e=this.file_;if("function"==typeof e&&(e=e()),t.isArrayLike(e))this.rawData_=this.parseArray_(e),this.cascadeDataDidUpdateEvent_(),this.predraw_();else if("object"==typeof e&&"function"==typeof e.getColumnRange)this.parseDataTable_(e),this.cascadeDataDidUpdateEvent_(),this.predraw_();else if("string"==typeof e){var a=t.detectLineDelimiter(e);if(a)this.loadedEvent_(e);else{var i;i=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP");var r=this;i.onreadystatechange=function(){4==i.readyState&&(200===i.status||0===i.status)&&r.loadedEvent_(i.responseText)},i.open("GET",e,!0),i.send(null)}}else console.error("Unknown data format: "+typeof e)},t.prototype.updateOptions=function(e,a){"undefined"==typeof a&&(a=!1);var i=e.file,r=t.mapLegacyOptions_(e);"rollPeriod"in r&&(this.rollPeriod_=r.rollPeriod),"dateWindow"in r&&(this.dateWindow_=r.dateWindow,"isZoomedIgnoreProgrammaticZoom"in r||(this.zoomed_x_=null!==r.dateWindow)),"valueRange"in r&&!("isZoomedIgnoreProgrammaticZoom"in r)&&(this.zoomed_y_=null!==r.valueRange);var n=t.isPixelChangingOptionList(this.attr_("labels"),r);t.updateDeep(this.user_attrs_,r),this.attributes_.reparseSeries(),i?(this.cascadeEvents_("dataWillUpdate",{}),this.file_=i,a||this.start_()):a||(n?this.predraw_():this.renderGraph_(!1))},t.mapLegacyOptions_=function(t){var e={};for(var a in t)t.hasOwnProperty(a)&&"file"!=a&&t.hasOwnProperty(a)&&(e[a]=t[a]);var i=function(t,a,i){e.axes||(e.axes={}),e.axes[t]||(e.axes[t]={}),e.axes[t][a]=i},r=function(a,r,n){"undefined"!=typeof t[a]&&(console.warn("Option "+a+" is deprecated. Use the "+n+" option for the "+r+" axis instead. (e.g. { axes : { "+r+" : { "+n+" : ... } } } (see http://dygraphs.com/per-axis.html for more information."),i(r,n,t[a]),delete e[a])};return r("xValueFormatter","x","valueFormatter"),r("pixelsPerXLabel","x","pixelsPerLabel"),r("xAxisLabelFormatter","x","axisLabelFormatter"),r("xTicker","x","ticker"),r("yValueFormatter","y","valueFormatter"),r("pixelsPerYLabel","y","pixelsPerLabel"),r("yAxisLabelFormatter","y","axisLabelFormatter"),r("yTicker","y","ticker"),r("drawXGrid","x","drawGrid"),r("drawXAxis","x","drawAxis"),r("drawYGrid","y","drawGrid"),r("drawYAxis","y","drawAxis"),r("xAxisLabelWidth","x","axisLabelWidth"),r("yAxisLabelWidth","y","axisLabelWidth"),e},t.prototype.resize=function(t,e){if(!this.resize_lock){this.resize_lock=!0,null===t!=(null===e)&&(console.warn("Dygraph.resize() should be called with zero parameters or two non-NULL parameters. Pretending it was zero."),t=e=null);var a=this.width_,i=this.height_;t?(this.maindiv_.style.width=t+"px",this.maindiv_.style.height=e+"px",this.width_=t,this.height_=e):(this.width_=this.maindiv_.clientWidth,this.height_=this.maindiv_.clientHeight),(a!=this.width_||i!=this.height_)&&(this.resizeElements_(),this.predraw_()),this.resize_lock=!1}},t.prototype.adjustRoll=function(t){this.rollPeriod_=t,this.predraw_()},t.prototype.visibility=function(){for(this.getOption("visibility")||(this.attrs_.visibility=[]);this.getOption("visibility").length<this.numColumns()-1;)this.attrs_.visibility.push(!0);return this.getOption("visibility")},t.prototype.setVisibility=function(t,e){var a=this.visibility();0>t||t>=a.length?console.warn("invalid series number in setVisibility: "+t):(a[t]=e,this.predraw_())},t.prototype.size=function(){return{width:this.width_,height:this.height_}},t.prototype.setAnnotations=function(e,a){return t.addAnnotationRule(),this.annotations_=e,this.layout_?(this.layout_.setAnnotations(this.annotations_),void(a||this.predraw_())):void console.warn("Tried to setAnnotations before dygraph was ready. Try setting them in a ready() block. See dygraphs.com/tests/annotation.html")},t.prototype.annotations=function(){return this.annotations_},t.prototype.getLabels=function(){var t=this.attr_("labels");return t?t.slice():null},t.prototype.indexFromSetName=function(t){return this.setIndexByName_[t]},t.prototype.ready=function(t){this.is_initial_draw_?this.readyFns_.push(t):t.call(this,this)},t.addAnnotationRule=function(){if(!t.addedAnnotationCSS){var e="border: 1px solid black; background-color: white; text-align: center;",a=document.createElement("style");a.type="text/css",document.getElementsByTagName("head")[0].appendChild(a);for(var i=0;i<document.styleSheets.length;i++)if(!document.styleSheets[i].disabled){var r=document.styleSheets[i];try{if(r.insertRule){var n=r.cssRules?r.cssRules.length:0;r.insertRule(".dygraphDefaultAnnotation { "+e+" }",n)}else r.addRule&&r.addRule(".dygraphDefaultAnnotation",e);return void(t.addedAnnotationCSS=!0)}catch(o){}}console.warn("Unable to add default annotation CSS rule; display may be off.")}},"object"==typeof exports&&"undefined"!=typeof module&&(module.exports=t),t}();!function(){"use strict";function t(t){var e=a.exec(t);if(!e)return null;var i=parseInt(e[1],10),r=parseInt(e[2],10),n=parseInt(e[3],10);return e[4]?{r:i,g:r,b:n,a:parseFloat(e[4])}:{r:i,g:r,b:n}}Dygraph.LOG_SCALE=10,Dygraph.LN_TEN=Math.log(Dygraph.LOG_SCALE),Dygraph.log10=function(t){return Math.log(t)/Dygraph.LN_TEN},Dygraph.DOTTED_LINE=[2,2],Dygraph.DASHED_LINE=[7,3],Dygraph.DOT_DASH_LINE=[7,2,2,2],Dygraph.getContext=function(t){return t.getContext("2d")},Dygraph.addEvent=function(t,e,a){t.addEventListener?t.addEventListener(e,a,!1):(t[e+a]=function(){a(window.event)},t.attachEvent("on"+e,t[e+a]))},Dygraph.prototype.addAndTrackEvent=function(t,e,a){Dygraph.addEvent(t,e,a),this.registeredEvents_.push({elem:t,type:e,fn:a})},Dygraph.removeEvent=function(t,e,a){if(t.removeEventListener)t.removeEventListener(e,a,!1);else{try{t.detachEvent("on"+e,t[e+a])}catch(i){}t[e+a]=null}},Dygraph.prototype.removeTrackedEvents_=function(){if(this.registeredEvents_)for(var t=0;t<this.registeredEvents_.length;t++){var e=this.registeredEvents_[t];Dygraph.removeEvent(e.elem,e.type,e.fn)}this.registeredEvents_=[]},Dygraph.cancelEvent=function(t){return t=t?t:window.event,t.stopPropagation&&t.stopPropagation(),t.preventDefault&&t.preventDefault(),t.cancelBubble=!0,t.cancel=!0,t.returnValue=!1,!1},Dygraph.hsvToRGB=function(t,e,a){var i,r,n;if(0===e)i=a,r=a,n=a;else{var o=Math.floor(6*t),s=6*t-o,l=a*(1-e),h=a*(1-e*s),p=a*(1-e*(1-s));switch(o){case 1:i=h,r=a,n=l;break;case 2:i=l,r=a,n=p;break;case 3:i=l,r=h,n=a;break;case 4:i=p,r=l,n=a;break;case 5:i=a,r=l,n=h;break;case 6:case 0:i=a,r=p,n=l}}return i=Math.floor(255*i+.5),r=Math.floor(255*r+.5),n=Math.floor(255*n+.5),"rgb("+i+","+r+","+n+")"},Dygraph.findPos=function(t){var e=0,a=0;if(t.offsetParent)for(var i=t;;){var r="0",n="0";if(window.getComputedStyle){
var o=window.getComputedStyle(i,null);r=o.borderLeft||"0",n=o.borderTop||"0"}if(e+=parseInt(r,10),a+=parseInt(n,10),e+=i.offsetLeft,a+=i.offsetTop,!i.offsetParent)break;i=i.offsetParent}else t.x&&(e+=t.x),t.y&&(a+=t.y);for(;t&&t!=document.body;)e-=t.scrollLeft,a-=t.scrollTop,t=t.parentNode;return{x:e,y:a}},Dygraph.pageX=function(t){if(t.pageX)return!t.pageX||t.pageX<0?0:t.pageX;var e=document.documentElement,a=document.body;return t.clientX+(e.scrollLeft||a.scrollLeft)-(e.clientLeft||0)},Dygraph.pageY=function(t){if(t.pageY)return!t.pageY||t.pageY<0?0:t.pageY;var e=document.documentElement,a=document.body;return t.clientY+(e.scrollTop||a.scrollTop)-(e.clientTop||0)},Dygraph.dragGetX_=function(t,e){return Dygraph.pageX(t)-e.px},Dygraph.dragGetY_=function(t,e){return Dygraph.pageY(t)-e.py},Dygraph.isOK=function(t){return!!t&&!isNaN(t)},Dygraph.isValidPoint=function(t,e){return t?null===t.yval?!1:null===t.x||void 0===t.x?!1:null===t.y||void 0===t.y?!1:isNaN(t.x)||!e&&isNaN(t.y)?!1:!0:!1},Dygraph.floatFormat=function(t,e){var a=Math.min(Math.max(1,e||2),21);return Math.abs(t)<.001&&0!==t?t.toExponential(a-1):t.toPrecision(a)},Dygraph.zeropad=function(t){return 10>t?"0"+t:""+t},Dygraph.DateAccessorsLocal={getFullYear:function(t){return t.getFullYear()},getMonth:function(t){return t.getMonth()},getDate:function(t){return t.getDate()},getHours:function(t){return t.getHours()},getMinutes:function(t){return t.getMinutes()},getSeconds:function(t){return t.getSeconds()},getMilliseconds:function(t){return t.getMilliseconds()},getDay:function(t){return t.getDay()},makeDate:function(t,e,a,i,r,n,o){return new Date(t,e,a,i,r,n,o)}},Dygraph.DateAccessorsUTC={getFullYear:function(t){return t.getUTCFullYear()},getMonth:function(t){return t.getUTCMonth()},getDate:function(t){return t.getUTCDate()},getHours:function(t){return t.getUTCHours()},getMinutes:function(t){return t.getUTCMinutes()},getSeconds:function(t){return t.getUTCSeconds()},getMilliseconds:function(t){return t.getUTCMilliseconds()},getDay:function(t){return t.getUTCDay()},makeDate:function(t,e,a,i,r,n,o){return new Date(Date.UTC(t,e,a,i,r,n,o))}},Dygraph.hmsString_=function(t,e,a){var i=Dygraph.zeropad,r=i(t)+":"+i(e);return a&&(r+=":"+i(a)),r},Dygraph.dateString_=function(t,e){var a=Dygraph.zeropad,i=e?Dygraph.DateAccessorsUTC:Dygraph.DateAccessorsLocal,r=new Date(t),n=i.getFullYear(r),o=i.getMonth(r),s=i.getDate(r),l=i.getHours(r),h=i.getMinutes(r),p=i.getSeconds(r),g=""+n,d=a(o+1),u=a(s),c=3600*l+60*h+p,y=g+"/"+d+"/"+u;return c&&(y+=" "+Dygraph.hmsString_(l,h,p)),y},Dygraph.round_=function(t,e){var a=Math.pow(10,e);return Math.round(t*a)/a},Dygraph.binarySearch=function(t,e,a,i,r){if((null===i||void 0===i||null===r||void 0===r)&&(i=0,r=e.length-1),i>r)return-1;(null===a||void 0===a)&&(a=0);var n,o=function(t){return t>=0&&t<e.length},s=parseInt((i+r)/2,10),l=e[s];return l==t?s:l>t?a>0&&(n=s-1,o(n)&&e[n]<t)?s:Dygraph.binarySearch(t,e,a,i,s-1):t>l?0>a&&(n=s+1,o(n)&&e[n]>t)?s:Dygraph.binarySearch(t,e,a,s+1,r):-1},Dygraph.dateParser=function(t){var e,a;if((-1==t.search("-")||-1!=t.search("T")||-1!=t.search("Z"))&&(a=Dygraph.dateStrToMillis(t),a&&!isNaN(a)))return a;if(-1!=t.search("-")){for(e=t.replace("-","/","g");-1!=e.search("-");)e=e.replace("-","/");a=Dygraph.dateStrToMillis(e)}else 8==t.length?(e=t.substr(0,4)+"/"+t.substr(4,2)+"/"+t.substr(6,2),a=Dygraph.dateStrToMillis(e)):a=Dygraph.dateStrToMillis(t);return(!a||isNaN(a))&&console.error("Couldn't parse "+t+" as a date"),a},Dygraph.dateStrToMillis=function(t){return new Date(t).getTime()},Dygraph.update=function(t,e){if("undefined"!=typeof e&&null!==e)for(var a in e)e.hasOwnProperty(a)&&(t[a]=e[a]);return t},Dygraph.updateDeep=function(t,e){function a(t){return"object"==typeof Node?t instanceof Node:"object"==typeof t&&"number"==typeof t.nodeType&&"string"==typeof t.nodeName}if("undefined"!=typeof e&&null!==e)for(var i in e)e.hasOwnProperty(i)&&(null===e[i]?t[i]=null:Dygraph.isArrayLike(e[i])?t[i]=e[i].slice():a(e[i])?t[i]=e[i]:"object"==typeof e[i]?(("object"!=typeof t[i]||null===t[i])&&(t[i]={}),Dygraph.updateDeep(t[i],e[i])):t[i]=e[i]);return t},Dygraph.isArrayLike=function(t){var e=typeof t;return"object"!=e&&("function"!=e||"function"!=typeof t.item)||null===t||"number"!=typeof t.length||3===t.nodeType?!1:!0},Dygraph.isDateLike=function(t){return"object"!=typeof t||null===t||"function"!=typeof t.getTime?!1:!0},Dygraph.clone=function(t){for(var e=[],a=0;a<t.length;a++)e.push(Dygraph.isArrayLike(t[a])?Dygraph.clone(t[a]):t[a]);return e},Dygraph.createCanvas=function(){var t=document.createElement("canvas"),e=/MSIE/.test(navigator.userAgent)&&!window.opera;return e&&"undefined"!=typeof G_vmlCanvasManager&&(t=G_vmlCanvasManager.initElement(t)),t},Dygraph.getContextPixelRatio=function(t){try{var e=window.devicePixelRatio,a=t.webkitBackingStorePixelRatio||t.mozBackingStorePixelRatio||t.msBackingStorePixelRatio||t.oBackingStorePixelRatio||t.backingStorePixelRatio||1;return void 0!==e?e/a:1}catch(i){return 1}},Dygraph.isAndroid=function(){return/Android/.test(navigator.userAgent)},Dygraph.Iterator=function(t,e,a,i){e=e||0,a=a||t.length,this.hasNext=!0,this.peek=null,this.start_=e,this.array_=t,this.predicate_=i,this.end_=Math.min(t.length,e+a),this.nextIdx_=e-1,this.next()},Dygraph.Iterator.prototype.next=function(){if(!this.hasNext)return null;for(var t=this.peek,e=this.nextIdx_+1,a=!1;e<this.end_;){if(!this.predicate_||this.predicate_(this.array_,e)){this.peek=this.array_[e],a=!0;break}e++}return this.nextIdx_=e,a||(this.hasNext=!1,this.peek=null),t},Dygraph.createIterator=function(t,e,a,i){return new Dygraph.Iterator(t,e,a,i)},Dygraph.requestAnimFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(t){window.setTimeout(t,1e3/60)}}(),Dygraph.repeatAndCleanup=function(t,e,a,i){var r,n=0,o=(new Date).getTime();if(t(n),1==e)return void i();var s=e-1;!function l(){n>=e||Dygraph.requestAnimFrame.call(window,function(){var e=(new Date).getTime(),h=e-o;r=n,n=Math.floor(h/a);var p=n-r,g=n+p>s;g||n>=s?(t(s),i()):(0!==p&&t(n),l())})}()};var e={annotationClickHandler:!0,annotationDblClickHandler:!0,annotationMouseOutHandler:!0,annotationMouseOverHandler:!0,axisLabelColor:!0,axisLineColor:!0,axisLineWidth:!0,clickCallback:!0,drawCallback:!0,drawHighlightPointCallback:!0,drawPoints:!0,drawPointCallback:!0,drawXGrid:!0,drawYGrid:!0,fillAlpha:!0,gridLineColor:!0,gridLineWidth:!0,hideOverlayOnMouseOut:!0,highlightCallback:!0,highlightCircleSize:!0,interactionModel:!0,isZoomedIgnoreProgrammaticZoom:!0,labelsDiv:!0,labelsDivStyles:!0,labelsDivWidth:!0,labelsKMB:!0,labelsKMG2:!0,labelsSeparateLines:!0,labelsShowZeroValues:!0,legend:!0,panEdgeFraction:!0,pixelsPerYLabel:!0,pointClickCallback:!0,pointSize:!0,rangeSelectorPlotFillColor:!0,rangeSelectorPlotStrokeColor:!0,showLabelsOnHighlight:!0,showRoller:!0,strokeWidth:!0,underlayCallback:!0,unhighlightCallback:!0,zoomCallback:!0};Dygraph.isPixelChangingOptionList=function(t,a){var i={};if(t)for(var r=1;r<t.length;r++)i[t[r]]=!0;var n=function(t){for(var a in t)if(t.hasOwnProperty(a)&&!e[a])return!0;return!1};for(var o in a)if(a.hasOwnProperty(o))if("highlightSeriesOpts"==o||i[o]&&!a.series){if(n(a[o]))return!0}else if("series"==o||"axes"==o){var s=a[o];for(var l in s)if(s.hasOwnProperty(l)&&n(s[l]))return!0}else if(!e[o])return!0;return!1},Dygraph.Circles={DEFAULT:function(t,e,a,i,r,n,o){a.beginPath(),a.fillStyle=n,a.arc(i,r,o,0,2*Math.PI,!1),a.fill()}},Dygraph.IFrameTarp=function(){this.tarps=[]},Dygraph.IFrameTarp.prototype.cover=function(){for(var t=document.getElementsByTagName("iframe"),e=0;e<t.length;e++){var a=t[e],i=Dygraph.findPos(a),r=i.x,n=i.y,o=a.offsetWidth,s=a.offsetHeight,l=document.createElement("div");l.style.position="absolute",l.style.left=r+"px",l.style.top=n+"px",l.style.width=o+"px",l.style.height=s+"px",l.style.zIndex=999,document.body.appendChild(l),this.tarps.push(l)}},Dygraph.IFrameTarp.prototype.uncover=function(){for(var t=0;t<this.tarps.length;t++)this.tarps[t].parentNode.removeChild(this.tarps[t]);this.tarps=[]},Dygraph.detectLineDelimiter=function(t){for(var e=0;e<t.length;e++){var a=t.charAt(e);if("\r"===a)return e+1<t.length&&"\n"===t.charAt(e+1)?"\r\n":a;if("\n"===a)return e+1<t.length&&"\r"===t.charAt(e+1)?"\n\r":a}return null},Dygraph.isNodeContainedBy=function(t,e){if(null===e||null===t)return!1;for(var a=t;a&&a!==e;)a=a.parentNode;return a===e},Dygraph.pow=function(t,e){return 0>e?1/Math.pow(t,-e):Math.pow(t,e)};var a=/^rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*([01](?:\.\d+)?))?\)$/;Dygraph.toRGB_=function(e){var a=t(e);if(a)return a;var i=document.createElement("div");i.style.backgroundColor=e,i.style.visibility="hidden",document.body.appendChild(i);var r;return r=window.getComputedStyle?window.getComputedStyle(i,null).backgroundColor:i.currentStyle.backgroundColor,document.body.removeChild(i),t(r)},Dygraph.isCanvasSupported=function(t){var e;try{e=t||document.createElement("canvas"),e.getContext("2d")}catch(a){var i=navigator.appVersion.match(/MSIE (\d\.\d)/),r=-1!=navigator.userAgent.toLowerCase().indexOf("opera");return!i||i[1]<6||r?!1:!0}return!0},Dygraph.parseFloat_=function(t,e,a){var i=parseFloat(t);if(!isNaN(i))return i;if(/^ *$/.test(t))return null;if(/^ *nan *$/i.test(t))return 0/0;var r="Unable to parse '"+t+"' as a number";return void 0!==a&&void 0!==e&&(r+=" on line "+(1+(e||0))+" ('"+a+"') of CSV."),console.error(r),null}}(),function(){"use strict";Dygraph.GVizChart=function(t){this.container=t},Dygraph.GVizChart.prototype.draw=function(t,e){this.container.innerHTML="","undefined"!=typeof this.date_graph&&this.date_graph.destroy(),this.date_graph=new Dygraph(this.container,t,e)},Dygraph.GVizChart.prototype.setSelection=function(t){var e=!1;t.length&&(e=t[0].row),this.date_graph.setSelection(e)},Dygraph.GVizChart.prototype.getSelection=function(){var t=[],e=this.date_graph.getSelection();if(0>e)return t;for(var a=this.date_graph.layout_.points,i=0;i<a.length;++i)t.push({row:e,column:i+1});return t}}(),function(){"use strict";var t=100;Dygraph.Interaction={},Dygraph.Interaction.maybeTreatMouseOpAsClick=function(t,e,a){a.dragEndX=Dygraph.dragGetX_(t,a),a.dragEndY=Dygraph.dragGetY_(t,a);var i=Math.abs(a.dragEndX-a.dragStartX),r=Math.abs(a.dragEndY-a.dragStartY);2>i&&2>r&&void 0!==e.lastx_&&-1!=e.lastx_&&Dygraph.Interaction.treatMouseOpAsClick(e,t,a),a.regionWidth=i,a.regionHeight=r},Dygraph.Interaction.startPan=function(t,e,a){var i,r;a.isPanning=!0;var n=e.xAxisRange();if(e.getOptionForAxis("logscale","x")?(a.initialLeftmostDate=Dygraph.log10(n[0]),a.dateRange=Dygraph.log10(n[1])-Dygraph.log10(n[0])):(a.initialLeftmostDate=n[0],a.dateRange=n[1]-n[0]),a.xUnitsPerPixel=a.dateRange/(e.plotter_.area.w-1),e.getNumericOption("panEdgeFraction")){var o=e.width_*e.getNumericOption("panEdgeFraction"),s=e.xAxisExtremes(),l=e.toDomXCoord(s[0])-o,h=e.toDomXCoord(s[1])+o,p=e.toDataXCoord(l),g=e.toDataXCoord(h);a.boundedDates=[p,g];var d=[],u=e.height_*e.getNumericOption("panEdgeFraction");for(i=0;i<e.axes_.length;i++){r=e.axes_[i];var c=r.extremeRange,y=e.toDomYCoord(c[0],i)+u,_=e.toDomYCoord(c[1],i)-u,v=e.toDataYCoord(y,i),f=e.toDataYCoord(_,i);d[i]=[v,f]}a.boundedValues=d}for(a.is2DPan=!1,a.axes=[],i=0;i<e.axes_.length;i++){r=e.axes_[i];var x={},m=e.yAxisRange(i),D=e.attributes_.getForAxis("logscale",i);D?(x.initialTopValue=Dygraph.log10(m[1]),x.dragValueRange=Dygraph.log10(m[1])-Dygraph.log10(m[0])):(x.initialTopValue=m[1],x.dragValueRange=m[1]-m[0]),x.unitsPerPixel=x.dragValueRange/(e.plotter_.area.h-1),a.axes.push(x),(r.valueWindow||r.valueRange)&&(a.is2DPan=!0)}},Dygraph.Interaction.movePan=function(t,e,a){a.dragEndX=Dygraph.dragGetX_(t,a),a.dragEndY=Dygraph.dragGetY_(t,a);var i=a.initialLeftmostDate-(a.dragEndX-a.dragStartX)*a.xUnitsPerPixel;a.boundedDates&&(i=Math.max(i,a.boundedDates[0]));var r=i+a.dateRange;if(a.boundedDates&&r>a.boundedDates[1]&&(i-=r-a.boundedDates[1],r=i+a.dateRange),e.getOptionForAxis("logscale","x")?e.dateWindow_=[Math.pow(Dygraph.LOG_SCALE,i),Math.pow(Dygraph.LOG_SCALE,r)]:e.dateWindow_=[i,r],a.is2DPan)for(var n=a.dragEndY-a.dragStartY,o=0;o<e.axes_.length;o++){var s=e.axes_[o],l=a.axes[o],h=n*l.unitsPerPixel,p=a.boundedValues?a.boundedValues[o]:null,g=l.initialTopValue+h;p&&(g=Math.min(g,p[1]));var d=g-l.dragValueRange;p&&d<p[0]&&(g-=d-p[0],d=g-l.dragValueRange),e.attributes_.getForAxis("logscale",o)?s.valueWindow=[Math.pow(Dygraph.LOG_SCALE,d),Math.pow(Dygraph.LOG_SCALE,g)]:s.valueWindow=[d,g]}e.drawGraph_(!1)},Dygraph.Interaction.endPan=Dygraph.Interaction.maybeTreatMouseOpAsClick,Dygraph.Interaction.startZoom=function(t,e,a){a.isZooming=!0,a.zoomMoved=!1},Dygraph.Interaction.moveZoom=function(t,e,a){a.zoomMoved=!0,a.dragEndX=Dygraph.dragGetX_(t,a),a.dragEndY=Dygraph.dragGetY_(t,a);var i=Math.abs(a.dragStartX-a.dragEndX),r=Math.abs(a.dragStartY-a.dragEndY);a.dragDirection=r/2>i?Dygraph.VERTICAL:Dygraph.HORIZONTAL,e.drawZoomRect_(a.dragDirection,a.dragStartX,a.dragEndX,a.dragStartY,a.dragEndY,a.prevDragDirection,a.prevEndX,a.prevEndY),a.prevEndX=a.dragEndX,a.prevEndY=a.dragEndY,a.prevDragDirection=a.dragDirection},Dygraph.Interaction.treatMouseOpAsClick=function(t,e,a){for(var i=t.getFunctionOption("clickCallback"),r=t.getFunctionOption("pointClickCallback"),n=null,o=-1,s=Number.MAX_VALUE,l=0;l<t.selPoints_.length;l++){var h=t.selPoints_[l],p=Math.pow(h.canvasx-a.dragEndX,2)+Math.pow(h.canvasy-a.dragEndY,2);!isNaN(p)&&(-1==o||s>p)&&(s=p,o=l)}var g=t.getNumericOption("highlightCircleSize")+2;if(g*g>=s&&(n=t.selPoints_[o]),n){var d={cancelable:!0,point:n,canvasx:a.dragEndX,canvasy:a.dragEndY},u=t.cascadeEvents_("pointClick",d);if(u)return;r&&r.call(t,e,n)}var d={cancelable:!0,xval:t.lastx_,pts:t.selPoints_,canvasx:a.dragEndX,canvasy:a.dragEndY};t.cascadeEvents_("click",d)||i&&i.call(t,e,t.lastx_,t.selPoints_)},Dygraph.Interaction.endZoom=function(t,e,a){e.clearZoomRect_(),a.isZooming=!1,Dygraph.Interaction.maybeTreatMouseOpAsClick(t,e,a);var i=e.getArea();if(a.regionWidth>=10&&a.dragDirection==Dygraph.HORIZONTAL){var r=Math.min(a.dragStartX,a.dragEndX),n=Math.max(a.dragStartX,a.dragEndX);r=Math.max(r,i.x),n=Math.min(n,i.x+i.w),n>r&&e.doZoomX_(r,n),a.cancelNextDblclick=!0}else if(a.regionHeight>=10&&a.dragDirection==Dygraph.VERTICAL){var o=Math.min(a.dragStartY,a.dragEndY),s=Math.max(a.dragStartY,a.dragEndY);o=Math.max(o,i.y),s=Math.min(s,i.y+i.h),s>o&&e.doZoomY_(o,s),a.cancelNextDblclick=!0}a.dragStartX=null,a.dragStartY=null},Dygraph.Interaction.startTouch=function(t,e,a){t.preventDefault(),t.touches.length>1&&(a.startTimeForDoubleTapMs=null);for(var i=[],r=0;r<t.touches.length;r++){var n=t.touches[r];i.push({pageX:n.pageX,pageY:n.pageY,dataX:e.toDataXCoord(n.pageX),dataY:e.toDataYCoord(n.pageY)})}if(a.initialTouches=i,1==i.length)a.initialPinchCenter=i[0],a.touchDirections={x:!0,y:!0};else if(i.length>=2){a.initialPinchCenter={pageX:.5*(i[0].pageX+i[1].pageX),pageY:.5*(i[0].pageY+i[1].pageY),dataX:.5*(i[0].dataX+i[1].dataX),dataY:.5*(i[0].dataY+i[1].dataY)};var o=180/Math.PI*Math.atan2(a.initialPinchCenter.pageY-i[0].pageY,i[0].pageX-a.initialPinchCenter.pageX);o=Math.abs(o),o>90&&(o=90-o),a.touchDirections={x:67.5>o,y:o>22.5}}a.initialRange={x:e.xAxisRange(),y:e.yAxisRange()}},Dygraph.Interaction.moveTouch=function(t,e,a){a.startTimeForDoubleTapMs=null;var i,r=[];for(i=0;i<t.touches.length;i++){var n=t.touches[i];r.push({pageX:n.pageX,pageY:n.pageY})}var o,s=a.initialTouches,l=a.initialPinchCenter;o=1==r.length?r[0]:{pageX:.5*(r[0].pageX+r[1].pageX),pageY:.5*(r[0].pageY+r[1].pageY)};var h={pageX:o.pageX-l.pageX,pageY:o.pageY-l.pageY},p=a.initialRange.x[1]-a.initialRange.x[0],g=a.initialRange.y[0]-a.initialRange.y[1];h.dataX=h.pageX/e.plotter_.area.w*p,h.dataY=h.pageY/e.plotter_.area.h*g;var d,u;if(1==r.length)d=1,u=1;else if(r.length>=2){var c=s[1].pageX-l.pageX;d=(r[1].pageX-o.pageX)/c;var y=s[1].pageY-l.pageY;u=(r[1].pageY-o.pageY)/y}d=Math.min(8,Math.max(.125,d)),u=Math.min(8,Math.max(.125,u));var _=!1;if(a.touchDirections.x&&(e.dateWindow_=[l.dataX-h.dataX+(a.initialRange.x[0]-l.dataX)/d,l.dataX-h.dataX+(a.initialRange.x[1]-l.dataX)/d],_=!0),a.touchDirections.y)for(i=0;1>i;i++){var v=e.axes_[i],f=e.attributes_.getForAxis("logscale",i);f||(v.valueWindow=[l.dataY-h.dataY+(a.initialRange.y[0]-l.dataY)/u,l.dataY-h.dataY+(a.initialRange.y[1]-l.dataY)/u],_=!0)}if(e.drawGraph_(!1),_&&r.length>1&&e.getFunctionOption("zoomCallback")){var x=e.xAxisRange();e.getFunctionOption("zoomCallback").call(e,x[0],x[1],e.yAxisRanges())}},Dygraph.Interaction.endTouch=function(t,e,a){if(0!==t.touches.length)Dygraph.Interaction.startTouch(t,e,a);else if(1==t.changedTouches.length){var i=(new Date).getTime(),r=t.changedTouches[0];a.startTimeForDoubleTapMs&&i-a.startTimeForDoubleTapMs<500&&a.doubleTapX&&Math.abs(a.doubleTapX-r.screenX)<50&&a.doubleTapY&&Math.abs(a.doubleTapY-r.screenY)<50?e.resetZoom():(a.startTimeForDoubleTapMs=i,a.doubleTapX=r.screenX,a.doubleTapY=r.screenY)}};var e=function(t,e,a){return e>t?e-t:t>a?t-a:0},a=function(t,a){var i=Dygraph.findPos(a.canvas_),r={left:i.x,right:i.x+a.canvas_.offsetWidth,top:i.y,bottom:i.y+a.canvas_.offsetHeight},n={x:Dygraph.pageX(t),y:Dygraph.pageY(t)},o=e(n.x,r.left,r.right),s=e(n.y,r.top,r.bottom);return Math.max(o,s)};Dygraph.Interaction.defaultModel={mousedown:function(e,i,r){if(!e.button||2!=e.button){r.initializeMouseDown(e,i,r),e.altKey||e.shiftKey?Dygraph.startPan(e,i,r):Dygraph.startZoom(e,i,r);var n=function(e){if(r.isZooming){var n=a(e,i);t>n?Dygraph.moveZoom(e,i,r):null!==r.dragEndX&&(r.dragEndX=null,r.dragEndY=null,i.clearZoomRect_())}else r.isPanning&&Dygraph.movePan(e,i,r)},o=function(t){r.isZooming?null!==r.dragEndX?Dygraph.endZoom(t,i,r):Dygraph.Interaction.maybeTreatMouseOpAsClick(t,i,r):r.isPanning&&Dygraph.endPan(t,i,r),Dygraph.removeEvent(document,"mousemove",n),Dygraph.removeEvent(document,"mouseup",o),r.destroy()};i.addAndTrackEvent(document,"mousemove",n),i.addAndTrackEvent(document,"mouseup",o)}},willDestroyContextMyself:!0,touchstart:function(t,e,a){Dygraph.Interaction.startTouch(t,e,a)},touchmove:function(t,e,a){Dygraph.Interaction.moveTouch(t,e,a)},touchend:function(t,e,a){Dygraph.Interaction.endTouch(t,e,a)},dblclick:function(t,e,a){if(a.cancelNextDblclick)return void(a.cancelNextDblclick=!1);var i={canvasx:a.dragEndX,canvasy:a.dragEndY};e.cascadeEvents_("dblclick",i)||t.altKey||t.shiftKey||e.resetZoom()}},Dygraph.DEFAULT_ATTRS.interactionModel=Dygraph.Interaction.defaultModel,Dygraph.defaultInteractionModel=Dygraph.Interaction.defaultModel,Dygraph.endZoom=Dygraph.Interaction.endZoom,Dygraph.moveZoom=Dygraph.Interaction.moveZoom,Dygraph.startZoom=Dygraph.Interaction.startZoom,Dygraph.endPan=Dygraph.Interaction.endPan,Dygraph.movePan=Dygraph.Interaction.movePan,Dygraph.startPan=Dygraph.Interaction.startPan,Dygraph.Interaction.nonInteractiveModel_={mousedown:function(t,e,a){a.initializeMouseDown(t,e,a)},mouseup:Dygraph.Interaction.maybeTreatMouseOpAsClick},Dygraph.Interaction.dragIsPanInteractionModel={mousedown:function(t,e,a){a.initializeMouseDown(t,e,a),Dygraph.startPan(t,e,a)},mousemove:function(t,e,a){a.isPanning&&Dygraph.movePan(t,e,a)},mouseup:function(t,e,a){a.isPanning&&Dygraph.endPan(t,e,a)}}}(),function(){"use strict";Dygraph.TickList=void 0,Dygraph.Ticker=void 0,Dygraph.numericLinearTicks=function(t,e,a,i,r,n){var o=function(t){return"logscale"===t?!1:i(t)};return Dygraph.numericTicks(t,e,a,o,r,n)},Dygraph.numericTicks=function(t,e,a,i,r,n){var o,s,l,h,p=i("pixelsPerLabel"),g=[];if(n)for(o=0;o<n.length;o++)g.push({v:n[o]});else{if(i("logscale")){h=Math.floor(a/p);var d=Dygraph.binarySearch(t,Dygraph.PREFERRED_LOG_TICK_VALUES,1),u=Dygraph.binarySearch(e,Dygraph.PREFERRED_LOG_TICK_VALUES,-1);-1==d&&(d=0),-1==u&&(u=Dygraph.PREFERRED_LOG_TICK_VALUES.length-1);var c=null;if(u-d>=h/4){for(var y=u;y>=d;y--){var _=Dygraph.PREFERRED_LOG_TICK_VALUES[y],v=Math.log(_/t)/Math.log(e/t)*a,f={v:_};null===c?c={tickValue:_,pixel_coord:v}:Math.abs(v-c.pixel_coord)>=p?c={tickValue:_,pixel_coord:v}:f.label="",g.push(f)}g.reverse()}}if(0===g.length){var x,m,D=i("labelsKMG2");D?(x=[1,2,4,8,16,32,64,128,256],m=16):(x=[1,2,5,10,20,50,100],m=10);var w,A,b,T,E=Math.ceil(a/p),C=Math.abs(e-t)/E,L=Math.floor(Math.log(C)/Math.log(m)),P=Math.pow(m,L);for(s=0;s<x.length&&(w=P*x[s],A=Math.floor(t/w)*w,b=Math.ceil(e/w)*w,h=Math.abs(b-A)/w,T=a/h,!(T>p));s++);for(A>b&&(w*=-1),o=0;h>=o;o++)l=A+o*w,g.push({v:l})}}var S=i("axisLabelFormatter");for(o=0;o<g.length;o++)void 0===g[o].label&&(g[o].label=S.call(r,g[o].v,0,i,r));return g},Dygraph.dateTicker=function(t,e,a,i,r,n){var o=Dygraph.pickDateTickGranularity(t,e,a,i);return o>=0?Dygraph.getDateAxis(t,e,o,i,r):[]},Dygraph.SECONDLY=0,Dygraph.TWO_SECONDLY=1,Dygraph.FIVE_SECONDLY=2,Dygraph.TEN_SECONDLY=3,Dygraph.THIRTY_SECONDLY=4,Dygraph.MINUTELY=5,Dygraph.TWO_MINUTELY=6,Dygraph.FIVE_MINUTELY=7,Dygraph.TEN_MINUTELY=8,Dygraph.THIRTY_MINUTELY=9,Dygraph.HOURLY=10,Dygraph.TWO_HOURLY=11,Dygraph.SIX_HOURLY=12,Dygraph.DAILY=13,Dygraph.TWO_DAILY=14,Dygraph.WEEKLY=15,Dygraph.MONTHLY=16,Dygraph.QUARTERLY=17,Dygraph.BIANNUAL=18,Dygraph.ANNUAL=19,Dygraph.DECADAL=20,Dygraph.CENTENNIAL=21,Dygraph.NUM_GRANULARITIES=22,Dygraph.DATEFIELD_Y=0,Dygraph.DATEFIELD_M=1,Dygraph.DATEFIELD_D=2,Dygraph.DATEFIELD_HH=3,Dygraph.DATEFIELD_MM=4,Dygraph.DATEFIELD_SS=5,Dygraph.DATEFIELD_MS=6,Dygraph.NUM_DATEFIELDS=7,Dygraph.TICK_PLACEMENT=[],Dygraph.TICK_PLACEMENT[Dygraph.SECONDLY]={datefield:Dygraph.DATEFIELD_SS,step:1,spacing:1e3},Dygraph.TICK_PLACEMENT[Dygraph.TWO_SECONDLY]={datefield:Dygraph.DATEFIELD_SS,step:2,spacing:2e3},Dygraph.TICK_PLACEMENT[Dygraph.FIVE_SECONDLY]={datefield:Dygraph.DATEFIELD_SS,step:5,spacing:5e3},Dygraph.TICK_PLACEMENT[Dygraph.TEN_SECONDLY]={datefield:Dygraph.DATEFIELD_SS,step:10,spacing:1e4},Dygraph.TICK_PLACEMENT[Dygraph.THIRTY_SECONDLY]={datefield:Dygraph.DATEFIELD_SS,step:30,spacing:3e4},Dygraph.TICK_PLACEMENT[Dygraph.MINUTELY]={datefield:Dygraph.DATEFIELD_MM,step:1,spacing:6e4},Dygraph.TICK_PLACEMENT[Dygraph.TWO_MINUTELY]={datefield:Dygraph.DATEFIELD_MM,step:2,spacing:12e4},Dygraph.TICK_PLACEMENT[Dygraph.FIVE_MINUTELY]={datefield:Dygraph.DATEFIELD_MM,step:5,spacing:3e5},Dygraph.TICK_PLACEMENT[Dygraph.TEN_MINUTELY]={datefield:Dygraph.DATEFIELD_MM,step:10,spacing:6e5},Dygraph.TICK_PLACEMENT[Dygraph.THIRTY_MINUTELY]={datefield:Dygraph.DATEFIELD_MM,step:30,spacing:18e5},Dygraph.TICK_PLACEMENT[Dygraph.HOURLY]={datefield:Dygraph.DATEFIELD_HH,step:1,spacing:36e5},Dygraph.TICK_PLACEMENT[Dygraph.TWO_HOURLY]={datefield:Dygraph.DATEFIELD_HH,step:2,spacing:72e5},Dygraph.TICK_PLACEMENT[Dygraph.SIX_HOURLY]={datefield:Dygraph.DATEFIELD_HH,step:6,spacing:216e5},Dygraph.TICK_PLACEMENT[Dygraph.DAILY]={datefield:Dygraph.DATEFIELD_D,step:1,spacing:864e5},Dygraph.TICK_PLACEMENT[Dygraph.TWO_DAILY]={datefield:Dygraph.DATEFIELD_D,step:2,spacing:1728e5},Dygraph.TICK_PLACEMENT[Dygraph.WEEKLY]={datefield:Dygraph.DATEFIELD_D,step:7,spacing:6048e5},Dygraph.TICK_PLACEMENT[Dygraph.MONTHLY]={datefield:Dygraph.DATEFIELD_M,step:1,spacing:2629817280},Dygraph.TICK_PLACEMENT[Dygraph.QUARTERLY]={datefield:Dygraph.DATEFIELD_M,step:3,spacing:216e5*365.2524},Dygraph.TICK_PLACEMENT[Dygraph.BIANNUAL]={datefield:Dygraph.DATEFIELD_M,step:6,spacing:432e5*365.2524},Dygraph.TICK_PLACEMENT[Dygraph.ANNUAL]={datefield:Dygraph.DATEFIELD_Y,step:1,spacing:864e5*365.2524},Dygraph.TICK_PLACEMENT[Dygraph.DECADAL]={datefield:Dygraph.DATEFIELD_Y,step:10,spacing:315578073600},Dygraph.TICK_PLACEMENT[Dygraph.CENTENNIAL]={datefield:Dygraph.DATEFIELD_Y,step:100,spacing:3155780736e3},Dygraph.PREFERRED_LOG_TICK_VALUES=function(){for(var t=[],e=-39;39>=e;e++)for(var a=Math.pow(10,e),i=1;9>=i;i++){var r=a*i;t.push(r)}return t}(),Dygraph.pickDateTickGranularity=function(t,e,a,i){for(var r=i("pixelsPerLabel"),n=0;n<Dygraph.NUM_GRANULARITIES;n++){var o=Dygraph.numDateTicks(t,e,n);if(a/o>=r)return n}return-1},Dygraph.numDateTicks=function(t,e,a){var i=Dygraph.TICK_PLACEMENT[a].spacing;return Math.round(1*(e-t)/i)},Dygraph.getDateAxis=function(t,e,a,i,r){var n=i("axisLabelFormatter"),o=i("labelsUTC"),s=o?Dygraph.DateAccessorsUTC:Dygraph.DateAccessorsLocal,l=Dygraph.TICK_PLACEMENT[a].datefield,h=Dygraph.TICK_PLACEMENT[a].step,p=Dygraph.TICK_PLACEMENT[a].spacing,g=new Date(t),d=[];d[Dygraph.DATEFIELD_Y]=s.getFullYear(g),d[Dygraph.DATEFIELD_M]=s.getMonth(g),d[Dygraph.DATEFIELD_D]=s.getDate(g),d[Dygraph.DATEFIELD_HH]=s.getHours(g),d[Dygraph.DATEFIELD_MM]=s.getMinutes(g),d[Dygraph.DATEFIELD_SS]=s.getSeconds(g),d[Dygraph.DATEFIELD_MS]=s.getMilliseconds(g);var u=d[l]%h;a==Dygraph.WEEKLY&&(u=s.getDay(g)),d[l]-=u;for(var c=l+1;c<Dygraph.NUM_DATEFIELDS;c++)d[c]=c===Dygraph.DATEFIELD_D?1:0;var y=[],_=s.makeDate.apply(null,d),v=_.getTime();if(a<=Dygraph.HOURLY)for(t>v&&(v+=p,_=new Date(v));e>=v;)y.push({v:v,label:n.call(r,_,a,i,r)}),v+=p,_=new Date(v);else for(t>v&&(d[l]+=h,_=s.makeDate.apply(null,d),v=_.getTime());e>=v;)(a>=Dygraph.DAILY||s.getHours(_)%h===0)&&y.push({v:v,label:n.call(r,_,a,i,r)}),d[l]+=h,_=s.makeDate.apply(null,d),v=_.getTime();return y},Dygraph&&Dygraph.DEFAULT_ATTRS&&Dygraph.DEFAULT_ATTRS.axes&&Dygraph.DEFAULT_ATTRS.axes.x&&Dygraph.DEFAULT_ATTRS.axes.y&&Dygraph.DEFAULT_ATTRS.axes.y2&&(Dygraph.DEFAULT_ATTRS.axes.x.ticker=Dygraph.dateTicker,Dygraph.DEFAULT_ATTRS.axes.y.ticker=Dygraph.numericTicks,Dygraph.DEFAULT_ATTRS.axes.y2.ticker=Dygraph.numericTicks)}(),Dygraph.Plugins={},Dygraph.Plugins.Annotations=function(){"use strict";var t=function(){this.annotations_=[]};return t.prototype.toString=function(){return"Annotations Plugin"},t.prototype.activate=function(t){return{clearChart:this.clearChart,didDrawChart:this.didDrawChart}},t.prototype.detachLabels=function(){for(var t=0;t<this.annotations_.length;t++){var e=this.annotations_[t];e.parentNode&&e.parentNode.removeChild(e),this.annotations_[t]=null}this.annotations_=[]},t.prototype.clearChart=function(t){this.detachLabels()},t.prototype.didDrawChart=function(t){var e=t.dygraph,a=e.layout_.annotated_points;if(a&&0!==a.length)for(var i=t.canvas.parentNode,r={position:"absolute",fontSize:e.getOption("axisLabelFontSize")+"px",zIndex:10,overflow:"hidden"},n=function(t,a,i){return function(r){var n=i.annotation;n.hasOwnProperty(t)?n[t](n,i,e,r):e.getOption(a)&&e.getOption(a)(n,i,e,r)}},o=t.dygraph.plotter_.area,s={},l=0;l<a.length;l++){var h=a[l];if(!(h.canvasx<o.x||h.canvasx>o.x+o.w||h.canvasy<o.y||h.canvasy>o.y+o.h)){var p=h.annotation,g=6;p.hasOwnProperty("tickHeight")&&(g=p.tickHeight);var d=document.createElement("div");for(var u in r)r.hasOwnProperty(u)&&(d.style[u]=r[u]);p.hasOwnProperty("icon")||(d.className="dygraphDefaultAnnotation"),p.hasOwnProperty("cssClass")&&(d.className+=" "+p.cssClass);var c=p.hasOwnProperty("width")?p.width:16,y=p.hasOwnProperty("height")?p.height:16;if(p.hasOwnProperty("icon")){var _=document.createElement("img");_.src=p.icon,_.width=c,_.height=y,d.appendChild(_)}else h.annotation.hasOwnProperty("shortText")&&d.appendChild(document.createTextNode(h.annotation.shortText));var v=h.canvasx-c/2;d.style.left=v+"px";var f=0;if(p.attachAtBottom){var x=o.y+o.h-y-g;s[v]?x-=s[v]:s[v]=0,s[v]+=g+y,f=x}else f=h.canvasy-y-g;d.style.top=f+"px",d.style.width=c+"px",d.style.height=y+"px",d.title=h.annotation.text,d.style.color=e.colorsMap_[h.name],d.style.borderColor=e.colorsMap_[h.name],p.div=d,e.addAndTrackEvent(d,"click",n("clickHandler","annotationClickHandler",h,this)),e.addAndTrackEvent(d,"mouseover",n("mouseOverHandler","annotationMouseOverHandler",h,this)),e.addAndTrackEvent(d,"mouseout",n("mouseOutHandler","annotationMouseOutHandler",h,this)),e.addAndTrackEvent(d,"dblclick",n("dblClickHandler","annotationDblClickHandler",h,this)),i.appendChild(d),this.annotations_.push(d);var m=t.drawingContext;if(m.save(),m.strokeStyle=e.colorsMap_[h.name],m.beginPath(),p.attachAtBottom){var x=f+y;m.moveTo(h.canvasx,x),m.lineTo(h.canvasx,x+g)}else m.moveTo(h.canvasx,h.canvasy),m.lineTo(h.canvasx,h.canvasy-2-g);m.closePath(),m.stroke(),m.restore()}}},t.prototype.destroy=function(){this.detachLabels()},t}(),Dygraph.Plugins.Axes=function(){"use strict";var t=function(){this.xlabels_=[],this.ylabels_=[]};return t.prototype.toString=function(){return"Axes Plugin"},t.prototype.activate=function(t){return{layout:this.layout,clearChart:this.clearChart,willDrawChart:this.willDrawChart}},t.prototype.layout=function(t){var e=t.dygraph;if(e.getOptionForAxis("drawAxis","y")){var a=e.getOptionForAxis("axisLabelWidth","y")+2*e.getOptionForAxis("axisTickSize","y");t.reserveSpaceLeft(a)}if(e.getOptionForAxis("drawAxis","x")){var i;i=e.getOption("xAxisHeight")?e.getOption("xAxisHeight"):e.getOptionForAxis("axisLabelFontSize","x")+2*e.getOptionForAxis("axisTickSize","x"),t.reserveSpaceBottom(i)}if(2==e.numAxes()){if(e.getOptionForAxis("drawAxis","y2")){var a=e.getOptionForAxis("axisLabelWidth","y2")+2*e.getOptionForAxis("axisTickSize","y2");t.reserveSpaceRight(a)}}else e.numAxes()>2&&e.error("Only two y-axes are supported at this time. (Trying to use "+e.numAxes()+")")},t.prototype.detachLabels=function(){function t(t){for(var e=0;e<t.length;e++){var a=t[e];a.parentNode&&a.parentNode.removeChild(a)}}t(this.xlabels_),t(this.ylabels_),this.xlabels_=[],this.ylabels_=[]},t.prototype.clearChart=function(t){this.detachLabels()},t.prototype.willDrawChart=function(t){function e(t){return Math.round(t)+.5}function a(t){return Math.round(t)-.5}var i=t.dygraph;if(i.getOptionForAxis("drawAxis","x")||i.getOptionForAxis("drawAxis","y")||i.getOptionForAxis("drawAxis","y2")){var r,n,o,s,l,h=t.drawingContext,p=t.canvas.parentNode,g=i.width_,d=i.height_,u=function(t){return{position:"absolute",fontSize:i.getOptionForAxis("axisLabelFontSize",t)+"px",zIndex:10,color:i.getOptionForAxis("axisLabelColor",t),width:i.getOptionForAxis("axisLabelWidth",t)+"px",lineHeight:"normal",overflow:"hidden"}},c={x:u("x"),y:u("y"),y2:u("y2")},y=function(t,e,a){var i=document.createElement("div"),r=c["y2"==a?"y2":e];for(var n in r)r.hasOwnProperty(n)&&(i.style[n]=r[n]);var o=document.createElement("div");return o.className="dygraph-axis-label dygraph-axis-label-"+e+(a?" dygraph-axis-label-"+a:""),o.innerHTML=t,i.appendChild(o),i};h.save();var _=i.layout_,v=t.dygraph.plotter_.area,f=function(t){return function(e){return i.getOptionForAxis(e,t)}};if(i.getOptionForAxis("drawAxis","y")){if(_.yticks&&_.yticks.length>0){var x=i.numAxes(),m=[f("y"),f("y2")];for(l=0;l<_.yticks.length;l++){if(s=_.yticks[l],"function"==typeof s)return;n=v.x;var D=1,w="y1",A=m[0];1==s[0]&&(n=v.x+v.w,D=-1,w="y2",A=m[1]);var b=A("axisLabelFontSize");o=v.y+s[1]*v.h,r=y(s[2],"y",2==x?w:null);var T=o-b/2;0>T&&(T=0),T+b+3>d?r.style.bottom="0":r.style.top=T+"px",0===s[0]?(r.style.left=v.x-A("axisLabelWidth")-A("axisTickSize")+"px",r.style.textAlign="right"):1==s[0]&&(r.style.left=v.x+v.w+A("axisTickSize")+"px",r.style.textAlign="left"),r.style.width=A("axisLabelWidth")+"px",p.appendChild(r),this.ylabels_.push(r)}var E=this.ylabels_[0],b=i.getOptionForAxis("axisLabelFontSize","y"),C=parseInt(E.style.top,10)+b;C>d-b&&(E.style.top=parseInt(E.style.top,10)-b/2+"px")}var L;if(i.getOption("drawAxesAtZero")){var P=i.toPercentXCoord(0);(P>1||0>P||isNaN(P))&&(P=0),L=e(v.x+P*v.w)}else L=e(v.x);h.strokeStyle=i.getOptionForAxis("axisLineColor","y"),h.lineWidth=i.getOptionForAxis("axisLineWidth","y"),h.beginPath(),h.moveTo(L,a(v.y)),h.lineTo(L,a(v.y+v.h)),h.closePath(),h.stroke(),2==i.numAxes()&&(h.strokeStyle=i.getOptionForAxis("axisLineColor","y2"),h.lineWidth=i.getOptionForAxis("axisLineWidth","y2"),h.beginPath(),h.moveTo(a(v.x+v.w),a(v.y)),h.lineTo(a(v.x+v.w),a(v.y+v.h)),h.closePath(),h.stroke())}if(i.getOptionForAxis("drawAxis","x")){if(_.xticks){var A=f("x");for(l=0;l<_.xticks.length;l++){s=_.xticks[l],n=v.x+s[0]*v.w,o=v.y+v.h,r=y(s[1],"x"),r.style.textAlign="center",r.style.top=o+A("axisTickSize")+"px";var S=n-A("axisLabelWidth")/2;S+A("axisLabelWidth")>g&&(S=g-A("axisLabelWidth"),r.style.textAlign="right"),0>S&&(S=0,r.style.textAlign="left"),r.style.left=S+"px",r.style.width=A("axisLabelWidth")+"px",
p.appendChild(r),this.xlabels_.push(r)}}h.strokeStyle=i.getOptionForAxis("axisLineColor","x"),h.lineWidth=i.getOptionForAxis("axisLineWidth","x"),h.beginPath();var O;if(i.getOption("drawAxesAtZero")){var P=i.toPercentYCoord(0,0);(P>1||0>P)&&(P=1),O=a(v.y+P*v.h)}else O=a(v.y+v.h);h.moveTo(e(v.x),O),h.lineTo(e(v.x+v.w),O),h.closePath(),h.stroke()}h.restore()}},t}(),Dygraph.Plugins.ChartLabels=function(){"use strict";var t=function(){this.title_div_=null,this.xlabel_div_=null,this.ylabel_div_=null,this.y2label_div_=null};t.prototype.toString=function(){return"ChartLabels Plugin"},t.prototype.activate=function(t){return{layout:this.layout,didDrawChart:this.didDrawChart}};var e=function(t){var e=document.createElement("div");return e.style.position="absolute",e.style.left=t.x+"px",e.style.top=t.y+"px",e.style.width=t.w+"px",e.style.height=t.h+"px",e};t.prototype.detachLabels_=function(){for(var t=[this.title_div_,this.xlabel_div_,this.ylabel_div_,this.y2label_div_],e=0;e<t.length;e++){var a=t[e];a&&a.parentNode&&a.parentNode.removeChild(a)}this.title_div_=null,this.xlabel_div_=null,this.ylabel_div_=null,this.y2label_div_=null};var a=function(t,e,a,i,r){var n=document.createElement("div");n.style.position="absolute",1==a?n.style.left="0px":n.style.left=e.x+"px",n.style.top=e.y+"px",n.style.width=e.w+"px",n.style.height=e.h+"px",n.style.fontSize=t.getOption("yLabelWidth")-2+"px";var o=document.createElement("div");o.style.position="absolute",o.style.width=e.h+"px",o.style.height=e.w+"px",o.style.top=e.h/2-e.w/2+"px",o.style.left=e.w/2-e.h/2+"px",o.style.textAlign="center";var s="rotate("+(1==a?"-":"")+"90deg)";o.style.transform=s,o.style.WebkitTransform=s,o.style.MozTransform=s,o.style.OTransform=s,o.style.msTransform=s,"undefined"!=typeof document.documentMode&&document.documentMode<9&&(o.style.filter="progid:DXImageTransform.Microsoft.BasicImage(rotation="+(1==a?"3":"1")+")",o.style.left="0px",o.style.top="0px");var l=document.createElement("div");return l.className=i,l.innerHTML=r,o.appendChild(l),n.appendChild(o),n};return t.prototype.layout=function(t){this.detachLabels_();var i=t.dygraph,r=t.chart_div;if(i.getOption("title")){var n=t.reserveSpaceTop(i.getOption("titleHeight"));this.title_div_=e(n),this.title_div_.style.textAlign="center",this.title_div_.style.fontSize=i.getOption("titleHeight")-8+"px",this.title_div_.style.fontWeight="bold",this.title_div_.style.zIndex=10;var o=document.createElement("div");o.className="dygraph-label dygraph-title",o.innerHTML=i.getOption("title"),this.title_div_.appendChild(o),r.appendChild(this.title_div_)}if(i.getOption("xlabel")){var s=t.reserveSpaceBottom(i.getOption("xLabelHeight"));this.xlabel_div_=e(s),this.xlabel_div_.style.textAlign="center",this.xlabel_div_.style.fontSize=i.getOption("xLabelHeight")-2+"px";var o=document.createElement("div");o.className="dygraph-label dygraph-xlabel",o.innerHTML=i.getOption("xlabel"),this.xlabel_div_.appendChild(o),r.appendChild(this.xlabel_div_)}if(i.getOption("ylabel")){var l=t.reserveSpaceLeft(0);this.ylabel_div_=a(i,l,1,"dygraph-label dygraph-ylabel",i.getOption("ylabel")),r.appendChild(this.ylabel_div_)}if(i.getOption("y2label")&&2==i.numAxes()){var h=t.reserveSpaceRight(0);this.y2label_div_=a(i,h,2,"dygraph-label dygraph-y2label",i.getOption("y2label")),r.appendChild(this.y2label_div_)}},t.prototype.didDrawChart=function(t){var e=t.dygraph;this.title_div_&&(this.title_div_.children[0].innerHTML=e.getOption("title")),this.xlabel_div_&&(this.xlabel_div_.children[0].innerHTML=e.getOption("xlabel")),this.ylabel_div_&&(this.ylabel_div_.children[0].children[0].innerHTML=e.getOption("ylabel")),this.y2label_div_&&(this.y2label_div_.children[0].children[0].innerHTML=e.getOption("y2label"))},t.prototype.clearChart=function(){},t.prototype.destroy=function(){this.detachLabels_()},t}(),Dygraph.Plugins.Grid=function(){"use strict";var t=function(){};return t.prototype.toString=function(){return"Gridline Plugin"},t.prototype.activate=function(t){return{willDrawChart:this.willDrawChart}},t.prototype.willDrawChart=function(t){function e(t){return Math.round(t)+.5}function a(t){return Math.round(t)-.5}var i,r,n,o,s=t.dygraph,l=t.drawingContext,h=s.layout_,p=t.dygraph.plotter_.area;if(s.getOptionForAxis("drawGrid","y")){for(var g=["y","y2"],d=[],u=[],c=[],y=[],_=[],n=0;n<g.length;n++)c[n]=s.getOptionForAxis("drawGrid",g[n]),c[n]&&(d[n]=s.getOptionForAxis("gridLineColor",g[n]),u[n]=s.getOptionForAxis("gridLineWidth",g[n]),_[n]=s.getOptionForAxis("gridLinePattern",g[n]),y[n]=_[n]&&_[n].length>=2);for(o=h.yticks,l.save(),n=0;n<o.length;n++){var v=o[n][0];c[v]&&(y[v]&&l.installPattern(_[v]),l.strokeStyle=d[v],l.lineWidth=u[v],i=e(p.x),r=a(p.y+o[n][1]*p.h),l.beginPath(),l.moveTo(i,r),l.lineTo(i+p.w,r),l.closePath(),l.stroke(),y[v]&&l.uninstallPattern())}l.restore()}if(s.getOptionForAxis("drawGrid","x")){o=h.xticks,l.save();var _=s.getOptionForAxis("gridLinePattern","x"),y=_&&_.length>=2;for(y&&l.installPattern(_),l.strokeStyle=s.getOptionForAxis("gridLineColor","x"),l.lineWidth=s.getOptionForAxis("gridLineWidth","x"),n=0;n<o.length;n++)i=e(p.x+o[n][0]*p.w),r=a(p.y+p.h),l.beginPath(),l.moveTo(i,r),l.lineTo(i,p.y),l.closePath(),l.stroke();y&&l.uninstallPattern(),l.restore()}},t.prototype.destroy=function(){},t}(),Dygraph.Plugins.Legend=function(){"use strict";var t=function(){this.legend_div_=null,this.is_generated_div_=!1};t.prototype.toString=function(){return"Legend Plugin"};var e;t.prototype.activate=function(t){var e,a=t.getOption("labelsDivWidth"),i=t.getOption("labelsDiv");if(i&&null!==i)e="string"==typeof i||i instanceof String?document.getElementById(i):i;else{var r={position:"absolute",fontSize:"14px",zIndex:10,width:a+"px",top:"0px",left:t.size().width-a-2+"px",background:"white",lineHeight:"normal",textAlign:"left",overflow:"hidden"};Dygraph.update(r,t.getOption("labelsDivStyles")),e=document.createElement("div"),e.className="dygraph-legend";for(var n in r)if(r.hasOwnProperty(n))try{e.style[n]=r[n]}catch(o){console.warn("You are using unsupported css properties for your browser in labelsDivStyles")}t.graphDiv.appendChild(e),this.is_generated_div_=!0}return this.legend_div_=e,this.one_em_width_=10,{select:this.select,deselect:this.deselect,predraw:this.predraw,didDrawChart:this.didDrawChart}};var a=function(t){var e=document.createElement("span");e.setAttribute("style","margin: 0; padding: 0 0 0 1em; border: 0;"),t.appendChild(e);var a=e.offsetWidth;return t.removeChild(e),a},i=function(t){return t.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")};return t.prototype.select=function(e){var a=e.selectedX,i=e.selectedPoints,r=e.selectedRow,n=e.dygraph.getOption("legend");if("never"===n)return void(this.legend_div_.style.display="none");if("follow"===n){var o=e.dygraph.plotter_.area,s=e.dygraph.getOption("labelsDivWidth"),l=e.dygraph.getOptionForAxis("axisLabelWidth","y"),h=i[0].x*o.w+20,p=i[0].y*o.h-20;h+s+1>window.scrollX+window.innerWidth&&(h=h-40-s-(l-o.x)),e.dygraph.graphDiv.appendChild(this.legend_div_),this.legend_div_.style.left=l+h+"px",this.legend_div_.style.top=p+"px"}var g=t.generateLegendHTML(e.dygraph,a,i,this.one_em_width_,r);this.legend_div_.innerHTML=g,this.legend_div_.style.display=""},t.prototype.deselect=function(e){var i=e.dygraph.getOption("legend");"always"!==i&&(this.legend_div_.style.display="none");var r=a(this.legend_div_);this.one_em_width_=r;var n=t.generateLegendHTML(e.dygraph,void 0,void 0,r,null);this.legend_div_.innerHTML=n},t.prototype.didDrawChart=function(t){this.deselect(t)},t.prototype.predraw=function(t){if(this.is_generated_div_){t.dygraph.graphDiv.appendChild(this.legend_div_);var e=t.dygraph.plotter_.area,a=t.dygraph.getOption("labelsDivWidth");this.legend_div_.style.left=e.x+e.w-a-1+"px",this.legend_div_.style.top=e.y+"px",this.legend_div_.style.width=a+"px"}},t.prototype.destroy=function(){this.legend_div_=null},t.generateLegendHTML=function(t,a,r,n,o){if(t.getOption("showLabelsOnHighlight")!==!0)return"";var s,l,h,p,g,d=t.getLabels();if("undefined"==typeof a){if("always"!=t.getOption("legend"))return"";for(l=t.getOption("labelsSeparateLines"),s="",h=1;h<d.length;h++){var u=t.getPropertiesForSeries(d[h]);u.visible&&(""!==s&&(s+=l?"<br/>":" "),g=t.getOption("strokePattern",d[h]),p=e(g,u.color,n),s+="<span style='font-weight: bold; color: "+u.color+";'>"+p+" "+i(d[h])+"</span>")}return s}var c=t.optionsViewForAxis_("x"),y=c("valueFormatter");s=y.call(t,a,c,d[0],t,o,0),""!==s&&(s+=":");var _=[],v=t.numAxes();for(h=0;v>h;h++)_[h]=t.optionsViewForAxis_("y"+(h?1+h:""));var f=t.getOption("labelsShowZeroValues");l=t.getOption("labelsSeparateLines");var x=t.getHighlightSeries();for(h=0;h<r.length;h++){var m=r[h];if((0!==m.yval||f)&&Dygraph.isOK(m.canvasy)){l&&(s+="<br/>");var u=t.getPropertiesForSeries(m.name),D=_[u.axis-1],w=D("valueFormatter"),A=w.call(t,m.yval,D,m.name,t,o,d.indexOf(m.name)),b=m.name==x?" class='highlight'":"";s+="<span"+b+"> <b><span style='color: "+u.color+";'>"+i(m.name)+"</span></b>:&#160;"+A+"</span>"}}return s},e=function(t,e,a){var i=/MSIE/.test(navigator.userAgent)&&!window.opera;if(i)return"&mdash;";if(!t||t.length<=1)return'<div style="display: inline-block; position: relative; bottom: .5ex; padding-left: 1em; height: 1px; border-bottom: 2px solid '+e+';"></div>';var r,n,o,s,l,h=0,p=0,g=[];for(r=0;r<=t.length;r++)h+=t[r%t.length];if(l=Math.floor(a/(h-t[0])),l>1){for(r=0;r<t.length;r++)g[r]=t[r]/a;p=g.length}else{for(l=1,r=0;r<t.length;r++)g[r]=t[r]/h;p=g.length+1}var d="";for(n=0;l>n;n++)for(r=0;p>r;r+=2)o=g[r%g.length],s=r<t.length?g[(r+1)%g.length]:0,d+='<div style="display: inline-block; position: relative; bottom: .5ex; margin-right: '+s+"em; padding-left: "+o+"em; height: 1px; border-bottom: 2px solid "+e+';"></div>';return d},t}(),Dygraph.Plugins.RangeSelector=function(){"use strict";var t=function(){this.isIE_=/MSIE/.test(navigator.userAgent)&&!window.opera,this.hasTouchInterface_="undefined"!=typeof TouchEvent,this.isMobileDevice_=/mobile|android/gi.test(navigator.appVersion),this.interfaceCreated_=!1};return t.prototype.toString=function(){return"RangeSelector Plugin"},t.prototype.activate=function(t){return this.dygraph_=t,this.isUsingExcanvas_=t.isUsingExcanvas_,this.getOption_("showRangeSelector")&&this.createInterface_(),{layout:this.reserveSpace_,predraw:this.renderStaticLayer_,didDrawChart:this.renderInteractiveLayer_}},t.prototype.destroy=function(){this.bgcanvas_=null,this.fgcanvas_=null,this.leftZoomHandle_=null,this.rightZoomHandle_=null,this.iePanOverlay_=null},t.prototype.getOption_=function(t,e){return this.dygraph_.getOption(t,e)},t.prototype.setDefaultOption_=function(t,e){this.dygraph_.attrs_[t]=e},t.prototype.createInterface_=function(){this.createCanvases_(),this.isUsingExcanvas_&&this.createIEPanOverlay_(),this.createZoomHandles_(),this.initInteraction_(),this.getOption_("animatedZooms")&&(console.warn("Animated zooms and range selector are not compatible; disabling animatedZooms."),this.dygraph_.updateOptions({animatedZooms:!1},!0)),this.interfaceCreated_=!0,this.addToGraph_()},t.prototype.addToGraph_=function(){var t=this.graphDiv_=this.dygraph_.graphDiv;t.appendChild(this.bgcanvas_),t.appendChild(this.fgcanvas_),t.appendChild(this.leftZoomHandle_),t.appendChild(this.rightZoomHandle_)},t.prototype.removeFromGraph_=function(){var t=this.graphDiv_;t.removeChild(this.bgcanvas_),t.removeChild(this.fgcanvas_),t.removeChild(this.leftZoomHandle_),t.removeChild(this.rightZoomHandle_),this.graphDiv_=null},t.prototype.reserveSpace_=function(t){this.getOption_("showRangeSelector")&&t.reserveSpaceBottom(this.getOption_("rangeSelectorHeight")+4)},t.prototype.renderStaticLayer_=function(){this.updateVisibility_()&&(this.resize_(),this.drawStaticLayer_())},t.prototype.renderInteractiveLayer_=function(){this.updateVisibility_()&&!this.isChangingRange_&&(this.placeZoomHandles_(),this.drawInteractiveLayer_())},t.prototype.updateVisibility_=function(){var t=this.getOption_("showRangeSelector");if(t)this.interfaceCreated_?this.graphDiv_&&this.graphDiv_.parentNode||this.addToGraph_():this.createInterface_();else if(this.graphDiv_){this.removeFromGraph_();var e=this.dygraph_;setTimeout(function(){e.width_=0,e.resize()},1)}return t},t.prototype.resize_=function(){function t(t,e,a){var i=Dygraph.getContextPixelRatio(e);t.style.top=a.y+"px",t.style.left=a.x+"px",t.width=a.w*i,t.height=a.h*i,t.style.width=a.w+"px",t.style.height=a.h+"px",1!=i&&e.scale(i,i)}var e=this.dygraph_.layout_.getPlotArea(),a=0;this.dygraph_.getOptionForAxis("drawAxis","x")&&(a=this.getOption_("xAxisHeight")||this.getOption_("axisLabelFontSize")+2*this.getOption_("axisTickSize")),this.canvasRect_={x:e.x,y:e.y+e.h+a+4,w:e.w,h:this.getOption_("rangeSelectorHeight")},t(this.bgcanvas_,this.bgcanvas_ctx_,this.canvasRect_),t(this.fgcanvas_,this.fgcanvas_ctx_,this.canvasRect_)},t.prototype.createCanvases_=function(){this.bgcanvas_=Dygraph.createCanvas(),this.bgcanvas_.className="dygraph-rangesel-bgcanvas",this.bgcanvas_.style.position="absolute",this.bgcanvas_.style.zIndex=9,this.bgcanvas_ctx_=Dygraph.getContext(this.bgcanvas_),this.fgcanvas_=Dygraph.createCanvas(),this.fgcanvas_.className="dygraph-rangesel-fgcanvas",this.fgcanvas_.style.position="absolute",this.fgcanvas_.style.zIndex=9,this.fgcanvas_.style.cursor="default",this.fgcanvas_ctx_=Dygraph.getContext(this.fgcanvas_)},t.prototype.createIEPanOverlay_=function(){this.iePanOverlay_=document.createElement("div"),this.iePanOverlay_.style.position="absolute",this.iePanOverlay_.style.backgroundColor="white",this.iePanOverlay_.style.filter="alpha(opacity=0)",this.iePanOverlay_.style.display="none",this.iePanOverlay_.style.cursor="move",this.fgcanvas_.appendChild(this.iePanOverlay_)},t.prototype.createZoomHandles_=function(){var t=new Image;t.className="dygraph-rangesel-zoomhandle",t.style.position="absolute",t.style.zIndex=10,t.style.visibility="hidden",t.style.cursor="col-resize",/MSIE 7/.test(navigator.userAgent)?(t.width=7,t.height=14,t.style.backgroundColor="white",t.style.border="1px solid #333333"):(t.width=9,t.height=16,t.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAQCAYAAADESFVDAAAAAXNSR0IArs4c6QAAAAZiS0dEANAAzwDP4Z7KegAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAAd0SU1FB9sHGw0cMqdt1UwAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAaElEQVQoz+3SsRFAQBCF4Z9WJM8KCDVwownl6YXsTmCUsyKGkZzcl7zkz3YLkypgAnreFmDEpHkIwVOMfpdi9CEEN2nGpFdwD03yEqDtOgCaun7sqSTDH32I1pQA2Pb9sZecAxc5r3IAb21d6878xsAAAAAASUVORK5CYII="),this.isMobileDevice_&&(t.width*=2,t.height*=2),this.leftZoomHandle_=t,this.rightZoomHandle_=t.cloneNode(!1)},t.prototype.initInteraction_=function(){var t,e,a,i,r,n,o,s,l,h,p,g,d,u,c=this,y=document,_=0,v=null,f=!1,x=!1,m=!this.isMobileDevice_&&!this.isUsingExcanvas_,D=new Dygraph.IFrameTarp;t=function(t){var e=c.dygraph_.xAxisExtremes(),a=(e[1]-e[0])/c.canvasRect_.w,i=e[0]+(t.leftHandlePos-c.canvasRect_.x)*a,r=e[0]+(t.rightHandlePos-c.canvasRect_.x)*a;return[i,r]},e=function(t){return Dygraph.cancelEvent(t),f=!0,_=t.clientX,v=t.target?t.target:t.srcElement,("mousedown"===t.type||"dragstart"===t.type)&&(Dygraph.addEvent(y,"mousemove",a),Dygraph.addEvent(y,"mouseup",i)),c.fgcanvas_.style.cursor="col-resize",D.cover(),!0},a=function(t){if(!f)return!1;Dygraph.cancelEvent(t);var e=t.clientX-_;if(Math.abs(e)<4)return!0;_=t.clientX;var a,i=c.getZoomHandleStatus_();v==c.leftZoomHandle_?(a=i.leftHandlePos+e,a=Math.min(a,i.rightHandlePos-v.width-3),a=Math.max(a,c.canvasRect_.x)):(a=i.rightHandlePos+e,a=Math.min(a,c.canvasRect_.x+c.canvasRect_.w),a=Math.max(a,i.leftHandlePos+v.width+3));var n=v.width/2;return v.style.left=a-n+"px",c.drawInteractiveLayer_(),m&&r(),!0},i=function(t){return f?(f=!1,D.uncover(),Dygraph.removeEvent(y,"mousemove",a),Dygraph.removeEvent(y,"mouseup",i),c.fgcanvas_.style.cursor="default",m||r(),!0):!1},r=function(){try{var e=c.getZoomHandleStatus_();if(c.isChangingRange_=!0,e.isZoomed){var a=t(e);c.dygraph_.doZoomXDates_(a[0],a[1])}else c.dygraph_.resetZoom()}finally{c.isChangingRange_=!1}},n=function(t){if(c.isUsingExcanvas_)return t.srcElement==c.iePanOverlay_;var e=c.leftZoomHandle_.getBoundingClientRect(),a=e.left+e.width/2;e=c.rightZoomHandle_.getBoundingClientRect();var i=e.left+e.width/2;return t.clientX>a&&t.clientX<i},o=function(t){return!x&&n(t)&&c.getZoomHandleStatus_().isZoomed?(Dygraph.cancelEvent(t),x=!0,_=t.clientX,"mousedown"===t.type&&(Dygraph.addEvent(y,"mousemove",s),Dygraph.addEvent(y,"mouseup",l)),!0):!1},s=function(t){if(!x)return!1;Dygraph.cancelEvent(t);var e=t.clientX-_;if(Math.abs(e)<4)return!0;_=t.clientX;var a=c.getZoomHandleStatus_(),i=a.leftHandlePos,r=a.rightHandlePos,n=r-i;i+e<=c.canvasRect_.x?(i=c.canvasRect_.x,r=i+n):r+e>=c.canvasRect_.x+c.canvasRect_.w?(r=c.canvasRect_.x+c.canvasRect_.w,i=r-n):(i+=e,r+=e);var o=c.leftZoomHandle_.width/2;return c.leftZoomHandle_.style.left=i-o+"px",c.rightZoomHandle_.style.left=r-o+"px",c.drawInteractiveLayer_(),m&&h(),!0},l=function(t){return x?(x=!1,Dygraph.removeEvent(y,"mousemove",s),Dygraph.removeEvent(y,"mouseup",l),m||h(),!0):!1},h=function(){try{c.isChangingRange_=!0,c.dygraph_.dateWindow_=t(c.getZoomHandleStatus_()),c.dygraph_.drawGraph_(!1)}finally{c.isChangingRange_=!1}},p=function(t){if(!f&&!x){var e=n(t)?"move":"default";e!=c.fgcanvas_.style.cursor&&(c.fgcanvas_.style.cursor=e)}},g=function(t){"touchstart"==t.type&&1==t.targetTouches.length?e(t.targetTouches[0])&&Dygraph.cancelEvent(t):"touchmove"==t.type&&1==t.targetTouches.length?a(t.targetTouches[0])&&Dygraph.cancelEvent(t):i(t)},d=function(t){"touchstart"==t.type&&1==t.targetTouches.length?o(t.targetTouches[0])&&Dygraph.cancelEvent(t):"touchmove"==t.type&&1==t.targetTouches.length?s(t.targetTouches[0])&&Dygraph.cancelEvent(t):l(t)},u=function(t,e){for(var a=["touchstart","touchend","touchmove","touchcancel"],i=0;i<a.length;i++)c.dygraph_.addAndTrackEvent(t,a[i],e)},this.setDefaultOption_("interactionModel",Dygraph.Interaction.dragIsPanInteractionModel),this.setDefaultOption_("panEdgeFraction",1e-4);var w=window.opera?"mousedown":"dragstart";this.dygraph_.addAndTrackEvent(this.leftZoomHandle_,w,e),this.dygraph_.addAndTrackEvent(this.rightZoomHandle_,w,e),this.isUsingExcanvas_?this.dygraph_.addAndTrackEvent(this.iePanOverlay_,"mousedown",o):(this.dygraph_.addAndTrackEvent(this.fgcanvas_,"mousedown",o),this.dygraph_.addAndTrackEvent(this.fgcanvas_,"mousemove",p)),this.hasTouchInterface_&&(u(this.leftZoomHandle_,g),u(this.rightZoomHandle_,g),u(this.fgcanvas_,d))},t.prototype.drawStaticLayer_=function(){var t=this.bgcanvas_ctx_;t.clearRect(0,0,this.canvasRect_.w,this.canvasRect_.h);try{this.drawMiniPlot_()}catch(e){console.warn(e)}var a=.5;this.bgcanvas_ctx_.lineWidth=1,t.strokeStyle="gray",t.beginPath(),t.moveTo(a,a),t.lineTo(a,this.canvasRect_.h-a),t.lineTo(this.canvasRect_.w-a,this.canvasRect_.h-a),t.lineTo(this.canvasRect_.w-a,a),t.stroke()},t.prototype.drawMiniPlot_=function(){var t=this.getOption_("rangeSelectorPlotFillColor"),e=this.getOption_("rangeSelectorPlotStrokeColor");if(t||e){var a=this.getOption_("stepPlot"),i=this.computeCombinedSeriesAndLimits_(),r=i.yMax-i.yMin,n=this.bgcanvas_ctx_,o=.5,s=this.dygraph_.xAxisExtremes(),l=Math.max(s[1]-s[0],1e-30),h=(this.canvasRect_.w-o)/l,p=(this.canvasRect_.h-o)/r,g=this.canvasRect_.w-o,d=this.canvasRect_.h-o,u=null,c=null;n.beginPath(),n.moveTo(o,d);for(var y=0;y<i.data.length;y++){var _=i.data[y],v=null!==_[0]?(_[0]-s[0])*h:0/0,f=null!==_[1]?d-(_[1]-i.yMin)*p:0/0;(a||null===u||Math.round(v)!=Math.round(u))&&(isFinite(v)&&isFinite(f)?(null===u?n.lineTo(v,d):a&&n.lineTo(v,c),n.lineTo(v,f),u=v,c=f):(null!==u&&(a?(n.lineTo(v,c),n.lineTo(v,d)):n.lineTo(u,d)),u=c=null))}if(n.lineTo(g,d),n.closePath(),t){var x=this.bgcanvas_ctx_.createLinearGradient(0,0,0,d);x.addColorStop(0,"white"),x.addColorStop(1,t),this.bgcanvas_ctx_.fillStyle=x,n.fill()}e&&(this.bgcanvas_ctx_.strokeStyle=e,this.bgcanvas_ctx_.lineWidth=1.5,n.stroke())}},t.prototype.computeCombinedSeriesAndLimits_=function(){var t,e=this.dygraph_,a=this.getOption_("logscale"),i=e.numColumns(),r=e.getLabels(),n=new Array(i),o=!1;for(t=1;i>t;t++){var s=this.getOption_("showInRangeSelector",r[t]);n[t]=s,null!==s&&(o=!0)}if(!o)for(t=0;t<n.length;t++)n[t]=!0;var l=[],h=e.dataHandler_,p=e.attributes_;for(t=1;t<e.numColumns();t++)if(n[t]){var g=h.extractSeries(e.rawData_,t,p);e.rollPeriod()>1&&(g=h.rollingAverage(g,e.rollPeriod(),p)),l.push(g)}var d=[];for(t=0;t<l[0].length;t++){for(var u=0,c=0,y=0;y<l.length;y++){var _=l[y][t][1];null===_||isNaN(_)||(c++,u+=_)}d.push([l[0][t][0],u/c])}var v=Number.MAX_VALUE,f=-Number.MAX_VALUE;for(t=0;t<d.length;t++){var x=d[t][1];null!==x&&isFinite(x)&&(!a||x>0)&&(v=Math.min(v,x),f=Math.max(f,x))}var m=.25;if(a)for(f=Dygraph.log10(f),f+=f*m,v=Dygraph.log10(v),t=0;t<d.length;t++)d[t][1]=Dygraph.log10(d[t][1]);else{var D,w=f-v;D=w<=Number.MIN_VALUE?f*m:w*m,f+=D,v-=D}return{data:d,yMin:v,yMax:f}},t.prototype.placeZoomHandles_=function(){var t=this.dygraph_.xAxisExtremes(),e=this.dygraph_.xAxisRange(),a=t[1]-t[0],i=Math.max(0,(e[0]-t[0])/a),r=Math.max(0,(t[1]-e[1])/a),n=this.canvasRect_.x+this.canvasRect_.w*i,o=this.canvasRect_.x+this.canvasRect_.w*(1-r),s=Math.max(this.canvasRect_.y,this.canvasRect_.y+(this.canvasRect_.h-this.leftZoomHandle_.height)/2),l=this.leftZoomHandle_.width/2;this.leftZoomHandle_.style.left=n-l+"px",this.leftZoomHandle_.style.top=s+"px",this.rightZoomHandle_.style.left=o-l+"px",this.rightZoomHandle_.style.top=this.leftZoomHandle_.style.top,this.leftZoomHandle_.style.visibility="visible",this.rightZoomHandle_.style.visibility="visible"},t.prototype.drawInteractiveLayer_=function(){var t=this.fgcanvas_ctx_;t.clearRect(0,0,this.canvasRect_.w,this.canvasRect_.h);var e=1,a=this.canvasRect_.w-e,i=this.canvasRect_.h-e,r=this.getZoomHandleStatus_();if(t.strokeStyle="black",r.isZoomed){var n=Math.max(e,r.leftHandlePos-this.canvasRect_.x),o=Math.min(a,r.rightHandlePos-this.canvasRect_.x);t.fillStyle="rgba(240, 240, 240, 0.6)",t.fillRect(0,0,n,this.canvasRect_.h),t.fillRect(o,0,this.canvasRect_.w-o,this.canvasRect_.h),t.beginPath(),t.moveTo(e,e),t.lineTo(n,e),t.lineTo(n,i),t.lineTo(o,i),t.lineTo(o,e),t.lineTo(a,e),t.stroke(),this.isUsingExcanvas_&&(this.iePanOverlay_.style.width=o-n+"px",this.iePanOverlay_.style.left=n+"px",this.iePanOverlay_.style.height=i+"px",this.iePanOverlay_.style.display="inline")}else t.beginPath(),t.moveTo(e,e),t.lineTo(e,i),t.lineTo(a,i),t.lineTo(a,e),t.stroke(),this.iePanOverlay_&&(this.iePanOverlay_.style.display="none")},t.prototype.getZoomHandleStatus_=function(){var t=this.leftZoomHandle_.width/2,e=parseFloat(this.leftZoomHandle_.style.left)+t,a=parseFloat(this.rightZoomHandle_.style.left)+t;return{leftHandlePos:e,rightHandlePos:a,isZoomed:e-1>this.canvasRect_.x||a+1<this.canvasRect_.x+this.canvasRect_.w}},t}(),Dygraph.PLUGINS.push(Dygraph.Plugins.Legend,Dygraph.Plugins.Axes,Dygraph.Plugins.RangeSelector,Dygraph.Plugins.ChartLabels,Dygraph.Plugins.Annotations,Dygraph.Plugins.Grid),Dygraph.DataHandler=function(){},Dygraph.DataHandlers={},function(){"use strict";var t=Dygraph.DataHandler;t.X=0,t.Y=1,t.EXTRAS=2,t.prototype.extractSeries=function(t,e,a){},t.prototype.seriesToPoints=function(e,a,i){for(var r=[],n=0;n<e.length;++n){var o=e[n],s=o[1],l=null===s?null:t.parseFloat(s),h={x:0/0,y:0/0,xval:t.parseFloat(o[0]),yval:l,name:a,idx:n+i};r.push(h)}return this.onPointsCreated_(e,r),r},t.prototype.onPointsCreated_=function(t,e){},t.prototype.rollingAverage=function(t,e,a){},t.prototype.getExtremeYValues=function(t,e,a){},t.prototype.onLineEvaluated=function(t,e,a){},t.prototype.computeYInterpolation_=function(t,e,a){var i=e[1]-t[1],r=e[0]-t[0],n=i/r,o=(a-t[0])*n;return t[1]+o},t.prototype.getIndexesInWindow_=function(t,e){var a=0,i=t.length-1;if(e){for(var r=0,n=e[0],o=e[1];r<t.length-1&&t[r][0]<n;)a++,r++;for(r=t.length-1;r>0&&t[r][0]>o;)i--,r--}return i>=a?[a,i]:[0,t.length-1]},t.parseFloat=function(t){return null===t?0/0:t}}(),function(){"use strict";Dygraph.DataHandlers.DefaultHandler=function(){};var t=Dygraph.DataHandlers.DefaultHandler;t.prototype=new Dygraph.DataHandler,t.prototype.extractSeries=function(t,e,a){for(var i=[],r=a.get("logscale"),n=0;n<t.length;n++){var o=t[n][0],s=t[n][e];r&&0>=s&&(s=null),i.push([o,s])}return i},t.prototype.rollingAverage=function(t,e,a){e=Math.min(e,t.length);var i,r,n,o,s,l=[];if(1==e)return t;for(i=0;i<t.length;i++){for(o=0,s=0,r=Math.max(0,i-e+1);i+1>r;r++)n=t[r][1],null===n||isNaN(n)||(s++,o+=t[r][1]);s?l[i]=[t[i][0],o/s]:l[i]=[t[i][0],null]}return l},t.prototype.getExtremeYValues=function(t,e,a){for(var i,r=null,n=null,o=0,s=t.length-1,l=o;s>=l;l++)i=t[l][1],null===i||isNaN(i)||((null===n||i>n)&&(n=i),(null===r||r>i)&&(r=i));return[r,n]}}(),function(){"use strict";Dygraph.DataHandlers.DefaultFractionHandler=function(){};var t=Dygraph.DataHandlers.DefaultFractionHandler;t.prototype=new Dygraph.DataHandlers.DefaultHandler,t.prototype.extractSeries=function(t,e,a){for(var i,r,n,o,s,l,h=[],p=100,g=a.get("logscale"),d=0;d<t.length;d++)i=t[d][0],n=t[d][e],g&&null!==n&&(n[0]<=0||n[1]<=0)&&(n=null),null!==n?(o=n[0],s=n[1],null===o||isNaN(o)?h.push([i,o,[o,s]]):(l=s?o/s:0,r=p*l,h.push([i,r,[o,s]]))):h.push([i,null,[null,null]]);return h},t.prototype.rollingAverage=function(t,e,a){e=Math.min(e,t.length);var i,r=[],n=0,o=0,s=100;for(i=0;i<t.length;i++){n+=t[i][2][0],o+=t[i][2][1],i-e>=0&&(n-=t[i-e][2][0],o-=t[i-e][2][1]);var l=t[i][0],h=o?n/o:0;r[i]=[l,s*h]}return r}}(),function(){"use strict";Dygraph.DataHandlers.BarsHandler=function(){Dygraph.DataHandler.call(this)},Dygraph.DataHandlers.BarsHandler.prototype=new Dygraph.DataHandler;var t=Dygraph.DataHandlers.BarsHandler;t.prototype.extractSeries=function(t,e,a){},t.prototype.rollingAverage=function(t,e,a){},t.prototype.onPointsCreated_=function(t,e){for(var a=0;a<t.length;++a){var i=t[a],r=e[a];r.y_top=0/0,r.y_bottom=0/0,r.yval_minus=Dygraph.DataHandler.parseFloat(i[2][0]),r.yval_plus=Dygraph.DataHandler.parseFloat(i[2][1])}},t.prototype.getExtremeYValues=function(t,e,a){for(var i,r=null,n=null,o=0,s=t.length-1,l=o;s>=l;l++)if(i=t[l][1],null!==i&&!isNaN(i)){var h=t[l][2][0],p=t[l][2][1];h>i&&(h=i),i>p&&(p=i),(null===n||p>n)&&(n=p),(null===r||r>h)&&(r=h)}return[r,n]},t.prototype.onLineEvaluated=function(t,e,a){for(var i,r=0;r<t.length;r++)i=t[r],i.y_top=DygraphLayout.calcYNormal_(e,i.yval_minus,a),i.y_bottom=DygraphLayout.calcYNormal_(e,i.yval_plus,a)}}(),function(){"use strict";Dygraph.DataHandlers.CustomBarsHandler=function(){};var t=Dygraph.DataHandlers.CustomBarsHandler;t.prototype=new Dygraph.DataHandlers.BarsHandler,t.prototype.extractSeries=function(t,e,a){for(var i,r,n,o=[],s=a.get("logscale"),l=0;l<t.length;l++)i=t[l][0],n=t[l][e],s&&null!==n&&(n[0]<=0||n[1]<=0||n[2]<=0)&&(n=null),null!==n?(r=n[1],o.push(null===r||isNaN(r)?[i,r,[r,r]]:[i,r,[n[0],n[2]]])):o.push([i,null,[null,null]]);return o},t.prototype.rollingAverage=function(t,e,a){e=Math.min(e,t.length);var i,r,n,o,s,l,h,p=[];for(r=0,o=0,n=0,s=0,l=0;l<t.length;l++){if(i=t[l][1],h=t[l][2],p[l]=t[l],null===i||isNaN(i)||(r+=h[0],o+=i,n+=h[1],s+=1),l-e>=0){var g=t[l-e];null===g[1]||isNaN(g[1])||(r-=g[2][0],o-=g[1],n-=g[2][1],s-=1)}s?p[l]=[t[l][0],1*o/s,[1*r/s,1*n/s]]:p[l]=[t[l][0],null,[null,null]]}return p}}(),function(){"use strict";Dygraph.DataHandlers.ErrorBarsHandler=function(){};var t=Dygraph.DataHandlers.ErrorBarsHandler;t.prototype=new Dygraph.DataHandlers.BarsHandler,t.prototype.extractSeries=function(t,e,a){for(var i,r,n,o,s=[],l=a.get("sigma"),h=a.get("logscale"),p=0;p<t.length;p++)i=t[p][0],o=t[p][e],h&&null!==o&&(o[0]<=0||o[0]-l*o[1]<=0)&&(o=null),null!==o?(r=o[0],null===r||isNaN(r)?s.push([i,r,[r,r,r]]):(n=l*o[1],s.push([i,r,[r-n,r+n,o[1]]]))):s.push([i,null,[null,null,null]]);return s},t.prototype.rollingAverage=function(t,e,a){e=Math.min(e,t.length);var i,r,n,o,s,l,h,p,g,d=[],u=a.get("sigma");for(i=0;i<t.length;i++){for(s=0,p=0,l=0,r=Math.max(0,i-e+1);i+1>r;r++)n=t[r][1],null===n||isNaN(n)||(l++,s+=n,p+=Math.pow(t[r][2][2],2));l?(h=Math.sqrt(p)/l,g=s/l,d[i]=[t[i][0],g,[g-u*h,g+u*h]]):(o=1==e?t[i][1]:null,d[i]=[t[i][0],o,[o,o]])}return d}}(),function(){"use strict";Dygraph.DataHandlers.FractionsBarsHandler=function(){};var t=Dygraph.DataHandlers.FractionsBarsHandler;t.prototype=new Dygraph.DataHandlers.BarsHandler,t.prototype.extractSeries=function(t,e,a){for(var i,r,n,o,s,l,h,p,g=[],d=100,u=a.get("sigma"),c=a.get("logscale"),y=0;y<t.length;y++)i=t[y][0],n=t[y][e],c&&null!==n&&(n[0]<=0||n[1]<=0)&&(n=null),null!==n?(o=n[0],s=n[1],null===o||isNaN(o)?g.push([i,o,[o,o,o,s]]):(l=s?o/s:0,h=s?u*Math.sqrt(l*(1-l)/s):1,p=d*h,r=d*l,g.push([i,r,[r-p,r+p,o,s]]))):g.push([i,null,[null,null,null,null]]);return g},t.prototype.rollingAverage=function(t,e,a){e=Math.min(e,t.length);var i,r,n,o,s=[],l=a.get("sigma"),h=a.get("wilsonInterval"),p=0,g=0,d=100;for(n=0;n<t.length;n++){p+=t[n][2][2],g+=t[n][2][3],n-e>=0&&(p-=t[n-e][2][2],g-=t[n-e][2][3]);var u=t[n][0],c=g?p/g:0;if(h)if(g){var y=0>c?0:c,_=g,v=l*Math.sqrt(y*(1-y)/_+l*l/(4*_*_)),f=1+l*l/g;i=(y+l*l/(2*g)-v)/f,r=(y+l*l/(2*g)+v)/f,s[n]=[u,y*d,[i*d,r*d]]}else s[n]=[u,0,[0,0]];else o=g?l*Math.sqrt(c*(1-c)/g):1,s[n]=[u,d*c,[d*(c-o),d*(c+o)]]}return s}}();
/* -- end dygraph.js -- */

/* -- zepto.js -- */
/* Zepto v1.2.0 - zepto event ajax form ie - zeptojs.com/license */
!function(t,e){"function"==typeof define&&define.amd?define(function(){return e(t)}):e(t)}(this,function(t){var e=function(){function $(t){return null==t?String(t):S[C.call(t)]||"object"}function F(t){return"function"==$(t)}function k(t){return null!=t&&t==t.window}function M(t){return null!=t&&t.nodeType==t.DOCUMENT_NODE}function R(t){return"object"==$(t)}function Z(t){return R(t)&&!k(t)&&Object.getPrototypeOf(t)==Object.prototype}function z(t){var e=!!t&&"length"in t&&t.length,n=r.type(t);return"function"!=n&&!k(t)&&("array"==n||0===e||"number"==typeof e&&e>0&&e-1 in t)}function q(t){return a.call(t,function(t){return null!=t})}function H(t){return t.length>0?r.fn.concat.apply([],t):t}function I(t){return t.replace(/::/g,"/").replace(/([A-Z]+)([A-Z][a-z])/g,"$1_$2").replace(/([a-z\d])([A-Z])/g,"$1_$2").replace(/_/g,"-").toLowerCase()}function V(t){return t in l?l[t]:l[t]=new RegExp("(^|\\s)"+t+"(\\s|$)")}function _(t,e){return"number"!=typeof e||h[I(t)]?e:e+"px"}function B(t){var e,n;return c[t]||(e=f.createElement(t),f.body.appendChild(e),n=getComputedStyle(e,"").getPropertyValue("display"),e.parentNode.removeChild(e),"none"==n&&(n="block"),c[t]=n),c[t]}function U(t){return"children"in t?u.call(t.children):r.map(t.childNodes,function(t){return 1==t.nodeType?t:void 0})}function X(t,e){var n,r=t?t.length:0;for(n=0;r>n;n++)this[n]=t[n];this.length=r,this.selector=e||""}function J(t,r,i){for(n in r)i&&(Z(r[n])||L(r[n]))?(Z(r[n])&&!Z(t[n])&&(t[n]={}),L(r[n])&&!L(t[n])&&(t[n]=[]),J(t[n],r[n],i)):r[n]!==e&&(t[n]=r[n])}function W(t,e){return null==e?r(t):r(t).filter(e)}function Y(t,e,n,r){return F(e)?e.call(t,n,r):e}function G(t,e,n){null==n?t.removeAttribute(e):t.setAttribute(e,n)}function K(t,n){var r=t.className||"",i=r&&r.baseVal!==e;return n===e?i?r.baseVal:r:void(i?r.baseVal=n:t.className=n)}function Q(t){try{return t?"true"==t||("false"==t?!1:"null"==t?null:+t+""==t?+t:/^[\[\{]/.test(t)?r.parseJSON(t):t):t}catch(e){return t}}function tt(t,e){e(t);for(var n=0,r=t.childNodes.length;r>n;n++)tt(t.childNodes[n],e)}var e,n,r,i,O,P,o=[],s=o.concat,a=o.filter,u=o.slice,f=t.document,c={},l={},h={"column-count":1,columns:1,"font-weight":1,"line-height":1,opacity:1,"z-index":1,zoom:1},p=/^\s*<(\w+|!)[^>]*>/,d=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,m=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,g=/^(?:body|html)$/i,v=/([A-Z])/g,y=["val","css","html","text","data","width","height","offset"],x=["after","prepend","before","append"],b=f.createElement("table"),E=f.createElement("tr"),j={tr:f.createElement("tbody"),tbody:b,thead:b,tfoot:b,td:E,th:E,"*":f.createElement("div")},w=/complete|loaded|interactive/,T=/^[\w-]*$/,S={},C=S.toString,N={},A=f.createElement("div"),D={tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder",contenteditable:"contentEditable"},L=Array.isArray||function(t){return t instanceof Array};return N.matches=function(t,e){if(!e||!t||1!==t.nodeType)return!1;var n=t.matches||t.webkitMatchesSelector||t.mozMatchesSelector||t.oMatchesSelector||t.matchesSelector;if(n)return n.call(t,e);var r,i=t.parentNode,o=!i;return o&&(i=A).appendChild(t),r=~N.qsa(i,e).indexOf(t),o&&A.removeChild(t),r},O=function(t){return t.replace(/-+(.)?/g,function(t,e){return e?e.toUpperCase():""})},P=function(t){return a.call(t,function(e,n){return t.indexOf(e)==n})},N.fragment=function(t,n,i){var o,s,a;return d.test(t)&&(o=r(f.createElement(RegExp.$1))),o||(t.replace&&(t=t.replace(m,"<$1></$2>")),n===e&&(n=p.test(t)&&RegExp.$1),n in j||(n="*"),a=j[n],a.innerHTML=""+t,o=r.each(u.call(a.childNodes),function(){a.removeChild(this)})),Z(i)&&(s=r(o),r.each(i,function(t,e){y.indexOf(t)>-1?s[t](e):s.attr(t,e)})),o},N.Z=function(t,e){return new X(t,e)},N.isZ=function(t){return t instanceof N.Z},N.init=function(t,n){var i;if(!t)return N.Z();if("string"==typeof t)if(t=t.trim(),"<"==t[0]&&p.test(t))i=N.fragment(t,RegExp.$1,n),t=null;else{if(n!==e)return r(n).find(t);i=N.qsa(f,t)}else{if(F(t))return r(f).ready(t);if(N.isZ(t))return t;if(L(t))i=q(t);else if(R(t))i=[t],t=null;else if(p.test(t))i=N.fragment(t.trim(),RegExp.$1,n),t=null;else{if(n!==e)return r(n).find(t);i=N.qsa(f,t)}}return N.Z(i,t)},r=function(t,e){return N.init(t,e)},r.extend=function(t){var e,n=u.call(arguments,1);return"boolean"==typeof t&&(e=t,t=n.shift()),n.forEach(function(n){J(t,n,e)}),t},N.qsa=function(t,e){var n,r="#"==e[0],i=!r&&"."==e[0],o=r||i?e.slice(1):e,s=T.test(o);return t.getElementById&&s&&r?(n=t.getElementById(o))?[n]:[]:1!==t.nodeType&&9!==t.nodeType&&11!==t.nodeType?[]:u.call(s&&!r&&t.getElementsByClassName?i?t.getElementsByClassName(o):t.getElementsByTagName(e):t.querySelectorAll(e))},r.contains=f.documentElement.contains?function(t,e){return t!==e&&t.contains(e)}:function(t,e){for(;e&&(e=e.parentNode);)if(e===t)return!0;return!1},r.type=$,r.isFunction=F,r.isWindow=k,r.isArray=L,r.isPlainObject=Z,r.isEmptyObject=function(t){var e;for(e in t)return!1;return!0},r.isNumeric=function(t){var e=Number(t),n=typeof t;return null!=t&&"boolean"!=n&&("string"!=n||t.length)&&!isNaN(e)&&isFinite(e)||!1},r.inArray=function(t,e,n){return o.indexOf.call(e,t,n)},r.camelCase=O,r.trim=function(t){return null==t?"":String.prototype.trim.call(t)},r.uuid=0,r.support={},r.expr={},r.noop=function(){},r.map=function(t,e){var n,i,o,r=[];if(z(t))for(i=0;i<t.length;i++)n=e(t[i],i),null!=n&&r.push(n);else for(o in t)n=e(t[o],o),null!=n&&r.push(n);return H(r)},r.each=function(t,e){var n,r;if(z(t)){for(n=0;n<t.length;n++)if(e.call(t[n],n,t[n])===!1)return t}else for(r in t)if(e.call(t[r],r,t[r])===!1)return t;return t},r.grep=function(t,e){return a.call(t,e)},t.JSON&&(r.parseJSON=JSON.parse),r.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(t,e){S["[object "+e+"]"]=e.toLowerCase()}),r.fn={constructor:N.Z,length:0,forEach:o.forEach,reduce:o.reduce,push:o.push,sort:o.sort,splice:o.splice,indexOf:o.indexOf,concat:function(){var t,e,n=[];for(t=0;t<arguments.length;t++)e=arguments[t],n[t]=N.isZ(e)?e.toArray():e;return s.apply(N.isZ(this)?this.toArray():this,n)},map:function(t){return r(r.map(this,function(e,n){return t.call(e,n,e)}))},slice:function(){return r(u.apply(this,arguments))},ready:function(t){return w.test(f.readyState)&&f.body?t(r):f.addEventListener("DOMContentLoaded",function(){t(r)},!1),this},get:function(t){return t===e?u.call(this):this[t>=0?t:t+this.length]},toArray:function(){return this.get()},size:function(){return this.length},remove:function(){return this.each(function(){null!=this.parentNode&&this.parentNode.removeChild(this)})},each:function(t){return o.every.call(this,function(e,n){return t.call(e,n,e)!==!1}),this},filter:function(t){return F(t)?this.not(this.not(t)):r(a.call(this,function(e){return N.matches(e,t)}))},add:function(t,e){return r(P(this.concat(r(t,e))))},is:function(t){return this.length>0&&N.matches(this[0],t)},not:function(t){var n=[];if(F(t)&&t.call!==e)this.each(function(e){t.call(this,e)||n.push(this)});else{var i="string"==typeof t?this.filter(t):z(t)&&F(t.item)?u.call(t):r(t);this.forEach(function(t){i.indexOf(t)<0&&n.push(t)})}return r(n)},has:function(t){return this.filter(function(){return R(t)?r.contains(this,t):r(this).find(t).size()})},eq:function(t){return-1===t?this.slice(t):this.slice(t,+t+1)},first:function(){var t=this[0];return t&&!R(t)?t:r(t)},last:function(){var t=this[this.length-1];return t&&!R(t)?t:r(t)},find:function(t){var e,n=this;return e=t?"object"==typeof t?r(t).filter(function(){var t=this;return o.some.call(n,function(e){return r.contains(e,t)})}):1==this.length?r(N.qsa(this[0],t)):this.map(function(){return N.qsa(this,t)}):r()},closest:function(t,e){var n=[],i="object"==typeof t&&r(t);return this.each(function(r,o){for(;o&&!(i?i.indexOf(o)>=0:N.matches(o,t));)o=o!==e&&!M(o)&&o.parentNode;o&&n.indexOf(o)<0&&n.push(o)}),r(n)},parents:function(t){for(var e=[],n=this;n.length>0;)n=r.map(n,function(t){return(t=t.parentNode)&&!M(t)&&e.indexOf(t)<0?(e.push(t),t):void 0});return W(e,t)},parent:function(t){return W(P(this.pluck("parentNode")),t)},children:function(t){return W(this.map(function(){return U(this)}),t)},contents:function(){return this.map(function(){return this.contentDocument||u.call(this.childNodes)})},siblings:function(t){return W(this.map(function(t,e){return a.call(U(e.parentNode),function(t){return t!==e})}),t)},empty:function(){return this.each(function(){this.innerHTML=""})},pluck:function(t){return r.map(this,function(e){return e[t]})},show:function(){return this.each(function(){"none"==this.style.display&&(this.style.display=""),"none"==getComputedStyle(this,"").getPropertyValue("display")&&(this.style.display=B(this.nodeName))})},replaceWith:function(t){return this.before(t).remove()},wrap:function(t){var e=F(t);if(this[0]&&!e)var n=r(t).get(0),i=n.parentNode||this.length>1;return this.each(function(o){r(this).wrapAll(e?t.call(this,o):i?n.cloneNode(!0):n)})},wrapAll:function(t){if(this[0]){r(this[0]).before(t=r(t));for(var e;(e=t.children()).length;)t=e.first();r(t).append(this)}return this},wrapInner:function(t){var e=F(t);return this.each(function(n){var i=r(this),o=i.contents(),s=e?t.call(this,n):t;o.length?o.wrapAll(s):i.append(s)})},unwrap:function(){return this.parent().each(function(){r(this).replaceWith(r(this).children())}),this},clone:function(){return this.map(function(){return this.cloneNode(!0)})},hide:function(){return this.css("display","none")},toggle:function(t){return this.each(function(){var n=r(this);(t===e?"none"==n.css("display"):t)?n.show():n.hide()})},prev:function(t){return r(this.pluck("previousElementSibling")).filter(t||"*")},next:function(t){return r(this.pluck("nextElementSibling")).filter(t||"*")},html:function(t){return 0 in arguments?this.each(function(e){var n=this.innerHTML;r(this).empty().append(Y(this,t,e,n))}):0 in this?this[0].innerHTML:null},text:function(t){return 0 in arguments?this.each(function(e){var n=Y(this,t,e,this.textContent);this.textContent=null==n?"":""+n}):0 in this?this.pluck("textContent").join(""):null},attr:function(t,r){var i;return"string"!=typeof t||1 in arguments?this.each(function(e){if(1===this.nodeType)if(R(t))for(n in t)G(this,n,t[n]);else G(this,t,Y(this,r,e,this.getAttribute(t)))}):0 in this&&1==this[0].nodeType&&null!=(i=this[0].getAttribute(t))?i:e},removeAttr:function(t){return this.each(function(){1===this.nodeType&&t.split(" ").forEach(function(t){G(this,t)},this)})},prop:function(t,e){return t=D[t]||t,1 in arguments?this.each(function(n){this[t]=Y(this,e,n,this[t])}):this[0]&&this[0][t]},removeProp:function(t){return t=D[t]||t,this.each(function(){delete this[t]})},data:function(t,n){var r="data-"+t.replace(v,"-$1").toLowerCase(),i=1 in arguments?this.attr(r,n):this.attr(r);return null!==i?Q(i):e},val:function(t){return 0 in arguments?(null==t&&(t=""),this.each(function(e){this.value=Y(this,t,e,this.value)})):this[0]&&(this[0].multiple?r(this[0]).find("option").filter(function(){return this.selected}).pluck("value"):this[0].value)},offset:function(e){if(e)return this.each(function(t){var n=r(this),i=Y(this,e,t,n.offset()),o=n.offsetParent().offset(),s={top:i.top-o.top,left:i.left-o.left};"static"==n.css("position")&&(s.position="relative"),n.css(s)});if(!this.length)return null;if(f.documentElement!==this[0]&&!r.contains(f.documentElement,this[0]))return{top:0,left:0};var n=this[0].getBoundingClientRect();return{left:n.left+t.pageXOffset,top:n.top+t.pageYOffset,width:Math.round(n.width),height:Math.round(n.height)}},css:function(t,e){if(arguments.length<2){var i=this[0];if("string"==typeof t){if(!i)return;return i.style[O(t)]||getComputedStyle(i,"").getPropertyValue(t)}if(L(t)){if(!i)return;var o={},s=getComputedStyle(i,"");return r.each(t,function(t,e){o[e]=i.style[O(e)]||s.getPropertyValue(e)}),o}}var a="";if("string"==$(t))e||0===e?a=I(t)+":"+_(t,e):this.each(function(){this.style.removeProperty(I(t))});else for(n in t)t[n]||0===t[n]?a+=I(n)+":"+_(n,t[n])+";":this.each(function(){this.style.removeProperty(I(n))});return this.each(function(){this.style.cssText+=";"+a})},index:function(t){return t?this.indexOf(r(t)[0]):this.parent().children().indexOf(this[0])},hasClass:function(t){return t?o.some.call(this,function(t){return this.test(K(t))},V(t)):!1},addClass:function(t){return t?this.each(function(e){if("className"in this){i=[];var n=K(this),o=Y(this,t,e,n);o.split(/\s+/g).forEach(function(t){r(this).hasClass(t)||i.push(t)},this),i.length&&K(this,n+(n?" ":"")+i.join(" "))}}):this},removeClass:function(t){return this.each(function(n){if("className"in this){if(t===e)return K(this,"");i=K(this),Y(this,t,n,i).split(/\s+/g).forEach(function(t){i=i.replace(V(t)," ")}),K(this,i.trim())}})},toggleClass:function(t,n){return t?this.each(function(i){var o=r(this),s=Y(this,t,i,K(this));s.split(/\s+/g).forEach(function(t){(n===e?!o.hasClass(t):n)?o.addClass(t):o.removeClass(t)})}):this},scrollTop:function(t){if(this.length){var n="scrollTop"in this[0];return t===e?n?this[0].scrollTop:this[0].pageYOffset:this.each(n?function(){this.scrollTop=t}:function(){this.scrollTo(this.scrollX,t)})}},scrollLeft:function(t){if(this.length){var n="scrollLeft"in this[0];return t===e?n?this[0].scrollLeft:this[0].pageXOffset:this.each(n?function(){this.scrollLeft=t}:function(){this.scrollTo(t,this.scrollY)})}},position:function(){if(this.length){var t=this[0],e=this.offsetParent(),n=this.offset(),i=g.test(e[0].nodeName)?{top:0,left:0}:e.offset();return n.top-=parseFloat(r(t).css("margin-top"))||0,n.left-=parseFloat(r(t).css("margin-left"))||0,i.top+=parseFloat(r(e[0]).css("border-top-width"))||0,i.left+=parseFloat(r(e[0]).css("border-left-width"))||0,{top:n.top-i.top,left:n.left-i.left}}},offsetParent:function(){return this.map(function(){for(var t=this.offsetParent||f.body;t&&!g.test(t.nodeName)&&"static"==r(t).css("position");)t=t.offsetParent;return t})}},r.fn.detach=r.fn.remove,["width","height"].forEach(function(t){var n=t.replace(/./,function(t){return t[0].toUpperCase()});r.fn[t]=function(i){var o,s=this[0];return i===e?k(s)?s["inner"+n]:M(s)?s.documentElement["scroll"+n]:(o=this.offset())&&o[t]:this.each(function(e){s=r(this),s.css(t,Y(this,i,e,s[t]()))})}}),x.forEach(function(n,i){var o=i%2;r.fn[n]=function(){var n,a,s=r.map(arguments,function(t){var i=[];return n=$(t),"array"==n?(t.forEach(function(t){return t.nodeType!==e?i.push(t):r.zepto.isZ(t)?i=i.concat(t.get()):void(i=i.concat(N.fragment(t)))}),i):"object"==n||null==t?t:N.fragment(t)}),u=this.length>1;return s.length<1?this:this.each(function(e,n){a=o?n:n.parentNode,n=0==i?n.nextSibling:1==i?n.firstChild:2==i?n:null;var c=r.contains(f.documentElement,a);s.forEach(function(e){if(u)e=e.cloneNode(!0);else if(!a)return r(e).remove();a.insertBefore(e,n),c&&tt(e,function(e){if(!(null==e.nodeName||"SCRIPT"!==e.nodeName.toUpperCase()||e.type&&"text/javascript"!==e.type||e.src)){var n=e.ownerDocument?e.ownerDocument.defaultView:t;n.eval.call(n,e.innerHTML)}})})})},r.fn[o?n+"To":"insert"+(i?"Before":"After")]=function(t){return r(t)[n](this),this}}),N.Z.prototype=X.prototype=r.fn,N.uniq=P,N.deserializeValue=Q,r.zepto=N,r}();return t.Zepto=e,void 0===t.$&&(t.$=e),function(e){function h(t){return t._zid||(t._zid=n++)}function p(t,e,n,r){if(e=d(e),e.ns)var i=m(e.ns);return(a[h(t)]||[]).filter(function(t){return t&&(!e.e||t.e==e.e)&&(!e.ns||i.test(t.ns))&&(!n||h(t.fn)===h(n))&&(!r||t.sel==r)})}function d(t){var e=(""+t).split(".");return{e:e[0],ns:e.slice(1).sort().join(" ")}}function m(t){return new RegExp("(?:^| )"+t.replace(" "," .* ?")+"(?: |$)")}function g(t,e){return t.del&&!f&&t.e in c||!!e}function v(t){return l[t]||f&&c[t]||t}function y(t,n,i,o,s,u,f){var c=h(t),p=a[c]||(a[c]=[]);n.split(/\s/).forEach(function(n){if("ready"==n)return e(document).ready(i);var a=d(n);a.fn=i,a.sel=s,a.e in l&&(i=function(t){var n=t.relatedTarget;return!n||n!==this&&!e.contains(this,n)?a.fn.apply(this,arguments):void 0}),a.del=u;var c=u||i;a.proxy=function(e){if(e=T(e),!e.isImmediatePropagationStopped()){e.data=o;var n=c.apply(t,e._args==r?[e]:[e].concat(e._args));return n===!1&&(e.preventDefault(),e.stopPropagation()),n}},a.i=p.length,p.push(a),"addEventListener"in t&&t.addEventListener(v(a.e),a.proxy,g(a,f))})}function x(t,e,n,r,i){var o=h(t);(e||"").split(/\s/).forEach(function(e){p(t,e,n,r).forEach(function(e){delete a[o][e.i],"removeEventListener"in t&&t.removeEventListener(v(e.e),e.proxy,g(e,i))})})}function T(t,n){return(n||!t.isDefaultPrevented)&&(n||(n=t),e.each(w,function(e,r){var i=n[e];t[e]=function(){return this[r]=b,i&&i.apply(n,arguments)},t[r]=E}),t.timeStamp||(t.timeStamp=Date.now()),(n.defaultPrevented!==r?n.defaultPrevented:"returnValue"in n?n.returnValue===!1:n.getPreventDefault&&n.getPreventDefault())&&(t.isDefaultPrevented=b)),t}function S(t){var e,n={originalEvent:t};for(e in t)j.test(e)||t[e]===r||(n[e]=t[e]);return T(n,t)}var r,n=1,i=Array.prototype.slice,o=e.isFunction,s=function(t){return"string"==typeof t},a={},u={},f="onfocusin"in t,c={focus:"focusin",blur:"focusout"},l={mouseenter:"mouseover",mouseleave:"mouseout"};u.click=u.mousedown=u.mouseup=u.mousemove="MouseEvents",e.event={add:y,remove:x},e.proxy=function(t,n){var r=2 in arguments&&i.call(arguments,2);if(o(t)){var a=function(){return t.apply(n,r?r.concat(i.call(arguments)):arguments)};return a._zid=h(t),a}if(s(n))return r?(r.unshift(t[n],t),e.proxy.apply(null,r)):e.proxy(t[n],t);throw new TypeError("expected function")},e.fn.bind=function(t,e,n){return this.on(t,e,n)},e.fn.unbind=function(t,e){return this.off(t,e)},e.fn.one=function(t,e,n,r){return this.on(t,e,n,r,1)};var b=function(){return!0},E=function(){return!1},j=/^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,w={preventDefault:"isDefaultPrevented",stopImmediatePropagation:"isImmediatePropagationStopped",stopPropagation:"isPropagationStopped"};e.fn.delegate=function(t,e,n){return this.on(e,t,n)},e.fn.undelegate=function(t,e,n){return this.off(e,t,n)},e.fn.live=function(t,n){return e(document.body).delegate(this.selector,t,n),this},e.fn.die=function(t,n){return e(document.body).undelegate(this.selector,t,n),this},e.fn.on=function(t,n,a,u,f){var c,l,h=this;return t&&!s(t)?(e.each(t,function(t,e){h.on(t,n,a,e,f)}),h):(s(n)||o(u)||u===!1||(u=a,a=n,n=r),(u===r||a===!1)&&(u=a,a=r),u===!1&&(u=E),h.each(function(r,o){f&&(c=function(t){return x(o,t.type,u),u.apply(this,arguments)}),n&&(l=function(t){var r,s=e(t.target).closest(n,o).get(0);return s&&s!==o?(r=e.extend(S(t),{currentTarget:s,liveFired:o}),(c||u).apply(s,[r].concat(i.call(arguments,1)))):void 0}),y(o,t,u,a,n,l||c)}))},e.fn.off=function(t,n,i){var a=this;return t&&!s(t)?(e.each(t,function(t,e){a.off(t,n,e)}),a):(s(n)||o(i)||i===!1||(i=n,n=r),i===!1&&(i=E),a.each(function(){x(this,t,i,n)}))},e.fn.trigger=function(t,n){return t=s(t)||e.isPlainObject(t)?e.Event(t):T(t),t._args=n,this.each(function(){t.type in c&&"function"==typeof this[t.type]?this[t.type]():"dispatchEvent"in this?this.dispatchEvent(t):e(this).triggerHandler(t,n)})},e.fn.triggerHandler=function(t,n){var r,i;return this.each(function(o,a){r=S(s(t)?e.Event(t):t),r._args=n,r.target=a,e.each(p(a,t.type||t),function(t,e){return i=e.proxy(r),r.isImmediatePropagationStopped()?!1:void 0})}),i},"focusin focusout focus blur load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select keydown keypress keyup error".split(" ").forEach(function(t){e.fn[t]=function(e){return 0 in arguments?this.bind(t,e):this.trigger(t)}}),e.Event=function(t,e){s(t)||(e=t,t=e.type);var n=document.createEvent(u[t]||"Events"),r=!0;if(e)for(var i in e)"bubbles"==i?r=!!e[i]:n[i]=e[i];return n.initEvent(t,r,!0),T(n)}}(e),function(e){function p(t,n,r){var i=e.Event(n);return e(t).trigger(i,r),!i.isDefaultPrevented()}function d(t,e,n,i){return t.global?p(e||r,n,i):void 0}function m(t){t.global&&0===e.active++&&d(t,null,"ajaxStart")}function g(t){t.global&&!--e.active&&d(t,null,"ajaxStop")}function v(t,e){var n=e.context;return e.beforeSend.call(n,t,e)===!1||d(e,n,"ajaxBeforeSend",[t,e])===!1?!1:void d(e,n,"ajaxSend",[t,e])}function y(t,e,n,r){var i=n.context,o="success";n.success.call(i,t,o,e),r&&r.resolveWith(i,[t,o,e]),d(n,i,"ajaxSuccess",[e,n,t]),b(o,e,n)}function x(t,e,n,r,i){var o=r.context;r.error.call(o,n,e,t),i&&i.rejectWith(o,[n,e,t]),d(r,o,"ajaxError",[n,r,t||e]),b(e,n,r)}function b(t,e,n){var r=n.context;n.complete.call(r,e,t),d(n,r,"ajaxComplete",[e,n]),g(n)}function E(t,e,n){if(n.dataFilter==j)return t;var r=n.context;return n.dataFilter.call(r,t,e)}function j(){}function w(t){return t&&(t=t.split(";",2)[0]),t&&(t==c?"html":t==f?"json":a.test(t)?"script":u.test(t)&&"xml")||"text"}function T(t,e){return""==e?t:(t+"&"+e).replace(/[&?]{1,2}/,"?")}function S(t){t.processData&&t.data&&"string"!=e.type(t.data)&&(t.data=e.param(t.data,t.traditional)),!t.data||t.type&&"GET"!=t.type.toUpperCase()&&"jsonp"!=t.dataType||(t.url=T(t.url,t.data),t.data=void 0)}function C(t,n,r,i){return e.isFunction(n)&&(i=r,r=n,n=void 0),e.isFunction(r)||(i=r,r=void 0),{url:t,data:n,success:r,dataType:i}}function O(t,n,r,i){var o,s=e.isArray(n),a=e.isPlainObject(n);e.each(n,function(n,u){o=e.type(u),i&&(n=r?i:i+"["+(a||"object"==o||"array"==o?n:"")+"]"),!i&&s?t.add(u.name,u.value):"array"==o||!r&&"object"==o?O(t,u,r,n):t.add(n,u)})}var i,o,n=+new Date,r=t.document,s=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,a=/^(?:text|application)\/javascript/i,u=/^(?:text|application)\/xml/i,f="application/json",c="text/html",l=/^\s*$/,h=r.createElement("a");h.href=t.location.href,e.active=0,e.ajaxJSONP=function(i,o){if(!("type"in i))return e.ajax(i);var c,p,s=i.jsonpCallback,a=(e.isFunction(s)?s():s)||"Zepto"+n++,u=r.createElement("script"),f=t[a],l=function(t){e(u).triggerHandler("error",t||"abort")},h={abort:l};return o&&o.promise(h),e(u).on("load error",function(n,r){clearTimeout(p),e(u).off().remove(),"error"!=n.type&&c?y(c[0],h,i,o):x(null,r||"error",h,i,o),t[a]=f,c&&e.isFunction(f)&&f(c[0]),f=c=void 0}),v(h,i)===!1?(l("abort"),h):(t[a]=function(){c=arguments},u.src=i.url.replace(/\?(.+)=\?/,"?$1="+a),r.head.appendChild(u),i.timeout>0&&(p=setTimeout(function(){l("timeout")},i.timeout)),h)},e.ajaxSettings={type:"GET",beforeSend:j,success:j,error:j,complete:j,context:null,global:!0,xhr:function(){return new t.XMLHttpRequest},accepts:{script:"text/javascript, application/javascript, application/x-javascript",json:f,xml:"application/xml, text/xml",html:c,text:"text/plain"},crossDomain:!1,timeout:0,processData:!0,cache:!0,dataFilter:j},e.ajax=function(n){var u,f,s=e.extend({},n||{}),a=e.Deferred&&e.Deferred();for(i in e.ajaxSettings)void 0===s[i]&&(s[i]=e.ajaxSettings[i]);m(s),s.crossDomain||(u=r.createElement("a"),u.href=s.url,u.href=u.href,s.crossDomain=h.protocol+"//"+h.host!=u.protocol+"//"+u.host),s.url||(s.url=t.location.toString()),(f=s.url.indexOf("#"))>-1&&(s.url=s.url.slice(0,f)),S(s);var c=s.dataType,p=/\?.+=\?/.test(s.url);if(p&&(c="jsonp"),s.cache!==!1&&(n&&n.cache===!0||"script"!=c&&"jsonp"!=c)||(s.url=T(s.url,"_="+Date.now())),"jsonp"==c)return p||(s.url=T(s.url,s.jsonp?s.jsonp+"=?":s.jsonp===!1?"":"callback=?")),e.ajaxJSONP(s,a);var P,d=s.accepts[c],g={},b=function(t,e){g[t.toLowerCase()]=[t,e]},C=/^([\w-]+:)\/\//.test(s.url)?RegExp.$1:t.location.protocol,N=s.xhr(),O=N.setRequestHeader;if(a&&a.promise(N),s.crossDomain||b("X-Requested-With","XMLHttpRequest"),b("Accept",d||"*/*"),(d=s.mimeType||d)&&(d.indexOf(",")>-1&&(d=d.split(",",2)[0]),N.overrideMimeType&&N.overrideMimeType(d)),(s.contentType||s.contentType!==!1&&s.data&&"GET"!=s.type.toUpperCase())&&b("Content-Type",s.contentType||"application/x-www-form-urlencoded"),s.headers)for(o in s.headers)b(o,s.headers[o]);if(N.setRequestHeader=b,N.onreadystatechange=function(){if(4==N.readyState){N.onreadystatechange=j,clearTimeout(P);var t,n=!1;if(N.status>=200&&N.status<300||304==N.status||0==N.status&&"file:"==C){if(c=c||w(s.mimeType||N.getResponseHeader("content-type")),"arraybuffer"==N.responseType||"blob"==N.responseType)t=N.response;else{t=N.responseText;try{t=E(t,c,s),"script"==c?(1,eval)(t):"xml"==c?t=N.responseXML:"json"==c&&(t=l.test(t)?null:e.parseJSON(t))}catch(r){n=r}if(n)return x(n,"parsererror",N,s,a)}y(t,N,s,a)}else x(N.statusText||null,N.status?"error":"abort",N,s,a)}},v(N,s)===!1)return N.abort(),x(null,"abort",N,s,a),N;var A="async"in s?s.async:!0;if(N.open(s.type,s.url,A,s.username,s.password),s.xhrFields)for(o in s.xhrFields)N[o]=s.xhrFields[o];for(o in g)O.apply(N,g[o]);return s.timeout>0&&(P=setTimeout(function(){N.onreadystatechange=j,N.abort(),x(null,"timeout",N,s,a)},s.timeout)),N.send(s.data?s.data:null),N},e.get=function(){return e.ajax(C.apply(null,arguments))},e.post=function(){var t=C.apply(null,arguments);return t.type="POST",e.ajax(t)},e.getJSON=function(){var t=C.apply(null,arguments);return t.dataType="json",e.ajax(t)},e.fn.load=function(t,n,r){if(!this.length)return this;var a,i=this,o=t.split(/\s/),u=C(t,n,r),f=u.success;return o.length>1&&(u.url=o[0],a=o[1]),u.success=function(t){i.html(a?e("<div>").html(t.replace(s,"")).find(a):t),f&&f.apply(i,arguments)},e.ajax(u),this};var N=encodeURIComponent;e.param=function(t,n){var r=[];return r.add=function(t,n){e.isFunction(n)&&(n=n()),null==n&&(n=""),this.push(N(t)+"="+N(n))},O(r,t,n),r.join("&").replace(/%20/g,"+")}}(e),function(t){t.fn.serializeArray=function(){var e,n,r=[],i=function(t){return t.forEach?t.forEach(i):void r.push({name:e,value:t})};return this[0]&&t.each(this[0].elements,function(r,o){n=o.type,e=o.name,e&&"fieldset"!=o.nodeName.toLowerCase()&&!o.disabled&&"submit"!=n&&"reset"!=n&&"button"!=n&&"file"!=n&&("radio"!=n&&"checkbox"!=n||o.checked)&&i(t(o).val())}),r},t.fn.serialize=function(){var t=[];return this.serializeArray().forEach(function(e){t.push(encodeURIComponent(e.name)+"="+encodeURIComponent(e.value))}),t.join("&")},t.fn.submit=function(e){if(0 in arguments)this.bind("submit",e);else if(this.length){var n=t.Event("submit");this.eq(0).trigger(n),n.isDefaultPrevented()||this.get(0).submit()}return this}}(e),function(){try{getComputedStyle(void 0)}catch(e){var n=getComputedStyle;t.getComputedStyle=function(t,e){try{return n(t,e)}catch(r){return null}}}}(),e});
/* -- end zepto.js -- */

/*! nouislider - 9.1.0 - 2016-12-10 16:00:32 */
!function(a){"function"==typeof define&&define.amd?define([],a):"object"==typeof exports?module.exports=a():window.noUiSlider=a()}(function(){"use strict";function a(a,b){var c=document.createElement("div");return j(c,b),a.appendChild(c),c}function b(a){return a.filter(function(a){return!this[a]&&(this[a]=!0)},{})}function c(a,b){return Math.round(a/b)*b}function d(a,b){var c=a.getBoundingClientRect(),d=a.ownerDocument,e=d.documentElement,f=m();return/webkit.*Chrome.*Mobile/i.test(navigator.userAgent)&&(f.x=0),b?c.top+f.y-e.clientTop:c.left+f.x-e.clientLeft}function e(a){return"number"==typeof a&&!isNaN(a)&&isFinite(a)}function f(a,b,c){c>0&&(j(a,b),setTimeout(function(){k(a,b)},c))}function g(a){return Math.max(Math.min(a,100),0)}function h(a){return Array.isArray(a)?a:[a]}function i(a){a=String(a);var b=a.split(".");return b.length>1?b[1].length:0}function j(a,b){a.classList?a.classList.add(b):a.className+=" "+b}function k(a,b){a.classList?a.classList.remove(b):a.className=a.className.replace(new RegExp("(^|\\b)"+b.split(" ").join("|")+"(\\b|$)","gi")," ")}function l(a,b){return a.classList?a.classList.contains(b):new RegExp("\\b"+b+"\\b").test(a.className)}function m(){var a=void 0!==window.pageXOffset,b="CSS1Compat"===(document.compatMode||""),c=a?window.pageXOffset:b?document.documentElement.scrollLeft:document.body.scrollLeft,d=a?window.pageYOffset:b?document.documentElement.scrollTop:document.body.scrollTop;return{x:c,y:d}}function n(){return window.navigator.pointerEnabled?{start:"pointerdown",move:"pointermove",end:"pointerup"}:window.navigator.msPointerEnabled?{start:"MSPointerDown",move:"MSPointerMove",end:"MSPointerUp"}:{start:"mousedown touchstart",move:"mousemove touchmove",end:"mouseup touchend"}}function o(a,b){return 100/(b-a)}function p(a,b){return 100*b/(a[1]-a[0])}function q(a,b){return p(a,a[0]<0?b+Math.abs(a[0]):b-a[0])}function r(a,b){return b*(a[1]-a[0])/100+a[0]}function s(a,b){for(var c=1;a>=b[c];)c+=1;return c}function t(a,b,c){if(c>=a.slice(-1)[0])return 100;var d,e,f,g,h=s(c,a);return d=a[h-1],e=a[h],f=b[h-1],g=b[h],f+q([d,e],c)/o(f,g)}function u(a,b,c){if(c>=100)return a.slice(-1)[0];var d,e,f,g,h=s(c,b);return d=a[h-1],e=a[h],f=b[h-1],g=b[h],r([d,e],(c-f)*o(f,g))}function v(a,b,d,e){if(100===e)return e;var f,g,h=s(e,a);return d?(f=a[h-1],g=a[h],e-f>(g-f)/2?g:f):b[h-1]?a[h-1]+c(e-a[h-1],b[h-1]):e}function w(a,b,c){var d;if("number"==typeof b&&(b=[b]),"[object Array]"!==Object.prototype.toString.call(b))throw new Error("noUiSlider: 'range' contains invalid value.");if(d="min"===a?0:"max"===a?100:parseFloat(a),!e(d)||!e(b[0]))throw new Error("noUiSlider: 'range' value isn't numeric.");c.xPct.push(d),c.xVal.push(b[0]),d?c.xSteps.push(!isNaN(b[1])&&b[1]):isNaN(b[1])||(c.xSteps[0]=b[1]),c.xHighestCompleteStep.push(0)}function x(a,b,c){if(!b)return!0;c.xSteps[a]=p([c.xVal[a],c.xVal[a+1]],b)/o(c.xPct[a],c.xPct[a+1]);var d=(c.xVal[a+1]-c.xVal[a])/c.xNumSteps[a],e=Math.ceil(Number(d.toFixed(3))-1),f=c.xVal[a]+c.xNumSteps[a]*e;c.xHighestCompleteStep[a]=f}function y(a,b,c,d){this.xPct=[],this.xVal=[],this.xSteps=[d||!1],this.xNumSteps=[!1],this.xHighestCompleteStep=[],this.snap=b,this.direction=c;var e,f=[];for(e in a)a.hasOwnProperty(e)&&f.push([a[e],e]);for(f.length&&"object"==typeof f[0][0]?f.sort(function(a,b){return a[0][0]-b[0][0]}):f.sort(function(a,b){return a[0]-b[0]}),e=0;e<f.length;e++)w(f[e][1],f[e][0],this);for(this.xNumSteps=this.xSteps.slice(0),e=0;e<this.xNumSteps.length;e++)x(e,this.xNumSteps[e],this)}function z(a,b){if(!e(b))throw new Error("noUiSlider: 'step' is not numeric.");a.singleStep=b}function A(a,b){if("object"!=typeof b||Array.isArray(b))throw new Error("noUiSlider: 'range' is not an object.");if(void 0===b.min||void 0===b.max)throw new Error("noUiSlider: Missing 'min' or 'max' in 'range'.");if(b.min===b.max)throw new Error("noUiSlider: 'range' 'min' and 'max' cannot be equal.");a.spectrum=new y(b,a.snap,a.dir,a.singleStep)}function B(a,b){if(b=h(b),!Array.isArray(b)||!b.length)throw new Error("noUiSlider: 'start' option is incorrect.");a.handles=b.length,a.start=b}function C(a,b){if(a.snap=b,"boolean"!=typeof b)throw new Error("noUiSlider: 'snap' option must be a boolean.")}function D(a,b){if(a.animate=b,"boolean"!=typeof b)throw new Error("noUiSlider: 'animate' option must be a boolean.")}function E(a,b){if(a.animationDuration=b,"number"!=typeof b)throw new Error("noUiSlider: 'animationDuration' option must be a number.")}function F(a,b){var c,d=[!1];if("lower"===b?b=[!0,!1]:"upper"===b&&(b=[!1,!0]),b===!0||b===!1){for(c=1;c<a.handles;c++)d.push(b);d.push(!1)}else{if(!Array.isArray(b)||!b.length||b.length!==a.handles+1)throw new Error("noUiSlider: 'connect' option doesn't match handle count.");d=b}a.connect=d}function G(a,b){switch(b){case"horizontal":a.ort=0;break;case"vertical":a.ort=1;break;default:throw new Error("noUiSlider: 'orientation' option is invalid.")}}function H(a,b){if(!e(b))throw new Error("noUiSlider: 'margin' option must be numeric.");if(0!==b&&(a.margin=a.spectrum.getMargin(b),!a.margin))throw new Error("noUiSlider: 'margin' option is only supported on linear sliders.")}function I(a,b){if(!e(b))throw new Error("noUiSlider: 'limit' option must be numeric.");if(a.limit=a.spectrum.getMargin(b),!a.limit||a.handles<2)throw new Error("noUiSlider: 'limit' option is only supported on linear sliders with 2 or more handles.")}function J(a,b){if(!e(b))throw new Error("noUiSlider: 'padding' option must be numeric.");if(0!==b){if(a.padding=a.spectrum.getMargin(b),!a.padding)throw new Error("noUiSlider: 'padding' option is only supported on linear sliders.");if(a.padding<0)throw new Error("noUiSlider: 'padding' option must be a positive number.");if(a.padding>=50)throw new Error("noUiSlider: 'padding' option must be less than half the range.")}}function K(a,b){switch(b){case"ltr":a.dir=0;break;case"rtl":a.dir=1;break;default:throw new Error("noUiSlider: 'direction' option was not recognized.")}}function L(a,b){if("string"!=typeof b)throw new Error("noUiSlider: 'behaviour' must be a string containing options.");var c=b.indexOf("tap")>=0,d=b.indexOf("drag")>=0,e=b.indexOf("fixed")>=0,f=b.indexOf("snap")>=0,g=b.indexOf("hover")>=0;if(e){if(2!==a.handles)throw new Error("noUiSlider: 'fixed' behaviour must be used with 2 handles");H(a,a.start[1]-a.start[0])}a.events={tap:c||f,drag:d,fixed:e,snap:f,hover:g}}function M(a,b){if(b!==!1)if(b===!0){a.tooltips=[];for(var c=0;c<a.handles;c++)a.tooltips.push(!0)}else{if(a.tooltips=h(b),a.tooltips.length!==a.handles)throw new Error("noUiSlider: must pass a formatter for all handles.");a.tooltips.forEach(function(a){if("boolean"!=typeof a&&("object"!=typeof a||"function"!=typeof a.to))throw new Error("noUiSlider: 'tooltips' must be passed a formatter or 'false'.")})}}function N(a,b){if(a.format=b,"function"==typeof b.to&&"function"==typeof b.from)return!0;throw new Error("noUiSlider: 'format' requires 'to' and 'from' methods.")}function O(a,b){if(void 0!==b&&"string"!=typeof b&&b!==!1)throw new Error("noUiSlider: 'cssPrefix' must be a string or `false`.");a.cssPrefix=b}function P(a,b){if(void 0!==b&&"object"!=typeof b)throw new Error("noUiSlider: 'cssClasses' must be an object.");if("string"==typeof a.cssPrefix){a.cssClasses={};for(var c in b)b.hasOwnProperty(c)&&(a.cssClasses[c]=a.cssPrefix+b[c])}else a.cssClasses=b}function Q(a,b){if(b!==!0&&b!==!1)throw new Error("noUiSlider: 'useRequestAnimationFrame' option should be true (default) or false.");a.useRequestAnimationFrame=b}function R(a){var b={margin:0,limit:0,padding:0,animate:!0,animationDuration:300,format:U},c={step:{r:!1,t:z},start:{r:!0,t:B},connect:{r:!0,t:F},direction:{r:!0,t:K},snap:{r:!1,t:C},animate:{r:!1,t:D},animationDuration:{r:!1,t:E},range:{r:!0,t:A},orientation:{r:!1,t:G},margin:{r:!1,t:H},limit:{r:!1,t:I},padding:{r:!1,t:J},behaviour:{r:!0,t:L},format:{r:!1,t:N},tooltips:{r:!1,t:M},cssPrefix:{r:!1,t:O},cssClasses:{r:!1,t:P},useRequestAnimationFrame:{r:!1,t:Q}},d={connect:!1,direction:"ltr",behaviour:"tap",orientation:"horizontal",cssPrefix:"noUi-",cssClasses:{target:"target",base:"base",origin:"origin",handle:"handle",handleLower:"handle-lower",handleUpper:"handle-upper",horizontal:"horizontal",vertical:"vertical",background:"background",connect:"connect",ltr:"ltr",rtl:"rtl",draggable:"draggable",drag:"state-drag",tap:"state-tap",active:"active",tooltip:"tooltip",pips:"pips",pipsHorizontal:"pips-horizontal",pipsVertical:"pips-vertical",marker:"marker",markerHorizontal:"marker-horizontal",markerVertical:"marker-vertical",markerNormal:"marker-normal",markerLarge:"marker-large",markerSub:"marker-sub",value:"value",valueHorizontal:"value-horizontal",valueVertical:"value-vertical",valueNormal:"value-normal",valueLarge:"value-large",valueSub:"value-sub"},useRequestAnimationFrame:!0};Object.keys(c).forEach(function(e){if(void 0===a[e]&&void 0===d[e]){if(c[e].r)throw new Error("noUiSlider: '"+e+"' is required.");return!0}c[e].t(b,void 0===a[e]?d[e]:a[e])}),b.pips=a.pips;var e=[["left","top"],["right","bottom"]];return b.style=e[b.dir][b.ort],b.styleOposite=e[b.dir?0:1][b.ort],b}function S(c,e,i){function o(b,c){var d=a(b,e.cssClasses.origin),f=a(d,e.cssClasses.handle);return f.setAttribute("data-handle",c),0===c?j(f,e.cssClasses.handleLower):c===e.handles-1&&j(f,e.cssClasses.handleUpper),d}function p(b,c){return!!c&&a(b,e.cssClasses.connect)}function q(a,b){ba=[],ca=[],ca.push(p(b,a[0]));for(var c=0;c<e.handles;c++)ba.push(o(b,c)),ha[c]=c,ca.push(p(b,a[c+1]))}function r(b){j(b,e.cssClasses.target),0===e.dir?j(b,e.cssClasses.ltr):j(b,e.cssClasses.rtl),0===e.ort?j(b,e.cssClasses.horizontal):j(b,e.cssClasses.vertical),aa=a(b,e.cssClasses.base)}function s(b,c){return!!e.tooltips[c]&&a(b.firstChild,e.cssClasses.tooltip)}function t(){var a=ba.map(s);Z("update",function(b,c,d){if(a[c]){var f=b[c];e.tooltips[c]!==!0&&(f=e.tooltips[c].to(d[c])),a[c].innerHTML=f}})}function u(a,b,c){if("range"===a||"steps"===a)return ja.xVal;if("count"===a){var d,e=100/(b-1),f=0;for(b=[];(d=f++*e)<=100;)b.push(d);a="positions"}return"positions"===a?b.map(function(a){return ja.fromStepping(c?ja.getStep(a):a)}):"values"===a?c?b.map(function(a){return ja.fromStepping(ja.getStep(ja.toStepping(a)))}):b:void 0}function v(a,c,d){function e(a,b){return(a+b).toFixed(7)/1}var f={},g=ja.xVal[0],h=ja.xVal[ja.xVal.length-1],i=!1,j=!1,k=0;return d=b(d.slice().sort(function(a,b){return a-b})),d[0]!==g&&(d.unshift(g),i=!0),d[d.length-1]!==h&&(d.push(h),j=!0),d.forEach(function(b,g){var h,l,m,n,o,p,q,r,s,t,u=b,v=d[g+1];if("steps"===c&&(h=ja.xNumSteps[g]),h||(h=v-u),u!==!1&&void 0!==v)for(h=Math.max(h,1e-7),l=u;l<=v;l=e(l,h)){for(n=ja.toStepping(l),o=n-k,r=o/a,s=Math.round(r),t=o/s,m=1;m<=s;m+=1)p=k+m*t,f[p.toFixed(5)]=["x",0];q=d.indexOf(l)>-1?1:"steps"===c?2:0,!g&&i&&(q=0),l===v&&j||(f[n.toFixed(5)]=[l,q]),k=n}}),f}function w(a,b,c){function d(a,b){var c=b===e.cssClasses.value,d=c?m:n,f=c?k:l;return b+" "+d[e.ort]+" "+f[a]}function f(a,b,c){return'class="'+d(c[1],b)+'" style="'+e.style+": "+a+'%"'}function g(a,d){d[1]=d[1]&&b?b(d[0],d[1]):d[1],i+="<div "+f(a,e.cssClasses.marker,d)+"></div>",d[1]&&(i+="<div "+f(a,e.cssClasses.value,d)+">"+c.to(d[0])+"</div>")}var h=document.createElement("div"),i="",k=[e.cssClasses.valueNormal,e.cssClasses.valueLarge,e.cssClasses.valueSub],l=[e.cssClasses.markerNormal,e.cssClasses.markerLarge,e.cssClasses.markerSub],m=[e.cssClasses.valueHorizontal,e.cssClasses.valueVertical],n=[e.cssClasses.markerHorizontal,e.cssClasses.markerVertical];return j(h,e.cssClasses.pips),j(h,0===e.ort?e.cssClasses.pipsHorizontal:e.cssClasses.pipsVertical),Object.keys(a).forEach(function(b){g(b,a[b])}),h.innerHTML=i,h}function x(a){var b=a.mode,c=a.density||1,d=a.filter||!1,e=a.values||!1,f=a.stepped||!1,g=u(b,e,f),h=v(c,b,g),i=a.format||{to:Math.round};return fa.appendChild(w(h,d,i))}function y(){var a=aa.getBoundingClientRect(),b="offset"+["Width","Height"][e.ort];return 0===e.ort?a.width||aa[b]:a.height||aa[b]}function z(a,b,c,d){var f=function(b){return!fa.hasAttribute("disabled")&&(!l(fa,e.cssClasses.tap)&&(!!(b=A(b,d.pageOffset))&&(!(a===ea.start&&void 0!==b.buttons&&b.buttons>1)&&((!d.hover||!b.buttons)&&(b.calcPoint=b.points[e.ort],void c(b,d))))))},g=[];return a.split(" ").forEach(function(a){b.addEventListener(a,f,!1),g.push([a,f])}),g}function A(a,b){a.preventDefault();var c,d,e=0===a.type.indexOf("touch"),f=0===a.type.indexOf("mouse"),g=0===a.type.indexOf("pointer");if(0===a.type.indexOf("MSPointer")&&(g=!0),e){if(a.touches.length>1)return!1;c=a.changedTouches[0].pageX,d=a.changedTouches[0].pageY}return b=b||m(),(f||g)&&(c=a.clientX+b.x,d=a.clientY+b.y),a.pageOffset=b,a.points=[c,d],a.cursor=f||g,a}function B(a){var b=a-d(aa,e.ort),c=100*b/y();return e.dir?100-c:c}function C(a){var b=100,c=!1;return ba.forEach(function(d,e){if(!d.hasAttribute("disabled")){var f=Math.abs(ga[e]-a);f<b&&(c=e,b=f)}}),c}function D(a,b,c,d){var e=c.slice(),f=[!a,a],g=[a,!a];d=d.slice(),a&&d.reverse(),d.length>1?d.forEach(function(a,c){var d=M(e,a,e[a]+b,f[c],g[c]);d===!1?b=0:(b=d-e[a],e[a]=d)}):f=g=[!0];var h=!1;d.forEach(function(a,d){h=Q(a,c[a]+b,f[d],g[d])||h}),h&&d.forEach(function(a){E("update",a),E("slide",a)})}function E(a,b,c){Object.keys(la).forEach(function(d){var f=d.split(".")[0];a===f&&la[d].forEach(function(a){a.call(da,ka.map(e.format.to),b,ka.slice(),c||!1,ga.slice())})})}function F(a,b){"mouseout"===a.type&&"HTML"===a.target.nodeName&&null===a.relatedTarget&&H(a,b)}function G(a,b){if(navigator.appVersion.indexOf("MSIE 9")===-1&&0===a.buttons&&0!==b.buttonsProperty)return H(a,b);var c=(e.dir?-1:1)*(a.calcPoint-b.startCalcPoint),d=100*c/b.baseSize;D(c>0,d,b.locations,b.handleNumbers)}function H(a,b){ia&&(k(ia,e.cssClasses.active),ia=!1),a.cursor&&(document.body.style.cursor="",document.body.removeEventListener("selectstart",document.body.noUiListener)),document.documentElement.noUiListeners.forEach(function(a){document.documentElement.removeEventListener(a[0],a[1])}),k(fa,e.cssClasses.drag),P(),b.handleNumbers.forEach(function(a){E("set",a),E("change",a),E("end",a)})}function I(a,b){if(1===b.handleNumbers.length){var c=ba[b.handleNumbers[0]];if(c.hasAttribute("disabled"))return!1;ia=c.children[0],j(ia,e.cssClasses.active)}a.preventDefault(),a.stopPropagation();var d=z(ea.move,document.documentElement,G,{startCalcPoint:a.calcPoint,baseSize:y(),pageOffset:a.pageOffset,handleNumbers:b.handleNumbers,buttonsProperty:a.buttons,locations:ga.slice()}),f=z(ea.end,document.documentElement,H,{handleNumbers:b.handleNumbers}),g=z("mouseout",document.documentElement,F,{handleNumbers:b.handleNumbers});if(document.documentElement.noUiListeners=d.concat(f,g),a.cursor){document.body.style.cursor=getComputedStyle(a.target).cursor,ba.length>1&&j(fa,e.cssClasses.drag);var h=function(){return!1};document.body.noUiListener=h,document.body.addEventListener("selectstart",h,!1)}b.handleNumbers.forEach(function(a){E("start",a)})}function J(a){a.stopPropagation();var b=B(a.calcPoint),c=C(b);return c!==!1&&(e.events.snap||f(fa,e.cssClasses.tap,e.animationDuration),Q(c,b,!0,!0),P(),E("slide",c,!0),E("set",c,!0),E("change",c,!0),E("update",c,!0),void(e.events.snap&&I(a,{handleNumbers:[c]})))}function K(a){var b=B(a.calcPoint),c=ja.getStep(b),d=ja.fromStepping(c);Object.keys(la).forEach(function(a){"hover"===a.split(".")[0]&&la[a].forEach(function(a){a.call(da,d)})})}function L(a){a.fixed||ba.forEach(function(a,b){z(ea.start,a.children[0],I,{handleNumbers:[b]})}),a.tap&&z(ea.start,aa,J,{}),a.hover&&z(ea.move,aa,K,{hover:!0}),a.drag&&ca.forEach(function(b,c){if(b!==!1&&0!==c&&c!==ca.length-1){var d=ba[c-1],f=ba[c],g=[b];j(b,e.cssClasses.draggable),a.fixed&&(g.push(d.children[0]),g.push(f.children[0])),g.forEach(function(a){z(ea.start,a,I,{handles:[d,f],handleNumbers:[c-1,c]})})}})}function M(a,b,c,d,f){return ba.length>1&&(d&&b>0&&(c=Math.max(c,a[b-1]+e.margin)),f&&b<ba.length-1&&(c=Math.min(c,a[b+1]-e.margin))),ba.length>1&&e.limit&&(d&&b>0&&(c=Math.min(c,a[b-1]+e.limit)),f&&b<ba.length-1&&(c=Math.max(c,a[b+1]-e.limit))),e.padding&&(0===b&&(c=Math.max(c,e.padding)),b===ba.length-1&&(c=Math.min(c,100-e.padding))),c=ja.getStep(c),c=g(c),c!==a[b]&&c}function N(a){return a+"%"}function O(a,b){ga[a]=b,ka[a]=ja.fromStepping(b);var c=function(){ba[a].style[e.style]=N(b),S(a),S(a+1)};window.requestAnimationFrame&&e.useRequestAnimationFrame?window.requestAnimationFrame(c):c()}function P(){ha.forEach(function(a){var b=ga[a]>50?-1:1,c=3+(ba.length+b*a);ba[a].childNodes[0].style.zIndex=c})}function Q(a,b,c,d){return b=M(ga,a,b,c,d),b!==!1&&(O(a,b),!0)}function S(a){if(ca[a]){var b=0,c=100;0!==a&&(b=ga[a-1]),a!==ca.length-1&&(c=ga[a]),ca[a].style[e.style]=N(b),ca[a].style[e.styleOposite]=N(100-c)}}function T(a,b){null!==a&&a!==!1&&("number"==typeof a&&(a=String(a)),a=e.format.from(a),a===!1||isNaN(a)||Q(b,ja.toStepping(a),!1,!1))}function U(a,b){var c=h(a),d=void 0===ga[0];b=void 0===b||!!b,c.forEach(T),e.animate&&!d&&f(fa,e.cssClasses.tap,e.animationDuration),ha.forEach(function(a){Q(a,ga[a],!0,!1)}),P(),ha.forEach(function(a){E("update",a),null!==c[a]&&b&&E("set",a)})}function V(a){U(e.start,a)}function W(){var a=ka.map(e.format.to);return 1===a.length?a[0]:a}function X(){for(var a in e.cssClasses)e.cssClasses.hasOwnProperty(a)&&k(fa,e.cssClasses[a]);for(;fa.firstChild;)fa.removeChild(fa.firstChild);delete fa.noUiSlider}function Y(){return ga.map(function(a,b){var c=ja.getNearbySteps(a),d=ka[b],e=c.thisStep.step,f=null;e!==!1&&d+e>c.stepAfter.startValue&&(e=c.stepAfter.startValue-d),f=d>c.thisStep.startValue?c.thisStep.step:c.stepBefore.step!==!1&&d-c.stepBefore.highestStep,100===a?e=null:0===a&&(f=null);var g=ja.countStepDecimals();return null!==e&&e!==!1&&(e=Number(e.toFixed(g))),null!==f&&f!==!1&&(f=Number(f.toFixed(g))),[f,e]})}function Z(a,b){la[a]=la[a]||[],la[a].push(b),"update"===a.split(".")[0]&&ba.forEach(function(a,b){E("update",b)})}function $(a){var b=a&&a.split(".")[0],c=b&&a.substring(b.length);Object.keys(la).forEach(function(a){var d=a.split(".")[0],e=a.substring(d.length);b&&b!==d||c&&c!==e||delete la[a]})}function _(a,b){var c=W(),d=["margin","limit","padding","range","animate","snap","step","format"];d.forEach(function(b){void 0!==a[b]&&(i[b]=a[b])});var f=R(i);d.forEach(function(b){void 0!==a[b]&&(e[b]=f[b])}),f.spectrum.direction=ja.direction,ja=f.spectrum,e.margin=f.margin,e.limit=f.limit,e.padding=f.padding,ga=[],U(a.start||c,b)}var aa,ba,ca,da,ea=n(),fa=c,ga=[],ha=[],ia=!1,ja=e.spectrum,ka=[],la={};if(fa.noUiSlider)throw new Error("Slider was already initialized.");return r(fa),q(e.connect,aa),da={destroy:X,steps:Y,on:Z,off:$,get:W,set:U,reset:V,__moveHandles:function(a,b,c){D(a,b,ga,c)},options:i,updateOptions:_,target:fa,pips:x},L(e.events),U(e.start),e.pips&&x(e.pips),e.tooltips&&t(),da}function T(a,b){if(!a.nodeName)throw new Error("noUiSlider.create requires a single element.");var c=R(b,a),d=S(a,c,b);return a.noUiSlider=d,d}y.prototype.getMargin=function(a){var b=this.xNumSteps[0];if(b&&a/b%1!==0)throw new Error("noUiSlider: 'limit', 'margin' and 'padding' must be divisible by step.");return 2===this.xPct.length&&p(this.xVal,a)},y.prototype.toStepping=function(a){return a=t(this.xVal,this.xPct,a)},y.prototype.fromStepping=function(a){return u(this.xVal,this.xPct,a)},y.prototype.getStep=function(a){return a=v(this.xPct,this.xSteps,this.snap,a)},y.prototype.getNearbySteps=function(a){var b=s(a,this.xPct);return{stepBefore:{startValue:this.xVal[b-2],step:this.xNumSteps[b-2],highestStep:this.xHighestCompleteStep[b-2]},thisStep:{startValue:this.xVal[b-1],step:this.xNumSteps[b-1],highestStep:this.xHighestCompleteStep[b-1]},stepAfter:{startValue:this.xVal[b-0],step:this.xNumSteps[b-0],highestStep:this.xHighestCompleteStep[b-0]}}},y.prototype.countStepDecimals=function(){var a=this.xNumSteps.map(i);return Math.max.apply(null,a)},y.prototype.convert=function(a){return this.getStep(this.toStepping(a))};var U={to:function(a){return void 0!==a&&a.toFixed(2)},from:Number};return{create:T}});

var langIsReady = false;
var MAX_LED_VAL = 4000;
var MAX_MODULES_COUNT = 16;
var ledcolorsArr = ["#BDBDBD", "#9A2EFE", "#2E2EFE", "#2E64FE", "#00FF80", "#FF0000", "#FACC2E", "#2E2E2E"];
var daysArr = ["time.days.6","time.days.0","time.days.1","time.days.2","time.days.3","time.days.4","time.days.5"];
var monthsArr = ["time.months.0","time.months.1","time.months.2","time.months.3","time.months.4","time.months.5","time.months.6","time.months.7","time.months.8","time.months.9","time.months.10","time.months.11"];
var weeksArr = ["time.weeks.4","time.weeks.0","time.weeks.1","time.weeks.2","time.weeks.3",];
var dateFormat = ["DD.MM.YY","DD/MM/YY","DD-MM-YY","YY/MM/DD","YY-MM-DD"];
var timeFormat = ["HH:MI:SS P","HH.MI:SS P","HH24:MI:SS","HH24.MI:SS","HH:MI P","HH.MI P","HH24:MI","HH24.MI"];
var timezone = ["GMT-12", "GMT-11", "GMT-10", "GMT-9", "GMT-8", "GMT-7", "GMT-6", "GMT-5", "GMT-4", "GMT-3.5", "GMT-3", "GMT-2", "GMT-1", "GMT", "GMT+1", "GMT+2", "GMT+3", "GMT+3.5", "GMT+4", "GMT+4.5", "GMT+5", "GMT+5.5", "GMT+5.75", "GMT+6", "GMT+6.5", "GMT+7", "GMT+8", "GMT+9", "GMT+9.5", "GMT+10", "GMT+11", "GMT+12", "GMT+13" ] ;
//var tzminute = ["-720","-660","-600","-540","-480","-420","-360","-300","-240","-210","-180","-120","-60","0","60","120","180","210","240","270","300","330","345","360","390","420","480","540","570","600","660","720","780"];
var tzminute = [-720,-660,-600,-540,-480,-420,-360,-300,-240,-210,-180,-120,-60,0,60,120,180,210,240,270,300,330,345,360,390,420,480,540,570,600,660,720,780];
var modulesName = ["NoSelect","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P"];
var timertime = 0;
var timersken = 0;
var timersled = 0;
var timerscursor = 0;
var selLed = 1;
var DELAY = 400, clicks = 0, timer = null;
var currAp="";
var modulesCount = 0;
var chv = [];
var mpIsDo=0;

var manual = false;
var selModule = 1;
var unixtime = 0;
var unixtimestamp = 0;
var config = null;
var allTimeSlotValues = null;
var timeStart=0; 
var timeEnd=144;
var g1_tool="none";

var msDown = false, msMoveDown = false; msEditEnd = true;
var oldX = 0, oldY = 0, timedelta = 0, valuedelta = 0;
var tapped = false;
var movingTime = false, movingValue = false;

var clrs = [
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#4D004D",
"#500051",
"#530055",
"#55005A",
"#58005E",
"#5B0063",
"#5D0067",
"#5F006C",
"#610070",
"#630075",
"#650079",
"#67007E",
"#680082",
"#690087",
"#6B008B",
"#6C008F",
"#6C0094",
"#6D0098",
"#6E009D",
"#6E00A1",
"#6F00A6",
"#6F00AA",
"#6F00AF",
"#6E00B3",
"#6E00B8",
"#6E00BC",
"#6D00C1",
"#6C00C5",
"#6B00C9",
"#6A00CE",
"#6900D2",
"#6800D7",
"#6600DB",
"#6500E0",
"#6300E4",
"#6100E9",
"#5F00ED",
"#5D00F2",
"#5A00F6",
"#5800FB",
"#5500FF",
"#5100FF",
"#4D00FF",
"#4800FF",
"#4400FF",
"#4000FF",
"#3C00FF",
"#3700FF",
"#3300FF",
"#2F00FF",
"#2B00FF",
"#2600FF",
"#2200FF",
"#1E00FF",
"#1A00FF",
"#1500FF",
"#1100FF",
"#0D00FF",
"#0900FF",
"#0400FF",
"#0000FF",
"#0005FF",
"#000AFF",
"#000FFF",
"#0014FF",
"#001AFF",
"#001FFF",
"#0024FF",
"#0029FF",
"#002EFF",
"#0033FF",
"#0038FF",
"#003DFF",
"#0042FF",
"#0047FF",
"#004DFF",
"#0052FF",
"#0057FF",
"#005CFF",
"#0061FF",
"#0066FF",
"#006BFF",
"#0070FF",
"#0075FF",
"#007AFF",
"#0080FF",
"#0085FF",
"#008AFF",
"#008FFF",
"#0094FF",
"#0099FF",
"#009EFF",
"#00A3FF",
"#00A8FF",
"#00ADFF",
"#00B3FF",
"#00B8FF",
"#00BDFF",
"#00C2FF",
"#00C7FF",
"#00CCFF",
"#00D1FF",
"#00D6FF",
"#00DBFF",
"#00E0FF",
"#00E6FF",
"#00EBFF",
"#00F0FF",
"#00F5FF",
"#00FAFF",
"#00FFFF",
"#00FFF2",
"#00FFE6",
"#00FFD9",
"#00FFCC",
"#00FFBF",
"#00FFB3",
"#00FFA6",
"#00FF99",
"#00FF8C",
"#00FF80",
"#00FF73",
"#00FF66",
"#00FF59",
"#00FF4D",
"#00FF40",
"#00FF33",
"#00FF26",
"#00FF1A",
"#00FF0D",
"#00FF00",
"#04FF00",
"#07FF00",
"#0BFF00",
"#0FFF00",
"#12FF00",
"#16FF00",
"#1AFF00",
"#1DFF00",
"#21FF00",
"#24FF00",
"#28FF00",
"#2CFF00",
"#2FFF00",
"#33FF00",
"#37FF00",
"#3AFF00",
"#3EFF00",
"#42FF00",
"#45FF00",
"#49FF00",
"#4DFF00",
"#50FF00",
"#54FF00",
"#57FF00",
"#5BFF00",
"#5FFF00",
"#62FF00",
"#66FF00",
"#6AFF00",
"#6DFF00",
"#71FF00",
"#75FF00",
"#78FF00",
"#7CFF00",
"#80FF00",
"#83FF00",
"#87FF00",
"#8AFF00",
"#8EFF00",
"#92FF00",
"#95FF00",
"#99FF00",
"#9DFF00",
"#A0FF00",
"#A4FF00",
"#A8FF00",
"#ABFF00",
"#AFFF00",
"#B3FF00",
"#B6FF00",
"#BAFF00",
"#BDFF00",
"#C1FF00",
"#C5FF00",
"#C8FF00",
"#CCFF00",
"#D0FF00",
"#D3FF00",
"#D7FF00",
"#DBFF00",
"#DEFF00",
"#E2FF00",
"#E6FF00",
"#E9FF00",
"#EDFF00",
"#F0FF00",
"#F4FF00",
"#F8FF00",
"#FBFF00",
"#FFFF00",
"#FFFB00",
"#FFF700",
"#FFF300",
"#FFEF00",
"#FFEB00",
"#FFE700",
"#FFE400",
"#FFE000",
"#FFDC00",
"#FFD800",
"#FFD400",
"#FFD000",
"#FFCC00",
"#FFC800",
"#FFC400",
"#FFC000",
"#FFBC00",
"#FFB800",
"#FFB400",
"#FFB100",
"#FFAD00",
"#FFA900",
"#FFA500",
"#FFA100",
"#FF9D00",
"#FF9900",
"#FF9500",
"#FF9100",
"#FF8D00",
"#FF8900",
"#FF8500",
"#FF8100",
"#FF7E00",
"#FF7A00",
"#FF7600",
"#FF7200",
"#FF6E00",
"#FF6A00",
"#FF6600",
"#FF6200",
"#FF5E00",
"#FF5A00",
"#FF5600",
"#FF5200",
"#FF4E00",
"#FF4B00",
"#FF4700",
"#FF4300",
"#FF3F00",
"#FF3B00",
"#FF3700",
"#FF3300",
"#FF2F00",
"#FF2B00",
"#FF2700",
"#FF2300",
"#FF1F00",
"#FF1B00",
"#FF1800",
"#FF1400",
"#FF1000",
"#FF0C00",
"#FF0800",
"#FF0400",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FD0000",
"#FB0000",
"#F80000",
"#F60000",
"#F40000",
"#F20000",
"#EF0000",
"#ED0000",
"#EB0000",
"#E90000",
"#E60000",
"#E40000",
"#E20000",
"#E00000",
"#DE0000",
"#DB0000",
"#D90000",
"#D70000",
"#D50000",
"#D20000",
"#D00000",
"#CE0000",
"#CC0000",
"#C90000",
"#C70000",
"#C50000",
"#C30000",
"#C10000",
"#BE0000",
"#BC0000",
"#BA0000",
"#B80000",
"#B50000",
"#B30000",
"#B10000",
"#AF0000",
"#AC0000",
"#AA0000",
"#A80000",
"#A60000",
"#A40000",
"#A10000",
"#9F0000",
"#9D0000",
"#9B0000",
"#980000",
"#960000",
"#940000",
"#920000"];

var data =  [[0,0,0,0,0,0,0,0],[144,0,0,0,0,0,0,0]];
			
var dtmo = emptyDtmo();
/*
var dtmoEmpty = [
	[0,null,null,null,null,null,null,null,null],
	[144,null,null,null,null,null,null,null,null],
	];
*/

var channels = [
[360,0,0,0,0,0,0,0],
[361,0,0,0,0,0,0,0],
[362,0,0,0,0,0,0,0],
[363,0,0,0,0,0,0,0],
[364,0,0,0,0,0,0,0],
[365,0,0,0,0,0,0,0],
[366,0,3.07,0,0,0,0,0],
[367,0,3.41,0,0,0,0,0],
[368,0,3.75,0,0,0,0,0],
[369,0,4.09,0,0,0,0,0],
[370,0,4.43,0,0,0,0,0],
[371,0,4.77,0,0,0,0,0],
[372,0,5.11,0,0,0,0,0],
[373,0,5.45,0,0,0,0,0],
[374,0,5.46,0,0,0,0,0],
[375,0,5.46,0,0,0,0,0],
[376,0,11.6,0,0,0,0,0],
[377,0,12.28,0,0,0,0,0],
[378,0,12.96,0,0,0,0,0],
[379,0,14.73,0,0,0,0,0],
[380,0,16.51,0,0,0,0,0],
[381,0,18.28,0,0,0,0,0],
[382,0,20.05,0,0,0,0,0],
[383,0,23.28,0,0,0,0,0],
[384,0,25.86,0,0,0,0,0],
[385,0,28.38,0,0,0,0,0],
[386,0,36.36,0,0,0,0,0],
[387,0,41.61,0,0,0,0,0],
[388,0,51.78,0,0,0,0,0],
[389,0,65.22,0,0,0,0,0],
[390,0,79.75,0,0,0,0,0],
[391,0,93.19,0,0,0,0,0],
[392,0,106.62,0,0,0,0,0],
[393,0,122.99,0,0,0,0,0],
[394,0,159.79,0,0,0,0,0],
[395,0,197.57,0,0,0,0,0],
[396,0,240.13,0,0,0,0,0],
[397,0,304.54,0,0,0,0,0],
[398,0,367.85,0,0,0,0,0],
[399,0,445.34,0,0,0,0,0],
[400,0,525.03,0,0,0,0,0],
[401,0,613.44,0,0,0,0,0],
[402,0,740.06,0,0,0,0,0],
[403,0,822.3,0,0,0,0,0],
[404,0,944.93,0,0,0,0,0],
[405,0,1029.31,3.64,0,0,0,0],
[406,0,1087.71,3.65,0,0,0,0],
[407,0,1161.39,3.66,0,0,0,0],
[408,0,1213.78,7.27,0,0,0,0],
[409,0,1194.13,7.28,0,0,0,0],
[410,0,1249.8,10.87,0,0,0,0],
[411,0,1337.12,10.88,0,0,0,0],
[412,0,1509.58,10.89,0,0,0,0],
[413,0,1603.46,18.07,0,0,0,0],
[414,0,1704.97,18.08,0,0,0,0],
[415,0,1740.99,21.67,0,0,0,0],
[416,0,1731.16,25.27,0,0,0,0],
[417,2.46,1672.22,32.44,0,0,0,0],
[418,1.64,1615.46,32.45,0,0,0,0],
[419,2.7,1369.87,43.22,0,0,0,0],
[420,6.1,1282.55,50.39,0,0,0,0],
[421,7.68,1217.05,61.15,0,0,0,0],
[422,8.04,1218.15,71.91,0,0,0,0],
[423,10.71,1200.68,82.67,0,0,0,0],
[424,13.55,1159.2,93.44,0,0,0,0],
[425,17.11,1111.72,107.78,0,0,0,0],
[426,20.88,1057.69,132.87,0,0,0,0],
[427,25.79,949.12,147.21,0,0,0,0],
[428,33.45,879.97,161.55,0,0,0,0],
[429,44.73,696.4,193.81,0,0,0,0],
[430,46.01,606.55,208.15,0,0,0,0],
[431,53.42,505.74,240.41,0,0,0,0],
[432,69.26,435.52,272.66,0,0,0,0],
[433,87.79,381,304.92,0,0,0,0],
[434,102.38,313.41,355.09,3.68,0,0,0],
[435,118.27,271.79,390.92,3.99,0,0,0],
[436,134.3,242.32,459.01,4.28,0,0,0],
[437,152.16,203.1,523.51,4.58,0,0,0],
[438,173.62,185.96,584.42,4.88,0,0,0],
[439,196.75,159.36,677.58,6.06,0,0,0],
[440,220.37,143.04,760,7.24,0,0,0],
[441,248.64,115.7,888.99,8.42,0,0,0],
[442,275.95,94.96,1032.3,9.6,1.83,0,0],
[443,306.96,80.89,1175.62,11.36,2.03,0,0],
[444,337.73,65.77,1315.36,13.13,2.22,0,0],
[445,366.62,56.21,1483.75,14.89,2.42,0,0],
[446,387.7,49.12,1612.74,16.65,2.61,0,0],
[447,426.67,44.25,1662.91,18.42,2.81,0,0],
[448,452.06,39.49,1702.33,20.18,3,0,0],
[449,465.41,34.93,1720.26,24.88,3.29,0,0],
[450,468.96,31.67,1709.52,27.62,3.59,0,0],
[451,471.74,28.38,1688.04,35.44,4.17,0,0],
[452,465.07,16.37,1641.47,39.88,4.75,0,0],
[453,465.07,14.25,1569.83,46.01,5.33,0,0],
[454,442.94,12.15,1491.03,56.56,5.92,0,0],
[455,412.18,9.82,1394.31,68.3,6.5,0,0],
[456,377.57,8.73,1326.25,73.95,7.37,0,0],
[457,339.36,7.64,1186.54,78.85,8.24,0,0],
[458,304.37,6.55,1028.91,90.58,9.02,0,0],
[459,263.81,5.46,921.44,102.31,9.8,0,0],
[460,229.01,5.09,803.23,114.03,10.57,0,0],
[461,200.21,4.73,735.17,124.59,12.02,0,0],
[462,165.31,0,663.53,148.04,13.47,0,0],
[463,147.55,0,613.39,171.49,15.21,0,0],
[464,141.02,0,559.66,183.21,16.96,0,0],
[465,126.67,0,523.84,206.66,18.7,0,0],
[466,114.24,0,488.03,230.11,20.44,0,0],
[467,101.04,0,441.47,264.11,22.47,0,0],
[468,92.21,0,409.23,287.56,24.51,0,0],
[469,83.23,0,380.59,322.73,29.15,0,0],
[470,77.9,0,359.1,346.18,31.47,0,0],
[471,71.04,0,326.87,369.62,33.8,0,0],
[472,64.7,0,294.64,404.8,38.44,0,0],
[473,60.1,0,273.15,428.24,43.66,0,0],
[474,55.63,0,251.67,451.69,46.28,0,0],
[475,51.17,0,230.19,462.25,48.89,0,0],
[476,46.74,0,205.12,485.7,54.11,0,0],
[477,44.14,0,190.8,497.43,59.33,0,0],
[478,43.91,0,176.48,499.52,70.36,0,0],
[479,39.66,0,162.16,500.64,75.58,0,0],
[480,38.15,0,151.42,502.13,81.39,0,0],
[481,38.6,0,126.37,491.59,92.41,0,0],
[482,36.06,0,115.63,479.88,98.22,0,0],
[483,34.75,0,104.89,468.16,109.24,0,0],
[484,35.46,0,94.16,456.45,120.85,0,0],
[485,35.46,0,87,433.01,132.45,0,0],
[486,35.02,0,79.84,410.75,143.48,0,0],
[487,33.72,0,69.11,399.03,160.88,0,0],
[488,34.25,0,61.95,375.6,172.49,0,0],
[489,35.75,0,54.8,352.17,189.32,0,0],
[490,36.53,0,44.07,340.45,200.92,0,0],
[491,37.12,0,40.5,317.01,218.33,0,0],
[492,38.77,0,36.92,293.58,229.93,0,0],
[493,38.12,0,29.78,283.04,243.28,0,0],
[494,40.56,0,26.21,259.6,248.5,0,0],
[495,42.37,0,19.05,247.88,260.11,0,0],
[496,45.03,0,19.06,224.45,265.33,0,0],
[497,48.72,0,19.07,212.74,271.13,0,0],
[498,56.5,0,0,201.02,276.36,0,0],
[499,59.9,0,0,178.76,277.81,0,0],
[500,62.35,0,0,167.05,279.26,0,0],
[501,69.22,0,0,155.33,277.23,0,0],
[502,69.12,0,0,144.79,275.2,0,0],
[503,74.21,0,0,129.56,270.57,0,0],
[504,81.12,0,0,117.85,264.77,0,0],
[505,85.82,0,0,112.58,253.74,0,0],
[506,95.86,0,0,107.31,247.94,0,0],
[507,99.7,0,0,95.6,236.92,0,0],
[508,101.33,0,0,85.06,225.32,0,0],
[509,108.96,0,0,78.91,211.98,0,0],
[510,117.89,0,0,74.52,200.38,0,0],
[511,120.24,0,0,70.13,187.62,0,0],
[512,126.05,0,0,63.99,182.4,0,0.2],
[513,129.02,0,0,57.84,176.6,0,0.52],
[514,140.06,0,0,53.45,165.58,0,0.54],
[515,145.63,0,0,49.07,159.78,0,0.83],
[516,150.91,0,0,44.68,148.76,0,0.87],
[517,151.3,0,0,42.92,142.96,0,0.93],
[518,161.62,0,0,39.41,131.94,0,1.26],
[519,166.13,0,0,33.56,126.72,0,1.58],
[520,171.26,0,0,31.81,120.92,0,1.9],
[521,174.96,0,0,30.05,115.7,0,2.17],
[522,179.38,0,0,28.3,104.68,0,2.27],
[523,182.88,0,0,26.55,98.88,0,2.91],
[524,183.07,0,0,24.19,93.66,0,3.51],
[525,187.73,0,0,21.95,88.44,0,3.83],
[526,192.14,0,0,19.54,83.22,0,4.22],
[527,194.45,0,0,18.08,78,0,5.13],
[528,198.82,0,0,16.62,72.2,0,5.47],
[529,204.19,0,0,15.17,67.56,0,6.14],
[530,206.78,0,0,13.71,64.95,0,7.09],
[531,208.7,0,0,12.25,62.34,0,7.74],
[532,212.26,0,0,10.79,57.12,0,8.7],
[533,211.73,0,0,9.33,51.9,0,9.67],
[534,213.36,0,0,9.04,49.58,0,10.96],
[535,216,0,0,8.76,47.26,0,12.25],
[536,219.5,0,0,8.47,42.62,0,13.53],
[537,221.28,0,0,8.19,40.02,0,15.13],
[538,222.19,0,0,7.9,37.41,0,16.74],
[539,223.92,0,0,6.73,32.77,0,18.95],
[540,224.59,0,0,6.15,30.74,0,20.9],
[541,223.97,0,0,5.42,28.71,0,22.83],
[542,224.83,0,0,4.69,26.68,0,24.76],
[543,225.55,0,0,4.41,24.65,0,26.9],
[544,226.13,0,0,4.13,22.91,0,29.74],
[545,228.14,0,0,3.86,21.17,0,32.42],
[546,228.14,0,0,3.58,19.73,0,35.6],
[547,228.14,0,0,3.27,18.28,0,38.58],
[548,228.14,0,0,3,16.83,0,42.13],
[549,228.48,0,0,2.72,15.38,0,45.74],
[550,229.06,0,0,2.43,14.22,0,49.92],
[551,229.06,0,0,2.15,13.07,0,54.03],
[552,229.06,0,0,1.86,12.29,0,57.67],
[553,229.06,0,0,1.58,11.51,0,62.1],
[554,229.06,0,0,1.3,10.75,0,65.75],
[555,229.06,0,0,1.01,9.59,0,70.85],
[556,229.06,0,0,0.73,8.43,0,75.39],
[557,229.92,0,0,0.44,8.05,0,80.85],
[558,229.82,0,0,0.16,7.66,0,86.02],
[559,228.86,0,0,0,7.28,0,91.16],
[560,227.28,0,0,0,6.7,0,95.97],
[561,227.28,0,0,0,6.12,0,101.77],
[562,227.42,0,0,0,5.54,0,106.62],
[563,228.14,0,0,0,4.97,0,111.74],
[564,227.95,0,0,0,4.39,0,117.64],
[565,226.85,0,0,0,4.1,0,123.29],
[566,225.79,0,0,0,3.81,0,129.65],
[567,225.65,0,0,0,3.52,0,133.92],
[568,223.54,0,0,0,3.24,0,138.5],
[569,222.96,0,0,0,2.96,0,143.6],
[570,222.29,0,0,0,2.81,0,149.33],
[571,220.9,0,0,0,2.66,0,153.74],
[572,220.61,0,0,0,2.5,0,159.1],
[573,221.18,0,0,0,2.34,0,163.74],
[574,220.37,0,0,0,2.09,0,167.41],
[575,219.5,0,0,0,0,0,171.95],
[576,218.54,0,0,0,0,0,176.48],
[577,215.18,0,0,0,0,0,178.79],
[578,215.95,0,0,0,0,0,181.84],
[579,214.99,0,0,0,0,0,186.17],
[580,212.98,0,0,0,0,0,188.48],
[581,210.05,0,0,0,0,0,191.69],
[582,210.48,0,0,0,0,0,194.57],
[583,208.7,0,0,0,0,0,197.13],
[584,206.74,0,0,0,0,0,199.71],
[585,204.05,0,0,0,0,0,201.31],
[586,202.37,0,0,0,0,0,202.59],
[587,201.7,0,0,0,0,0,206.09],
[588,198.1,0,0,0,0,0,207.04],
[589,196.32,0,0,0,0,0,207.96],
[590,194.83,0,0,0,0,0,209.22],
[591,194.3,0,0,0,0,2.3,209.54],
[592,193.82,0,0,0,0,2.49,209.79],
[593,192.62,0,0,0,0,2.67,209.94],
[594,190.9,0,0,0,0,2.86,210.42],
[595,189.07,0,0,0,0,3.05,209.98],
[596,187.25,0,0,0,0,3.79,209.45],
[597,183.84,0,0,0,0,4.52,209.41],
[598,182.74,0,0,0,0,5.26,209.03],
[599,179.57,0,0,0,0,6,208.38],
[600,178.99,0,0,0,0,7.1,207.8],
[601,175.34,0,0,0,0,8.2,207.23],
[602,175.78,0,0,0,0,9.31,205.19],
[603,173.28,0,0,0,0,10.41,204.73],
[604,169.34,0,0,0,0,11.51,203.13],
[605,169.58,0,0,0,0,12.61,201.45],
[606,166.8,0,0,0,0,15.55,198.87],
[607,162.24,0,0,0,0,17.26,196.37],
[608,160.46,0,0,0,0,22.15,195.43],
[609,158.93,0,0,0,0,24.92,195.07],
[610,155.47,0,0,0,0,28.75,192.82],
[611,154.75,0,0,0,0,35.35,189.92],
[612,152.98,0,0,0,0,42.68,187.24],
[613,150.05,0,0,0,0,46.22,185.07],
[614,150.05,0,0,0,0,49.28,182.87],
[615,147.41,0,0,0,0,56.61,180.33],
[616,145.63,0,0,0,0,63.94,178.63],
[617,142.99,0,0,0,0,71.27,176.3],
[618,141.12,0,0,0,0,77.87,173.15],
[619,138.48,0,0,0,0,92.52,170.77],
[620,135.94,0,0,0,0,107.18,167.33],
[621,134.02,0,0,0,0,114.51,165.33],
[622,130.99,0,0,0,0,129.17,162.9],
[623,126.91,0,0,0,0,143.82,159.75],
[624,125.09,0,0,0,0,165.07,156.95],
[625,124.37,0,0,0,0,179.72,154.56],
[626,120.05,0,0,0,0,201.71,151.47],
[627,119.04,0,0,0,0,216.36,149.1],
[628,117.89,0,0,0,0,231.02,146.01],
[629,113.81,0,0,0,0,253,143.83],
[630,111.7,0,0,0,0,267.65,139.5],
[631,110.45,0,0,0,0,282.31,136.98],
[632,109.82,0,0,0,0,288.9,135.3],
[633,106.75,0,0,0,0,303.56,132.38],
[634,103.2,0,0,0,0,310.89,128.88],
[635,104.02,0,0,0,0,312.2,126.34],
[636,102.1,0,0,0,0,312.9,124.7],
[637,97.15,0,0,0,0,313.83,121.49],
[638,97.63,0,0,0,0,307.24,118.15],
[639,94.27,0,0,0,0,299.92,115.69],
[640,92.4,0,0,0,0,292.6,113.09],
[641,89.71,0,0,0,0,285.28,110.88],
[642,87.22,0,0,0,0,270.63,108.07],
[643,85.44,0,0,0,0,256.72,105.5],
[644,84.29,0,0,0,0,249.4,102.69],
[645,84,0,0,0,0,234.75,99.58],
[646,81.46,0,0,0,0,220.1,97.63],
[647,80.11,0,0,0,0,212.78,94.54],
[648,77.42,0,0,0,0,198.13,92.15],
[649,77.38,0,0,0,0,183.49,90.43],
[650,75.55,0,0,0,0,176.9,88.14],
[651,73.78,0,0,0,0,162.25,85.55],
[652,70.85,0,0,0,0,154.93,83.12],
[653,68.02,0,0,0,0,140.28,81.35],
[654,67.3,0,0,0,0,132.96,78.52],
[655,66.67,0,0,0,0,125.64,76.34],
[656,65.76,0,0,0,0,111.73,74.74],
[657,63.89,0,0,0,0,104.41,73.33],
[658,60.72,0,0,0,0,97.08,70.18],
[659,61.2,0,0,0,0,90.49,68.29],
[660,58.9,0,0,0,0,80.98,66.97],
[661,58.32,0,0,0,0,73.66,65.16],
[662,55.1,0,0,0,0,70.36,63.34],
[663,53.86,0,0,0,0,67.07,61.4],
[664,54.14,0,0,0,0,59.75,59.7],
[665,52.61,0,0,0,0,53.16,57.52],
[666,50.93,0,0,0,0,49.32,56.13],
[667,48.77,0,0,0,0,46.58,54.54],
[668,48.14,0,0,0,0,43.83,52.92],
[669,45.55,0,0,0,0,39.99,51.3],
[670,45.35,0,0,0,0,36.15,49.71],
[671,45.51,0,0,0,0,33.41,48.24],
[672,44.23,0,0,0,0,30.67,47.15],
[673,42.86,0,0,0,0,27.93,45.59],
[674,41.25,0,0,0,0,26.82,44.31],
[675,38.91,0,0,0,0,24.63,43.03],
[676,38.1,0,0,0,0,20.97,41.69],
[677,38.74,0,0,0,0,19.88,40.11],
[678,36.41,0,0,0,0,18.78,38.87],
[679,36.87,0,0,0,0,17.69,37.91],
[680,34.72,0,0,0,0,16.59,36.94],
[681,35.01,0,0,0,0,15.12,35.91],
[682,33.03,0,0,0,0,13.72,34.36],
[683,33.14,0,0,0,0,12.21,33.37],
[684,31.33,0,0,0,0,11.3,32.24],
[685,31.27,0,0,0,0,10.39,31.46],
[686,29.64,0,0,0,0,9.48,30.49],
[687,29.4,0,0,0,0,8.57,29.53],
[688,27.95,0,0,0,0,7.65,28.69],
[689,27.53,0,0,0,0,6.74,27.83],
[690,26.26,0,0,0,0,5.83,26.73],
[691,26.41,0,0,0,0,5.65,26.1],
[692,25.12,0,0,0,0,5.47,25.37],
[693,24.59,0,0,0,0,5.3,24.49],
[694,23.74,0,0,0,0,5.12,23.92],
[695,22.74,0,0,0,0,4.94,23.44],
[696,23.17,0,0,0,0,4.21,22.47],
[697,20.84,0,0,0,0,3.84,21.5],
[698,22.35,0,0,0,0,3.39,20.68],
[699,21.24,0,0,0,0,2.93,20.3],
[700,19.1,0,0,0,0,2.76,19.65],
[701,19.83,0,0,0,0,2.58,19.01],
[702,19.48,0,0,0,0,2.41,18.32],
[703,17.7,0,0,0,0,2.24,17.4],
[704,16.8,0,0,0,0,2.04,16.75],
[705,17.61,0,0,0,0,1.87,16.15],
[706,16.63,0,0,0,0,1.7,15.79],
[707,16.94,0,0,0,0,1.52,15.16],
[708,16.05,0,0,0,0,1.34,14.75],
[709,14.83,0,0,0,0,1.16,14.3],
[710,13.76,0,0,0,0,0.99,13.65],
[711,14.13,0,0,0,0,0.81,13.25],
[712,14.23,0,0,0,0,0.63,13.02],
[713,12.92,0,0,0,0,0.45,12.38],
[714,12.9,0,0,0,0,0.28,11.73],
[715,13.45,0,0,0,0,0.1,11.19],
[716,12.79,0,0,0,0,0,10.87],
[717,11.08,0,0,0,0,0,10.64],
[718,10.38,0,0,0,0,0,10.55],
[719,11.16,0,0,0,0,0,10.23],
[720,11.16,0,0,0,0,0,9.91],
[721,10.83,0,0,0,0,0,9.51],
[722,9.24,0,0,0,0,0,8.94],
[723,8.55,0,0,0,0,0,8.62],
[724,8.77,0,0,0,0,0,8.23],
[725,9.42,0,0,0,0,0,7.71],
[726,9.15,0,0,0,0,0,7.71],
[727,8.26,0,0,0,0,0,7.71],
[728,7.68,0,0,0,0,0,7.61],
[729,7.34,0,0,0,0,0,7.06],
[730,7.17,0,0,0,0,0,7.06],
[731,7.68,0,0,0,0,0,7.01],
[732,7.28,0,0,0,0,0,6.59],
[733,6.81,0,0,0,0,0,6.13],
[734,5.92,0,0,0,0,0,5.75],
[735,5.08,0,0,0,0,0,5.75],
[736,5.08,0,0,0,0,0,5.63],
[737,5.15,0,0,0,0,0,5.31],
[738,5.94,0,0,0,0,0,5.1],
[739,5.83,0,0,0,0,0,5.1],
[740,5.08,0,0,0,0,0,5.1],
[741,4.75,0,0,0,0,0,5.1],
[742,3.34,0,0,0,0,0,5],
[743,3.34,0,0,0,0,0,4.68],
[744,3.34,0,0,0,0,0,4.36],
[745,3.59,0,0,0,0,0,4.12],
[746,4.21,0,0,0,0,0,4.12],
[747,4.21,0,0,0,0,0,4.05],
[748,4.21,0,0,0,0,0,3.73],
[749,3.87,0,0,0,0,0,3.47]
];	

var c_uv    = 6;
var c_rb    = 5;
var c_green = 4;
var c_red   = 3;
var c_white = 2;
var c_amber = 1;
var c_blue  = 0;

var led_colors = [c_white,c_uv,c_rb,c_blue,c_green,c_red,c_amber];

function emptyDtmo() {
	d = [
		[0,null,null,null,null,null,null,null,null],
		[144,null,null,null,null,null,null,null,null]
		];
	return d;	
}

function showResult(id, text, tout) {
	 $(id).text(text);
	 setTimeout(function() {
		$(id).text("");
	 },tout);
}


function vT(n) {
 var r='<select name=">'+n+'" id="'+n+ '">';
 for (i=0;i<=144;i++) {
 	r += '<option value="'+i+'">'+minToTime(i)+'</option>';
 }
 r += '</select>';
 return r;
}
			
function pad(pad, str, padLeft) {
  if (typeof str === 'undefined') 
    return pad;
  if (padLeft) {
    return (pad + str).slice(-pad.length);
  } else {
    return (str + pad).substring(0, pad.length);
  }
}



function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}

var J42R = {
	defaultLang: 'en',
	cookievalid: 86400000, //1 day (1000*60*60*24)
	text: {},
	extractLang: function(kvl){
		var lang;
		for (var i in kvl) {
			var kv=kvl[i].split('=');
			if (kv[0]==='lang')
				lang=kv[1].length>2
					?kv[1].charAt(0)+kv[1].charAt(1)
					:kv[1];
		}
		return lang;
	},
	getUrlLang: function() {
		if (window.location.search.length<2)
			return undefined;
		return this.extractLang(window.location.search.substring(1).split('&'));
	},
	getCookieLang: function() {
		return this.extractLang(document.cookie.split('; '));
	},
	getLang: function() {
		if (typeof this.lang!=='string') {
			if (typeof (this.lang=this.getUrlLang())==='string');
			else if (typeof (this.lang=this.getCookieLang())==='string');
			else if (typeof (this.lang=navigator.language)==='string');
			else if (typeof (this.lang=navigator.userLanguage)==='string');
			else this.lang=this.defaultLang;
			if (this.lang.length>2)
				this.lang=this.lang.charAt(0)+this.lang.charAt(1);
		}
		return this.lang;
	},
	setLang: function(lang,cook) {
		this.lang = lang;
		if (cook) {
			var wl = window.location,
				now = new Date(),
				time = now.getTime();
			time += this.cookievalid;
			now.setTime(time);
			document.cookie = 'lang='+lang+';path='+wl.pathname+';domain='+wl.host+';expires='+now.toGMTString();
		}
		return this;
	},
	load: function() {
		var self=this,lang=this.getLang();

		$.ajax({ url:'I18N_'+lang+'.json',
		type:"GET",
	    dataType:"json",
	    cache:true,
	    async:false,
	    contentType:"application/json; charset=utf-8",
		success:function(data) {
			self.put(lang,data).t();
		},
		error:function(xhr,type){
	        self.put(lang,{}).t();
	    }
	});	

		return this;
	},
	put: function(lang,data) {
		if (typeof lang==='string'&&typeof data==='object') {
			var obj={};
			obj[lang]=data;
		} else
			obj=lang;			
		this.text=$.extend(true,this.text,obj);
		return this;
	},
	get: function(key) {
		var keys=key.split('.'),
			lang=this.getLang(),
			obj=this.text[lang];
		while (typeof obj!=='undefined' && keys.length>0)
			obj=obj[keys.shift()];
		return typeof obj==='undefined' ? key : obj;
	},
		
	t1: function(item) {
		if (typeof item==='object' && item instanceof Element) {
			var it = $(item),
				key = it.attr('i18n');
			it.removeClass('I18N');
			if (typeof key==='undefined' || key == null)
				key = it.text();
			it.attr('i18n',key).text(this.get(key));

		}
		return this;
	},
	
	
	t: function(item) {
		if (typeof this.text[this.getLang()]==='undefined') {
			this.load();
			return this;
		}
		
		if (typeof item === 'undefined') {			
			item = $("[I18N]");			
			var x = $('.I18N');

			$('.I18N').each(function(x){				
			  //if (!$.contains(item,this))			  			  
			   if (!contains(item,this))
					item = item.add(this);				
			});					
		}

		if ($.zepto.isZ(item))
			for (var i in item)
				this.t1(item[i]);
		else
			this.t1(item);
		return this;
	}
};


function isRealValue(obj){
   return obj && obj !== "null" && obj!== "undefined";
}

$('a#menuLink').click(function(e) {
 $('#layout').toggleClass('active');
 $('#menu').toggleClass('active');
 $('a#menuLink').toggleClass('active');
 e.preventDefault();
});

var lastmenu = 'home';

$('div#menu a.pure-menu-link').click(function(event) {
    var curmenu = this.id;
    //hide menu  
    if ($('a#menuLink').hasClass('active')) {
	     $('#layout').toggleClass('active');
	     $('#menu').toggleClass('active');
         $('a#menuLink').toggleClass('active');
	}    
     
	$(".pure-menu-item").removeClass("pure-menu-selected");
	$('a#'+curmenu).parent(".pure-menu-item").addClass("pure-menu-selected");
	if (lastmenu !== 'null')  {
		$('div#'+lastmenu).toggle();
	} 
	$('div#'+curmenu).toggle();
	lastmenu = curmenu;	
	
	if (curmenu == 'wifi') {
		window.clearTimeout(timersken);
		getWifiInfo();
		showCurrentTime();
		
	};
	
	if (curmenu == 'home') {
		window.clearTimeout(timertime);
		display_ct();	
  	    g0.resize();
	}
	
	if (curmenu == 'ledsetup') {
	   //if (isRealValue(timersled)) window.clearTimeout(timersled);
	   window.clearTimeout(timersled);
	   g1.resize();
	   setProfileList();
	   getProfileValues();
	}
	
	if (curmenu == 'firmware') {
		getFwVersions();
	}
});

function minToTime( min) {
	tmStr = pad('00',Math.floor(min/6),true)+":"+ pad('00',(min%6)*10,true);
	return tmStr;
}

function ch(data) {
	chv = [];
	for (var i in data.ch) { 
		chv.push(data.ch[i]);
	}
	//hmf();
	g0.updateOptions( { 'file': reChannels() } );
}

function reChannels() {
	var ich = [];
	var ch = [];
	
	try {
		for (x = 1; x < 8; x++) {
			ch.push(($('#chvx .slider')[x-1].noUiSlider.get())/100);
		}
	} catch (e) {
	}
	
	for (i = 0; i< channels.length; i++) {
		x = 0;
		for (j = 1; j < 8; j++) {
			x += (channels[i][j] * ch[j-1]);			
		}
		ich.push([i+360,x]);
	};
	return ich;
}

function findIn2dArray(arr_2d, val){
    var indexArr = $.map(arr_2d, function(arr, i) {
            if($.inArray(val, arr) != -1) {
                return 1;
            }

            return -1;
    });

    return indexArr.indexOf(1);
}


$("#aps").on( 'click', 'div', function(e) {
	e.preventDefault();
	$("#input-ssid").attr("placeholder","").val($(this).find('label').text());

});

function getFwVersions() {
	$.ajax({ url:'showversions.cgi',
		type:"GET",
	    dataType:"json",
	    cache:true,
	    contentType:"application/json; charset=utf-8",
		success:function(data) {
				showFwInfo(data);
		},
		error:function(xhr,type){
	    }
	});
}

function dec2hex(i) {
	return '0x'+(i+0x10000).toString(16).substr(-4).toUpperCase();
}

function showFwInfo(data) {
	  Object.keys(data).forEach(function(v) {
		  if (Array.isArray(data[v])) {
			  data[v].forEach(function(x) {
				  $("#fw-" + v).append(dec2hex(x)+",");
			  });
		  } else {
			  $("#fw-" + v).text(dec2hex(data[v]));
		  }		  
	 });
	 $("#fw-uiVersion").text(uiversion);	 	
};

function createInputForAp(ap) {
	  if (ap.essid=="" && ap.rssi==0) return;

	  //var input = $("<input>", { type:"radio", name:"ssid", value:ap.essid, id:"opt-" + ap.essid});
	  //if (currAp == ap.essid) input.checked = "1";
	  var rssiVal = -Math.floor(ap.rssi/37)*32;
	  var bars    = $("<span>",{class:"lock-icon", css:{backgroundPosition:"0px "+rssiVal+"px;"} });	  

      var rssi    = $("<span>",{text: " " + ap.rssi +" dB "});	  
      
	  var encVal  = "-64"; //assume wpa/wpa2
	  if (ap.enc == "0") encVal = "0"; //open
	  if (ap.enc == "5") encVal = "-32"; //wep
  	  var encrypt = $("<span>",{class:"lock-icon",css:{backgroundPosition:"-32px "+encVal+"px;"}});
	
	  //var label =  $("<label>", {for:"opt-" + ap.essid});
	  var label =  $("<label>", {style:"cursor: pointer; text-decoration: underline;"});
	  //onclick:"setWiFiSSID('"+ap.essid+"');return false;", 
	  var div = $("<div>", {style:"cursor: pointer;"});

	  label.text(ap.essid);		  
	  div.append(label);		   
	  div.append(bars);	 
	  div.append(rssi);
	  div.append(encrypt);

	  //div.append(input);
	  
	  return div;
	}

function getSelectedEssid() {
	var e=document.forms.wifiform.elements;
	for (var i=0; i<e.length; i++) {
		if (e[i].type=="radio" && e[i].checked) return e[i].value;
	}
	return currAp;
}

function scanAPs() {
	$("#apscan").show();
	$.ajax({ url:'wifiscan.cgi',
		type:"GET",
	    dataType:"json",
	    cache:false,
	    contentType:"application/json; charset=utf-8",
		success:function(data) {
			currAp = getSelectedEssid();
			if (data.result.inProgress == "0" && data.result.APs.length>1) {
				$("#aps").html("");
				$("#apscan").hide();
				for (var i=0; i<data.result.APs.length; i++) {
					if (data.result.APs[i].essid=="" && data.result.APs[i].rssi==0) continue;
					$("#aps").append(createInputForAp(data.result.APs[i]));
				}
				timersken = window.setTimeout(scanAPs, 60000);
			} else {
				timersken = window.setTimeout(scanAPs, 5000);
			}
		},
		error:function(xhr,type){
			console.log(xhr);
			console.log(type);
	    }
	});	
}

function getWifiInfo() {
	$.ajax({ url:'wifistatus.cgi',
		type:"GET",
	    dataType:"json",
	    cache:false,
	    contentType:"application/json; charset=utf-8",
		success:function(data) {
				showWifiInfo(data);
		},
		error:function(xhr,type){
	    }
	});	
}

function showWifiInfo(data) {

	  Object.keys(data).forEach(function(v) {
		  $("#wifi-" + v).text(data[v]);;
	  });	 
	  $("#wifi-spinner").hide();
	  $("#wifi-table").show();
	  currAp = data.ssid;
	  if (data['status'] == 'WL_CONNECTED') {
	  	  if ($("#apmode .Switch").hasClass("Off")) {  	  	      	
		  	  $('#apmode .Switch').toggleClass('Off').toggleClass('On');
		  	  var text = J42R.get('wifi.assoc') + ' ' + currAp;
		  	  $('#wifi-assoc').text(text);		  	  		  	  
	  	  }
	  	  $("#setapip").hide();
  		  $(".setwifi").show();
		  //run scan
		  scanAPs();			  	  	  	    		  		  
	   } else {
	      $("#wifi-ap-ip").attr("placeholder","").val(data['apIp']);
	   }
	   
}

function populateSelectBox() {
	   pSelectBox('#dstStartDay',daysArr,7,1);
	   pSelectBox('#dstEndDay', daysArr,7,1);
	   pSelectBox('#mm',monthsArr);
	   pSelectBox('#dstStartMonth',monthsArr,12,1);
	   pSelectBox('#dstEndMonth',monthsArr,12,1);
	   pSelectBox('#dstStartWeek',weeksArr);
	   pSelectBox('#dstEndWeek',weeksArr);
	   pSelectBox('#dateFormat',dateFormat);
	   pSelectBox('#timeFormat',timeFormat);
	   pSelectBox('#dstStartOffset',timezone);
	   pSelectBox('#dstEndOffset',timezone);
	   pSelectBox('#timezone',timezone);	   	   
}

$("select[name='lang']").on("change", function () {
   J42R.setLang(this.value,true).t();
   populateSelectBox();
   var _data = $("#langform").serialize();
   $.ajax({
        type: 'POST',
        url: 'setlang.cgi',
        data: _data,
        cache:false,
        success: function (data) {
        	showResult('#lang-save-result', "Saved", 10000); 
        },        
		error:function(xhr,type){
		  showResult('#lang-save-result', "Error", 10000); 
		  console.log("Error",xhr);	
    	}
     });   
   });


function rainbowPlotter(e) {
        var ctx = e.drawingContext;
        var points = e.points;

        var y_bottom = e.dygraph.toDomYCoord(0);
  /*
     	for (var i = 0; i < points.length; i++) {
          var p = points[i];
          var center_x = p.canvasx;

		  ctx.strokeStyle=clrs[(p.xval)-360];
          ctx.strokeRect(center_x, p.canvasy,
              1, y_bottom - p.canvasy);
        }
 */       
        ctx.beginPath();		
        ctx.moveTo(points[0].canvasx, points[0].canvasy); 
        ctx.closePath(); 
        var center_x = 0; var center_y = 0;
        var center_x_prev = points[0].canvasx; var center_y_prev =  points[0].canvasy;
     	for (var i = 0; i < points.length; i++) {
          var p = points[i];
          var center_x = p.canvasx; 
          var center_y = p.canvasy;
            
          ctx.beginPath();             
          ctx.lineTo(center_x,p.canvasy);
          ctx.lineTo(center_x,y_bottom);             
		  ctx.lineTo(center_x_prev,y_bottom);
		  ctx.lineTo(center_x_prev,center_y_prev);
		  center_x_prev = center_x; center_y_prev=center_y;
		  ctx.closePath();		    		  
		  ctx.strokeStyle=clrs[(p.xval)-360];
		  ctx.stroke();		  
		  ctx.fillStyle=clrs[(p.xval)-360];
		  ctx.fill();
        }        
}

$("div.slider input[type=range]").change(function( event ) {    
	  $('div.slider input[type=number]#'+this.id).val(this.value); 
	  g0.updateOptions( { 'file': reChannels() } );
	});

$("div.slider input[type=number]").change(function( event ) {
	  $('div.slider input[type=range]#'+this.id).val(this.value);  
	  g0.updateOptions( { 'file': reChannels() } );
	});

function reG1() {
   	g1.updateOptions( { 'file': dtmo , dateWindow: [0,144]} );
}

$("#ledsetup-filter-ledchan").change(function( event ) {
	  var l=$("#ledsetup-filter-ledchan").val();
	  if (l == -1) {
	    for(var i=0;i<8;i++) g1.setVisibility(i,true);
	  } else {
	  	for(var i=0;i<8;i++) g1.setVisibility(i,false);
	  	g1.setVisibility(l,true)
	  }
	});
    
    

function saveInfo(data) {
	var title;
	var opt;
	var cnt = Number(data.timeSlotValues.length);
		
	$('ul#ml').empty();
	temperature_0 = data.moduleTemperature_0 != -128?''+data.moduleTemperature_0:' - ';
	temperature_1 = data.moduleTemperature_1 != -128?''+data.moduleTemperature_1:' - ';
	temperature_2 = data.moduleTemperature_2 != -128?''+data.moduleTemperature_2:' - ';
	temperature_3 = data.moduleTemperature_3 != -128?''+data.moduleTemperature_3:' - ';
	opt = '<span>'+temperature_0+'&nbsp;&#8451;</span>';	
	opt = opt + '<span>'+temperature_1+'&nbsp;&#8451;</span>';
	opt = opt + '<span>'+temperature_2+'&nbsp;&#8451;</span>';
	opt = opt + '<span>'+temperature_3+'&nbsp;&#8451;</span>';
	x = $(opt).appendTo('ul#ml');
	
	var b = data.timeSlotValues;				
	for (var x=0; x < 7; x++) {					
		var v = b[led_colors[x]];
		var sliders = $('#chvx .slider');					
		sliders[x].noUiSlider.set(v/(MAX_LED_VAL/100));
	}	

	g0.updateOptions( { } );

	
	if (config.isManual == true) { 
		//if (isRealValue(timersled)) 
		window.clearTimeout(timersled);
	} else {
		timersled = window.setTimeout(getInfo, 30000);		
	}
}



function getInfo() {

	$.ajax({ 
		url:'getinfo.cgi',
		type:"GET",
	    dataType:"json",
	    cache:false,
	    processData: false,
	    contentType:"application/json; charset=utf-8",
		success:function(data) {												
				saveInfo(data);				
		},
		error:function(xhr,type){
			console.log(xhr);
	    }
	});	
}

function getConfig() {
	$.ajax({ url:'getconfig.cgi',
		type:"GET",
	    dataType:"json",
	    cache:false,
	    contentType:"application/json; charset=utf-8",
		success:function(data) {
			config = data;
			showConfigData();
		},
		error:function(xhr,type){
			console.log(xhr);
	    }
	});	
}

$("#addled").click(function( event ) {
	console.log("addled");
        var kanal = $('form#ledform select#ledchan').val();
        var time = $('form#ledform select#ledtime').val();
        var intenzita = $('form#ledform input#ledval').val();        

        addPoint( kanal, time,intenzita,true);  
        //prepocet pole a zobrazeni bodu        
});

function updLedCh(t, ch, v, d) {
	var idx = findIn2dArray(dtmo,t);
    if ((d == false) && (idx >= 0) ){ //delete
    	dtmo[idx][ch+1] = null;
    }
    
    if ((d)  && (idx >= 0)) { //update
    	dtmo[idx][ch+1] = v;
    } 

    if ((d)  && (idx < 0)) { //add
    	dtmo.push([t,ch==0?v:null,ch==1?v:null,ch==2?v:null,ch==3?v:null,ch==4?v:null,ch==5?v:null,ch==6?v:null,null]);
    }
    
    
    dtmo.sort((a, b) => { return a[0] - b[0]});
    return;
}

//function addPoint(m, ch, t, v, a, e) {
function addPoint(ch, t, v, a) {
	cha = Number(ch);
	time = Number(t)
	value= Number(v);
	
	if (cha >= 0) {
		updLedCh(time, cha, value, a);
	} else {
		for (i=0;i<7;i++) {
			updLedCh(time, i, value, a);
		}
	}
}

$('#autoOnOff .Switch').click(function() {
	$(this).toggleClass('On').toggleClass('Off');
	if ($("#autoOnOff .Switch").hasClass("On")) {
		$('#chvx .slider').removeAttr('disabled');
		$('#chvx input').removeAttr('disabled');
		$('#chv-submit').show();
		manual = true;
		config.isManual = true;		
		//stop timer reload
		setManual(true);
		g0.updateOptions( { 'file': reChannels() } );					
	} else {		
		manual = false;
		setManual(false);
		$('#chv-submit').hide();
		$('#chvx .slider').attr('disabled',true);
		$('#chvx input').attr('disabled',true);
		g0.updateOptions( { 'file': reChannels() } );		
	}
	getInfo();
});

$('#dhcpOnOff .Switch').click(function() {
	$('#dhcpOnOff .Switch').toggleClass('On').toggleClass('Off');
	if ($("#dhcpOnOff .Switch").hasClass("On")) {
		$("#setip").hide();
		$("#input-dhcponoff").val('1');
	} else {
		$("#setip").show();
		$("#input-dhcponoff").val('0');
	}		
});

$('#apExt .Switch').click(function() {
	$('#apExt .Switch').toggleClass('On').toggleClass('Off');
	if ($("#apExt .Switch").hasClass("On")) {
		$("#ap-ext").show();
	} else {
		$("#ap-ext").hide();
	}		
});

$('#apmode .Switch').click(function() {
	$('#apmode .Switch').toggleClass('On').toggleClass('Off');
	if ($("#apmode .Switch").hasClass("On")) {
		$(".setwifi").show();
		$("#setapip").hide();
		$("#input-apmode").val('1');	
		//run scan
		scanAPs();		
	} else {
		$(".setwifi").hide();
		$("#setip").hide();
		$("#setapip").show();
		if ($("#dhcpOnOff .Switch").hasClass("Off")) {
		   $('#dhcpOnOff .Switch').toggleClass('Off').toggleClass('On');
		}
		$("#input-apmode").val('2');	
		//stop scan
		 window.clearTimeout(timersken);
	}		
});

$('#wifiform').on('submit', function(e) { 
		e.preventDefault();
		//alert('test');
          //prevent form from submitting
       var _data = $("#wifiform").serialize();		
		$.ajax({
            type: 'GET',
            url: 'wificonnect.cgi',
            data: _data,
            cache:false,
            success: function (data) {
                //TODO: show spin
                setTimeout(function () {
			       window.location.href = "/";
			    }, 15000);                
            }
         });       
    });
    
function display_ct() {	
	//todo: revize?
	$.ajax({
            type: 'GET',
            url: 'gettime.cgi',
            dataType:"json",
            cache:false,
  	        contentType:"application/json; charset=utf-8",
		     success:function(data) {
		    	unixtime = data.utc;
		    	unixtimestamp = data.utc;
  		        show_ct();  		        
 			},
			error:function(xhr,type){
			  console.log(xhr);
	    	}
    }); 	
}

function show_ct() {	
	var format = dateFormat[config.dtFormat] + " " + timeFormat[config.tmFormat];
	var x = new Date( unixtime * 1000) ;
	var m = x.getMonth() + 1;
	var mm = pad('00',m,true);
	var dd = pad('00',x.getDate(),true);
	var yyyy = x.getFullYear();
    var yy = yyyy - 2000;
    var mi = pad('00',x.getMinutes(),true);
    var hh24 = pad('00',x.getHours(),true);
    var hh  = pad('00',x.getHours() == 12?12:x.getHours() % 12,true);
    var ss  = pad('00',x.getSeconds(),true);
	var res = format.replace('YYYY',yyyy);
	var period = x.getHours() < 12?"am":"pm";
	res=res.replace('YY',yy);
	res=res.replace('DD',dd);
    res=res.replace('MM',mm);
    res=res.replace('MO',J42R.get('month.'+m));
    res=res.replace('HH24',hh24);    
    res=res.replace('HH',hh);    
    res=res.replace('MI',mi);    
    res=res.replace('SS',ss);
    res=res.replace('P',period);
	$("#showtime").text(res);
	if (unixtime++ == (unixtimestamp+60)) {
		//if (isRealValue(timertime)) 
		window.clearTimeout(timertime);
	    timertime=window.setTimeout('display_ct()',1000);
	} else {
		timertime=window.setTimeout('show_ct()',1000);
	}
}

var QueryString = function () {
	  // This function is anonymous, is executed immediately and 
	  // the return value is assigned to QueryString!
	  var query_string = {};
	  var query = window.location.search.substring(1);
	  var vars = query.split("&");
	  for (var i=0;i<vars.length;i++) {
	    var pair = vars[i].split("=");
	        // If first entry with this name
	    if (typeof query_string[pair[0]] === "undefined") {
	      query_string[pair[0]] = decodeURIComponent(pair[1]);
	        // If second entry with this name
	    } else if (typeof query_string[pair[0]] === "string") {
	      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
	      query_string[pair[0]] = arr;
	        // If third or later entry with this name
	    } else {
	      query_string[pair[0]].push(decodeURIComponent(pair[1]));
	    }
	  } 
	  return query_string;
}();
	
$('#ntpOnOff .Switch').click(function() {
	$('#ntpOnOff .Switch').toggleClass('On').toggleClass('Off');
	if ($("#ntpOnOff .Switch").hasClass("On")) {
		$("#time-set").hide();
		$("#time-setntp").show();
		$("#use-ntp").val('1');		
	} else {
		$("#time-setntp").hide();
		$("#time-set").show();
		$("#use-ntp").val('0');
	}		
});

$('#dstOnOff .Switch').click(function() {
	$('#dstOnOff .Switch').toggleClass('On').toggleClass('Off');
	if ($("#dstOnOff .Switch").hasClass("On")) {
		$("#set-dst").show();
		$("#use-dst").val('1');
		$("#timezone-set").hide();
	} else {
		$("#set-dst").hide();
		$("#use-dst").val('0');
		$("#timezone-set").show();
	}		
});

function showCurrentTime() {
  	var d=new Date();
  	$("#dd").attr("placeholder","").val(d.getDate());
  	$("#mm").attr("placeholder","").val(d.getMonth());
  	$("#yy").attr("placeholder","").val(d.getFullYear()-2000);  
  	$("#hh").attr("placeholder","").val(d.getHours());
  	$("#mi").attr("placeholder","").val(d.getMinutes());  	
}


function pSelectBox(x, arr, y, z, sel) {	
	var BreakException = {};
	y = typeof y !== 'undefined' ? y : 999;
	z = typeof z !== 'undefined' ? z : 0;
	if (z == null) z = 0;
	sel = typeof sel !== 'undefined' ? sel : true;
	$(x).empty();
	if (sel === true) $(x).append($('<option>').text("Select"));
	try {
		arr.forEach(function(entry) {
			$(x).append($('<option>').text(J42R.get(entry)).attr('value', z));
			if (y == z) throw BreakException;
			z++;
		});
	} catch(e) {
		if (e !== BreakException) throw e;	
	}
}

function getProfileValues() {
	console.log(config.profileFileName);
	getBinProfile(config.profileFileName);
}
 	
function setProfileList() {
	$.ajax({ url:'getTimeSlotProfiles.cgi',
		type:"GET",
		cache:false,
	    dataType:"json",
	    contentType:"application/json; charset=utf-8",
		success:function(data) {
			$('#profileList').empty();
            //$('#profileList').append($('<option>').text("Select"));
			$.each(data['profileList'],function(k, v) {
			    var f = v.filename.slice(0, -4); // .substr(1).slice(0, -4);
			    //f = f.slice(1,f.length);
			    $('#profileList').append($('<option>').text(f).attr('value', f));
			});
			//set selected value
			$('#profileList').val(config.profileFileName.slice(0, -4));
		},
		error:function(xhr,type){
			  console.log(xhr);
	    }
	});	
}

$('#setProfile').on('submit', function(e) { 
   e.preventDefault();				
   var _data = $("#setProfile").serialize();		
	$.ajax({
        type: 'POST',
        url: 'setprofile.cgi',
        data: _data,
        cache:false,
        success: function (data) {  
            showResult('#set-profile-result', "OK", 10000);  
				 getConfig();
		 	     setProfileList();
				 var fln = $("#profileList").val() + ".pjs";  
				 getBinProfile(fln);			 
				 getInfo();
            
        },
       error: function (data) {  
            showResult('#set-profile-result', "Error:", 10000);               
            console.log(data,_data);
        }
     }); 				
});

$('#profileList').change(function() { 
	if ($("#profileList").val() != "Select") {
		var fln = $("#profileList").val() + ".pjs";  
		getBinProfile(fln);
	}
});

//TODO: naplnit prislusne hodnoty z configu do pole
function showConfigData() {
	console.log("CONFIG");
    J42R.setLang(config.lang,true).t();
    $('select#lang').val(J42R.getLang());
    populateSelectBox();
    
	$('#ledprofile').text(config.profileFileName.slice(0,-4));
	setSlaves(config);
		
	if (config.isManual == true) {
		$('#autoOnOff .Switch').removeClass('Off');
		$('#autoOnOff .Switch').addClass('On');
		$('#chvx .slider').removeAttr('disabled');
		$('#chvx input').removeAttr('disabled');
		$('#chv-submit').show();		
	} else {
		$('#autoOnOff .Switch').removeClass('On');
		$('#autoOnOff .Switch').addClass('Off');
		$('#chv-submit').hide();
		$('#chvx .slider').attr('disabled',true);
		$('#chvx input').attr('disabled',true);		
	}
		
	if (config.useNTP == true) {
		$('#ntpOnOff .Switch').removeClass('Off');
		$('#ntpOnOff .Switch').addClass('On');
		$('#time-setntp').show();
		$('#time-set').hide();	
		$("#use-ntp").val('1');					
	} else {
		$('#ntpOnOff .Switch').removeClass('On');
		$('#ntpOnOff .Switch').addClass('Off');
		$('#time-setntp').hide();
		$('#time-set').show();
		$("#use-ntp").val('0');
	}
	
	if (config.dst == true) {
		$('#dstOnOff .Switch').removeClass('Off');
		$('#dstOnOff .Switch').addClass('On');
		$('#set-dst').show();	
		$('#timezone-set').hide();
		$("#use-dst").val('1');	
	} else {
		$('#dstOnOff .Switch').removeClass('On');
		$('#dstOnOff .Switch').addClass('Off');
		$('#set-dst').hide();
		$('#timezone-set').show();	
		$("#use-dst").val('0');		
	}	
	
	
	$('#ntpip').val(config.ntpServer);
	//$('#useDST').prop('checked', config.dst);
	$('#dstStartMonth').val(config.dstStartMonth);
	$('#dstStartDay').val(config.dstStartDay);
	$('#dstStartWeek').val(config.dstStartWeek);
	
	
	$('#dstStartOffset').val(tzminute.indexOf(config.dstStartOffset));
	
	$('#dstEndMonth').val(config.dstEndMonth);
	$('#dstEndDay').val(config.dstEndDay);
	$('#dstEndWeek').val(config.dstEndWeek);
	$('#dstEndOffset').val(tzminute.indexOf(config.dstEndOffset));
	
	$('#dateFormat').val(config.dtFormat);
	$('#timeFormat').val(config.tmFormat);
	
	$('#lcdTimeout').val(config.lcdTimeout);
	$('#menuTimeout').val(config.menuTimeout);

	$('#timezone').val(tzminute.indexOf(config.dstEndOffset));	

}

function point(ch, px, py, a) {
	console.log("Point:",ch, px, py, a);
	addPoint(ch,$('#chT').val(), $('#chV').val()*(MAX_LED_VAL/100), a);
	clcHandler=false;
	$('#cursor').hide();
	reG1();
	msDown = false;
	msEditEnd = true;
};


$("#g1").on("mouseout", function( event ) {
	
	/*
	var x = g1.eventToDomCoords(event)[0];
	var y = g1.eventToDomCoords(event)[1];
	
	if ((x < g1.getArea().x) || (x > (g1.getArea().x + g1.getArea().w)) || (y < g1.getArea().y) || (x > (g1.getArea().y + g1.getArea().h)) ) {
		$("#cursor").hide();
		msDown = false;		
	}
	*/
	
	if (msDown == false) {
		$("#cursor").hide();
	}
	
});

function touchClickMove(event, g, context) {

	var pos = Dygraph.findPos(g.graphDiv)
	var x = event.touches[0].pageX  - pos.x;
	var y = event.touches[0].pageY - pos.y;

//	var x = event.targetTouches[0].pageX - $('#g1').offset().left;
//	var y = event.targetTouches[0].pageY - $('#g1').offset().top;

	px = Math.round(g1.toDataXCoord(x)); // if (px < 0) px = 0;
	py = Math.round(g1.toDataYCoord(y)); //if (py < 0) py = 0; if (py > 100) py = 100;
	
    if ((py < 0) || (py > 100) || (px < 0) || (px > 95)) return;
	
	var m = Number($("#ledsetup-filter-module").val());
	var ch = Number($("#ledsetup-filter-ledchan").val());
	
    clicktimer = null;
    //clcHandler=!clcHandler;

    var p = ''+m+','+ch+','+px+','+py+',';
    $("#cursor").empty();
    $("#cursor").html('<div><label>Time:</label>'+vT('chT')+'<label>Value:</label><input type="number" "style="width:2em" max="100" min="0" id="chV">%</div><button onclick="point('+p+'true)">Add</button><button onclick="point('+p+'false)">Remove</button><button  onclick="javascript:$(\'#cursor\').hide();">x</button>');
    $("#cursor").css('left', event.pageX).css('top', event.pageY - 60 ).css('display', 'block');      
    $('#chT').val(px);$('#chV').val(py);
    
}

function newDygraphTouchMove(event, g, context) { 
	event.preventDefault();
	if (tapped) { touchClickMove(event, g, context) }
	else { Dygraph.defaultInteractionModel.touchend(event, g, context) };
};

function newDygraphTouchStart(event, g, context) { 
	// This right here is what prevents IOS from doing its own zoom/touch behavior 
	// It stops the node from being selected too 
	event.preventDefault(); // touch browsers are all nice. 

	if (event.touches.length > 1) { 
		// If the user ever puts two fingers down, it's not a double tap. 
		context.startTimeForDoubleTapMs = null; 
	} 

	var touches = []; 
	for (var i = 0; i < event.touches.length; i++) { 
		var t = event.touches[i]; 
	// we dispense with 'dragGetX_' because all touchBrowsers support pageX 
		touches.push({ 
			pageX: t.pageX, 
			pageY: t.pageY, 
			dataX: g.toDataXCoord(t.pageX), 
			dataY: g.toDataYCoord(t.pageY) 
	// identifier: t.identifier 
		}); 
	} 
	context.initialTouches = touches; 

	if (touches.length == 1) { 
		// This is just a swipe. 
		context.initialPinchCenter = touches[0]; 
		context.touchDirections = { x: true, y: true }; 

		// ADDITION - this needs to select the points 
		var closestTouchP = g.findClosestPoint(touches[0].pageX,touches[0].pageY); 
		if(closestTouchP) { 
			var selectionChanged = g.setSelection(closestTouchP.row, closestTouchP.seriesName); 
		} 
		tapped = true;	
	} else if (touches.length >= 2) { 
		tapped = false;	
		// It's become a pinch! 
		// In case there are 3+ touches, we ignore all but the "first" two. 

		// only screen coordinates can be averaged (data coords could be log scale). 
		context.initialPinchCenter = { 
			pageX: 0.5 * (touches[0].pageX + touches[1].pageX), 
			pageY: 0.5 * (touches[0].pageY + touches[1].pageY), 

			// TODO(danvk): remove 
			dataX: 0.5 * (touches[0].dataX + touches[1].dataX), 
			dataY: 0.5 * (touches[0].dataY + touches[1].dataY) 
		}; 

		// Make pinches in a 45-degree swath around either axis 1-dimensional zooms. 
		var initialAngle = 180 / Math.PI * Math.atan2( 
		context.initialPinchCenter.pageY - touches[0].pageY, 
		touches[0].pageX - context.initialPinchCenter.pageX); 

		// use symmetry to get it into the first quadrant. 
		initialAngle = Math.abs(initialAngle); 
		if (initialAngle > 90) initialAngle = 90 - initialAngle; 

		context.touchDirections = { 
			x: (initialAngle < (90 - 45/2)), 
			y: (initialAngle > 45/2) 
		}; 
	} 

	// save the full x & y ranges. 
	context.initialRange = { 
		x: g.xAxisRange(), 
		y: g.yAxisRange() 
		}; 
};

$( document ).ready(function() {
    J42R.t();
    //wait for download localization
    
    		
	//get basic config data from chip
	getConfig();
	
	//create two Dygraph graphs
	// g0 = led intensity
	// g1 = led settings 
	g0 = new Dygraph(document.getElementById("g0"),
					reChannels(),
					 {	 height:150,
						 valueRange:[0,2400],
						 legend: 'never',				 
						 animatedZooms: false,
						 xlabel: "nm",
						 ylabel:  "power",
						 strokeWidth: 2,			 
						 plotter: rainbowPlotter     
					 });
   
   msDown = false;
   msMoveDown = false;  	
      		  	         
   g1 = new Dygraph($("#g1")[0],
   		emptyDtmo(),
		//dtmoEmpty,
		 {	
 		 	 height:300, 		 	
			 title: J42R.get('led.profil'),
			 labels:["Time","CH 1","CH 2","CH 3","CH 4","CH 5","CH 6","CH 7","Effect"],
			 colors:ledcolorsArr,
   		     visibility: [true, true, true, true, true, true, true, true],
			 showRangeSelector: false,
			 valueRange:[-10,MAX_LED_VAL+100] ,
			 legend: 'always',
			 labelsDiv: 'lbls',
			 animatedZooms: false,
			 xlabel: "Time",
			 ylabel:  "Brightness",
			 includeZero: true,
			 connectSeparatedPoints:true,
			 drawPoints: true,
			 pointSize: 4,
			 highlightCircleSize: 6,
			 dateWindow: [timeStart,timeEnd],
			 interactionModel: {
			 		mousedown: function (event, g, context) {
			 			msDown = true;
						 var pos = Dygraph.findPos(g.graphDiv)
						 var x = Dygraph.pageX(event) - pos.x;
						 var y = Dygraph.pageY(event) - pos.y;
						 oldX = Math.round(g1.toDataXCoord(x)); if (px < 0) px = 0;
						 oldY = Math.round(g1.toDataYCoord(y)); if (py < 0) py = 0; if (py > MAX_LED_VAL) py = MAX_LED_VAL;							  
					//Dygraph.defaultInteractionModel.mousedown(event, g, context);
			 		},			 					 		
			 		mousemove: function (event, g, context) {
			 			if (msDown) {
			 			  msMoveDown = true;
						  if (msEditEnd) {
							  $('#cursor').hide();
							  var pos = Dygraph.findPos(g.graphDiv)
							  var x = Dygraph.pageX(event) - pos.x;
							  var y = Dygraph.pageY(event) - pos.y;
							  px = Math.round(g1.toDataXCoord(x)); if (px < 0) px = 0;
							  py = Math.round(g1.toDataYCoord(y)); if (py < 0) py = 0; if (py > MAX_LED_VAL) py = MAX_LED_VAL;							  
							  timedelta =  px - oldX;
							  valuedelta = py/oldY;
							  oldX =  px;
							  oldY =  py;
							  if (!movingTime) {
								movingTime = true;
							  	moveTime(timedelta);
							  }
							  if (!movingValue) {
								movingValue = true;
							  	moveValue(valuedelta);
							  }							  
						  }
			 			  //Dygraph.Interaction.moveZoom(event, g, context);
			 			} else {
				 			  //if (isRealValue(timerscursor)) 
				 			  clearTimeout(timerscursor);
							  var pos = Dygraph.findPos(g.graphDiv)
							  var x = Dygraph.pageX(event) - pos.x;
							  var y = Dygraph.pageY(event) - pos.y;
							  px = Math.round(g1.toDataXCoord(x)); if (px < 0) px = 0;
							  py = Math.round(g1.toDataYCoord(y)); if (py < 0) py = 0; if (py > MAX_LED_VAL) py = MAX_LED_VAL;
							  var dX = px>80?-160:10;
							  var dY = py<10?-20:10; 
							  $("#cursor").html("<div>Time: " + minToTime(px) + "  Value: " + py/(MAX_LED_VAL/100) +"</div>");
							  $("#cursor").css('left', event.pageX + dX).css('top', event.pageY + dY).css('display', 'block');
							  msMoveDown = false;
							  timerscursor=setTimeout(function(){ $('#cursor').hide();},10000);
						}
			 		},
			 		mouseup: function(event, g, context) {														 			
			 			if (msMoveDown) {
			 				//Dygraph.Interaction.endZoom(event, g, context);
			 				msDown = false;
							msEditEnd = true;
			 			}
			 		},
			 		click:function(event, g, context) {			 			
						  clicks++;
						  if (clicks == 1) {
						  setTimeout(function(){
							if(clicks == 1)  {
							    if (msDown) {
							        //if (isRealValue(timerscursor)) 
									msEditEnd = false;
							        clearTimeout(timerscursor);
									var pos = Dygraph.findPos(g.graphDiv);
									var x = Dygraph.pageX(event) - pos.x;
									var y = Dygraph.pageY(event) - pos.y;
									px = Math.round(g1.toDataXCoord(x)); if (px < 0) px = 0;
									py = Math.round(g1.toDataYCoord(y)); if (py < 0) py = 0; if (py > MAX_LED_VAL) py = MAX_LED_VAL;
									var ch = $("#ledsetup-filter-ledchan").val();
									var p = ''+ch+','+px+','+py+',';
									var dX = px>72?-200:10;
									 var dY = py<10?-50:10;
									$("#cursor").empty();
									$("#cursor").html('<div><label>Time:</label>'+vT('chT')+'<label>Value:</label><input type="number" "style="width:2em" max="100" min="0" id="chV">%</div><button onclick="point('+p+'true)">Add</button><button onclick="point('+p+'false)">Remove</button><button  onclick="javascript:$(\'#cursor\').hide();msDown = false;">x</button>');
									$("#cursor").css('left', event.pageX + dX).css('top', event.pageY + dY).css('display', 'block');      
									$('#chT').val(px);$('#chV').val(py/(MAX_LED_VAL/100));
									timerscursor=setTimeout(function(){ $('#cursor').hide();},15000);
								}																
							}
							clicks = 0;
							}, 250);
						 }			 			
			 		},
	         		dblclick: function(event, g, context) {
	         		    msDown = false;       			
    	          		//Dygraph.defaultInteractionModel.dblclick(event, g, context);
						reG1();
            		},
            		touchstart: newDygraphTouchStart, 
					touchend: Dygraph.defaultInteractionModel.touchend, 
					touchmove: newDygraphTouchMove 
			 },			 		 
			 axes: {
			  x: {
				axisLabelFormatter: function(x) {
				  return minToTime(x);
				},
				pixelsPerLabel:35,
				valueFormatter: function (y) {
					return "Time: "+minToTime(y);
				}
			  },
			  y: {
				axisLabelFormatter: function(y) {
				  return ''+ (y/(MAX_LED_VAL/100)) +'%';
				},
				 pixelsPerLabel:20,
				valueFormatter: function (y) {
					return ""+ (y/(MAX_LED_VAL/100)) + "%";
				}                         
			  }
			 },
			 series: {
                  'Effect': {
                    strokeWidth: 0.0,
                    drawPoints: true,
                    pointSize: 4,
                  }
             }        
		 });

   // get current led values
   getInfo();   
         
    //nacteme cas z cipu a zobrazujeme
    timertime = window.setTimeout('display_ct()',1000);  

    
	//create led no-ui-sliders
	var sliders = $('#chvx .slider');
	
	var range_all_sliders = {
		'min': [   0 ],
		'max': [ 100 ]
	};    
    
	for ( var i = 0; i < sliders.length; i++ ) {
		noUiSlider.create(sliders[i], {
			start: 0,
			orientation: "horizontal",
			connect: [true, false],
			tooltips: false,
			range: {
				'min': 0,
				'max': 100
			},
			step:0.01
		});
		
		sliders[i].noUiSlider.on('update', function(values, handle){
			var id = this.target.id.slice(-1);
			$('#va'+id).val(values[0]);
			g0.updateOptions( { 'file': reChannels()});
		});
		
		$('#va'+i).on('change', function(){
			var id = this.id.slice(-1);		
			var sliders = $('#chvx .slider');	
			sliders[id].noUiSlider.set(this.value);
		});	
		
		$('#a'+i+' .noUi-connect').css('background', ledcolorsArr[i]);

	};
	
	sliders.attr('disabled',true);
	$('input.ledValLbl').attr('disabled',true);
	
	g0.updateOptions( { 'file': reChannels() } );
	
    // switch to page 
    if (QueryString.page == 'wifi') {
     	lastmenu = 'home';
     	curmenu  = 'wifi';
     	$(".pure-menu-item").removeClass("pure-menu-selected");
     	$('a#'+curmenu).parent(".pure-menu-item").addClass("pure-menu-selected");
     	if (lastmenu !== 'null')  {
     		$('div#'+lastmenu).toggle();
     	} 
     	$('div#'+curmenu).toggle();
     	lastmenu = curmenu;		
     	//if (isRealValue(timersken)) 
     	window.clearTimeout(timersken);
     	getWifiInfo();
    };
});

$('ul#ml').on('click', 'a', function(e){  
	if (!$(this).parent().hasClass('pure-menu-disabled')) {    		
    	selModule = $(this).attr('val');
    	getInfo();
    	g0.updateOptions( { 'file': reChannels(), title: J42R.get('led.module-name.'+ selModule) } );    	
	}    	
	return false;    	
});

function getBinProfile(fln) {
	$.ajax({
		type: 'GET',
		url: fln,
		dataType:"json",
		cache:false,
		  contentType:"application/json; charset=utf-8",
		 success:function(data) {
			unixtime = data.utc;
			unixtimestamp = data.utc;
			processData(data);
		 },
		error:function(xhr,type){
		  console.log(xhr);
		}
	});
}

function processData(d) {
	//fill dtmo
	dtmo = emptyDtmo();

	for (var b = 0; b < d['used']; b++) {
			var channel  = d['data'][b][0];
			var timeslot = d['data'][b][1];
			var value    = d['data'][b][2];
			var effect   = d['data'][b][3];
			if (channel == 255) break;
			addPoint(channel, timeslot, value, true);
	}
	dtmo.sort((a, b) => { return a[0] - b[0]});
	reG1();	
}

function setManual(t) {
	var d = 'm='+(t==true?1:0);
	$.ajax({
		type: 'POST',
		url: 'setmanual.cgi',
		data: d,
		success:function(data) {
			getConfig();
		},
		error:function(xhr,type){
			console.log(xhr);
		}		
	});			
}

function moveTime(x) {
	for(i=0;i<dtmo.length;i++) {
		dtmo[i][0] = dtmo[i][0]+x;
		if (dtmo[i][0] > 144) dtmo[i][0] = dtmo[i][0]-144;
		if (dtmo[i][0] < 0) dtmo[i][0] = dtmo[i][0] + 144;
	}
	dtmo.sort((a, b) => { return a[0] - b[0]});
	reG1();
	movingTime = false;
}

function moveValue(x) {
	var ch = Number($("#ledsetup-filter-ledchan").val())+1;
	for(i=0;i<dtmo.length;i++) {
		for(ii=1;ii<8;ii++) {
			if (ch > 0) {
				if (dtmo[i][ch] != null) {
					dtmo[i][ch] = Math.round(dtmo[i][ch]*x);
				}
			} else {
				if (dtmo[i][ii] != null) {
					dtmo[i][ii] = Math.round(dtmo[i][ii]*x);
				}
			}
		}		
	}
	dtmo.sort((a, b) => { return a[0] - b[0]});
	reG1();
	movingValue = false;
}

$('#led-man-send').click(function(e){
	e.preventDefault();
	var ledarr = {};
	var sldrs = $('#chvx .slider');
	var obj = new Object();
	var ledarr = [];
	for (led=0;led<7;led++) {
		ledarr.push(Math.round((Number(sldrs[led].noUiSlider.get()))*(MAX_LED_VAL/100),0));
	}
	obj.data = ledarr;
	var d = JSON.stringify(obj);
	console.log(d);
	$.ajax({
		type: 'POST',
		url: 'setled.cgi',
		data: d,
		dataType: 'json',
		success:function(data) {
			showResult('#led-man-result', "Success", 10000);
		},
		error:function(xhr,type){
			console.log(xhr);
		}		
	});
});

$('#led-save-profile').click(function(e){
	e.preventDefault();
	//prevedeme dtmo na profile.pjs
	// {"used":0,"data":[
	//   [ch,time,value,effect]
	// ]}
	var obj = new Object();
	var data = [];
	var idx = 0;
	dtmo.forEach(function(d) {
		for (x=1;x<9;x++) {
			if (d[x] != null) {
				var sArr = [];
				sArr[0] = x-1;  //channel
				sArr[1] = d[0]; //time
				sArr[2] = d[x]; //value
				sArr[3] = d[8] == null?0:d[8]; //effect
				data.push(sArr);
				idx++;
			}
		}
	});
	data.sort((a, b) => { return a[0] - b[0]});
	obj.used = idx;
	obj.data = data;
	var json = JSON.stringify(obj);
	var blob = new Blob([json], { type: 'text/json' });
	var fd = new FormData();
	var pfn = $('#profilename').val();
	if (pfn == "") {
		pfn = $('#profileList').val();
	}
	pfn = pfn +".pjs";
	
	fd.append('filename', pfn);
	fd.append('file', blob, pfn);
	
	$.ajax({
		type: 'POST',
		url: 'saveSampling.cgi',
		data: fd,
		processData: false,
		contentType: false,
		success:function(data, status, xhr) {
			if (status=="success") {
				 $('#profilename').val("");
				 showResult('#led-save-result', "Saved", 10000); 
				 
				 //reload config
				 getConfig();
		 	     setProfileList();
	             getProfileValues();				 
				 getInfo();
				 
			} else {
				 showResult('#led-save-result', "Error", 10000); 				 				
			}
		},
		error:function(xhr,type){
			showResult('#led-save-result', "Error", 10000);
		}		
	});	
});

function setSlaves(_data){
	$('.slave').remove();
	_data.slaves.forEach(function(d) {
		$('#slv').after(" \
			<div class='pure-u-1-8 slave'>\
				<div class='card'>\
					<a class='boxclose' id='boxclose' onclick='closebox(this)'></a> \
					<div>\
						<img src='nereus-icn.png' width='100%'/>\
						<figcaption> "+d+"</figcaption> \
					</div>\
				</div>\
			</div>\
		");
	});
}

$('#slaveform').on('submit', function(e) {
	e.preventDefault();
	getSlaves();
});

$('#slaves-save').click(function(){
	saveSlaves();
});

function removeSlaves(t) {
	console.log("REMOVE SLAVES");
	var slv = $(t).closest('div').find('figcaption').text();
	var _data = new Object();
	_data.slave = slv.trim();
	console.log(JSON.stringify(_data));
	$.ajax({
		url:'removeslave.cgi',
		type:"POST",
		dataType:"json",
		data: JSON.stringify(_data),
		cache:false,
		success: function (data) {  
			console.log(data);
			setSlaves(data);
		}
	 });
}

function saveSlaves() {
	console.log("SLAVE SAVE");
	var d = 's=1';
	$.ajax({
		url:'peers.cgi',
		type:"GET",
		data:d,
		success: function (data) {  
			console.log(data);
		}
	 });   	
}

function getSlaves() {
		console.log("SLAVE SUBMIT");
		$.ajax({
			url:'getslaves.cgi',
			type:"GET",
			dataType:"json",
			cache:false,
			processData: false,
			contentType:"application/json; charset=utf-8",
			success: function (data) {  
				console.log(data);
			}
		 });
		 window.setTimeout(displaySlaves, 5000);
}

function displaySlaves() {
	$.ajax({
		url:'showslaves.cgi',
		type:"GET",
		dataType:"json",
		cache:false,
		processData: false,
		contentType:"application/json; charset=utf-8",
		success: function (data) {  
			setSlaves(data);
		}
	 });
}


$('#timeform').on('submit', function(e) { 
		e.preventDefault();
		//alert('test');
          //prevent form from submitting
       var _data = $("#timeform").serialize();		
		$.ajax({
            type: 'POST',
            url: 'settime.cgi',
            data: _data,
            cache:false,
            success: function (data) {  
                getConfig();
                showResult('#time-save-result', "Saved", 10000); 
                //window.location.href = "/?page=wifi";             
            }
         });       
});

function closebox(t) {
	if (confirm(J42R.get('confirmSlvRem'))) {
		removeSlaves(t);
	  }
}

var uiversion = "1.2";