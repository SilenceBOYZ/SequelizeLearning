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
const sequelize = new Sequelize(process.env.DB_SERVER, process.env.DB_NAME, process.env.DB_PASSWORD, {
  hostname: process.env.DB_HOST,
  dialect: process.env.DB_SERVER,

});

// Sequelize will keep the connect by default in order to write all queries

try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch {
  console.error('Unable to connect to the database:', error);
}


// create a model in two way

//1) sequelize.define()
/*
const User = sequelize.define('User', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    // allowNull defaults to true
  },
});

console.log(User === sequelize.models.User);
*/

// 2) Extending model
/*
class User extends Model { }
User.init({
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    // allowNull defaults to true
  },
}, { sequelize, modelName: 'User', })

console.log(User === sequelize.models.User);
*/

/*
class User extends Model {
  id; // this field will shadow sequelize's getter & setter. It should be removed.
  otherPublicField; // this field does not shadow anything. It is fine.
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
  },
  { sequelize },
);

const user = new User({ id: 1 });
console.log(user.id);
*/

// Model synchronization
/*
class User extends Model {}
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
  },
  { sequelize },
);

User.sync() // - This creates the table if it doesn't exist (and does nothing if it already exists)
User.sync({ force: true }) // - This creates the table, dropping it first if it already existed
User.sync({ alter: true }) // - This checks what is the current state of the table in the database
*/

// ### Synchronizing all models at once
/*
await sequelize.sync({force: true});
console.log('All models were synchronized successfully.');
*/


// ### Dropping tables

/*
class User extends Model {}
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
  },
  { sequelize },
);
// To drop the table related to a model:
await User.drop();
console.log('User table dropped!');
// To drop all tables:
await sequelize.drop();
console.log('All tables dropped!');
*/

// Database safety check
// This will run .sync() only if database name ends with '_test'
// sequelize.sync({ force: true, match: /webfastfood$/ });

// Synchronization in production
/*
As shown above, sync({ force: true }) and sync({ alter: true }) can be destructive operations. 
Therefore, they are not recommended for production-level software.
Instead, synchronization should be done with the advanced concept of Migrations, with the help of the Sequelize CLI.
*/

// MORE Column option

/*
class Position extends Model { }
Position.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, { sequelize })

class User extends Model { }

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  gender: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  interest: {
    type: DataTypes.STRING,
    // If you provide the same string for multiple columns, they will form a
    // composite unique key.
    unique: 'compositeIndex'
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
  },
  address: {
    type: DataTypes.STRING,
    field: 'PlaceToLive'
  },
  position: {
    type: DataTypes.INTEGER,
    references: {
      model: Position,
      key: 'id',
      // With PostgreSQL, it is optionally possible to declare when to check the foreign key constraint, passing the Deferrable type.
      deferrable: Deferrable.INITIALLY_IMMEDIATE,
      // Options:
      // - `Deferrable.INITIALLY_IMMEDIATE` - Immediately check the foreign key constraints
      // - `Deferrable.INITIALLY_DEFERRED` - Defer all foreign key constraint check to the end of a transaction
      // - `Deferrable.NOT` - Don't defer the checks at all (default) - This won't allow you to dynamically change the rule in a transaction
    }
  },
  // Comments can only be added to columns in MySQL, MariaDB, PostgreSQL and MSSQ
  commentMe: {
    type: DataTypes.INTEGER,
    comment: 'This is a column name that has a comment',
  },
},
  {
    sequelize,
    modelName: 'Users',

    // Using `unique: true` in an attribute above is exactly the same as creating the index in the model's options:
    indexes: [{ unique: true, fields: ['someUnique'] }]
  },
)
*/
// Taking advantage of Models being classes
// The Sequelize models are ES6 classes. You can very easily add custom instance or class level methods.

class User extends Model {
  static classLevelMethod() {
    return 'foo';
  }
  instanceLevelMethod() {
    return 'bar';
  }
  getFullname() {
    return [this.firstname, this.lastname].join(' ');
  }
}
User.init(
  {
    firstname: Sequelize.TEXT,
    lastname: Sequelize.TEXT,
  },
  { sequelize },
);

console.log(User.classLevelMethod());
const user = User.build({firstname: 'Trí', lastname: 'Nguyễn'});
console.log(user.instanceLevelMethod());
console.log(user.getFullname());


app.get('/', () => {
  console.log("Hello World");
})

app.listen(PORT, () => {
  console.log("app listen on", PORT);
})