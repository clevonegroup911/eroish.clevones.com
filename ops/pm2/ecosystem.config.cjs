module.exports = {
  apps: [
    {
      name: "eroish-clevones-com",
      cwd: "/home/clevones/apps/eroish.clevones.com",
      script: "node_modules/next/dist/bin/next",
      args: "start -H 127.0.0.1 -p 3001",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "3001",
      },
    },
  ],
};
