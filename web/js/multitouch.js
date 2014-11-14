define    ( [
          ]
        , function(ALX_magictouch) {
    // Coder ici les interactions de translation et de transformation affine


    //http://stackoverflow.com/questions/4850821/svg-coordinates-with-transform-matrix
	console.log("---> Start");
    svg= document.querySelector("svg");
    
    var StockPointElem = {};
    var ElementDeTouchId = {};

    var E = document.querySelectorAll("svg .deplacable");
    for(var i=0;i<E.length;i++){
        E.item(i).addEventListener("touchstart", function (event){
            console.log("touchStart event "+this.id);
            event.preventDefault();
            onStart(event,this);

        },false);
        E.item(i).addEventListener("touchmove", function (event){
            console.log("touchMove event "+this.id);
            event.preventDefault();
            onMove(event);
        },false);
    }


    function onMove(e){
        var L = e.changedTouches;
        for(var i = 0; i < L.length; i++){
            var pts = L.item(i);
            var elem = StockPointElem[L.item(i).identifier].newPoint;
            var matrice = elem.getCTM().inverse();
            //déplacer le dessin ici
            var pt = svg.createSVGPoint();
            pt.x = pts.clientX;
            pt.y = pts.clientY;
            var globalPoint = pt.matrixTransform(matrice);
            var newPoint = StockPointElem[L.item(i).identifier].coordonnees;

            elem.setAttribute('transform','translate('+(globalPoint.x-newPoint.x)+','+(globalPoint.y-newPoint.y)+')');
        }
    }


    function onStart(e,obj){
        /* enregistrement, lors du touchstart, la correspondance entre l'identifiant du touch et l'élement touché, ainsi que des infos
        complémentaires... */
        /*var ElementDeTouchId = {};
        ElementDeTouchId[touch.identifier]=ElementSVG;
        /* = { Element : ElementSVG */
        var L = e.changedTouches;
		for(var i = 0; i < L.length; i++){
			var touch = L.item(i);
			var id = touch.identifier;
			var newP = svg.createSVGPoint();
			newP.x = touch.pageX;
			newP.y = touch.pageY;
			newP = newP.matrixTransform(obj.getCTM().inverse());
			StockPointElem[id] = {coordonnees : newP, newPoint : obj};
		}
    }
});