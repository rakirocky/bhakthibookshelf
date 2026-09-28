// pm2 process definition for production (/data/bhakthi-app).
//
// Two `next start` workers in pm2 cluster mode, one per CPU core of the
// c7i-flex.large (2 vCPU). pm2's cluster module shares port 3010 between
// them and round-robins requests. Deploy with `pm2 reload bhakthi-app`:
// workers restart one at a time, so the site stays up (fork mode had a few
// seconds of downtime on every restart).
//
// Anything kept in process memory is per-worker — see the notes in
// app/lib/services/book-service.ts (no cross-request data cache) and
// requestRateLimitService.ts. Env comes from .env.local, which Next loads.
module.exports = {
  apps: [
    {
      name: "bhakthi-app",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3010",
      exec_mode: "cluster",
      instances: 2,
      env: { NODE_ENV: "production" },
      // let in-flight requests finish before a worker is killed on reload
      kill_timeout: 10000,
      max_memory_restart: "1G",
    },
  ],
};
