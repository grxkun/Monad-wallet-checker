#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';

// Simple Railway health check endpoint
const PORT = process.env.PORT || 3001;

console.log(chalk.blue('🛡️ Monad Security Monitor - CLI Tools'));
console.log(chalk.green(`✅ Service healthy on port ${PORT}`));
console.log(chalk.yellow('Available commands:'));
console.log('  - check <address>    : Check wallet for delegations');
console.log('  - monitor <address>  : Real-time monitoring');
console.log('  - trace <address>    : Trace attack sources');

// Keep the process alive for Railway
setInterval(() => {
  console.log(chalk.gray(`[${new Date().toISOString()}] Service running...`));
}, 30000);

// Basic HTTP server for Railway health checks
import { createServer } from 'http';

const server = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy',
      service: 'Monad Security Monitor CLI',
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Monad Security Monitor CLI - Use command line tools for security analysis');
  }
});

server.listen(PORT, () => {
  console.log(chalk.green(`🚀 Health check server running on port ${PORT}`));
  console.log(chalk.blue(`Visit: http://localhost:${PORT}/health`));
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log(chalk.yellow('🛑 Received SIGTERM, shutting down gracefully...'));
  server.close(() => {
    console.log(chalk.green('✅ Server closed'));
    process.exit(0);
  });
});