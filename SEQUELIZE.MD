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

// sequelize.close() this will return a promise
// If call this close function, we can not work with the server any more
// We will have to create another instance to reconnect again.

// I) New databases versus existing databases

Sequelize can work with the project from stratch or connect with existed database


II) MODEL BASIC

1) Concept (Khái niệm)
A model is an abstraction that represents a table in your database
models have singular names (such as User) while tables have pluralized names (such as Users)

2)Model Definition (Định nghĩa ra một model)
Models can be defined in two equivalent ways in Sequelize:

 - Calling sequelize.define(modelName, attributes, options)
 - Extending Model and calling init(attributes, options)

After a model is defined, it is available within sequelize.models by its model name.
Example in the code LINE 28 -> 60
Internally, sequelize.define calls Model.init, so both approaches are essentially equivalent.

### CAUTION
Don't define pulic class field which have already define in model

Example: 
class User extends Model {
  id; // this field will shadow sequelize's getter & setter. It should be removed.
  otherPublicField; // this field does not shadow anything. It is fine.
}

this field will shadow sequelize's getter & setter. It should be removed.

3)Table name inference (Đặt tên)
- Sequelize automatically pluralizes the model name and uses that as the table name. 

- This pluralization is done under the hood by a library called inflection, 
so that irregular plurals (such as person -> people) are computed correctly.

### CAUTION
- To stop the auto-pluralization performed by Sequelize using the freezeTableName: true option. 
sequelize.define(
  'User',
  {
    // ... (attributes)
  },
  {
    freezeTableName: true,
  },
);

- Defined globally for the sequelize instance
const sequelize = new Sequelize('sqlite::memory:', {
  define: {
    freezeTableName: true,
  },
});

=> Both of those option to make all tables will use the same name as the model name

4) Providing the table name directly

sequelize.define(
  'User',
  {
    // ... (attributes)
  },
  {
    tableName: 'Employees',
  },
);

5) ### Model synchronization
- Model synchronization come in to figure out what's going on with the table
when the table exists or doesn't exist in database, even with the number column in the table

- model.sync(options) an asynchronous function (that returns a Promise)
- call sync method, Sequelize will automatically perform an SQL query to the database
### CAUTION * Note that this changes only the table in the database, not the model in the JavaScript side.
User.sync() - This creates the table if it doesn't exist (and does nothing if it already exists)
User.sync({ force: true }) - This creates the table, dropping it first if it already existed
User.sync({ alter: true })

6) ### Synchronizing all models at once
sequelize.sync()

7) ### Database safety check
Sequelize accepts a match option as an additional safety check, which receives a RegExp:
sequelize.sync({ force: true, match: /_test$/ });



8) Synchronization in production
/*
As shown above, sync({ force: true }) and sync({ alter: true }) can be destructive operations. 
Therefore, they are not recommended for production-level software.
Instead, synchronization should be done with the advanced concept of Migrations, with the help of the Sequelize CLI.
*/

9) Timestamps
### Note: This is done in the Sequelize level (i.e. not done with SQL triggers). 
### This means that direct SQL queries (for example queries performed without Sequelize by any other means) will not cause these fields to be updated automatically. 

This behavior can be disabled for a model with the timestamps: false option:
sequelize.define(
  'User',
  {
    // ... (attributes)
  },
  {
    timestamps: false,
  },
);

It is also possible to enable only one of createdAt/updatedAt, and to provide a custom name for these columns:

Ex: 
class Foo extends Model {}
Foo.init(
  {
    /* attributes */
  },
  {
    sequelize,

    // don't forget to enable timestamps!
    timestamps: true,

    // I don't want createdAt
    createdAt: false,

    // I want updatedAt to actually be called updateTimestamp
    updatedAt: 'updateTimestamp',
  },
);

10) Column declaration shorthand syntax
// This:
sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
  },
});

// Can be simplified to:
sequelize.define('User', { name: DataTypes.STRING });

11) Default Values
sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    defaultValue: 'John Doe',
  },
});

Some special values, such as DataTypes.NOW, are also accepted:

sequelize.define('Foo', {
  bar: {
    type: DataTypes.DATETIME,
    defaultValue: DataTypes.NOW,
    // This way, the current date/time will be used to populate this column (at the moment of insertion)
  },
});

12) Data Types
const { DataTypes } = require('sequelize'); // Import the built-in data types

- Strings
DataTypes.STRING; // VARCHAR(255)
DataTypes.STRING(1234); // VARCHAR(1234)
DataTypes.STRING.BINARY; // VARCHAR BINARY
DataTypes.TEXT; // TEXT
DataTypes.TEXT('tiny'); // TINYTEXT
DataTypes.CITEXT; // CITEXT          PostgreSQL and SQLite only.
DataTypes.TSVECTOR; // TSVECTOR

- Boolean
DataTypes.BOOLEAN; // TINYINT(1)

- Numbers
DataTypes.INTEGER; // INTEGER
DataTypes.BIGINT; // BIGINT
DataTypes.BIGINT(11); // BIGINT(11)

DataTypes.FLOAT; // FLOAT
DataTypes.FLOAT(11); // FLOAT(11)
DataTypes.FLOAT(11, 10); // FLOAT(11,10)

DataTypes.REAL; // REAL            PostgreSQL only.
DataTypes.REAL(11); // REAL(11)        PostgreSQL only.
DataTypes.REAL(11, 12); // REAL(11,12)     PostgreSQL only.

DataTypes.DOUBLE; // DOUBLE
DataTypes.DOUBLE(11); // DOUBLE(11)
DataTypes.DOUBLE(11, 10); // DOUBLE(11,10)

DataTypes.DECIMAL; // DECIMAL
DataTypes.DECIMAL(10, 2); // DECIMAL(10,2)

- Unsigned & Zerofill integers - MySQL/MariaDB only

DataTypes.INTEGER.UNSIGNED;
DataTypes.INTEGER.ZEROFILL;
DataTypes.INTEGER.UNSIGNED.ZEROFILL;
// You can also specify the size i.e. INTEGER(10) instead of simply INTEGER
// Same for BIGINT, FLOAT and DOUBLE

- Dates

DataTypes.DATE; // DATETIME for mysql / sqlite, TIMESTAMP WITH TIME ZONE for postgres
DataTypes.DATE(6); // DATETIME(6) for mysql 5.6.4+. Fractional seconds support with up to 6 digits of precision
DataTypes.DATEONLY; // DATE without time

- UUID 
For UUIDs, use DataTypes.UUID. It becomes the UUID data type for PostgreSQL and SQLite, and CHAR(36) for MySQL. 
Sequelize can generate UUIDs automatically for these fields, simply use DataTypes.UUIDV1 or DataTypes.UUIDV4 as the default value:
{
  type: DataTypes.UUID,
  defaultValue: DataTypes.UUIDV4 // Or DataTypes.UUIDV1
}