/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:3001/api/:path*',
            },
            {
                source: '/pdfs/:path*',
                destination: 'http://localhost:3001/pdfs/:path*',
            },
        ]
    },
}

module.exports = nextConfig
