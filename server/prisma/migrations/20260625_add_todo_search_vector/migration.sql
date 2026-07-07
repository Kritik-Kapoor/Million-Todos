-- Add full-text search vector (generated column) and GIN index
ALTER TABLE "Todo"
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
    to_tsvector(
        'english',
        coalesce(title, '') || ' ' || coalesce(description, '')
    )
) STORED;

CREATE INDEX "todo_search_vector_idx"
ON "Todo"
USING GIN (search_vector);
