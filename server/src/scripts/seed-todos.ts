import { prisma } from "../config/db.js";

/**
 * Seed todos for a single user.
 *
 * Before running:
 * 1. Register/login locally and copy your user id from the database.
 *    Example: SELECT id, email FROM "User";
 * 2. Replace USER_ID below with that value.
 * 3. Run: npm run seed:todos
 */
// Required: set this to your local user's id from the "User" table.
const USER_ID = "4e8c60d2-6cc3-4f1a-b207-3486467bea4b";
const TOTAL_TODOS = 750_000;
const BATCH_SIZE = 10_000;

const seedTodos = async () => {
  try {
    console.log("Seeding todos...");
    for (let i = 0; i < TOTAL_TODOS; i += BATCH_SIZE) {
      const batch = Array.from(
        { length: Math.min(BATCH_SIZE, TOTAL_TODOS - i) },
        (_, index) => ({
          userId: USER_ID,
          title: `Todo ${i + index + 1}`,
          description: `Description for Todo ${i + index + 1}`,
        }),
      );

      await prisma.todo.createMany({
        data: batch,
      });

      console.log(`Seeded ${i + BATCH_SIZE} of ${TOTAL_TODOS} todos`);
    }

    console.log("Todos seeded successfully");
  } catch (error) {
    console.error("Error seeding todos:", error);
  }
};

seedTodos();
