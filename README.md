# angularjs-directive-line-graph
D3 Line Graph Directive

# How to use
```npm
npm install d3
```

```javascript
angular.module('app', [
  'lineChart'
]);

var chartData = {
  data1: [
    {
      name: "1",
      data: 200
    },
    {
      name: "2",
      data: 200
    }...
  ],
  data2: [
    {
      name: "1",
      data: 200
    },
    {
      name: "2",
      data: 200
    }...
  ]
}

var colors = [
  '#F7C82D',
  '#FBE99D'
];

<line-chart data="chartData" width="200" height="300" colors="colors"></line-chart>
```

![demo.png](/demo.png "demo")

# License
MIT License
