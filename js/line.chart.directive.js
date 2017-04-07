angular.module('lineChart', []).directive('lineChart', function () {
	try {
		return {
			scope: {
				'width': '=',
				'height': '=',
				'data': '=',
				'description': '=',
				'onClick': '&',
				'accessor': '=',
				'colors': '='
			},
			restrict: 'E',
			link: buildLink
		};

		function buildLink (scope, element, attr) {
			scope.colors = scope.colors || ['#dae8fe', '#5b8def'];
			const MARGIN = {
				TOP: 40,
				LEFT: 40,
				BOTTOM: 40,
				RIGHT: 20
			};
			/* BUBBLE svg
			*  width : 74
			*  height : 30
			*  bubble : width - 74, height - 28
			*  bottom arrow : height - 4
			*  https://svg-edit.github.io/svgedit/releases/svg-edit-2.8.1/svg-editor.html
			*/
			const BUBBLE_WIDTH = 74;
			const BUBBLE_HEIGHT = 28;
			const BUBBLE_MARGIN = 12;
			const DURATION = 500;
			const WIDTH = (scope.width || 500) - (MARGIN.LEFT + MARGIN.RIGHT);
			const HEIGHT = (scope.height || 200) - (MARGIN.TOP + MARGIN.BOTTOM);
			const CIRCLEROUND = 5;
			var el = element[0];
			var svg = d3.select(el).append('svg')
						.attr('width', WIDTH + (MARGIN.LEFT + MARGIN.RIGHT))
						.attr('height', HEIGHT + (MARGIN.TOP + MARGIN.BOTTOM))
						.append('g')
						.attr('transform', 'translate(' + MARGIN.LEFT + ',' + MARGIN.TOP + ')');
			var x = d3.scaleBand().rangeRound([0, WIDTH]);
			var y = d3.scaleLinear().rangeRound([HEIGHT, 0]);
			var line = d3.line()
						.x(function (d) {
							return x(d.name) + x.bandwidth() / 2;
						})
						.y(function (d) {
							return y(parseInt(d.value));
						});
			var xAxis = d3.axisBottom(x).tickSize([0]).tickPadding([20]);
			var yAxis = d3.axisLeft(y).ticks(5).tickSize([0]).tickPadding([10]);
			var circleContainer;

			var startData = initStartData();

	        scope.$watch('data', function (newValue, oldValue) {
				var data1;
				var data2;
				if (newValue) {
					data1 = newValue.data1 || startData;
					data2 = newValue.data2 || startData;
				} else {
					data1 = startData;
					data2 = startData;
				}
				removeChart();
				if (calcMinMax(data1) > calcMinMax(data2)) {
					y.domain(d3.extent(data1, function (d) {
						return parseInt(d.value);
					}));
				} else {
					y.domain(d3.extent(data2, function (d) {
						return parseInt(d.value);
					}));
				}
				x.domain(data1.map(function(d) { return d.name; }));
				
				svg.append('g')
					.attr('class', 'x axis')
					.attr('transform', 'translate(0,' + HEIGHT + ')')
					.call(xAxis);

				svg.append('g')
					.attr('class', 'y axis')
					.call(yAxis);

				svg.selectAll('path').style('stroke', '#C2C2C2');

				drawLine(data1, scope.colors[1]);

				drawLine(data2, scope.colors[0], true);

				svg.selectAll('text').attr('fill', '#444444');
				svg.selectAll('.y.axis line').attr('x2', WIDTH).style('stroke', '#C2C2C2').style('opacity', '0.5');
			});

			function removeChart () {
				svg.selectAll('g').remove();
				svg.selectAll('path').remove();
			}

			function drawLine (data, color, isShowVertexData) {
				svg.append('path')
					.datum(startData)
					.attr('class', 'line')
					.attr('fill', 'none')
					.attr('stroke', color)
					.attr("stroke-width", 1.5)
					.attr('d', line)
					.transition()
					.duration(DURATION)
					.delay(DURATION / 2)
					.attrTween('d', lineTween(data, line))
					.on('end', function () {
						vertexCircleMaker(data, color, isShowVertexData);
					});
			}

			function lineTween (data, callback) {
				return function (a) {
					var i = d3.interpolateArray(a, data);
					return function (t) {
						return callback(i(t));
					};
				};
			}

			function vertexCircleMaker (data, color, isShowVertexData) {
				isShowVertexData = !!isShowVertexData;
				circleContainer = svg.append('g');
				angular.forEach(data, function (datum, index) {
					drawVertexCircle(datum, index, color, isShowVertexData);
				});
			}

			function drawVertexCircle (datum, index, color, isShowVertexData) {
				var circle = circleContainer.datum(datum)
											.append('circle')
											.attr('class', 'line-circle')
											.attr('fill', color)
											.attr('stroke', color)
											.attr("stroke-width", 1.5)
											.attr('r', 0)
											.attr('cx', function (d) {
												return x(d.name) + x.bandwidth() / 2;
											})
											.attr('cy', function (d) {
												return y(d.value);
											})
											.on('mouseenter', function (d) {
												d3.select(this)
													.attr('class', 'line-circle highlight')
													.attr('fill', 'white');
												showVertexData(d);
											})
											.on('mouseleave', function (d) {
												d3.select(this)
													.attr('class', 'line-circle')
													.attr('fill', color);
												hideVertexData();
											})
											.transition()
											.delay(DURATION)
											.attr('r', CIRCLEROUND);
				if (isShowVertexData) {
					circle.on('end', function (d) {
						var date = new Date();
						if (d.name === (date.getMonth() + 1)) {
							d3.select(this)
								.attr('class', 'line-circle highlight')
								.attr('fill', 'white');
							showVertexData(d);
						}
					});	
				}
			}

			function showVertexData (data) {
				var vertexData = circleContainer.append('g')
												.attr('class', 'line-bubble')
												.attr('transform', 'translate(' + x(data.name) + ', ' + (y(data.value) - (BUBBLE_HEIGHT + BUBBLE_MARGIN)) + ')');
				vertexData.append('path')
							.attr('d', 'm2.265231,0c-1.251053,0 -2.265231,0.849348 -2.265231,1.897805l0,28.267348c0,1.048134 1.012864,1.897812 2.265873,1.897812l31.267906,0c3.449238,2.355881 0.043537,-0.038818 3.466221,2.405781c3.336864,-2.38728 0.003792,-0.020546 3.39938,-2.405781l31.33102,0c1.253464,0 2.2696,-0.84935 2.2696,-1.897812l0,-28.267348c0,-1.048129 -1.017921,-1.897805 -2.265236,-1.897805l-69.469535,0l0.000002,0zm0,0')
							.attr('width', BUBBLE_WIDTH)
							.attr('height', BUBBLE_HEIGHT)
							.attr('fill', 'gray');
				
				vertexData.append('text')
							.attr('class', 'line-bubble-label')
							.attr('dx', x.bandwidth() / 2)
							.attr('dy', BUBBLE_HEIGHT / 4 * 3)
							.style('font-size', '14px')
							.style('text-anchor', 'middle')
							.attr('fill', '#ffffff')
							.text(data.value);
			}

			function hideVertexData (color) {
				circleContainer.selectAll('.line-bubble').remove();
			}

			function initStartData (param) {
				var startData = [];
				for (var i = 1; i <= 12; i++) {
					startData.push({
						name: i,
						value: 0
					});
				}
				return startData;
			}

			function calcMinMax (data) {
				var result = 0;
				for (var i = 1; i < data.length; i++) {
					if (result < parseInt(data[i].value)) {
						result = parseInt(data[i].value);
					}
				}
				return result;
			}
		}
	} catch (e) {
        var xcb = 'http://stackoverflow.com/search?q=[js]+' + e.message;
        window.open(xcb, '_blank');
    }
});
