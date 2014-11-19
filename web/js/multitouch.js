define    ( [
          ]
        , function(ALX_magictouch) {
    // Coder ici les interactions de translation et de transformation affine

    /*Code realiser avec l'aide du binome FREBY-LABAT, il y aura donc des ressemblances*/
	console.log("---> Start");
    
    //balise svg du html
    svg= document.querySelector("svg");
    
    var StockElem = {};
    
    //objet html deplacable
    var E = document.querySelectorAll("svg .deplacable");
    for(var i=0;i<E.length;i++){
        E.item(i).addEventListener("touchstart", function (event){
            console.log("touchStart event "+this.id);
            onStart(event,this);

        },false);
        E.item(i).addEventListener("touchmove", function (event){
            console.log("touchMove event "+this.id);
            event.preventDefault();
            onMove(event);
        },false);
    }


    function onStart(e,obj){
        /* enregistrement, lors du touchstart, la correspondance entre l'identifiant du touch et l'élement touché, ainsi que des infos
        complémentaires... */
        var L = e.changedTouches;
		for(var i = 0; i < L.length; i++){
			var touch = L.item(i);
			var id = touch.identifier;
			var newP = svg.createSVGPoint();
			newP.x = touch.pageX;
			newP.y = touch.pageY;
			newP = newP.matrixTransform(obj.getCTM().inverse());
            var MyMatrice =obj.parentElement.getCTM().inverse().multiply(obj.getCTM());

			StockElem[id] = {coordonnees : newP, obj : obj, parent : obj.parentElement, matrice : MyMatrice};
		}
    }
    
    function onMove(e){
        var L = e.changedTouches;
        for(var i = 0; i < L.length; i++){
            var pts = L.item(i);
            //verifie que le point n'est pas null
            if(typeof StockElem[pts.identifier] === "undefined") {continue;}
            
            var elem = StockElem[pts.identifier].obj;
            var coordonnees = StockElem[pts.identifier].coordonnees;
            
            //déplacer le dessin
            var pt = svg.createSVGPoint();
            pt.x = pts.pageX;
            pt.y = pts.pageY;
            // Coordonnées du pointeur par rapport au parent de l'élément à déplacer
            var parent = StockElem[pts.identifier].parent;
            coordonneesRelativeAParent = pt.matrixTransform(parent.getCTM().inverse());

            // Résoud l'équation
            var M = StockElem[pts.identifier].matrice;
            var e = coordonneesRelativeAParent.x - M.a*coordonnees.x - M.c *coordonnees.y;
            var f = coordonneesRelativeAParent.y - M.b*coordonnees.x - M.d *coordonnees.y;
            // Affecter la matrice de transformtion
            elem.setAttribute('transform', 'matrix('+M.a+','+M.b+','+M.c+','+M.d+','+e+','+f+')' );
               
        }
    
    }
    
    
    
});