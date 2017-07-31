d3.csv("ER_Presse-format-ids-clean.csv", function(d) {
		var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
		return {
			id: d.id,
			motsClefs: d.keywords,
			date: parseTime(d.date),
			nbComments: +d.nbComments,
			nbView: +d.nbView,
			nbStars: +d.nbStars,
			nbVotes: +d.nbVotes,
			source: d.source
		};
	}, function(data) {


		var marges = {
			top: 20,
			right: 10,
			bottom: 20,
			left: 10
		};
		var width = window.innerWidth - marges.left - marges.right,
			height = window.innerHeight - marges.top - marges.bottom;

		var canevas = d3.select("body").append("svg")
			.attr("width", width + marges.left + marges.right)
			.attr("height", height + marges.top + marges.bottom)
			.append("g")
			.attr("transform", "translate(" + marges.left + "," + marges.top + ")");

		var mots = {};

		d3.merge(data.map(function(d) {
			return d.motsClefs.split(";")
		})).forEach(function(d) {
			mots[d] = (mots[d] || 0) + 1 //Si mots[d] existe on prend cette valeur, sinon on prend 0
		})

		var keywords = Object.keys(mots).map((key) => ({
			word: key,
			count: mots[key]
		}));

		keywords.sort(function(x, y){
   			return d3.descending(x.count, y.count);
		});

		var barres = canevas.selectAll("rect").data(keywords);
		var max = d3.max(d3.values(keywords));

		var echelleY = d3.scaleLinear()
			.domain([0,max.count])
			.range([height,0]);

		let axeY = d3.axisLeft(echelleY)

		barres.enter()
			.append("rect")
			.attr("x",(d,i) => marges.left + i*3)
    		.attr("y", (d) =>  (height))
			.attr("width",2)
			.attr("height", (d) => echelleY(d.count))
			.attr("fill","steelblue");

			canevas.append("g")
    		.attr("transform", `translate(5,0)`)
    		.call(axeY); 


	}


);