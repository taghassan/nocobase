### 日期格式化

#### 1. :formatD(patternOut, patternIn)

##### 语法说明
格式化日期，接受输出格式模式 `patternOut`，输入格式模式 `patternIn`（默认为 ISO 8601）。  
可通过 `options.timezone` 和 `options.lang` 调整时区和语言。

##### 示例
```
// 示例环境：API 选项 { "lang": "en-us", "timezone": "Europe/Paris" }
'20160131':formatD(L)      // 输出 01/31/2016
'20160131':formatD(LL)     // 输出 January 31, 2016
'20160131':formatD(LLLL)   // 输出 Sunday, January 31, 2016 12:00 AM
'20160131':formatD(dddd)   // 输出 Sunday

// 法语示例：
'2017-05-10T15:57:23.769561+03:00':formatD(LLLL)  // 输出 mercredi 10 mai 2017 14:57
'20160131':formatD(LLLL)   // 输出 dimanche 31 janvier 2016 00:00
1410715640:formatD(LLLL, X) // 输出 dimanche 14 septembre 2014 19:27
```

##### 结果
输出为指定格式的日期字符串。


#### 2. :addD(amount, unit, patternIn)

##### 语法说明
在日期上添加指定的时间量。支持单位：day、week、month、quarter、year、hour、minute、second、millisecond。  
参数：
- amount：添加的数量
- unit：时间单位（不区分大小写）
- patternIn：可选，输入格式，默认为 ISO8601

##### 示例
```
// 示例环境：API 选项 { "lang": "fr", "timezone": "Europe/Paris" }
'2017-05-10T15:57:23.769561+03:00':addD('3', 'day')    // 输出 "2017-05-13T12:57:23.769Z"
'2017-05-10 15:57:23.769561+03:00':addD('3', 'month')      // 输出 "2017-08-10T12:57:23.769Z"
'20160131':addD('3', 'day')       // 输出 "2016-02-03T00:00:00.000Z"
'20160131':addD('3', 'month')     // 输出 "2016-04-30T00:00:00.000Z"
'31-2016-01':addD('3', 'month', 'DD-YYYY-MM')  // 输出 "2016-04-30T00:00:00.000Z"
```

##### 结果
输出为添加时间后的新日期。


#### 3. :subD(amount, unit, patternIn)

##### 语法说明
从日期中减去指定的时间量。参数同 `addD`。

##### 示例
```
// 示例环境：API 选项 { "lang": "fr", "timezone": "Europe/Paris" }
'2017-05-10T15:57:23.769561+03:00':subD('3', 'day')    // 输出 "2017-05-07T12:57:23.769Z"
'2017-05-10 15:57:23.769561+03:00':subD('3', 'month')      // 输出 "2017-02-10T12:57:23.769Z"
'20160131':subD('3', 'day')       // 输出 "2016-01-28T00:00:00.000Z"
'20160131':subD('3', 'month')     // 输出 "2015-10-31T00:00:00.000Z"
'31-2016-01':subD('3', 'month', 'DD-YYYY-MM')  // 输出 "2015-10-31T00:00:00.000Z"
```

##### 结果
输出为减去时间后的新日期。


#### 4. :startOfD(unit, patternIn)

##### 语法说明
将日期设置为指定时间单位的起始时刻。  
参数：
- unit：时间单位
- patternIn：可选，输入格式

##### 示例
```
// 示例环境：API 选项 { "lang": "fr", "timezone": "Europe/Paris" }
'2017-05-10T15:57:23.769561+03:00':startOfD('day')    // 输出 "2017-05-10T00:00:00.000Z"
'2017-05-10 15:57:23.769561+03:00':startOfD('month')      // 输出 "2017-05-01T00:00:00.000Z"
'20160131':startOfD('day')       // 输出 "2016-01-31T00:00:00.000Z"
'20160131':startOfD('month')     // 输出 "2016-01-01T00:00:00.000Z"
'31-2016-01':startOfD('month', 'DD-YYYY-MM')  // 输出 "2016-01-01T00:00:00.000Z"
```

##### 结果
输出为起始时刻的日期字符串。


#### 5. :endOfD(unit, patternIn)

##### 语法说明
将日期设置为指定时间单位的结束时刻。  
参数同上。

##### 示例
```
// 示例环境：API 选项 { "lang": "fr", "timezone": "Europe/Paris" }
'2017-05-10T15:57:23.769561+03:00':endOfD('day')    // 输出 "2017-05-10T23:59:59.999Z"
'2017-05-10 15:57:23.769561+03:00':endOfD('month')      // 输出 "2017-05-31T23:59:59.999Z"
'20160131':endOfD('day')       // 输出 "2016-01-31T23:59:59.999Z"
'20160131':endOfD('month')     // 输出 "2016-01-31T23:59:59.999Z"
'31-2016-01':endOfD('month', 'DD-YYYY-MM')  // 输出 "2016-01-31T23:59:59.999Z"
```

##### 结果
输出为结束时刻的日期字符串。


#### 6. :diffD(toDate, unit, patternFromDate, patternToDate)

##### 语法说明
计算两个日期之间的差值，并以指定单位输出。支持的输出单位包括：
- `day(s)` 或 `d`
- `week(s)` 或 `w`
- `quarter(s)` 或 `Q`
- `month(s)` 或 `M`
- `year(s)` 或 `y`
- `hour(s)` 或 `h`
- `minute(s)` 或 `m`
- `second(s)` 或 `s`
- `millisecond(s)` 或 `ms`（默认单位）

参数：
- toDate：目标日期
- unit：输出单位
- patternFromDate：可选，起始日期格式
- patternToDate：可选，目标日期格式

##### 示例
```
'20101001':diffD('20101201')              // 输出 5270400000
'20101001':diffD('20101201', 'second')      // 输出 5270400
'20101001':diffD('20101201', 's')           // 输出 5270400
'20101001':diffD('20101201', 'm')           // 输出 87840
'20101001':diffD('20101201', 'h')           // 输出 1464
'20101001':diffD('20101201', 'weeks')       // 输出 8
'20101001':diffD('20101201', 'days')        // 输出 61
'2010+10+01':diffD('2010=12=01', 'ms', 'YYYY+MM+DD', 'YYYY=MM=DD')  // 输出 5270400000
```

##### 结果
输出为两个日期之间的时间差，单位按指定转换。


#### 7. :convDate(patternIn, patternOut)

##### 语法说明
将日期从一种格式转换为另一种格式。（不推荐使用）  
参数：
- patternIn：输入日期格式
- patternOut：输出日期格式

##### 示例
```
// 示例环境：API 选项 { "lang": "en", "timezone": "Europe/Paris" }
'20160131':convDate('YYYYMMDD', 'L')      // 输出 "01/31/2016"
'20160131':convDate('YYYYMMDD', 'LL')     // 输出 "January 31, 2016"
'20160131':convDate('YYYYMMDD', 'LLLL')   // 输出 "Sunday, January 31, 2016 12:00 AM"
'20160131':convDate('YYYYMMDD', 'dddd')   // 输出 "Sunday"
1410715640:convDate('X', 'LLLL')          // 输出 "Sunday, September 14, 2014 7:27 PM"
// 法语示例：
'20160131':convDate('YYYYMMDD', 'LLLL')   // 输出 "dimanche 31 janvier 2016 00:00"
'20160131':convDate('YYYYMMDD', 'dddd')   // 输出 "dimanche"
```

##### 结果
输出为转换后的日期字符串。


#### 8. 日期格式模式
常用日期格式说明（参照 DayJS 说明）：
- `X`：Unix 时间戳（秒），如 1360013296
- `x`：Unix 毫秒时间戳，如 1360013296123
- `YY`：两位年份，如 18
- `YYYY`：四位年份，如 2018
- `M`、`MM`、`MMM`、`MMMM`：月份（数字、两位、缩写、全称）
- `D`、`DD`：日（数字、两位）
- `d`、`dd`、`ddd`、`dddd`：星期（数字、最简、简写、全称）
- `H`、`HH`、`h`、`hh`：小时（24 小时制或 12 小时制）
- `m`、`mm`：分钟
- `s`、`ss`：秒
- `SSS`：毫秒（3 位）
- `Z`、`ZZ`：UTC 偏移，如 +05:00 或 +0500
- `A`、`a`：AM/PM
- `Q`：季度（1-4）
- `Do`：带序号的日期，如 1st, 2nd, …
- 其它格式参见完整文档。  
  此外，还有基于语言的本地化格式：如 `LT`、`LTS`、`L`、`LL`、`LLL`、`LLLL` 等。


