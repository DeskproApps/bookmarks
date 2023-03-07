import { Icon, P3, P8, Stack } from "@deskpro/app-sdk";
import { useSettingsUtilities } from "../../../hooks/useSettingsUtilities";
import { HierarchicalDragList } from "../../HierarchicalDragList/HierarchicalDragList";
import { faPencil, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { IBookmark } from "../../../types/bookmarks";
import { StyledLink } from "../../../styles";
import { useState } from "react";

interface Props {
  setPageSettings: (page: {
    type: "Add" | "Edit";
    objectName: "Bookmark" | "Folder";
    objectId?: string;
  }) => void;
}

export const Bookmarks = ({ setPageSettings }: Props) => {
  const [currentHovered, setCurrentHovered] = useState<string | null>(null);

  const bookmarkUtilities = useSettingsUtilities();

  if (!bookmarkUtilities) return <></>;

  const tabs = bookmarkUtilities.getBookmarks() || [];

  return (
    <HierarchicalDragList
      idAccessor={(e) => e.Id}
      labelAccessor={(e) =>
        e.isFolder ? (
          e.Name
        ) : (
          <Stack gap={8}>
            <P3>- {e.Name}</P3>
            <StyledLink to={e.URL} target="_blank" style={{ marginTop: "1px" }}>
              <P8>({e.URL.substring(0, 65)}...)</P8>
            </StyledLink>
          </Stack>
        )
      }
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
      onMouseEnter={(id) => setCurrentHovered(id)}
      onMouseLeave={() => setCurrentHovered(null)}
      onChange={(tabAction) =>
        bookmarkUtilities.moveBookmark(
          tabAction.choice.Id,
          tabAction.newIndexFromParent
        )
      }
      actionAccessor={(object: IBookmark) =>
        (currentHovered as unknown as string) === object.Id && (
          <Stack gap={5} style={{ marginTop: "4px", cursor: "pointer" }}>
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
            <Stack onClick={() => bookmarkUtilities.removeBookmark(object.Id)}>
              <Icon icon={faTrashCan}></Icon>
            </Stack>
          </Stack>
        )
      }
      parentIdAccessor={(e) => e.ParentFolder}
      parentOnly={true}
    ></HierarchicalDragList>
  );
};
