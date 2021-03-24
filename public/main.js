var dom = document.getElementById("container");
var myChart = echarts.init(dom);

var option;

var stat = [
  {
    name: '程七零',
    data: cql_data.map(item => [item.mins, item.count])
  }
]

option = {
  tooltip: {
    trigger: 'axis',
    position: function (pt) {
      return [pt[0], '10%'];
    }
  },
  title: {
    text: '投票统计',
  },
  legend: {
    data: stat.map(item => item.name)
  },
  toolbox: {
    feature: {
      magicType: { show: true, type: ['line', 'bar', 'stack', 'tiled'] },
      dataZoom: {
        yAxisIndex: 'none'
      },
      restore: {},
      saveAsImage: {}
    }
  },
  xAxis: {
    type: 'time',
    boundaryGap: false
  },
  yAxis: {
    type: 'value',
    boundaryGap: [0, '100%']
  },
  dataZoom: [{
    type: 'inside',
    start: 0,
    end: 20
  }, {
    start: 0,
    end: 20
  }],
  series: stat.map(item => ({
    name: item.name,
    type: 'bar',
    symbol: 'none',
    stack: '总量',
    data: item.data
  }))
};

if (option && typeof option === 'object') {
  myChart.setOption(option);
}

const exampleForm = document.getElementById("example-form");

exampleForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const key = formData.get('q')

  fetch(`${form.action}?q=${key}`, {
    headers: {
      "Accept": "application/json"
    }
  }).then(res => res.json())
    .then(result => {
      if (!stat.find(e => e.name === key)) {
        stat.push({
          name: key,
          data: result.map(item => [item.mins, item.count])
        });
      }

      myChart.setOption({
        legend: {
          data: stat.map(item => item.name)
        },
        series: stat.map(item => ({
          name: item.name,
          type: 'bar',
          symbol: 'none',
          stack: '总量',
          data: item.data
        }))
      });
    })
});