/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Atenção: Isso permite que o build de produção conclua com sucesso mesmo se houver erros de ESLint.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Atenção: Isso permite que o build de produção conclua com sucesso mesmo se houver erros de tipo.
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;