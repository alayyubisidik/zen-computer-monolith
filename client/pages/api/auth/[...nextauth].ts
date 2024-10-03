import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

interface User {
    id: number;
    full_name: string;
    email: string;
    role: string;
    phone_number: number;
    date_of_birth: string;
    gender: string;
    image: string;
    created_at: string;
    updated_at: string;
}


// Define module augmentation directly in the same file
declare module "next-auth" {
    interface Session {
        user: {
            id: number;
            full_name: string;
            email: string;
            role: string;
            image: string;
        };
    }

    interface User {
        id: number;
        full_name: string;
        email: string;
        role: string;
        image: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: number;
        full_name: string;
        email: string;
        role: string;
        image: string;
    }
}

// Define your options for NextAuth
export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                if (!credentials) return null;

                const res = await fetch(
                    "http://localhost:8000/api/v1/auth/signin",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    }
                );

                const data = await res.json();

                if (res.ok && data?.data) {
                    const user = {
                        id: data.data.id,
                        full_name: data.data.full_name,
                        email: data.data.email,
                        role: data.data.role,
                        image: data.data.image,
                    };
                    return user;
                } else {
                    return null;
                }
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || "",
        }),
    ],
    pages: {
        signIn: "/auth/signin", // Redirect to login page if not authenticated
        newUser: "/", // Redirect new users to home page after login
    },
    session: {
        strategy: "jwt", // Use JWT for session management
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET, // Add secret for JWT
    },
    callbacks: {
        async jwt({ token, account, user }) {
            if (account?.provider == "credentials") {
                token.id = user.id as number;
                token.full_name = user.full_name;
                token.email = user.email;
                token.role = user.role;
                token.image = user.image;
            }
            if (account?.provider == "google") {
                const data = {
                    full_name: user.name,
                    email: user.email,
                    image: user.image,
                    role: "customer",
                };

                if (user.email == "admin@gmail.com") {
                    data.role = "admin";
                }

                const res = await fetch(
                    "http://localhost:8000/api/v1/auth/signin/google",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: data.email,
                            full_name: data.full_name,
                            image: data.image,
                            role: data.role,
                        }),
                    }
                );

                const userResponse: any = await res.json()

                if (res.ok) {
                    token.id = userResponse.data.id;
                    token.email = data.email;
                    token.full_name = data.full_name as string;
                    token.image = data.image;
                    token.role = data.role;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.full_name = token.full_name;
                session.user.email = token.email;
                session.user.image = token.image;
                session.user.role = token.role;
            }
            return session;
        },
    },
};

export default NextAuth(authOptions);
