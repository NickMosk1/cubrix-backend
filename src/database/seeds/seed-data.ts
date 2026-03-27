import { UserRole } from '../../types/user';

export const SEED_USER_PASSWORDS = {
  admin: 'Admin123!',
  user: 'User123!',
} as const;

export const SEED_USERS = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    username: 'admin',
    email: 'admin@cubrix.local',
    password: SEED_USER_PASSWORDS.admin,
    role: UserRole.ADMIN,
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    username: 'builder_anna',
    email: 'anna@cubrix.local',
    password: SEED_USER_PASSWORDS.user,
    role: UserRole.USER,
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    username: 'brick_max',
    email: 'max@cubrix.local',
    password: SEED_USER_PASSWORDS.user,
    role: UserRole.USER,
  },
] as const;

export const SEED_COLLECTIONS = [
  {
    id: '20000000-0000-4000-8000-000000000001',
    name: 'StarWars',
    description: 'LEGO sets inspired by the Star Wars universe',
    logo: 'https://images.lego.example/collections/starwars.png',
  },
  {
    id: '20000000-0000-4000-8000-000000000002',
    name: 'Technic',
    description: 'Advanced engineering-focused LEGO sets',
    logo: 'https://images.lego.example/collections/technic.png',
  },
  {
    id: '20000000-0000-4000-8000-000000000003',
    name: 'Seasonal',
    description: 'Holiday and seasonal LEGO releases',
    logo: 'https://images.lego.example/collections/seasonal.png',
  },
] as const;

export const SEED_PRODUCTS = [
  {
    id: '30000000-0000-4000-8000-000000000001',
    name: 'LEGO_75379',
    description: 'R2-D2 collectible model',
    price: 9999,
    image: 'https://images.lego.example/products/75379.png',
    collectionId: SEED_COLLECTIONS[0].id,
  },
  {
    id: '30000000-0000-4000-8000-000000000002',
    name: 'LEGO_75337',
    description: 'AT-TE Walker set',
    price: 14999,
    image: 'https://images.lego.example/products/75337.png',
    collectionId: SEED_COLLECTIONS[0].id,
  },
  {
    id: '30000000-0000-4000-8000-000000000003',
    name: 'LEGO_42154',
    description: 'Ford GT 2022 Technic model',
    price: 11999,
    image: 'https://images.lego.example/products/42154.png',
    collectionId: SEED_COLLECTIONS[1].id,
  },
  {
    id: '30000000-0000-4000-8000-000000000004',
    name: 'LEGO_42161',
    description: 'Lamborghini Huracan Tecnica Technic model',
    price: 5499,
    image: 'https://images.lego.example/products/42161.png',
    collectionId: SEED_COLLECTIONS[1].id,
  },
  {
    id: '30000000-0000-4000-8000-000000000005',
    name: 'LEGO_10327',
    description: 'Dune Atreides Royal Ornithopter',
    price: 17999,
    image: 'https://images.lego.example/products/10327.png',
    collectionId: null,
  },
  {
    id: '30000000-0000-4000-8000-000000000006',
    name: 'LEGO_31147',
    description: 'Retro camera creator set',
    price: 2999,
    image: 'https://images.lego.example/products/31147.png',
    collectionId: null,
  },
] as const;

export const SEED_BALANCES = [
  {
    id: '40000000-0000-4000-8000-000000000001',
    userId: SEED_USERS[0].id,
    value: 150000,
  },
  {
    id: '40000000-0000-4000-8000-000000000002',
    userId: SEED_USERS[1].id,
    value: 80000,
  },
  {
    id: '40000000-0000-4000-8000-000000000003',
    userId: SEED_USERS[2].id,
    value: 25000,
  },
] as const;

export const SEED_TRANSACTIONS = [
  {
    id: '50000000-0000-4000-8000-000000000001',
    userId: SEED_USERS[0].id,
    type: 'deposit' as const,
    amount: 150000,
  },
  {
    id: '50000000-0000-4000-8000-000000000002',
    userId: SEED_USERS[1].id,
    type: 'deposit' as const,
    amount: 100000,
  },
  {
    id: '50000000-0000-4000-8000-000000000003',
    userId: SEED_USERS[1].id,
    type: 'purchase' as const,
    amount: 20000,
  },
  {
    id: '50000000-0000-4000-8000-000000000004',
    userId: SEED_USERS[2].id,
    type: 'deposit' as const,
    amount: 40000,
  },
  {
    id: '50000000-0000-4000-8000-000000000005',
    userId: SEED_USERS[2].id,
    type: 'purchase' as const,
    amount: 15000,
  },
] as const;
