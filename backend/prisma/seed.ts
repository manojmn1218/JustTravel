import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const LOCATIONS = [
  {
    name: 'Bali, Indonesia',
    category: 'beach',
    duration: '5 days',
    price: 45000,
    image: '/images/tropical.jpg',
    description: 'A tropical paradise with stunning beaches, ancient temples, and vibrant culture.',
    rating: 4.8,
    popular: true,
  },
  {
    name: 'Maldives',
    category: 'beach',
    duration: '4 days',
    price: 65000,
    image: '/images/maldives.png',
    description: 'Crystal-clear waters, overwater villas, and world-class diving experiences.',
    rating: 4.9,
    popular: true,
  },
  {
    name: 'Goa, India',
    category: 'beach',
    duration: '3 days',
    price: 15000,
    image: '/images/goa.png',
    description: 'Sun-kissed beaches, vibrant nightlife, Portuguese heritage, and seafood cuisine.',
    rating: 4.5,
    popular: true,
  },
  {
    name: 'London, UK',
    category: 'city',
    duration: '4 days',
    price: 120000,
    image: '/images/city.jpeg',
    description: 'Historic landmarks, world-class museums, theater, and British culture.',
    rating: 4.6,
    popular: false,
  },
  {
    name: 'Paris, France',
    category: 'city',
    duration: '3 days',
    price: 95000,
    image: '/images/city.jpeg',
    description: 'The City of Light — Eiffel Tower, Louvre, fine dining, and romance.',
    rating: 4.7,
    popular: true,
  },
  {
    name: 'Dubai, UAE',
    category: 'city',
    duration: '3 days',
    price: 55000,
    image: '/images/city.jpeg',
    description: 'Futuristic skyline, luxury shopping, desert safaris, and world records.',
    rating: 4.5,
    popular: true,
  },
  {
    name: 'Himalayas, India',
    category: 'mountain',
    duration: '7 days',
    price: 28000,
    image: '/images/himachal.png',
    description: 'Majestic peaks, spiritual retreats, and breathtaking Himalayan landscapes.',
    rating: 4.8,
    popular: true,
  },
  {
    name: 'Manali Trek',
    category: 'mountain',
    duration: '5 days',
    price: 18000,
    image: '/images/trek.png',
    description: 'Adventure trekking through pine forests, snow-capped peaks, and scenic valleys.',
    rating: 4.4,
    popular: false,
  },
  {
    name: 'Kedarkantha',
    category: 'mountain',
    duration: '4 days',
    price: 12000,
    image: '/images/himachal.png',
    description: 'One of the best winter treks in India with stunning 360° summit views.',
    rating: 4.6,
    popular: false,
  },
]

async function main() {
  const adminEmail = 'admin@travel.com'
  const adminPassword = 'admin123'

  const passwordHash = await bcrypt.hash(adminPassword, 10)

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: 'Admin',
      role: 'admin',
      passwordHash,
    },
    update: {
      name: 'Admin',
      role: 'admin',
      passwordHash,
    },
  })

  // Seed locations — skip any that already exist (match by name)
  for (const loc of LOCATIONS) {
    const existing = await prisma.location.findFirst({ where: { name: loc.name } })
    if (!existing) {
      await prisma.location.create({ data: loc })
    }
  }

  // eslint-disable-next-line no-console
  console.log('✅ Seeded admin user and', LOCATIONS.length, 'locations')
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
