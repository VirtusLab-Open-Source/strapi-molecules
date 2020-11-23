import React from "react";
import { CloneBadge } from "./clone-badge";

export const shouldAddCloneHeader = (layout) => {
  const { options, attributes } = layout.contentType.schema;

  return options.previewable && !!attributes.cloneOf;
};

export const getCloneHeader = (formatMessage) => ({
  label: formatMessage({ id: "preview.containers.List.state" }),
  name: "cloneOf",
  searchable: false,
  sortable: true,
  cellFormatter: (cellData) => <CloneBadge isClone={!!cellData.cloneOf} />,
});
