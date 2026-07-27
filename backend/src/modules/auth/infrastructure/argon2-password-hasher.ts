import * as argon2 from "argon2";
import type { PasswordHasher } from "../application/ports/password-hasher.port.js";

export class Argon2PasswordHasher implements PasswordHasher {
  hash(plainPassword: string): Promise<string> {
    return argon2.hash(plainPassword);
  }

  verify(hash: string, plainPassword: string): Promise<boolean> {
    return argon2.verify(hash, plainPassword);
  }
}
