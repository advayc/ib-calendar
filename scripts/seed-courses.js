const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const courses = [
  { name: 'DP2 HL Mathematics', grade: 'DP2', color: '#3b82f6' },
  { name: 'DP2 HL English', grade: 'DP2', color: '#ef4444' },
  { name: 'DP2 HL Economics', grade: 'DP2', color: '#10b981' },
  { name: 'DP2 TOK', grade: 'DP2', color: '#f59e0b' },
  { name: 'DP2 SL French', grade: 'DP2', color: '#8b5cf6' },
  { name: 'DP2 HL Biology', grade: 'DP2', color: '#06b6d4' },
  { name: 'DP2 HL Chemistry', grade: 'DP2', color: '#ec4899' },
  { name: 'DP2 HL Psychology', grade: 'DP2', color: '#f97316' },
];

async function main() {
  console.log('Seeding database with courses...');

  // Delete existing courses
  await prisma.course.deleteMany({});
  console.log('Cleared existing courses');

  // Create new courses
  for (const course of courses) {
    const slug = course.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const created = await prisma.course.create({
      data: {
        name: course.name,
        slug,
        grade: course.grade,
        color: course.color,
      },
    });
    console.log(`Created: ${created.name}`);
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
