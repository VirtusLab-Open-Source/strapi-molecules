# Strapi-plugin-preview migation guide

To install correctly one of required steps are integrate changes in extension
content-manager, this manual will show diff for a specific version:

Strapi-plugin-versioning needs extension files to work properly. In case if you
have already extended content-manager files we are providing list of changes to
help you with merge.

Below changes are diff to strapi-plugin-content-manager in version `3.1.4`

### extensions/content-manager/admin/src/components/CustomTable/Row.js

```diff
--- extensions/content-manager/admin/src/components/CustomTable/Row.js
+++ strapi-plugin-preview/extensions/content-manager/admin/src/components/CustomTable/Row.js

const getDisplayedValue = (type, value, name) => {
  switch (toLower(type)) {
    case 'string':
    case 'text':
    case 'email':
    case 'enumeration':
    case 'uid':
      return (value && !isEmpty(toString(value))) || name === 'id'
        ? toString(value)
        : '-';
    case 'float':
    case 'integer':
    case 'biginteger':
    case 'decimal':
      return !isNull(value) ? toString(value) : '-';
    case 'boolean':
      return value !== null ? toString(value) : '-';
    case 'date':
    case 'datetime':
    case 'timestamp': {
      if (value == null) {
        return '-';
      }

      const date =
        value && isObject(value) && value._isAMomentObject === true
          ? JSON.stringify(value)
          : value;

      return moment(date).format(dateFormats[type]);
    }
    case 'password':
      return '••••••••';
    case 'media':
    case 'file':
    case 'files':
      return value;
    case 'time': {
      if (!value) {
        return '-';
      }

      const [hour, minute, second] = value.split(':');
      const timeObj = {
        hour,
        minute,
        second,
      };
      const date = moment().set(timeObj);

      return date.format(dateFormats.time);
    }
+    // MODIFIED START --------------
+    case 'relation': {
+      if (name === 'cloneOf' && value) {
+        return <b style={{ color: 'blue' }}>clone</b>;
+      }
+      return '-';
+    }
+    // MODIFIED END ----------------
    default:
      return '-';
  }
};

```

### extensions/content-manager/admin/src/containers/EditView/Header.js

```diff
- import React, { useMemo, useRef, useState } from 'react';
+ import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Header as PluginHeader } from '@buffetjs/custom';
import { get, isEqual, isEmpty, toString } from 'lodash';

import { PopUpWarning, request, templateObject, useGlobalContext } from 'strapi-helper-plugin';

import pluginId from '../../pluginId';
import useDataManager from '../../hooks/useDataManager';
import useEditView from '../../hooks/useEditView';

const getRequestUrl = path => `/${pluginId}/explorer/${path}`;
+const getFrontendEntityUrl = (path, id) => `/admin/plugins/${pluginId}/collectionType/${path}/${id}`;

const Header = () => {
  const [showWarningCancel, setWarningCancel] = useState(false);
+  const [showWarningClone, setWarningClone] = useState(false);
+  const [showWarningPublish, setWarningPublish] = useState(false);
+
  const [showWarningDelete, setWarningDelete] = useState(false);
  const [didDeleteEntry, setDidDeleteEntry] = useState(false);
  const [isModalConfirmButtonLoading, setIsModalConfirmButtonLoading] = useState(false);

+  const [didCloneEntry, setDidCloneEntry] = useState(false);
+  const [previewable, setIsPreviewable] = useState(false);
+
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

  const currentContentTypeMainField = useMemo(() => get(layout, ['settings', 'mainField'], 'id'), [
    layout,
  ]);
  const currentContentTypeName = useMemo(() => get(layout, ['schema', 'info', 'name']), [layout]);

+  useEffect(() => {
+    request(`/preview/is-previewable/${layout.apiID}`, {
+      method: 'GET',
+    }).then(({ isPreviewable }) => {
+      setIsPreviewable(isPreviewable);
+    });
+  }, [initialData]);
+
  const didChangeData = useMemo(() => {
    return !isEqual(initialData, modifiedData) || (isCreatingEntry && !isEmpty(modifiedData));
  }, [initialData, isCreatingEntry, modifiedData]);
  const apiID = useMemo(() => layout.apiID, [layout.apiID]);

  /* eslint-disable indent */
  const entryHeaderTitle = isCreatingEntry
    ? formatMessage({
        id: `${pluginId}.containers.Edit.pluginHeader.title.new`,
      })
    : templateObject({ mainField: currentContentTypeMainField }, initialData).mainField;
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
          color: 'cancel',
          label: formatMessage({
            id: `${pluginId}.containers.Edit.reset`,
          }),
          type: 'button',
          style: {
            paddingLeft: 15,
            paddingRight: 15,
            fontWeight: 600,
          },
        },
        {
          disabled: !didChangeData,
          color: 'success',
          label: formatMessage({
            id: `${pluginId}.containers.Edit.submit`,
          }),
          isLoading: isSubmitting,
          type: 'submit',
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
          id: 'app.utils.delete',
        }),
        color: 'delete',
        onClick: () => {
          toggleWarningDelete();
        },
        type: 'button',
        style: {
          paddingLeft: 15,
          paddingRight: 15,
          fontWeight: 600,
        },
      });
    }

+    if (!isCreatingEntry && canDelete && previewable) {
+      headerActions.unshift({
+        label: formatMessage({
+          id: `${pluginId}.containers.Edit.clone`,
+        }),
+        color: 'secondary',
+        onClick: () => {
+          toggleWarningClone();
+        },
+        type: 'button',
+        style: {
+          paddingLeft: 15,
+          paddingRight: 15,
+          fontWeight: 600,
+        },
+      });
+
+      headerActions.unshift({
+        label: formatMessage({
+          id: `${pluginId}.containers.Edit.preview`,
+        }),
+        color: 'secondary',
+        onClick: async () => {
+          await request(
+            `/preview/preview-url/${layout.apiID}/${initialData.id}`,
+            {
+              method: 'GET',
+            },
+          ).then((data) => {
+            window.open(data.url, '_blank');
+          });
+        },
+        type: 'button',
+        style: {
+          paddingLeft: 15,
+          paddingRight: 15,
+          fontWeight: 600,
+        },
+      });
+      if (!!initialData.cloneOf) {
+        headerActions.unshift({
+          disabled: didChangeData,
+          label: formatMessage({
+            id: `${pluginId}.containers.Edit.publish`,
+          }),
+          color: 'primary',
+          onClick: async () => {
+            toggleWarningPublish();
+          },
+          type: 'button',
+          style: {
+            paddingLeft: 15,
+            paddingRight: 15,
+            fontWeight: 600,
+          },
+        });
+      }
+    }
+
    return headerActions;
  }, [
    canCreate,
    canDelete,
    canUpdate,
    didChangeData,
    isCreatingEntry,
    isSubmitting,
    formatMessage,
+    previewable,
  ]);

  const headerProps = useMemo(() => {
    return {
      title: {
        label: toString(headerTitle),
      },
      content: `${formatMessageRef.current({ id: `${pluginId}.api.id` })} : ${apiID}`,
      actions: headerActions,
    };
  }, [headerActions, headerTitle, apiID]);

  const toggleWarningCancel = () => setWarningCancel(prevState => !prevState);
  const toggleWarningDelete = () => setWarningDelete(prevState => !prevState);
+  const toggleWarningClone = () => setWarningClone((prevState) => !prevState);
+  const toggleWarningPublish = () => setWarningPublish((prevState) => !prevState);

  const handleConfirmReset = () => {
    toggleWarningCancel();
    resetData();
  };

  const handleConfirmDelete = async () => {
    try {
      // Show the loading state
      setIsModalConfirmButtonLoading(true);

      emitEvent('willDeleteEntry');

      await request(getRequestUrl(`${slug}/${initialData.id}`), {
        method: 'DELETE',
      });

      strapi.notification.success(`${pluginId}.success.record.delete`);

      emitEvent('didDeleteEntry');

      // This is used to perform action after the modal is closed
      // so the transitions are smoother
      // Actions will be performed in the handleClosed function
      setDidDeleteEntry(true);
    } catch (err) {
      emitEvent('didNotDeleteEntry', { error: err });
      const errorMessage = get(
        err,
        'response.payload.message',
        formatMessage({ id: `${pluginId}.error.record.delete` })
      );
      strapi.notification.error(errorMessage);
    } finally {
      setIsModalConfirmButtonLoading(false);
      toggleWarningDelete();
    }
  };

+  const handleConfirmClone = async () => {
+    try {
+      // Show the loading state
+      setIsModalConfirmButtonLoading(true);
+
+      emitEvent('willCloneEntry');
+
+      await request(getRequestUrl(`${slug}`), {
+        method: 'POST',
+        body: {
+          ...initialData,
+          cloneOf: initialData.id,
+          options: {
+            ...initialData.options,
+            previewable: true,
+          },
+        },
+      });
+
+      strapi.notification.success(`${pluginId}.success.record.delete`);
+
+      emitEvent('didCloneEntry');
+
+      // This is used to perform action after the modal is closed
+      // so the transitions are smoother
+      // Actions will be performed in the handleClosed function
+      setDidCloneEntry(true);
+    } catch (err) {
+      emitEvent('didNotCloneEntry', { error: err });
+      const errorMessage = get(
+        err,
+        'response.payload.message',
+        formatMessage({ id: `${pluginId}.error.record.delete` }),
+      );
+      strapi.notification.error(errorMessage);
+    } finally {
+      setIsModalConfirmButtonLoading(false);
+      toggleWarningClone();
+    }
+  };
+
+  const handleConfirmPublish = async () => {
+    try {
+      // Show the loading state
+      setIsModalConfirmButtonLoading(true);
+
+      emitEvent('willPublishEntry');
+
+      let targetId = initialData.cloneOf.id;
+      const urlPart = getRequestUrl(slug);
+      const body = prepareToPublish({
+        ...initialData,
+        id: targetId,
+        cloneOf: null,
+      });
+      await request(`${urlPart}/${targetId}`, {
+        method: 'PUT',
+        body,
+      });
+
+      await request(`${urlPart}/${initialData.id}`, {
+        method: 'DELETE',
+      });
+
+      strapi.notification.success(`${pluginId}.success.record.publish`);
+      emitEvent('didPublishEntry');
+
+      window.location.replace(getFrontendEntityUrl(slug, targetId));
+    } catch (err) {
+      emitEvent('didNotPublishEntry', { error: err });
+      const errorMessage = get(
+        err,
+        'response.payload.message',
+        formatMessage({ id: `${pluginId}.error.record.publish` }),
+      );
+      strapi.notification.error(errorMessage);
+    } finally {
+      setIsModalConfirmButtonLoading(false);
+      toggleWarningPublish();
+    }
+  };
+
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

+  const handleClosedAfterClone = () => {
+    if (didCloneEntry) {
+      if (!isSingleType) {
+        redirectToPreviousPage();
+      } else {
+        clearData();
+      }
+    }
+
+    setDidCloneEntry(false);
+  };
+
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
+      <PopUpWarning
+        isOpen={showWarningClone}
+        toggleModal={toggleWarningClone}
+        content={{
+          title: `${pluginId}.popUpWarning.title`,
+          message: `${pluginId}.popUpWarning.bodyMessage.contentType.clone`,
+          cancel: `${pluginId}.popUpWarning.button.cancel`,
+          confirm: `${pluginId}.popUpWarning.button.confirm`,
+        }}
+        popUpWarningType='info'
+        onConfirm={handleConfirmClone}
+        onClosed={handleClosedAfterClone}
+        isConfirmButtonLoading={isModalConfirmButtonLoading}
+      />
+      <PopUpWarning
+        isOpen={showWarningPublish}
+        toggleModal={toggleWarningPublish}
+        content={{
+          title: `${pluginId}.popUpWarning.title`,
+          message: `${pluginId}.popUpWarning.bodyMessage.contentType.publish`,
+          cancel: `${pluginId}.popUpWarning.button.cancel`,
+          confirm: `${pluginId}.popUpWarning.button.confirm`,
+        }}
+        popUpWarningType='info'
+        onConfirm={handleConfirmPublish}
+        isConfirmButtonLoading={isModalConfirmButtonLoading}
+      />
    </>
  );
};

+/**
+ * Should remove ID's from components -
+ * could modify only already attached componetns (with proper ID)
+ * or create new one - in that case removing id will create new one
+ * @param {object} payload
+ */
+function prepareToPublish(payload) {
+  if (Array.isArray(payload)) {
+    payload.forEach(prepareToPublish);
+  } else if (payload && payload.constructor === Object) {
+    if (payload.hasOwnProperty('__component')) {
+      delete payload.id;
+    }
+    Object.values(payload).forEach(prepareToPublish);
+  }
+  return payload;
+}
+
export default Header;

```

### extensions/content-manager/admin/src/containers/ListView/index.js

```diff
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { get, sortBy } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { Header } from '@buffetjs/custom';
import {
  PopUpWarning,
  generateFiltersFromSearch,
  useGlobalContext,
  request,
  CheckPermissions,
  useUserPermissions,
  useQuery,
} from 'strapi-helper-plugin';
import pluginId from '../../pluginId';
import pluginPermissions from '../../permissions';
import { generatePermissionsObject, getRequestUrl } from '../../utils';

import DisplayedFieldsDropdown from '../../components/DisplayedFieldsDropdown';
import Container from '../../components/Container';
import CustomTable from '../../components/CustomTable';
import FilterPicker from '../../components/FilterPicker';
import Search from '../../components/Search';
import ListViewProvider from '../ListViewProvider';
import { onChangeListLabels, resetListLabels } from '../Main/actions';
import { AddFilterCta, FilterIcon, Wrapper } from './components';
import Filter from './Filter';
import Footer from './Footer';
import {
  getData,
  getDataSucceeded,
  onChangeBulk,
  onChangeBulkSelectall,
  onDeleteDataError,
  onDeleteDataSucceeded,
  onDeleteSeveralDataSucceeded,
  resetProps,
  setModalLoadingState,
  toggleModalDelete,
  toggleModalDeleteAll,
} from './actions';

import makeSelectListView from './selectors';

/* eslint-disable react/no-array-index-key */

function ListView({
  count,
  data,
  didDeleteData,
  emitEvent,
  entriesToDelete,
  isLoading,
  location: { pathname },
  getData,
  getDataSucceeded,
  layouts,
  history: { push },
  onChangeBulk,
  onChangeBulkSelectall,
  onChangeListLabels,
  onDeleteDataError,
  onDeleteDataSucceeded,
  onDeleteSeveralDataSucceeded,
  resetListLabels,
  resetProps,
  setModalLoadingState,
  showWarningDelete,
  showModalConfirmButtonLoading,
  showWarningDeleteAll,
  slug,
  toggleModalDelete,
  toggleModalDeleteAll,
}) {
  const viewPermissions = useMemo(() => generatePermissionsObject(slug), [slug]);
  const {
    isLoading: isLoadingForPermissions,
    allowedActions: { canCreate, canRead, canUpdate, canDelete },
  } = useUserPermissions(viewPermissions);
  const query = useQuery();
  const { search } = useLocation();
  const isFirstRender = useRef(true);
  const { formatMessage } = useGlobalContext();

  const [isLabelPickerOpen, setLabelPickerState] = useState(false);
  const [isFilterPickerOpen, setFilterPickerState] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const contentTypePath = useMemo(() => {
    return [slug, 'contentType'];
  }, [slug]);

  const getLayoutSetting = useCallback(
    settingName => {
      return get(layouts, [...contentTypePath, 'settings', settingName], '');
    },
    [contentTypePath, layouts]
  );

  // Related to the search
  const defaultSort = useMemo(() => {
    return `${getLayoutSetting('defaultSortBy')}:${getLayoutSetting('defaultSortOrder')}`;
  }, [getLayoutSetting]);

  const filters = useMemo(() => {
    const currentSearch = new URLSearchParams(search);

    // Delete all params that are not related to the filters
    const paramsToDelete = ['_limit', '_page', '_sort', '_q'];

    for (let i = 0; i < paramsToDelete.length; i++) {
      currentSearch.delete(paramsToDelete[i]);
    }

    return generateFiltersFromSearch(currentSearch.toString());
  }, [search]);
  const _limit = useMemo(() => {
    return parseInt(query.get('_limit') || getLayoutSetting('pageSize'), 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getLayoutSetting, query.get('_limit')]);
  const _q = useMemo(() => {
    return query.get('_q') || '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.get('_q')]);
  const _page = useMemo(() => {
    return parseInt(query.get('_page') || 1, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.get('_page')]);
  const _sort = useMemo(() => {
    return query.get('_sort') || defaultSort;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSort, query.get('_sort')]);
  const _start = useMemo(() => {
    return (_page - 1) * parseInt(_limit, 10);
  }, [_limit, _page]);
  const searchToSendForRequest = useMemo(() => {
    const currentSearch = new URLSearchParams(search);

    currentSearch.set('_limit', _limit);
    currentSearch.set('_sort', _sort);
    currentSearch.set('_start', _start);
    currentSearch.delete('_page');

    return currentSearch.toString();
  }, [_limit, _sort, _start, search]);

  const getDataActionRef = useRef(getData);
  const getDataSucceededRef = useRef(getDataSucceeded);

  // Settings
  const isBulkable = useMemo(() => {
    return getLayoutSetting('bulkable');
  }, [getLayoutSetting]);
  const isFilterable = useMemo(() => {
    return getLayoutSetting('filterable');
  }, [getLayoutSetting]);
  const isSearchable = useMemo(() => {
    return getLayoutSetting('searchable');
  }, [getLayoutSetting]);
  const shouldSendRequest = useMemo(() => {
    return !isLoadingForPermissions && canRead;
  }, [canRead, isLoadingForPermissions]);

  const fetchData = async (search = searchToSendForRequest) => {
    try {
      getDataActionRef.current();
      const [{ count }, data] = await Promise.all([
        request(getRequestUrl(`explorer/${slug}/count?${search}`), {
          method: 'GET',
        }),
        request(getRequestUrl(`explorer/${slug}?${search}`), {
          method: 'GET',
        }),
      ]);

      getDataSucceededRef.current(count, data);
    } catch (err) {
      strapi.notification.error(`${pluginId}.error.model.fetch`);
    }
  };

  const getMetaDatas = useCallback(
    (path = []) => {
      return get(layouts, [...contentTypePath, 'metadatas', ...path], {});
    },
    [contentTypePath, layouts]
  );

  const listLayout = useMemo(() => {
    return get(layouts, [...contentTypePath, 'layouts', 'list'], []);
  }, [contentTypePath, layouts]);

  const listSchema = useMemo(() => {
    return get(layouts, [...contentTypePath, 'schema'], {});
  }, [layouts, contentTypePath]);

  const label = useMemo(() => {
    return get(listSchema, ['info', 'name'], '');
  }, [listSchema]);

-  const tableHeaders = useMemo(() => {
-    return listLayout.map(label => {
+  // MODYFIED START ----------------
+  const _tableHeaders = useMemo(() => {
+    return listLayout.map((label) => {
       return { ...getMetaDatas([label, 'list']), name: label };
     });
   }, [getMetaDatas, listLayout]);
+  const includesCloneOf = useMemo(() => {
+    const { options, attributes } = layouts[slug].contentType.schema;
+    return options.previewable && !!attributes.cloneOf;
+  });
+  const tableHeaders = includesCloneOf
+    ? [
+        {
+          label: 'Clone',
+          name: 'cloneOf',
+          searchable: true,
+          sortable: true,
+        },
+        ..._tableHeaders,
+      ]
+    : _tableHeaders;

+  // MODYFIED END ------------------
  const getFirstSortableElement = useCallback(
    (name = '') => {
      return get(
        listLayout.filter(h => {
          return h !== name && getMetaDatas([h, 'list', 'sortable']) === true;
        }),
        ['0'],
        'id'
      );
    },
    [getMetaDatas, listLayout]
  );

  const allLabels = useMemo(() => {
    return sortBy(
      Object.keys(getMetaDatas())
        .filter(
          key =>
            !['json', 'component', 'dynamiczone', 'relation', 'richtext'].includes(
              get(listSchema, ['attributes', key, 'type'], '')
            )
        )
        .map(label => ({
          name: label,
          value: listLayout.includes(label),
        })),
      ['label', 'name']
    );
  }, [getMetaDatas, listLayout, listSchema]);

  useEffect(() => {
    return () => {
      isFirstRender.current = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!isFirstRender.current) {
      fetchData(searchToSendForRequest);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchToSendForRequest]);

  useEffect(() => {
    return () => {
      resetProps();
      setFilterPickerState(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (shouldSendRequest) {
      fetchData();
    }

    return () => {
      isFirstRender.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldSendRequest]);

  const handleConfirmDeleteData = useCallback(async () => {
    try {
      emitEvent('willDeleteEntry');
      setModalLoadingState();

      await request(getRequestUrl(`explorer/${slug}/${idToDelete}`), {
        method: 'DELETE',
      });

      strapi.notification.success(`${pluginId}.success.record.delete`);

      // Close the modal and refetch data
      onDeleteDataSucceeded();
      emitEvent('didDeleteEntry');
    } catch (err) {
      const errorMessage = get(
        err,
        'response.payload.message',
        formatMessage({ id: `${pluginId}.error.record.delete` })
      );

      strapi.notification.error(errorMessage);
      // Close the modal
      onDeleteDataError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setModalLoadingState, slug, idToDelete, onDeleteDataSucceeded]);

  const handleConfirmDeleteAllData = useCallback(async () => {
    const params = Object.assign(entriesToDelete);

    try {
      setModalLoadingState();

      await request(getRequestUrl(`explorer/deleteAll/${slug}`), {
        method: 'DELETE',
        params,
      });

      onDeleteSeveralDataSucceeded();
    } catch (err) {
      strapi.notification.error(`${pluginId}.error.record.delete`);
    }
  }, [entriesToDelete, onDeleteSeveralDataSucceeded, slug, setModalLoadingState]);

  const handleChangeListLabels = ({ name, value }) => {
    const currentSort = _sort;

    // Display a notification if trying to remove the last displayed field
    if (value && listLayout.length === 1) {
      strapi.notification.error('content-manager.notification.error.displayedFields');

      return;
    }

    // Update the sort when removing the displayed one
    if (currentSort.split(':')[0] === name && value) {
      emitEvent('didChangeDisplayedFields');
      handleChangeSearch({
        target: {
          name: '_sort',
          value: `${getFirstSortableElement(name)}:ASC`,
        },
      });
    }

    // Update the Main reducer
    onChangeListLabels({
      target: {
        name,
        slug,
        value: !value,
      },
    });
  };

  const handleChangeFilters = ({ target: { value } }) => {
    const newSearch = new URLSearchParams();

    // Set the default params
    newSearch.set('_limit', _limit);
    newSearch.set('_sort', _sort);
    newSearch.set('_page', 1);

    value.forEach(({ filter, name, value: filterValue }) => {
      const filterType = filter === '=' ? '' : filter;
      const filterName = `${name}${filterType}`;

      newSearch.append(filterName, filterValue);
    });

    push({ search: newSearch.toString() });
  };

  const handleChangeSearch = async ({ target: { name, value } }) => {
    const currentSearch = new URLSearchParams(searchToSendForRequest);

    // Pagination
    currentSearch.delete('_start');

    if (value === '') {
      currentSearch.delete(name);
    } else {
      currentSearch.set(name, value);
    }

    const searchToString = currentSearch.toString();

    push({ search: searchToString });
  };

  const handleClickDelete = id => {
    setIdToDelete(id);
    toggleModalDelete();
  };

  const handleModalClose = () => {
    if (didDeleteData) {
      fetchData();
    }
  };

  const handleSubmit = (filters = []) => {
    emitEvent('didFilterEntries');
    toggleFilterPickerState();
    handleChangeFilters({ target: { name: 'filters', value: filters } });
  };

  const toggleFilterPickerState = () => {
    if (!isFilterPickerOpen) {
      emitEvent('willFilterEntries');
    }

    setFilterPickerState(prevState => !prevState);
  };

  const toggleLabelPickerState = () => {
    if (!isLabelPickerOpen) {
      emitEvent('willChangeListFieldsSettings');
    }

    setLabelPickerState(prevState => !prevState);
  };

  const filterPickerActions = [
    {
      label: `${pluginId}.components.FiltersPickWrapper.PluginHeader.actions.clearAll`,
      kind: 'secondary',
      onClick: () => {
        toggleFilterPickerState();
        // Delete all filters
        handleChangeFilters({ target: { name: 'filters', value: [] } });
      },
    },
    {
      label: `${pluginId}.components.FiltersPickWrapper.PluginHeader.actions.apply`,
      kind: 'primary',
      type: 'submit',
    },
  ];

  const headerAction = useMemo(
    () => {
      if (!canCreate) {
        return [];
      }

      return [
        {
          label: formatMessage(
            {
              id: 'content-manager.containers.List.addAnEntry',
            },
            {
              entity: label || 'Content Manager',
            }
          ),
          onClick: () => {
            emitEvent('willCreateEntry');
            push({
              pathname: `${pathname}/create`,
            });
          },
          color: 'primary',
          type: 'button',
          icon: true,
          style: {
            paddingLeft: 15,
            paddingRight: 15,
            fontWeight: 600,
          },
        },
      ];
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [label, pathname, search, canCreate, formatMessage]
  );

  const headerProps = useMemo(() => {
    /* eslint-disable indent */
    return {
      title: {
        label: label || 'Content Manager',
      },
      content: canRead
        ? formatMessage(
            {
              id:
                count > 1
                  ? `${pluginId}.containers.List.pluginHeaderDescription`
                  : `${pluginId}.containers.List.pluginHeaderDescription.singular`,
            },
            { label: count }
          )
        : null,
      actions: headerAction,
    };
    /* eslint-enable indent */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, headerAction, label, canRead, formatMessage]);

  return (
    <>
      <ListViewProvider
        data={data}
        count={count}
        entriesToDelete={entriesToDelete}
        emitEvent={emitEvent}
        firstSortableElement={getFirstSortableElement()}
        label={label}
        onChangeBulk={onChangeBulk}
        onChangeBulkSelectall={onChangeBulkSelectall}
        onChangeSearch={handleChangeSearch}
        onClickDelete={handleClickDelete}
        schema={listSchema}
        slug={slug}
        toggleModalDeleteAll={toggleModalDeleteAll}
        _limit={_limit}
        _page={_page}
        filters={filters}
        _q={_q}
        _sort={_sort}
      >
        <FilterPicker
          actions={filterPickerActions}
          isOpen={isFilterPickerOpen}
          name={label}
          toggleFilterPickerState={toggleFilterPickerState}
          onSubmit={handleSubmit}
        />
        <Container className="container-fluid">
          {!isFilterPickerOpen && <Header {...headerProps} isLoading={isLoading && canRead} />}
          {isSearchable && canRead && (
            <Search changeParams={handleChangeSearch} initValue={_q} model={label} value={_q} />
          )}
          {canRead && (
            <Wrapper>
              <div className="row" style={{ marginBottom: '5px' }}>
                <div className="col-10">
                  <div className="row" style={{ marginLeft: 0, marginRight: 0 }}>
                    {isFilterable && (
                      <>
                        <AddFilterCta type="button" onClick={toggleFilterPickerState}>
                          <FilterIcon />
                          <FormattedMessage id="app.utils.filters" />
                        </AddFilterCta>
                        {filters.map((filter, key) => (
                          <Filter
                            {...filter}
                            changeParams={handleChangeFilters}
                            filters={filters}
                            index={key}
                            schema={listSchema}
                            key={key}
                            toggleFilterPickerState={toggleFilterPickerState}
                            isFilterPickerOpen={isFilterPickerOpen}
                          />
                        ))}
                      </>
                    )}
                  </div>
                </div>
                <div className="col-2">
                  <CheckPermissions permissions={pluginPermissions.collectionTypesConfigurations}>
                    <DisplayedFieldsDropdown
                      isOpen={isLabelPickerOpen}
                      items={allLabels}
                      onChange={handleChangeListLabels}
                      onClickReset={() => {
                        resetListLabels(slug);
                      }}
                      slug={slug}
                      toggle={toggleLabelPickerState}
                    />
                  </CheckPermissions>
                </div>
              </div>
              <div className="row" style={{ paddingTop: '12px' }}>
                <div className="col-12">
                  <CustomTable
                    data={data}
                    canDelete={canDelete}
                    canUpdate={canUpdate}
                    headers={tableHeaders}
                    isBulkable={isBulkable}
                    onChangeParams={handleChangeSearch}
                    showLoader={isLoading}
                  />
                  <Footer />
                </div>
              </div>
            </Wrapper>
          )}
        </Container>
        <PopUpWarning
          isOpen={showWarningDelete}
          toggleModal={toggleModalDelete}
          content={{
            title: `${pluginId}.popUpWarning.title`,
            message: `${pluginId}.popUpWarning.bodyMessage.contentType.delete`,
            cancel: `${pluginId}.popUpWarning.button.cancel`,
            confirm: `${pluginId}.popUpWarning.button.confirm`,
          }}
          onConfirm={handleConfirmDeleteData}
          popUpWarningType="danger"
          onClosed={handleModalClose}
          isConfirmButtonLoading={showModalConfirmButtonLoading}
        />
        <PopUpWarning
          isOpen={showWarningDeleteAll}
          toggleModal={toggleModalDeleteAll}
          content={{
            title: `${pluginId}.popUpWarning.title`,
            message: `${pluginId}.popUpWarning.bodyMessage.contentType.delete${
              entriesToDelete.length > 1 ? '.all' : ''
            }`,
            cancel: `${pluginId}.popUpWarning.button.cancel`,
            confirm: `${pluginId}.popUpWarning.button.confirm`,
          }}
          popUpWarningType="danger"
          onConfirm={handleConfirmDeleteAllData}
          onClosed={handleModalClose}
          isConfirmButtonLoading={showModalConfirmButtonLoading}
        />
      </ListViewProvider>
    </>
  );
}
ListView.defaultProps = {
  layouts: {},
};

ListView.propTypes = {
  count: PropTypes.number.isRequired,
  data: PropTypes.array.isRequired,
  didDeleteData: PropTypes.bool.isRequired,
  emitEvent: PropTypes.func.isRequired,
  entriesToDelete: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  layouts: PropTypes.object,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired,
  }).isRequired,
  models: PropTypes.array.isRequired,
  getData: PropTypes.func.isRequired,
  getDataSucceeded: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  onChangeBulk: PropTypes.func.isRequired,
  onChangeBulkSelectall: PropTypes.func.isRequired,
  onChangeListLabels: PropTypes.func.isRequired,
  onDeleteDataError: PropTypes.func.isRequired,
  onDeleteDataSucceeded: PropTypes.func.isRequired,
  onDeleteSeveralDataSucceeded: PropTypes.func.isRequired,
  resetListLabels: PropTypes.func.isRequired,
  resetProps: PropTypes.func.isRequired,
  setModalLoadingState: PropTypes.func.isRequired,
  showModalConfirmButtonLoading: PropTypes.bool.isRequired,
  showWarningDelete: PropTypes.bool.isRequired,
  showWarningDeleteAll: PropTypes.bool.isRequired,
  slug: PropTypes.string.isRequired,
  toggleModalDelete: PropTypes.func.isRequired,
  toggleModalDeleteAll: PropTypes.func.isRequired,
};

const mapStateToProps = makeSelectListView();

export function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getData,
      getDataSucceeded,
      onChangeBulk,
      onChangeBulkSelectall,
      onChangeListLabels,
      onDeleteDataError,
      onDeleteDataSucceeded,
      onDeleteSeveralDataSucceeded,
      resetListLabels,
      resetProps,
      setModalLoadingState,
      toggleModalDelete,
      toggleModalDeleteAll,
    },
    dispatch
  );
}
const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(withConnect, memo)(ListView);

```

### extensions/content-manager/admin/src/translations/en.json

Add translations:

```diff
+  "containers.Edit.clone": "Clone",
+  "containers.Edit.preview": "Preview",
+  "containers.Edit.publish": "Publish",


+  "popUpWarning.bodyMessage.contentType.clone": "Are you sure you want to clone this entry?",
+  "popUpWarning.bodyMessage.contentType.publish": "Are you sure you want to Publish this entry?",

```
