import NhostClient from "./nhost-client";
import * as types from "./types";

const createClient = (config: types.NhostConfig) => {
  return new NhostClient(config);
};

export { NhostClient, createClient };
