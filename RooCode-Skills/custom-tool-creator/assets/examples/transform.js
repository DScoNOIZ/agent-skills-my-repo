// ~/.roo/tools/transform.js
const json2csv = require('json2csv').parse;
const xml2js = require('xml2js');

module.exports.convertData = {
  name: 'convert_data',
  description: 'Convert data between JSON, CSV, and XML formats. Use for data import/export tasks.',
  parameters: {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        description: 'Data to convert (JSON object or array of objects)'
      },
      fromFormat: {
        type: 'string',
        enum: ['json', 'csv', 'xml'],
        default: 'json',
        description: 'Source format'
      },
      toFormat: {
        type: 'string',
        enum: ['json', 'csv', 'xml'],
        default: 'csv',
        description: 'Target format'
      },
      csvOptions: {
        type: 'object',
        properties: {
          delimiter: { type: 'string', default: ',' },
          quoteColumns: { type: 'boolean', default: true }
        },
        description: 'Options for CSV generation'
      }
    },
    required: ['data']
  },
  async execute({ data, fromFormat = 'json', toFormat = 'csv', csvOptions = {} }) {
    try {
      // Parse input if needed (XML → JSON)
      let parsed = data;
      if (fromFormat === 'xml') {
        const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
        parsed = await parser.parseStringPromise(data.xml || data);
      } else if (fromFormat === 'csv') {
        // Assume array of objects for CSV
        parsed = data;
      }

      // Convert to output format
      switch (toFormat) {
        case 'csv':
          const fields = csvOptions.fields || Object.keys(parsed[0] || parsed);
          return json2csv(Array.isArray(parsed) ? parsed : [parsed], {
            fields,
            delimiter: csvOptions.delimiter || ',',
            quoteColumns: csvOptions.quoteColumns !== false
          });

        case 'xml':
          const builder = new xml2js.Builder();
          return builder.buildObject({ item: parsed });

        case 'json':
        default:
          return JSON.stringify(parsed, null, 2);
      }

    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
};
