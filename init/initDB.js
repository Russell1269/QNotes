const mongoose = require("mongoose");
const Question = require("../models/questionSchema");
const queData = require("./data");

// async function main() {
//   await mongoose.connect("mongodb://127.0.0.1:27017/qnotes");
// }
// main()
//   .then(() => {
//     console.log("Database Connected");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

async function initDB() {
  await mongoose.connect("mongodb://127.0.0.1:27017/qnotes");
  await Question.deleteMany({});
  const updatedData = queData.map((obj) => ({
    ...obj,
    owner: "6a4f5596ff2f77364b885ed2",
  }));
  await Question.insertMany(updatedData);
  console.log("Successfully added");
}

// initDB();
