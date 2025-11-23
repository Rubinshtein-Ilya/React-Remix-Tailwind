import { useSyncExternalStore } from "react";
import { designerStore } from "./designerStore";

export const useDesignerStore = () => {
  return useSyncExternalStore(designerStore.subscribe, () => designerStore.state);
};
