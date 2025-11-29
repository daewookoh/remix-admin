const bcrypt = require('bcryptjs');

const testPassword = 'test123';
const hashedPassword = '$2a$10$zuxZF1VS38Ya0pmBd58fk./abWKf3NfM4WMzTHF2a9lgN7/pvsDke';

async function test() {
  console.log('Testing password:', testPassword);
  console.log('Against hash:', hashedPassword);

  const isValid = await bcrypt.compare(testPassword, hashedPassword);
  console.log('Password match:', isValid);

  if (!isValid) {
    console.log('\nTrying with different passwords:');
    const passwords = ['Test123', 'TEST123', 'test', '123456', 'password'];
    for (const pwd of passwords) {
      const match = await bcrypt.compare(pwd, hashedPassword);
      console.log(`  ${pwd}: ${match}`);
    }
  }
}

test().catch(console.error);
