import { createContext, useContext, useState } from "react";
import { IBookmark } from "../types/bookmarks";

export const BookmarksContext = createContext<{
  localBookmarks: IBookmark[];
  setLocalBookmarks: (data: IBookmark[]) => void;
}>({
  localBookmarks: [],
  setLocalBookmarks: () => {},
});

export const useBookmarks = () => useContext(BookmarksContext);

export const BookmarkProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [localBookmarks, setBookmarksState] = useState<IBookmark[]>([]);

  const setLocalBookmarks = (data: IBookmark[]) => {
    setBookmarksState(data);
  };

  return (
    <BookmarksContext.Provider value={{ localBookmarks, setLocalBookmarks }}>
      {children}
    </BookmarksContext.Provider>
  );
};
