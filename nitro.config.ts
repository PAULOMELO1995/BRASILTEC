import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  // Keep server middleware initialization in one module to avoid cyclic chunk imports.
  inlineDynamicImports: true,
});
