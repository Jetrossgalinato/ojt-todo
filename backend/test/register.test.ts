import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
// import { RegisterService } from '../src/auth/register.service';
// import { PrismaService } from '../src/database/prisma.service';

describe('Register', () => {
  let registerService: any; // replace `any` with RegisterService

  before(async () => {
    // Setup: instantiate service, connect test DB, etc.
    // registerService = new RegisterService(new PrismaService());
  });

  after(async () => {
    // Cleanup: disconnect DB, clear test data, etc.
  });

  test('should register a new user with valid data', async () => {
    const input = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      name: 'Test User',
    };

    // const result = await registerService.register(input);

    // assert.ok(result);
    // assert.equal(result.email, input.email);
    // assert.ok(!result.password); // password should never be returned
  });

  test('should throw an error if email already exists', async () => {
    const input = {
      email: 'duplicate@example.com',
      password: 'SecurePass123!',
      name: 'Duplicate User',
    };

    // await registerService.register(input);

    // await assert.rejects(
    //   () => registerService.register(input),
    //   /email already exists/i
    // );
  });

  test('should throw an error for invalid email format', async () => {
    const input = {
      email: 'not-an-email',
      password: 'SecurePass123!',
      name: 'Invalid Email',
    };

    // await assert.rejects(
    //   () => registerService.register(input),
    //   /invalid email/i
    // );
  });

  test('should hash the password before saving', async () => {
    const input = {
      email: 'hashtest@example.com',
      password: 'PlainPassword123!',
      name: 'Hash Test',
    };

    // const result = await registerService.register(input);
    // assert.notEqual(result.password, input.password);
  });
});