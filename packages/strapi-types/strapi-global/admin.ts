import { PermissionAction } from "../plugins";

export type StrapiGlobalAdmin = {
  services: {
    permission: {
      actionProvider: {
        register: (_actions: PermissionAction[]) => void;
      };
    };
  };
};
