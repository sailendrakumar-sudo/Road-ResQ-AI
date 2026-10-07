import localtunnel from 'localtunnel';

async function start() {
  console.log('Connecting localtunnel to port 5174...');
  const tunnel = await localtunnel({ port: 5174 });
  console.log('TUNNEL_URL:', tunnel.url);

  tunnel.on('close', () => {
    console.log('Tunnel closed');
  });

  tunnel.on('error', (err) => {
    console.error('Tunnel error:', err);
  });

  // Test fetching it
  try {
    const res = await fetch(tunnel.url, {
      headers: { 'Bypass-Tunnel-Reminder': 'true' }
    });
    console.log('Fetch test status:', res.status);
    const html = await res.text();
    console.log('HTML preview:', html.slice(0, 150));
  } catch (err) {
    console.error('Fetch test error:', err.message);
  }
}

start();
