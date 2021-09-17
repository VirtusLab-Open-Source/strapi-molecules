import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { get, isEqual, sortBy } from 'lodash';
import { FormattedMessage } from 'react-intl';
import {
  BackHeader,
  BaselineAlignment,
  CheckPermissions,
  LiLink,
  request,
  useGlobalContext,
} from 'strapi-helper-plugin';
import { Button, Padded, Select } from '@buffetjs/core';
import pluginId from '../../pluginId';
import pluginPermissions from '../../permissions';
import Container from '../../components/Container';
import DynamicZone from '../../components/DynamicZone';
import FormWrapper from '../../components/FormWrapper';
import FieldComponent from '../../components/FieldComponent';
import Inputs from '../../components/Inputs';
import SelectWrapper from '../../components/SelectWrapper';
import { getInjectedComponents } from '../../utils';
import CollectionTypeFormWrapper from '../CollectionTypeFormWrapper';
import EditViewDataManagerProvider from '../EditViewDataManagerProvider';
import SingleTypeFormWrapper from '../SingleTypeFormWrapper';
import Header from './Header';
import {
  createAttributesLayout,
  getFieldsActionMatchingPermissions,
} from './utils';
import { LinkWrapper, SubWrapper } from './components';
import DeleteLink from './DeleteLink';
import InformationCard from './InformationCard';
import getRequestUrl from '../../utils/getRequestUrl';
import { useLocation } from 'react-router-dom';

/* eslint-disable  react/no-array-index-key */
const EditView = ({
  allowedActions,
  isSingleType,
  goBack,
  layout,
  slug,
  state,
  id,
  origin,
  userPermissions,
}) => {
  const { currentEnvironment, plugins } = useGlobalContext();
  const { pathname } = useLocation();

  const entityId = pathname.split('/').pop();
  const [versions, setVersions] = useState([{ date: 'current' }]);
  const [selectedVersion, setSelectedVersion] = useState('current');

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
            date: 'current',
          };
        }
        return sortedVersion;
      });
    }
    return [{ date: 'current' }];
  };
  useEffect(() => {
    const getVersions = async () => {
      try {
        const versions = await request(
          getRequestUrl(`explorer/versions/${slug}/${entityId}`),
          {
            method: 'GET',
          },
        );
        console.log('versions', versions);
        setVersions(changeLatestDateToCurrent(versions));
      } catch (err) {
        strapi.notification.error('content-manager.error.relation.fetch');
      }
    };
    if (entityId != 'create') {
      getVersions();
    }
  }, [slug, entityId]);
  const generateDataForSelectedOption = () =>
    versions.length <= 1
      ? {}
      : versions.find((version) => version.date === selectedVersion).content;

  // Here in case of a 403 response when fetching data we will either redirect to the previous page
  // Or to the homepage if there's no state in the history stack
  const from = get(state, 'from', '/');

  const {
    createActionAllowedFields,
    readActionAllowedFields,
    updateActionAllowedFields,
  } = useMemo(() => {
    return getFieldsActionMatchingPermissions(userPermissions, slug);
  }, [userPermissions, slug]);
  const configurationPermissions = useMemo(() => {
    return isSingleType
      ? pluginPermissions.singleTypesConfigurations
      : pluginPermissions.collectionTypesConfigurations;
  }, [isSingleType]);

  const configurationsURL = `/plugins/${pluginId}/${
    isSingleType ? 'singleType' : 'collectionType'
  }/${slug}/configurations/edit`;
  const currentContentTypeLayoutData = useMemo(
    () => get(layout, ['contentType'], {}),
    [layout],
  );

  const currentContentTypeLayoutRelations = useMemo(
    () => get(currentContentTypeLayoutData, ['layouts', 'editRelations'], []),
    [currentContentTypeLayoutData],
  );

  const DataManagementWrapper = useMemo(
    () => (isSingleType ? SingleTypeFormWrapper : CollectionTypeFormWrapper),
    [isSingleType],
  );

  // Check if a block is a dynamic zone
  const isDynamicZone = useCallback((block) => {
    return block.every((subBlock) => {
      return subBlock.every((obj) => obj.fieldSchema.type === 'dynamiczone');
    });
  }, []);

  const formattedContentTypeLayout = useMemo(() => {
    if (!currentContentTypeLayoutData.layouts) {
      return [];
    }

    return createAttributesLayout(
      currentContentTypeLayoutData.layouts.edit,
      currentContentTypeLayoutData.attributes
    );
  }, [currentContentTypeLayoutData]);

  const isVersionCurrent = () => selectedVersion === 'current';
  const currentFieldNames = Object.keys(
    currentContentTypeLayoutData.attributes,
  );
  const currentVersionFieldNames = () => {
    if (selectedVersion === 'current') {
      return [];
    }
    return Object.keys(generateDataForSelectedOption());
  };

  const isSelectVersionContainsAllCurrentRelations = () => {
    console.log(
      'generateDataForSelectedOption()',
      generateDataForSelectedOption(),
    );
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
      'created_at',
      'created_by',
      'updated_at',
      'updated_by',
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

  // TODO: create a hook to handle/provide the permissions this should be done for the i18n feature
  return (
    <DataManagementWrapper
      allLayoutData={layout}
      from={from}
      slug={slug}
      id={id}
      origin={origin}
    >
      {({
        componentsDataStructure,
        contentTypeDataStructure,
        data,
        isCreatingEntry,
        isLoadingForData,
        onDelete,
        onDeleteSucceeded,
        onPost,
        onPublish,
        onPut,
        onUnpublish,
        redirectionLink,
        status,
      }) => {
        return (
          <EditViewDataManagerProvider
            allowedActions={allowedActions}
            allLayoutData={layout}
            createActionAllowedFields={createActionAllowedFields}
            componentsDataStructure={componentsDataStructure}
            contentTypeDataStructure={contentTypeDataStructure}
            from={redirectionLink}
            initialValues={data}
            isCreatingEntry={isCreatingEntry}
            isLoadingForData={isLoadingForData}
            isSingleType={isSingleType}
            onPost={onPost}
            onPublish={onPublish}
            onPut={onPut}
            onUnpublish={onUnpublish}
            readActionAllowedFields={readActionAllowedFields}
            redirectToPreviousPage={goBack}
            slug={slug}
            status={status}
            updateActionAllowedFields={updateActionAllowedFields}
          >
            {({ onChangeVersion }) => (
              <>
                <BackHeader onClick={goBack} />
                <Container className="container-fluid">
                  <Header allowedActions={allowedActions} />
                  <div className="row" style={{ paddingTop: 3 }}>
                    <div className="col-md-12 col-lg-9" style={{ marginBottom: 13 }}>
                      {formattedContentTypeLayout.map((block, blockIndex) => {
                        if (isDynamicZone(block)) {
                          const {
                            0: {
                              0: { name, fieldSchema, metadatas, labelIcon },
                            },
                          } = block;
                          const baselineAlignementSize = blockIndex === 0 ? '3px' : '0';

                          return (
                            <BaselineAlignment key={blockIndex} top size={baselineAlignementSize}>
                              <DynamicZone
                                name={name}
                                fieldSchema={fieldSchema}
                                labelIcon={labelIcon}
                                metadatas={metadatas}
                              />
                            </BaselineAlignment>
                          );
                        }

                        return (
                          <FormWrapper key={blockIndex}>
                            {block.map((fieldsBlock, fieldsBlockIndex) => {
                              return (
                                <div className="row" key={fieldsBlockIndex}>
                                  {fieldsBlock.map(
                                    ({ name, size, fieldSchema, labelIcon, metadatas }, fieldIndex) => {
                                      const isComponent = fieldSchema.type === 'component';

                                      if (isComponent) {
                                        const { component, max, min, repeatable = false } = fieldSchema;
                                        const componentUid = fieldSchema.component;

                                        return (
                                          <FieldComponent
                                            key={componentUid}
                                            componentUid={component}
                                            labelIcon={labelIcon}
                                            isRepeatable={repeatable}
                                            label={metadatas.label}
                                            max={max}
                                            min={min}
                                            name={name}
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
                                            fieldSchema={fieldSchema}
                                            keys={name}
                                            labelIcon={labelIcon}
                                            metadatas={metadatas}
                                          />
                                        </div>
                                      );
                                    },
                                  )}
                                </div>
                              );
                            })}
                          </FormWrapper>
                        );
                      })}
                    </div>
                    <div className="col-md-12 col-lg-3">
                      <InformationCard />
                      <Padded size="smd" top />
                      {currentContentTypeLayoutData.layouts.editRelations.length > 0 && (
                        <SubWrapper style={{ padding: '0 20px 1px', marginBottom: '25px' }}>
                          <div style={{ paddingTop: '22px' }}>
                            {currentContentTypeLayoutData.layouts.editRelations.map(
                              ({ name, fieldSchema, labelIcon, metadatas, queryInfos }) => {
                                return (
                                  <SelectWrapper
                                    {...fieldSchema}
                                    {...metadatas}
                                    key={name}
                                    labelIcon={labelIcon}
                                    name={name}
                                    relationsType={fieldSchema.relationType}
                                    queryInfos={queryInfos}
                                  />
                                );
                              },
                            )}
                          </div>
                        </SubWrapper>
                      )}
                      <LinkWrapper>
                        <ul>
                          <CheckPermissions permissions={configurationPermissions}>
                            <LiLink
                              message={{
                                id: 'app.links.configure-view',
                              }}
                              icon="layout"
                              url={configurationsURL}
                              onClick={() => {
                                // emitEvent('willEditContentTypeLayoutFromEditView');
                              }}
                            />
                          </CheckPermissions>
                          {getInjectedComponents(
                            'editView',
                            'right.links',
                            plugins,
                            currentEnvironment,
                            slug,
                          )}
                          {allowedActions.canDelete && (
                            <DeleteLink
                              isCreatingEntry={isCreatingEntry}
                              onDelete={onDelete}
                              onDeleteSucceeded={onDeleteSucceeded}
                            />
                          )}
                        </ul>
                      </LinkWrapper>
                      {entityId !== 'create' && (
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
                                if (onChangeVersion) {
                                  onChangeVersion(
                                    versions.find(({ date }) => date === value)
                                      ?.content,
                                  );
                                }
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
              </>
            )}
          </EditViewDataManagerProvider>
        );
      }}
    </DataManagementWrapper>
  );
};

EditView.defaultProps = {
  id: null,
  isSingleType: false,
  origin: null,
  state: {},
};

EditView.propTypes = {
  layout: PropTypes.shape({
    components: PropTypes.object.isRequired,
    contentType: PropTypes.shape({
      uid: PropTypes.string.isRequired,
      settings: PropTypes.object.isRequired,
      metadatas: PropTypes.object.isRequired,
      options: PropTypes.object.isRequired,
      attributes: PropTypes.object.isRequired,
    }).isRequired,
  }).isRequired,
  id: PropTypes.string,
  isSingleType: PropTypes.bool,
  goBack: PropTypes.func.isRequired,
  origin: PropTypes.string,
  state: PropTypes.object,
  slug: PropTypes.string.isRequired,
};

export { EditView };
export default memo(EditView);
