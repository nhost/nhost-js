import { NhostClient } from '.';
import { NhostClientConstructorParams } from '.';

const createClient = (config: NhostClientConstructorParams) => {
    return new NhostClient(config);
};  

export * from './core';
export {createClient};