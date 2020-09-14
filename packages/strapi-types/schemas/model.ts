import { Model as BookshelfModel } from "bookshelf";

type ComponentAttribute = {
  type: "component";
  repeatable: boolean;
  component: string;
};
type PrimitiveTypeAttribute = {
  type: string;
};

type ModelAttribute = PrimitiveTypeAttribute | ComponentAttribute;

export type Model = BookshelfModel<any> & {
  collectionName: string;
  uid: string;
  options: {
    [key: string]: any;
  };
  allAttributes: {
    [key: string]: ModelAttribute;
  };
};
