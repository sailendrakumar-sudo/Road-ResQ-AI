import { spawn } from 'child_process';

console.log('Starting persistent tunnel supervisor on port 5174...');

function startTunnel() {
  const tunnel = spawn('npx.cmd', ['-y', 'localtunnel', '--port', '5174', '--subdomain', 'road-resq-ai'], {
    shell: true,
    stdio: 'inherit'
  });

  tunnel.on('close', (code) => {
    console.log(`Tunnel process exited with code ${code}. Reconnecting in 3 seconds...`);
    setTimeout(startTunnel, 3000);
  });

  tunnel.on('error', (err) => {
    console.error('Tunnel error:', err);
    setTimeout(startTunnel, 3000);
  });
}

startTunnel();
