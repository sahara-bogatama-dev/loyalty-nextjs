"use server";

import { signIn, signOut } from "@/lib/auth";

import { CredentialsSignin } from "next-auth";
import _ from "lodash";

import { createServerAction, ServerActionError } from "@/lib/action-utils";

//region action login
const login = createServerAction(
  async ({ email, password }: { email: any; password: any }) => {
    try {
      const auth = await signIn("credentials", {
        redirect: false,
        redirectTo: "/",
        email,
        password,
      });

      return auth;
    } catch (error) {
      const someError = error as CredentialsSignin;

      const cause = someError.cause as unknown as { err: string };
      throw new ServerActionError(cause?.err);
    }
  }
);
//endregion

//region action logout
const logout = createServerAction(async () => {
  await signOut({ redirect: true, redirectTo: "/" });
});
//endregion

export { login, logout };
