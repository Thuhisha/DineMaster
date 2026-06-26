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

async function addLoyalty(userId, pointsToAdd) {
  return new Promise((resolve, reject) => {
    if (pointsToAdd <= 0) return resolve();

    const data = JSON.stringify({ points: pointsToAdd });
    const req = http.request(`http://localhost:8081/api/auth/user/${userId}/loyalty`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      res.on('data', () => {});
      res.on('end', () => resolve(res.statusCode));
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  try {
    const users = await fetchJson('http://localhost:8081/api/auth/users');
    const orders = await fetchJson('http://localhost:8082/api/orders');

    for (const user of users) {
      if (user.role !== 'CUSTOMER') continue;

      const totalSpent = orders.filter(o => o.userId === String(user.id)).reduce((sum, o) => sum + (o.total || 0), 0);
      const calculatedPoints = Math.floor(totalSpent / 100) * 5;
      
      const currentPoints = user.loyaltyPoints || 0;
      const pointsToAdd = calculatedPoints - currentPoints;
      
      if (pointsToAdd > 0) {
        console.log(`User ${user.email}: Spent ${totalSpent}, Calculated: ${calculatedPoints}, Current: ${currentPoints}. Adding ${pointsToAdd} points...`);
        await addLoyalty(user.id, pointsToAdd);
        console.log(`Updated user ${user.email} successfully.`);
      } else {
        console.log(`User ${user.email}: Spent ${totalSpent}, Calculated: ${calculatedPoints}, Current: ${currentPoints}. No update needed.`);
      }
    }
    console.log("Finished updating loyalty points.");
  } catch(e) {
    console.error(e);
  }
}

run();
