/**
 * Seed script: populates the database with sample users, projects, tasks, and messages.
 * Run with: node scripts/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Message = require('../models/Message');

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('Clearing existing data...');
  await User.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});
  await Message.deleteMany({});

  // Create sample users
  console.log('Creating sample users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    passwordHash: passwordHash,
    role: 'admin'
  });

  const ngoUser1 = await User.create({
    name: 'Green Earth Foundation',
    email: 'ngo1@example.com',
    passwordHash: passwordHash,
    role: 'ngo',
    organizationName: 'Green Earth Foundation'
  });

  const ngoUser2 = await User.create({
    name: 'Education For All',
    email: 'ngo2@example.com',
    passwordHash: passwordHash,
    role: 'ngo',
    organizationName: 'Education For All'
  });

  const partnerUser1 = await User.create({
    name: 'John Developer',
    email: 'partner1@example.com',
    passwordHash: passwordHash,
    role: 'partner',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB']
  });

  const partnerUser2 = await User.create({
    name: 'Sarah Designer',
    email: 'partner2@example.com',
    passwordHash: passwordHash,
    role: 'partner',
    skills: ['UI/UX Design', 'Figma', 'HTML', 'CSS']
  });

  const partnerUser3 = await User.create({
    name: 'Mike Fullstack',
    email: 'partner3@example.com',
    passwordHash: passwordHash,
    role: 'partner',
    skills: ['Python', 'Django', 'React', 'PostgreSQL', 'AWS']
  });

  console.log('Created 6 users (1 admin, 2 NGOs, 3 partners)');

  // Create sample projects
  console.log('Creating sample projects...');

  const project1 = await Project.create({
    title: 'Community Health Tracking App',
    description: 'We need a mobile-friendly web application to track health metrics for rural communities. The app should allow health workers to input data offline and sync when connected.',
    skillsNeeded: ['React', 'Node.js', 'MongoDB', 'PWA'],
    status: 'open',
    timeline: '3 months',
    createdBy: ngoUser1._id,
    collaborators: [partnerUser1._id],
    interests: [
      { partner: partnerUser1._id, message: 'I have experience building PWAs and would love to help with this project.' }
    ]
  });

  const project2 = await Project.create({
    title: 'Online Learning Platform',
    description: 'Building an e-learning platform for underprivileged students. Need features like video lessons, quizzes, and progress tracking.',
    skillsNeeded: ['React', 'Python', 'Django', 'PostgreSQL'],
    status: 'in_progress',
    timeline: '6 months',
    createdBy: ngoUser2._id,
    collaborators: [partnerUser3._id]
  });

  const project3 = await Project.create({
    title: 'Donation Management System',
    description: 'A system to track donations, generate receipts, and manage donor relationships. Should integrate with payment gateways.',
    skillsNeeded: ['Node.js', 'React', 'Payment Integration'],
    status: 'open',
    timeline: '2 months',
    createdBy: ngoUser1._id,
    interests: [
      { partner: partnerUser1._id, message: 'I can help with the backend and payment integration.' },
      { partner: partnerUser3._id, message: 'Interested in contributing to this meaningful project.' }
    ]
  });

  const project4 = await Project.create({
    title: 'NGO Website Redesign',
    description: 'Our current website is outdated. We need a modern, responsive design that better communicates our mission and makes it easy for supporters to get involved.',
    skillsNeeded: ['UI/UX Design', 'HTML', 'CSS', 'JavaScript'],
    status: 'open',
    timeline: '1 month',
    createdBy: ngoUser2._id,
    interests: [
      { partner: partnerUser2._id, message: 'I specialize in NGO website designs and would love to help!' }
    ]
  });

  console.log('Created 4 projects');

  // Create sample tasks
  console.log('Creating sample tasks...');

  await Task.create({
    project: project2._id,
    title: 'Design database schema',
    description: 'Create the database schema for users, courses, lessons, and progress tracking.',
    status: 'completed',
    createdBy: ngoUser2._id,
    assignedTo: partnerUser3._id,
    dueDate: new Date('2026-01-15')
  });

  await Task.create({
    project: project2._id,
    title: 'Build authentication system',
    description: 'Implement user registration, login, and password reset functionality.',
    status: 'in_progress',
    createdBy: ngoUser2._id,
    assignedTo: partnerUser3._id,
    dueDate: new Date('2026-01-20')
  });

  await Task.create({
    project: project2._id,
    title: 'Create video player component',
    description: 'Build a responsive video player that supports multiple resolutions and tracks viewing progress.',
    status: 'todo',
    createdBy: ngoUser2._id,
    dueDate: new Date('2026-02-01')
  });

  await Task.create({
    project: project1._id,
    title: 'Setup project structure',
    description: 'Initialize the React project with required dependencies and folder structure.',
    status: 'completed',
    createdBy: ngoUser1._id,
    assignedTo: partnerUser1._id,
    dueDate: new Date('2026-01-10')
  });

  console.log('Created 4 tasks');

  // Create sample messages
  console.log('Creating sample messages...');

  await Message.create({
    project: project2._id,
    sender: ngoUser2._id,
    recipient: partnerUser3._id,
    content: 'Hi Mike! Thanks for joining the project. Can we schedule a call to discuss the requirements?'
  });

  await Message.create({
    project: project2._id,
    sender: partnerUser3._id,
    recipient: ngoUser2._id,
    content: 'Of course! I am available tomorrow afternoon. Would 2 PM work for you?'
  });

  await Message.create({
    project: project2._id,
    sender: ngoUser2._id,
    recipient: partnerUser3._id,
    content: 'Perfect! I will send you a meeting link. Looking forward to it!'
  });

  await Message.create({
    project: project1._id,
    sender: ngoUser1._id,
    recipient: partnerUser1._id,
    content: 'Welcome to the project, John! The project brief is attached. Let me know if you have questions.'
  });

  console.log('Created 4 messages');

  // Summary
  console.log('\n========== SEED COMPLETE ==========');
  console.log('Sample login credentials (all use password: password123):');
  console.log('');
  console.log('Admin:');
  console.log('  Email: admin@example.com');
  console.log('');
  console.log('NGOs:');
  console.log('  Email: ngo1@example.com (Green Earth Foundation)');
  console.log('  Email: ngo2@example.com (Education For All)');
  console.log('');
  console.log('Tech Partners:');
  console.log('  Email: partner1@example.com (John Developer)');
  console.log('  Email: partner2@example.com (Sarah Designer)');
  console.log('  Email: partner3@example.com (Mike Fullstack)');
  console.log('====================================\n');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
