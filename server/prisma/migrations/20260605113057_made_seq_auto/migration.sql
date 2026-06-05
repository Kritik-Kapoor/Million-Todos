-- AlterTable
CREATE SEQUENCE todo_seq_seq;
ALTER TABLE "Todo" ALTER COLUMN "seq" SET DEFAULT nextval('todo_seq_seq');
ALTER SEQUENCE todo_seq_seq OWNED BY "Todo"."seq";
