ALTER TABLE "Todo"
ADD COLUMN search_vector tsvector;

UPDATE "Todo"
SET search_vector =
    to_tsvector(
        'english',
        coalesce(title, '') || ' ' || coalesce(description, '')
    );

CREATE INDEX "todo_search_vector_idx"
ON "Todo"
USING GIN (search_vector);

DROP TRIGGER IF EXISTS todo_search_vector_trigger ON "Todo";

CREATE OR REPLACE FUNCTION update_todo_search_vector()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.search_vector :=
        to_tsvector(
            'english',
            coalesce(NEW.title, '') || ' ' || coalesce(NEW.description, '')
        );
    RETURN NEW;
END;
$$;

CREATE TRIGGER todo_search_vector_trigger
BEFORE INSERT OR UPDATE OF title, description
ON "Todo"
FOR EACH ROW
EXECUTE FUNCTION update_todo_search_vector();