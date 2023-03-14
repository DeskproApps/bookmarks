import { lightTheme, ThemeProvider } from "@deskpro/deskpro-ui";
import { cleanup, render, waitFor } from "@testing-library/react/";
import React from "react";
import { Main } from "../../src/pages/Main";

jest.mock("../../src/hooks/useSettingsUtilities", () => ({
  useSettingsUtilities: () => ({ bookmarks: [{}], getCurrentPage: () => 1 }),
}));

const renderPage = () => {
  return render(
    <ThemeProvider theme={lightTheme}>
      <Main />
    </ThemeProvider>
  );
};

describe("Main Page", () => {
  test("Main Page shows both pages", async () => {
    const { getByText } = renderPage();

    const elem = await waitFor(() => getByText(/Shared Bookmarks/i), {
      timeout: 3000,
    });

    expect(elem).toBeInTheDocument();
  });

  afterEach(() => {
    jest.clearAllMocks();

    cleanup();
  });
});
