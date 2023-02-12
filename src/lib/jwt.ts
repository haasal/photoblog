import { Err, Ok, Result } from "./result";
import { getEnv } from "./util";
import * as jwt from "jsonwebtoken";

export interface Claims {
  collections: Array<string>;
}

function isClaims(claims: any): claims is Claims {
  return (
    typeof claims.collections == "object" &&
    typeof claims.collections[0] == "string"
  );
}

const secret = getEnv("SECRET_KEY");
const expiration = "1h";

export function genToken(collection: string) {
  const claims: Claims = { collections: [collection] };
  return jwt.sign(claims, secret, { expiresIn: expiration });
}

export function appendCollection(collections: string[], collection: string) {
  collections.push(collection);
  const claims: Claims = { collections: collections };
  return jwt.sign(claims, secret, { expiresIn: expiration });
}

export function decodeToken(token: string): Result<Claims> {
  let tokenClaims;
  try {
    tokenClaims = jwt.verify(token, secret);
  } catch (err) {
    return Err("failed verification: " + err);
  }

  if (!isClaims(tokenClaims)) {
    return Err("invalid claims format");
  }

  return Ok(tokenClaims);
}
