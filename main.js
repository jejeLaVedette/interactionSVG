define	( [ "./js/domReady.js"
		  , "./js/ALX_magictouch.js"
		  , "./js/multitouch.js"
		  ]
		, function(domReady, ALX_magictouch) {
	domReady( function() {
		 ALX_magictouch.simulateMultiTouchFromMouse(true, document.querySelector('svg'));
		});
});
