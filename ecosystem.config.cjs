// Configuração do PM2 para manter o app Brasiltec no ar no VPS.
// Uso: pm2 startOrRestart ecosystem.config.cjs --env production
module.exports = {
  apps: [
    {
      name: "brasiltec",
      script: "./.output/server/index.mjs",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      node_args: "--env-file-if-exists=.env",
      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};
