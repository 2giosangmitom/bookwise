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

function calculateLocationId(data) {
  return `${data.room.toUpperCase()}-${data.floor}-${data.shelf}-${data.row}`;
}

function generateBarcode() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `BC-${timestamp}-${random}`.toUpperCase();
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
  { name: 'MIT Press', website: 'https://mitpress.mit.edu', slug: 'mit-press' },
  { name: 'Wrox Press', website: 'https://wrox.com', slug: 'wrox-press' },
  { name: 'Sams Publishing', website: 'https://informit.com/sams', slug: 'sams-publishing' },
  { name: 'Wiley', website: 'https://wiley.com', slug: 'wiley' },
  { name: 'Morgan Kaufmann', website: 'https://mkp.com', slug: 'morgan-kaufmann' },
  { name: 'Academic Press', website: 'https://academicpress.com', slug: 'academic-press' },
  { name: 'Microsoft Press', website: 'https://microsoftpress.com', slug: 'microsoft-press' }
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
  { name: 'Network Engineering', slug: 'network-engineering' },
  { name: 'Algorithms & Data Structures', slug: 'algorithms-data-structures' },
  { name: 'Artificial Intelligence', slug: 'artificial-intelligence' },
  { name: 'Software Testing', slug: 'software-testing' },
  { name: 'UI/UX Design', slug: 'ui-ux-design' },
  { name: 'Blockchain', slug: 'blockchain' },
  { name: 'Internet of Things', slug: 'internet-of-things' },
  { name: 'Cloud Computing', slug: 'cloud-computing' },
  { name: 'Microservices', slug: 'microservices' }
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
  },
  {
    name: 'Douglas Crockford',
    short_biography: 'JavaScript architect and JSON creator',
    biography:
      'Douglas Crockford is an American computer programmer known for his involvement in the development of JavaScript. He created JSON and wrote JavaScript: The Good Parts.',
    date_of_birth: new Date('1955-04-30'),
    nationality: 'American',
    slug: 'douglas-crockford'
  },
  {
    name: 'Grady Booch',
    short_biography: 'Software engineer and UML co-creator',
    biography:
      'Grady Booch is best known for developing the Unified Modeling Language (UML) with Ivar Jacobson and James Rumbaugh. He is an IBM Fellow and chief scientist for software engineering.',
    date_of_birth: new Date('1955-02-27'),
    nationality: 'American',
    slug: 'grady-booch'
  },
  {
    name: 'Donald Knuth',
    short_biography: 'Computer scientist and author of The Art of Computer Programming',
    biography:
      'Donald Erwin Knuth is an American computer scientist, mathematician, and Professor Emeritus at Stanford University. He is the author of the multi-volume work The Art of Computer Programming.',
    date_of_birth: new Date('1938-01-10'),
    nationality: 'American',
    slug: 'donald-knuth'
  },
  {
    name: 'Brian Kernighan',
    short_biography: 'Co-author of The C Programming Language',
    biography:
      'Brian Kernighan is a Canadian computer scientist who worked at Bell Labs alongside Unix creators. He co-authored the book The C Programming Language with Dennis Ritchie.',
    date_of_birth: new Date('1942-01-01'),
    nationality: 'Canadian',
    slug: 'brian-kernighan'
  },
  {
    name: 'Steve McConnell',
    short_biography: 'Software engineering author',
    biography:
      'Steve McConnell is an author of software engineering textbooks including Code Complete and Software Estimation. He is CEO and Chief Software Engineer at Construx Software.',
    date_of_birth: new Date('1962-01-01'),
    nationality: 'American',
    slug: 'steve-mcconnell'
  },
  {
    name: 'Bjarne Stroustrup',
    short_biography: 'Creator of C++',
    biography:
      'Bjarne Stroustrup is a Danish computer scientist most notable for the creation and development of the C++ programming language.',
    date_of_birth: new Date('1950-12-30'),
    nationality: 'Danish',
    slug: 'bjarne-stroustrup'
  },
  {
    name: 'Jon Bentley',
    short_biography: 'Computer scientist and Programming Pearls author',
    biography:
      'Jon Louis Bentley is an American computer scientist known for his contributions to algorithms and data structures. He is the author of Programming Pearls.',
    date_of_birth: new Date('1953-02-20'),
    nationality: 'American',
    slug: 'jon-bentley'
  },
  {
    name: 'Andrew S. Tanenbaum',
    short_biography: 'Computer scientist and Minix creator',
    biography:
      'Andrew Stuart Tanenbaum is an American-Dutch computer scientist and professor. He is best known as the author of MINIX and several computer science textbooks.',
    date_of_birth: new Date('1944-03-16'),
    nationality: 'Dutch-American',
    slug: 'andrew-tanenbaum'
  },
  {
    name: 'Thomas H. Cormen',
    short_biography: 'Co-author of Introduction to Algorithms',
    biography:
      'Thomas H. Cormen is a computer scientist and professor at Dartmouth College. He is co-author of Introduction to Algorithms, one of the most widely used algorithms textbooks.',
    date_of_birth: new Date('1956-01-01'),
    nationality: 'American',
    slug: 'thomas-cormen'
  },
  {
    name: 'Gayle Laakmann McDowell',
    short_biography: 'Author of Cracking the Coding Interview',
    biography:
      'Gayle Laakmann McDowell is a software engineer and author. She worked at Google, Microsoft, and Apple before founding CareerCup and writing Cracking the Coding Interview.',
    date_of_birth: new Date('1982-01-01'),
    nationality: 'American',
    slug: 'gayle-laakmann-mcdowell'
  },
  {
    name: 'Chad Fowler',
    short_biography: 'Ruby developer and author',
    biography:
      'Chad Fowler is a software developer, musician, and author. He is known for his work in the Ruby community and authored The Passionate Programmer.',
    date_of_birth: new Date('1976-01-01'),
    nationality: 'American',
    slug: 'chad-fowler'
  },
  {
    name: 'Sandi Metz',
    short_biography: 'Ruby developer and object-oriented design expert',
    biography:
      'Sandi Metz is a software developer and author known for her work on object-oriented design. She wrote Practical Object-Oriented Design in Ruby.',
    date_of_birth: new Date('1952-01-01'),
    nationality: 'American',
    slug: 'sandi-metz'
  },
  {
    name: 'Venkat Subramaniam',
    short_biography: 'Author and polyglot programmer',
    biography:
      'Venkat Subramaniam is an award-winning author, founder of Agile Developer, Inc., and an instructional professor at the University of Houston.',
    date_of_birth: new Date('1966-01-01'),
    nationality: 'American',
    slug: 'venkat-subramaniam'
  },
  {
    name: 'Addy Osmani',
    short_biography: 'Google engineer and JavaScript expert',
    biography:
      'Addy Osmani is an engineering manager at Google working on Chrome. He is the author of Learning JavaScript Design Patterns and a contributor to open source.',
    date_of_birth: new Date('1985-01-01'),
    nationality: 'British',
    slug: 'addy-osmani'
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
  },
  {
    title: 'JavaScript: The Good Parts',
    description:
      'Douglas Crockford reveals the truly elegant parts of JavaScript, helping you understand why JavaScript is an outstanding object-oriented programming language.',
    isbn: '978-0596517748',
    published_at: new Date('2008-05-08'),
    authorSlugs: ['douglas-crockford'],
    categorySlugs: ['programming-languages', 'web-development'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Code Complete',
    description:
      'Widely considered one of the best practical guides to programming, Steve McConnell presents hundreds of timeless best practices for software construction.',
    isbn: '978-0735619678',
    published_at: new Date('2004-06-19'),
    authorSlugs: ['steve-mcconnell'],
    categorySlugs: ['programming-languages', 'software-architecture'],
    publisherSlug: 'microsoft-press'
  },
  {
    title: 'The C Programming Language',
    description:
      'The definitive guide to C programming by its creators. A concise and clear introduction to the C language, essential for every programmer.',
    isbn: '978-0131103628',
    published_at: new Date('1988-04-01'),
    authorSlugs: ['brian-kernighan'],
    categorySlugs: ['programming-languages'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'Introduction to Algorithms',
    description:
      'Comprehensive introduction to the modern study of computer algorithms. Covers a broad range of algorithms in depth, yet makes their design and analysis accessible.',
    isbn: '978-0262033848',
    published_at: new Date('2009-07-31'),
    authorSlugs: ['thomas-cormen'],
    categorySlugs: ['algorithms-data-structures', 'programming-languages'],
    publisherSlug: 'mit-press'
  },
  {
    title: 'Modern Operating Systems',
    description:
      'Andrew Tanenbaum presents both the principles of operating systems and their application to modern systems including UNIX, Linux, and Windows.',
    isbn: '978-0133591620',
    published_at: new Date('2014-03-10'),
    authorSlugs: ['andrew-tanenbaum'],
    categorySlugs: ['operating-systems'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'Cracking the Coding Interview',
    description:
      '189 programming interview questions, ranging from the basics to the trickiest algorithm problems. A must-have guide for software engineers.',
    isbn: '978-0984782857',
    published_at: new Date('2015-07-01'),
    authorSlugs: ['gayle-laakmann-mcdowell'],
    categorySlugs: ['algorithms-data-structures', 'programming-languages'],
    publisherSlug: 'no-starch-press'
  },
  {
    title: 'The Passionate Programmer',
    description:
      'Chad Fowler presents a collection of tips for creating a remarkable career in software development. Learn how to stay relevant and valuable.',
    isbn: '978-1934356340',
    published_at: new Date('2009-07-28'),
    authorSlugs: ['chad-fowler'],
    categorySlugs: ['software-architecture'],
    publisherSlug: 'pragmatic-bookshelf'
  },
  {
    title: 'Practical Object-Oriented Design in Ruby',
    description:
      'Sandi Metz demonstrates how to write Ruby code that is easy to maintain and change. Essential reading for Ruby developers.',
    isbn: '978-0134456478',
    published_at: new Date('2018-08-25'),
    authorSlugs: ['sandi-metz'],
    categorySlugs: ['programming-languages', 'software-architecture'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'Programming Pearls',
    description:
      'Jon Bentley presents programming problems and their solutions, demonstrating elegant and efficient problem-solving techniques.',
    isbn: '978-0201657883',
    published_at: new Date('1999-10-07'),
    authorSlugs: ['jon-bentley'],
    categorySlugs: ['algorithms-data-structures', 'programming-languages'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'Learning JavaScript Design Patterns',
    description:
      'Addy Osmani explores applying classical and modern design patterns to JavaScript. Essential for building maintainable JavaScript applications.',
    isbn: '978-1449331818',
    published_at: new Date('2012-08-30'),
    authorSlugs: ['addy-osmani'],
    categorySlugs: ['programming-languages', 'web-development'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'The Art of Computer Programming, Vol. 1',
    description:
      'Donald Knuth presents fundamental algorithms with detailed mathematical analysis. The definitive text on computer programming.',
    isbn: '978-0201896831',
    published_at: new Date('1997-07-15'),
    authorSlugs: ['donald-knuth'],
    categorySlugs: ['algorithms-data-structures', 'programming-languages'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'Object-Oriented Analysis and Design',
    description:
      'Grady Booch provides a comprehensive guide to object-oriented analysis and design with applications, including UML.',
    isbn: '978-0201895513',
    published_at: new Date('2007-04-09'),
    authorSlugs: ['grady-booch'],
    categorySlugs: ['software-architecture', 'programming-languages'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'Functional Programming in Scala',
    description:
      'A comprehensive guide to functional programming in Scala. Learn functional programming concepts and how to apply them in Scala.',
    isbn: '978-1617290657',
    published_at: new Date('2014-09-01'),
    authorSlugs: ['venkat-subramaniam'],
    categorySlugs: ['programming-languages'],
    publisherSlug: 'manning-publications'
  },
  {
    title: 'Release It! Design and Deploy Production-Ready Software',
    description:
      'Learn to design and build software that survives the real world. Covers stability patterns, capacity, and operational concerns.',
    isbn: '978-1680502398',
    published_at: new Date('2018-01-17'),
    authorSlugs: ['michael-feathers'],
    categorySlugs: ['software-architecture', 'devops-cloud'],
    publisherSlug: 'pragmatic-bookshelf'
  },
  {
    title: 'High Performance MySQL',
    description:
      'Comprehensive guide to MySQL performance optimization, covering query optimization, server tuning, and replication.',
    isbn: '978-1449314286',
    published_at: new Date('2012-03-24'),
    authorSlugs: ['martin-fowler'],
    categorySlugs: ['database-systems'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Kubernetes in Action',
    description:
      'Comprehensive guide to Kubernetes, covering everything from basic concepts to advanced deployment strategies and best practices.',
    isbn: '978-1617293726',
    published_at: new Date('2017-12-17'),
    authorSlugs: ['gene-kim'],
    categorySlugs: ['devops-cloud', 'cloud-computing'],
    publisherSlug: 'manning-publications'
  },
  {
    title: 'Python Crash Course',
    description:
      'Fast-paced introduction to Python that will have you writing programs, solving problems, and making things that work in no time.',
    isbn: '978-1593279288',
    published_at: new Date('2019-05-03'),
    authorSlugs: ['kyle-simpson'],
    categorySlugs: ['programming-languages'],
    publisherSlug: 'no-starch-press'
  },
  {
    title: 'RESTful Web Services',
    description:
      'A complete guide to building RESTful web services, covering REST principles, HTTP, and practical implementation.',
    isbn: '978-0596529260',
    published_at: new Date('2007-05-08'),
    authorSlugs: ['sam-newman'],
    categorySlugs: ['web-development', 'software-architecture'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Agile Software Development',
    description:
      'Robert C. Martin presents principles, patterns, and practices of agile software development from a developer perspective.',
    isbn: '978-0135974445',
    published_at: new Date('2002-10-25'),
    authorSlugs: ['robert-c-martin'],
    categorySlugs: ['software-architecture'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'Head First Design Patterns',
    description:
      'A brain-friendly guide to design patterns. Learn the important patterns you need to know and apply them effectively.',
    isbn: '978-0596007126',
    published_at: new Date('2004-10-25'),
    authorSlugs: ['erich-gamma'],
    categorySlugs: ['software-architecture', 'programming-languages'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'The Phoenix Project',
    description:
      'A novel about IT, DevOps, and helping your business win. Learn DevOps principles through an engaging story.',
    isbn: '978-0988262508',
    published_at: new Date('2013-01-10'),
    authorSlugs: ['gene-kim'],
    categorySlugs: ['devops-cloud', 'software-architecture'],
    publisherSlug: 'no-starch-press'
  },
  {
    title: 'Cloud Native Patterns',
    description:
      'Design patterns for building resilient, scalable cloud-native applications. Covers microservices, containers, and orchestration.',
    isbn: '978-1617294297',
    published_at: new Date('2019-05-20'),
    authorSlugs: ['sam-newman'],
    categorySlugs: ['cloud-computing', 'microservices', 'software-architecture'],
    publisherSlug: 'manning-publications'
  },
  {
    title: 'Building Evolutionary Architectures',
    description:
      'Support constant change with evolutionary architecture. Learn techniques for building systems that embrace change.',
    isbn: '978-1491986363',
    published_at: new Date('2017-09-26'),
    authorSlugs: ['martin-fowler'],
    categorySlugs: ['software-architecture'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Software Engineering at Google',
    description:
      'Learn how Google engineers build and maintain software at scale. Covers processes, tools, and culture.',
    isbn: '978-1492082798',
    published_at: new Date('2020-03-10'),
    authorSlugs: ['gene-kim'],
    categorySlugs: ['software-architecture', 'devops-cloud'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'The TypeScript Handbook',
    description:
      'Comprehensive guide to TypeScript. Learn how to write safer and more maintainable JavaScript with TypeScript.',
    isbn: '978-1492037651',
    published_at: new Date('2021-01-15'),
    authorSlugs: ['douglas-crockford'],
    categorySlugs: ['programming-languages', 'web-development'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Algorithms',
    description:
      'Essential information covering algorithms and data structures for the modern programmer. Focuses on practical applications.',
    isbn: '978-0321573513',
    published_at: new Date('2011-03-19'),
    authorSlugs: ['thomas-cormen'],
    categorySlugs: ['algorithms-data-structures'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'System Design Interview',
    description:
      'An insider guide to system design interviews. Learn how to approach and solve system design problems.',
    isbn: '978-1736049112',
    published_at: new Date('2020-06-04'),
    authorSlugs: ['gayle-laakmann-mcdowell'],
    categorySlugs: ['software-architecture', 'algorithms-data-structures'],
    publisherSlug: 'no-starch-press'
  },
  {
    title: 'Concurrency in Go',
    description: 'Learn how to write concurrent programs in Go. Covers goroutines, channels, and concurrency patterns.',
    isbn: '978-1491941195',
    published_at: new Date('2017-07-10'),
    authorSlugs: ['venkat-subramaniam'],
    categorySlugs: ['programming-languages'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'The Linux Programming Interface',
    description:
      'The definitive guide to Linux system programming. Covers system calls, file I/O, processes, and more.',
    isbn: '978-1593272203',
    published_at: new Date('2010-10-28'),
    authorSlugs: ['andrew-tanenbaum'],
    categorySlugs: ['operating-systems', 'programming-languages'],
    publisherSlug: 'no-starch-press'
  }
];

const locations = [
  { room: 'Main Hall', floor: 1, shelf: 1, row: 1 },
  { room: 'Main Hall', floor: 1, shelf: 1, row: 2 },
  { room: 'Main Hall', floor: 1, shelf: 2, row: 1 },
  { room: 'Main Hall', floor: 1, shelf: 2, row: 2 },
  { room: 'Main Hall', floor: 1, shelf: 3, row: 1 },
  { room: 'Main Hall', floor: 1, shelf: 3, row: 2 },
  { room: 'Main Hall', floor: 2, shelf: 1, row: 1 },
  { room: 'Main Hall', floor: 2, shelf: 1, row: 2 },
  { room: 'Main Hall', floor: 2, shelf: 2, row: 1 },
  { room: 'Main Hall', floor: 2, shelf: 2, row: 2 },
  { room: 'Study Room A', floor: 1, shelf: 1, row: 1 },
  { room: 'Study Room A', floor: 1, shelf: 1, row: 2 },
  { room: 'Study Room A', floor: 1, shelf: 2, row: 1 },
  { room: 'Study Room A', floor: 1, shelf: 2, row: 2 },
  { room: 'Study Room B', floor: 1, shelf: 1, row: 1 },
  { room: 'Study Room B', floor: 1, shelf: 1, row: 2 },
  { room: 'Study Room B', floor: 1, shelf: 2, row: 1 },
  { room: 'Study Room B', floor: 1, shelf: 2, row: 2 },
  { room: 'Archive', floor: 1, shelf: 1, row: 1 },
  { room: 'Archive', floor: 1, shelf: 1, row: 2 },
  { room: 'Archive', floor: 1, shelf: 2, row: 1 },
  { room: 'Archive', floor: 1, shelf: 2, row: 2 },
  { room: 'Archive', floor: 2, shelf: 1, row: 1 },
  { room: 'Archive', floor: 2, shelf: 1, row: 2 },
  { room: 'Reading Room', floor: 1, shelf: 1, row: 1 },
  { room: 'Reading Room', floor: 1, shelf: 1, row: 2 },
  { room: 'Reading Room', floor: 1, shelf: 2, row: 1 },
  { room: 'Reading Room', floor: 1, shelf: 2, row: 2 },
  { room: 'Reference Section', floor: 1, shelf: 1, row: 1 },
  { room: 'Reference Section', floor: 1, shelf: 1, row: 2 }
];

// Book clones will be created after books are seeded
// Each book will get 2-5 clones distributed across different locations
const bookClonesPerBook = [
  { bookIndex: 0, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 1, count: 4, condition: ['NEW', 'GOOD', 'GOOD', 'WORN'] },
  { bookIndex: 2, count: 2, condition: ['NEW', 'NEW'] },
  { bookIndex: 3, count: 3, condition: ['GOOD', 'WORN', 'DAMAGED'] },
  { bookIndex: 4, count: 5, condition: ['NEW', 'GOOD', 'GOOD', 'WORN', 'GOOD'] },
  { bookIndex: 5, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 6, count: 2, condition: ['NEW', 'NEW'] },
  { bookIndex: 7, count: 4, condition: ['NEW', 'GOOD', 'WORN', 'GOOD'] },
  { bookIndex: 8, count: 3, condition: ['GOOD', 'WORN', 'DAMAGED'] },
  { bookIndex: 9, count: 2, condition: ['NEW', 'GOOD'] },
  { bookIndex: 10, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 11, count: 4, condition: ['NEW', 'NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 12, count: 2, condition: ['NEW', 'GOOD'] },
  { bookIndex: 13, count: 3, condition: ['NEW', 'GOOD', 'WORN'] },
  { bookIndex: 14, count: 5, condition: ['NEW', 'NEW', 'GOOD', 'GOOD', 'WORN'] }
];

const users = [
  {
    name: 'Admin User',
    email: 'admin@bookwise.com',
    password: 'Admin123!',
    role: 'ADMIN'
  },
  {
    name: 'Sarah Chen',
    email: 'sarah.chen@bookwise.com',
    password: 'Sarah123!',
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
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@bookwise.com',
    password: 'Michael123!',
    role: 'LIBRARIAN'
  },
  {
    name: 'Jennifer Kim',
    email: 'jennifer.kim@bookwise.com',
    password: 'Jennifer123!',
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
  },
  {
    name: 'Henry Anderson',
    email: 'henry.anderson@example.com',
    password: 'Henry123!',
    role: 'MEMBER'
  },
  {
    name: 'Isabella Thompson',
    email: 'isabella.thompson@example.com',
    password: 'Isabella123!',
    role: 'MEMBER'
  },
  {
    name: 'James Garcia',
    email: 'james.garcia@example.com',
    password: 'James123!',
    role: 'MEMBER'
  },
  {
    name: 'Katherine Nguyen',
    email: 'katherine.nguyen@example.com',
    password: 'Katherine123!',
    role: 'MEMBER'
  },
  {
    name: "Lucas O'Brien",
    email: 'lucas.obrien@example.com',
    password: 'Lucas123!',
    role: 'MEMBER'
  },
  {
    name: 'Maria Gonzalez',
    email: 'maria.gonzalez@example.com',
    password: 'Maria123!',
    role: 'MEMBER'
  },
  {
    name: 'Nathan White',
    email: 'nathan.white@example.com',
    password: 'Nathan123!',
    role: 'MEMBER'
  },
  {
    name: 'Olivia Taylor',
    email: 'olivia.taylor@example.com',
    password: 'Olivia123!',
    role: 'MEMBER'
  },
  {
    name: 'Patrick Moore',
    email: 'patrick.moore@example.com',
    password: 'Patrick123!',
    role: 'MEMBER'
  },
  {
    name: 'Quinn Jackson',
    email: 'quinn.jackson@example.com',
    password: 'Quinn123!',
    role: 'MEMBER'
  },
  {
    name: 'Rachel Martin',
    email: 'rachel.martin@example.com',
    password: 'Rachel123!',
    role: 'MEMBER'
  },
  {
    name: 'Samuel Harris',
    email: 'samuel.harris@example.com',
    password: 'Samuel123!',
    role: 'MEMBER'
  },
  {
    name: 'Tiffany Clark',
    email: 'tiffany.clark@example.com',
    password: 'Tiffany123!',
    role: 'MEMBER'
  },
  {
    name: 'Uriel Lopez',
    email: 'uriel.lopez@example.com',
    password: 'Uriel123!',
    role: 'MEMBER'
  },
  {
    name: 'Victoria Walker',
    email: 'victoria.walker@example.com',
    password: 'Victoria123!',
    role: 'MEMBER'
  },
  {
    name: 'William Young',
    email: 'william.young@example.com',
    password: 'William123!',
    role: 'MEMBER'
  },
  {
    name: 'Xavier Hall',
    email: 'xavier.hall@example.com',
    password: 'Xavier123!',
    role: 'MEMBER'
  },
  {
    name: 'Yuki Tanaka',
    email: 'yuki.tanaka@example.com',
    password: 'Yuki123!',
    role: 'MEMBER'
  },
  {
    name: 'Zachary Allen',
    email: 'zachary.allen@example.com',
    password: 'Zachary123!',
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
  const createdBooks = [];
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
    createdBooks.push(created);
    console.log(`  ✓ Created book: ${created.title}`);
  }

  // Create Locations
  console.log('Creating locations...');
  const createdLocations = [];
  for (const location of locations) {
    const location_id = calculateLocationId(location);
    const created = await prisma.location.create({
      data: {
        location_id,
        room: location.room,
        floor: location.floor,
        shelf: location.shelf,
        row: location.row
      }
    });
    createdLocations.push(created);
    console.log(`  ✓ Created location: ${created.location_id}`);
  }

  // Create Book Clones
  console.log('Creating book clones...');
  let locationIndex = 0;
  for (const cloneConfig of bookClonesPerBook) {
    const book = createdBooks[cloneConfig.bookIndex];
    if (!book) continue;

    for (let i = 0; i < cloneConfig.count; i++) {
      const location = createdLocations[locationIndex % createdLocations.length];
      const condition = cloneConfig.condition[i] || 'GOOD';
      const barcode = generateBarcode();

      await prisma.book_Clone.create({
        data: {
          book_id: book.book_id,
          location_id: location.location_id,
          barcode: barcode,
          condition: condition
        }
      });

      locationIndex++;
    }
    console.log(`  ✓ Created ${cloneConfig.count} clones for: ${book.title}`);
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
