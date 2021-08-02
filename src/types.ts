export interface NhostConfig {
  baseURL: string;
  refreshIntervalTime?: number | null;
  clientStorage?: ClientStorage;
  clientStorageType?: string;
  ssr?: boolean;
}

export interface AuthConfig {
  baseURL: string;
  refreshIntervalTime: number | null;
  clientStorage: ClientStorage;
  clientStorageType: string;
  ssr?: boolean;
}

export interface ClientStorage {
  // custom
  // localStorage
  // AsyncStorage
  // https://react-native-community.github.io/async-storage/docs/usage
  setItem?: (key: string, value: string) => void;
  getItem?: (key: string) => any;
  removeItem?: (key: string) => void;

  // capacitor
  set?: (options: { key: string; value: string }) => void;
  get?: (options: { key: string }) => any;
  remove?: (options: { key: string }) => void;

  // expo-secure-storage
  setItemAsync?: (key: string, value: string) => void;
  getItemAsync?: (key: string) => any;
  deleteItemAsync?: (key: string) => void;
}

// supported client storage types
export type ClientStorageType =
  | "web"
  | "react-native"
  | "capacitor"
  | "expo-secure-storage"
  | "custom";

export interface LoginData {
  mfa?: boolean;
  ticket?: string;
}

export interface Headers {
  Authorization?: string;
}

export type Provider =
  | "apple"
  | "facebook"
  | "github"
  | "google"
  | "linkedin"
  | "spotify"
  | "twitter"
  | "windowslive";

export interface UserCredentials {
  email?: string;
  password?: string;
  provider?: Provider;
  options?: {
    userData?: any;
    defaultRole?: string;
    allowedRoles?: string[];
  };
}
export interface Session {
  accessToken: string;
  accessTokenExpiresIn: number;
  user: User;
  refreshToken?: string; // not present if useCookie
}

export interface User {
  id: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  profile?: UserProfile;
}

export interface UserProfile {
  [claim: string]: unknown;
}

export interface JWTHasuraClaims {
  "x-hasura-allowed-roles": string[];
  "x-hasura-default-role": string;
  "x-hasura-user-id": string;
  [claim: string]: string | string[];
}

// https://hasura.io/docs/1.0/graphql/core/auth/authentication/jwt.html#the-spec
export interface JWTClaims {
  sub?: string;
  iat?: number;
  "https://hasura.io/jwt/claims": JWTHasuraClaims;
}
