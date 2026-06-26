const mysql = require('mysql2/promise');
const http = require('http');

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Ranjupapa@34',
      database: 'dinemaster_auth'
    });

    const [rows] = await connection.execute('SELECT id, email, role, loyalty_points FROM users WHERE role = "CUSTOMER"');
    const orders = await fetchJson('http://localhost:8082/api/orders');

    for (const user of rows) {
      const totalSpent = orders.filter(o => o.userId === String(user.id)).reduce((sum, o) => sum + (o.total || 0), 0);
      const calculatedPoints = Math.floor(totalSpent / 10); // 1 point per ₹10 spent
      
      const currentPoints = user.loyalty_points || 0;
      
      if (currentPoints !== calculatedPoints) {
        console.log(`User ${user.email}: Spent ${totalSpent}, Calculated: ${calculatedPoints}, Current: ${currentPoints}. Updating to ${calculatedPoints}...`);
        await connection.execute('UPDATE users SET loyalty_points = ? WHERE id = ?', [calculatedPoints, user.id]);
        console.log(`Updated user ${user.email} successfully in DB.`);
      } else {
        console.log(`User ${user.email}: Spent ${totalSpent}, Calculated: ${calculatedPoints}, Current: ${currentPoints}. No update needed.`);
      }
    }
    console.log("Finished updating loyalty points directly in the DB.");
  } catch(e) {
    console.error(e);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

run();
