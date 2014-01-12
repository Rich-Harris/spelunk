spelunk.js
==========

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
  config: {
    // contents of config.json (parsed as JSON)
  },
  tables: {
    population: // contents of population.csv (as a string)
    growth:     // contents of growth.csv
  },
  slides: [
    contents of 0.txt,  // because these files have
    contents of 1.txt,  // numeric names, `slides` is
    contents of 2.txt,  // an array, not an object
    contents of 3.txt
  ],
  i18n: {
    "en-GB": {
      // contents of en-GB.json
    },
    "en-US": {
      // contents of en-US.json
    },
    "fr": {
      // contents of fr.json
    },
    "de": {
      // contents of de.json
    },
    ...
  }
}
```


If a file contains JSON, it is stored as JSON; if not, it is stored as text. If a folder only contains items with numeric filenames (as in the case of the `slides` folder above), it will become an array rather than an object.


Usage
-----

spelunk.js uses the standard Node pattern:

```js
callback = function ( error, result ) {
  if ( error ) {
    // oh noes!
  }

  doSomethingWith( result );
};

spelunk( 'myFolder', callback );
```

Exclude files that match a certain pattern (this uses [minimatch](https://github.com/isaacs/minimatch) syntax):

```js
spelunk( 'myFolder', { exclude: '**/README.md' }, callback );
```

Flatten a folder into a JSON file, so it can be consumed by a browser with a single HTTP request (see also [grunt-spelunk](https://github.com/Rich-Harris/grunt-spelunk):

```js
fs = require( 'fs' );

callback = function ( error, result ) {
  if ( error ) {
    // Can you handle it / If I go there baby with you / I can handle it
  }

  fs.writeFile( 'output.json', JSON.stringify( result ) );
};

spelunk( 'myFolder', callback );
```


Why the name?
-------------

Because traversing a folder tree and mapping all its nooks and crannies feels a bit like spelunking. Plus it's fun to say.

Testing
-------

```
$ npm run test
```

License
-------

[MIT](LICENSE.md), copyright 2014 [@Rich_Harris](http://twitter.com/Rich_Harris)