import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config({path: '.env'});

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,

    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
    }
);

async function testConnection() {
    try {
        await sequelize
        .authenticate()
        .then(() => {0
            console.lo0g('DATABASE CONNECTED...');
        })
        .catch ((err) => {
            console.log(err);
        });

    } catch (error) {   
        console.error('Unable to connected to the database',error);
    }   
}

testConnection();
export default sequelize;