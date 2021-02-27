# merge-array [![Build Status](https://travis-ci.org/gillstrom/merge-array.svg?branch=master)](https://travis-ci.org/gillstrom/merge-array)

> Merge arrays in to the first array


## Install

```
$ npm install --save merge-array
```


## Usage

```js
var mergeArray = require('merge-array');
var arr = ['foo'];

mergeArray(arr, ['bar']);
console.log(arr);
//=> ['foo', 'bar']

mergeArray(arr, ['hello'], ['you']);
console.log(arr);
//=> ['foo', 'bar', 'hello', 'you']
```


## API

### mergeArray(input, array, [array, ...])

#### input

Type: `array`

Array to merge in to.

#### array

Type: `array`

Array to merge in to the first array.


## License

MIT © [Andreas Gillström](http://github.com/gillstrom)
