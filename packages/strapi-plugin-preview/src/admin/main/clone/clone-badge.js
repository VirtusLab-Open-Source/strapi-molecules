import PropTypes from "prop-types";
import React from "react";
import { useIntl } from "react-intl";
import styled from "styled-components";

import { Text } from "@buffetjs/core";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 1rem;
  border-radius: 0.2rem;
  height: 2.5rem;
  ${({ theme }) => `
    border: 1px solid #82b3c9;
    background-color: #e1f5fe;
    ${Text} {
        font-weight: ${theme.main.fontWeights.bold};
    }
  `};
`;

export const CloneBadge = ({ isClone }) => {
  const { formatMessage } = useIntl();

  if (!isClone) {
    return "-";
  }

  return (
    <Wrapper>
      <Text lineHeight="19px">
        {formatMessage({
          id: "preview.containers.List.clone",
        })}
      </Text>
    </Wrapper>
  );
};

CloneBadge.propTypes = {
  isClone: PropTypes.bool.isRequired,
};
