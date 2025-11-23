import { Store } from "@tanstack/react-store";
import productDesigner from "~/productDesigner/ProductDesigner";

export enum ETShirtSide {
  FRONT = "front",
  BACK = "back",
}

export enum ESleevePlacement {
  FOLDED = "folded",
  UNFOLDED = "unfolded",
}

export enum EPhotoType {
  NONE = "none",
  PHOTO2 = "photo2",
  PHOTO3 = "photo3",
}

interface IDesignerStore {
  tShirtSide: ETShirtSide;
  sleevePlacement: ESleevePlacement;
  frameMaterialId: string;
  frameColorId: string;
  doubleFrameColorId: string;
  infoSignId: string | null;
  infoSignColorId: string | null;
  infoSignText: string;
  photoType: EPhotoType;
  glassId: string;
  setUploadedPhotoBase64: ArrayBuffer | null;
}

const initialState: IDesignerStore = {
  tShirtSide: ETShirtSide.FRONT,
  sleevePlacement: ESleevePlacement.FOLDED,
  frameMaterialId: "1",
  frameColorId: "1",
  doubleFrameColorId: "0",
  infoSignId: "1",
  infoSignColorId: "1",
  infoSignText: "test text",
  photoType: EPhotoType.NONE,
  glassId: "1",
  setUploadedPhotoBase64: null,
};

const designerStore = new Store(initialState);

const setTShirtSide = (tShirtSide: ETShirtSide) => {
  designerStore.setState((state) => ({    
    ...state,
    tShirtSide,
  }));
  productDesigner.setTShirtSide(tShirtSide);
};

const setSleevePlacement = (sleevePlacement: ESleevePlacement) => {
  designerStore.setState((state) => ({
    ...state,
    sleevePlacement,
  }));
  productDesigner.setSleevePlacement(sleevePlacement);
};

const setFrameMaterialId = (frameMaterialId: string) => {
  designerStore.setState((state) => ({
    ...state,
    frameMaterialId,
  }));
  productDesigner.setFrameMaterialId(frameMaterialId);
};

const setFrameColorId = (frameColorId: string) => {
  designerStore.setState((state) => ({
    ...state,
    frameColorId,
  }));
  productDesigner.setFrameColorId(frameColorId);
};

const setDoubleFrameColorId = (doubleFrameColorId: string) => {
  designerStore.setState((state) => ({
    ...state,
    doubleFrameColorId,
  }));
  productDesigner.setDoubleFrameColorId(doubleFrameColorId);
};

const setInfoSignId = (infoSignId: string) => {
  designerStore.setState((state) => ({
    ...state,
    infoSignId,
  }));
  productDesigner.setInfoSignId(infoSignId);
};

const setInfoSignColorId = (infoSignColorId: string) => {
  designerStore.setState((state) => ({
    ...state,
    infoSignColorId,
  }));
  productDesigner.setInfoSignColorId(infoSignColorId);
};

const setInfoSignText = (infoSignText: string) => {
  designerStore.setState((state) => ({
    ...state,
    infoSignText,
  }));
  productDesigner.setInfoSignText(infoSignText);
};

const setPhotoType = (photoType: EPhotoType) => {
  designerStore.setState((state) => ({
    ...state,
    photoType,
  }));
  productDesigner.setPhotoType(photoType);
};

const setGlassId = (glassId: string) => {
  designerStore.setState((state) => ({
    ...state,
    glassId,
  }));
  productDesigner.setGlassId(glassId);
};

export {
  designerStore,
  setTShirtSide,
  setSleevePlacement,
  setFrameMaterialId,
  setFrameColorId,
  setDoubleFrameColorId,
  setInfoSignId,
  setInfoSignColorId,
  setInfoSignText,
  setPhotoType,
  setGlassId,
};
