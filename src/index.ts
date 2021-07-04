import NhostClient from "./nhost-client";
import * as types from "./types";

const createClient = (config: types.NhostConfig) => {
  console.log("createClient ...");

  return new NhostClient(config);
};

export { NhostClient, createClient };
