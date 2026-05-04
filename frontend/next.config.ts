const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "djocykww938vs.cloudfront.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "igtfmedia.s3.us-east-2.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "igtfmedia.s3.amazonaws.com",
        pathname: "/**",
      }
    ],
  },
};

export default nextConfig;
