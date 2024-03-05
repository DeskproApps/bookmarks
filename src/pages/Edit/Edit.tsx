import { Stack } from "@deskpro/deskpro-ui";
import { useSearchParams } from "react-router-dom";
import { MutateBookmark } from "../../components/MutateBookmark/MutateBookmark";

export const Edit = () => {
  const [searchParams] = useSearchParams();

  const [type, objectName, objectId] = [
    searchParams.get("type"),
    searchParams.get("objectName"),
    searchParams.get("objectId"),
  ];

  if (!type || !objectName) return <></>;

  return (
    <Stack style={{ margin: "8px" }}>
      <MutateBookmark
        type={type as "Add" | "Edit"}
        objectName={objectName}
        objectId={objectId}
        page={1}
      />
    </Stack>
  );
};
