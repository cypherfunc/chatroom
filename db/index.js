'use strict';

import chalk from 'chalk';
import Sequelize from 'sequelize';
import childProcess from 'child_process';

const dbName = process.env.DATABASE_NAME || 'chatroom';

const url = process.env.DATABASE_URL || `postgres://localhost:5432/${dbName}`;

console.log(chalk.yellow(`Opening db connection to ${url}`));

const db = new Sequelize(url, {
    native: true,
    define: {
        freezeTableName: false,
        timestamps: true
    }
});

import ExampleModel from './example/model.js';

// Example1.belongsTo(Example2, { as: 'otherExample' });
// Example1.belongsToMany(Example2, { through: '1to2' });
// Example1.hasMany(Example2);
// Example1.hasOne(Example2);


// sync the db, creating it if necessary
function sync(retries = 0, maxRetries = 5) {
    return db.sync()
             .then(() => console.log(`Synced models to db ${url}`))
             .catch(err => {
                 // Don't auto-create in production, or if we've retried too many times.
                 if ((process.env.NODE_ENV === 'production') || retries > maxRetries) {
                     console.error(chalk.red(`********** database error ***********\n
                                             Couldn't connect to ${url}\n
                                             ${err}\n
                                             *************************************`));
                 } else {
                     // Otherwise, autocreate
                     console.log(`${retries ? `[retry ${retries}]` : ''} Creating database ${dbName}...`);
                     return new Promise((resolve, reject) => childProcess.exec(`createdb "${dbName}"`, resolve))
                                    .then( () => sync(true, retries + 1) );
                 }
        
             });
}

db.didSync = sync();

export default db;