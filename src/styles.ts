import { DeskproAppTheme } from "@deskpro/app-sdk";
import { Link } from "react-router-dom";
import styled from "styled-components";

export const StyledLink = styled(Link)<DeskproAppTheme>`
  all: unset;
  color: ${({ theme, to }) =>
    to ? theme.colors.cyan100 : theme.colors.grey100};
  cursor: ${({ to }) => (to ? "pointer" : "default")};
`;
