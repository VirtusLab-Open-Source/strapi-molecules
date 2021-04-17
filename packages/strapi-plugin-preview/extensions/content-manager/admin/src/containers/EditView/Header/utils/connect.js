import React from 'react';
import { PreviewProvider } from 'strapi-plugin-preview';
import { getRequestUrl as getCollectionRequestUrl } from '../../../CollectionTypeFormWrapper/utils';
import { getRequestUrl as getSingleRequestUrl } from '../../../SingleTypeFormWrapper/utils';
import useDataManager from '../../../../hooks/useDataManager';

function connect(WrappedComponent, select) {
  return function (props) {
    // eslint-disable-next-line react/prop-types
    const selectors = select();
    const { slug } = useDataManager();

    return (
      <PreviewProvider
        {...selectors}
        {...(props.allowedActions || {})}
        slug={slug}
        getRequestUrl={
          selectors.isSingleType ? getSingleRequestUrl : getCollectionRequestUrl
        }
      >
        <WrappedComponent {...props} {...selectors} />
      </PreviewProvider>
    );
  };
}

export default connect;
