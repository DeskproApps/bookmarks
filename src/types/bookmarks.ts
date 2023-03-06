export interface IBookmark {
  Name: string;
  URL: string;
  Description: string;
  Id: string;
  ParentFolder: string | null;
  isFolder?: boolean;
}
