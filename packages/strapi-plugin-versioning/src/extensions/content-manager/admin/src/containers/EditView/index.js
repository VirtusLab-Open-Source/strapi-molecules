import React, {
  memo,
  useCallback,
  useMemo,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import { get, isEqual, sortBy } from "lodash";
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
import getRequestUrl from "../../utils/getRequestUrl";

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

  const entityId = pathname.split("/").pop();
  const [versions, setVersions] = useState([{ date: "current" }]);
  const [selectedVersion, setSelectedVersion] = useState("current");

  const changeLatestDateToCurrent = (versions) => {
    if (versions.length) {
      const sortedVersions = [...versions].sort(
        (previous, next) =>
          new Date(previous.date).getTime() - new Date(next.date).getTime(),
      );

      return sortedVersions.map((sortedVersion, i, arr) => {
        if (i === arr.length - 1) {
          sortedVersion = {
            ...sortedVersion,
            date: "current",
          };
        }
        return sortedVersion;
      });
    }
    return [{ date: "current" }];
  };

  useEffect(() => {
    const getVersions = async () => {
      try {
        const versions = await request(
          getRequestUrl(`explorer/versions/${slug}/${entityId}`),
          {
            method: "GET",
          },
        );
        setVersions(changeLatestDateToCurrent(versions));
      } catch (err) {
        strapi.notification.error("content-manager.error.relation.fetch");
      }
    };
    if (entityId != "create") {
      getVersions();
    }
  }, [slug, entityId]);

  const generateDataForSelectedOption = () =>
    versions.length <= 1
      ? {}
      : versions.find((version) => version.date === selectedVersion).content;

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

  const isVersionCurrent = () => selectedVersion === "current";
  const currentFieldNames = Object.keys(currentContentTypeSchema.attributes);

  const currentVersionFieldNames = () => {
    if (selectedVersion === "current") {
      return [];
    }

    return Object.keys(generateDataForSelectedOption());
  };

  const isSelectVersionContainsAllCurrentRelations = () => {
    if (generateDataForSelectedOption()) {
      const selectedVersionAttributeNames = Object.keys(
        generateDataForSelectedOption(),
      );

      return currentContentTypeLayoutRelations.every((el) =>
        selectedVersionAttributeNames.includes(el),
      );
    }
    return true;
  };

  const removeUnnecessaryAttributes = (
    originalArray,
    unnecessaryAttributes,
  ) => {
    return originalArray.filter(
      (value) => !unnecessaryAttributes.includes(value),
    );
  };

  const isRevertButtonDisabled = () => {
    const unnecessaryAttributes = [
      "created_at",
      "created_by",
      "updated_at",
      "updated_by",
    ];
    const sortedCurrentFieldNames = sortBy(
      removeUnnecessaryAttributes(currentFieldNames, unnecessaryAttributes),
    );
    const sortedVersionsFieldNames = sortBy(
      removeUnnecessaryAttributes(
        currentVersionFieldNames(),
        unnecessaryAttributes,
      ),
    );
    const areFieldsTheSame = isEqual(
      sortedCurrentFieldNames,
      sortedVersionsFieldNames,
    );

    return (
      isVersionCurrent() ||
      !areFieldsTheSame ||
      !isSelectVersionContainsAllCurrentRelations()
    );
  };

  const findSelectedVersionRelationValue = (name) => {
    const dataForSelectedOption = generateDataForSelectedOption();
    return dataForSelectedOption[name];
  };

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
                      dataForCurrentVersion={generateDataForSelectedOption()}
                      isVersionCurrent={isVersionCurrent()}
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
                                  dataForCurrentVersion={generateDataForSelectedOption()}
                                  isVersionCurrent={isVersionCurrent()}
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
                                  dataForCurrentVersion={generateDataForSelectedOption()}
                                  isVersionCurrent={isVersionCurrent()}
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
                          valueToSet={
                            isVersionCurrent()
                              ? "current"
                              : findSelectedVersionRelationValue(relationName)
                          }
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
              {entityId != "create" && (
                <div className="form-inline well">
                  <div className="form-group pr-2">
                    <label className="control-label">
                      <FormattedMessage
                        id={`${pluginId}.containers.EditView.versions`}
                      />
                    </label>
                  </div>
                  <div>
                    <Select
                      name="versionSelect"
                      onChange={({ target: { value } }) => {
                        setSelectedVersion(value);
                      }}
                      options={versions.map((el) => el.date).reverse()}
                      value={selectedVersion}
                    />
                    <Button
                      color="success"
                      type="submit"
                      disabled={isRevertButtonDisabled()}
                    >
                      <FormattedMessage
                        id={`${pluginId}.containers.EditView.revert`}
                      />
                    </Button>
                  </div>
                </div>
              )}
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
