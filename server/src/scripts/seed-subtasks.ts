import { prisma } from "../config/db.js";

/**
 * Seed subtasks for a single todo.
 *
 * Before running:
 * 1. Create or pick a todo in your local database and copy its id.
 *    Example: SELECT id, title FROM "Todo" WHERE "userId" = '<your-user-id>' LIMIT 5;
 * 2. Replace TODO_ID below with that value.
 * 3. Run: npm run seed:subtasks
 */
// Required: set this to a todo id from your local "Todo" table.
const TODO_ID = "fe6a0a62-145e-4fde-8d5f-44ad2faf6493";
const TOTAL_SUBTASKS = 100;
const POSITION_GAP = 1_000;

const seedSubtasks = async () => {
  try {
    console.log(`Seeding ${TOTAL_SUBTASKS} subtasks...`);

    await prisma.subtask.createMany({
      data: Array.from({ length: TOTAL_SUBTASKS }, (_, index) => ({
        todoId: TODO_ID,
        title: `Subtask ${index + 1}`,
        position: (index + 1) * POSITION_GAP,
      })),
    });

    await prisma.todo.update({
      where: { id: TODO_ID },
      data: { subtaskCount: TOTAL_SUBTASKS },
    });

    console.log("Subtasks seeded successfully");
  } catch (error) {
    console.error("Error seeding subtasks:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seedSubtasks();
