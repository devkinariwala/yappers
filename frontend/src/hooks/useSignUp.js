import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api.js";
const useSignUp = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
    onError: (err) => {
      console.error("Signup error:", err);
    },
  });
  return { signUpMutation: mutate, isPending, error };
};

export default useSignUp;
