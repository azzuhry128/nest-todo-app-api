-- AlterTable
ALTER TABLE "todos" ADD COLUMN     "due_date" TIMESTAMP(3),
ADD COLUMN     "priority" TEXT DEFAULT 'low',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
