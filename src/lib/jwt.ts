import * as jwt from "jsonwebtoken"
import { getEnv } from "./util"

const secret = getEnv("SECRET_KEY")

export interface Collection {
    bucket: string,
    files: Array<string>
}

export interface Claims {
    collections: Array<Collection> 
}

export function genToken(claims: Claims, exp: string = "1h"): string {
    return jwt.sign(claims, secret, {expiresIn: exp})
}

export function appendCollection(collections: Array<Collection>, collection: Collection, exp: string = "1h"):string {
    collections.push(collection)

    const newClaims: Claims = {
        collections: collections 
    } 

    return jwt.sign(newClaims, secret, {expiresIn: exp})
}

export function verifyToken(token: string): jwt.JwtPayload {
    // not a very good verification
    const claims = jwt.verify(token, secret)
    if (typeof claims == "string") {
        throw "token is string (not object)"
    }

    return claims  
}

