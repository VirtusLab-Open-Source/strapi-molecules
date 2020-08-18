type ComponentAttribute = {
  type: "component";
  repeatable: boolean;
  component: string;
};
type PrimitiveTypeAttribute = {
  type: string;
};

type ModelAttribute = PrimitiveTypeAttribute | ComponentAttribute;

type BaseModel = {
  options: {
    [key: string]: any;
  };
  allAttributes: {
    [key: string]: ModelAttribute;
  };
};

type ComponentModel = BaseModel & {};

export type Strapi = {
  components: {
    [key: string]: ComponentModel;
  };
  plugins: {
    [key: string]: any;
  };
  contentTypes: {
    [key: string]: any;
  };
  query: (s: string) => any;
};
