import React from "react";
import { logout } from "../lib/api";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const useLogout = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
    onError: (err) => {
      console.error("Logout error:", err);
    },
  });
  return { logoutMutation: mutate, isPending, error };
};

export default useLogout;
