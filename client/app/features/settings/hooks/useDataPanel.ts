import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteAllTodos } from "../api";
import getErrorMessage from "@/lib/utils/getErrorMessage";
import { useTodoStore } from "@/features/todos/store";

export function useDataPanel() {
  const { resetTodos } = useTodoStore();

  const deleteAllTodosMutation = useMutation({
    mutationFn: deleteAllTodos,
    onSuccess: () => {
      resetTodos();
      toast.success("All todos deleted successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return {
    state: {
      deletingAllTodos: deleteAllTodosMutation.isPending,
    },
    actions: {
      deleteAllTodos: deleteAllTodosMutation.mutate,
    },
  };
}
