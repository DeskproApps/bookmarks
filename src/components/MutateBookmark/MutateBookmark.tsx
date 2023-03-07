import { Button, H0, Stack } from "@deskpro/app-sdk";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidV4 } from "uuid";
import { useSettingsUtilities } from "../../hooks/useSettingsUtilities";
import { IBookmark } from "../../types/bookmarks";
import { DropdownSelect } from "../DropdownSelect/DropdownSelect";
import { InputWithTitle } from "../InputWithTitle/InputWithTitle";
type Props = {
  type: "Add" | "Edit";
  objectId?: string;
  folderName?: string;
  objectName: string;
  setPageSettings: (
    obj: {
      type: "Add" | "Edit";
      objectName: "Bookmark" | "Folder";
      objectId?: string;
    } | null
  ) => void;
};

type InputType = {
  Name: string;
  URL: string;
  Description: string;
  ParentFolder: string | null;
  Id: string;
};

export const MutateBookmark = ({
  type,
  objectId,
  objectName,
  setPageSettings,
}: Props) => {
  const bookmarkUtilities = useSettingsUtilities();
  const [gotParentFolder, setGotParentFolder] = useState<boolean>(false);
  const [parentFolders, setParentFolders] = useState<
    {
      value: string | null;
      label: string;
    }[]
  >([]);

  useEffect(() => {
    if (!bookmarkUtilities || gotParentFolder) return;

    const parentFoldersFromFunc = bookmarkUtilities.getParentFolders();

    setParentFolders([
      ...parentFoldersFromFunc.map((e) => ({
        value: e.Id,
        label: e.Name === "Root" ? "No Parent" : e.Name,
      })),
    ]);

    setGotParentFolder(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmarkUtilities]);

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
  } = useForm<InputType>();

  useEffect(() => {
    setError("URL", {
      type: "manual",
      message: "Valid URL is required",
    });
  }, [setError]);

  useEffect(() => {
    if (objectName !== "Folder") return;

    const folders = bookmarkUtilities?.getParentFolders();

    setValue(
      "ParentFolder",
      folders?.find((e) => e.Name === "Root")?.Id as string
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectName]);

  useEffect(() => {
    if (type !== "Edit" || !objectId || !bookmarkUtilities) return;

    const bookmark = bookmarkUtilities
      .getBookmarks()
      .find((e) => e.Id === objectId);

    reset(bookmark);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, objectId]);

  useEffect(() => {
    if (type !== "Add" || !bookmarkUtilities) return;

    const rootFolderId = bookmarkUtilities
      .getParentFolders()
      .find((e) => e.Name === "Root")?.Id;

    reset({
      ParentFolder: rootFolderId,
      Id: uuidV4(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  if (!bookmarkUtilities) return <></>;

  const submit = (data: IBookmark) => {
    if (!bookmarkUtilities) return;

    if (objectName === "Folder") {
      data.isFolder = true;
    }

    if (type === "Add") {
      bookmarkUtilities.addBookmark(data);

      setPageSettings(null);

      return;
    }

    bookmarkUtilities.editBookmark(data);
    setPageSettings(null);
  };

  return (
    <form onSubmit={handleSubmit(submit)} style={{ width: "100%" }}>
      <Stack vertical gap={8}>
        <H0>
          {type} {objectName}
        </H0>
        <InputWithTitle
          data-testid="input-Name"
          title="Name"
          error={!!errors.Name}
          register={register("Name", {
            required: true,
          })}
        ></InputWithTitle>
        {objectName === "Bookmark" && (
          <Stack vertical gap={8} style={{ width: "100%" }}>
            <InputWithTitle
              title="URL"
              error={!!errors.URL}
              data-testid="input-URL"
              register={register("URL", {
                required: true,
                // eslint-disable-next-line no-useless-escape
                pattern: /^https:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(\/\S*)?$/,
              })}
            ></InputWithTitle>
            <InputWithTitle
              title="Description"
              data-testid="input-Description"
              error={!!errors.Description}
              register={register("Description")}
            ></InputWithTitle>
            <DropdownSelect
              title="Parent Folder"
              error={!!errors.ParentFolder}
              value={
                parentFolders.find((e) => e.value === watch("ParentFolder"))
                  ?.label || ""
              }
              onChange={(e) => setValue("ParentFolder", e)}
              data={parentFolders}
              labelName="label"
              valueName="value"
            ></DropdownSelect>
          </Stack>
        )}
        <Stack justify="space-between" style={{ width: "100%" }}>
          <Button
            intent="primary"
            text={type}
            type="submit"
            data-testid="button-submit"
          ></Button>
          <Button
            intent="secondary"
            text="Cancel"
            onClick={() => setPageSettings(null)}
          ></Button>
        </Stack>
      </Stack>
    </form>
  );
};
