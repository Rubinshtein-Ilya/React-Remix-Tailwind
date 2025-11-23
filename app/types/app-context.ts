import type { User } from "~/types/user";

export interface AppLoadContext {
  user?: User;
  isAuthenticated: boolean;
}

declare module "react-router" {
  interface AppLoadContext {
    user?: User;
    isAuthenticated: boolean;
  }
} 