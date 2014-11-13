define    ( [
          ]
        , function(ALX_magictouch) {
    // Coder ici les interactions de translation et de transformation affine


    //http://stackoverflow.com/questions/4850821/svg-coordinates-with-transform-matrix
	console.log("---> Start");
    svg= document.querySelector("svg");

    var E = document.querySelectorAll("svg .déplaçable");
    for(var i=0;i<E.length;i++){
        E.item(i).addEventListener("touchstart", function (event){
            console.log("touchStart event "+this.id);
            event.preventDefault();
            onStart(event);

        },false);
        E.addEventListener("touchmove", function (event){
            console.log("touchMove event "+this.id);
            event.preventDefault();
            onMove(event);
        },false);
    }


    function onMove(e){
        var matrice = svg.getScreenCTM().inverse()
        //déplacer le dessin ici
        var pt = svg.createSVGPoint();
        pt.x = evt.clientX;
        pt.y = evt.clientY;
        var globalPoint = pt.matrixTransform(matrice);

        this.setAttribute('transform','translate('+globalPoint.x+','+globalPoint.y+')');
    }


    function onStart(e){
        /* enregistrement, lors du touchstart, la correspondance entre l'identifiant du touch et l'élement touché, ainsi que des infos complémentaires...
        */
        /*var ElementDeTouchId = {};
        ElementDeTouchId[touch.identifier]=ElementSVG;
        /* = { Element : ElementSVG

        */
        var L = e.changedTouches;
		for(var i = 0; i < L.length; i++){
			var touch = L.item(i);
			var id = touch.identifier;
			var newP = SVGRoot.createSVGPoint();
			newP.x = touch.pageX;
			newP.y = touch.pageY;
			newP = newP.matrixTransform(elem.getCTM().inverse());
			StockPointElem[id] = {coordonnees : newP, elemAsso : elem};
		}
    }
});