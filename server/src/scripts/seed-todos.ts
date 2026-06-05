import { prisma } from "../config/db.js";

const USER_ID = "f0edac5a-9082-4033-9cf9-ef8de696102d";
const TOTAL_TODOS = 1_000_000;
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
          completed: false,
          seq: i + index + 1,
        }),
      );

      await prisma.todo.createMany({
        data: batch,
      });

      console.log(`Seeded ${i + BATCH_SIZE} of ${TOTAL_TODOS} todos`);
    }

    console.log("Todos seeded successfully");
    console.timeEnd("Seeding todos");
  } catch (error) {
    console.error("Error seeding todos:", error);
  }
};

seedTodos();
