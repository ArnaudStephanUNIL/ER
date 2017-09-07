d3.csv("freq_presse_er.csv", function(d) {
		return {
			freq: +d.Frequence,
			mot: d.Mot
		};
	}, function(data) {

		let largeurBarre = 12;

		var marges = {
			top: 20,
			right: 10,
			bottom: 100,
			left: 50
		};
		var width = window.innerWidth - marges.left - marges.right,
			height = 0.8*window.innerHeight - marges.top - marges.bottom;

		var canevas = d3.select("body").append("svg")
			.attr("width", width + marges.left + marges.right)
			.attr("height", height + marges.top + marges.bottom)
			.append("g")
			.attr("transform", "translate(" + marges.left + "," + marges.top + ")");

		var max = d3.max(data, d => d.freq);

		let echelleY = d3.scaleLinear()
			.domain([0,max])
			.range([height,0]);

		let axeY = d3.axisLeft()
			.scale(echelleY);

		canevas.append("g")
			.attr("class","axeY")
			.call(axeY);

		let setMots = d3.set(data.map(function(el){return el.mot;} )).values()

		let echelleX = d3.scaleBand()
		    .domain(data.map(d => d.mot))//setMots)
		    .range([0, setMots.length * largeurBarre])
		    .padding([.3]);

		let axeX = d3.axisBottom()
			.scale(echelleX);

		canevas.append("g")
			.attr("class","axeX")
		 	.attr("transform", `translate(0,${height})`)
		 	.call(axeX)
		    .selectAll("text")
		    .attr("font-weight", "normal")
		    .style("text-anchor", "end")
		    .attr("dx", "-.8em")
		    .attr("dy", ".5em")
		    .attr("transform", "rotate(-65)");

		let barre = canevas.append("g").selectAll(".barre").data(data);

		barre.enter()
			.append("rect")
			.attr("class", "barre")
			.attr("x", (d,i) => echelleX(d.mot))
			.attr("y", (d) => echelleY(d.freq))
			.attr("width", echelleX.bandwidth())
			.attr("height", d => height - echelleY(d.freq));


	}


);

