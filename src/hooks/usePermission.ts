import { useAppSelector } from "./hooks";

export const usePermission = () => {
  const { user, permissions = [] } = useAppSelector((state) => state.auth);

  const hasPermission = (permission: string) => {
    if (user?.role === "superadmin") {
      return true;
    }

    return permissions.includes(permission);
  };

  return { hasPermission };
};
