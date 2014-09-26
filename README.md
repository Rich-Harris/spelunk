# spelunk.js

```
$ npm install spelunk
```

**spelunk.js** turns a folder into an object. This folder...

```
data
|- config.json
|- tables
   |- population.csv
   |- growth.csv
|- slides
   |- 0.txt
   |- 1.txt
   |- 2.txt
   |- 3.txt
|- i18n
   |- en-GB.json
   |- en-US.json
   |- fr.json
   |- de.json
   |- ...
```

...becomes this object:


```js
{
  config: { <contents of config.json> }, // parsed as JSON
  tables: {
    population: <contents of population.csv> // as a string
    growth:     <contents of growth.csv>
  },
  slides: [
    <contents of 0.txt>,  // because these files have
    <contents of 1.txt>,  // numeric names, `slides` is
    <contents of 2.txt>,  // an array, not an object
    <contents of 3.txt>
  ],
  i18n: {
    "en-GB": <contents of en-GB.json>,
    "en-US": <contents of en-US.json>,
    "fr":    <contents of fr.json>,
    "de":    <contents of de.json>,
    ...
  }
}
```


If a file contains JSON, it is parsed as JSON; if not, it is treated as text. If a folder only contains items with numeric filenames (as in the case of the `slides` folder above), it will become an array rather than an object.


## Usage

spelunk.js uses the standard Node callback pattern...

```js
callback = function ( error, result ) {
  if ( error ) {
    return handleError( error );
  }

  doSomething( result );
};

spelunk( 'myFolder', callback );
```

...but it also returns a promise, because this is 2014 dammit and callbacks are a lousy flow control mechanism:

```js
spelunk( 'myFolder' ).then( doSomething, handleError );
```


## Options

### options.exclude

Exclude files that match a certain pattern (this uses [minimatch](https://github.com/isaacs/minimatch) syntax):

```js
spelunk( 'myFolder', { exclude: '**/README.md' }).then( doSomething );
```

The value of `exclude` can be an string, or an array of strings.

### options.keepExtensions

If you have multiple files with the same name but different extensions, they'll conflict. This option allows you to keep their extensions, e.g. `result['config.json']` instead of `result.config` (but really, you're better off keeping your filenames distinct).

```js
spelunk( 'myFolder', { keepExtensions: true }).then( doSomething );
```


## Why the name?

Because traversing a folder tree and mapping all its nooks and crannies feels a bit like spelunking. Plus it's fun to say.

## Testing

```
$ npm run test
```

## License

[MIT](LICENSE.md), copyright 2014 [@Rich_Harris](http://twitter.com/Rich_Harris)
