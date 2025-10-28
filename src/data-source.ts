import "reflect-metadata"; 
import { DataSource } from "typeorm"; 

import { User } from "./entities/User";
import { Professor } from "./entities/Professor";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "data/database.sqlite",
    synchronize: true,
    logging: true,
    entities: [User, Professor],
    migrations: [],
    subscribers: [],
});