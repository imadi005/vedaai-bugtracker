require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  // Create users
  const password = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@vedaai.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@vedaai.com', password, role: 'ADMIN' },
  });

  const pm = await prisma.user.upsert({
    where: { email: 'pm@vedaai.com' },
    update: {},
    create: { name: 'Product Manager', email: 'pm@vedaai.com', password, role: 'PM' },
  });

  const dev = await prisma.user.upsert({
    where: { email: 'dev@vedaai.com' },
    update: {},
    create: { name: 'Developer One', email: 'dev@vedaai.com', password, role: 'DEVELOPER' },
  });

  const qa = await prisma.user.upsert({
    where: { email: 'qa@vedaai.com' },
    update: {},
    create: { name: 'QA Tester', email: 'qa@vedaai.com', password, role: 'QA' },
  });

  // Create sample bugs
  const bugs = [
    {
      title: 'Login page crashes on mobile Safari',
      description: 'When users try to login on iPhone Safari 17+, the page crashes after entering password.',
      severity: 'HIGH',
      status: 'OPEN',
      module: 'Authentication',
      category: 'UI Bug',
      reporterId: qa.id,
      assigneeId: dev.id,
    },
    {
      title: 'Dashboard stats not refreshing in real time',
      description: 'The dashboard bug count numbers are stale and do not update without a page refresh.',
      severity: 'MEDIUM',
      status: 'IN_PROGRESS',
      module: 'Dashboard',
      category: 'Feature Bug',
      reporterId: pm.id,
      assigneeId: dev.id,
    },
    {
      title: 'File upload limit error message unclear',
      description: 'When file exceeds 10MB, the error message shown is generic and not helpful.',
      severity: 'LOW',
      status: 'FIXED',
      module: 'Attachments',
      category: 'UX Bug',
      reporterId: qa.id,
      assigneeId: dev.id,
    },
    {
      title: 'Email notifications not sending for REOPENED bugs',
      description: 'When a bug is reopened, the assigned developer does not receive an email notification.',
      severity: 'HIGH',
      status: 'OPEN',
      module: 'Notifications',
      category: 'Feature Bug',
      reporterId: admin.id,
      assigneeId: dev.id,
    },
  ];

  for (const bugData of bugs) {
    await prisma.bug.create({ data: bugData });
  }

  console.log('✅ Seed complete!');
  console.log('');
  console.log('👤 Test accounts (all passwords: password123):');
  console.log('   admin@vedaai.com  → ADMIN');
  console.log('   pm@vedaai.com     → PM');
  console.log('   dev@vedaai.com    → DEVELOPER');
  console.log('   qa@vedaai.com     → QA');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
