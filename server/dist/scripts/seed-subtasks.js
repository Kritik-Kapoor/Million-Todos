import { prisma } from "../config/db.js";
const TODO_ID = "52bb6f7a-ed88-4774-b3ae-1a42caedad27";
const TOTAL_SUBTASKS = 1_000;
const POSITION_GAP = 1_000;
const BATCH_SIZE = 500;
const seedSubtasks = async () => {
    try {
        console.log("Seeding subtasks...");
        for (let i = 0; i < TOTAL_SUBTASKS; i += BATCH_SIZE) {
            const batch = Array.from({ length: Math.min(BATCH_SIZE, TOTAL_SUBTASKS - i) }, (_, index) => ({
                todoId: TODO_ID,
                title: `Subtask ${i + index + 1}`,
                completed: false,
                position: (i + index + 1) * POSITION_GAP,
            }));
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
    }
    catch (error) {
        console.error("Error seeding subtasks:", error);
    }
    finally {
        await prisma.$disconnect();
    }
};
seedSubtasks();
