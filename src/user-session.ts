import jwt_decode from "jwt-decode";
import { Session, JWTClaims, JWTHasuraClaims } from "./types";

export default class UserSession {
  private session: Session | null;
  private claims: JWTHasuraClaims | null;

  constructor() {
    this.session = null;
    this.claims = null;
  }

  public setSession(session: Session) {
    this.session = session;

    console.log("session:");
    console.log(session);

    const jwtTokenDecoded: JWTClaims = jwt_decode(session.accessToken);
    this.claims = jwtTokenDecoded["https://hasura.io/jwt/claims"];

    console.log(this.claims);
  }

  public clearSession() {
    this.session = null;
    this.claims = null;
  }

  public getSession(): Session | null {
    return this.session;
  }

  public getClaim(claim: string): string | string[] | null {
    if (this.claims) {
      return this.claims[claim];
    } else {
      return null;
    }
  }
}
