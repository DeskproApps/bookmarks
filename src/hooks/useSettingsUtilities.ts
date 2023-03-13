import {
  useDeskproAppClient,
  useDeskproLatestAppContext,
} from "@deskpro/app-sdk";
import { useEffect } from "react";
import { useBookmarks } from "../context/bookmarkContext";
import { IBookmark } from "../types/bookmarks";

export type SettingsUtilitiesReturnValues = {
  bookmarks: IBookmark[];
  getParentFolders: () => IBookmark[];
  addBookmark: (bookmark: IBookmark) => void;
  editBookmark: (bookmark: IBookmark) => void;
  moveBookmark: (bookmarkId: string, newIndex: number) => void;
  removeBookmark: (bookmarkId: string) => void;
  setBookmarks: (bookmarks: IBookmark[]) => void;
};

export const useSettingsUtilities = (
  page: number
): SettingsUtilitiesReturnValues | null => {
  const { client } = useDeskproAppClient();
  const { context } = useDeskproLatestAppContext();
  const { localBookmarks, setLocalBookmarks } = useBookmarks();

  useEffect(() => {
    (async () => {
      if (!context || !client) return;
      const defaultRoot = {
        Id: "f238cf6d-eb4e-4873-99b9-fb5c2443820c",
        Name: "Root",
        URL: "",
        Description: "",
        ParentFolder: null,
        isFolder: true,
      };
      if (page === 0) {
        if (!context.settings.bookmarks) {
          client.setAdminSetting(JSON.stringify([defaultRoot]));

          return;
        }
        setLocalBookmarks(JSON.parse(context.settings.bookmarks as string));
      } else if (page === 1) {
        const bookmarksUserState = (await client.getUserState("bookmarks"))[0]
          ?.data as string;

        if (!bookmarksUserState) {
          client.setUserState("bookmarks", JSON.stringify([defaultRoot]));
        }

        setLocalBookmarks(JSON.parse(bookmarksUserState));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, context, client]);

  if (!client || !context) return null;

  const setBookmarks = async (bookmarks: IBookmark[]) => {
    setLocalBookmarks([]);

    if (page === 0) client.setAdminSetting(JSON.stringify(bookmarks));
    else if (page === 1)
      await client.setUserState("bookmarks", JSON.stringify(bookmarks));

    setLocalBookmarks(bookmarks);
  };

  const getParentFolders = () => {
    return localBookmarks.filter((e) => e.isFolder);
  };

  const moveBookmark = (bookmarkId: string, newIndex: number) => {
    const currentBookmarks = localBookmarks;

    const currentBookmarkIndex = currentBookmarks.findIndex(
      (b) => b.Id === bookmarkId
    );

    const currentBookmark = currentBookmarks[currentBookmarkIndex];

    const currentBookmarkSiblings = currentBookmarks.filter(
      (b) => b.ParentFolder === currentBookmark?.ParentFolder
    );

    const movableItemInSiblings = currentBookmarkSiblings[newIndex];

    const newIndexGeneral = currentBookmarks.findIndex(
      (b) => b.Id === movableItemInSiblings.Id
    );

    if (!currentBookmark.isFolder) {
      currentBookmarks.splice(currentBookmarkIndex, 1);

      if (newIndexGeneral < currentBookmarkIndex) {
        currentBookmarks.splice(newIndexGeneral, 0, currentBookmark);
      } else {
        currentBookmarks.splice(newIndexGeneral + 1, 0, currentBookmark);
      }
    } else {
      const children = currentBookmarks.filter(
        (b) => b.ParentFolder === currentBookmark.Id
      );

      const allItems = currentBookmarks.splice(
        currentBookmarkIndex,
        children.length + 1
      );

      const newNewIndexGeneral = currentBookmarks.findIndex(
        (b) => b.Id === movableItemInSiblings.Id
      );

      const childrenOfMovableItem = currentBookmarks.filter(
        (b) => b.ParentFolder === movableItemInSiblings.Id
      ).length;

      currentBookmarks.splice(
        newNewIndexGeneral +
          (currentBookmarkIndex > newIndexGeneral
            ? 0
            : 1 + childrenOfMovableItem),
        0,
        ...allItems
      );
    }

    setBookmarks(currentBookmarks);
  };

  const addBookmark = (bookmark: IBookmark) => {
    const currentBookmarks = localBookmarks;

    const parent = currentBookmarks.find((b) => b.Id === bookmark.ParentFolder);

    if (parent?.Name === "Root") {
      currentBookmarks.push(bookmark);
    } else {
      const lastInNewItemParentFolder = currentBookmarks
        .filter((item) =>
          !bookmark.isFolder
            ? item.ParentFolder === bookmark.ParentFolder && !item.isFolder
            : item
        )

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore this is not passing for some reason lol
        .at(-1);

      const lastInNewItemParentFolderIndex = currentBookmarks.findIndex(
        (e) => e.Id === (lastInNewItemParentFolder?.Id || bookmark.ParentFolder)
      );

      currentBookmarks.splice(lastInNewItemParentFolderIndex + 1, 0, bookmark);
    }

    setBookmarks(currentBookmarks);
  };

  const editBookmark = (bookmark: IBookmark) => {
    const currentBookmarks = localBookmarks;

    const currentBookmarkIndex = currentBookmarks.findIndex(
      (b) => b.Id === bookmark.Id
    );

    const currentBookmark = currentBookmarks[currentBookmarkIndex];

    if (currentBookmark?.ParentFolder === bookmark.ParentFolder) {
      currentBookmarks[currentBookmarkIndex] = bookmark;
    } else {
      currentBookmarks.splice(currentBookmarkIndex, 1);

      const lastInNewItemParentFolder = currentBookmarks
        .filter((item) =>
          !bookmark.isFolder
            ? item.ParentFolder === bookmark.ParentFolder && !item.isFolder
            : item
        )

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore this is not passing for some reason lol
        .at(-1);

      const lastInNewItemParentFolderIndex = currentBookmarks.findIndex(
        (e) => e.Id === (lastInNewItemParentFolder?.Id || bookmark.ParentFolder)
      );

      currentBookmarks.splice(lastInNewItemParentFolderIndex + 1, 0, bookmark);
    }

    setBookmarks(currentBookmarks);
  };

  const removeBookmark = (bookmarkId: string) => {
    const currentBookmarks = localBookmarks;

    const index = currentBookmarks.findIndex((b) => b.Id === bookmarkId);

    const bookmark = currentBookmarks[index];

    if (bookmark.isFolder) {
      const children = currentBookmarks.filter(
        (b) => b.ParentFolder === bookmarkId
      );

      currentBookmarks.splice(index, children.length + 1);
    } else {
      currentBookmarks.splice(index, 1);
    }
    setBookmarks(currentBookmarks);
  };

  return {
    getParentFolders,
    addBookmark,
    editBookmark,
    moveBookmark,
    removeBookmark,
    setBookmarks,
    bookmarks: localBookmarks,
  };
};
