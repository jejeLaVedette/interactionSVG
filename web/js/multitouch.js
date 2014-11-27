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
    var coordonneesRelativeAParent;
    
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


    //function onStart(e,obj){
        /* enregistrement, lors du touchstart, la correspondance entre l'identifiant du touch et l'élement touché, ainsi que des infos
        complémentaires... */
        /*var L = e.changedTouches;
		for(var i = 0; i < L.length; i++){
			var touch = L.item(i);
			var id = touch.identifier;
			var newP = svg.createSVGPoint();
			newP.x = touch.pageX;
			newP.y = touch.pageY;
			newP = newP.matrixTransform(obj.getCTM().inverse());
            var MyMatrice =obj.parentElement.getCTM().inverse().multiply(obj.getCTM());
            
            // On calcul pt_prime, point correspondant au touch dans le repère parent
            var pt_prime = svg.createSVGPoint();
            pt_prime.x = touch.pageX;
            pt_prime.y = touch.pageY;
            pt_prime = pt_prime.matrixTransform(obj.parentElement.getCTM().inverse());

            StockElem[id] = {coordonnees : newP, obj : obj, parent : obj.parentElement, matrice : MyMatrice, pt_prime:pt_prime};
		}
        
        //rajouter transfo par rap element et parent
        //deuxieme clique : verif si deja pointeur sur l elem
        //--> on modif la struc du 1 pts pour rajouter dans le deuxieme point
        //--> le deuxieme points aura la mm structure que le permier point
    }*/
    
    function onStart(e, elem){
        var L = e.changedTouches;
        for(var i = 0; i < L.length; i++){
            var touch = L.item(i); 
            var id = touch.identifier;
            var newP = svg.createSVGPoint();
            newP.x = touch.pageX;
            newP.y = touch.pageY;
            var coordonneesRelativeAParent = newP.matrixTransform(elem.getCTM().inverse());
			var p_prime = newP.matrixTransform(elem.parentElement.getCTM().inverse());
            var M = elem.parentElement.getCTM().inverse().multiply(elem.getCTM());
			
			
			//debut modif
			var nbrElement = 0;
			var lastId;
        	for(valeur in StockElem){
				if(touch.target.id == StockElem[valeur].obj.id){
					nbrElement++;
					lastId = StockElem[valeur].idpoint1;
				}
			}
            
            //deuxieme clique : verif si deja pointeur sur l elem
            //--> on modif la struc du 1 pts pour rajouter dans le deuxieme point
            //--> le deuxieme points aura la mm structure que le permier point
            
			//si premier clique
			if(nbrElement === 0){
				StockElem[id] = {cp : coordonneesRelativeAParent, obj : elem, matrice : M,parent : elem.parentElement, p1_prime : p_prime, idpoint1 :  id}; 
			} else if(nbrElement === 1){ //deuxieme clique
				StockElem[lastId].cp2 = coordonneesRelativeAParent;
				StockElem[lastId].p2_prime = p_prime;
				StockElem[lastId].idpoint2 = id;
				StockElem[id] = StockElem[lastId];
			}else{
				continue;
			}
        }
    }
    
    function onMove(evt){
        var L = evt.changedTouches;
        for(var i = 0; i < L.length; i++){
            var pts = L.item(i);
            
            //verifie que le point n'est pas null
            if(typeof StockElem[pts.identifier] === "undefined") {continue;}
            
            var elem = StockElem[pts.identifier].obj;
            var coordonneesP = StockElem[pts.identifier].cp;
            
            //déplacer le dessin
            var pt = svg.createSVGPoint();
            pt.x = pts.pageX;
            pt.y = pts.pageY;
            // Coordonnées du pointeur par rapport au parent 
            var parent = StockElem[pts.identifier].parent;
            coordonneesRelativeAParent = pt.matrixTransform(parent.getCTM().inverse());

            // Résoud l'équation
            var M = StockElem[pts.identifier].matrice;
            var e = coordonneesRelativeAParent.x - M.a*coordonneesP.x - M.c *coordonneesP.y;
            var f = coordonneesRelativeAParent.y - M.b*coordonneesP.x - M.d *coordonneesP.y;
            // Affecter la matrice de transformtion
            elem.setAttribute('transform', 'matrix('+M.a+','+M.b+','+M.c+','+M.d+','+e+','+f+')' );      
            
            StockElem[pts.identifier].p1_prime = pt.matrixTransform(elem.parentElement.getCTM().inverse());

        }
    }
    
    //ici on sait que l on a que deux points sur l objet courrant
    function onRotoZoom(evt){
        console.log("in onRotoRotation");
        var L = evt.changedTouches;
        
        var dx1; //=P1.x - P2.x
        var dx2; //=P1'.x - P2'.x
        var dy1; //=P1.y - P2.y
        var dy2; //=P1'.y - P2'.y
        var s;
        var c;
        
        for(var i = 0; i < L.length; i++){
            var pts = L.item(i);
            if(typeof StockElem[pts.identifier] === "undefined") 
					continue;
            var elem = StockElem[pts.identifier].obj;
            
             //déplacer le dessin
            var pt = svg.createSVGPoint();
            pt.x = pts.pageX;
            pt.y = pts.pageY;
            
            var parent = StockElem[pts.identifier].parent;
            coordonneesRelativeAParent = pt.matrixTransform(parent.getCTM().inverse());
             point_prime = pt.matrixTransform(parent.getCTM().inverse());	
            
            
				if(pt.identifier === StockElem[pts.identifier].idpoint1){
					StockElem[pts.identifier].p1_prime = point_prime;
					
				}else{
					StockElem[pts.identifier].p2_prime = point_prime;
				}
            
            
            coordonnees1=StockElem[pts.identifier].cp;
            coordonnees2=StockElem[pts.identifier].cp2;
            coordonnes1Prime=StockElem[pts.identifier].p1_prime;
            coordonnes2Prime=StockElem[pts.identifier].p2_prime;
            
            dx1 = coordonnees1.x - coordonnees2.x;
            if(dx1<0) dx1 = (-1)*dx1;
            console.log("dx1 ="+dx1);
            dx2 = coordonnes1Prime.x - coordonnes2Prime.x;
            if(dx2<0) dx2 = (-1)*dx2;
            console.log("dx2 ="+dx2);
            dy1 = coordonnees1.y - coordonnees2.y;
            if(dy1<0) dy1 = (-1)*dy1;
            console.log("dy1 ="+dy1);
            dy2 = coordonnes1Prime.y - coordonnes2Prime.y;
            if(dy2<0) dy2 = (-1)*dy2;
            console.log("dy2 ="+dy2);

            //si les points ne se confondent pas
            if((dx1!==0) && (dy1!==0)){
                console.log("1");
                if((dx1===0)&&(dy1!=0)){
                    console.log("2");
                    s = (-dx2)/dy1;
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
                    c = (dx2+s*dy1)/dx1;;
                    console.log("s :" +s);
                    console.log("c :"+c);
                }
            }
            
            var M = StockElem[pts.identifier].matrice;
            var e = coordonnes1Prime.x - c*coordonnees1.x + s*coordonnees1.y;
            console.log("e :"+e);
            var f = coordonnes1Prime.y - s*coordonnees1.x + c*coordonnees1.y;
            console.log("f :"+f);
            
            elem.setAttribute('transform', 'matrix('+c+','+s+','+(-s)+','+c+','+e+','+f+')' );      
        }
    }
    
    
});