import { prisma } from "../config/db.js";
const USER_ID = "4e8c60d2-6cc3-4f1a-b207-3486467bea4b";
const TOTAL_TODOS = process.env.NODE_ENV === "development" ? 2_000_000 : 750_000;
const BATCH_SIZE = 10_000;
const seedTodos = async () => {
    try {
        console.log("Seeding todos...");
        for (let i = 0; i < TOTAL_TODOS; i += BATCH_SIZE) {
            const batch = Array.from({ length: Math.min(BATCH_SIZE, TOTAL_TODOS - i) }, (_, index) => ({
                userId: USER_ID,
                title: `Todo ${i + index + 1}`,
                description: `Description for Todo ${i + index + 1}`,
            }));
            await prisma.todo.createMany({
                data: batch,
            });
            console.log(`Seeded ${i + BATCH_SIZE} of ${TOTAL_TODOS} todos`);
        }
        console.log("Todos seeded successfully");
    }
    catch (error) {
        console.error("Error seeding todos:", error);
    }
};
seedTodos();
