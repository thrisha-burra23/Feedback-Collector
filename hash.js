// created this file just to add an admin manually

const bcrypt = require('bcrypt');

(async () => {
  const password = 'admin123'; // Or any secure password you want
  const hash = await bcrypt.hash(password, 10);
  console.log('Admin hashed password:', hash);
})();