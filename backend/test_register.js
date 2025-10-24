// Simple test script to check registration
import { PrismaClient } from './src/generated/prisma/index.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testRegistration() {
    try {
        console.log('Testing database connection...');

        // First, test basic connection
        const userCount = await prisma.user.count();
        console.log(`Current user count: ${userCount}`);

        // Test encryption
        const testPassword = 'password123';
        console.log('Testing password encryption...');
        const hashedPassword = await bcrypt.hash(testPassword, 8);
        console.log('Password encrypted successfully');

        // Test user creation
        console.log('Testing user creation...');
        const testUser = {
            email: 'test@example.com',
            name: 'Test User',
            password: hashedPassword,
            role: 'user'
        };

        // First check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: testUser.email }
        });

        if (existingUser) {
            console.log('Test user already exists, deleting first...');
            await prisma.user.delete({
                where: { email: testUser.email }
            });
        }

        const newUser = await prisma.user.create({
            data: testUser,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isEmailVerified: true,
                createdAt: true,
                updatedAt: true
            }
        });

        console.log('User created successfully:', newUser);

        // Clean up
        await prisma.user.delete({
            where: { id: newUser.id }
        });
        console.log('Test user cleaned up');
    } catch (error) {
        console.error('Registration test failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

testRegistration()
    .then(() => {
        console.log('✅ Registration functionality is working!');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Registration test failed:', error.message);
        process.exit(1);
    });
