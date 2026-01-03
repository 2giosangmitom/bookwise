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
  { name: 'Microsoft Press', website: 'https://microsoftpress.com', slug: 'microsoft-press' },
  { name: "O'Reilly Media Inc", website: 'https://oreilly.com', slug: 'oreilly-media-inc' },
  { name: 'Simon & Schuster', website: 'https://simonandschuster.com', slug: 'simon-schuster' },
  { name: 'Penguin Books', website: 'https://penguin.com', slug: 'penguin-books' },
  { name: 'Pearson Education', website: 'https://pearson.com', slug: 'pearson-education' },
  { name: 'Springer Science', website: 'https://springer.com', slug: 'springer-science' },
  { name: 'CRC Press', website: 'https://crcpress.com', slug: 'crc-press' },
  { name: 'Elsevier', website: 'https://elsevier.com', slug: 'elsevier' },
  { name: 'Cengage Learning', website: 'https://cengage.com', slug: 'cengage-learning' },
  { name: 'McGraw Hill', website: 'https://mheducation.com', slug: 'mcgraw-hill' },
  { name: 'Hachette Book Group', website: 'https://hachettebookgroup.com', slug: 'hachette-book-group' },
  { name: 'Random House', website: 'https://randomhouse.com', slug: 'random-house' },
  { name: 'Bloomsbury Publishing', website: 'https://bloomsbury.com', slug: 'bloomsbury-publishing' },
  { name: 'Taylor & Francis', website: 'https://taylorandfrancis.com', slug: 'taylor-francis' },
  { name: 'Oxford University Press', website: 'https://oup.com', slug: 'oxford-university-press' },
  { name: 'Cambridge University Press', website: 'https://cambridge.org', slug: 'cambridge-university-press' },
  { name: 'Sage Publications', website: 'https://sagepub.com', slug: 'sage-publications' }
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
  },
  {
    name: 'Linus Torvalds',
    short_biography: 'Creator of Linux',
    biography:
      'Linus Torvalds is a Finnish-American software engineer who is the creator and principal developer of the Linux kernel.',
    date_of_birth: new Date('1969-12-28'),
    nationality: 'Finnish',
    slug: 'linus-torvalds'
  },
  {
    name: 'John Carmack',
    short_biography: 'Game engine programmer and technology visionary',
    biography:
      'John Carmack is an American programmer and video game developer known for his work on game engines and for pioneering techniques in computer graphics.',
    date_of_birth: new Date('1970-08-20'),
    nationality: 'American',
    slug: 'john-carmack'
  },
  {
    name: 'Margaret Hamilton',
    short_biography: 'Pioneer of software engineering',
    biography:
      'Margaret Hamilton is an American computer scientist, systems engineer, and business owner. She was director of the Software Engineering Division.',
    date_of_birth: new Date('1936-08-17'),
    nationality: 'American',
    slug: 'margaret-hamilton'
  },
  {
    name: 'Alan Turing',
    short_biography: 'Founder of computer science and AI',
    biography:
      'Alan Mathison Turing was an English mathematician, computer scientist, logician, cryptanalyst, philosopher, and theoretical biologist.',
    date_of_birth: new Date('1912-06-23'),
    nationality: 'British',
    slug: 'alan-turing'
  },
  {
    name: 'Grace Hopper',
    short_biography: 'Pioneering computer scientist',
    biography:
      'Grace Brewster Murray Hopper was an American computer scientist and United States Navy rear admiral. She was a pioneer of computer programming languages.',
    date_of_birth: new Date('1906-12-09'),
    nationality: 'American',
    slug: 'grace-hopper'
  },
  {
    name: 'Tony Hoare',
    short_biography: 'Inventor of quicksort and CSP',
    biography:
      'Charles Antony Richard Hoare is a British computer scientist famous for his work on the quicksort sorting algorithm and Communicating Sequential Processes.',
    date_of_birth: new Date('1934-01-11'),
    nationality: 'British',
    slug: 'tony-hoare'
  },
  {
    name: 'Ken Thompson',
    short_biography: 'Co-creator of Unix and the Go programming language',
    biography:
      'Kenneth Lane Thompson is an American pioneer of computer science. He designed and implemented the original Unix operating system.',
    date_of_birth: new Date('1943-02-04'),
    nationality: 'American',
    slug: 'ken-thompson'
  },
  {
    name: 'Dennis Ritchie',
    short_biography: 'Creator of C programming language',
    biography:
      'Dennis MacAlistair Ritchie was an American computer scientist who created the C programming language and helped design the Unix operating system.',
    date_of_birth: new Date('1941-09-09'),
    nationality: 'American',
    slug: 'dennis-ritchie'
  },
  {
    name: 'Guido van Rossum',
    short_biography: 'Creator of Python programming language',
    biography: 'Guido van Rossum is a Dutch programmer best known as the author of the Python programming language.',
    date_of_birth: new Date('1956-01-31'),
    nationality: 'Dutch',
    slug: 'guido-van-rossum'
  },
  {
    name: 'Graydon Hoare',
    short_biography: 'Creator of Rust programming language',
    biography:
      'Graydon Hoare is a Canadian software developer best known as the original designer and implementer of the Rust programming language.',
    date_of_birth: new Date('1980-01-01'),
    nationality: 'Canadian',
    slug: 'graydon-hoare'
  },
  {
    name: 'Yukihiro Matsumoto',
    short_biography: 'Creator of Ruby programming language',
    biography:
      'Yukihiro Matsumoto, often known as "Matz", is a Japanese computer scientist and software programmer best known as the creator of the Ruby programming language.',
    date_of_birth: new Date('1965-04-14'),
    nationality: 'Japanese',
    slug: 'yukihiro-matsumoto'
  },
  {
    name: 'Andrew McCallum',
    short_biography: 'Machine learning researcher and educator',
    biography:
      'Andrew McCallum is a Professor of Computer Science at the University of Massachusetts Amherst, known for his work in machine learning and natural language processing.',
    date_of_birth: new Date('1969-01-01'),
    nationality: 'American',
    slug: 'andrew-mccallum'
  },
  {
    name: 'Yann LeCun',
    short_biography: 'Pioneer of deep learning',
    biography:
      'Yann André LeCun is a French-American computer scientist known for his work on convolutional neural networks and deep learning.',
    date_of_birth: new Date('1960-07-08'),
    nationality: 'French-American',
    slug: 'yann-lecun'
  },
  {
    name: 'Geoffrey Hinton',
    short_biography: 'Deep learning pioneer',
    biography:
      'Geoffrey Everest Hinton is a British-Canadian cognitive psychologist and computer scientist, most famous for his work on neural networks.',
    date_of_birth: new Date('1947-12-06'),
    nationality: 'British-Canadian',
    slug: 'geoffrey-hinton'
  },
  {
    name: 'Yoshua Bengio',
    short_biography: 'Deep learning researcher and AI pioneer',
    biography:
      'Yoshua Bengio is a Canadian computer scientist best known for his work on deep neural networks and machine learning.',
    date_of_birth: new Date('1964-03-05'),
    nationality: 'Canadian',
    slug: 'yoshua-bengio'
  },
  {
    name: 'Andrew Ng',
    short_biography: 'Machine learning expert and educator',
    biography:
      'Andrew Yan-Tak Ng is a British-American computer scientist and entrepreneur. He is a leading expert on machine learning and AI.',
    date_of_birth: new Date('1976-01-01'),
    nationality: 'British-American',
    slug: 'andrew-ng'
  },
  {
    name: 'Judea Pearl',
    short_biography: 'Artificial intelligence researcher',
    biography:
      'Judea Pearl is an Israeli-American computer scientist and philosopher. He is known for his work on probabilistic and causal reasoning.',
    date_of_birth: new Date('1936-09-04'),
    nationality: 'Israeli-American',
    slug: 'judea-pearl'
  },
  {
    name: 'Stuart Russell',
    short_biography: 'Artificial intelligence researcher and author',
    biography:
      'Stuart Russell is a computer scientist and professor at UC Berkeley, known for his work on artificial intelligence and rational agents.',
    date_of_birth: new Date('1962-01-01'),
    nationality: 'British',
    slug: 'stuart-russell'
  },
  {
    name: 'Marvin Minsky',
    short_biography: 'AI pioneer and cognitive scientist',
    biography:
      "Marvin Lee Minsky was an American cognitive scientist in the field of artificial intelligence, co-founder of MIT's Media Lab.",
    date_of_birth: new Date('1927-08-09'),
    nationality: 'American',
    slug: 'marvin-minsky'
  },
  {
    name: 'John Backus',
    short_biography: 'Creator of FORTRAN programming language',
    biography:
      'John Warner Backus was an American computer scientist. He directed the team that invented FORTRAN, the first widely used high-level programming language.',
    date_of_birth: new Date('1924-12-03'),
    nationality: 'American',
    slug: 'john-backus'
  },
  {
    name: 'Niklaus Wirth',
    short_biography: 'Creator of Pascal and Modula programming languages',
    biography:
      'Niklaus Emil Wirth is a Swiss computer scientist, known for designing several programming languages including Pascal and Modula.',
    date_of_birth: new Date('1934-02-15'),
    nationality: 'Swiss',
    slug: 'niklaus-wirth'
  },
  {
    name: 'Barbara Liskov',
    short_biography: 'Object-oriented programming pioneer',
    biography:
      'Barbara Liskov is an American computer scientist known for her contributions to programming languages and systems design, including the Liskov substitution principle.',
    date_of_birth: new Date('1939-11-07'),
    nationality: 'American',
    slug: 'barbara-liskov'
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
  },
  {
    title: 'The Mythical Man-Month',
    description:
      'Classic book on software project management, exploring why adding manpower to a late software project makes it later.',
    isbn: '978-0201835953',
    published_at: new Date('1995-01-01'),
    authorSlugs: ['robert-c-martin'],
    categorySlugs: ['software-architecture'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'Code: The Hidden Language of Computer Hardware and Software',
    description:
      'Explore the technology behind computers and how they work from the ground up through various codes and signals.',
    isbn: '978-0735605238',
    published_at: new Date('1999-10-15'),
    authorSlugs: ['andrew-tanenbaum'],
    categorySlugs: ['programming-languages', 'operating-systems'],
    publisherSlug: 'microsoft-press'
  },
  {
    title: 'The Pragmatic Programmer: From Journeyman to Master',
    description: 'Covers practical tips and techniques for programmers to become more effective and productive.',
    isbn: '978-0201616224',
    published_at: new Date('1999-10-30'),
    authorSlugs: ['andrew-hunt', 'david-thomas'],
    categorySlugs: ['software-architecture', 'programming-languages'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'Secure by Design',
    description:
      'Learn how to build secure software systems with security built in from the start, not as an afterthought.',
    isbn: '978-1617294357',
    published_at: new Date('2019-05-15'),
    authorSlugs: ['sam-newman'],
    categorySlugs: ['cybersecurity', 'software-architecture'],
    publisherSlug: 'manning-publications'
  },
  {
    title: 'Building Microservices with Node.js',
    description:
      'Learn how to build scalable microservices using Node.js, covering architecture patterns and best practices.',
    isbn: '978-1491954622',
    published_at: new Date('2015-10-20'),
    authorSlugs: ['gene-kim'],
    categorySlugs: ['microservices', 'web-development', 'programming-languages'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Web Performance in Action',
    description:
      'Practical techniques for optimizing web application performance including caching, compression, and optimization.',
    isbn: '978-1617291784',
    published_at: new Date('2016-05-15'),
    authorSlugs: ['douglas-crockford'],
    categorySlugs: ['web-development', 'software-architecture'],
    publisherSlug: 'manning-publications'
  },
  {
    title: 'Enterprise Integration Patterns',
    description:
      'Design patterns for integrating enterprise systems. Essential reference for building scalable systems.',
    isbn: '978-0321200686',
    published_at: new Date('2003-10-20'),
    authorSlugs: ['martin-fowler'],
    categorySlugs: ['software-architecture', 'database-systems'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'Distributed Systems in Practice',
    description: 'Practical guide to building and maintaining distributed systems at scale with real-world examples.',
    isbn: '978-1617295171',
    published_at: new Date('2018-03-10'),
    authorSlugs: ['sam-newman'],
    categorySlugs: ['software-architecture', 'devops-cloud'],
    publisherSlug: 'manning-publications'
  },
  {
    title: 'Performance Testing Guidance',
    description:
      'Comprehensive guide to performance testing strategies and tools for ensuring application performance.',
    isbn: '978-0735625679',
    published_at: new Date('2007-06-15'),
    authorSlugs: ['venkat-subramaniam'],
    categorySlugs: ['software-testing', 'devops-cloud'],
    publisherSlug: 'microsoft-press'
  },
  {
    title: 'Reactive Programming with RxJava',
    description: 'Learn how to build responsive, resilient applications using reactive programming with RxJava.',
    isbn: '978-1491927282',
    published_at: new Date('2016-04-10'),
    authorSlugs: ['kyle-simpson'],
    categorySlugs: ['programming-languages', 'software-architecture'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Scalability Rules',
    description: 'Practical rules and guidelines for building scalable systems that can handle growth and complexity.',
    isbn: '978-0134170757',
    published_at: new Date('2015-09-15'),
    authorSlugs: ['gene-kim'],
    categorySlugs: ['software-architecture', 'devops-cloud'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'API Design Best Practices',
    description:
      'Guidelines and best practices for designing RESTful APIs that are intuitive, scalable, and maintainable.',
    isbn: '978-1491920931',
    published_at: new Date('2016-08-20'),
    authorSlugs: ['sam-newman'],
    categorySlugs: ['web-development', 'software-architecture'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Container Security',
    description: 'Best practices for securing containerized applications and container infrastructure.',
    isbn: '978-1492056669',
    published_at: new Date('2020-02-10'),
    authorSlugs: ['venkat-subramaniam'],
    categorySlugs: ['cybersecurity', 'devops-cloud'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Machine Learning for Absolute Beginners',
    description: 'Introduction to machine learning concepts and practical applications without heavy mathematics.',
    isbn: '978-1549617981',
    published_at: new Date('2018-09-15'),
    authorSlugs: ['andrew-ng'],
    categorySlugs: ['machine-learning', 'data-science'],
    publisherSlug: 'no-starch-press'
  },
  {
    title: 'Deep Learning Fundamentals',
    description:
      'Comprehensive guide to deep learning, covering neural networks, backpropagation, and various architectures.',
    isbn: '978-1491959541',
    published_at: new Date('2016-09-15'),
    authorSlugs: ['yann-lecun'],
    categorySlugs: ['machine-learning', 'data-science'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Practical Statistics for Data Scientists',
    description: 'Apply statistical concepts to solve real data science problems using Python and R.',
    isbn: '978-1491952955',
    published_at: new Date('2017-05-30'),
    authorSlugs: ['andrew-mccallum'],
    categorySlugs: ['data-science', 'machine-learning'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Computer Vision with Python',
    description: 'Learn computer vision techniques for image processing, object detection, and recognition.',
    isbn: '978-1491922935',
    published_at: new Date('2016-04-15'),
    authorSlugs: ['joshua-bloch'],
    categorySlugs: ['machine-learning', 'programming-languages'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Natural Language Processing in Action',
    description: 'Practical guide to NLP including text processing, sentiment analysis, and machine translation.',
    isbn: '978-1617294632',
    published_at: new Date('2019-02-15'),
    authorSlugs: ['andrew-mccallum'],
    categorySlugs: ['machine-learning', 'data-science'],
    publisherSlug: 'manning-publications'
  },
  {
    title: 'Time Series Analysis and Forecasting',
    description: 'Master time series data analysis and forecasting techniques with practical examples.',
    isbn: '978-1491949405',
    published_at: new Date('2016-12-15'),
    authorSlugs: ['thomas-cormen'],
    categorySlugs: ['data-science', 'machine-learning'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Blockchain Basics',
    description: 'Introduction to blockchain technology, cryptocurrencies, and distributed ledger systems.',
    isbn: '978-1491919416',
    published_at: new Date('2015-12-15'),
    authorSlugs: ['douglas-crockford'],
    categorySlugs: ['blockchain', 'software-architecture'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'IoT Design and Prototyping',
    description: 'Learn how to design and build Internet of Things applications with sensors and connected devices.',
    isbn: '978-1491934556',
    published_at: new Date('2016-03-15'),
    authorSlugs: ['venkat-subramaniam'],
    categorySlugs: ['internet-of-things', 'programming-languages'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Game Development with Unity',
    description:
      'Practical guide to game development using the Unity engine, covering graphics, physics, and gameplay.',
    isbn: '978-1491919935',
    published_at: new Date('2016-02-15'),
    authorSlugs: ['john-carmack'],
    categorySlugs: ['game-development', 'programming-languages'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Mobile App Development with React Native',
    description: 'Build cross-platform mobile applications using React Native and JavaScript.',
    isbn: '978-1491989265',
    published_at: new Date('2016-09-15'),
    authorSlugs: ['kyle-simpson'],
    categorySlugs: ['mobile-development', 'web-development'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'UI/UX Design Principles',
    description: 'Master the principles of user interface and user experience design for web and mobile applications.',
    isbn: '978-1491952611',
    published_at: new Date('2015-07-15'),
    authorSlugs: ['addy-osmani'],
    categorySlugs: ['ui-ux-design', 'web-development'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Digital Marketing Analytics',
    description: 'Learn analytics and data-driven strategies for digital marketing campaigns.',
    isbn: '978-1491949406',
    published_at: new Date('2015-06-15'),
    authorSlugs: ['andrew-mccallum'],
    categorySlugs: ['data-science'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Graph Databases for Beginners',
    description: 'Introduction to graph databases including Neo4j, their properties, and use cases.',
    isbn: '978-1491949407',
    published_at: new Date('2015-05-15'),
    authorSlugs: ['thomas-cormen'],
    categorySlugs: ['database-systems', 'software-architecture'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'SQL Performance Tuning',
    description: 'Techniques and strategies for optimizing SQL queries and database performance.',
    isbn: '978-1491927244',
    published_at: new Date('2016-09-20'),
    authorSlugs: ['jon-bentley'],
    categorySlugs: ['database-systems', 'software-architecture'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Network Protocols Handbook',
    description: 'Comprehensive reference for network protocols including TCP/IP, HTTP, and more.',
    isbn: '978-1491927251',
    published_at: new Date('2014-03-15'),
    authorSlugs: ['brian-kernighan'],
    categorySlugs: ['network-engineering', 'operating-systems'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Cryptography Engineering',
    description: 'Design and implementation of cryptographic systems with practical examples and case studies.',
    isbn: '978-1118722108',
    published_at: new Date('2015-01-15'),
    authorSlugs: ['douglas-crockford'],
    categorySlugs: ['cybersecurity', 'software-architecture'],
    publisherSlug: 'wiley'
  },
  {
    title: 'Penetration Testing Guide',
    description: 'Practical guide to penetration testing methodology, tools, and techniques for ethical hacking.',
    isbn: '978-1491918557',
    published_at: new Date('2015-07-15'),
    authorSlugs: ['venkat-subramaniam'],
    categorySlugs: ['cybersecurity'],
    publisherSlug: 'no-starch-press'
  },
  {
    title: 'Web Security Testing Handbook',
    description: 'Comprehensive guide to testing web application security, covering OWASP top 10 and beyond.',
    isbn: '978-1491921563',
    published_at: new Date('2015-07-20'),
    authorSlugs: ['gene-kim'],
    categorySlugs: ['cybersecurity', 'web-development'],
    publisherSlug: 'no-starch-press'
  },
  {
    title: 'Learning Go',
    description: 'Master the Go programming language with practical examples and real-world applications.',
    isbn: '978-1491954560',
    published_at: new Date('2015-10-15'),
    authorSlugs: ['ken-thompson'],
    categorySlugs: ['programming-languages'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Rust in Action',
    description: 'Learn systems programming with Rust, exploring memory safety, concurrency, and performance.',
    isbn: '978-1617294557',
    published_at: new Date('2021-02-15'),
    authorSlugs: ['graydon-hoare'],
    categorySlugs: ['programming-languages', 'software-architecture'],
    publisherSlug: 'manning-publications'
  },
  {
    title: 'Programming in Scala',
    description: 'Comprehensive guide to functional and object-oriented programming in Scala.',
    isbn: '978-0981531687',
    published_at: new Date('2008-12-15'),
    authorSlugs: ['venkat-subramaniam'],
    categorySlugs: ['programming-languages'],
    publisherSlug: 'artima-press'
  },
  {
    title: 'Elixir in Action',
    description: 'Learn concurrent and distributed programming with Elixir and the Erlang VM.',
    isbn: '978-1617295027',
    published_at: new Date('2019-04-15'),
    authorSlugs: ['ken-thompson'],
    categorySlugs: ['programming-languages', 'software-architecture'],
    publisherSlug: 'manning-publications'
  },
  {
    title: 'Functional Programming in Java',
    description: 'Explore functional programming concepts and techniques in modern Java.',
    isbn: '978-1491927283',
    published_at: new Date('2016-04-15'),
    authorSlugs: ['joshua-bloch'],
    categorySlugs: ['programming-languages', 'software-architecture'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Lambda Expressions in Java',
    description: 'Master lambda expressions and functional programming features in Java 8+.',
    isbn: '978-1491926971',
    published_at: new Date('2014-09-15'),
    authorSlugs: ['joshua-bloch'],
    categorySlugs: ['programming-languages'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Test-Driven Development in C++',
    description: 'Apply TDD principles to C++ development with practical examples and patterns.',
    isbn: '978-1491927305',
    published_at: new Date('2015-11-15'),
    authorSlugs: ['bjarne-stroustrup'],
    categorySlugs: ['programming-languages', 'software-testing'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Modern C++ Design',
    description: 'Techniques and patterns for writing effective modern C++ code.',
    isbn: '978-0201704310',
    published_at: new Date('2001-07-15'),
    authorSlugs: ['bjarne-stroustrup'],
    categorySlugs: ['programming-languages', 'software-architecture'],
    publisherSlug: 'addison-wesley'
  },
  {
    title: 'Professional JavaScript',
    description: 'Advanced JavaScript techniques and patterns for professional developers.',
    isbn: '978-1491952023',
    published_at: new Date('2016-05-15'),
    authorSlugs: ['douglas-crockford'],
    categorySlugs: ['programming-languages', 'web-development'],
    publisherSlug: 'wrox-press'
  },
  {
    title: 'Advanced Python',
    description: 'Advanced Python programming techniques including metaprogramming and descriptors.',
    isbn: '978-1491921555',
    published_at: new Date('2015-07-15'),
    authorSlugs: ['guido-van-rossum'],
    categorySlugs: ['programming-languages'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Network Programming with Python',
    description: 'Learn network programming concepts and build networked applications with Python.',
    isbn: '978-1491927596',
    published_at: new Date('2016-08-15'),
    authorSlugs: ['guido-van-rossum'],
    categorySlugs: ['programming-languages', 'network-engineering'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'System Programming in Rust',
    description: 'Systems-level programming with Rust, covering OS interactions and performance.',
    isbn: '978-1491977231',
    published_at: new Date('2015-07-15'),
    authorSlugs: ['graydon-hoare'],
    categorySlugs: ['programming-languages', 'operating-systems'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Building Cloud Native Applications',
    description: 'Patterns and practices for building applications designed for cloud platforms.',
    isbn: '978-1491961711',
    published_at: new Date('2015-04-15'),
    authorSlugs: ['sam-newman'],
    categorySlugs: ['cloud-computing', 'software-architecture'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Docker for Developers',
    description: 'Learn Docker containerization for development, testing, and deployment.',
    isbn: '978-1491917411',
    published_at: new Date('2014-12-15'),
    authorSlugs: ['gene-kim'],
    categorySlugs: ['devops-cloud'],
    publisherSlug: 'oreilly-media'
  },
  {
    title: 'Kubernetes in 24 Hours',
    description: 'Quick start guide to Kubernetes for container orchestration and management.',
    isbn: '978-1491949408',
    published_at: new Date('2019-06-15'),
    authorSlugs: ['gene-kim'],
    categorySlugs: ['devops-cloud', 'cloud-computing'],
    publisherSlug: 'sams-publishing'
  }
];

const locations = [
  { room: 'Main Hall', floor: 1, shelf: 1, row: 1 },
  { room: 'Main Hall', floor: 1, shelf: 1, row: 2 },
  { room: 'Main Hall', floor: 1, shelf: 2, row: 1 },
  { room: 'Main Hall', floor: 1, shelf: 2, row: 2 },
  { room: 'Main Hall', floor: 1, shelf: 3, row: 1 },
  { room: 'Main Hall', floor: 1, shelf: 3, row: 2 },
  { room: 'Main Hall', floor: 1, shelf: 4, row: 1 },
  { room: 'Main Hall', floor: 1, shelf: 4, row: 2 },
  { room: 'Main Hall', floor: 2, shelf: 1, row: 1 },
  { room: 'Main Hall', floor: 2, shelf: 1, row: 2 },
  { room: 'Main Hall', floor: 2, shelf: 2, row: 1 },
  { room: 'Main Hall', floor: 2, shelf: 2, row: 2 },
  { room: 'Main Hall', floor: 2, shelf: 3, row: 1 },
  { room: 'Main Hall', floor: 2, shelf: 3, row: 2 },
  { room: 'Main Hall', floor: 3, shelf: 1, row: 1 },
  { room: 'Main Hall', floor: 3, shelf: 1, row: 2 },
  { room: 'Main Hall', floor: 3, shelf: 2, row: 1 },
  { room: 'Main Hall', floor: 3, shelf: 2, row: 2 },
  { room: 'Study Room A', floor: 1, shelf: 1, row: 1 },
  { room: 'Study Room A', floor: 1, shelf: 1, row: 2 },
  { room: 'Study Room A', floor: 1, shelf: 2, row: 1 },
  { room: 'Study Room A', floor: 1, shelf: 2, row: 2 },
  { room: 'Study Room A', floor: 1, shelf: 3, row: 1 },
  { room: 'Study Room A', floor: 2, shelf: 1, row: 1 },
  { room: 'Study Room B', floor: 1, shelf: 1, row: 1 },
  { room: 'Study Room B', floor: 1, shelf: 1, row: 2 },
  { room: 'Study Room B', floor: 1, shelf: 2, row: 1 },
  { room: 'Study Room B', floor: 1, shelf: 2, row: 2 },
  { room: 'Study Room B', floor: 1, shelf: 3, row: 1 },
  { room: 'Study Room B', floor: 2, shelf: 1, row: 1 },
  { room: 'Study Room C', floor: 1, shelf: 1, row: 1 },
  { room: 'Study Room C', floor: 1, shelf: 1, row: 2 },
  { room: 'Study Room C', floor: 1, shelf: 2, row: 1 },
  { room: 'Study Room C', floor: 1, shelf: 2, row: 2 },
  { room: 'Archive', floor: 1, shelf: 1, row: 1 },
  { room: 'Archive', floor: 1, shelf: 1, row: 2 },
  { room: 'Archive', floor: 1, shelf: 2, row: 1 },
  { room: 'Archive', floor: 1, shelf: 2, row: 2 },
  { room: 'Archive', floor: 1, shelf: 3, row: 1 },
  { room: 'Archive', floor: 2, shelf: 1, row: 1 },
  { room: 'Archive', floor: 2, shelf: 1, row: 2 },
  { room: 'Archive', floor: 2, shelf: 2, row: 1 },
  { room: 'Archive', floor: 2, shelf: 2, row: 2 },
  { room: 'Reading Room', floor: 1, shelf: 1, row: 1 },
  { room: 'Reading Room', floor: 1, shelf: 1, row: 2 },
  { room: 'Reading Room', floor: 1, shelf: 2, row: 1 },
  { room: 'Reading Room', floor: 1, shelf: 2, row: 2 },
  { room: 'Reading Room', floor: 1, shelf: 3, row: 1 },
  { room: 'Reading Room', floor: 2, shelf: 1, row: 1 },
  { room: 'Reference Section', floor: 1, shelf: 1, row: 1 },
  { room: 'Reference Section', floor: 1, shelf: 1, row: 2 },
  { room: 'Reference Section', floor: 1, shelf: 2, row: 1 },
  { room: 'Reference Section', floor: 1, shelf: 2, row: 2 },
  { room: 'Reference Section', floor: 1, shelf: 3, row: 1 },
  { room: 'Digital Media', floor: 1, shelf: 1, row: 1 },
  { room: 'Digital Media', floor: 1, shelf: 1, row: 2 },
  { room: 'Digital Media', floor: 1, shelf: 2, row: 1 },
  { room: 'Rare Books Room', floor: 2, shelf: 1, row: 1 },
  { room: 'Rare Books Room', floor: 2, shelf: 1, row: 2 }
];

// Book clones will be created after books are seeded
// Each book will get 2-5 clones distributed across different locations
const bookClonesPerBook = [
  { bookIndex: 0, count: 5, condition: ['NEW', 'GOOD', 'GOOD', 'WORN', 'GOOD'] },
  { bookIndex: 1, count: 4, condition: ['NEW', 'GOOD', 'GOOD', 'WORN'] },
  { bookIndex: 2, count: 3, condition: ['NEW', 'NEW', 'GOOD'] },
  { bookIndex: 3, count: 3, condition: ['GOOD', 'WORN', 'DAMAGED'] },
  { bookIndex: 4, count: 5, condition: ['NEW', 'GOOD', 'GOOD', 'WORN', 'GOOD'] },
  { bookIndex: 5, count: 4, condition: ['NEW', 'GOOD', 'GOOD', 'GOOD'] },
  { bookIndex: 6, count: 3, condition: ['NEW', 'NEW', 'GOOD'] },
  { bookIndex: 7, count: 4, condition: ['NEW', 'GOOD', 'WORN', 'GOOD'] },
  { bookIndex: 8, count: 3, condition: ['GOOD', 'WORN', 'DAMAGED'] },
  { bookIndex: 9, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 10, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 11, count: 4, condition: ['NEW', 'NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 12, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 13, count: 3, condition: ['NEW', 'GOOD', 'WORN'] },
  { bookIndex: 14, count: 5, condition: ['NEW', 'NEW', 'GOOD', 'GOOD', 'WORN'] },
  { bookIndex: 15, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 16, count: 4, condition: ['NEW', 'GOOD', 'GOOD', 'WORN'] },
  { bookIndex: 17, count: 2, condition: ['NEW', 'GOOD'] },
  { bookIndex: 18, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 19, count: 4, condition: ['NEW', 'NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 20, count: 3, condition: ['NEW', 'GOOD', 'WORN'] },
  { bookIndex: 21, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 22, count: 4, condition: ['NEW', 'GOOD', 'GOOD', 'WORN'] },
  { bookIndex: 23, count: 2, condition: ['NEW', 'GOOD'] },
  { bookIndex: 24, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 25, count: 4, condition: ['NEW', 'NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 26, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 27, count: 3, condition: ['NEW', 'GOOD', 'WORN'] },
  { bookIndex: 28, count: 4, condition: ['NEW', 'GOOD', 'GOOD', 'WORN'] },
  { bookIndex: 29, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 30, count: 3, condition: ['NEW', 'GOOD', 'WORN'] },
  { bookIndex: 31, count: 4, condition: ['NEW', 'NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 32, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 33, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 34, count: 4, condition: ['NEW', 'GOOD', 'GOOD', 'WORN'] },
  { bookIndex: 35, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 36, count: 3, condition: ['GOOD', 'WORN', 'DAMAGED'] },
  { bookIndex: 37, count: 4, condition: ['NEW', 'GOOD', 'GOOD', 'WORN'] },
  { bookIndex: 38, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 39, count: 3, condition: ['NEW', 'GOOD', 'WORN'] },
  { bookIndex: 40, count: 4, condition: ['NEW', 'NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 41, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 42, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 43, count: 4, condition: ['NEW', 'GOOD', 'WORN', 'GOOD'] },
  { bookIndex: 44, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 45, count: 3, condition: ['NEW', 'GOOD', 'WORN'] },
  { bookIndex: 46, count: 4, condition: ['NEW', 'NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 47, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 48, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 49, count: 4, condition: ['NEW', 'GOOD', 'GOOD', 'WORN'] },
  { bookIndex: 50, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 51, count: 3, condition: ['NEW', 'GOOD', 'WORN'] },
  { bookIndex: 52, count: 4, condition: ['NEW', 'NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 53, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 54, count: 3, condition: ['GOOD', 'WORN', 'DAMAGED'] },
  { bookIndex: 55, count: 4, condition: ['NEW', 'GOOD', 'GOOD', 'WORN'] },
  { bookIndex: 56, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 57, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 58, count: 4, condition: ['NEW', 'GOOD', 'WORN', 'GOOD'] },
  { bookIndex: 59, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 60, count: 3, condition: ['NEW', 'GOOD', 'WORN'] },
  { bookIndex: 61, count: 4, condition: ['NEW', 'NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 62, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 63, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 64, count: 4, condition: ['NEW', 'GOOD', 'GOOD', 'WORN'] },
  { bookIndex: 65, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 66, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 67, count: 4, condition: ['NEW', 'GOOD', 'WORN', 'GOOD'] },
  { bookIndex: 68, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 69, count: 3, condition: ['NEW', 'GOOD', 'WORN'] },
  { bookIndex: 70, count: 4, condition: ['NEW', 'NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 71, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 72, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 73, count: 4, condition: ['NEW', 'GOOD', 'GOOD', 'WORN'] },
  { bookIndex: 74, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 75, count: 3, condition: ['NEW', 'GOOD', 'WORN'] },
  { bookIndex: 76, count: 4, condition: ['NEW', 'NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 77, count: 3, condition: ['NEW', 'GOOD', 'GOOD'] },
  { bookIndex: 78, count: 3, condition: ['GOOD', 'WORN', 'DAMAGED'] },
  { bookIndex: 79, count: 4, condition: ['NEW', 'GOOD', 'GOOD', 'WORN'] }
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
  },
  {
    name: 'Amber Bennett',
    email: 'amber.bennett@example.com',
    password: 'Amber123!',
    role: 'MEMBER'
  },
  {
    name: 'Brandon Cross',
    email: 'brandon.cross@example.com',
    password: 'Brandon123!',
    role: 'MEMBER'
  },
  {
    name: 'Chloe Davis',
    email: 'chloe.davis@example.com',
    password: 'Chloe123!',
    role: 'MEMBER'
  },
  {
    name: 'Derek Elliott',
    email: 'derek.elliott@example.com',
    password: 'Derek123!',
    role: 'MEMBER'
  },
  {
    name: 'Elise Foster',
    email: 'elise.foster@example.com',
    password: 'Elise123!',
    role: 'MEMBER'
  },
  {
    name: 'Felix Green',
    email: 'felix.green@example.com',
    password: 'Felix123!',
    role: 'MEMBER'
  },
  {
    name: 'Gwen Hayes',
    email: 'gwen.hayes@example.com',
    password: 'Gwen123!',
    role: 'MEMBER'
  },
  {
    name: 'Hunter Irving',
    email: 'hunter.irving@example.com',
    password: 'Hunter123!',
    role: 'MEMBER'
  },
  {
    name: 'Ivy Jenkins',
    email: 'ivy.jenkins@example.com',
    password: 'Ivy123!',
    role: 'MEMBER'
  },
  {
    name: 'Jack Kelly',
    email: 'jack.kelly@example.com',
    password: 'Jack123!',
    role: 'MEMBER'
  },
  {
    name: 'Kimberly Lewis',
    email: 'kimberly.lewis@example.com',
    password: 'Kimberly123!',
    role: 'MEMBER'
  },
  {
    name: 'Logan Miller',
    email: 'logan.miller@example.com',
    password: 'Logan123!',
    role: 'MEMBER'
  },
  {
    name: 'Megan Nelson',
    email: 'megan.nelson@example.com',
    password: 'Megan123!',
    role: 'MEMBER'
  },
  {
    name: 'Nathan Oliver',
    email: 'nathan.oliver@example.com',
    password: 'Nathan123!',
    role: 'MEMBER'
  },
  {
    name: 'Oakley Parker',
    email: 'oakley.parker@example.com',
    password: 'Oakley123!',
    role: 'MEMBER'
  },
  {
    name: 'Piper Quinn',
    email: 'piper.quinn@example.com',
    password: 'Piper123!',
    role: 'MEMBER'
  },
  {
    name: 'Quinn Roberts',
    email: 'quinn.roberts@example.com',
    password: 'Quinn123!',
    role: 'MEMBER'
  },
  {
    name: 'Ryan Scott',
    email: 'ryan.scott@example.com',
    password: 'Ryan123!',
    role: 'MEMBER'
  },
  {
    name: 'Sophie Taylor',
    email: 'sophie.taylor@example.com',
    password: 'Sophie123!',
    role: 'MEMBER'
  },
  {
    name: 'Tyler Underwood',
    email: 'tyler.underwood@example.com',
    password: 'Tyler123!',
    role: 'MEMBER'
  },
  {
    name: 'Uma Vincent',
    email: 'uma.vincent@example.com',
    password: 'Uma123!',
    role: 'MEMBER'
  },
  {
    name: 'Vera Watson',
    email: 'vera.watson@example.com',
    password: 'Vera123!',
    role: 'MEMBER'
  },
  {
    name: 'Wesley Xavier',
    email: 'wesley.xavier@example.com',
    password: 'Wesley123!',
    role: 'MEMBER'
  },
  {
    name: 'Xenia Young',
    email: 'xenia.young@example.com',
    password: 'Xenia123!',
    role: 'MEMBER'
  },
  {
    name: 'Yolanda Zhang',
    email: 'yolanda.zhang@example.com',
    password: 'Yolanda123!',
    role: 'MEMBER'
  },
  {
    name: 'Zoe Adams',
    email: 'zoe.adams@example.com',
    password: 'Zoe123!',
    role: 'MEMBER'
  },
  {
    name: 'Aidan Blake',
    email: 'aidan.blake@example.com',
    password: 'Aidan123!',
    role: 'MEMBER'
  },
  {
    name: 'Bailey Carter',
    email: 'bailey.carter@example.com',
    password: 'Bailey123!',
    role: 'MEMBER'
  },
  {
    name: 'Casey Davis',
    email: 'casey.davis@example.com',
    password: 'Casey123!',
    role: 'MEMBER'
  },
  {
    name: 'Dakota Edwards',
    email: 'dakota.edwards@example.com',
    password: 'Dakota123!',
    role: 'MEMBER'
  },
  {
    name: 'Eden Foster',
    email: 'eden.foster@example.com',
    password: 'Eden123!',
    role: 'MEMBER'
  },
  {
    name: 'Finley Grant',
    email: 'finley.grant@example.com',
    password: 'Finley123!',
    role: 'MEMBER'
  },
  {
    name: 'Griffin Hayes',
    email: 'griffin.hayes@example.com',
    password: 'Griffin123!',
    role: 'MEMBER'
  },
  {
    name: 'Harley Irving',
    email: 'harley.irving@example.com',
    password: 'Harley123!',
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
  const createdBookClones = [];
  let locationIndex = 0;
  for (const cloneConfig of bookClonesPerBook) {
    const book = createdBooks[cloneConfig.bookIndex];
    if (!book) continue;

    for (let i = 0; i < cloneConfig.count; i++) {
      const location = createdLocations[locationIndex % createdLocations.length];
      const condition = cloneConfig.condition[i] || 'GOOD';
      const barcode = generateBarcode();

      const clone = await prisma.book_Clone.create({
        data: {
          book_id: book.book_id,
          location_id: location.location_id,
          barcode: barcode,
          condition: condition
        }
      });
      createdBookClones.push(clone);

      locationIndex++;
    }
    console.log(`  ✓ Created ${cloneConfig.count} clones for: ${book.title}`);
  }

  // Create Loans
  console.log('Creating loans...');
  const memberUsers = await prisma.user.findMany({
    where: { role: 'MEMBER' },
    take: 15
  });

  const loansToCreate = [
    // Active borrowed loans (recent)
    { userIndex: 0, cloneIndex: 0, daysAgo: 3, dueDays: 14, status: 'BORROWED' },
    { userIndex: 1, cloneIndex: 1, daysAgo: 5, dueDays: 14, status: 'BORROWED' },
    { userIndex: 2, cloneIndex: 2, daysAgo: 7, dueDays: 14, status: 'BORROWED' },
    { userIndex: 3, cloneIndex: 3, daysAgo: 2, dueDays: 21, status: 'BORROWED' },
    { userIndex: 4, cloneIndex: 4, daysAgo: 1, dueDays: 14, status: 'BORROWED' },
    { userIndex: 5, cloneIndex: 5, daysAgo: 10, dueDays: 14, status: 'BORROWED' },
    { userIndex: 6, cloneIndex: 6, daysAgo: 4, dueDays: 7, status: 'BORROWED' },
    { userIndex: 7, cloneIndex: 7, daysAgo: 6, dueDays: 14, status: 'BORROWED' },
    { userIndex: 8, cloneIndex: 8, daysAgo: 3, dueDays: 14, status: 'BORROWED' },
    { userIndex: 9, cloneIndex: 9, daysAgo: 8, dueDays: 21, status: 'BORROWED' },
    { userIndex: 10, cloneIndex: 10, daysAgo: 2, dueDays: 14, status: 'BORROWED' },
    { userIndex: 11, cloneIndex: 11, daysAgo: 5, dueDays: 14, status: 'BORROWED' },
    { userIndex: 12, cloneIndex: 12, daysAgo: 9, dueDays: 7, status: 'BORROWED' },
    { userIndex: 13, cloneIndex: 13, daysAgo: 1, dueDays: 14, status: 'BORROWED' },
    { userIndex: 14, cloneIndex: 14, daysAgo: 4, dueDays: 21, status: 'BORROWED' },
    // Overdue loans
    { userIndex: 0, cloneIndex: 15, daysAgo: 30, dueDays: 14, status: 'OVERDUE' },
    { userIndex: 1, cloneIndex: 16, daysAgo: 25, dueDays: 14, status: 'OVERDUE' },
    { userIndex: 2, cloneIndex: 17, daysAgo: 45, dueDays: 21, status: 'OVERDUE' },
    { userIndex: 3, cloneIndex: 18, daysAgo: 20, dueDays: 7, status: 'OVERDUE' },
    { userIndex: 4, cloneIndex: 19, daysAgo: 35, dueDays: 14, status: 'OVERDUE' },
    { userIndex: 5, cloneIndex: 20, daysAgo: 40, dueDays: 14, status: 'OVERDUE' },
    { userIndex: 6, cloneIndex: 21, daysAgo: 22, dueDays: 14, status: 'OVERDUE' },
    // Returned loans (historical)
    { userIndex: 0, cloneIndex: 22, daysAgo: 60, dueDays: 14, returnedDaysAgo: 50, status: 'RETURNED' },
    { userIndex: 1, cloneIndex: 23, daysAgo: 45, dueDays: 14, returnedDaysAgo: 35, status: 'RETURNED' },
    { userIndex: 2, cloneIndex: 24, daysAgo: 30, dueDays: 21, returnedDaysAgo: 15, status: 'RETURNED' },
    { userIndex: 3, cloneIndex: 25, daysAgo: 90, dueDays: 14, returnedDaysAgo: 80, status: 'RETURNED' },
    { userIndex: 4, cloneIndex: 26, daysAgo: 75, dueDays: 14, returnedDaysAgo: 65, status: 'RETURNED' },
    { userIndex: 5, cloneIndex: 27, daysAgo: 50, dueDays: 7, returnedDaysAgo: 45, status: 'RETURNED' },
    { userIndex: 6, cloneIndex: 28, daysAgo: 40, dueDays: 14, returnedDaysAgo: 30, status: 'RETURNED' },
    { userIndex: 7, cloneIndex: 29, daysAgo: 100, dueDays: 21, returnedDaysAgo: 85, status: 'RETURNED' },
    { userIndex: 8, cloneIndex: 30, daysAgo: 120, dueDays: 14, returnedDaysAgo: 110, status: 'RETURNED' },
    { userIndex: 9, cloneIndex: 31, daysAgo: 80, dueDays: 14, returnedDaysAgo: 70, status: 'RETURNED' },
    { userIndex: 10, cloneIndex: 32, daysAgo: 55, dueDays: 14, returnedDaysAgo: 48, status: 'RETURNED' },
    { userIndex: 11, cloneIndex: 33, daysAgo: 70, dueDays: 21, returnedDaysAgo: 60, status: 'RETURNED' },
    { userIndex: 12, cloneIndex: 34, daysAgo: 35, dueDays: 14, returnedDaysAgo: 25, status: 'RETURNED' },
    { userIndex: 13, cloneIndex: 35, daysAgo: 42, dueDays: 14, returnedDaysAgo: 32, status: 'RETURNED' },
    { userIndex: 14, cloneIndex: 36, daysAgo: 65, dueDays: 7, returnedDaysAgo: 58, status: 'RETURNED' },
    { userIndex: 0, cloneIndex: 37, daysAgo: 85, dueDays: 14, returnedDaysAgo: 75, status: 'RETURNED' },
    { userIndex: 1, cloneIndex: 38, daysAgo: 50, dueDays: 14, returnedDaysAgo: 40, status: 'RETURNED' },
    { userIndex: 2, cloneIndex: 39, daysAgo: 72, dueDays: 21, returnedDaysAgo: 62, status: 'RETURNED' },
    { userIndex: 3, cloneIndex: 40, daysAgo: 38, dueDays: 14, returnedDaysAgo: 28, status: 'RETURNED' },
    { userIndex: 4, cloneIndex: 41, daysAgo: 95, dueDays: 14, returnedDaysAgo: 85, status: 'RETURNED' },
    { userIndex: 5, cloneIndex: 42, daysAgo: 60, dueDays: 7, returnedDaysAgo: 55, status: 'RETURNED' },
    { userIndex: 6, cloneIndex: 43, daysAgo: 45, dueDays: 14, returnedDaysAgo: 35, status: 'RETURNED' },
    { userIndex: 7, cloneIndex: 44, daysAgo: 77, dueDays: 14, returnedDaysAgo: 67, status: 'RETURNED' },
    { userIndex: 8, cloneIndex: 45, daysAgo: 52, dueDays: 21, returnedDaysAgo: 42, status: 'RETURNED' },
    { userIndex: 9, cloneIndex: 46, daysAgo: 110, dueDays: 14, returnedDaysAgo: 100, status: 'RETURNED' },
    { userIndex: 10, cloneIndex: 47, daysAgo: 66, dueDays: 14, returnedDaysAgo: 56, status: 'RETURNED' },
    { userIndex: 11, cloneIndex: 48, daysAgo: 48, dueDays: 14, returnedDaysAgo: 38, status: 'RETURNED' },
    { userIndex: 12, cloneIndex: 49, daysAgo: 81, dueDays: 7, returnedDaysAgo: 74, status: 'RETURNED' },
    { userIndex: 13, cloneIndex: 50, daysAgo: 58, dueDays: 14, returnedDaysAgo: 48, status: 'RETURNED' },
    { userIndex: 14, cloneIndex: 51, daysAgo: 39, dueDays: 14, returnedDaysAgo: 29, status: 'RETURNED' },
    { userIndex: 0, cloneIndex: 52, daysAgo: 105, dueDays: 21, returnedDaysAgo: 95, status: 'RETURNED' },
    { userIndex: 1, cloneIndex: 53, daysAgo: 63, dueDays: 14, returnedDaysAgo: 53, status: 'RETURNED' },
    { userIndex: 2, cloneIndex: 54, daysAgo: 76, dueDays: 14, returnedDaysAgo: 66, status: 'RETURNED' },
    { userIndex: 3, cloneIndex: 55, daysAgo: 44, dueDays: 14, returnedDaysAgo: 34, status: 'RETURNED' },
    { userIndex: 4, cloneIndex: 56, daysAgo: 88, dueDays: 7, returnedDaysAgo: 80, status: 'RETURNED' },
    { userIndex: 5, cloneIndex: 57, daysAgo: 55, dueDays: 14, returnedDaysAgo: 45, status: 'RETURNED' },
    { userIndex: 6, cloneIndex: 58, daysAgo: 67, dueDays: 14, returnedDaysAgo: 57, status: 'RETURNED' },
    { userIndex: 7, cloneIndex: 59, daysAgo: 92, dueDays: 21, returnedDaysAgo: 82, status: 'RETURNED' },
    { userIndex: 8, cloneIndex: 60, daysAgo: 47, dueDays: 14, returnedDaysAgo: 37, status: 'RETURNED' },
    { userIndex: 9, cloneIndex: 61, daysAgo: 83, dueDays: 14, returnedDaysAgo: 73, status: 'RETURNED' },
    { userIndex: 10, cloneIndex: 62, daysAgo: 58, dueDays: 14, returnedDaysAgo: 48, status: 'RETURNED' },
    { userIndex: 11, cloneIndex: 63, daysAgo: 71, dueDays: 7, returnedDaysAgo: 64, status: 'RETURNED' },
    { userIndex: 12, cloneIndex: 64, daysAgo: 39, dueDays: 14, returnedDaysAgo: 29, status: 'RETURNED' },
    { userIndex: 13, cloneIndex: 65, daysAgo: 78, dueDays: 14, returnedDaysAgo: 68, status: 'RETURNED' },
    { userIndex: 14, cloneIndex: 66, daysAgo: 54, dueDays: 21, returnedDaysAgo: 44, status: 'RETURNED' },
    { userIndex: 0, cloneIndex: 67, daysAgo: 90, dueDays: 14, returnedDaysAgo: 80, status: 'RETURNED' },
    { userIndex: 1, cloneIndex: 68, daysAgo: 62, dueDays: 14, returnedDaysAgo: 52, status: 'RETURNED' },
    { userIndex: 2, cloneIndex: 69, daysAgo: 49, dueDays: 14, returnedDaysAgo: 39, status: 'RETURNED' },
    { userIndex: 3, cloneIndex: 70, daysAgo: 73, dueDays: 7, returnedDaysAgo: 66, status: 'RETURNED' },
    { userIndex: 4, cloneIndex: 71, daysAgo: 56, dueDays: 14, returnedDaysAgo: 46, status: 'RETURNED' },
    { userIndex: 5, cloneIndex: 72, daysAgo: 68, dueDays: 14, returnedDaysAgo: 58, status: 'RETURNED' },
    { userIndex: 6, cloneIndex: 73, daysAgo: 84, dueDays: 21, returnedDaysAgo: 74, status: 'RETURNED' },
    { userIndex: 7, cloneIndex: 74, daysAgo: 51, dueDays: 14, returnedDaysAgo: 41, status: 'RETURNED' },
    { userIndex: 8, cloneIndex: 75, daysAgo: 79, dueDays: 14, returnedDaysAgo: 69, status: 'RETURNED' },
    { userIndex: 9, cloneIndex: 76, daysAgo: 60, dueDays: 14, returnedDaysAgo: 50, status: 'RETURNED' },
    { userIndex: 10, cloneIndex: 77, daysAgo: 74, dueDays: 7, returnedDaysAgo: 67, status: 'RETURNED' },
    { userIndex: 11, cloneIndex: 78, daysAgo: 41, dueDays: 14, returnedDaysAgo: 31, status: 'RETURNED' },
    { userIndex: 12, cloneIndex: 79, daysAgo: 80, dueDays: 14, returnedDaysAgo: 70, status: 'RETURNED' }
  ];

  const now = new Date();
  for (const loanConfig of loansToCreate) {
    const user = memberUsers[loanConfig.userIndex % memberUsers.length];
    const clone = createdBookClones[loanConfig.cloneIndex % createdBookClones.length];

    if (!user || !clone) continue;

    const loanDate = new Date(now);
    loanDate.setDate(loanDate.getDate() - loanConfig.daysAgo);

    const dueDate = new Date(loanDate);
    dueDate.setDate(dueDate.getDate() + loanConfig.dueDays);

    let returnDate = null;
    if (loanConfig.returnedDaysAgo !== undefined) {
      returnDate = new Date(now);
      returnDate.setDate(returnDate.getDate() - loanConfig.returnedDaysAgo);
    }

    await prisma.loan.create({
      data: {
        user_id: user.user_id,
        book_clone_id: clone.book_clone_id,
        loan_date: loanDate,
        due_date: dueDate,
        return_date: returnDate,
        status: loanConfig.status
      }
    });
  }
  console.log(
    `  ✓ Created ${loansToCreate.length} loans (${loansToCreate.filter((l) => l.status === 'BORROWED').length} borrowed, ${loansToCreate.filter((l) => l.status === 'OVERDUE').length} overdue, ${loansToCreate.filter((l) => l.status === 'RETURNED').length} returned)`
  );

  // Create Ratings
  console.log('Creating ratings...');
  const ratingsToCreate = [
    { userIndex: 0, bookIndex: 0, rate: 5, comment: 'Excellent book! Very informative and well-written.' },
    { userIndex: 1, bookIndex: 1, rate: 4, comment: 'Great content but quite technical for beginners.' },
    { userIndex: 2, bookIndex: 2, rate: 5, comment: 'A must-read for every developer.' },
    { userIndex: 3, bookIndex: 3, rate: 5, comment: 'Classic work. Highly recommended.' },
    { userIndex: 4, bookIndex: 4, rate: 4, comment: 'Good insights on TDD practices.' },
    { userIndex: 5, bookIndex: 5, rate: 5, comment: 'Practical and effective Java guide.' },
    { userIndex: 6, bookIndex: 6, rate: 3, comment: 'Good introduction but covers limited topics.' },
    { userIndex: 7, bookIndex: 7, rate: 5, comment: 'Amazing book about pragmatism in programming.' },
    { userIndex: 8, bookIndex: 8, rate: 4, comment: 'Insightful DevOps narrative.' },
    { userIndex: 9, bookIndex: 9, rate: 5, comment: 'Essential for working with legacy code.' },
    { userIndex: 10, bookIndex: 10, rate: 4, comment: 'Comprehensive guide to microservices.' },
    { userIndex: 11, bookIndex: 11, rate: 5, comment: 'Principles of clean architecture explained clearly.' },
    { userIndex: 12, bookIndex: 12, rate: 4, comment: 'Excellent guide on continuous delivery.' },
    { userIndex: 13, bookIndex: 13, rate: 5, comment: 'Data-intensive applications covered thoroughly.' },
    { userIndex: 14, bookIndex: 14, rate: 5, comment: 'Google insights on running production systems.' },
    { userIndex: 0, bookIndex: 15, rate: 4, comment: 'Enterprise architecture patterns explained well.' },
    { userIndex: 1, bookIndex: 16, rate: 5, comment: 'Best book on XP practices.' },
    { userIndex: 2, bookIndex: 17, rate: 4, comment: 'Practical microservices patterns with code.' },
    { userIndex: 3, bookIndex: 18, rate: 5, comment: 'JavaScript goodness in one place.' },
    { userIndex: 4, bookIndex: 19, rate: 5, comment: 'Code Complete is essential reading.' },
    { userIndex: 5, bookIndex: 20, rate: 4, comment: 'Classic C book, still relevant.' },
    { userIndex: 6, bookIndex: 21, rate: 5, comment: 'Algorithms book with great depth.' },
    { userIndex: 7, bookIndex: 22, rate: 4, comment: 'System design interview prep guide.' },
    { userIndex: 8, bookIndex: 23, rate: 5, comment: 'Concurrency in Go explained clearly.' },
    { userIndex: 9, bookIndex: 24, rate: 4, comment: 'Linux programming interface comprehensive.' },
    { userIndex: 10, bookIndex: 25, rate: 5, comment: 'Managing software projects effectively.' },
    { userIndex: 11, bookIndex: 26, rate: 4, comment: 'Code hidden language is fascinating.' },
    { userIndex: 12, bookIndex: 27, rate: 5, comment: 'Practical tips for every programmer.' },
    { userIndex: 13, bookIndex: 28, rate: 4, comment: 'Security design best practices.' },
    { userIndex: 14, bookIndex: 29, rate: 5, comment: 'Node.js microservices guide excellent.' },
    { userIndex: 0, bookIndex: 30, rate: 4, comment: 'Web performance optimization practical.' },
    { userIndex: 1, bookIndex: 31, rate: 5, comment: 'Enterprise integration patterns valuable.' },
    { userIndex: 2, bookIndex: 32, rate: 5, comment: 'Distributed systems in practice helpful.' },
    { userIndex: 3, bookIndex: 33, rate: 4, comment: 'Performance testing guidance clear.' },
    { userIndex: 4, bookIndex: 34, rate: 5, comment: 'RxJava reactive programming guide great.' },
    { userIndex: 5, bookIndex: 35, rate: 4, comment: 'Scalability rules well documented.' },
    { userIndex: 6, bookIndex: 36, rate: 5, comment: 'API design best practices comprehensive.' },
    { userIndex: 7, bookIndex: 37, rate: 4, comment: 'Container security important topic.' },
    { userIndex: 8, bookIndex: 38, rate: 5, comment: 'Machine learning fundamentals explained.' },
    { userIndex: 9, bookIndex: 39, rate: 5, comment: 'Deep learning practical guide excellent.' },
    { userIndex: 10, bookIndex: 40, rate: 4, comment: 'Statistics for data scientists useful.' },
    { userIndex: 11, bookIndex: 41, rate: 5, comment: 'Computer vision with Python comprehensive.' },
    { userIndex: 12, bookIndex: 42, rate: 4, comment: 'NLP techniques well explained.' },
    { userIndex: 13, bookIndex: 43, rate: 5, comment: 'Time series analysis detailed guide.' },
    { userIndex: 14, bookIndex: 44, rate: 4, comment: 'Blockchain basics clear introduction.' },
    { userIndex: 0, bookIndex: 45, rate: 5, comment: 'IoT design and prototyping practical.' },
    { userIndex: 1, bookIndex: 46, rate: 5, comment: 'Game development Unity guide excellent.' },
    { userIndex: 2, bookIndex: 47, rate: 4, comment: 'React Native for mobile apps great.' },
    { userIndex: 3, bookIndex: 48, rate: 5, comment: 'UI/UX design principles comprehensive.' },
    { userIndex: 4, bookIndex: 49, rate: 4, comment: 'Digital marketing analytics useful.' },
    { userIndex: 5, bookIndex: 50, rate: 5, comment: 'Graph databases introduction helpful.' },
    { userIndex: 6, bookIndex: 51, rate: 5, comment: 'SQL performance tuning essential.' },
    { userIndex: 7, bookIndex: 52, rate: 4, comment: 'Network protocols handbook reference.' },
    { userIndex: 8, bookIndex: 53, rate: 5, comment: 'Cryptography engineering detailed guide.' },
    { userIndex: 9, bookIndex: 54, rate: 4, comment: 'Penetration testing practical handbook.' },
    { userIndex: 10, bookIndex: 55, rate: 5, comment: 'Web security testing comprehensive.' },
    { userIndex: 11, bookIndex: 56, rate: 5, comment: 'Learning Go effective guide.' },
    { userIndex: 12, bookIndex: 57, rate: 4, comment: 'Rust in action detailed explanations.' },
    { userIndex: 13, bookIndex: 58, rate: 5, comment: 'Programming in Scala excellent.' },
    { userIndex: 14, bookIndex: 59, rate: 4, comment: 'Elixir concurrent programming guide.' }
  ];

  let ratingsCreated = 0;
  for (const ratingConfig of ratingsToCreate) {
    try {
      const user = memberUsers[ratingConfig.userIndex % memberUsers.length];
      const book = createdBooks[ratingConfig.bookIndex % createdBooks.length];

      if (!user || !book) continue;

      await prisma.rating.create({
        data: {
          user_id: user.user_id,
          book_id: book.book_id,
          rate: ratingConfig.rate,
          comment: ratingConfig.comment
        }
      });
      ratingsCreated++;
    } catch {
      // Ignore duplicate ratings
    }
  }
  console.log(`  ✓ Created ${ratingsCreated} ratings`);

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
