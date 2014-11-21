define    ( [
          ]
        , function(ALX_magictouch) {
    // Coder ici les interactions de translation et de transformation affine

    /***********************************************************************************/
    /*Code realiser avec l'aide du binome FREBY-LABAT, il y aura donc des ressemblances*/
    /***********************************************************************************/

    
	console.log("---> Start");
    
    //supprimer le point
    document.addEventListener("touchend", function (event){
		delete(StockElem[event.changedTouches.item(0).identifier]);
    }, false);
    
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
           //en fonction du nombre de point on change de methode move
            var nbPoint=0;
            for(myObj in StockElem){
                if(event.changedTouches.item(0).target.id == StockElem[myObj].obj.id) nbPoint++;
            }
            console.log("nbPoint :"+nbPoint);
            if(nbPoint===1) onMove(event);
            else if(nbPoint === 2) onRotoZoom(event);
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
    
    //ici on sait que l on a que deux points sur l objet courrant
    function onRotoZoom(e){
        console.log("in onMoveRotation");
        var L = e.changedTouches;
        
        var dx1; //=P1.x - P2.x
        var dx2; //=P1'.x - P2'.x
        var dy1; //=P1.y - P2.y
        var dy2; //=P1'.y - P2'.y
        var s;
        var c;
        
        for(var i = 0; i < L.length; i++){
            var pts = L.item(i);
            var pts2;
            for(myObj in StockElem){
                if((event.changedTouches.item(0).target.id == StockElem[myObj].obj.id)&&(event.changedTouches.item(0).target!=pts)) {
                    pts2=myObj;
                    console.log("pts2 :"+pts2);
                }
            }
            
            var elem = StockElem[pts.identifier].obj;

            //P1
            var coordonnees1 = StockElem[pts.identifier].coordonnees;
            //P2
            var coordonnees2 = StockElem[pts2].coordonnees;
            
             //déplacer le dessin
            var pt = svg.createSVGPoint();
            pt.x = pts.pageX;
            pt.y = pts.pageY;
            // Coordonnées du pointeur par rapport au parent de l'élément à déplacer
            var parent1 = StockElem[pts.identifier].parent;
            var parent2 = StockElem[pts2].parent;
            
            //P1'
            coordonneesRelativeAParent1 = pt.matrixTransform(parent1.getCTM().inverse());
            //P2'
            coordonneesRelativeAParent2 = pt.matrixTransform(parent2.getCTM().inverse());
            
            dx1 = coordonnees1.x - coordonnees2.x;
            console.log("coordonnees1.x :"+coordonnees1.x);
            console.log("coordonnees2.x :"+coordonnees2.x);
            if(dx1<0) dx1 = -dx1;
            console.log("dx1 :"+dx1);
            dx2 = coordonneesRelativeAParent1.x - coordonneesRelativeAParent2.x;
            if(dx2<0) dx2 = -dx2;
            console.log("dx2 :"+dx2);
            dy1 = coordonnees1.y - coordonnees2.y;
            if(dy1<0) dy1 = -dy1
            console.log("dy1 :"+dy1);
            dy2 = coordonneesRelativeAParent1.y - coordonneesRelativeAParent2.y;
            if(dy2<0) dy2 = -dy2;
            console.log("dy2 :"+dy2);

            //si les points ne se confondent pas
            if((dx1!==0) && (dy1!==0)){
                console.log("1");
                if((dx1===0)&&(dy1!=dx1)){
                    console.log("2");
                    s = -dx2/dy1;
                    c = dy2/dy1;
                    console.log("s :" +s);
                    console.log("c :"+c);
                }
                else if((dx1!=0)&&(dy1===0)){
                    console.log("3");
                    s = dy2/dx1;
                    c = dx2/dx1;
                    console.log("s :" +s);
                    console.log("c :"+c);
                }
                else if((dx1!=0) && (dy1!=0)){
                    console.log("4");
                    s = (dy2/dy1 - dx2/dx1) / (dy1/dx1 + dx1/dy1);
                    c = (dy2 - s*dx1) / dy1;
                    console.log("s :" +s);
                    console.log("c :"+c);
                }
            }
            
            var M = StockElem[pts.identifier].matrice;
            var e = coordonneesRelativeAParent1.x - c*coordonnees1.x + s*coordonnees1.y;
            console.log("e :"+e);
            var f = coordonneesRelativeAParent1.y - s*coordonnees1.x + c*coordonnees1.y;
            console.log("f :"+f);
            
            elem.setAttribute('transform', 'matrix('+M.a+','+M.b+','+M.c+','+M.d+','+e+','+f+')' );      
        }
    }
});