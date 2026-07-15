const { name } = require("ejs");
const Joi = require("joi");

const questionJoiSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    "string.empty": "Question title cannot be blank.",
    "any.required": "Question title is a mandatory field.",
  }),

  description: Joi.string().trim().allow("", null), // Allows description to be optional or cleared cleanly

  subject: Joi.string().trim().required().messages({
    "string.empty": "Subject field cannot be blank.",
    "any.required": "Subject category is a mandatory field.",
  }),

  year: Joi.number().integer().min(1900).max(2100).allow(null).required(), // Allows passing no year field safely

  session: Joi.string().trim().allow("", null).required(),

  // uploadedBy: Joi.string().trim().required().messages({
  //   "string.empty": "Uploader identifier reference string cannot be blank.",
  //   "any.required": "Uploader information profile is required.",
  // }),

  fileUrl: Joi.string().uri().trim().allow("", null).messages({
    "string.uri":
      "Attachment file destination parameter must be a valid system URL link address.",
  }),

  imageUrl: Joi.string()
    .uri()
    .trim()
    .empty("") // Intercepts empty string submittals
    .default(
      "https://images.unsplash.com/photo-1773332598414-44a45e364d85?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ),

  tags: Joi.string().trim().allow("", null), // Handles an array of descriptive tags or falls back to an empty collection safely

  createdAt: Joi.date().default(() => new Date()),
});

module.exports = { questionJoiSchema };


module.exports.answerJoiSchema = Joi.object({

  writtenAnswer: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'লিখিত উত্তর ফাঁকা রাখা যাবে না।',
      'any.required': 'লিখিত উত্তর দেওয়া বাধ্যতামূলক।'
    }),

  imageUrl: Joi.any().optional(),
  fileUrl: Joi.any().optional() 
})