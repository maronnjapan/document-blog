import { withAuth } from "next-auth/middleware"

export default withAuth(
    // `withAuth` augments your `Request` with the user's token.
    function middleware(req) {
        console.log(req.nextauth.token)
    },
    {
        callbacks: {
            authorized: ({ token }) => {
                console.log('tokenですね始まり', token, 'tokenですね')
                return true
            },
        },
        secret: 'secrete-key'
    },
)

export const config = { matcher: ["/:path*"] }