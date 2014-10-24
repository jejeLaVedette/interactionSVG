define	( []
		, function() {

// Framework for simulating touch events without a mobile device
// Trying to be compatible with
//  http://dvcs.w3.org/hg/webevents/raw-file/tip/touchevents.html
// TODO: support more of the touch API: touch{enter, leave, cancel}

// Updated by Alexandre Demeure
// real coordinates (in case of page scroll
// simulation of the touch datastructure

function getCoordinate_relative_to (x, y, node) {
		 var element = node, offsetX = 0, offsetY = 0, mx, my;
		 var stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(node, null)['paddingLeft'], 10)      || 0;
		 var stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(node, null)['paddingTop'], 10)       || 0;
		 var styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(node, null)['borderLeftWidth'], 10)  || 0;
		 var styleBorderTop   = parseInt(document.defaultView.getComputedStyle(node, null)['borderTopWidth'], 10)   || 0;

		 // Compute the total offset. It's possible to cache this if you want
		 if (element.offsetParent !== undefined) {
			do {offsetX += element.offsetLeft;
				offsetY += element.offsetTop;
			   } while ((element = element.offsetParent));
		 }

		 // Add padding and border style widths to offset
		 // Also add the <html> offsets in case there's a position:fixed bar (like the stumbleupon bar)
		 // This part is not strictly necessary, it depends on your styling
		 offsetX += stylePaddingLeft + styleBorderLeft + document.body.parentNode.offsetLeft;
		 offsetY += stylePaddingTop  + styleBorderTop  + document.body.parentNode.offsetTop;

		 mx = x - offsetX;
		 my = y - offsetY;

		 // We return a simple javascript object with x and y defined
		 return {x: mx, y: my};
		}
		
var tuio = {
	Pipo_TouchList: function(L) {
		 this.Tab = L;
		 for(var i=0; i<L.length; i++) {this[i] = L[i];}
		 this.length = L.length;
		 this.item = function(i) {return this.Tab[i];}
		 this.splice = function(index, nb) {
			 this.Tab.splice(index, nb);
			 this.length = this.Tab.length;
			 delete this[ this.length ];
			 for(var i=0; i<L.length; i++) {this[i] = L[i];}
			},
		 this.identifiedTouch = function(id) {
			 for(var i = 0; i < this.length; i++) {
				 if(this.Tab[i].identifier == id) return this.Tab[i];
				}
			 return null;
			}
		 this.push = function(e) {
			 this.Tab.push(e);
			 this[this.length] = this.Tab[this.length];
			 this.length = this.Tab.length;
			}
		 this.setTarget = function(i, n) {return this.Tab[i].target = n;}
		},
		
	cursors: null, //[],

  // Data structure for associating cursors with objects
	_data: {},

  _touchstart:    function(touch) {
    // Create a touchstart event
	// Compute touch target
	//touch.target = null;
	var node = touch.currentTarget;
	// console.log("touch on " + node.id);
	// while(node != null && node.ontouchstart == undefined && ) {
		 // node = node.parentNode;
		// }
    this._create_event('touchstart', touch, {});
  },

  _touchmove: function(touch) {
    // Create a touchmove event
    this._create_event('touchmove', touch, {});
  },

  _touchend: function(touch) {
    // Create a touchend event
    this._create_event('touchend', touch, {});
  },

  _create_event: function(name, touch, attrs) {
    // Creates a custom DOM event
    //var evt = document.createEvent('CustomEvent');
	var evt = document.createEvent('HTMLEvents');
	
    evt.initEvent(name, true, true);
    // Attach basic touch lists
    evt.touches = this.cursors;
    // Get targetTouches on the event for the element
    evt.targetTouches  = this._get_target_touches(touch.target);
    evt.changedTouches = new this.Pipo_TouchList( [touch] );
    // Attach custom attrs to the event
    for (var attr in attrs) {
      if (attrs.hasOwnProperty(attr)) {
        evt[attr] = attrs[attr];
      }
    }
    // Dispatch the event
	
    if (touch.target) {
      // console.log('Dispatch touch event on ' + touch.target + ' (' + touch.target.getAttribute('id') + ')');
      touch.target.dispatchEvent(evt);
    } else {
      document.dispatchEvent(evt);
    }
  },

  _get_target_touches: function(element) {
    var targetTouches = new this.Pipo_TouchList([]);
    for (var i = 0; i < this.cursors.length; i++) {
      var touch = this.cursors.item(i);
	  // console.log('touch = cursor[' + i + '] = ' + touch);
      if (touch.target == element) {
        targetTouches.push(touch);
      }
    }
    return targetTouches;
  },

	// Callback from the main event handler
	callback: function(type, sid, fid, x, y, angle, svg) {
    // console.log('callback type: ' + type + ' sid: ' + sid + ' fid: ' + fid);
		var data;

		if (type !== 3) {
			data = this._data[sid];
		} else {
			data = {
				sid: sid,
				fid: fid
			};
			this._data[sid] = data;
		}

    // Some properties
    // See http://dvcs.w3.org/hg/webevents/raw-file/tip/touchevents.html
    data.identifier = sid;
	if(svg) {
		 data.currentTarget = data.target = svg;
		 data.pageX  = data.clientX = x;
		 data.pageY  = data.clientY = y;
		} else	{data.currentTarget = data.target = document.elementFromPoint(data.pageX, data.pageY);
				 data.pageX  = data.clientX = window.innerWidth  * x;
				 data.pageY  = data.clientY = window.innerHeight * y;
				}
    if (  data.currentTarget != null
	   && data.currentTarget.tagName == 'svg') {
		 var rect	= data.currentTarget.createSVGRect()
		   , coords = getCoordinate_relative_to(data.pageX, data.pageY, data.currentTarget);
		 rect.x = coords.x;
		 rect.y = coords.y;
		 rect.width=rect.height= 1;
		 var hits= data.currentTarget.getIntersectionList(rect, null);
		 if(hits.length > 0) {
			 data.currentTarget = data.target = hits[hits.length-1];
			}
		}
	data.pageX += window.pageXOffset;
    data.pageY += window.pageYOffset;
	// console.log('Touch target ' + data.target + '(' + data.target.getAttribute('id') + ') from point ' + data.pageX + ' ; ' + data.pageY);

		switch (type) {
			case 3:
			    // console.log('add pointer: ');
				// for (att in data) {
					 // console.log('  ' + att + ': ' + data[att] );
					// }
				this.cursors.push(data);
				this._touchstart(data);
				break;

			case 4:
				this._touchmove(data);
				break;

			case 5:
				// console.log('a pointer disappears... data: ' + data);
				var index_of_touch;
				for(index_of_touch = 0; index_of_touch < this.cursors.length; index_of_touch++) {
					 if(this.cursors.item(index_of_touch).identifier == data.identifier) break;
					}
				this.cursors.splice(index_of_touch, 1);
				this._touchend(data);
				break;

			default:
				break;
		}

		if (type === 5) {
			delete this._data[sid];
		}
	}

};

tuio.cursors = new tuio.Pipo_TouchList([]);

function tuio_callback(type, sid, fid, x, y, angle)	{
	tuio.callback(type, sid, fid, x, y, angle);
}

//_____________________________________________________________________________
// Pipo touches from mouse ----------------------------------------------------
//_____________________________________________________________________________
var nbPipoTouch = 0, draggedPipoTouch = null, movedPipoTouch;
function startDragPipoTouch(event) {
	event.stopPropagation(); event.preventDefault();
	var divTouch = this;
	divTouch.dataset.lastX = event.pageX;
	divTouch.dataset.lastY = event.pageY;
	draggedPipoTouch = divTouch;
	movedPipoTouch	 = false;
	document.addEventListener("mousemove", dragPipoTouch    , true);
	document.addEventListener("mouseup"  , stopDragPipoTouch, true);
}

function dragPipoTouch		(event) {
	event.stopPropagation(); event.preventDefault();
	var divTouch = draggedPipoTouch;
	var Y  = parseInt(divTouch.style.top )
	  , X  = parseInt(divTouch.style.left)
	  , dx = event.pageX - divTouch.dataset.lastX
	  , dy = event.pageY - divTouch.dataset.lastY;
	divTouch.dataset.lastX	= event.pageX;
	divTouch.dataset.lastY	= event.pageY;
	divTouch.style.top		= (Y+dy) + "px";
	divTouch.style.left		= (X+dx) + "px";
	movedPipoTouch			= true;
	tuio.callback( 4, divTouch.dataset.idPointer, "PipoTouch"
				 , X+dx
				 , Y+dy
				 , 0
				 , svgForPipoTouch
				 );
}

function stopDragPipoTouch	(event) {
	event.stopPropagation(); event.preventDefault();
	draggedPipoTouch = null;
	document.removeEventListener("mousemove", dragPipoTouch    , true);
	document.removeEventListener("mouseup"  , stopDragPipoTouch, true);
}

function addPipoTouchFromMouse(event) {
	event.stopPropagation(); event.preventDefault();
	var divTouch = document.createElement('div');
		divTouch.onmousedown = startDragPipoTouch;
		document.body.appendChild( divTouch );
		divTouch.dataset.idPointer = "PipoTouch_" + (nbPipoTouch++);
		divTouch.style.position	= "absolute";
		divTouch.style.top		= (event.pageY-10) + "px";
		divTouch.style.left		= (event.pageX-10) + "px";
		divTouch.style.width	= "20px";
		divTouch.style.height	= "20px";
		divTouch.style.backgroundColor	= "grey";
		divTouch.style.borderColor		= "black";
		divTouch.style.borderRadius		= "10px";
		divTouch.onclick		= function(e) {
									 if(!movedPipoTouch) removePipoTouchFromMouse(e, divTouch);
									}
		tuio.callback( 3, divTouch.dataset.idPointer, "PipoTouch"
					 , event.pageX
					 , event.pageY
					 , 0
					 , svgForPipoTouch
					 );
	return divTouch;
}

function removePipoTouchFromMouse(event, divTouch) {
	event.stopPropagation(); event.preventDefault();
	divTouch.parentNode.removeChild( divTouch );
	var id = divTouch.dataset.idPointer;
	tuio.callback( 5, divTouch.dataset.idPointer, "PipoTouch"
				 , (parseInt(divTouch.style.left) - 10) + "px"
				 , (parseInt(divTouch.style.top ) - 10) + "px"
				 , 0
				 , svgForPipoTouch
				 );
}

var svgForPipoTouch;

	return {
		  simulateMultiTouchFromMouse	: function(bool, svg) {
			 if(bool) {
				 console.log("PipoTouch activated for", svg);
				 svgForPipoTouch = svg;
				 svgForPipoTouch.addEventListener( "click", addPipoTouchFromMouse, true);
				} else	{
						}
			}
		};
});

