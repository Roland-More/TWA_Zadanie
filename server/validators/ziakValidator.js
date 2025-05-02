const ajv = require('../config/ajv');

const studentSchema = {
  type: 'object',
  properties: {
    meno: { 
      type: 'string', 
      pattern: '^[A-ZÁ-Ž][a-zá-ž]{0,29}$', 
      minLength: 1, 
      maxLength: 30 
    },
    priezvisko: { 
      type: 'string', 
      pattern: '^[A-ZÁ-Ž][a-zá-ž]{0,29}$', 
      minLength: 1, 
      maxLength: 30 
    },
    datum_narodenia: { type: 'string', format: 'date' },
    email: { type: 'string', format: 'email', maxLength: 30 },
    ulica: { 
      type: 'string',
      pattern: '^[A-ZÁ-Ž][a-zá-ž ]+ [0-9]+(\\/\\d+)?$',
      maxLength: 30,
    },
    mesto: { 
      type: 'string', 
      pattern: '^[A-ZÁ-Ž][a-zá-ž ]{0,29}$', 
      minLength: 1, 
      maxLength: 30 
    },
    PSC: { 
      type: 'string',
      pattern: '^[0-9]{3} [0-9]{2}$'
    },
    id_izba: { type: 'number', minimum: 1 },
  },
  required: [
    'meno',
    'priezvisko',
    'datum_narodenia',
    'email',
    'ulica',
    'mesto',
    'PSC',
    'id_izba'
  ],
  additionalProperties: false,
};

const updateStudentSchema = {
  type: 'object',
  properties: {
    id_ziak: { type: 'number', minimum: 1 },
    meno: { 
      type: 'string', 
      pattern: '^[A-ZÁ-Ž][a-zá-ž]{0,29}$', 
      minLength: 1, 
      maxLength: 30 
    },
    priezvisko: { 
      type: 'string', 
      pattern: '^[A-ZÁ-Ž][a-zá-ž]{0,29}$', 
      minLength: 1, 
      maxLength: 30 
    },
    datum_narodenia: { type: 'string', format: 'date' },
    email: { type: 'string', format: 'email', maxLength: 30 },
    ulica: { 
      type: 'string',
      pattern: '^[A-ZÁ-Ž][a-zá-ž ]+ [0-9]+(\\/\\d+)?$',
      maxLength: 30,
    },
    mesto: { 
      type: 'string', 
      pattern: '^[A-ZÁ-Ž][a-zá-ž ]{0,29}$', 
      minLength: 1, 
      maxLength: 30 
    },
    PSC: { 
      type: 'string',
      pattern: '^[0-9]{3} [0-9]{2}$'
    },
    id_izba: { type: 'number', minimum: 1 },
  },
  required: [
    'id_ziak',
    'meno',
    'priezvisko',
    'datum_narodenia',
    'email',
    'ulica',
    'mesto',
    'PSC',
    'id_izba'
  ],
  additionalProperties: false,
};

exports.validateStudent = ajv.compile(studentSchema);
exports.validateUpdateStudent = ajv.compile(updateStudentSchema);
