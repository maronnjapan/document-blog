import NextAuth from "next-auth"
import KeycloakProvider from "next-auth/providers/keycloak";

const handler = NextAuth({
    providers: [
        KeycloakProvider({
            clientId: 'account',
            clientSecret: 'aikNL4wZvePmQodvKkWqEWBt1AQ4Dspo',
            issuer: 'http://keycloak:8080/realms/DemoRealm',
            requestTokenUrl: 'http://localhost:8080/realms/DemoRealm/protocol/openid-connect/token',
            httpOptions: { timeout: 10000 },
        })
    ],
    callbacks: {
        jwt: async ({ token, user }) => {
            return { ...token, ...user };
        },
        session: async ({ session, token }) => {
            session.user = token;
            return session;
        },
    },
    secret: 'aaaaaaaaa'
})

export { handler as GET, handler as POST }