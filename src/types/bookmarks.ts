import type { Context } from "@deskpro/app-sdk";
export interface Settings {
  bookmarks?: string;
};

export type BookmarkContext = Context<null, Settings|null>;

export interface IBookmark {
  Name: string;
  URL: string;
  Description: string;
  Id: string;
  ParentFolder: string | null;
  isFolder?: boolean;
}
