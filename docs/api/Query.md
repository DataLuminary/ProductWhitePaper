# query接口返回格式
为了应对图表数据支持，首先参考：  [图表接口说明](docs/api/图表接口.md)
### query支持三种接口
+ 标准数据集(二维表-行业通用标准) (dataSetType:'frame')
+ 对象数据集（**bk-vision推荐使用**） dataSetType: 'row'|'column'
+ 时序数据集 (时序图专用)   dataSetType: 'point'
  
下面以mysql数据源为例：


## 标准数据集(二维表-行业通用标准) 
数据格式为：'frame'
### 查询请求数据
```json
{
  "queries": [
    {
      "x": {
        "name": "datetime_datetime",
        "type": "time"
      },
      "group": [],
      "limit": {
        "size": 10,
        "offset": null
      },
      "order": [],
      "table": "home_testlinedata",
      "where": [],
      "format": "frame",
      "ref_id": "a7ae0edf46",
      "select": [
        {
          "alias": "",
          "column": "count_int",
          "aggregate": ""
        }
      ],
      "raw_query": false,
      "datasource": {
        "type": "mysql",
        "uid": "JHtUr9NnUKvZuA7t8frYwG"
      },
      "query_text": ""
    }
  ],
  "option": {
    "range": {
      "from": 1647495826003,
      "to": 1647499426003
    },
    "variables": {}
  }
}

```
### 返回数据示例
```json
{
  "result": true,
  "data": {
    "a7ae0edf46": {
      "dataset": [
        [
          "datetime_datetime",
          "count_int"
        ],
        [
          1607616811000,
          1003834
        ],
        [
          1607616871000,
          1006186
        ],
        [
          1607616931000,
          1002815
        ],
        [
          1607616991000,
          1009050
        ],
        [
          1607617051000,
          1005368
        ],
        [
          1607617111000,
          1007270
        ],
        [
          1607617171000,
          1007443
        ],
        [
          1607617231000,
          1001931
        ],
        [
          1607617291000,
          1006879
        ],
        [
          1607617351000,
          1004661
        ]
      ],
      "columns": [
        {
          "name": "datetime_datetime",
          "friendly_name": "datetime_datetime",
          "type": "datetime"
        },
        {
          "name": "count_int",
          "friendly_name": "count_int",
          "type": "integer"
        }
      ],
      "meta": {
        "query_text": "SELECT\n datetime_datetime,\n count_int\nFROM home_testlinedata\nLIMIT 10 ",
        "cost": 0.022083282470703125,
        "x": {
          "name": "datetime_datetime",
          "type": "time"
        }
      },
      "error": null
    }
  },
  "code": 200,
  "message": ""
}
```

## 对象数据
### 行数据
 数据格式为：'row'
#### 查询请求数据
```json
{
  "queries": [
    {
      "x": {
        "name": "datetime_datetime",
        "type": "time"
      },
      "group": [],
      "limit": {
        "size": 10,
        "offset": null
      },
      "order": [],
      "table": "home_testlinedata",
      "where": [],
      "format": "row",
      "ref_id": "a7ae0edf46",
      "select": [
        {
          "alias": "",
          "column": "count_int",
          "aggregate": ""
        }
      ],
      "raw_query": false,
      "datasource": {
        "type": "mysql",
        "uid": "JHtUr9NnUKvZuA7t8frYwG"
      },
      "query_text": ""
    }
  ],
  "option": {
    "range": {
      "from": 1647495826003,
      "to": 1647499426003
    },
    "variables": {}
  }
}
```
#### 返回数据示例
```json
{
  "result": true,
  "data": {
    "a7ae0edf46": {
      "dataset": [
        {
          "datetime_datetime": 1607616811000,
          "count_int": 1003834
        },
        {
          "datetime_datetime": 1607616871000,
          "count_int": 1006186
        },
        {
          "datetime_datetime": 1607616931000,
          "count_int": 1002815
        },
        {
          "datetime_datetime": 1607616991000,
          "count_int": 1009050
        },
        {
          "datetime_datetime": 1607617051000,
          "count_int": 1005368
        },
        {
          "datetime_datetime": 1607617111000,
          "count_int": 1007270
        },
        {
          "datetime_datetime": 1607617171000,
          "count_int": 1007443
        },
        {
          "datetime_datetime": 1607617231000,
          "count_int": 1001931
        },
        {
          "datetime_datetime": 1607617291000,
          "count_int": 1006879
        },
        {
          "datetime_datetime": 1607617351000,
          "count_int": 1004661
        }
      ],
      "columns": [
        {
          "name": "datetime_datetime",
          "friendly_name": "datetime_datetime",
          "type": "datetime"
        },
        {
          "name": "count_int",
          "friendly_name": "count_int",
          "type": "integer"
        }
      ],
      "meta": {
        "query_text": "SELECT\n datetime_datetime,\n count_int\nFROM home_testlinedata\nLIMIT 10 ",
        "cost": 0.04705405235290527,
        "x": {
          "name": "datetime_datetime",
          "type": "time"
        }
      },
      "error": null
    }
  },
  "code": 200,
  "message": ""
}
```

### 列数据
数据格式为：'column'
#### 查询请求数据
```json
{
  "queries": [
    {
      "x": {
        "name": "datetime_datetime",
        "type": "time"
      },
      "group": [],
      "limit": {
        "size": 10,
        "offset": null
      },
      "order": [],
      "table": "home_testlinedata",
      "where": [],
      "format": "column",
      "ref_id": "a7ae0edf46",
      "select": [
        {
          "alias": "",
          "column": "count_int",
          "aggregate": ""
        }
      ],
      "raw_query": false,
      "datasource": {
        "type": "mysql",
        "uid": "JHtUr9NnUKvZuA7t8frYwG"
      },
      "query_text": ""
    }
  ],
  "option": {
    "range": {
      "from": 1647495826003,
      "to": 1647499426003
    },
    "variables": {}
  }
}
```
#### 返回数据示例
```json
{
  "result": true,
  "data": {
    "a7ae0edf46": {
      "dataset": [
        [
          1607616811000,
          1607616871000,
          1607616931000,
          1607616991000,
          1607617051000,
          1607617111000,
          1607617171000,
          1607617231000,
          1607617291000,
          1607617351000
        ],
        [
          1003834,
          1006186,
          1002815,
          1009050,
          1005368,
          1007270,
          1007443,
          1001931,
          1006879,
          1004661
        ]
      ],
      "columns": [
        {
          "name": "datetime_datetime",
          "friendly_name": "datetime_datetime",
          "type": "datetime"
        },
        {
          "name": "count_int",
          "friendly_name": "count_int",
          "type": "integer"
        }
      ],
      "meta": {
        "query_text": "SELECT\n datetime_datetime,\n count_int\nFROM home_testlinedata\nLIMIT 10 ",
        "cost": 0.020967483520507812,
        "x": {
          "name": "datetime_datetime",
          "type": "time"
        }
      },
      "error": null
    }
  },
  "code": 200,
  "message": ""
}

```

## 时序数据
数据格式为：'point'
### 查询请求数据
```json
{
  "queries": [
    {
      "x": {
        "name": "datetime_datetime",
        "type": "time"
      },
      "group": [],
      "limit": {
        "size": 10,
        "offset": null
      },
      "order": [],
      "table": "home_testlinedata",
      "where": [],
      "format": "point",
      "ref_id": "a7ae0edf46",
      "select": [
        {
          "alias": "",
          "column": "count_int",
          "aggregate": ""
        }
      ],
      "raw_query": false,
      "datasource": {
        "type": "mysql",
        "uid": "JHtUr9NnUKvZuA7t8frYwG"
      },
      "query_text": ""
    }
  ],
  "option": {
    "range": {
      "from": 1647495826003,
      "to": 1647499426003
    },
    "variables": {}
  }
}

```
### 返回数据示例
```json
{
  "result": true,
  "data": {
    "a7ae0edf46": {
      "dataset": [
        {
          "name": "count_int",
          "data": [
            [
              1607616811000,
              1003834
            ],
            [
              1607616871000,
              1006186
            ],
            [
              1607616931000,
              1002815
            ],
            [
              1607616991000,
              1009050
            ],
            [
              1607617051000,
              1005368
            ],
            [
              1607617111000,
              1007270
            ],
            [
              1607617171000,
              1007443
            ],
            [
              1607617231000,
              1001931
            ],
            [
              1607617291000,
              1006879
            ],
            [
              1607617351000,
              1004661
            ]
          ]
        }
      ],
      "columns": [
        {
          "name": "datetime_datetime",
          "friendly_name": "datetime_datetime",
          "type": "datetime"
        },
        {
          "name": "count_int",
          "friendly_name": "count_int",
          "type": "integer"
        }
      ],
      "meta": {
        "query_text": "SELECT\n datetime_datetime,\n count_int\nFROM home_testlinedata\nLIMIT 10 ",
        "cost": 0.022290468215942383,
        "x": {
          "name": "datetime_datetime",
          "type": "time"
        }
      },
      "error": null
    }
  },
  "code": 200,
  "message": ""
}
```
