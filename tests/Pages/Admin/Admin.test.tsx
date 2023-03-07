import { lightTheme, ThemeProvider } from "@deskpro/deskpro-ui";
import {
  cleanup,
  render,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react/";
import React from "react";
import { useSettingsUtilities } from "../../../src/hooks/useSettingsUtilities";
import { Admin } from "../../../src/pages/admin/Admin";

const renderPage = () => {
  return render(
    <ThemeProvider theme={lightTheme}>
      <Admin />
    </ThemeProvider>
  );
};

describe("Admin Page", () => {
  test("Admin Page should render correctly", async () => {
    const { getByText } = renderPage();

    const elem = await waitFor(() =>
      getByText(/You currently have no Bookmarks/i)
    );

    expect(elem).toBeInTheDocument();
  });

  test("Admin Page should handle adding a Bookmark", async () => {
    const { getByText, getByTestId } = renderPage();

    fireEvent.click(getByTestId("button-add-bookmark"));

    fireEvent.change(getByTestId("input-Name"), {
      target: { value: "Bookmark 1" },
    });

    fireEvent.change(getByTestId("input-URL"), {
      target: { value: "https://github.com/deskpro" },
    });

    fireEvent.change(getByTestId("input-Description"), {
      target: { value: "This is a Description" },
    });

    act(() => fireEvent.click(getByTestId("button-submit")));

    const headingElement = await waitFor(() => getByText(/Description/i), {
      timeout: 3000,
    });

    await waitFor(() => expect(headingElement).toBeInTheDocument());
  });

  afterEach(() => {
    jest.clearAllMocks();

    cleanup();
  });
});
