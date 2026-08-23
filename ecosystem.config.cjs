// Configuração do PM2 para manter o app Brasiltec no ar no VPS.
// Uso: pm2 startOrRestart ecosystem.config.cjs --env production
module.exports = {
  apps: [
    {
      name: "brasiltec",
      script: "./dist/server/server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env_file: ".env",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
