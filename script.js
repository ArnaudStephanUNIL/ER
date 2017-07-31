//d3.csv("freq.csv", function(d) {
d3.csv("liens.csv", function(d) {
        return {
            mot1: d.Mot1,
            mot2: d.Mot2,
            poids: +d.Poids
            //mot : d.Mot,
            //freq: +d.Frequence
        };
    }, function(data) {

        let largeurCellule = 22;

        var marges = {
            top: 100,
            right: 100,
            bottom: 100,
            left: 100
        };

        //On classe la base de données par poids des liens entre les mots
        data.sort(function(a, b){
            return b["poids"]-a["poids"];
        });

        //Création du set de tous les mots
        let setMotsFull = new Set();
        data.forEach(function(d) {
            setMotsFull.add(d.mot1)
            setMotsFull.add(d.mot2)
        });

        //Création de la liste de tous les mots
        let listeMotsFull = Array.from(setMotsFull);

        //On classe par ordre alphabétique (localeCompare est utile pour les accents)
        listeMotsFull.sort((a, b) => a.localeCompare(b));


        var width2 = window.innerWidth - marges.left - marges.right;
        var height2 = window.innerHeight - marges.top - marges.bottom;
        /*var canevas2 = d3.select("body").append("svg")
            .attr("width", width2 + marges.left + marges.right)
            .attr("height", height2 + marges.top + marges.bottom)
            .append("g")
            .attr("transform", "translate(" + marges.left + "," + marges.top + ")")
            .style("background-color", "lightgray");*/

        let dataSeuil = [];

        //Fonction qui ne prend qu'une partie du dataset, et qui le dessine
        function liste(seuil){
            for (var i = 0; i < seuil; i++) {
                dataSeuil[i] = data[i];

            }
            graphe(dataSeuil);
        }

        //Fonction pour dessiner la matrice des occurrences les plus fréquentes (en fonction du seuil)
        function graphe(dataSeuil) {

            //Création du set des mots dont on a besoin
            let setMots = new Set();
            console.log(dataSeuil);
            dataSeuil.forEach(function(d) {
                setMots.add(d.mot1)
                setMots.add(d.mot2)
            });

            //Création de la liste des mots inclus dans la sous base de données
            let listeMots = Array.from(setMots);

            //On classe par ordre
            listeMots.sort((a, b) => a.localeCompare(b));


            //Création du canevas
            var width = listeMots.length * (largeurCellule);
            var height = listeMots.length * (largeurCellule);

            var canevas = d3.select("body").append("svg")
                .attr("width", width + marges.left + marges.right)
                .attr("height", height + marges.top + marges.bottom)
                .append("g")
                .attr("transform", "translate(" + marges.left + "," + marges.top + ")")
                .style("background-color", "lightgray");

            //Echelle des X
            var echelleX = d3.scaleBand()
                .domain(listeMots)
                .range([0, listeMots.length * largeurCellule])
                .padding(0.1);

            //Echelle des Y
            var echelleY = d3.scaleBand()
                .domain(listeMots)
                .range([0, listeMots.length * largeurCellule])
                .padding(0.1);

            //Axe X
            var axeX = d3.axisTop(echelleX);

            //Axe Y
            var axeY = d3.axisLeft(echelleY);

            //Ajout de l'axe x
            canevas.append("g")
                .attr("class", "axeX")
                .call(axeX)
                .selectAll('text')
                .attr('font-weight', 'normal')
                .style("text-anchor", "start")
                .attr("dx", ".8em")
                .attr("dy", ".5em")
                .attr("transform", "rotate(-65)");

            //Ajout de l'axe y
            canevas.append("g")
                .attr("class", "axeY")
                .call(axeY)
                .selectAll('text')
                .attr('font-weight', 'normal');

            //Création du tableau quantites
            let quantites = dataSeuil.map(d => d.poids);
            //On trie les quantités pour que les quantiles fonctionnent, sinon ça fait n'importe quoi
            quantites = quantites.sort();

            //Calcul des quantiles
            let q1 = d3.quantile(quantites, 0.15);
            let q2 = d3.quantile(quantites, 0.30);
            let q3 = d3.quantile(quantites, 0.45);
            let q4 = d3.quantile(quantites, 0.60);
            let q5 = d3.quantile(quantites, 0.75);
            let q6 = d3.quantile(quantites, 0.90);

            //Echelle des couleurs en fonction des quantiles
            var couleurs = ["#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#b10026"];
            var echelleCouleur = d3.scaleThreshold()
                .domain([q1, q2, q3, q4, q5, q6])
                .range(couleurs);

            //Création du tooltip
            var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            var g = canevas.selectAll("rect").data(dataSeuil);
            var gEnter = g.enter().append("g");

            //Les cellules du triangle en bas à gauche
            var cells = gEnter.append("rect")
                .attr("class", "cell")
                .attr("width", largeurCellule)
                .attr("height", largeurCellule)
                .attr("y", d => echelleY(d.mot2))
                .attr("x", d => echelleX(d.mot1))
                .attr("fill", d => echelleCouleur(d.poids));

            //Celles qui se déplacent
            canevas.selectAll(".cell").data(dataSeuil).transition()
                .duration(200)
                .attr("width", largeurCellule)
                .attr("height", largeurCellule)
                .attr("y", d => echelleY(d.mot2))
                .attr("x", d => echelleX(d.mot1))
                .attr("fill", d => echelleCouleur(d.poids));

            //Celles qui s'en vont
            canevas.selectAll(".cell").data(dataSeuil).exit()
                .remove();

            //Tooltip
            canevas.selectAll(".cell").data(dataSeuil)
                .on("mouseover", function(d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html(d.mot2 + " et " + d.mot1)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                });


            //Les cellules du triangle en haut à droite
            var cells2 = gEnter.append("rect")
                .attr("class", "cell2")
                .attr("width", largeurCellule)
                .attr("height", largeurCellule)
                .attr("y", d => echelleY(d.mot1))
                .attr("x", d => echelleX(d.mot2))
                .attr("fill", d => echelleCouleur(d.poids));

            //Celles qui se déplacent
            canevas.selectAll(".cell2").data(dataSeuil).transition()
                .duration(200)
                .attr("width", largeurCellule)
                .attr("height", largeurCellule)
                .attr("y", d => echelleY(d.mot1))
                .attr("x", d => echelleX(d.mot2))
                .attr("fill", d => echelleCouleur(d.poids));

            //Celles qui s'en vont
            canevas.selectAll(".cell2").data(dataSeuil).exit()
                .remove()

            //Tooltip
            canevas.selectAll(".cell2").data(dataSeuil)
                .on("mouseover", function(d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html(d.mot1 + " et " + d.mot2)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            var legende = ["0-15", "15-30", "30-45", "45-60", "60-75", "75-90", "90-100"];

            var legendeCell = canevas.selectAll(".legende").data(legende);

            legendeCell.enter()
                .append("g")
                .append("rect")
                .attr("class", "legende")
                .attr("width", largeurCellule+30)
                .attr("height", largeurCellule / 2)
                .attr("x", (d, i) => i * (largeurCellule+30))
                .attr("y", height + 10)
                .attr("fill", ((d, i) => couleurs[i]));

            legendeCell.enter()
                .append("text")
                .attr("class","mono")
                .text((d,i)=>d+"%")
                .attr("x", (d, i) => 5+ (i * (largeurCellule+30)))
                .attr("y", height + largeurCellule + 10);
            //fin de la fonction graphe
        }

        liste(15);

        d3.select("#topcinquante")
            .on("click",liste(50));

        /*
        function graphe2() {

            var echelleY = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.freq)])
                .range([height, 0]);

            var barres = canevas2.selectAll(".barre").data(data);

            barres.enter().append("g")
                .append("rect")
                .attr("class", "barre")
                .attr("x", (d, i) => i * 5)
                .attr("y", d => echelleY(d.freq))
                .attr("width", 4)
                .attr("height", d => height - echelleY(d.freq))
                .attr("fill", "steelblue")
                .on("mouseover", function(d) {
                    d3.select("#texte")
                        .text(d.mot + " apparaît " + d.freq + " fois dans le corpus.");
                });

            canevas2.append("g")
                .attr("class", "infobulle")
                .attr("transform", "translate(50, 5)")
                .append("text")
                .attr("id", "texte");
            //fin de la fonction graphe2
        }
    
        graphe2();
        */
    }


);