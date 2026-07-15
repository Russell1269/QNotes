module.exports = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
};

//Mongoose-এ যখন আপনি কোনো স্কিমা (Schema) তৈরি করেন 
// এবং সেখানে ডেটার ওপর কোনো নিয়ম বা শর্ত (যেমন: required: true, min: 10 ইত্যাদি) সেট করে দেন, 
// তখন সেই নিয়ম না মেনে ডেটা সেভ করার চেষ্টা করলে Mongoose একটি এরর দেয়। এটিকে ValidationError (ভ্যালিডেশন এরর) বলে।
