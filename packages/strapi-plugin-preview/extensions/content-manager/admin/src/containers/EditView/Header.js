import React, { useMemo, useRef, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { Header as PluginHeader } from "@buffetjs/custom";
import { get, isEqual, isEmpty, toString } from "lodash";

import {
  PopUpWarning,
  request,
  templateObject,
  useGlobalContext,
} from "strapi-helper-plugin";

import pluginId from "../../pluginId";
import useDataManager from "../../hooks/useDataManager";
import useEditView from "../../hooks/useEditView";

const getRequestUrl = (path) => `/${pluginId}/explorer/${path}`;
const getFrontendEntityUrl = (path, id) =>
  `/admin/plugins/${pluginId}/collectionType/${path}/${id}`;

const Header = () => {
  const [showWarningCancel, setWarningCancel] = useState(false);
  const [showWarningClone, setWarningClone] = useState(false);
  const [showWarningPublish, setWarningPublish] = useState(false);

  const [showWarningDelete, setWarningDelete] = useState(false);
  const [didDeleteEntry, setDidDeleteEntry] = useState(false);
  const [didCloneEntry, setDidCloneEntry] = useState(false);
  const [previewable, setIsPreviewable] = useState(false);

  const [
    isModalConfirmButtonLoading,
    setIsModalConfirmButtonLoading,
  ] = useState(false);
  const { formatMessage } = useIntl();
  const formatMessageRef = useRef(formatMessage);
  const { emitEvent } = useGlobalContext();

  const {
    initialData,
    isCreatingEntry,
    isSingleType,
    isSubmitting,
    layout,
    modifiedData,
    redirectToPreviousPage,
    resetData,
    slug,
    clearData,
  } = useDataManager();
  const {
    allowedActions: { canDelete, canUpdate, canCreate },
  } = useEditView();

  useEffect(() => {
    request(`/preview/is-previewable/${layout.apiID}`, {
      method: "GET",
    }).then(({ isPreviewable }) => {
      setIsPreviewable(isPreviewable);
    });
  }, [initialData]);

  const currentContentTypeMainField = useMemo(
    () => get(layout, ["settings", "mainField"], "id"),
    [layout],
  );
  const currentContentTypeName = useMemo(
    () => get(layout, ["schema", "info", "name"]),
    [layout],
  );
  const didChangeData = useMemo(() => {
    return (
      !isEqual(initialData, modifiedData) ||
      (isCreatingEntry && !isEmpty(modifiedData))
    );
  }, [initialData, isCreatingEntry, modifiedData]);
  const apiID = useMemo(() => layout.apiID, [layout.apiID]);

  /* eslint-disable indent */
  const entryHeaderTitle = isCreatingEntry
    ? formatMessage({
        id: `${pluginId}.containers.Edit.pluginHeader.title.new`,
      })
    : templateObject({ mainField: currentContentTypeMainField }, initialData)
        .mainField;
  /* eslint-enable indent */

  const headerTitle = useMemo(() => {
    const title = isSingleType ? currentContentTypeName : entryHeaderTitle;

    return title || currentContentTypeName;
  }, [currentContentTypeName, entryHeaderTitle, isSingleType]);

  const headerActions = useMemo(() => {
    let headerActions = [];

    if ((isCreatingEntry && canCreate) || (!isCreatingEntry && canUpdate)) {
      headerActions = [
        {
          disabled: !didChangeData,
          onClick: () => {
            toggleWarningCancel();
          },
          color: "cancel",
          label: formatMessage({
            id: `${pluginId}.containers.Edit.reset`,
          }),
          type: "button",
          style: {
            paddingLeft: 15,
            paddingRight: 15,
            fontWeight: 600,
          },
        },
        {
          disabled: !didChangeData,
          color: "success",
          label: formatMessage({
            id: `${pluginId}.containers.Edit.submit`,
          }),
          isLoading: isSubmitting,
          type: "submit",
          style: {
            minWidth: 150,
            fontWeight: 600,
          },
        },
      ];
    }

    if (!isCreatingEntry && canDelete) {
      headerActions.unshift({
        label: formatMessage({
          id: "app.utils.delete",
        }),
        color: "delete",
        onClick: () => {
          toggleWarningDelete();
        },
        type: "button",
        style: {
          paddingLeft: 15,
          paddingRight: 15,
          fontWeight: 600,
        },
      });
    }

    if (!isCreatingEntry && canDelete && previewable) {
      headerActions.unshift({
        label: formatMessage({
          id: `${pluginId}.containers.Edit.clone`,
        }),
        color: "secondary",
        onClick: () => {
          toggleWarningClone();
        },
        type: "button",
        style: {
          paddingLeft: 15,
          paddingRight: 15,
          fontWeight: 600,
        },
      });

      headerActions.unshift({
        label: formatMessage({
          id: `${pluginId}.containers.Edit.preview`,
        }),
        color: "secondary",
        onClick: async () => {
          await request(
            `/preview/preview-url/${layout.apiID}/${initialData.id}`,
            {
              method: "GET",
            },
          ).then((data) => {
            window.open(data.url, "_blank");
          });
        },
        type: "button",
        style: {
          paddingLeft: 15,
          paddingRight: 15,
          fontWeight: 600,
        },
      });
      if (!!initialData.cloneOf) {
        headerActions.unshift({
          disabled: didChangeData,
          label: formatMessage({
            id: `${pluginId}.containers.Edit.publish`,
          }),
          color: "primary",
          onClick: async () => {
            toggleWarningPublish();
          },
          type: "button",
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
    canCreate,
    canDelete,
    canUpdate,
    didChangeData,
    isCreatingEntry,
    isSubmitting,
    formatMessage,
    previewable,
  ]);

  const headerProps = useMemo(() => {
    return {
      title: {
        label: toString(headerTitle),
      },
      content: `${formatMessageRef.current({
        id: `${pluginId}.api.id`,
      })} : ${apiID}`,
      actions: headerActions,
    };
  }, [headerActions, headerTitle, apiID]);

  const toggleWarningCancel = () => setWarningCancel((prevState) => !prevState);
  const toggleWarningDelete = () => setWarningDelete((prevState) => !prevState);
  const toggleWarningClone = () => setWarningClone((prevState) => !prevState);
  const toggleWarningPublish = () =>
    setWarningPublish((prevState) => !prevState);

  const handleConfirmReset = () => {
    toggleWarningCancel();
    resetData();
  };

  const handleConfirmDelete = async () => {
    try {
      // Show the loading state
      setIsModalConfirmButtonLoading(true);

      emitEvent("willDeleteEntry");

      await request(getRequestUrl(`${slug}/${initialData.id}`), {
        method: "DELETE",
      });

      strapi.notification.success(`${pluginId}.success.record.delete`);

      emitEvent("didDeleteEntry");

      // This is used to perform action after the modal is closed
      // so the transitions are smoother
      // Actions will be performed in the handleClosed function
      setDidDeleteEntry(true);
    } catch (err) {
      emitEvent("didNotDeleteEntry", { error: err });
      const errorMessage = get(
        err,
        "response.payload.message",
        formatMessage({ id: `${pluginId}.error.record.delete` }),
      );
      strapi.notification.error(errorMessage);
    } finally {
      setIsModalConfirmButtonLoading(false);
      toggleWarningDelete();
    }
  };

  const handleConfirmClone = async () => {
    try {
      // Show the loading state
      setIsModalConfirmButtonLoading(true);

      emitEvent("willCloneEntry");

      await request(getRequestUrl(`${slug}`), {
        method: "POST",
        body: {
          ...initialData,
          cloneOf: initialData.id,
          options: {
            ...initialData.options,
            previewable: true,
          },
        },
      });

      strapi.notification.success(`${pluginId}.success.record.delete`);

      emitEvent("didCloneEntry");

      // This is used to perform action after the modal is closed
      // so the transitions are smoother
      // Actions will be performed in the handleClosed function
      setDidCloneEntry(true);
    } catch (err) {
      emitEvent("didNotCloneEntry", { error: err });
      const errorMessage = get(
        err,
        "response.payload.message",
        formatMessage({ id: `${pluginId}.error.record.delete` }),
      );
      strapi.notification.error(errorMessage);
    } finally {
      setIsModalConfirmButtonLoading(false);
      toggleWarningClone();
    }
  };

  const handleConfirmPublish = async () => {
    try {
      // Show the loading state
      setIsModalConfirmButtonLoading(true);

      emitEvent("willPublishEntry");

      let targetId = initialData.cloneOf.id;
      const urlPart = getRequestUrl(slug);
      const body = prepareToPublish({
        ...initialData,
        id: targetId,
        cloneOf: null,
      });
      await request(`${urlPart}/${targetId}`, {
        method: "PUT",
        body,
      });

      await request(`${urlPart}/${initialData.id}`, {
        method: "DELETE",
      });

      strapi.notification.success(`${pluginId}.success.record.publish`);
      emitEvent("didPublishEntry");

      window.location.replace(getFrontendEntityUrl(slug, targetId));
    } catch (err) {
      emitEvent("didNotPublishEntry", { error: err });
      const errorMessage = get(
        err,
        "response.payload.message",
        formatMessage({ id: `${pluginId}.error.record.publish` }),
      );
      strapi.notification.error(errorMessage);
    } finally {
      setIsModalConfirmButtonLoading(false);
      toggleWarningPublish();
    }
  };

  const handleClosed = () => {
    if (didDeleteEntry) {
      if (!isSingleType) {
        redirectToPreviousPage();
      } else {
        clearData();
      }
    }

    setDidDeleteEntry(false);
  };

  const handleClosedAfterClone = () => {
    if (didCloneEntry) {
      if (!isSingleType) {
        redirectToPreviousPage();
      } else {
        clearData();
      }
    }

    setDidCloneEntry(false);
  };

  return (
    <>
      <PluginHeader {...headerProps} />
      <PopUpWarning
        isOpen={showWarningCancel}
        toggleModal={toggleWarningCancel}
        content={{
          title: `${pluginId}.popUpWarning.title`,
          message: `${pluginId}.popUpWarning.warning.cancelAllSettings`,
          cancel: `${pluginId}.popUpWarning.button.cancel`,
          confirm: `${pluginId}.popUpWarning.button.confirm`,
        }}
        popUpWarningType="danger"
        onConfirm={handleConfirmReset}
      />
      <PopUpWarning
        isOpen={showWarningDelete}
        toggleModal={toggleWarningDelete}
        content={{
          title: `${pluginId}.popUpWarning.title`,
          message: `${pluginId}.popUpWarning.bodyMessage.contentType.delete`,
          cancel: `${pluginId}.popUpWarning.button.cancel`,
          confirm: `${pluginId}.popUpWarning.button.confirm`,
        }}
        popUpWarningType="danger"
        onConfirm={handleConfirmDelete}
        onClosed={handleClosed}
        isConfirmButtonLoading={isModalConfirmButtonLoading}
      />
      <PopUpWarning
        isOpen={showWarningClone}
        toggleModal={toggleWarningClone}
        content={{
          title: `${pluginId}.popUpWarning.title`,
          message: `${pluginId}.popUpWarning.bodyMessage.contentType.clone`,
          cancel: `${pluginId}.popUpWarning.button.cancel`,
          confirm: `${pluginId}.popUpWarning.button.confirm`,
        }}
        popUpWarningType="info"
        onConfirm={handleConfirmClone}
        onClosed={handleClosedAfterClone}
        isConfirmButtonLoading={isModalConfirmButtonLoading}
      />
      <PopUpWarning
        isOpen={showWarningPublish}
        toggleModal={toggleWarningPublish}
        content={{
          title: `${pluginId}.popUpWarning.title`,
          message: `${pluginId}.popUpWarning.bodyMessage.contentType.publish`,
          cancel: `${pluginId}.popUpWarning.button.cancel`,
          confirm: `${pluginId}.popUpWarning.button.confirm`,
        }}
        popUpWarningType="info"
        onConfirm={handleConfirmPublish}
        isConfirmButtonLoading={isModalConfirmButtonLoading}
      />
    </>
  );
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
    if (payload.hasOwnProperty("__component")) {
      delete payload.id;
    }
    Object.values(payload).forEach(prepareToPublish);
  }
  return payload;
}

export default Header;
