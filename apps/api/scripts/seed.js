import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import crypto from 'node:crypto';
import util from 'node:util';

const pbkdf2 = util.promisify(crypto.pbkdf2);
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function generateHash(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await pbkdf2(password, salt, 1000, 64, 'sha256');
  return { hash: hash.toString('hex'), salt };
}

// IT-related seed data
const publishers = [
  { name: "O'Reilly Media", website: 'https://oreilly.com', slug: 'oreilly-media' },
  { name: 'Manning Publications', website: 'https://manning.com', slug: 'manning-publications' },
  { name: 'Packt Publishing', website: 'https://packtpub.com', slug: 'packt-publishing' },
  { name: 'Addison-Wesley', website: 'https://informit.com', slug: 'addison-wesley' },
  { name: 'Apress', website: 'https://apress.com', slug: 'apress' },
  { name: 'Pragmatic Bookshelf', website: 'https://pragprog.com', slug: 'pragmatic-bookshelf' },
  { name: 'No Starch Press', website: 'https://nostarch.com', slug: 'no-starch-press' },
  { name: 'MIT Press', website: 'https://mitpress.mit.edu', slug: 'mit-press' }
];

const categories = [
  { name: 'Programming Languages', slug: 'programming-languages' },
  { name: 'Web Development', slug: 'web-development' },
  { name: 'DevOps & Cloud', slug: 'devops-cloud' },
  { name: 'Data Science', slug: 'data-science' },
  { name: 'Machine Learning', slug: 'machine-learning' },
  { name: 'Software Architecture', slug: 'software-architecture' },
  { name: 'Database Systems', slug: 'database-systems' },
  { name: 'Cybersecurity', slug: 'cybersecurity' },
  { name: 'Operating Systems', slug: 'operating-systems' },
  { name: 'Mobile Development', slug: 'mobile-development' },
  { name: 'Game Development', slug: 'game-development' },
  { name: 'Network Engineering', slug: 'network-engineering' }
];

const authors = [
  {
    name: 'Robert C. Martin',
    short_biography: 'Software engineer and author known as Uncle Bob',
    biography:
      'Robert Cecil Martin, known as Uncle Bob, is an American software engineer and author. He is a co-author of the Agile Manifesto and has authored many books on software development.',
    date_of_birth: new Date('1952-12-05'),
    nationality: 'American',
    slug: 'robert-c-martin'
  },
  {
    name: 'Martin Fowler',
    short_biography: 'British software developer and author',
    biography:
      'Martin Fowler is a British software developer, author and international public speaker on software development. He is known for his work on enterprise software architecture and agile software development.',
    date_of_birth: new Date('1963-12-18'),
    nationality: 'British',
    slug: 'martin-fowler'
  },
  {
    name: 'Eric Evans',
    short_biography: 'Software design consultant and domain-driven design pioneer',
    biography:
      'Eric Evans is the author of Domain-Driven Design: Tackling Complexity in Software, which established domain-driven design as an effective approach to software development.',
    date_of_birth: new Date('1960-01-01'),
    nationality: 'American',
    slug: 'eric-evans'
  },
  {
    name: 'Erich Gamma',
    short_biography: 'Swiss computer scientist and Design Patterns author',
    biography:
      'Erich Gamma is a Swiss computer scientist and one of the Gang of Four authors of the influential software engineering book Design Patterns: Elements of Reusable Object-Oriented Software.',
    date_of_birth: new Date('1961-03-13'),
    nationality: 'Swiss',
    slug: 'erich-gamma'
  },
  {
    name: 'Kent Beck',
    short_biography: 'American software engineer and Extreme Programming creator',
    biography:
      'Kent Beck is an American software engineer and the creator of extreme programming. He is known for pioneering test-driven development and agile software development methodologies.',
    date_of_birth: new Date('1961-03-31'),
    nationality: 'American',
    slug: 'kent-beck'
  },
  {
    name: 'Joshua Bloch',
    short_biography: 'Software engineer and Java Collections Framework designer',
    biography:
      'Joshua Bloch is an American software engineer and a technology author. He led the design and implementation of numerous Java platform features.',
    date_of_birth: new Date('1961-08-28'),
    nationality: 'American',
    slug: 'joshua-bloch'
  },
  {
    name: 'Kyle Simpson',
    short_biography: 'JavaScript educator and author',
    biography:
      "Kyle Simpson is a JavaScript educator, author of the You Don't Know JS book series, and open web evangelist. He specializes in JavaScript and web development.",
    date_of_birth: new Date('1980-01-01'),
    nationality: 'American',
    slug: 'kyle-simpson'
  },
  {
    name: 'Andrew Hunt',
    short_biography: 'Co-author of The Pragmatic Programmer',
    biography:
      'Andrew Hunt is a programmer and author. He co-authored The Pragmatic Programmer with David Thomas, which became one of the most influential books in software development.',
    date_of_birth: new Date('1964-01-01'),
    nationality: 'American',
    slug: 'andrew-hunt'
  },
  {
    name: 'David Thomas',
    short_biography: 'Co-author of The Pragmatic Programmer',
    biography:
      'David Thomas is a computer programmer and author. Along with Andrew Hunt, he co-authored The Pragmatic Programmer and founded The Pragmatic Bookshelf publishing company.',
    date_of_birth: new Date('1956-01-01'),
    nationality: 'American',
    slug: 'david-thomas'
  },
  {
    name: 'Gene Kim',
    short_biography: 'DevOps researcher and author',
    biography:
      'Gene Kim is an award-winning CTO, researcher, and author. He is the author of The Phoenix Project, The DevOps Handbook, and other influential books on DevOps.',
    date_of_birth: new Date('1967-01-01'),
    nationality: 'American',
    slug: 'gene-kim'
  },
  {
    name: 'Michael Feathers',
    short_biography: 'Software consultant and legacy code expert',
    biography:
      'Michael Feathers is a software consultant specializing in legacy code and software design. He is the author of Working Effectively with Legacy Code.',
    date_of_birth: new Date('1962-01-01'),
    nationality: 'American',
    slug: 'michael-feathers'
  },
  {
    name: 'Sam Newman',
    short_biography: 'Microservices expert and author',
    biography:
      'Sam Newman is a technologist, author, and speaker. He is known for his work on microservices architecture and is the author of Building Microservices.',
    date_of_birth: new Date('1975-01-01'),
    nationality: 'British',
    slug: 'sam-newman'
  }
];

const books = [
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    description:
      "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. This book presents the best practices and patterns for writing clean, maintainable code.",
    isbn: '978-0132350884',
    published_at: new Date('2008-08-01'),
    authorSlugs: ['robert-c-martin'],
    categorySlugs: ['programming-languages', 'software-architecture'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'Refactoring: Improving the Design of Existing Code',
    description:
      "Martin Fowler's classic book on refactoring, showing how to improve the design of existing code through small, behavior-preserving transformations.",
    isbn: '978-0134757599',
    published_at: new Date('2018-11-30'),
    authorSlugs: ['martin-fowler'],
    categorySlugs: ['programming-languages', 'software-architecture'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'Domain-Driven Design: Tackling Complexity in the Heart of Software',
    description:
      'The seminal book on domain-driven design, presenting a set of design practices, techniques, and principles for creating software that reflects business complexity.',
    isbn: '978-0321125217',
    published_at: new Date('2003-08-30'),
    authorSlugs: ['eric-evans'],
    categorySlugs: ['software-architecture'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    description:
      'The classic Gang of Four book that presents 23 design patterns for creating flexible, elegant, and ultimately reusable software designs.',
    isbn: '978-0201633610',
    published_at: new Date('1994-10-31'),
    authorSlugs: ['erich-gamma'],
    categorySlugs: ['programming-languages', 'software-architecture'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'Test Driven Development: By Example',
    description:
      'Kent Beck shows how TDD can dramatically reduce defect rates and lead to better design. Learn to write tests before code and develop with confidence.',
    isbn: '978-0321146530',
    published_at: new Date('2002-11-18'),
    authorSlugs: ['kent-beck'],
    categorySlugs: ['programming-languages', 'software-architecture'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'Effective Java',
    description:
      "Joshua Bloch's essential guide to the Java programming language, containing 90 rules and best practices for writing clear, robust, and efficient Java code.",
    isbn: '978-0134685991',
    published_at: new Date('2017-12-27'),
    authorSlugs: ['joshua-bloch'],
    categorySlugs: ['programming-languages'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: "You Don't Know JS: Scope & Closures",
    description:
      'Deep dive into the core mechanisms of JavaScript scope and closures. This book demystifies the often misunderstood concepts in JavaScript.',
    isbn: '978-1449335588',
    published_at: new Date('2014-03-24'),
    authorSlugs: ['kyle-simpson'],
    categorySlugs: ['programming-languages', 'web-development'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'The Pragmatic Programmer: Your Journey to Mastery',
    description:
      'One of the most influential books in software development, covering topics that are essential for programmers, from personal responsibility and career development to architectural techniques.',
    isbn: '978-0135957059',
    published_at: new Date('2019-09-13'),
    authorSlugs: ['andrew-hunt', 'david-thomas'],
    categorySlugs: ['programming-languages', 'software-architecture'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'The Phoenix Project: A Novel about IT, DevOps, and Helping Your Business Win',
    description:
      'A novel that follows an IT manager as he learns about DevOps principles. It illustrates the theory of constraints, lean manufacturing, and DevOps practices.',
    isbn: '978-1942788294',
    published_at: new Date('2013-01-10'),
    authorSlugs: ['gene-kim'],
    categorySlugs: ['devops-cloud', 'software-architecture'],
    publisherSlug: 'no-starch-press'
  },
  {
    title: 'Working Effectively with Legacy Code',
    description:
      'Michael Feathers offers practical advice on working with large, untested legacy code bases. Learn techniques for safely modifying and improving existing code.',
    isbn: '978-0131177055',
    published_at: new Date('2004-09-22'),
    authorSlugs: ['michael-feathers'],
    categorySlugs: ['programming-languages', 'software-architecture'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'Building Microservices: Designing Fine-Grained Systems',
    description:
      'Sam Newman provides a comprehensive guide to microservices architecture, covering design principles, deployment strategies, and organizational considerations.',
    isbn: '978-1491950357',
    published_at: new Date('2015-02-20'),
    authorSlugs: ['sam-newman'],
    categorySlugs: ['software-architecture', 'devops-cloud'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: "Clean Architecture: A Craftsman's Guide to Software Structure and Design",
    description:
      'Robert C. Martin presents the universal rules of software architecture that apply regardless of programming language or platform.',
    isbn: '978-0134494166',
    published_at: new Date('2017-09-10'),
    authorSlugs: ['robert-c-martin'],
    categorySlugs: ['software-architecture'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'JavaScript: The Good Parts',
    description:
      'Douglas Crockford reveals the truly elegant parts of JavaScript, helping you understand why JavaScript is an outstanding object-oriented programming language.',
    isbn: '978-0596517748',
    published_at: new Date('2008-05-08'),
    authorSlugs: ['kyle-simpson'],
    categorySlugs: ['programming-languages', 'web-development'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Continuous Delivery: Reliable Software Releases through Build, Test, and Deployment Automation',
    description:
      'Comprehensive guide to continuous delivery, covering the principles and technical practices that enable rapid, reliable releases of software.',
    isbn: '978-0321601919',
    published_at: new Date('2010-07-27'),
    authorSlugs: ['martin-fowler'],
    categorySlugs: ['devops-cloud', 'software-architecture'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'Designing Data-Intensive Applications',
    description:
      'Essential guide to the big ideas behind reliable, scalable, and maintainable systems. Covers data models, storage, encoding, replication, and more.',
    isbn: '978-1449373320',
    published_at: new Date('2017-03-16'),
    authorSlugs: ['martin-fowler'],
    categorySlugs: ['database-systems', 'software-architecture'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Site Reliability Engineering: How Google Runs Production Systems',
    description:
      'Collection of essays by Google engineers explaining how they build, deploy, monitor, and maintain their systems. Essential reading for DevOps practitioners.',
    isbn: '978-1491929124',
    published_at: new Date('2016-04-16'),
    authorSlugs: ['gene-kim'],
    categorySlugs: ['devops-cloud', 'software-architecture'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Patterns of Enterprise Application Architecture',
    description:
      'Martin Fowler describes 40 patterns that have proven useful in enterprise applications. Essential reference for enterprise developers.',
    isbn: '978-0321127426',
    published_at: new Date('2002-11-15'),
    authorSlugs: ['martin-fowler'],
    categorySlugs: ['software-architecture', 'web-development'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'The DevOps Handbook: How to Create World-Class Agility, Reliability, and Security',
    description:
      'Practical guide to implementing DevOps principles. Shows how to integrate development and operations to increase flow and reliability.',
    isbn: '978-1942788003',
    published_at: new Date('2016-10-06'),
    authorSlugs: ['gene-kim'],
    categorySlugs: ['devops-cloud', 'software-architecture'],
    publisherSlug: 'no-starch-press'
  },
  {
    title: 'Extreme Programming Explained: Embrace Change',
    description:
      'Kent Beck introduces extreme programming (XP) and explains its core principles and practices for adaptive software development.',
    isbn: '978-0321278654',
    published_at: new Date('2004-11-26'),
    authorSlugs: ['kent-beck'],
    categorySlugs: ['software-architecture', 'programming-languages'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'Microservices Patterns: With Examples in Java',
    description:
      'Practical guide to microservices patterns with real-world examples. Covers service decomposition, inter-service communication, and data management.',
    isbn: '978-1617294549',
    published_at: new Date('2018-10-30'),
    authorSlugs: ['sam-newman'],
    categorySlugs: ['software-architecture', 'programming-languages'],
    publisherSlug: 'manning-publications'
  }
];

const users = [
  {
    name: 'Admin User',
    email: 'admin@bookwise.com',
    password: 'Admin123!',
    role: 'ADMIN'
  },
  {
    name: 'Alice Johnson',
    email: 'alice.johnson@bookwise.com',
    password: 'Alice123!',
    role: 'LIBRARIAN'
  },
  {
    name: 'Bob Smith',
    email: 'bob.smith@bookwise.com',
    password: 'Bob123!',
    role: 'LIBRARIAN'
  },
  {
    name: 'Charlie Davis',
    email: 'charlie.davis@example.com',
    password: 'Charlie123!',
    role: 'MEMBER'
  },
  {
    name: 'Diana Martinez',
    email: 'diana.martinez@example.com',
    password: 'Diana123!',
    role: 'MEMBER'
  },
  {
    name: 'Emma Wilson',
    email: 'emma.wilson@example.com',
    password: 'Emma123!',
    role: 'MEMBER'
  },
  {
    name: 'Frank Brown',
    email: 'frank.brown@example.com',
    password: 'Frank123!',
    role: 'MEMBER'
  },
  {
    name: 'Grace Lee',
    email: 'grace.lee@example.com',
    password: 'Grace123!',
    role: 'MEMBER'
  }
];

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.rating.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.book_Clone.deleteMany();
  await prisma.location.deleteMany();
  await prisma.book_Category.deleteMany();
  await prisma.book_Author.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();
  await prisma.author.deleteMany();
  await prisma.category.deleteMany();
  await prisma.publisher.deleteMany();

  // Create Publishers
  console.log('Creating publishers...');
  const publisherMap = new Map();
  for (const publisher of publishers) {
    const created = await prisma.publisher.create({
      data: publisher
    });
    publisherMap.set(publisher.slug, created.publisher_id);
    console.log(`  ✓ Created publisher: ${publisher.name}`);
  }

  // Create Categories
  console.log('Creating categories...');
  const categoryMap = new Map();
  for (const category of categories) {
    const created = await prisma.category.create({
      data: category
    });
    categoryMap.set(category.slug, created.category_id);
    console.log(`  ✓ Created category: ${category.name}`);
  }

  // Create Authors
  console.log('Creating authors...');
  const authorMap = new Map();
  for (const author of authors) {
    const created = await prisma.author.create({
      data: author
    });
    authorMap.set(author.slug, created.author_id);
    console.log(`  ✓ Created author: ${author.name}`);
  }

  // Create Users
  console.log('Creating users...');
  for (const user of users) {
    const { hash, salt } = await generateHash(user.password);
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password_hash: hash,
        salt: salt,
        role: user.role
      }
    });
    console.log(`  ✓ Created user: ${user.email} (${user.role}) - Password: ${user.password}`);
  }

  // Create Books
  console.log('Creating books...');
  for (const book of books) {
    const publisherId = publisherMap.get(book.publisherSlug);
    const categoryIds = book.categorySlugs.map((slug) => categoryMap.get(slug));
    const authorIds = book.authorSlugs.map((slug) => authorMap.get(slug));

    const created = await prisma.book.create({
      data: {
        title: book.title,
        description: book.description,
        isbn: book.isbn,
        published_at: book.published_at,
        publisher_id: publisherId,
        authors: {
          create: authorIds.map((authorId) => ({
            author_id: authorId
          }))
        },
        categories: {
          create: categoryIds.map((categoryId) => ({
            category_id: categoryId
          }))
        }
      }
    });
    console.log(`  ✓ Created book: ${created.title}`);
  }

  console.log('\n✅ Seed completed successfully!');
  console.log('\nDefault login credentials:');
  console.log('─────────────────────────────────────────────────');
  console.log('Admin:     admin@bookwise.com / Admin123!');
  console.log('Librarian: alice.johnson@bookwise.com / Alice123!');
  console.log('Librarian: bob.smith@bookwise.com / Bob123!');
  console.log('Member:    charlie.davis@example.com / Charlie123!');
  console.log('─────────────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
