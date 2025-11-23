export interface ItemLabel {
  _id: string;
  name: {
    ru: string;
    en: string;
  };
  description: {
    ru: string;
    en: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type CreateItemLabelRequest = {
  _id: string;
  name: {
    ru: string;
    en: string;
  };
  description: {
    ru: string;
    en: string;
  };
};

export type UpdateItemLabelRequest = Partial<CreateItemLabelRequest>;

export type ItemLabelsResponse = {
  success: boolean;
  itemLabels: ItemLabel[];
};

export type ItemLabelResponse = {
  success: boolean;
  itemLabel: ItemLabel;
}; 