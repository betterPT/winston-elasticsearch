# winston-elasticsearch

[![Version npm][version]](http://browsenpm.org/package/winston-elasticsearch)[![Build Status][build]](https://travis-ci.org/vanthome/winston-elasticsearch)[![Dependencies][david]](https://david-dm.org/vanthome/winston-elasticsearch)[![Coverage Status][cover]](https://coveralls.io/r/vanthome/winston-elasticsearch?branch=master)

[version]: http://img.shields.io/npm/v/winston-elasticsearch.svg?style=flat-square
[build]: http://img.shields.io/travis/vanthome/winston-elasticsearch/master.svg?style=flat-square
[david]: https://img.shields.io/david/vanthome/winston-elasticsearch.svg?style=flat-square
[cover]: http://img.shields.io/coveralls/vanthome/winston-elasticsearch/master.svg?style=flat-square

An [elasticsearch](https://www.elastic.co/products/elasticsearch)
transport for the [winston](https://github.com/winstonjs/winston) logging toolkit.

## Features

- [logstash](https://www.elastic.co/products/logstash) compatible message structure.
- Thus consumable with [kibana](https://www.elastic.co/products/kibana).
- Date pattern based index names.
- Custom transformer function to transform logged data into a different message structure.

### Unsupported / Todo

- Querying.
- Real buffering of messages in case of unavailable ES.
- Message batching; sending log messages as batches of 1000 messages using the clients bulk() method.

## Installation

    npm install --save winston winston-elasticsearch

## Usage

    var winston = require('winston');
    var Elasticsearch = require('winston-elasticsearch');

    var esTransportOpts = {
      level: 'info'
    };
    winston.add(winston.transports.Elasticsearch, esTransportOpts);

    // - or -

    var logger = new winston.Logger({
      transports: [
        new Elasticsearch(esTransportOpts)
      ]
    });

## Options

- `level` [`info`] Messages logged with a severity greater or equal to the given one are logged to ES; others are discarded.
- `indexPrefix` [`logs`] the prefix to use to generate the index name according to the pattern `<indexPrefix>-<indexSuffixPattern>`.
- `indexSuffixPattern` [`YYYY.MM.DD`] a [Moment.js](http://momentjs.com/) compatible date/ time pattern.
- `messageType` [`log`] the type (path after the index path) under which the messages are stored under the index.
- `fireAndForget` [false] if set to `true`, a callback function passed to the `log()` function is immediately executed without a parameters.
- `transformer` [see below] a transformer function to transform logged data into a different message structure.
- `ensureMappingTemplate` [`true`] If set to `true`, the given `mappingTemplate` is checked/ uploaded to ES when the module is sending the fist log message to make sure the log messages are mapped in a sensible manner.
- `mappingTemplate` [see file `index-template-mapping.json` file] the mapping template to be ensured as parsed JSON.
- `client` An [elasticsearch client](https://www.npmjs.com/package/elasticsearch) instance. If given, all following options are ignored.
- `clientOpts` An object hash passed to the ES client. See [its docs](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/configuration.html) for supported options.
- `consistency` [`one`] The consistency hint used to store messages in ES. Possible values `one`, `quorum`, `all`.

## Important

When changing the `indexPrefix` and/ or the `transformer`, make sure to provide a matching `mappingTemplate`.

## Transformer

The transformer function allows to transform the log data structure as provided by winston
into a sturcture more appropriate for indexing in ES.

The default transformer function's transformation is shwon below.

Input:

````
{
  "message": "Some message",
  "level": "info",
  "meta": {
    "method": "GET",
    "url": "/sitemap.xml",
    ...
    }
  }
}
````

Output:

````
{
  "@timestamp": "2015-09-30T05:09:08.282Z",
  "message": "Some message",
  "severity": "info",
  "fields": {
    "method": "GET",
    "url": "/sitemap.xml",
    ...
  }
}
````
The `@timestamp` is generated in the transformer.
Note that in current logstash versions, the only "standard fields" are @timestamp and @version,
anything else ist just free.

A custom trunsformer function can be provided in the options hash.

## Events

- `error`: in case of any error.

## Example

An example assuming default settings.

### Log Action

````
logger.info('Some message', <req meta data>);
````

### Generated Message

The log message generated by this module has the following structure:

````
{
  "@timestamp": "2015-09-30T05:09:08.282Z",
  "message": "Some log message",
  "severity": "info",
  "fields": {
    "method": "GET",
    "url": "/sitemap.xml",
    "headers": {
      "host": "www.example.com",
      "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "accept": "*/*",
      "accept-encoding": "gzip,deflate",
      "from": "googlebot(at)googlebot.com",
      "if-modified-since": "Tue, 30 Sep 2015 11:34:56 GMT",
      "x-forwarded-for": "66.249.78.19"
    }
  }
}
````

### Target Index

This message would be POSTed to the following endpoint:

    http://localhost:9200/logs-2015.09.30/log/
