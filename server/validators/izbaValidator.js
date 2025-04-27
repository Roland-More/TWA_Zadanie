const ajv = require('../config/ajv');

const roomSchema = {
  type: 'object',
  properties: {
    cislo: { type: 'number', minimum: 1 },
    kapacita: { type: 'number', minimum: 1 },
  },
  required: ['cislo', 'kapacita'],
  additionalProperties: false,
};

exports.validateRoom = ajv.compile(roomSchema);
