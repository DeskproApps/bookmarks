import { P1, P3, P4, Stack, Icon, Button } from "@deskpro/deskpro-ui";
import {
  LoadingSpinner,
  TwoButtonGroup,
} from "@deskpro/app-sdk";
import { useEffect, useMemo, useState } from "react";
import {
  faUserGroup,
  faPencil,
  faTrashCan,
  faCircleUser,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { HierarchicalDragList } from "../components/HierarchicalDragList/HierarchicalDragListGlobal";
import { useSettingsUtilities } from "../hooks/useSettingsUtilities";
import { StyledLink } from "../styles";
import { IBookmark } from "../types/bookmarks";
import { useNavigate } from "react-router-dom";
import { useBookmarks } from "../context/bookmarkContext";

export const Main = () => {
  const [pageSettings, setPageSettings] = useState<{
    type: "Add" | "Edit";
    objectName: "Bookmark" | "Folder";
    objectId?: string | null;
  } | null>(null);

  const [page, setPage] = useState<0 | 1>(0);
  const [hasSetPage, setHasSetPage] = useState(false);
  const [currentHovered, setCurrentHovered] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setLocalBookmarks } = useBookmarks();

  const bookmarkUtilities = useSettingsUtilities(page);

  useEffect(() => {
    if (!bookmarkUtilities || hasSetPage) return;

    (async () => {
      setPage((await bookmarkUtilities.getCurrentPage()) as 0 | 1);

      setHasSetPage(true);
    })();
  }, [bookmarkUtilities, hasSetPage]);

  const icons = useMemo(() => {
    if (!bookmarkUtilities?.bookmarks) return null;

    return bookmarkUtilities?.bookmarks.map((e) => {
      if (!e.URL || e.isFolder) return null;

      return new URL(e.URL).host.replace("www.", "");
    });
  }, [bookmarkUtilities?.bookmarks]);

  useEffect(() => {
    if (!pageSettings) return;

    navigate(
      `/edit?type=${pageSettings.type}&objectName=${pageSettings.objectName}${
        pageSettings.objectId ? `&objectId=${pageSettings.objectId}` : ""
      }`
    );
  }, [navigate, pageSettings]);

  if (!bookmarkUtilities || bookmarkUtilities?.bookmarks.length === 0)
    return <LoadingSpinner></LoadingSpinner>;

  const tabs = bookmarkUtilities.bookmarks || [];

  return (
    <Stack vertical style={{ padding: page === 0 ? "8px" : "12px" }}>
      <div style={{ width: "100%" }}>
        <TwoButtonGroup
          selected={
            {
              0: "one",
              1: "two",
            }[page] as "one" | "two"
          }
          oneIcon={faUserGroup}
          twoIcon={faCircleUser}
          oneLabel="Shared Bookmarks"
          twoLabel="My Bookmarks"
          oneOnClick={() => {
            if (page === 0) return;
            setLocalBookmarks([]);
            bookmarkUtilities.setCurrentPage(0);
            setPage(0);
          }}
          twoOnClick={() => {
            if (page === 1) return;
            setLocalBookmarks([]);
            bookmarkUtilities.setCurrentPage(1);
            setPage(1);
          }}
        ></TwoButtonGroup>
      </div>
      <HierarchicalDragList
        isShared={page === 0}
        idAccessor={(e) => e.Id}
        labelAccessor={(e) => {
          if (e.Name === "Root") return null;

          return e.isFolder ? (
            <P4 style={{ marginBottom: "8px" }}>{e.Name}</P4>
          ) : (
            <Stack gap={8} vertical>
              <Stack gap={8} align={"center"}>
                {icons && !e.isFolder && (
                  <img
                    style={{ width: "14px" }}
                    src={`https://www.google.com/s2/favicons?domain=${
                      icons[tabs.indexOf(e)]
                    }`}
                  />
                )}
                <StyledLink to={e.URL} target="_blank">
                  <P3>{e.Name}</P3>
                </StyledLink>
              </Stack>
              <P1>{e.Description}</P1>
            </Stack>
          );
        }}
        options={
          tabs.length > 1
            ? tabs
            : [
                {
                  Id: "1",
                  Name: "You currently have no Bookmarks",
                  isFolder: true,
                  URL: "",
                  Description: "",
                  ParentFolder: null,
                },
              ]
        }
        onMouseEnter={(id) => page === 1 && setCurrentHovered(id)}
        onMouseLeave={() => page === 1 && setCurrentHovered(null)}
        onChange={(tabAction) =>
          bookmarkUtilities.moveBookmark(
            tabAction.choice.Id,
            tabAction.newIndexFromParent
          )
        }
        actionAccessor={(object: IBookmark) =>
          (currentHovered as unknown as string) === object.Id &&
          (currentHovered as unknown as string) !== "1" && (
            <Stack
              gap={5}
              style={{
                marginTop: "4px",
                cursor: "pointer",
                position: "absolute",
                right: "8px",
              }}
            >
              <Stack
                onClick={() =>
                  setPageSettings({
                    type: "Edit",
                    objectName: object.isFolder ? "Folder" : "Bookmark",
                    objectId: object.Id,
                  })
                }
              >
                <Icon icon={faPencil}></Icon>
              </Stack>
              <Stack
                onClick={() => bookmarkUtilities.removeBookmark(object.Id)}
              >
                <Icon icon={faTrashCan}></Icon>
              </Stack>
            </Stack>
          )
        }
        parentIdAccessor={(e) => e.ParentFolder}
        parentOnly={true}
      ></HierarchicalDragList>
      {page === 1 && (
        <Stack gap={5}>
          <Button
            icon={faPlus}
            intent="secondary"
            text="Bookmark"
            disabled={!!pageSettings}
            data-testid="button-add-bookmark"
            onClick={() => {
              setPageSettings({
                type: "Add",
                objectName: "Bookmark",
              });
            }}
          ></Button>
          <Button
            icon={faPlus}
            intent="secondary"
            text="Bookmark Folder"
            disabled={!!pageSettings}
            onClick={() => {
              setPageSettings({
                type: "Add",
                objectName: "Folder",
              });
            }}
          ></Button>
        </Stack>
      )}
    </Stack>
  );
};
