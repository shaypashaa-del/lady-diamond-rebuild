import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // The local Postgres dev server (`prisma dev`) accepts far fewer concurrent
  // connections than a real deployment target; capping build worker count keeps
  // total Prisma pool connections (workers × adapter `max`) under that ceiling.
  experimental: {
    cpus: 2,
  },
};

export default withNextIntl(nextConfig);
