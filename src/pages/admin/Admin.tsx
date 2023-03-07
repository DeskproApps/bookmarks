import { Button, P3, Stack } from "@deskpro/app-sdk";
import { useMemo, useState } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { MutateBookmark } from "../../components/MutateBookmark/MutateBookmark";
import { HorizontalDivider } from "../../components/HorizontalDivider/HorizontalDivider";
import { Bookmarks } from "../../components/Admin/Bookmarks/Bookmarks";

export const Admin = () => {
  const [pageSettings, setPageSettings] = useState<{
    type: "Add" | "Edit";
    objectName: "Bookmark" | "Folder";
    objectId?: string;
  } | null>(null);

  const page = useMemo(() => {
    if (!pageSettings) return;
    return (
      <MutateBookmark
        objectName={pageSettings.objectName}
        type={pageSettings.type}
        setPageSettings={setPageSettings}
        objectId={pageSettings.objectId}
      />
    );
  }, [pageSettings]);

  return (
    <Stack vertical gap={8} style={{ width: "100%" }}>
      <P3>Shared Bookmarks</P3>
      <Bookmarks setPageSettings={setPageSettings} />
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
      {!!pageSettings && (
        <Stack vertical style={{ width: "100%" }}>
          <HorizontalDivider />
          {page}
        </Stack>
      )}
    </Stack>
  );
};
