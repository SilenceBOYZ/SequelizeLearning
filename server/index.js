import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { DataTypes, Model, Sequelize } from "sequelize";
import { configDotenv } from "dotenv";
configDotenv();
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express();
const PORT = 8080;

// config sequelize with local server
const sequelize = new Sequelize('alterexample', process.env.DB_NAME, process.env.DB_PASSWORD, {
  hostname: process.env.DB_HOST,
  dialect: process.env.DB_SERVER,
});


try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch {
  console.error('Unable to connect to the database:', error);
}

const User = sequelize.define('user', {
  name: DataTypes.TEXT,
  favoriteColor: {
    type: DataTypes.TEXT,
    defaultValue: 'green',
  },
  age: DataTypes.INTEGER,
  cash: DataTypes.INTEGER,
});


// (async () => {
//   await sequelize.sync({ force: true });
//   // Code here
// })();

// Creating an instance
// use build instead of the new keyword

// This is just the method create a instance 
// that respesent data can be mapped into data base

// const jane = User.build({ name: 'Jane' }); // build is synchronous function
// console.log(jane instanceof User); // true
// console.log(jane.name); 

// use save to method to save the data into database
// await jane.save();
// console.log('Jane was saved to the database!');

// CREATE method which combines the build and save methods shown above into a single method
// const tri = User.create({name: 'thanhtri', cash: 3000, age: 25})
// console.log(tri instanceof User); 
// console.log(tri.name); 
// console.log(JSON.stringify(tri, null, 4)); // This is also good!

app.get('/', () => {
  console.log("Hello World");
})

app.listen(PORT, () => {
  console.log("app listen on", PORT);
})