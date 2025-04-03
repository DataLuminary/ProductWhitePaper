# 数据规范化
图表数据在 图表插件里面定义

以时序图为例，图表插件元数据文件：src/plugins/charts/time-series/plugin.json
```json
{
  "type": "time-series",
  "name": "Time Series",
  "id": "time-series",
  "build_in": true,
  "data_type": "point",
  "meta": {
    "description": "Data source for MySQL databases",
    "author": "liangling",
    "logo": "img/logo.svg"
  }
}

```
其中***data_type 图表插件所接受的数据类型***。分别为  'frame'|'row'|'column'|'point'，默认为point


# DataLuminary 支持数据类型三种接口
+ 标准数据集(二维表-行业通用标准) (dataSetType:'frame')
+ 对象数据集（**DataLuminary推荐使用**） dataSetType: 'row'|'column'
+ 时序数据集 (时序图专用)   dataSetType: 'point'
 
具体参看： [数据源数据查询Query接口](/api/Query.md)
## 标准数据集
多数常见图表中，数据适于用二维表的形式描述。广为使用的数据表格软件（如 MS Excel、Numbers）或者关系数据数据库都是二维表。他们的数据可以导出成 JSON 格式，输入到 dataset.source 中，在不少情况下可以免去一些数据处理的步骤。
> 假如数据导出成 csv 文件，那么可以使用一些 csv 工具如 dsv 或者 PapaParse 将 csv 转成 JSON。

在 JavaScript 常用的数据传输格式中，**二维数组可以比较直观的存储二维表**

### 范例
```javascript
[
  ['product', '2012', '2013', '2014', '2015', '2016', '2017'],
  ['Milk Tea', 86.5, 92.1, 85.7, 83.1, 73.4, 55.1],
  ['Matcha Latte', 41.1, 30.4, 65.1, 53.3, 83.8, 98.7],
  ['Cheese Cocoa', 24.1, 67.2, 79.5, 86.4, 65.2, 82.5],
  ['Walnut Brownie', 55.2, 67.1, 69.2, 72.4, 53.9, 39.1]
]
```


### [echarts 范例](url:https://echarts.apache.org/examples/zh/editor.html?c=dataset-default)
  ```javascript
option = {
  legend: {},
  tooltip: {},
  dataset: {
    source: [
      ['product', '2012', '2013', '2014', '2015', '2016', '2017'],
      ['Milk Tea', 86.5, 92.1, 85.7, 83.1, 73.4, 55.1],
      ['Matcha Latte', 41.1, 30.4, 65.1, 53.3, 83.8, 98.7],
      ['Cheese Cocoa', 24.1, 67.2, 79.5, 86.4, 65.2, 82.5],
      ['Walnut Brownie', 55.2, 67.1, 69.2, 72.4, 53.9, 39.1]
    ]
  },
  // 声明一个 X 轴，类目轴（category）。默认情况下，类目轴对应到 dataset 第一列。
  xAxis: { type: 'category' },
  // 声明一个 Y 轴，数值轴。
  yAxis: {},
  series: [
    {  type: 'bar' }, { type: 'bar' }, { type: 'bar' },
    {
      type: 'pie',
      radius: '20%',
      center: ['25%', '30%']
      // No encode specified, by default, it is '2012'.
    },
    {
      type: 'bar',
      radius: '20%',
      center: ['75%', '30%'],

    },
    {
      type: 'pie',
      radius: '20%',
      center: ['25%', '75%'],
      encode: {
        itemName: 'product',
        value: '2014'
      }
    },
    {
      type: 'pie',
      radius: '20%',
      center: ['75%', '75%'],
      encode: {
        itemName: 'product',
        value: '2015'
      }
    }
  ]
};
```
具体参看： https://echarts.apache.org/handbook/zh/concepts/dataset

### [Tvision  图表示例](url:https://tvision.oa.com/docs/t2/line)

```javascript
import('@tencent/tvision-t2').then(({Line}) => {

    new Line({
        element: ref.current
    }).render({
        title: {
            text: '带虚线的折线图'
        },
        dataset: [
          ['product', '2012', '2013', '2014', '2015', '2016', '2017'],
          ['Milk Tea', 86.5, 92.1, 85.7, 83.1, 73.4, 55.1],
          ['Matcha Latte', 41.1, 30.4, 65.1, 53.3, 83.8, 98.7],
          ['Cheese Cocoa', 24.1, 67.2, 79.5, 86.4, 65.2, 82.5],
          ['Walnut Brownie', 55.2, 67.1, 69.2, 72.4, 53.9, 39.1]
        ],
        line: {
            dottedLine: [0, 2]
        }
    });

})    
```




##  对象数据集
dataset 也支持例如下面 key-value 方式的数据格式，这类格式也非常常见。
key-value 展示的**数据更为直观**，能够清晰地展示数据结构
### 范例


+ 按行的 key-value 形式（对象数组），这是个比较常见的格式。
```javascript
[
  { product: 'Matcha Latte', count: 823, year: 2013 },
  { product: 'Milk Tea', count: 235, year: 2013 },
  { product: 'Cheese Cocoa', count: 1042, year: 2013 },
  { product: 'Walnut Brownie', count: 988, year: 2013 }
]
```
+ 按列的 key-value 形式。
```javascript
{
  product: ['Matcha Latte', 'Milk Tea', 'Cheese Cocoa', 'Walnut Brownie'],
    count: [823, 235, 1042, 988],
    year: [2013, 2013, 2013, 2013]
}
```

**DataLuminary 采用 按行的 key-value 形式（对象数组）**
```javascript
[
  {
    "name": "Matcha Latte",
    "source": [
      { count: 823, year: 2013  },
      { count: 235, year: 2014 },
    ]
  },
  {
    "name": "Milk Tea",
    "source": [
      { count: 423, year: 2013  },
      { count: 335, year: 2014 },
    ]
  },
]

```
### echarts范例
```javascript
option = {
  xAxis: {type: 'category'},
  yAxis: {type: 'value'},
  series: [
    {
      name: 'Matcha Latte',
      type: 'line',
      encode: { x: 'year', y: 'count' },
    },
    {
      name: 'Matcha Latte',
      type: 'line',
      encode: { x: 'year', y: 'count' },
      datasetIndex:1,
    }
  ],

  dataset: [
    {
      "name": "Milk Tea",
      "source": [
        { count: 823, year: 2013  },
        { count: 235, year: 2014 },
      ]
    },
    {
      "name": "Milk Tea",
      "source": [
        { count: 423, year: 2013  },
        { count: 335, year: 2014 },
      ]
    },
  ],
};
```
#### 更为直观的例子
```javascript
option = {
  xAxis: {type: 'time'},
  yAxis: {type: 'value'},
  series: [
    {
      name: '图例1',
      type: 'line',
      encode: { x: 'x', y: 'y' },
    }
  ],

  dataset: [
    {
      label: 'A',
      source: [
        {
          x: 15,
          y: 20
        },
        {
          x: 20,
          y: 40
        }
      ]
    },
    {
      label: 'B',
      source: [
        {
          x: 15,
          y: 30
        },
        {
          x: 20,
          y: 60
        }
      ]
    }
  ],
};

```
###  bk-charts 范例
```javascript
const context = document.getElementById('chart')
this.chart = new Chart(context,{
  "type": "line",
  "data": {
    "labels":[
      "Milk Tea",
      "Milk Tea"
    ],
    "datasets": [
      {
        "label": "Milk Tea",
        "data": [
          { count: 823, year: 2013  },
          { count: 235, year: 2014 },
        ]
      },
      {
        "label": "Milk Tea",
        "data": [
          { count: 423, year: 2013  },
          { count: 335, year: 2014 },
        ]
      },
    ]
  },
  "options": {
    parsing: {
      xAxisKey: 'year',
      yAxisKey: 'count'
    },
  }
})

```
#### 更为直观的例子
```javascript
const context = document.getElementById('chart')
new Chart(context,{
    "type": "line",
    "data": {
        "datasets": [
            {
                "label": "A",
                 data: [
                   {
                     x: 15,
                     y: 20
                   },
                   {
                     x: 20,
                     y: 40
                   }
                 ]
            },
          {
                "label": "B",
                 data: [
                   {
                     x: 15,
                     y: 30
                   },
                   {
                     x: 20,
                     y: 60
                   }
                 ]
            }
        ]
    },
})
```
##  时序数据
更符合echarts series图表数据
```javascript
[
  {
      // 图例名  对应 grafana  target
    name:'A',
    // 对应 grafana  datapoints
    data:[
      //  与 grafana  坐标相反（【y值，x值】
      [
        // x轴的值
        1642348800000,
        //  y轴的值
        4
      ]
    ]
  }
]
```
### echarts  范例
```javascript
option = {
  xAxis: [
    {
      type: 'time'
    }
  ],
  yAxis: [
    {
      type: 'value'
    }
  ],

  series: [
    {
      name: 'A',
      data: [
        [1642348800000, 1],
        [1642435200000, 2],
        [1642521600000, 1],
        [1642608000000, 1]
      ],
      smooth: false,

      type: 'line'
    },
    {
      name: 'B',
      data: [
        [1642348800000, 4],
        [1642435200000, 6],
        [1642521600000, 2],
        [1642608000000, 1]
      ],
      smooth: false,

      type: 'line'
    }
  ]
};

```

### bk-Charts  范例
数据转换成对象数据集
