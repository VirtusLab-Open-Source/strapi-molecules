# Strapi-plugin-versioning extension file diffs

Strapi-plugin-versioning needs extension files to work properly. In case if you have already extended content-manager files we are providing list of changes to help you with merge.

### content-manager/admin/components/FiledComponent/index.js

```diff 
/* eslint-disable  import/no-cycle */
import React, { memo } from "react";
import PropTypes from "prop-types";
import { get, size } from "lodash";
import { FormattedMessage } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import isEqual from "react-fast-compare";
import pluginId from "../../pluginId";
import useEditView from "../../hooks/useEditView";
import ComponentInitializer from "../ComponentInitializer";
import NonRepeatableComponent from "../NonRepeatableComponent";
import NotAllowedInput from "../NotAllowedInput";
import RepeatableComponent from "../RepeatableComponent";
import connect from "./utils/connect";
import select from "./utils/select";
import ComponentIcon from "./ComponentIcon";
import Label from "./Label";
import Reset from "./ResetComponent";
import Wrapper from "./Wrapper";

const FieldComponent = ({
  componentFriendlyName,
  componentUid,
  icon,
  isCreatingEntry,
  isFromDynamicZone,
  isRepeatable,
  isNested,
  label,
  max,
  min,
  name,
  // Passed thanks to the connect function
  hasChildrenAllowedFields,
  hasChildrenReadableFields,
  isReadOnly,
  componentValue,
  removeComponentFromField,
++  dataForCurrentVersion,
++  isVersionCurrent,
}) => {
  const { allLayoutData } = useEditView();

  const componentValueLength = size(componentValue);
  const isInitialized = componentValue || isFromDynamicZone;
  const showResetComponent =
    !isRepeatable &&
    isInitialized &&
    !isFromDynamicZone &&
    hasChildrenAllowedFields;
  const currentComponentSchema = get(
    allLayoutData,
    ["components", componentUid],
    {},
  );

  const displayedFields = get(currentComponentSchema, ["layouts", "edit"], []);

  if (!hasChildrenAllowedFields && isCreatingEntry) {
    return (
      <div className="col-12">
        <NotAllowedInput label={label} />
      </div>
    );
  }

  if (
    !hasChildrenAllowedFields &&
    !isCreatingEntry &&
    !hasChildrenReadableFields
  ) {
    return (
      <div className="col-12">
        <NotAllowedInput label={label} />
      </div>
    );
  }

  return (
    <Wrapper className="col-12" isFromDynamicZone={isFromDynamicZone}>
      {isFromDynamicZone && (
        <ComponentIcon title={componentFriendlyName}>
          <div className="component_name">
            <div className="component_icon">
              <FontAwesomeIcon icon={icon} title={componentFriendlyName} />
            </div>
            <p>{componentFriendlyName}</p>
          </div>
        </ComponentIcon>
      )}
      <Label>
        {label}&nbsp;
        {isRepeatable && `(${componentValueLength})`}
      </Label>
      {showResetComponent && (
        <Reset
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            removeComponentFromField(name, componentUid);
          }}
        >
          <FormattedMessage id={`${pluginId}.components.reset-entry`} />
          <div />
        </Reset>
      )}
      {!isRepeatable && !isInitialized && (
        <ComponentInitializer
          componentUid={componentUid}
          name={name}
          isReadOnly={isReadOnly}
        />
      )}

      {!isRepeatable && isInitialized && (
        <NonRepeatableComponent
          componentUid={componentUid}
          fields={displayedFields}
          isFromDynamicZone={isFromDynamicZone}
          name={name}
          schema={currentComponentSchema}
++      dataForCurrentVersion={dataForCurrentVersion}
++      isVersionCurrent={isVersionCurrent}
        />
      )}
      {isRepeatable && (
        <RepeatableComponent
          componentValue={componentValue}
          componentValueLength={componentValueLength}
          componentUid={componentUid}
          fields={displayedFields}
          isFromDynamicZone={isFromDynamicZone}
          isNested={isNested}
          isReadOnly={isReadOnly}
          max={max}
          min={min}
          name={name}
          schema={currentComponentSchema}
++      dataForCurrentVersion={dataForCurrentVersion}
++      isVersionCurrent={isVersionCurrent}
        />
      )}
    </Wrapper>
  );
};

FieldComponent.defaultProps = {
  componentValue: null,
  componentFriendlyName: null,
  hasChildrenAllowedFields: false,
  hasChildrenReadableFields: false,
  icon: "smile",
  isFromDynamicZone: false,
  isReadOnly: false,
  isRepeatable: false,
  isNested: false,
  max: Infinity,
  min: -Infinity,
++ dataForCurrentVersion: undefined,
++ isVersionCurrent: true,
};

FieldComponent.propTypes = {
  componentFriendlyName: PropTypes.string,
  componentUid: PropTypes.string.isRequired,
  componentValue: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  hasChildrenAllowedFields: PropTypes.bool,
  hasChildrenReadableFields: PropTypes.bool,
  icon: PropTypes.string,
  isCreatingEntry: PropTypes.bool.isRequired,
  isFromDynamicZone: PropTypes.bool,
  isReadOnly: PropTypes.bool,
  isRepeatable: PropTypes.bool,
  isNested: PropTypes.bool,
  label: PropTypes.string.isRequired,
  max: PropTypes.number,
  min: PropTypes.number,
  name: PropTypes.string.isRequired,
  removeComponentFromField: PropTypes.func.isRequired,
++  dataForCurrentVersion: PropTypes.object,
++  isVersionCurrent: PropTypes.bool,
};

const Memoized = memo(FieldComponent, isEqual);

export default connect(Memoized, select);
```

### content-manager/admin/components/NonRepeatableComponent/index.js

```diff
/* eslint-disable react/no-array-index-key */
/* eslint-disable import/no-cycle */

import React from "react";
import PropTypes from "prop-types";
import { get } from "lodash";
import NonRepeatableWrapper from "../NonRepeatableWrapper";
import Inputs from "../Inputs";
import FieldComponent from "../FieldComponent";

const NonRepeatableComponent = ({
  componentUid,
  fields,
  isFromDynamicZone,
  name,
  schema,
++  isVersionCurrent,
++  dataForCurrentVersion,
}) => {
  const getField = (fieldName) =>
    get(schema, ["schema", "attributes", fieldName], {});
  const getMeta = (fieldName) =>
    get(schema, ["metadatas", fieldName, "edit"], {});

  return (
    <NonRepeatableWrapper isFromDynamicZone={isFromDynamicZone}>
      {fields.map((fieldRow, key) => {
        return (
          <div className="row" key={key}>
            {fieldRow.map((field) => {
              const currentField = getField(field.name);
              const isComponent = get(currentField, "type", "") === "component";
              const keys = `${name}.${field.name}`;

              if (isComponent) {
                const compoUid = currentField.component;
                const metas = getMeta(field.name);

                return (
                  <FieldComponent
                    key={field.name}
                    componentUid={compoUid}
                    isRepeatable={currentField.repeatable}
                    label={metas.label}
                    max={currentField.max}
                    min={currentField.min}
                    name={keys}
                  />
                );
              }

              return (
                <div key={field.name} className={`col-${field.size}`}>
                  <Inputs
                    keys={keys}
                    layout={schema}
                    name={field.name}
                    componentUid={componentUid}
++                dataForCurrentVersion={dataForCurrentVersion}
++                isVersionCurrent={isVersionCurrent}
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </NonRepeatableWrapper>
  );
};

NonRepeatableComponent.defaultProps = {
  fields: [],
  isFromDynamicZone: false,
++ dataForCurrentVersion: undefined,
++ isVersionCurrent: true,
};

NonRepeatableComponent.propTypes = {
  componentUid: PropTypes.string.isRequired,
  fields: PropTypes.array,
  isFromDynamicZone: PropTypes.bool,
  name: PropTypes.string.isRequired,
  schema: PropTypes.object.isRequired,
++  dataForCurrentVersion: PropTypes.object,
++  isVersionCurrent: PropTypes.bool,
};

export default NonRepeatableComponent;
```

### content-manager/admin/components/Inputs/index.js

```diff 
import React, { memo, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { get, isEmpty, omit, toLower } from "lodash";
import { FormattedMessage } from "react-intl";
import { Inputs as InputsIndex } from "@buffetjs/custom";
import { useStrapi } from "strapi-helper-plugin";

import useDataManager from "../../hooks/useDataManager";
import InputJSONWithErrors from "../InputJSONWithErrors";
import SelectWrapper from "../SelectWrapper";
import WysiwygWithErrors from "../WysiwygWithErrors";
import InputUID from "../InputUID";

const getInputType = (type = "") => {
  switch (toLower(type)) {
    case "boolean":
      return "bool";
    case "biginteger":
      return "text";
    case "decimal":
    case "float":
    case "integer":
      return "number";
    case "date":
    case "datetime":
    case "time":
      return type;
    case "email":
      return "email";
    case "enumeration":
      return "select";
    case "password":
      return "password";
    case "string":
      return "text";
    case "text":
      return "textarea";
    case "media":
    case "file":
    case "files":
      return "media";
    case "json":
      return "json";
    case "wysiwyg":
    case "WYSIWYG":
    case "richtext":
      return "wysiwyg";
    case "uid":
      return "uid";
    default:
      return type || "text";
  }
};

function Inputs({
  autoFocus,
  keys,
  layout,
  name,
  onBlur,
++  dataForCurrentVersion,
++  isVersionCurrent,
}) {
  const {
    strapi: { fieldApi },
  } = useStrapi();

  const {
    didCheckErrors,
    formErrors,
    modifiedData,
    onChange,
++    initialData,
  } = useDataManager();
  const attribute = useMemo(
    () => get(layout, ["schema", "attributes", name], {}),
    [layout, name],
  );
  const metadatas = useMemo(
    () => get(layout, ["metadatas", name, "edit"], {}),
    [layout, name],
  );
  const disabled = useMemo(() => !get(metadatas, "editable", true), [
    metadatas,
  ]);
  const type = useMemo(() => get(attribute, "type", null), [attribute]);
  const regexpString = useMemo(() => get(attribute, "regex", null), [
    attribute,
  ]);
  -- const value = get(modifiedData, keys, null);
++ const value = !isVersionCurrent
++   ? get(dataForCurrentVersion, keys, null)
++   : get(modifiedData, keys, null);
++ const initialValue = get(initialData, keys, null);
  const temporaryErrorIdUntilBuffetjsSupportsFormattedMessage =
    "app.utils.defaultMessage";
  const errorId = get(
    formErrors,
    [keys, "id"],
    temporaryErrorIdUntilBuffetjsSupportsFormattedMessage,
  );

  let validationsToOmit = [
    "type",
    "model",
    "via",
    "collection",
    "default",
    "plugin",
    "enum",
    "regex",
  ];

++ useEffect(() => {
++   if (isVersionCurrent) {
++      onChange({
++        target: { name: keys, value: initialValue, type: getInputType(type) },
++      });
++    } else {
++      onChange({ target: { name: keys, value, type: getInputType(type) } });
++    }
++  }, [isVersionCurrent]);

  const validations = omit(attribute, validationsToOmit);

  if (regexpString) {
    const regexp = new RegExp(regexpString);

    if (regexp) {
      validations.regex = regexp;
    }
  }

  const { description, visible } = metadatas;

  if (visible === false) {
    return null;
  }

  const isRequired = get(validations, ["required"], false);

  if (type === "relation") {
    return (
      <div key={keys}>
        <SelectWrapper
          {...metadatas}
          name={keys}
          plugin={attribute.plugin}
          relationType={attribute.relationType}
          targetModel={attribute.targetModel}
          value={get(modifiedData, keys)}
        />
      </div>
    );
  }

  let inputValue = value;

  // Fix for input file multipe
  if (type === "media" && !value) {
    inputValue = [];
  }

  let step;

  if (type === "float" || type === "decimal") {
    step = "any";
  } else if (type === "time" || type === "datetime") {
    step = 30;
  } else {
    step = "1";
  }

  const options = get(attribute, "enum", []).map((v) => {
    return (
      <option key={v} value={v}>
        {v}
      </option>
    );
  });

  const enumOptions = [
    <FormattedMessage
      id="components.InputSelect.option.placeholder"
      key="__enum_option_null"
    >
      {(msg) => (
        <option disabled={isRequired} hidden={isRequired} value="">
          {msg}
        </option>
      )}
    </FormattedMessage>,
    ...options,
  ];

  return (
    <FormattedMessage id={errorId}>
      {(error) => {
        return (
          <InputsIndex
            {...metadatas}
            autoComplete="new-password"
            autoFocus={autoFocus}
            didCheckErrors={didCheckErrors}
            disabled={isVersionCurrent ? disabled : true}
            error={
              isEmpty(error) ||
              errorId === temporaryErrorIdUntilBuffetjsSupportsFormattedMessage
                ? null
                : error
            }
            inputDescription={description}
            description={description}
            contentTypeUID={layout.uid}
            customInputs={{
              json: InputJSONWithErrors,
              wysiwyg: WysiwygWithErrors,
              uid: InputUID,
              ...fieldApi.getFields(),
            }}
            multiple={get(attribute, "multiple", false)}
            attribute={attribute}
            name={keys}
            onBlur={onBlur}
            onChange={onChange}
            options={enumOptions}
            step={step}
            type={getInputType(type)}
            validations={validations}
            value={inputValue}
            withDefaultValue={false}
          />
        );
      }}
    </FormattedMessage>
  );
}

Inputs.defaultProps = {
  autoFocus: false,
  onBlur: null,
++  dataForCurrentVersion: null,
++  isVersionCurrent: true,
};

Inputs.propTypes = {
  autoFocus: PropTypes.bool,
  keys: PropTypes.string.isRequired,
  layout: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  onBlur: PropTypes.func,
  onChange: PropTypes.func.isRequired,
++  dataForCurrentVersion: PropTypes.object,
++  isVersionCurrent: PropTypes.bool,
};

export default memo(Inputs);

```


### content-manager/admin/components/RepeatableComponent/DraggedItem/index.js

```diff 
/* eslint-disable import/no-cycle */
import React, { memo, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { get } from "lodash";
import { Collapse } from "reactstrap";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import useEditView from "../../../hooks/useEditView";
import ItemTypes from "../../../utils/ItemTypes";
import Inputs from "../../Inputs";
import FieldComponent from "../../FieldComponent";
import Banner from "../Banner";
import FormWrapper from "../FormWrapper";
import { connect, select } from "./utils";

/* eslint-disable react/no-array-index-key */

// Issues:
// https://github.com/react-dnd/react-dnd/issues/1368
// https://github.com/frontend-collective/react-sortable-tree/issues/490

const DraggedItem = ({
  componentFieldName,
  componentUid,
  doesPreviousFieldContainErrorsAndIsOpen,
  fields,
  hasErrors,
  hasMinError,
  isFirst,
  isReadOnly,
  isOpen,
  moveCollapse,
  onClickToggle,
  removeCollapse,
  schema,
  toggleCollapses,
++  dataForCurrentVersion,
++  isVersionCurrent,

  // Retrieved from the select function
  moveComponentField,
  removeRepeatableField,
  triggerFormValidation,
  checkFormErrors,
  displayedValue,
}) => {
  const { setIsDraggingComponent, unsetIsDraggingComponent } = useEditView();
  const dragRef = useRef(null);
  const dropRef = useRef(null);
  const [showForm, setShowForm] = useState(false);

useEffect(() => {
--      if (isOpen) {
++    if (isOpen || !isVersionCurrent) {
      setShowForm(true);
    }
  }, [isOpen]);

++  useEffect(() => {
++    if (!isVersionCurrent) {
++      setShowForm(true);
++    }
++  }, [isVersionCurrent]);

  const [, drop] = useDrop({
    accept: ItemTypes.COMPONENT,
    canDrop() {
      return false;
    },
    hover(item, monitor) {
      if (!dropRef.current) {
        return;
      }

      const dragPath = item.originalPath;
      const hoverPath = componentFieldName;
      const fullPathToComponentArray = dragPath.split(".");
      const dragIndexString = fullPathToComponentArray
        .slice()
        .splice(-1)
        .join("");
      const hoverIndexString = hoverPath.split(".").splice(-1).join("");
      const pathToComponentArray = fullPathToComponentArray.slice(
        0,
        fullPathToComponentArray.length - 1,
      );
      const dragIndex = parseInt(dragIndexString, 10);
      const hoverIndex = parseInt(hoverIndexString, 10);

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = dropRef.current.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Time to actually perform the action in the data
      moveComponentField(pathToComponentArray, dragIndex, hoverIndex);
      // Time to actually perform the action in the synchronized collapses
      moveCollapse(dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.originalPath = hoverPath;
    },
  });
  const [{ isDragging }, drag, preview] = useDrag({
    item: {
      type: ItemTypes.COMPONENT,
      displayedValue,
      originalPath: componentFieldName,
    },
    begin: () => {
      // Close all collapses
      toggleCollapses(-1);
      // Prevent the relations select from firing requests
      setIsDraggingComponent();
    },
    end: () => {
      // Enable the relations select to fire requests
      unsetIsDraggingComponent();
      // Update the errors
      triggerFormValidation();
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: false });
  }, [preview]);

  const getField = (fieldName) =>
    get(schema, ["schema", "attributes", fieldName], {});
  const getMeta = (fieldName) =>
    get(schema, ["metadatas", fieldName, "edit"], {});

  // Create the refs
  // We need 1 for the drop target
  // 1 for the drag target
  const refs = {
    dragRef: drag(dragRef),
    dropRef: drop(dropRef),
  };

  return (
    <>
      <Banner
        componentFieldName={componentFieldName}
        hasErrors={hasErrors}
        hasMinError={hasMinError}
        isFirst={isFirst}
        displayedValue={displayedValue}
        doesPreviousFieldContainErrorsAndIsOpen={
          doesPreviousFieldContainErrorsAndIsOpen
        }
        isDragging={isDragging}
--			isOpen={isOpen}
++        isOpen={isVersionCurrent ? isOpen : true}
        isReadOnly={isReadOnly}
        onClickToggle={onClickToggle}
        onClickRemove={() => {
          removeRepeatableField(componentFieldName);
          removeCollapse();
        }}
        ref={refs}
      />
      <Collapse
--		isOpen={isOpen}
++    isOpen={isVersionCurrent ? isOpen : true}
        style={{ backgroundColor: "#FAFAFB" }}
        onExited={() => setShowForm(false)}
      >
        {!isDragging && (
          <FormWrapper
            hasErrors={hasErrors}
            isOpen={isVersionCurrent ? isOpen : true}
            isReadOnly={isReadOnly}
          >
            {showForm &&
              fields.map((fieldRow, key) => {
                return (
                  <div className="row" key={key}>
                    {fieldRow.map((field) => {
                      const currentField = getField(field.name);
                      const isComponent =
                        get(currentField, "type", "") === "component";
                      const keys = `${componentFieldName}.${field.name}`;

                      if (isComponent) {
                        const componentUid = currentField.component;
                        const metas = getMeta(field.name);

                        return (
                          <FieldComponent
                            componentUid={componentUid}
                            isRepeatable={currentField.repeatable}
                            key={field.name}
                            label={metas.label}
                            isNested
                            name={keys}
                            max={currentField.max}
                            min={currentField.min}
                          />
                        );
                      }

                      return (
                        <div key={field.name} className={`col-${field.size}`}>
                          <Inputs
                            autoFocus={false}
                            componentUid={componentUid}
                            keys={keys}
                            layout={schema}
                            name={field.name}
                            onBlur={hasErrors ? checkFormErrors : null}
++                        dataForCurrentVersion={dataForCurrentVersion}
++                        isVersionCurrent={isVersionCurrent}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
          </FormWrapper>
        )}
      </Collapse>
    </>
  );
};

DraggedItem.defaultProps = {
  doesPreviousFieldContainErrorsAndIsOpen: false,
  fields: [],
  hasErrors: false,
  hasMinError: false,
  isFirst: false,
  isOpen: false,
  moveCollapse: () => {},
  toggleCollapses: () => {},
++  dataForCurrentVersion: undefined,
++  isVersionCurrent: true,
};

DraggedItem.propTypes = {
  componentFieldName: PropTypes.string.isRequired,
  componentUid: PropTypes.string.isRequired,
  doesPreviousFieldContainErrorsAndIsOpen: PropTypes.bool,
  fields: PropTypes.array,
  hasErrors: PropTypes.bool,
  hasMinError: PropTypes.bool,
  isFirst: PropTypes.bool,
  isOpen: PropTypes.bool,
  isReadOnly: PropTypes.bool.isRequired,
  moveCollapse: PropTypes.func,
  onClickToggle: PropTypes.func.isRequired,
  removeCollapse: PropTypes.func.isRequired,
  schema: PropTypes.object.isRequired,
  toggleCollapses: PropTypes.func,
  moveComponentField: PropTypes.func.isRequired,
  removeRepeatableField: PropTypes.func.isRequired,
  triggerFormValidation: PropTypes.func.isRequired,
  checkFormErrors: PropTypes.func.isRequired,
  displayedValue: PropTypes.string.isRequired,
++  dataForCurrentVersion: PropTypes.object,
++  isVersionCurrent: PropTypes.bool,
};

const Memoized = memo(DraggedItem);

export default connect(Memoized, select);

export { DraggedItem };
```


### content-manager/admin/components/RepeatableComponent/index.js

```diff 
/* eslint-disable import/no-cycle */
import React, { memo, useReducer } from "react";
import { useDrop } from "react-dnd";
import PropTypes from "prop-types";
import { get, take } from "lodash";
import { FormattedMessage } from "react-intl";
import { ErrorMessage } from "@buffetjs/styles";
import pluginId from "../../pluginId";
import ItemTypes from "../../utils/ItemTypes";
import connect from "./utils/connect";
import select from "./utils/select";
import Button from "./AddFieldButton";
import DraggedItem from "./DraggedItem";
import EmptyComponent from "./EmptyComponent";
import init from "./init";
import reducer, { initialState } from "./reducer";

const RepeatableComponent = ({
  addRepeatableComponentToField,
  formErrors,
  componentUid,
  componentValue,
  componentValueLength,
  fields,
  isNested,
  isReadOnly,
  max,
  min,
  name,
  schema,
++  dataForCurrentVersion,
++  isVersionCurrent,
}) => {
  const [, drop] = useDrop({ accept: ItemTypes.COMPONENT });

  const componentErrorKeys = Object.keys(formErrors)
    .filter((errorKey) => {
      return take(errorKey.split("."), isNested ? 3 : 1).join(".") === name;
    })
    .map((errorKey) => {
      return errorKey
        .split(".")
        .slice(0, name.split(".").length + 1)
        .join(".");
    });

  // We need to synchronize the collapses array with the data
  // The key needed for react in the list will be the one from the collapses data
  // This way we don't have to mutate the data when it is received and we can use a unique key
  const [state, dispatch] = useReducer(reducer, initialState, () =>
    init(initialState, componentValue),
  );
  const { collapses } = state.toJS();
  const toggleCollapses = (index) => {
    dispatch({
      type: "TOGGLE_COLLAPSE",
      index,
    });
  };
  const missingComponentsValue = min - componentValueLength;
  const errorsArray = componentErrorKeys.map((key) =>
    get(formErrors, [key, "id"], ""),
  );

  const hasMinError =
    get(errorsArray, [0], "").includes("min") &&
    !collapses.some((obj) => obj.isOpen === true);

  return (
    <div>
      {componentValueLength === 0 && (
        <EmptyComponent hasMinError={hasMinError}>
          <FormattedMessage id={`${pluginId}.components.empty-repeatable`}>
            {(msg) => <p>{msg}</p>}
          </FormattedMessage>
        </EmptyComponent>
      )}
      <div ref={drop}>
        {componentValueLength > 0 &&
          componentValue.map((data, index) => {
            const componentFieldName = `${name}.${index}`;
            const doesPreviousFieldContainErrorsAndIsOpen =
              componentErrorKeys.includes(`${name}.${index - 1}`) &&
              index !== 0 &&
              get(collapses, [index - 1, "isOpen"], false) === false;
            const hasErrors = componentErrorKeys.includes(componentFieldName);

            return (
              <DraggedItem
                fields={fields}
                componentFieldName={componentFieldName}
                componentUid={componentUid}
                doesPreviousFieldContainErrorsAndIsOpen={
                  doesPreviousFieldContainErrorsAndIsOpen
                }
                hasErrors={hasErrors}
                hasMinError={hasMinError}
                isFirst={index === 0}
                isReadOnly={isReadOnly}
                isOpen={get(collapses, [index, "isOpen"], false)}
                key={get(collapses, [index, "_temp__id"], null)}
                onClickToggle={() => {
                  // Close all other collapses and open the selected one
                  toggleCollapses(index);
                }}
                removeCollapse={() => {
                  dispatch({
                    type: "REMOVE_COLLAPSE",
                    index,
                  });
                }}
                moveCollapse={(dragIndex, hoverIndex) => {
                  dispatch({
                    type: "MOVE_COLLAPSE",
                    dragIndex,
                    hoverIndex,
                  });
                }}
                parentName={name}
                schema={schema}
                toggleCollapses={toggleCollapses}
++            dataForCurrentVersion={dataForCurrentVersion}
++            isVersionCurrent={isVersionCurrent}
              />
            );
          })}
      </div>
      <Button
        hasMinError={hasMinError}
        disabled={isReadOnly}
        withBorderRadius={false}
        doesPreviousFieldContainErrorsAndIsClosed={
          componentValueLength > 0 &&
          componentErrorKeys.includes(`${name}.${componentValueLength - 1}`) &&
          collapses[componentValueLength - 1].isOpen === false
        }
        type="button"
        onClick={() => {
          if (!isReadOnly) {
            if (componentValueLength < max) {
              const shouldCheckErrors = hasMinError;

              addRepeatableComponentToField(
                name,
                componentUid,
                shouldCheckErrors,
              );
              dispatch({
                type: "ADD_NEW_FIELD",
              });
            } else if (componentValueLength >= max) {
              strapi.notification.info(
                `${pluginId}.components.notification.info.maximum-requirement`,
              );
            }
          }
        }}
      >
        <i className="fa fa-plus" />
        <FormattedMessage id={`${pluginId}.containers.EditView.add.new`} />
      </Button>
      {hasMinError && (
        <ErrorMessage>
          <FormattedMessage
            id={`${pluginId}.components.DynamicZone.missing${
              missingComponentsValue > 1 ? ".plural" : ".singular"
            }`}
            values={{ count: missingComponentsValue }}
          />
        </ErrorMessage>
      )}
    </div>
  );
};

RepeatableComponent.defaultProps = {
  componentValue: null,
  componentValueLength: 0,
  fields: [],
  formErrors: {},
  isNested: false,
  max: Infinity,
  min: -Infinity,
++  dataForCurrentVersion: undefined,
++  isVersionCurrent: true,
};

RepeatableComponent.propTypes = {
  addRepeatableComponentToField: PropTypes.func.isRequired,
  componentUid: PropTypes.string.isRequired,
  componentValue: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  componentValueLength: PropTypes.number,
  fields: PropTypes.array,
  formErrors: PropTypes.object,
  isNested: PropTypes.bool,
  isReadOnly: PropTypes.bool.isRequired,
  max: PropTypes.number,
  min: PropTypes.number,
  name: PropTypes.string.isRequired,
  schema: PropTypes.object.isRequired,
++  dataForCurrentVersion: PropTypes.object,
++  isVersionCurrent: PropTypes.bool,
};

const Memoized = memo(RepeatableComponent);

export default connect(Memoized, select);

export { RepeatableComponent };

```
### content-manager/admin/components/SelectWrapper/index.js


```diff 
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo, useRef, memo } from "react";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import { Link, useLocation } from "react-router-dom";
import { cloneDeep, findIndex, get, isArray, isEmpty, set } from "lodash";
import { request } from "strapi-helper-plugin";
import pluginId from "../../pluginId";
import useDataManager from "../../hooks/useDataManager";
import useEditView from "../../hooks/useEditView";
import { getFieldName } from "../../utils";
import NotAllowedInput from "../NotAllowedInput";
import SelectOne from "../SelectOne";
import SelectMany from "../SelectMany";
import { Nav, Wrapper } from "./components";
import { connect, select } from "./utils";

function SelectWrapper({
  componentUid,
  description,
  editable,
  label,
  isCreatingEntry,
  isFieldAllowed,
  isFieldReadable,
  mainField,
  name,
  relationType,
  slug,
  targetModel,
  placeholder,
++  valueToSet,
}) {
  // Disable the input in case of a polymorphic relation
  const isMorph = relationType.toLowerCase().includes("morph");
  const {
    addRelation,
    modifiedData,
    moveRelation,
    onChange,
    onRemoveRelation,
++    initialData,
  } = useDataManager();
  const { isDraggingComponent } = useEditView();

--    const value = get(modifiedData, name, null);
++  const value =
++    valueToSet && valueToSet !== "current"
++      ? valueToSet
++      : get(modifiedData, name, null);
++  const initialValue = get(initialData, name, null);

  // This is needed for making requests when used in a component
  const fieldName = useMemo(() => {
    const fieldNameArray = getFieldName(name);
    return fieldNameArray[fieldNameArray.length - 1];
  }, [name]);

  const { pathname } = useLocation();

  const [state, setState] = useState({
    _contains: "",
    _limit: 20,
    _start: 0,
  });
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const abortController = new AbortController();
  const { signal } = abortController;
  const ref = useRef();
  const startRef = useRef();

  const filteredOptions = useMemo(() => {
    return options.filter((option) => {
      if (!isEmpty(value)) {
        // SelectMany
        if (Array.isArray(value)) {
          return findIndex(value, (o) => o.id === option.value.id) === -1;
        }

        // SelectOne
        return get(value, "id", "") !== option.value.id;
      }

      return true;
    });
  }, [options, value]);

  startRef.current = state._start;

  ref.current = async () => {
    if (isMorph) {
      setIsLoading(false);

      return;
    }

    if (!isDraggingComponent) {
      try {
        const requestUrl = `/${pluginId}/explorer/${slug}/relation-list/${fieldName}`;

        const containsKey = `${mainField}_contains`;
        const { _contains, ...restState } = cloneDeep(state);
        const params = isEmpty(state._contains)
          ? restState
          : { [containsKey]: _contains, ...restState };

        if (componentUid) {
          set(params, "_component", componentUid);
        }

        const data = await request(requestUrl, {
          method: "GET",
          params,
          signal,
        });

        const formattedData = data.map((obj) => {
          return { value: obj, label: obj[mainField] };
        });

        setOptions((prevState) =>
          prevState.concat(formattedData).filter((obj, index) => {
            const objIndex = prevState.findIndex(
              (el) => el.value.id === obj.value.id,
            );

            if (objIndex === -1) {
              return true;
            }

            return (
              prevState.findIndex((el) => el.value.id === obj.value.id) ===
              index
            );
          }),
        );
        setIsLoading(false);
      } catch (err) {
        if (err.code !== 20) {
          strapi.notification.error("notification.error");
        }
      }
    }
  };

  useEffect(() => {
    if (state._contains !== "") {
      let timer = setTimeout(() => {
        ref.current();
      }, 300);

      return () => clearTimeout(timer);
    }

    if (isFieldAllowed) {
      ref.current();
    }

    return () => {
      abortController.abort();
    };
  }, [state._contains, isFieldAllowed]);

  useEffect(() => {
    if (state._start !== 0) {
      ref.current();
    }

    return () => {
      abortController.abort();
    };
  }, [state._start]);

  const onInputChange = (inputValue, { action }) => {
    if (action === "input-change") {
      setState((prevState) => {
        if (prevState._contains === inputValue) {
          return prevState;
        }

        return { ...prevState, _contains: inputValue, _start: 0 };
      });
    }

    return inputValue;
  };

  const onMenuScrollToBottom = () => {
    setState((prevState) => ({ ...prevState, _start: prevState._start + 20 }));
  };

  const isSingle = [
    "oneWay",
    "oneToOne",
    "manyToOne",
    "oneToManyMorph",
    "oneToOneMorph",
  ].includes(relationType);

++  const changeRelationValueForCurrentVersion = () => {
++    if (valueToSet && startRef.current != 0) {
++      valueToSet !== "current"
++        ? onChange({ target: { name, value: valueToSet } })
++        : onChange({ target: { name, value: initialValue } });
++    }
++  };

++  useEffect(() => {
++    changeRelationValueForCurrentVersion();
++  }, [valueToSet]);

  const to = `/plugins/${pluginId}/collectionType/${targetModel}/${
    value ? value.id : null
  }`;
  const link =
    value === null ||
    value === undefined ||
    [
      "plugins::users-permissions.role",
      "plugins::users-permissions.permission",
    ].includes(targetModel) ? null : (
      <Link to={{ pathname: to, state: { from: pathname } }}>
        <FormattedMessage id="content-manager.containers.Edit.seeDetails" />
      </Link>
    );
  const Component = isSingle ? SelectOne : SelectMany;
  const associationsLength = isArray(value) ? value.length : 0;

  const customStyles = {
    option: (provided) => {
      return {
        ...provided,
        maxWidth: "100% !important",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      };
    },
  };

  const isDisabled = useMemo(() => {
    if (isMorph) {
      return true;
    }

    if (!isCreatingEntry) {
      return !isFieldAllowed && isFieldReadable;
    }

    return !editable;
  });

  if (!isFieldAllowed && isCreatingEntry) {
    return <NotAllowedInput label={label} />;
  }

  if (!isCreatingEntry && !isFieldAllowed && !isFieldReadable) {
    return <NotAllowedInput label={label} />;
  }

  return (
    <Wrapper className="form-group">
      <Nav>
        <div>
          <label htmlFor={name}>
            {label}
            {!isSingle && (
              <span style={{ fontWeight: 400, fontSize: 12 }}>
                &nbsp;({associationsLength})
              </span>
            )}
          </label>
          {isSingle && link}
        </div>
        {!isEmpty(description) && <p className="description">{description}</p>}
      </Nav>
      <Component
        addRelation={(value) => {
          addRelation({ target: { name, value } });
        }}
        id={name}
        isDisabled={isDisabled}
        isLoading={isLoading}
        isClearable
        mainField={mainField}
        move={moveRelation}
        name={name}
        options={filteredOptions}
        onChange={(value) => {
          onChange({ target: { name, value: value ? value.value : value } });
        }}
        onInputChange={onInputChange}
        onMenuClose={() => {
          setState((prevState) => ({ ...prevState, _contains: "" }));
        }}
        onMenuScrollToBottom={onMenuScrollToBottom}
        onRemove={onRemoveRelation}
        placeholder={
          isEmpty(placeholder) ? (
            <FormattedMessage id={`${pluginId}.containers.Edit.addAnItem`} />
          ) : (
            placeholder
          )
        }
        styles={customStyles}
        targetModel={targetModel}
        value={value}
      />
      <div style={{ marginBottom: 18 }} />
    </Wrapper>
  );
}

SelectWrapper.defaultProps = {
  componentUid: null,
  editable: true,
  description: "",
  label: "",
  isFieldAllowed: true,
  placeholder: "",
++  valueToSet: null,
};

SelectWrapper.propTypes = {
  componentUid: PropTypes.string,
  editable: PropTypes.bool,
  description: PropTypes.string,
  label: PropTypes.string,
  isCreatingEntry: PropTypes.bool.isRequired,
  isFieldAllowed: PropTypes.bool,
  isFieldReadable: PropTypes.bool.isRequired,
  mainField: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  relationType: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  targetModel: PropTypes.string.isRequired,
++  valueToSet: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const Memoized = memo(SelectWrapper);

export default connect(Memoized, select);


```

### content-manager/admin/containers/EditView/index.js

```dif 
import React, {
  memo,
  useCallback,
  useMemo,
  useEffect,
  useReducer,
  useRef,
++  useState,
} from "react";
import PropTypes from "prop-types";
--   import { get } from "lodash";
++ import { get, isEqual, sortBy } from "lodash";
import { FormattedMessage } from "react-intl";
import { Select, Button } from "@buffetjs/core";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
import {
  BackHeader,
  LiLink,
  CheckPermissions,
  useUserPermissions,
  request,
} from "strapi-helper-plugin";
import pluginId from "../../pluginId";
import pluginPermissions from "../../permissions";
import { generatePermissionsObject } from "../../utils";
import Container from "../../components/Container";
import DynamicZone from "../../components/DynamicZone";
import FormWrapper from "../../components/FormWrapper";
import FieldComponent from "../../components/FieldComponent";
import Inputs from "../../components/Inputs";
import SelectWrapper from "../../components/SelectWrapper";
import getInjectedComponents from "../../utils/getComponents";
import EditViewDataManagerProvider from "../EditViewDataManagerProvider";
import EditViewProvider from "../EditViewProvider";
import Header from "./Header";
import createAttributesLayout from "./utils/createAttributesLayout";
import { LinkWrapper, SubWrapper } from "./components";
import init from "./init";
import reducer, { initialState } from "./reducer";
++ import getRequestUrl from "../../utils/getRequestUrl";

/* eslint-disable  react/no-array-index-key */

const EditView = ({
  components,
  currentEnvironment,
  deleteLayout,
  layouts,
  plugins,
  slug,
}) => {
  const formatLayoutRef = useRef();
  formatLayoutRef.current = createAttributesLayout;
  const { goBack } = useHistory();
  // Retrieve the search and the pathname
  const { pathname } = useLocation();
  const {
    params: { contentType },
  } = useRouteMatch("/plugins/content-manager/:contentType");
  const viewPermissions = useMemo(() => generatePermissionsObject(slug), [
    slug,
  ]);
  const { allowedActions } = useUserPermissions(viewPermissions);

++  const entityId = pathname.split("/").pop();
++  const [versions, setVersions] = useState([{ date: "current" }]);
++  const [selectedVersion, setSelectedVersion] = useState("current");

++  const changeLatestDateToCurrent = (versions) => {
++    if (versions.length) {
++      const sortedVersions = [...versions].sort(
++        (previous, next) =>
++          new Date(previous.date).getTime() - new Date(next.date).getTime(),
++      );

++      return sortedVersions.map((sortedVersion, i, arr) => {
++        if (i === arr.length - 1) {
++          sortedVersion = {
++            ...sortedVersion,
++            date: "current",
++          };
++        }
++        return sortedVersion;
++      });
++    }
++    return [{ date: "current" }];
++  };

++  useEffect(() => {
++    const getVersions = async () => {
++      try {
++        const versions = await request(
++          getRequestUrl(`explorer/versions/${slug}/${entityId}`),
++          {
++            method: "GET",
++          },
++        );
++        setVersions(changeLatestDateToCurrent(versions));
++      } catch (err) {
++        strapi.notification.error("content-manager.error.relation.fetch");
++      }
++    };
++    if (entityId != "create") {
++      getVersions();
++    }
++  }, [slug, entityId]);

++  const generateDataForSelectedOption = () =>
++    versions.length <= 1
++      ? {}
++      : versions.find((version) => version.date === selectedVersion).content;

  const isSingleType = useMemo(() => contentType === "singleType", [
    contentType,
  ]);
  const [
    { formattedContentTypeLayout, isDraggingComponent },
    dispatch,
  ] = useReducer(reducer, initialState, () => init(initialState));
  const allLayoutData = useMemo(() => get(layouts, [slug], {}), [
    layouts,
    slug,
  ]);
  const currentContentTypeLayoutData = useMemo(
    () => get(allLayoutData, ["contentType"], {}),
    [allLayoutData],
  );
  const currentContentTypeLayout = useMemo(
    () => get(currentContentTypeLayoutData, ["layouts", "edit"], []),
    [currentContentTypeLayoutData],
  );
  const currentContentTypeLayoutRelations = useMemo(
    () => get(currentContentTypeLayoutData, ["layouts", "editRelations"], []),
    [currentContentTypeLayoutData],
  );
  const currentContentTypeSchema = useMemo(
    () => get(currentContentTypeLayoutData, ["schema"], {}),
    [currentContentTypeLayoutData],
  );

  const getFieldMetas = useCallback(
    (fieldName) => {
      return get(
        currentContentTypeLayoutData,
        ["metadatas", fieldName, "edit"],
        {},
      );
    },
    [currentContentTypeLayoutData],
  );
  const getField = useCallback(
    (fieldName) => {
      return get(currentContentTypeSchema, ["attributes", fieldName], {});
    },
    [currentContentTypeSchema],
  );
  const getFieldType = useCallback(
    (fieldName) => {
      return get(getField(fieldName), ["type"], "");
    },
    [getField],
  );
  const getFieldComponentUid = useCallback(
    (fieldName) => {
      return get(getField(fieldName), ["component"], "");
    },
    [getField],
  );

  // Check if a block is a dynamic zone
  const isDynamicZone = useCallback(
    (block) => {
      return block.every((subBlock) => {
        return subBlock.every(
          (obj) => getFieldType(obj.name) === "dynamiczone",
        );
      });
    },
    [getFieldType],
  );

  useEffect(() => {
    // Force state to be cleared when navigation from one entry to another
    dispatch({ type: "RESET_PROPS" });
    dispatch({
      type: "SET_LAYOUT_DATA",
      formattedContentTypeLayout: formatLayoutRef.current(
        currentContentTypeLayout,
        currentContentTypeSchema.attributes,
      ),
    });

    return () => deleteLayout(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentContentTypeLayout, currentContentTypeSchema.attributes]);

++  const isVersionCurrent = () => selectedVersion === "current";
++  const currentFieldNames = Object.keys(currentContentTypeSchema.attributes);

++  const currentVersionFieldNames = () => {
++    if (selectedVersion === "current") {
++      return [];
++    }

++    return Object.keys(generateDataForSelectedOption());
++  };

++  const isSelectVersionContainsAllCurrentRelations = () => {
++    if (generateDataForSelectedOption()) {
++      const selectedVersionAttributeNames = Object.keys(
++        generateDataForSelectedOption(),
++      );

++      return currentContentTypeLayoutRelations.every((el) =>
++        selectedVersionAttributeNames.includes(el),
++      );
++    }
++    return true;
++  };

++  const removeUnnecessaryAttributes = (
++    originalArray,
++    unnecessaryAttributes,
++  ) => {
++    return originalArray.filter(
++      (value) => !unnecessaryAttributes.includes(value),
++    );
++  };

++  const isRevertButtonDisabled = () => {
++    const unnecessaryAttributes = [
++      "created_at",
++      "created_by",
++      "updated_at",
++      "updated_by",
++    ];
++    const sortedCurrentFieldNames = sortBy(
++      removeUnnecessaryAttributes(currentFieldNames, unnecessaryAttributes),
++    );
++    const sortedVersionsFieldNames = sortBy(
++      removeUnnecessaryAttributes(
++        currentVersionFieldNames(),
++        unnecessaryAttributes,
++      ),
++    );
++    const areFieldsTheSame = isEqual(
++      sortedCurrentFieldNames,
++      sortedVersionsFieldNames,
++    );

++    return (
++      isVersionCurrent() ||
++      !areFieldsTheSame ||
++      !isSelectVersionContainsAllCurrentRelations()
++    );
++  };

++  const findSelectedVersionRelationValue = (name) => {
++    const dataForSelectedOption = generateDataForSelectedOption();
++    return dataForSelectedOption[name];
++  };

  return (
    <EditViewProvider
      allowedActions={allowedActions}
      allLayoutData={allLayoutData}
      components={components}
      layout={currentContentTypeLayoutData}
      isDraggingComponent={isDraggingComponent}
      isSingleType={isSingleType}
      setIsDraggingComponent={() => {
        dispatch({
          type: "SET_IS_DRAGGING_COMPONENT",
        });
      }}
      unsetIsDraggingComponent={() => {
        dispatch({
          type: "UNSET_IS_DRAGGING_COMPONENT",
        });
      }}
    >
      <EditViewDataManagerProvider
        allLayoutData={allLayoutData}
        redirectToPreviousPage={goBack}
        isSingleType={isSingleType}
        slug={slug}
      >
        <BackHeader onClick={goBack} />
        <Container className="container-fluid">
          <Header />
          <div className="row" style={{ paddingTop: 3 }}>
            <div className="col-md-12 col-lg-9" style={{ marginBottom: 13 }}>
              {formattedContentTypeLayout.map((block, blockIndex) => {
                if (isDynamicZone(block)) {
                  const {
                    0: {
                      0: { name },
                    },
                  } = block;
                  const { max, min } = getField(name);

                  return (
                    <DynamicZone
                      key={blockIndex}
                      name={name}
                      max={max}
                      min={min}
++                  dataForCurrentVersion={generateDataForSelectedOption()}
++                  isVersionCurrent={isVersionCurrent()}
                    />
                  );
                }

                return (
                  <FormWrapper key={blockIndex}>
                    {block.map((fieldsBlock, fieldsBlockIndex) => {
                      return (
                        <div className="row" key={fieldsBlockIndex}>
                          {fieldsBlock.map(({ name, size }, fieldIndex) => {
                            const isComponent =
                              getFieldType(name) === "component";

                            if (isComponent) {
                              const componentUid = getFieldComponentUid(name);
                              const isRepeatable = get(
                                getField(name),
                                "repeatable",
                                false,
                              );
                              const { max, min } = getField(name);

                              const label = get(
                                getFieldMetas(name),
                                "label",
                                componentUid,
                              );

                              return (
                                <FieldComponent
                                  key={componentUid}
                                  componentUid={componentUid}
                                  isRepeatable={isRepeatable}
                                  label={label}
                                  max={max}
                                  min={min}
                                  name={name}
++                              dataForCurrentVersion={generateDataForSelectedOption()}
++                              isVersionCurrent={isVersionCurrent()}
                                />
                              );
                            }

                            return (
                              <div className={`col-${size}`} key={name}>
                                <Inputs
                                  autoFocus={
                                    blockIndex === 0 &&
                                    fieldsBlockIndex === 0 &&
                                    fieldIndex === 0
                                  }
                                  keys={name}
                                  layout={currentContentTypeLayoutData}
                                  name={name}
++                              dataForCurrentVersion={generateDataForSelectedOption()}
++                              isVersionCurrent={isVersionCurrent()}
                                />
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </FormWrapper>
                );
              })}
            </div>

            <div className="col-md-12 col-lg-3">
              {currentContentTypeLayoutRelations.length > 0 && (
                <SubWrapper
                  style={{ padding: "0 20px 1px", marginBottom: "25px" }}
                >
                  <div style={{ paddingTop: "22px" }}>
                    {currentContentTypeLayoutRelations.map((relationName) => {
                      const relation = get(
                        currentContentTypeLayoutData,
                        ["schema", "attributes", relationName],
                        {},
                      );
                      const relationMetas = get(
                        currentContentTypeLayoutData,
                        ["metadatas", relationName, "edit"],
                        {},
                      );

                      return (
                        <SelectWrapper
                          {...relation}
                          {...relationMetas}
                          key={relationName}
                          name={relationName}
                          relationsType={relation.relationType}
++                      valueToSet={
++                        isVersionCurrent()
++                          ? "current"
++                          : findSelectedVersionRelationValue(relationName)
++                      }
                        />
                      );
                    })}
                  </div>
                </SubWrapper>
              )}
              <LinkWrapper>
                <ul>
                  <CheckPermissions
                    permissions={
                      isSingleType
                        ? pluginPermissions.singleTypesConfigurations
                        : pluginPermissions.collectionTypesConfigurations
                    }
                  >
                    <LiLink
                      message={{
                        id: "app.links.configure-view",
                      }}
                      icon="layout"
                      key={`${pluginId}.link`}
                      url={`${
                        isSingleType ? `${pathname}/` : ""
                      }ctm-configurations/edit-settings/content-types`}
                      onClick={() => {
                        // emitEvent('willEditContentTypeLayoutFromEditView');
                      }}
                    />
                  </CheckPermissions>
                  {getInjectedComponents(
                    "editView",
                    "right.links",
                    plugins,
                    currentEnvironment,
                    slug,
                  )}
                </ul>
              </LinkWrapper>
++              {entityId != "create" && (
++                <div className="form-inline well">
++                  <div className="form-group pr-2">
++                    <label className="control-label">
++                      <FormattedMessage
++                        id={`${pluginId}.containers.EditView.versions`}
++                      />
++                   </label>
++                  </div>
++                  <div>
++                    <Select
++                      name="versionSelect"
++                      onChange={({ target: { value } }) => {
++                        setSelectedVersion(value);
++                      }}
++                      options={versions.map((el) => el.date).reverse()}
++                      value={selectedVersion}
++                    />
++                    <Button
++                      color="success"
++                      type="submit"
++                      disabled={isRevertButtonDisabled()}
++                    >
++                      <FormattedMessage
++                        id={`${pluginId}.containers.EditView.revert`}
++                      />
++                    </Button>
++                  </div>
++                </div>
++              )}
            </div>
          </div>
        </Container>
      </EditViewDataManagerProvider>
    </EditViewProvider>
  );
};

EditView.defaultProps = {
  currentEnvironment: "production",
  emitEvent: () => {},
  plugins: {},
};

EditView.propTypes = {
  components: PropTypes.array.isRequired,
  currentEnvironment: PropTypes.string,
  deleteLayout: PropTypes.func.isRequired,
  emitEvent: PropTypes.func,
  layouts: PropTypes.object.isRequired,
  plugins: PropTypes.object,
  slug: PropTypes.string.isRequired,
};

export { EditView };
export default memo(EditView);
```

### content-manager/admin/components/FiledComponent/index.js

```diff 
{
  "api.id": "API ID",
  "models": "Collection Types",
  "models.numbered": "Collection Types ({number})",
  "groups": "Groups",
  "groups.numbered": "Groups ({number})",
  "EditRelations.title": "Relational data",
  "components.AddFilterCTA.add": "Filters",
  "components.AddFilterCTA.hide": "Filters",
  "components.DraggableAttr.edit": "Click to edit",
  "components.DynamicZone.add-compo": "Add to {componentName}",
  "components.DynamicZone.pick-compo": "Pick one component",
  "components.DynamicZone.missing.singular": "There is {count} missing component",
  "components.DynamicZone.missing.plural": "There is {count} missing components",
  "components.EmptyAttributesBlock.button": "Go to settings page",
  "components.EmptyAttributesBlock.description": "You can change your settings",
  "components.FieldItem.linkToComponentLayout": "Set the component's layout",
  "components.FilterOptions.button.apply": "Apply",
  "components.FiltersPickWrapper.PluginHeader.actions.apply": "Apply",
  "components.FiltersPickWrapper.PluginHeader.actions.clearAll": "Clear all",
  "components.FiltersPickWrapper.PluginHeader.description": "Set the conditions to apply to filter the entries",
  "components.FiltersPickWrapper.PluginHeader.title.filter": "Filters",
  "components.FiltersPickWrapper.hide": "Hide",
  "components.notification.info.minimum-requirement": "A field has been added to match the minimum requirement",
  "components.notification.info.maximum-requirement": "You have already reached the maximum number of fields",
  "components.empty-repeatable": "No entry yet. Click on the button below to add one.",
  "components.reset-entry": "Reset entry",
  "components.LimitSelect.itemsPerPage": "Items per page",
  "components.Search.placeholder": "Search for an entry...",

  "components.SettingsViewWrapper.pluginHeader.title": "Configure the view - {name}",
  "components.SettingsViewWrapper.pluginHeader.description.edit-settings": "Customize how the edit view will look like.",
  "components.SettingsViewWrapper.pluginHeader.description.list-settings": "Define the settings of the list view.",

  "components.TableDelete.delete": "Delete all",
  "components.TableDelete.deleteSelected": "Delete selected",
  "components.TableDelete.entries.plural": "{number} entries selected",
  "components.TableDelete.entries.singular": "{number} entry selected",
  "components.TableEmpty.withFilters": "There is no {contentType} with the applied filters...",
  "components.TableEmpty.withSearch": "There is no {contentType} corresponding to the search ({search})...",
  "components.TableEmpty.withoutFilter": "There is no {contentType}...",

  "components.uid.available": "available",
  "components.uid.apply": "apply",
  "components.uid.regenerate": "regenerate",
  "components.uid.suggested": "suggested",
  "components.uid.unavailable": "unavailable",

  "containers.Edit.addAnItem": "Add an item...",
  "containers.Edit.pluginHeader.title.new": "Create an entry",
  "containers.Edit.clickToJump": "Click to jump to the entry",
  "containers.Edit.delete": "Delete",
  "containers.Edit.editing": "Editing...",
  "containers.Edit.reset": "Reset",
  "containers.Edit.returnList": "Return to list",
  "containers.Edit.seeDetails": "Details",
  "containers.Edit.submit": "Save",
  "containers.Edit.Link.Layout": "Configure the layout",
  "containers.Edit.Link.Fields": "Edit the fields",
  "containers.Edit.Link.Model": "Edit the collection-type",
  "containers.EditView.notification.errors": "The form contains some errors",
  "containers.EditView.revert": "Revert",
++  "containers.EditView.versions": "Versions",
  "containers.Home.introduction": "To edit your entries go to the specific link in the left menu. This plugin doesn't have a proper way to edit settings and it's still under active development.",
  "containers.Home.pluginHeaderDescription": "Manage your entries through a powerful and beautiful interface.",
  "containers.Home.pluginHeaderTitle": "Content Manager",

  "containers.List.addAnEntry": "Add New {entity}",
  "containers.List.errorFetchRecords": "Error",
  "containers.List.pluginHeaderDescription": "{label} entries found",
  "containers.List.pluginHeaderDescription.singular": "{label} entry found",
  "containers.ListPage.displayedFields": "Displayed Fields",

  "containers.ListSettingsView.modal-form.edit-label": "Edit the label",
  "containers.EditSettingsView.modal-form.edit-field": "Edit the field",

  "containers.SettingPage.add.field": "Insert another field",
  "containers.SettingPage.add.relational-field": "Insert another relational field",
  "containers.SettingPage.attributes": "Attributes fields",
  "containers.SettingPage.attributes.description": "Define the order of the attributes",
  "containers.SettingPage.editSettings.description": "Drag & drop the fields to build the layout",
  "containers.SettingPage.editSettings.title": "Edit view (settings)",
  "containers.SettingPage.editSettings.entry.title": "Entry title",
  "containers.SettingPage.editSettings.entry.title.description": "Set the displayed field of your entry",
  "containers.SettingPage.listSettings.description": "Configure the options for this collection type",
  "containers.SettingPage.listSettings.title": "List view (settings)",
  "containers.SettingPage.pluginHeaderDescription": "Configure the specific settings for this Collection Type",
  "containers.SettingPage.relations": "Relational fields",
  "containers.SettingPage.settings": "Settings",
  "containers.SettingPage.layout": "Layout",
  "containers.SettingPage.view": "View",
  "containers.EditView.add.new": "ADD NEW ENTRY",
  "containers.EditView.components.missing.singular": "There is {count} missing component",
  "containers.EditView.components.missing.plural": "There is {count} missing components",
  "containers.SettingViewModel.pluginHeader.title": "Content Manager - {name}",
  "containers.SettingsPage.Block.contentType.description": "Configure the specific settings",
  "containers.SettingsPage.Block.contentType.title": "Collection Types",
  "containers.SettingsPage.Block.generalSettings.description": "Configure the default options for your Collection Types",
  "containers.SettingsPage.Block.generalSettings.title": "General",
  "containers.SettingsPage.pluginHeaderDescription": "Configure the settings for all your Collection types and Groups",
  "containers.SettingsView.list.title": "Display configurations",
  "containers.SettingsView.list.subtitle": "Configure the layout and display of your Collection types and groups",

  "emptyAttributes.button": "Go to collection type builder",
  "emptyAttributes.description": "Add your first field to your Collection Type",
  "emptyAttributes.title": "There are no fields yet",
  "error.attribute.key.taken": "This value already exists",
  "error.attribute.sameKeyAndName": "Can't be equals",
  "error.attribute.taken": "This field name already exists",
  "error.contentTypeName.taken": "This name already exists",
  "error.model.fetch": "An error occurred during models config fetch.",
  "error.record.create": "An error occurred during record creation.",
  "error.record.delete": "An error occurred during record deletion.",
  "error.record.fetch": "An error occurred during record fetch.",
  "error.record.update": "An error occurred during record update.",
  "error.records.count": "An error occurred during count records fetch.",
  "error.records.fetch": "An error occurred during records fetch.",
  "error.schema.generation": "An error occurred during schema generation.",
  "error.validation.json": "This is not a JSON",
  "error.validation.max": "The value is too high.",
  "error.validation.maxLength": "The value is too long.",
  "error.validation.min": "The value is too low.",
  "error.validation.minLength": "The value is too short.",
  "error.validation.minSupMax": "Can't be superior",
  "error.validation.regex": "The value not match the regex.",
  "error.validation.required": "This value input is required.",
++  "error.relation.fetch": "Unable to get versions data",

  "form.Input.bulkActions": "Enable bulk actions",
  "form.Input.defaultSort": "Default sort attribute",
  "form.Input.description": "Description",
  "form.Input.description.placeholder": "Display name in the profile",
  "form.Input.editable": "Editable field",
  "form.Input.filters": "Enable filters",
  "form.Input.label": "Label",
  "form.Input.label.inputDescription": "This value overrides the label displayed in the table's head",
  "form.Input.pageEntries": "Entries per page",
  "form.Input.pageEntries.inputDescription": "Note: You can override this value in the Collection Type settings page.",
  "form.Input.placeholder": "Placeholder",
  "form.Input.placeholder.placeholder": "My awesome value",
  "form.Input.search": "Enable search",
  "form.Input.search.field": "Enable search on this field",
  "form.Input.sort.field": "Enable sort on this field",
  "form.Input.wysiwyg": "Display as WYSIWYG",

  "global.displayedFields": "Displayed Fields",

  "notification.error.displayedFields": "You need at least one displayed field",
  "notification.error.relationship.fetch": "An error occurred during relationship fetch.",
  "notification.info.SettingPage.disableSort": "You need to have one attribute with the sorting allowed",
  "pageNotFound": "Page not found",
  "plugin.description.long": "Quick way to see, edit and delete the data in your database.",
  "plugin.description.short": "Quick way to see, edit and delete the data in your database.",
  "popUpWarning.bodyMessage.contentType.delete": "Are you sure you want to delete this entry?",
  "popUpWarning.bodyMessage.contentType.delete.all": "Are you sure you want to delete theses entries?",
  "popUpWarning.button.cancel": "Cancel",
  "popUpWarning.button.confirm": "Confirm",
  "popUpWarning.title": "Please confirm",
  "popUpWarning.warning.cancelAllSettings": "Are you sure you want to cancel your modifications?",
  "popUpWarning.warning.updateAllSettings": "This will modify all your settings",
  "success.record.delete": "Deleted",
  "success.record.save": "Saved",
  "notification.info.minimumFields": "You need to have at least one field displayed",
  "notification.upload.error": "An error has occured while uploading your files"
}


```

### content-manager/config/routes.json

```dif
{
  "routes": [
++    {
++      "method": "GET",
++      "path": "/explorer/versions/:model/:id",
++      "handler": "Versions.listEntityVersions",
++      "config": {
++        "policies": []
++      }
++    },
    {
      "method": "GET",
      "path": "/content-types",
      "handler": "ContentTypes.listContentTypes",
      "config": {
        "policies": []
      }
    },
    {
      "method": "GET",
      "path": "/content-types/:uid",
      "handler": "ContentTypes.findContentType",
      "config": {
        "policies": []
      }
    },
    {
      "method": "PUT",
      "path": "/content-types/:uid",
      "handler": "ContentTypes.updateContentType",
      "config": {
        "policies": []
      }
    },
    {
      "method": "GET",
      "path": "/components",
      "handler": "Components.listComponents",
      "config": {
        "policies": []
      }
    },
    {
      "method": "GET",
      "path": "/components/:uid",
      "handler": "Components.findComponent",
      "config": {
        "policies": []
      }
    },
    {
      "method": "PUT",
      "path": "/components/:uid",
      "handler": "Components.updateComponent",
      "config": {
        "policies": []
      }
    },
    {
      "method": "POST",
      "path": "/explorer/uid/generate",
      "handler": "ContentManager.generateUID",
      "config": {
        "policies": []
      }
    },
    {
      "method": "POST",
      "path": "/explorer/uid/check-availability",
      "handler": "ContentManager.checkUIDAvailability",
      "config": {
        "policies": []
      }
    },
    {
      "method": "GET",
      "path": "/explorer/:model",
      "handler": "ContentManager.find",
      "config": {
        "policies": ["routing"]
      }
    },
    {
      "method": "GET",
      "path": "/explorer/:model/count",
      "handler": "ContentManager.count",
      "config": {
        "policies": ["routing"]
      }
    },
    {
      "method": "GET",
      "path": "/explorer/:model/:id",
      "handler": "ContentManager.findOne",
      "config": {
        "policies": ["routing"]
      }
    },
    {
      "method": "POST",
      "path": "/explorer/:model",
      "handler": "ContentManager.create",
      "config": {
        "policies": ["routing"]
      }
    },
    {
      "method": "PUT",
      "path": "/explorer/:model/:id",
      "handler": "ContentManager.update",
      "config": {
        "policies": ["routing"]
      }
    },
    {
      "method": "DELETE",
      "path": "/explorer/deleteAll/:model",
      "handler": "ContentManager.deleteMany",
      "config": {
        "policies": ["routing"]
      }
    },
    {
      "method": "DELETE",
      "path": "/explorer/:model/:id",
      "handler": "ContentManager.delete",
      "config": {
        "policies": ["routing"]
      }
    }
  ]
}




```

