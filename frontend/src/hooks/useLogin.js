import { useQueryClient, useMutation } from "@tanstack/react-query";
import { login } from "../lib/api";

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
    onError: (err) => {
      console.error("Login error:", err);
    },
  });
  return { error, isPending, loginMutation: mutate };
};
