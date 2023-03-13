import React, { useCallback, useState } from "react";
import type {
  DragStart,
  DropResult,
  ResponderProvided,
} from "@hello-pangea/dnd";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useTreeifyDetachedFromRoot } from "./useTreeify";
import { Icon as DeskproUIIcon, P3, Stack } from "@deskpro/deskpro-ui";
import type { HierarchyNode } from "d3-hierarchy";
import { v4 as uuidV4 } from "uuid";
import { faGripVertical } from "@fortawesome/free-solid-svg-icons";
import * as S from "./styles";
import { HorizontalDivider } from "../HorizontalDivider/HorizontalDivider";
import { IBookmark } from "../../types/bookmarks";
import { useDeskproAppTheme } from "@deskpro/app-sdk";

const LegacyIcon = ({ isShared }: { isShared?: boolean }) => {
  return isShared ? (
    <></>
  ) : (
    <DeskproUIIcon icon={faGripVertical}></DeskproUIIcon>
  );
};

export type DpNameProp = {
  "data-dp-name": string;
  "data-dp-ident"?: string;
};

const objCache: Record<string, DpNameProp> = {};

const dpNameProp = (name: string, ident?: [string, string]): DpNameProp => {
  const identStr = ident ? `${ident[0]}=${ident[1]}` : "";
  const cacheKey = name + (identStr ? identStr : "");

  if (typeof objCache[cacheKey] !== "undefined") {
    return objCache[cacheKey];
  }

  const props: DpNameProp = { "data-dp-name": name };
  if (ident) {
    props["data-dp-ident"] = identStr;
  }
  return (objCache[cacheKey] = props);
};

export interface ListChangeEvent<T> {
  choice: T;
  newParentId: string | null;
  newIndexFromParent: number;
}

interface ListProps<T> extends CommonListProps<T> {
  onChange?: (change: ListChangeEvent<T>) => void;
  options: T[];
  parentOnly?: boolean;
  onMouseEnter: (id: string | null) => void;
  onMouseLeave: () => void;
  isShared?: boolean;
}

interface CommonListProps<T> {
  idAccessor: (options: T) => string;
  /** Used for multilevel hierarchy lists, not pass prop for single level lists */
  parentIdAccessor?: (option: T) => string | undefined | null;
  labelAccessor: (
    choice: T,
    depth: number,
    isDragging: boolean
  ) => React.ReactNode;
  actionAccessor?: (choice: T) => React.ReactNode;
}

interface TreeListProps<T> extends CommonListProps<T> {
  listId: string;
  tree: HierarchyNode<T>[];
  activeId: string | null;
  activeParentId: string | undefined;
  parentOnly?: boolean;
  onMouseEnter: (id: string | null) => void;
  onMouseLeave: () => void;
  isShared?: boolean;
  options: T[];
}

interface TreeNodeProps<T> extends CommonListProps<T> {
  option: HierarchyNode<T>;
  index: number;
  disableDrag?: boolean;
  isShared?: boolean;
  options: T[];
}

const topLevelId = uuidV4();
const dropableTag = uuidV4();

function TreeNode({
  options,
  option,
  index,
  disableDrag,
  idAccessor,
  labelAccessor,
  actionAccessor,
  isShared,
}: TreeNodeProps<IBookmark>) {
  const { theme } = useDeskproAppTheme();
  return (
    <Stack style={{ width: "100%" }} vertical>
      <Draggable
        isDragDisabled={disableDrag}
        key={idAccessor(option.data)}
        draggableId={idAccessor(option.data)}
        index={index}
      >
        {(provided, snapshot) =>
          labelAccessor(option.data, option.depth, snapshot.isDragging) !=
            null && (
            <>
              <S.ItemContainer
                isShared={isShared}
                role="listitem"
                ref={provided.innerRef}
                isDragging={snapshot.isDragging}
                {...provided.draggableProps}
                data-testid="choice"
              >
                <S.ItemDraggableHandle
                  {...provided.dragHandleProps}
                  {...dpNameProp("drag-n-drop-handle-icon")}
                  style={{ alignSelf: "start" }}
                >
                  <LegacyIcon isShared={isShared} />
                </S.ItemDraggableHandle>
                <Stack
                  justify={"space-between"}
                  style={{ width: "100%", marginLeft: "5px" }}
                >
                  <Stack>
                    <P3>
                      {labelAccessor(
                        option.data,
                        option.depth,
                        snapshot.isDragging
                      )}
                    </P3>
                  </Stack>
                  <Stack>{actionAccessor && actionAccessor(option.data)}</Stack>
                </Stack>
              </S.ItemContainer>
            </>
          )
        }
      </Draggable>
      {(() => {
        const i = options.findIndex(
          (findIndexBookmark) => findIndexBookmark.Id === option.data.Id
        );
        if (option.data.isFolder) return;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const lastItemParentFolder = options.findLastIndex(
          (lastItem: IBookmark) =>
            lastItem.ParentFolder === option.data.ParentFolder
        );

        return i === lastItemParentFolder ? (
          <HorizontalDivider
            style={{
              backgroundColor: theme.colors.grey20,
              marginBottom: "10px",
              marginLeft: "-20px",
            }}
          ></HorizontalDivider>
        ) : (
          <HorizontalDivider></HorizontalDivider>
        );
      })()}
    </Stack>
  );
}

function isDropDisabled<T>(
  option: HierarchyNode<T>,
  activeId: string | null,
  activeParentId: string | undefined,
  parentIdAccessor?: (option: T) => string | undefined | null
): boolean {
  if (activeId === null) return false;
  if (parentIdAccessor) {
    return parentIdAccessor?.(option.data) !== activeParentId;
  }
  return false;
}

function TreeList({
  options,
  tree,
  listId,
  activeId,
  activeParentId,
  idAccessor,
  labelAccessor,
  actionAccessor,
  parentIdAccessor,
  onMouseEnter,
  onMouseLeave,
  parentOnly,
  isShared,
}: TreeListProps<IBookmark>) {
  const isDragDropDisabled = isDropDisabled(
    tree[0],
    activeId,
    activeParentId,
    parentIdAccessor
  );

  return (
    <Droppable
      isDropDisabled={isDragDropDisabled}
      droppableId={`${listId}${dropableTag}`}
      key={listId}
    >
      {(provided, snapshot) => (
        <S.ListDropContainer
          topLevel={listId === topLevelId}
          role="list"
          ref={provided.innerRef}
          isDragging={snapshot.isDraggingOver && listId !== topLevelId}
          {...provided.droppableProps}
          style={{ width: "100%" }}
        >
          {tree.map((option, index) => (
            <Stack
              onMouseEnter={() =>
                onMouseEnter((option.data as unknown as { Id: string }).Id)
              }
              key={index}
              onMouseLeave={onMouseLeave}
            >
              {!option.children ? (
                <Stack style={{ width: "96vw" }}>
                  <TreeNode
                    options={options}
                    key={idAccessor(option.data)}
                    idAccessor={idAccessor}
                    labelAccessor={labelAccessor}
                    actionAccessor={actionAccessor}
                    disableDrag={isDragDropDisabled}
                    option={option}
                    index={index}
                    isShared={isShared}
                  />
                </Stack>
              ) : (
                <Stack>
                  <Draggable
                    isDragDisabled={isDragDropDisabled}
                    draggableId={idAccessor(option.data)}
                    key={idAccessor(option.data)}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div {...provided.draggableProps} ref={provided.innerRef}>
                        {labelAccessor(
                          option.data,
                          option.depth,
                          snapshot.isDragging
                        ) != null && (
                          <S.ItemContainer
                            isShared={isShared}
                            role="listitem"
                            isDragging={snapshot.isDragging}
                            style={{ alignItems: "start" }}
                          >
                            <S.ItemDraggableHandle
                              {...provided.dragHandleProps}
                            >
                              <LegacyIcon isShared={isShared} />
                            </S.ItemDraggableHandle>
                            <Stack
                              style={{
                                width: "100%",
                                justifyContent: "space-between",
                                marginLeft: "5px",
                              }}
                            >
                              <Stack>
                                <P3>
                                  {labelAccessor(
                                    option.data,
                                    option.depth,
                                    snapshot.isDragging
                                  )}
                                </P3>
                              </Stack>
                              <Stack>
                                {actionAccessor && actionAccessor(option.data)}
                              </Stack>
                            </Stack>
                          </S.ItemContainer>
                        )}
                        <TreeList
                          options={options}
                          idAccessor={idAccessor}
                          labelAccessor={labelAccessor}
                          actionAccessor={actionAccessor}
                          parentIdAccessor={parentIdAccessor}
                          activeId={activeId}
                          onMouseEnter={onMouseEnter}
                          onMouseLeave={onMouseLeave}
                          activeParentId={activeParentId}
                          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                          tree={option.children!}
                          listId={idAccessor(option.data)}
                          parentOnly={parentOnly}
                          isShared={isShared}
                        />
                      </div>
                    )}
                  </Draggable>
                </Stack>
              )}
            </Stack>
          ))}
          {provided.placeholder}
        </S.ListDropContainer>
      )}
    </Droppable>
  );
}

export function HierarchicalDragList({
  options = [],
  onChange,
  idAccessor,
  parentIdAccessor,
  labelAccessor,
  actionAccessor,
  onMouseEnter,
  onMouseLeave,
  parentOnly = false,
  isShared,
}: ListProps<IBookmark>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeParentId, setActiveParentId] = useState<string | undefined>();

  const tree = useTreeifyDetachedFromRoot(options, {
    idAccessor,
    parentIdAccessor: parentIdAccessor ? parentIdAccessor : () => null,
  });

  const onDragStart = useCallback(
    (initial: DragStart, _provided: ResponderProvided) => {
      const option = options.find(
        (option) => idAccessor(option) === initial.draggableId
      );
      if (option) {
        setActiveParentId(parentIdAccessor?.(option) || undefined);
      }
      setActiveId(initial.draggableId);
    },
    [options, idAccessor, parentIdAccessor]
  );

  const onDragEnd = useCallback(
    (result: DropResult) => {
      setActiveId(null);
      setActiveParentId(undefined);

      if (!result.destination) return;
      if (result.reason === "CANCEL") return;
      if (
        result.destination.droppableId === result.source.droppableId &&
        result.destination.index === result.source.index
      ) {
        return;
      }
      // Don't allow the element to leave the parent block
      if (result.source.droppableId !== result.destination.droppableId) {
        return;
      }

      const optionId = result.draggableId;
      const optionParentId = result.destination.droppableId.replace(
        dropableTag,
        ""
      );
      const sourceParentId = result.source.droppableId.replace(dropableTag, "");

      const hasParent = optionParentId !== topLevelId;
      const choiceIndexFromParent = result.destination.index;
      const option = options.find((option) => idAccessor(option) === optionId);

      if (!option) return;

      if (parentOnly && optionParentId !== sourceParentId) {
        return;
      }

      if (onChange) {
        onChange({
          choice: option,
          newParentId: hasParent ? optionParentId : null,
          newIndexFromParent: choiceIndexFromParent,
        });
      }
    },
    [idAccessor, onChange, options, parentOnly]
  );

  return (
    <div style={{ width: "100%" }}>
      <DragDropContext
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        key={options.length} // Force a rerender when options change - fixes a D&D bug for newly added (unsaved) options
      >
        <Stack>
          <TreeList
            options={options}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            idAccessor={idAccessor} // It refuses to stretch to 100% width ^^
            labelAccessor={labelAccessor}
            actionAccessor={actionAccessor}
            parentIdAccessor={parentIdAccessor}
            tree={tree}
            listId={topLevelId}
            activeId={activeId}
            activeParentId={activeParentId}
            parentOnly={parentOnly}
            isShared={isShared}
          />
        </Stack>
      </DragDropContext>
    </div>
  );
}
