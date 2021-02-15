module.exports.feedbackSchema = {
  type: 'object',
  required: ['name', 'message', 'email'],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
    },
    message: {
      type: 'string',
      minLength: 1,
    },
    email: {
      anyOf: [
        {
          type: 'string',
          maxLength: 0,
        },
        {
          type: 'string',
          format: 'email',
        },
      ],
    },
  },
};

module.exports.ingredientsSchema = {
  type: 'object',
  required: ['q'],
  properties: {
    q: {
      type: 'string',
      minLength: 1,
    },
    fuzzy: {
      tpye: 'string',
      enum: ['1', '0'],
    },
  },
};
