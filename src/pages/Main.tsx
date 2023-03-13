import {
  Button,
  Icon,
  LoadingSpinner,
  P1,
  P3,
  P4,
  proxyFetch,
  Stack,
  TwoButtonGroup,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import { useEffect, useState } from "react";
import {
  faUserGroup,
  faPencil,
  faTrashCan,
  faCircleUser,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { HierarchicalDragList } from "../components/HierarchicalDragList/HierarchicalDragListGlobal";
import {
  SettingsUtilitiesReturnValues,
  useSettingsUtilities,
} from "../hooks/useSettingsUtilities";
import { StyledLink } from "../styles";
import { IBookmark } from "../types/bookmarks";
import { useNavigate } from "react-router-dom";
import { useBookmarks } from "../context/bookmarkContext";

const PAGEICON = `<svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.375 8.71875V9.70312C10.375 9.93516 10.1852 10.125 9.95312 10.125H4.04688C3.81484 10.125 3.625 9.93516 3.625 9.70312V8.71875C3.625 8.48672 3.81484 8.29688 4.04688 8.29688H9.95312C10.1852 8.29688 10.375 8.48672 10.375 8.71875ZM9.95312 11.25H4.04688C3.81484 11.25 3.625 11.4398 3.625 11.6719V12.6562C3.625 12.8883 3.81484 13.0781 4.04688 13.0781H9.95312C10.1852 13.0781 10.375 12.8883 10.375 12.6562V11.6719C10.375 11.4398 10.1852 11.25 9.95312 11.25ZM13.75 4.63711V16.3125C13.75 17.2441 12.9941 18 12.0625 18H1.9375C1.00586 18 0.25 17.2441 0.25 16.3125V1.6875C0.25 0.755859 1.00586 0 1.9375 0H9.11289C9.55937 0 9.98828 0.179297 10.3047 0.495703L13.2543 3.44531C13.5707 3.7582 13.75 4.19062 13.75 4.63711ZM9.25 1.82461V4.5H11.9254L9.25 1.82461ZM12.0625 16.3125V6.1875H8.40625C7.93867 6.1875 7.5625 5.81133 7.5625 5.34375V1.6875H1.9375V16.3125H12.0625Z" fill="#566672"/>
</svg>
`;
import isSvg from "is-svg";

export const Main = () => {
  const [pageSettings, setPageSettings] = useState<{
    type: "Add" | "Edit";
    objectName: "Bookmark" | "Folder";
    objectId?: string | null;
  } | null>(null);

  const [page, setPage] = useState<0 | 1>(1);
  const [currentHovered, setCurrentHovered] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setLocalBookmarks } = useBookmarks();

  const bookmarkUtilities = useSettingsUtilities(page);

  const icons = useQueryWithClient(
    ["Icons", bookmarkUtilities?.bookmarks as unknown as string],
    (client) => {
      return Promise.allSettled(
        (bookmarkUtilities as SettingsUtilitiesReturnValues).bookmarks.map(
          async (bookmark) => {
            if (bookmark.isFolder) return null;

            const fetch = await proxyFetch(client);

            const icon = await fetch(
              new URL(bookmark.URL).origin + "/favicon.ico"
            ).then(async (e) => {
              if (!e.ok) return PAGEICON;

              const text = await e.text();

              if (!isSvg(text)) return PAGEICON;

              return text;
            });

            return btoa(icon);
          }
        )

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore e.value is valid
      ).then((e) => e.map((e) => e.value));
    },
    {
      enabled: !!bookmarkUtilities?.bookmarks,
    }
  );

  useEffect(() => {
    if (!pageSettings) return;

    navigate(
      `/edit?type=${pageSettings.type}&objectName=${pageSettings.objectName}${
        pageSettings.objectId ? `&objectId=${pageSettings.objectId}` : ""
      }`
    );
  }, [navigate, pageSettings]);

  if (
    icons.isLoading ||
    !bookmarkUtilities ||
    bookmarkUtilities?.bookmarks.length === 0
  )
    return <LoadingSpinner></LoadingSpinner>;

  const tabs = bookmarkUtilities.bookmarks || [];

  return (
    <Stack vertical style={{ margin: page === 0 ? "8px" : "12px" }}>
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
            setLocalBookmarks([]);
            setPage(0);
          }}
          twoOnClick={() => {
            setLocalBookmarks([]);
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
                {icons.data && !e.isFolder && (
                  <img
                    style={{ width: "14px" }}
                    src={`data:image/svg+xml;base64,${
                      icons.data[tabs.indexOf(e)]
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
                marginRight: "5px",
                cursor: "pointer",
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
