/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ["pdf-parse", "pdfjs-dist"],
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.externals = config.externals || [];
            config.externals.push({
                "pdfjs-dist/legacy/build/pdf.mjs": "commonjs pdfjs-dist/legacy/build/pdf.mjs",
            });
        }
        return config;
    },
    images: {
        remotePatterns: [],
    },
};

export default nextConfig;
