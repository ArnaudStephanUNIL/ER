d3.csv("liens.csv", function(d) {
    return {
        mot1: d.Mot1,
        mot2: d.Mot2,
        poids: +d.Poids
    };
}, function(dataInit) {

    //Avant toute chose, on trie la base de données
    dataInit.sort(function(a, b) {
        return b["poids"] - a["poids"];
    });

    //Initialisation du tableau de données et de mots qu'on va utiliser
    let data = [];
    let motsUniques = [];
    let largeurCellule = 20;
    let transitionTime = 1000;
    let compteur = 25;

    let marges = {
        top: 100,
        right: 100,
        bottom: 100,
        left: 100
    };

    //Initialisation du canevas
    let canevas = d3.select("body").append("svg")
        .attr("class", "svg")
        .attr("width", largeurCellule * 30 + marges.left + marges.right)
        .attr("height", largeurCellule * 30 + marges.left + marges.right)
        .append("g")
        .attr("transform", "translate(" + marges.left + "," + marges.top + ")");

    //Une fonction pour choper les x paires les plus fréquentes
    function selectData(seuil) {
        //On vide le tableau
        data.splice(0);
        //Et on le remplit de nouveau
        for (var i = 0; i < seuil; i++) {
            data[i] = dataInit[i];
        }
    }

    //Une fonction pour choper les mots uniques associés aux x paires les plus fréquentes
    function selectMots(seuil) {
        selectData(seuil);
        //On chope la liste de tous les mots uniques
        var setMotsUniques = new Set();
        data.forEach(function(d) {
            setMotsUniques.add(d.mot1)
            setMotsUniques.add(d.mot2)
        });
        //Et on en fait un tableau
        motsUniques = Array.from(setMotsUniques);
        //Que l'on classe par ordre alphabétique
        //localeCompare c'est pour que ça foire pas avec les accents
        motsUniques.sort((a, b) => a.localeCompare(b));
        return motsUniques;
    }

    //On initialise les axes
    let domain = selectMots(compteur);

    let echelleX = d3.scaleBand()
        .domain(domain)
        .range([0, domain.length * largeurCellule])
        .padding(0.1);

    let axeX = d3.axisTop(echelleX);

    canevas.append("g")
        .attr("class", "axeX")
        .call(axeX)
        .selectAll('text')
        .attr('font-weight', 'normal')
        .style("text-anchor", "start")
        .attr("dx", ".8em")
        .attr("dy", ".5em")
        .attr("transform", "rotate(-65)");

    let echelleY = d3.scaleBand()
        .domain(domain)
        .range([0, domain.length * largeurCellule])
        .padding(0.1);

    let axeY = d3.axisLeft(echelleY);

    canevas.append("g")
        .attr("class", "axeY")
        .call(axeY)
        .selectAll('text')
        .attr('font-weight', 'normal');

    //On met le petit texte
    canevas.append("g")
        .attr("class", "infoCompteur")
        .attr("transform", "translate(-80, -80)")
        .append("text")
        .attr("id", "texte");

    //Fonction pour updater les axes
    function updateAxis(newDomain) {

        echelleX.domain(newDomain).range([0, newDomain.length * largeurCellule])
        canevas.select(".axeX")
            .transition().duration(transitionTime)
            .call(axeX)
            .selectAll('text')
            .attr('font-weight', 'normal')
            .style("text-anchor", "start")
            .attr("dx", ".8em")
            .attr("dy", ".5em")
            .attr("transform", "rotate(-65)");

        echelleY.domain(newDomain).range([0, newDomain.length * largeurCellule])
        canevas.select(".axeY")
            .transition().duration(transitionTime)
            .call(axeY)
    }

    function heatmap(seuil) {

        compteur = seuil;
        //En lançant selectMots, on chope d'un coup le subset dont on a besoin et les mots associés
        selectMots(seuil);
        //On update les axes
        updateAxis(motsUniques);
        //Création du tableau de quantites
        let quantites = data.map(d => d.poids);
        //On trie les quantités pour que les quantiles fonctionnent, sinon ça fait n'importe quoi
        quantites = quantites.sort();

        //Calcul des quantiles, pour l'échelle de couleurs

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

        //Mise à jour du texte
        d3.select("#texte")
            .text("Top " + compteur + " des co-occurrences")

        var g = canevas.append("g");

        g.selectAll(".cell1").data(data).enter()
            .append("rect")
            .attr("class", "cell1")
            .attr("width", 0)
            .attr("height", 0)
            .attr("y", d => echelleY(d.mot2))
            .attr("x", d => echelleX(d.mot1))
            .attr("fill", d => echelleCouleur(d.poids));

        g.selectAll(".cell2").data(data).enter()
            .append("rect")
            .attr("class", "cell2")
            .attr("width", 0)
            .attr("height", 0)
            .attr("y", d => echelleY(d.mot1))
            .attr("x", d => echelleX(d.mot2))
            .attr("fill", d => echelleCouleur(d.poids));

        var cells1 = canevas.selectAll(".cell1").data(data);
        var cells2 = canevas.selectAll(".cell2").data(data);

        cells1.transition()
            .duration(transitionTime)
            .attr("width", largeurCellule)
            .attr("height", largeurCellule)
            .attr("y", d => echelleY(d.mot2))
            .attr("x", d => echelleX(d.mot1))
            .attr("fill", d => echelleCouleur(d.poids));

        cells2.transition()
            .duration(transitionTime)
            .attr("width", largeurCellule)
            .attr("height", largeurCellule)
            .attr("y", d => echelleY(d.mot1))
            .attr("x", d => echelleX(d.mot2))
            .attr("fill", d => echelleCouleur(d.poids));

        cells1.exit()
            .attr("width", 0)
            .attr("height", 0)
            .attr("y", d => echelleY(d.mot2))
            .attr("x", d => echelleX(d.mot1))
            .attr("fill", d => echelleCouleur(d.poids));

        cells2.exit()
            .attr("width", 0)
            .attr("height", 0)
            .attr("y", d => echelleY(d.mot1))
            .attr("x", d => echelleX(d.mot2))
            .attr("fill", d => echelleCouleur(d.poids));

        //Tooltip
        cells1.on("mouseover", function(d) {
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

        cells2.on("mouseover", function(d) {
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


        //Ajout de la légende
        var legende = ["0-15", "15-30", "30-45", "45-60", "60-75", "75-90", "90-100"];

        var legendeCell = canevas.selectAll(".legende").data(legende);
        var cellPosX = (motsUniques.length * largeurCellule);
        var cellPosY = cellPosX;

        legendeCell.enter()
            .append("g")
            .append("rect")
            .attr("class", "legende")
            .attr("width", cellPosX / 7)
            .attr("height", largeurCellule / 2)
            .attr("x", (d, i) => i * (cellPosX / 7))
            .attr("y", cellPosY + 10)
            .attr("fill", ((d, i) => couleurs[i]));

        canevas.selectAll(".legende").data(data).transition()
            .duration(transitionTime)
            .attr("width", cellPosX / 7)
            .attr("x", (d, i) => i * (cellPosY / 7))
            .attr("y", cellPosY + 10)
            .attr("fill", ((d, i) => couleurs[i]));

        legendeCell.enter()
            .append("text")
            .attr("class", "mono")
            .text((d, i) => d + "%")
            .attr("x", (d, i) => 5 + (i * (cellPosX / 7)))
            .attr("y", cellPosY + largeurCellule + 10);

        canevas.selectAll(".mono").data(data).transition()
            .duration(transitionTime)
            .attr("x", (d, i) => 5 + (i * (cellPosX / 7)))
            .attr("y", cellPosY + largeurCellule + 10);

    }

    function plus5() {
        compteur += 5;
        heatmap(compteur);
    }

    function plus10() {
        compteur += 10;
        heatmap(compteur);
    }

    function moins5() {
        if (compteur > 15) {
            compteur -= 5;
            heatmap(compteur);
        } else {};
    }

    function moins10() {
        if (compteur > 20) {
            compteur -= 10;
            heatmap(compteur);
        } else {};
    }

    heatmap(compteur);
    d3.select("#moins10").on("click", function() {
        moins10()
    });
    d3.select("#moins5").on("click", function() {
        moins5()
    });
    d3.select("#plus5").on("click", function() {
        plus5()
    });
    d3.select("#plus10").on("click", function() {
        plus10()
    });
    d3.select("#top50").on("click", function() {
        graphe(50)
    });

    //Fin de tout ce qui concerne la heatmap des cooccurrences
    //Début de ce qui touche aux données réseau

    let canevas2 = d3.select("body").append("svg")
        .attr("class", "svg")
        .attr("width", largeurCellule * 30 + marges.left + marges.right)
        .attr("height", largeurCellule * 30 + marges.left + marges.right)
        .append("g")
        .attr("transform", "translate(" + marges.left + "," + marges.top + ")");

    //Initialisation des tableaux des noeuds et des liens
//    let nodes = [];
 //   let links = [];
    let tableauReseau = [];
    let newData = [];


    //Fonction qui remplit nodes et links bien comme il faut
    function creationTableaux(seuil) {

        //On chope les mots uniques et le subsest de données (motsUniques et data)
        selectMots(seuil);
        //On vide les tableaux avant de les remplir de nouveau
        nodes.slice(0);
        links.slice(0);

        //On passe à travers chaque ligne de data
        tableaux.links = data.map((item) => {
            return {
                //Pour chaque ligne de data, links.source = l'index du mot1 de data qui correspond
                //à son équivalent dans motsUniques
                source: motsUniques.indexOf(item.mot1),
                //Pareil pour links.target
                target: motsUniques.indexOf(item.mot2),
                value: item.poids

            };
        });

        tableaux.nodes = motsUniques.map((item) => {
            return {
                //Pour chaque ligne de motsUniques, nodes.id = la ligne sur laquelle on est
                id: item
            };
        });
        console.log(tableaux);
    }

    function reseau(seuil) {

        creationTableaux(seuil);

    }

    reseau(20);



});