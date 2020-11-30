# Strapi-plugin-preview migation guide

To install correctly one of required steps are integrate changes in extension
content-manager, this manual will show diff for a specific version:

Strapi-plugin-versioning needs extension files to work properly. In case if you
have already extended content-manager files we are providing list of changes to
help you with merge.

Below changes are diff to strapi-plugin-content-manager in version `3.3.3`

### extensions/content-manager/admin/src/containers/EditView/Header/index.js

Need to merge `headerActions` with previewHeaderActions (add
preview/clone/publish button)

```diff
import {
  PopUpWarning,
  templateObject,
  PopUpWarningBody,
  PopUpWarningFooter,
  PopUpWarningHeader,
  PopUpWarningIcon,
  PopUpWarningModal,
} from 'strapi-helper-plugin';
++  import { usePreview} from 'strapi-plugin-preview';
import { getTrad } from '../../../utils';

// ...

const Header = ({
  canUpdate,
  canCreate,
  canPublish,
  componentLayouts,
  initialData,
  isCreatingEntry,
  isSingleType,
  status,
  layout,
  hasDraftAndPublish,
  modifiedData,
  onPublish,
  onUnpublish,
}) => {
++  const { previewHeaderActions } = usePreview();
  const [showWarningUnpublish, setWarningUnpublish] = useState(false);
  const { formatMessage } = useIntl();
  const formatMessageRef = useRef(formatMessage);


      const action = {
        ...primaryButtonObject,
        disabled: isCreatingEntry || didChangeData,
        isLoading,
        label: formatMessage({ id: labelID }),
        onClick,
      };

      headerActions.unshift(action);
    }

--    return headerActions;
++    return [
++      ...previewHeaderActions,
++      ...headerActions
++    ];
  }, [
    isCreatingEntry,
    canCreate,
    canUpdate,
    hasDraftAndPublish,
    canPublish,
    didChangeData,
    formatMessage,
    status,
    initialData,
    onPublish,
    checkIfHasDraftRelations,
++    previewHeaderActions,
  ]);




```

### extensions/content-manager/admin/src/containers/EditView/Header/utils/connect.js

Need to use PreviewProvider and add all required data

```diff
import React from 'react';
++  import { PreviewProvider } from 'strapi-plugin-preview';
++  import useDataManager from '../../../../hooks/useDataManager';

function connect(WrappedComponent, select) {
  return function(props) {
    // eslint-disable-next-line react/prop-types
    const selectors = select();
++      const { slug } = useDataManager();

--    return <WrappedComponent {...props} {...selectors} />;
++    return (
++        <PreviewProvider {...selectors} slug={slug}>
++        <WrappedComponent {...props} {...selectors} />
++        </PreviewProvider>
++    )
  };
}

export default connect;

```

### extensions/content-manager/admin/src/containers/ListView/index.js

Need to add Clone column (clone header)

```diff
import {
  PopUpWarning,
  generateFiltersFromSearch,
  request,
  CheckPermissions,
  useUserPermissions,
  useQuery,
} from 'strapi-helper-plugin';
++  import { shouldAddCloneHeader, getCloneHeader } from 'strapi-plugin-preview';
import pluginId from '../../pluginId';

// ...

    if (hasDraftAndPublish) {
      headers.push({
        label: formatMessage({ id: getTrad('containers.ListPage.table-headers.published_at') }),
        searchable: false,
        sortable: true,
        name: 'published_at',
        key: '__published_at__',
        cellFormatter: cellData => {
          const isPublished = !isEmpty(cellData.published_at);

          return <State isPublished={isPublished} />;
        },
      });
    }
++    if(shouldAddCloneHeader(layouts[slug])) {
++      headers.unshift(getCloneHeader(formatMessage));
++    }

    return headers;
--  }, [formatMessage, getMetaDatas, hasDraftAndPublish, listLayout]);
++  }, [formatMessage, getMetaDatas, hasDraftAndPublish, listLayout, slug, layouts]);


```
