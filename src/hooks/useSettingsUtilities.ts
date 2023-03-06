import {
  useDeskproAppClient,
  useDeskproLatestAppContext,
} from "@deskpro/app-sdk";
import { IBookmark } from "../types/bookmarks";

export const useSettingsUtilities = () => {
  const { client } = useDeskproAppClient();
  const { context } = useDeskproLatestAppContext();

  if (!client || !context) return null;

  const getBookmarks = (): IBookmark[] => {
    return JSON.parse(
      context.settings.bookmarks ||
        '[{"Id": "f238cf6d-eb4e-4873-99b9-fb5c2443820c", "Name": "Root", "URL": "", "Description": "", "ParentFolder": null, "isFolder": true}]'
    );
  };

  const getParentFolders = () => {
    const bookmarks = getBookmarks();

    return bookmarks.filter((e) => e.isFolder);
  };

  const moveBookmark = (bookmarkId: string, newIndex: number) => {
    const currentBookmarks = getBookmarks();

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

    const indexLastNonFolderRoot = currentBookmarks
      .slice(1)
      .findIndex((b) => b.isFolder); // we do not need to subtract as we slice the first folder

    const isInRoot = currentBookmark.ParentFolder === currentBookmarks[0].Id;

    if (
      (currentBookmark.isFolder && newIndexGeneral <= indexLastNonFolderRoot) ||
      (isInRoot &&
        !currentBookmark.isFolder &&
        newIndexGeneral > indexLastNonFolderRoot)
    )
      return;

    if (!currentBookmark.isFolder) {
      const movableBookmark = { ...currentBookmarks[newIndexGeneral] };

      currentBookmarks[newIndexGeneral] = currentBookmark;

      currentBookmarks[currentBookmarkIndex] = movableBookmark;
    } else {
      const children = currentBookmarks.filter(
        (b) => b.ParentFolder === currentBookmark.Id
      );

      const allItems = currentBookmarks.splice(
        currentBookmarkIndex,
        children.length + 1
      );

      currentBookmarks.splice(newIndexGeneral, 0, ...allItems);
    }

    client.setAdminSetting(JSON.stringify(currentBookmarks));
  };

  const addBookmark = (bookmark: IBookmark) => {
    const currentSBookmarks = getBookmarks();

    const lastInNewItemParentFolder = currentSBookmarks
      .filter((item) =>
        !bookmark.isFolder
          ? item.ParentFolder === bookmark.ParentFolder && !item.isFolder
          : item
      )
      .at(-1);

    const lastInNewItemParentFolderIndex = currentSBookmarks.findIndex(
      (e) => e.Id === (lastInNewItemParentFolder?.Id || bookmark.ParentFolder)
    );

    currentSBookmarks.splice(lastInNewItemParentFolderIndex + 1, 0, bookmark);

    client.setAdminSetting(JSON.stringify(currentSBookmarks));
  };

  const editBookmark = (bookmark: IBookmark) => {
    const currentBookmarks = getBookmarks();

    const currentBookmarkIndex = currentBookmarks.findIndex(
      (b) => b.Id === bookmark.Id
    );

    const currentBookmark = currentBookmarks[currentBookmarkIndex];

    if (currentBookmark?.ParentFolder === bookmark.ParentFolder) {
      currentBookmarks[currentBookmarkIndex] = bookmark;
    } else {
      currentBookmarks.splice(currentBookmarkIndex, 1);

      addBookmark(bookmark);
    }

    client.setAdminSetting(JSON.stringify(currentBookmarks));
  };

  const removeBookmark = (bookmarkId: string) => {
    const currentBookmarks = getBookmarks();

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
    client.setAdminSetting(JSON.stringify(currentBookmarks));
  };

  return {
    getBookmarks,
    getParentFolders,
    addBookmark,
    editBookmark,
    moveBookmark,
    removeBookmark,
  };
};
