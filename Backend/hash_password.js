const bcrypt = require('bcrypt');

// Change this to your desired strong password
const password = 'gladii2004'; 

const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('✅ Your hashed password is ready!');
  console.log('⬇️ Copy this long string and use it in your SQL query:');
  console.log(hash);
});