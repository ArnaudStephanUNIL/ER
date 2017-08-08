let largeurCellule = 20;
let width = largeurCellule * 30;
let height = largeurCellule * 30;
let compteur = 20;
let marges = {
    top: 100,
    right: 100,
    bottom: 100,
    left: 100
};

//Initialisation du premier canevas
let canevas = d3.select("body").append("svg")
    .attr("class", "svg")
    .attr("width", width + marges.left + marges.right)
    .attr("height", height + marges.left + marges.right)
    .append("g")
    .attr("transform", "translate(" + marges.left + "," + marges.top + ")");

//Avec ses axes
let echelleX = d3.scaleBand()
    .domain([])
    .range([0, 200])
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
    .domain([])
    .range([0, 200])
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

//Initialisation du deuxième canevas
let canevas2 = d3.select("body").append("svg")
    .attr("class", "svg")
    .attr("width", width + marges.left + marges.right)
    .attr("height", height + marges.left + marges.right)
    .append("g")
    .attr("transform", "translate(" + marges.left + "," + marges.top + ")");

//On met un petit texte aussi
canevas2.append("g")
	.attr("class", "infoCompteur")
	.attr("transform","translate(-80, -80)")
	.append("text")
	.attr("id", "texte2");


function selectFichier(fichier) {
    d3.csv(fichier, function(d) {
        return {
            mot1: d.Mot1,
            mot2: d.Mot2,
            poids: +d.Poids
        };
    }, function(dataInit) {

        //Avant toute chose, on trie la base de données en fonction du poids des liens
        dataInit.sort(function(a, b) {
            return b["poids"] - a["poids"];
        });

        //Initialisation du tableau de données et de mots qu'on va utiliser
        let data = [];
        let motsUniques = [];
        let transitionTime = 500;
        let couleurs = ["#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#b10026"];
        let legende = ["0-15", "15-30", "30-45", "45-60", "60-75", "75-90", "90-100"];

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

        //Pourquoi est-ce que ça foire pas si je mets ça dans une fonction et pas directement dans la fonction heatmap?
        //Comme sur
        //https://stackoverflow.com/questions/45507890/legend-transition-not-working-properly?noredirect=1#comment77982212_45507890
        //Mystère et boule de gomme
        function updateLegende(mots) {
            //Ajout de la légende
            var cellPosX = (mots.length * largeurCellule);
            var cellPosY = cellPosX;

            canevas.append("g").selectAll(".legende").data(legende).enter()
                .append("rect")
                .attr("class", "legende")
                .attr("width", cellPosX / 7)
                .attr("height", largeurCellule / 2)
                .attr("x", (d, i) => i * (cellPosX / 7))
                .attr("y", cellPosY + 10)
                .attr("fill", ((d, i) => couleurs[i]));

            canevas.append("g").selectAll(".mono").data(legende).enter()
                .append("text")
                .attr("class", "mono")
                .text((d, i) => d + "%")
                .attr("x", (d, i) => 5 + (i * (cellPosX / 7)))
                .attr("y", cellPosY + largeurCellule + 10);

            canevas.selectAll(".legende").data(legende).transition()
                .duration(transitionTime)
                .attr("width", cellPosX / 7)
                .attr("x", (d, i) => i * (cellPosY / 7))
                .attr("y", cellPosY + 10)
                .attr("fill", ((d, i) => couleurs[i]));

            canevas.selectAll(".legende").data(legende).exit().remove();

            canevas.selectAll(".mono").data(legende).transition()
                .duration(transitionTime)
                .text((d, i) => d + "%")
                .attr("x", (d, i) => 5 + (i * (cellPosX / 7)))
                .attr("y", cellPosY + largeurCellule + 10);

            canevas.selectAll(".mono").data(legende).exit().remove();
        }

        function heatmap(seuil) {
            compteur = seuil;
            //En lançant selectMots, on chope d'un coup le subset dont on a besoin et les mots associés
            selectMots(seuil);
            //On update les axes et la légende
            updateAxis(motsUniques);
            updateLegende(motsUniques);
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
            var echelleCouleur = d3.scaleThreshold()
                .domain([q1, q2, q3, q4, q5, q6])
                .range(couleurs);

            //Création du tooltip
            var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            //Mise à jour du texte
            d3.select("#texte")
                .text("Top " + seuil + " des co-occurrences de " + fichier);

            var g = canevas.append("g");

            g.selectAll(".cell1").data(data).enter()
                .append("rect")
                .attr("class", "cell1")
                .attr("width", 0)
                .attr("height", 0)
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("y", 0)
                .attr("x", 0)
                .attr("fill", d => echelleCouleur(d.poids));

            g.selectAll(".cell2").data(data).enter()
                .append("rect")
                .attr("class", "cell2")
                .attr("width", 0)
                .attr("height", 0)
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("y", 0)
                .attr("x", 0)
                .attr("fill", d => echelleCouleur(d.poids));

            var cells1 = canevas.selectAll(".cell1").data(data);
            var cells2 = canevas.selectAll(".cell2").data(data);

            cells1.transition()
                .duration(transitionTime)
                .attr("width", largeurCellule)
                .attr("height", largeurCellule)
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("y", d => echelleY(d.mot2))
                .attr("x", d => echelleX(d.mot1))
                .attr("fill", d => echelleCouleur(d.poids));

            cells2.transition()
                .duration(transitionTime)
                .attr("width", largeurCellule)
                .attr("height", largeurCellule)
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("y", d => echelleY(d.mot1))
                .attr("x", d => echelleX(d.mot2))
                .attr("fill", d => echelleCouleur(d.poids));

            cells1.exit().transition()
                .duration(transitionTime)
                .attr("width", 0)
                .attr("height", 0)
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("y", 0)
                .attr("x", 0)
                .attr("fill", d => echelleCouleur(d.poids))
                .remove();

            cells2.exit().transition()
                .duration(transitionTime)
                .attr("width", 0)
                .attr("height", 0)
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("y", 0)
                .attr("x", 0)
                .attr("fill", d => echelleCouleur(d.poids))
                .remove();

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
        }

        function plus5() {
            compteur += 5;
            heatmap(compteur);
            reseau(compteur);
        }

        function plus10() {
            compteur += 10;
            heatmap(compteur);
            reseau(compteur);
        }

        function moins5() {
            if (compteur >= 10) {
                compteur -= 5;
                heatmap(compteur);
                reseau(compteur);
            } else {};
        }

        function moins10() {
            if (compteur >= 15) {
                compteur -= 10;
                heatmap(compteur);
                reseau(compteur);
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
            heatmap(50);
            reseau(50);
        });

        //Fin de tout ce qui concerne la heatmap des cooccurrences
        //Début de ce qui touche aux données réseau
        //Fonction qui remplit nodes et links bien comme il faut
        function creationTableaux(seuil) {
            var tableauxReseau = [];
            //On chope les mots uniques et le subsest de données (motsUniques et data)
            selectMots(seuil);
            //On passe à travers chaque ligne de data
            tableauxReseau.links = data.map((item) => {
                return {
                    //Pour chaque ligne de data, links.source = le mot1 de data
                    source: item.mot1,
                    //Pareil pour links.target
                    target: item.mot2,
                    value: item.poids
                };
            });
            tableauxReseau.nodes = motsUniques.map((item) => {
                return {
                    //Pour chaque ligne de motsUniques, nodes.id = la ligne sur laquelle on est
                    id: item
                };
            });
            return tableauxReseau;
        }

        function reseau(seuil) {
            var dataNetwork = creationTableaux(seuil);

            //Avant toute chose, on enlève tout ce qui pourrait rester des simulations précédentes
            canevas2.selectAll(".links").remove();
            canevas2.selectAll(".nodes").remove();
            canevas2.selectAll(".labelnoeuds").remove();

            //Mise à jour du texte
            d3.select("#texte2")
                .text("Top " + seuil + " des liens de " + fichier);

            var simulation = d3.forceSimulation()
                .force("link", d3.forceLink().id(d => d.id))
                .force("charge", d3.forceManyBody().strength(-180))
                .force("center", d3.forceCenter(width / 2, height / 2));

            var link = canevas2.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(dataNetwork.links)
            .enter()
            .append("line")
            .attr("stroke", "lightblue")
            .attr("stroke-width", d => 6 * d.value);

            var node = canevas2.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(dataNetwork.nodes)
            .enter()
            .append("circle")
            .attr("r", 5)
            .attr("fill", "lightblue")
            .attr("stroke", "grey")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

            //Quand on passe la souris sur un noeud, lui et tous ses liens changent de couleur
            node.on("mouseover", function(d) {
                d3.select(this).style("fill", "#E6BBAD");
                link.style("stroke", function(l) {
                    if (d === l.source || d === l.target)
                        return "#E6BBAD";
                    else
                        return "lightblue";
                });
            });
            //Quand la souris repart, on revient à la couleur originale
            node.on("mouseout", function() {
                node.style("fill", "lightblue");
                link.style("stroke", "lightblue");
            });

            var label = canevas2.selectAll(".labelnoeuds")
                .data(dataNetwork.nodes)
                .enter()
                .append("text")
                .attr("class", "labelnoeuds")
                .text(d => d.id)
                .style("text-anchor", "middle")
                .style("fill", "#555")
                .style("font-family", "Consolas, courier")
                .style("font-size", 9);

            simulation.nodes(dataNetwork.nodes).on("tick", ticked);

            simulation.force("link").links(dataNetwork.links);

            function ticked() {
                link
                    .attr("x1", function(d) {
                        return d.source.x;
                    })
                    .attr("y1", function(d) {
                        return d.source.y;
                    })
                    .attr("x2", function(d) {
                        return d.target.x;
                    })
                    .attr("y2", function(d) {
                        return d.target.y;
                    });

                node
                    .attr("cx", function(d) {
                        return d.x;
                    })
                    .attr("cy", function(d) {
                        return d.y;
                    });

                label
                    .attr("x", function(d) {
                        return d.x + 5;
                    })
                    .attr("y", function(d) {
                        return d.y - 10;
                    });

            }

            function dragstarted(d) {
                if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(d) {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            }

            function dragended(d) {
                if (!d3.event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }


        }

        reseau(compteur);
    });
}

let compteurSwitch = 1;

function DataSwitch() {

    compteurSwitch++;
    if (compteurSwitch % 2 == 0) {
        selectFichier("liens_presse_er.csv")
    } else selectFichier("liens_revue_presse.csv")
}

d3.select("#DataSwitch").on("click", function() {
    DataSwitch();
});

selectFichier("liens_revue_presse.csv");