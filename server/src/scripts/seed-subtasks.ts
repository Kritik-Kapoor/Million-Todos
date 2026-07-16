import { prisma } from "../config/db.js";

// Update this to the todo ID you want to seed subtasks for
const TODO_ID = "89cee62b-8c4d-4c13-a51e-b08f0273a3fb";
// const TODO_ID = "16bc784e-6231-4979-8731-75fa13386a75";
const TOTAL_SUBTASKS = 100;
const POSITION_GAP = 1_000;
const BATCH_SIZE = 500;

const seedSubtasks = async () => {
  try {
    console.log("Seeding subtasks...");
    for (let i = 0; i < TOTAL_SUBTASKS; i += BATCH_SIZE) {
      const batch = Array.from(
        { length: Math.min(BATCH_SIZE, TOTAL_SUBTASKS - i) },
        (_, index) => ({
          todoId: TODO_ID,
          title: `Subtask ${i + index + 1}`,
          position: (i + index + 1) * POSITION_GAP,
        }),
      );

      await prisma.subtask.createMany({
        data: batch,
      });

      console.log(`Seeded ${i + BATCH_SIZE} of ${TOTAL_SUBTASKS} subtasks`);
    }

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
