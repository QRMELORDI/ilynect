const os = require('os');

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

console.log('\n--- ILYNECT BACKEND HELPER ---');
console.log(`Local IP Address: ${getLocalIp()}`);
console.log(`Port: 3001`);
console.log(`Use this URL in your app settings: http://${getLocalIp()}:3001`);
console.log('---------------------------------\n');
