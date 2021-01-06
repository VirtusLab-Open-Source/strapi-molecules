import PropTypes from 'prop-types';
import React, { useState, useMemo, useContext, createContext } from 'react';
import { useIntl } from 'react-intl';
import { request, PopUpWarning } from 'strapi-helper-plugin';

import { get, isEmpty, isEqual } from 'lodash';

const CONTENT_MANAGER_PLUGIN_ID = 'content-manager';

const PreviewContext = createContext(undefined);

export const PreviewProvider = ({
  children,
  initialData,
  isCreatingEntry,
  layout,
  modifiedData,
  slug,
  canUpdate,
  canCreate,
  getPreviewUrlParams = () => ({}),
}) => {
  const { formatMessage } = useIntl();

  const [showWarningClone, setWarningClone] = useState(false);
  const [showWarningPublish, setWarningPublish] = useState(false);
  const [isButtonLoading, setButtonLoading] = useState(false);

  const isPreviewable = get(layout, 'schema.options.previewable', false);
  const isCloneable = get(layout, 'schema.options.cloneable', false);

  const toggleWarningClone = () => setWarningClone((prevState) => !prevState);
  const toggleWarningPublish = () =>
    setWarningPublish((prevState) => !prevState);

  const didChangeData = useMemo(() => {
    return (
      !isEqual(initialData, modifiedData) ||
      (isCreatingEntry && !isEmpty(modifiedData))
    );
  }, [initialData, isCreatingEntry, modifiedData]);

  const previewHeaderActions = useMemo(() => {
    const headerActions = [];

    if (!((isCreatingEntry && canCreate) || (!isCreatingEntry && canUpdate))) {
      return headerActions;
    }
    if (isPreviewable) {
      const params = getPreviewUrlParams(initialData, modifiedData, layout);
      headerActions.push({
        disabled: didChangeData,
        label: formatMessage({
          id: getPreviewPluginTrad('containers.Edit.preview'),
        }),
        color: 'secondary',
        onClick: async () => {
          try {
            const data = await request(
              `/preview/preview-url/${layout.apiID}/${initialData.id}`,
              {
                method: 'GET',
                params,
              },
            );
            if (data.url) {
              window.open(data.url, '_blank');
            } else {
              strapi.notification.error(
                getPreviewPluginTrad('error.previewUrl.notFound'),
              );
            }
          } catch (_e) {
            strapi.notification.error(
              getPreviewPluginTrad('error.previewUrl.notFound'),
            );
          }
        },
        type: 'button',
        style: {
          paddingLeft: 15,
          paddingRight: 15,
          fontWeight: 600,
        },
      });
    }
    if (isCloneable) {
      if (initialData.cloneOf) {
        headerActions.push({
          disabled: didChangeData,
          label: formatMessage({
            id: getPreviewPluginTrad('containers.Edit.publish'),
          }),
          color: 'primary',
          onClick: async () => {
            toggleWarningPublish();
          },
          type: 'button',
          style: {
            paddingLeft: 15,
            paddingRight: 15,
            fontWeight: 600,
          },
        });
      } else {
        headerActions.push({
          disabled: didChangeData,
          label: formatMessage({
            id: getPreviewPluginTrad('containers.Edit.clone'),
          }),
          color: 'secondary',
          onClick: toggleWarningClone,
          type: 'button',
          style: {
            paddingLeft: 15,
            paddingRight: 15,
            fontWeight: 600,
          },
        });
      }
    }

    return headerActions;
  }, [
    didChangeData,
    formatMessage,
    layout.apiID,
    isPreviewable,
    initialData.cloneOf,
    initialData.id,
    canCreate,
    canUpdate,
    isCreatingEntry,
  ]);

  const handleConfirmPreviewClone = async () => {
    try {
      // Show the loading state
      setButtonLoading(true);
      const clonedPayload = await request(getRequestUrl(slug), {
        method: 'POST',
        body: {
          ...initialData,
          cloneOf: initialData.id,
        },
      });

      strapi.notification.success(getPreviewPluginTrad('success.record.clone'));

      window.location.replace(getFrontendEntityUrl(slug, clonedPayload.id));
    } catch (err) {
      const errorMessage = get(
        err,
        'response.payload.message',
        formatMessage({ id: getPreviewPluginTrad('error.record.clone') }),
      );
      strapi.notification.error(errorMessage);
    } finally {
      setButtonLoading(false);
      toggleWarningClone();
    }
  };
  const handleConfirmPreviewPublish = async () => {
    try {
      // Show the loading state
      setButtonLoading(true);

      let targetId = initialData.cloneOf.id;
      const urlPart = getRequestUrl(slug);
      const body = prepareToPublish({
        ...initialData,
        id: targetId,
        cloneOf: null,
      });

      await request(`${urlPart}/${targetId}`, {
        method: 'PUT',
        body,
      });
      await request(`${urlPart}/${initialData.id}`, {
        method: 'DELETE',
      });

      strapi.notification.success(
        getPreviewPluginTrad('success.record.publish'),
      );
      window.location.replace(getFrontendEntityUrl(slug, targetId));
    } catch (err) {
      const errorMessage = get(
        err,
        'response.payload.message',
        formatMessage({ id: getPreviewPluginTrad('error.record.publish') }),
      );
      strapi.notification.error(errorMessage);
    } finally {
      setButtonLoading(false);
      toggleWarningPublish();
    }
  };

  const value = {
    previewHeaderActions,
  };

  return (
    <>
      <PreviewContext.Provider value={value}>
        {children}
      </PreviewContext.Provider>
      {isCloneable && (
        <PopUpWarning
          isOpen={showWarningClone}
          toggleModal={toggleWarningClone}
          content={{
            message: getPreviewPluginTrad('popUpWarning.warning.clone'),
            secondMessage: getPreviewPluginTrad(
              'popUpWarning.warning.clone-question',
            ),
          }}
          popUpWarningType="info"
          onConfirm={handleConfirmPreviewClone}
          isConfirmButtonLoading={isButtonLoading}
        />
      )}
      {isCloneable && (
        <PopUpWarning
          isOpen={showWarningPublish}
          toggleModal={toggleWarningPublish}
          content={{
            message: getPreviewPluginTrad('popUpWarning.warning.publish'),
            secondMessage: getPreviewPluginTrad(
              'popUpWarning.warning.publish-question',
            ),
          }}
          popUpWarningType="info"
          onConfirm={handleConfirmPreviewPublish}
          isConfirmButtonLoading={isButtonLoading}
        />
      )}
    </>
  );
};

export const usePreview = () => {
  const context = useContext(PreviewContext);

  if (context === undefined) {
    throw new Error('usePreview must be used within a PreviewProvider');
  }

  return context;
};

/**
 * Should remove ID's from components -
 * could modify only already attached componetns (with proper ID)
 * or create new one - in that case removing id will create new one
 * @param {object} payload
 */
function prepareToPublish(payload) {
  if (Array.isArray(payload)) {
    payload.forEach(prepareToPublish);
  } else if (payload && payload.constructor === Object) {
    // eslint-disable-next-line no-prototype-builtins
    if (payload.hasOwnProperty('__component')) {
      delete payload.id;
    }
    Object.values(payload).forEach(prepareToPublish);
  }

  return payload;
}

const getRequestUrl = (path) =>
  `/${CONTENT_MANAGER_PLUGIN_ID}/explorer/${path}`;
const getFrontendEntityUrl = (path, id) =>
  `/admin/plugins/${CONTENT_MANAGER_PLUGIN_ID}/collectionType/${path}/${id}`;

const getPreviewPluginTrad = (id) => `preview.${id}`;

PreviewProvider.propTypes = {
  children: PropTypes.node.isRequired,
  canUpdate: PropTypes.bool.isRequired,
  canCreate: PropTypes.bool.isRequired,
  initialData: PropTypes.object.isRequired,
  isCreatingEntry: PropTypes.bool.isRequired,
  layout: PropTypes.object.isRequired,
  modifiedData: PropTypes.object.isRequired,
  slug: PropTypes.string.isRequired,
  getPreviewUrlParams: PropTypes.func,
};
