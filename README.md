# Nettoyage de la base de données

Je me suis dit qu'il serait en premier lieu intéressant de se pencher sur les liens entre les mots-clefs utilisés par le site E&R, puisque c'est ce qui permet de classifier leur corpus d'articles. J'ai donc fait un script sur R qui isole les mots clefs associés à chaque article, et qui calcule ensuite leur coefficient de cooccurrence (la variable "Poids"). Ce coefficient est ensuite pondéré en fonction du maximum, pour obtenir une échelle allant de 0 (aucune corrélation) à 1 (la plus haute corrélation de la base de données). Le script calcule également la fréquence individuelle de chaque mot clef présent dans la base de données.

Les deux tableaux de données obtenus sont exportés en fichiers .csv pour pouvoir être manipulés par D3.

# Visualisation des liens

Je me suis basé sur le code de [ce block](http://bl.ocks.org/tjdecke/5558084) pour visualiser la matrice des cooccurrences entre chaque mot clef. Lorsque l'on passe la souris sur une case, les mots-clefs associés apparaissent. Il est également possible à l'aide des boutons présents de choisir le nombre de cooccurrences que l'on souhaite visualiser. Là j'ai choisi un peu arbitrairement que le "top 50" était la meilleure visualisation, puisque l'on commence déjà à voir se dégager les grandes tendances.
Le bouton "Switch les données" permet de switcher la visualisation entre la base de données de la revue de presse (réalisée par E&R), et la base de données de la presse E&R.

La deuxième visualisation (il faut peut être un peu dézoomer la page pour pouvoir voir les deux en même temps) est une visualisation en réseau de ces cooccurrences, où l'épaisseur du lien est proportionnelle au poids du lien calculé via R. Cette visualisation permet une analyse un peu différente de la base de données, mais je trouve que les deux (heatmap et réseaux) se complètent bien. Pour rendre les réseaux un peu mieux visibles, lorsque l'on passe la souris sur un noeud, lui et tous ses liens associés changent de couleur. Comme pour la heatmap, on peut changer le nombre de liens affichés à l'aide des boutons.

# Reste à faire / Pistes de développement

J'aimerais bien faire un cluster dendogram (voir dans le dossier screenshots), j'ai réussi via R (il y a un package pour ça donc ça n'était pas très compliqué) mais je n'ai pas encore eu le temps de me pencher sur comment faire ça en D3.

Il me semble qu'il serait maintenant intéressant de rajouter une autre dimension à ces visualisations, par exemple en prenant en compte la source des articles, ou bien le nombre de votes, etc. Concernant l'ajout de la dimension temporelle pour voir les évolutions de la base de données au fil du temps, je n'ai pour l'instant strictement aucune idée de comment faire. Donc à voir si ça ne prend pas trop de temps.
