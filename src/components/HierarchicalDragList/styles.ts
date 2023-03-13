import styled from "styled-components";
import { lightTheme } from "@deskpro/deskpro-ui";

export const ListContainerRoot = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.grey20};
  border-radius: 4px;
  box-sizing: border-box;
  max-height: 150vh;
  overflow-y: auto;
  overflow-x: visible;
  transition: background-color 0.2s ease-in;

  /* width */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.colors.grey80};
    border-radius: 6px;
  }

  /* Track Piece */
  ::-webkit-scrollbar-track-piece {
    background: ${(props) => props.theme.colors.grey20};
  }

  /* Firefox */
  scrollbar-color: ${(props) => props.theme.colors.grey80}
    ${(props) => props.theme.colors.grey20};
  scrollbar-width: thin;
`;

export const EditInput = styled.input`
  width: inherit;
  border: none;
  :focus {
    border: none;
    border-bottom: 1px solid blue;
    outline: none;
  }
`;

export const ListDropContainer = styled.div<{
  isDragging: boolean;
  topLevel: boolean;
}>`
  padding: ${(props) => (props.topLevel ? "8px 0px" : 0)};
  box-sizing: border-box;
  background-color: ${({ theme, isDragging }) =>
    isDragging ? theme.colors.grey20 : "transparent"};
`;

export const ItemActions = styled.span`
  display: none;
  > :last-child {
    margin-left: 12px;
  }
`;

export const IconWrapper = styled.span`
  display: flex;
  align-content: center;
  svg {
    margin: auto;
    width: 12px !important;
    height: 12px;
    cursor: pointer;
    &:hover {
      path {
        fill: ${(props) => props.theme.colors.brandPrimary};
      }
    }
  }
`;

export const ItemContainer = styled.div<{
  isDragging: boolean;
  isShared?: boolean;
}>`
  box-sizing: border-box;
  ${(props) => (props.isShared == null ? `padding: 4px 16px;` : ``)}

  font-family: ${lightTheme.fonts.primary};
  font-size: 12px;
  line-height: 1.5em;
  display: flex;
  align-items: center;
  width: 100%;
  background-color: ${({ theme, isDragging }) =>
    isDragging ? theme.colors.white : "transparent"};
  box-shadow: ${({ isDragging }) =>
    isDragging ? "0px 2px 8px rgba(0, 0, 0, 0.15);" : "0"};
  ${(props) => {
    if (props.isShared == null) {
      return `  :hover {
        background-color: ${props.theme.colors.grey10};
        ${ItemActions} {
        display: flex;
        }`;
    }
  }}
  }
`;

export const ItemDraggableHandle = styled.div`
  color: ${({ theme }) => theme.colors.grey100};
  margin-right: 5px;
  display: flex;
  align-items: center;
  svg {
    height: 14px;
    width: auto;
  }
  path {
    fill: ${lightTheme.colors.grey40};
  }
`;
