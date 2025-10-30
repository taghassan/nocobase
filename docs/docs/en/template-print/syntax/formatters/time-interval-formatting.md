### Interval Formatting

#### 1. :formatI(patternOut, patternIn)

##### Syntax Explanation
Formats a duration or interval. The supported output formats include:
- `human+` or `human` (suitable for human-friendly display)
- Units such as `millisecond(s)`, `second(s)`, `minute(s)`, `hour(s)`, `year(s)`, `month(s)`, `week(s)`, `day(s)` (or their abbreviations).

Parameters:
- **patternOut:** The output format (for example, `'second'` or `'human+'`).
- **patternIn:** Optional, the input unit (for example, `'milliseconds'` or `'s'`).

##### Example
```
// Example environment: API options { "lang": "en", "timezone": "Europe/Paris" }
2000:formatI('second')       // Outputs 2
2000:formatI('seconds')      // Outputs 2
2000:formatI('s')            // Outputs 2
3600000:formatI('minute')    // Outputs 60
3600000:formatI('hour')      // Outputs 1
2419200000:formatI('days')   // Outputs 28

// French example:
2000:formatI('human')        // Outputs "quelques secondes"
2000:formatI('human+')       // Outputs "dans quelques secondes"
-2000:formatI('human+')      // Outputs "il y a quelques secondes"

// English example:
2000:formatI('human')        // Outputs "a few seconds"
2000:formatI('human+')       // Outputs "in a few seconds"
-2000:formatI('human+')      // Outputs "a few seconds ago"

// Unit conversion example:
60:formatI('ms', 'minute')   // Outputs 3600000
4:formatI('ms', 'weeks')      // Outputs 2419200000
'P1M':formatI('ms')          // Outputs 2628000000
'P1Y2M3DT4H5M6S':formatI('hour')  // Outputs 10296.085
```

##### Result
The output is the duration or interval displayed in the specified unit or format.


