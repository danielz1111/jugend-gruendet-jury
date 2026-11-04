/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'www.landheim-ammersee.de',
      port: '',
      pathname: '/sites/default/files/media/images/**',
      search: ''
    }],
    formats: ['image/webp'],
    qualities: [75]
  }
};

export default nextConfig;
