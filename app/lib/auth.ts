import { FirestoreAdapter } from "@auth/firebase-adapter";
import { firebaseCert } from "./firebase";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google"; // Google OAuth

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  adapter: FirestoreAdapter({
    credential: firebaseCert,
  }),
});

console.log("Redirect URI:", process.env.NEXTAUTH_URL + "/api/auth/callback/google");