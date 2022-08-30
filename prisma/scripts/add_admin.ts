import { prisma } from '../../prisma';
import { User } from '@prisma/client';

console.log('\nAdding admin user');

// Get the email and name from the .env.local file
const name = process.env.ADMIN_NAME;
const email = process.env.ADMIN_EMAIL;

// The circumstances (no toplevel await) of this script don't allow for async/await which is why it uses promises

if (!name || !email) {
  console.log(' ! Please fill in the admin email and name in the .env.local file');
  console.log(' ! No admin was added');
  process.exit(1);
}

console.log(` + Credentials from .env.local: name \'${name}\' and email \'${email}\'`);

// Check if the name and email aren't already used
prisma.user
  .findFirst({
    where: {
      name: {
        equals: name
      }
    }
  })
  .then((userWithName: User | null) => {
    if (userWithName) {
      console.log(` ! User with name \'${name}\' already exists!`);
      process.exit(0);
    }

    prisma.user
      .findFirst({
        where: {
          email: {
            equals: email
          }
        }
      })
      .then((userWithEmail: User | null) => {
        if (userWithEmail) {
          console.log(` ! User with email \'${email}\' already exists!`);
          process.exit(0);
        }

        try {
          console.log(` + Creating admin`);
          prisma.user
            .create({
              data: {
                email: email,
                name: name,
                role: 'superadmin'
              }
            })
            .then(() => {
              console.log(' ! Admin added successfully!');
              process.exit(0);
            });
        } catch (e) {
          console.log('! Unknown error occurred!');
          process.exit(1);
        }
      });
  });
