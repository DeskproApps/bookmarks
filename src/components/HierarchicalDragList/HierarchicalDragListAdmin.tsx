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

const LegacyIcon = () => {
  return <DeskproUIIcon icon={faGripVertical}></DeskproUIIcon>;
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
}

interface TreeNodeProps<T> extends CommonListProps<T> {
  option: HierarchyNode<T>;
  index: number;
  disableDrag?: boolean;
}

const topLevelId = uuidV4();
const dropableTag = uuidV4();

function TreeNode<T>({
  option,
  index,
  disableDrag,
  idAccessor,
  labelAccessor,
  actionAccessor,
}: TreeNodeProps<T>) {
  return (
    <Draggable
      isDragDisabled={disableDrag}
      key={idAccessor(option.data)}
      draggableId={idAccessor(option.data)}
      index={index}
    >
      {(provided, snapshot) =>
        labelAccessor(option.data, option.depth, snapshot.isDragging) !==
          "Root" && (
          <>
            <S.ItemContainer
              role="listitem"
              ref={provided.innerRef}
              isDragging={snapshot.isDragging}
              {...provided.draggableProps}
              data-testid="choice"
            >
              <S.ItemDraggableHandle
                {...provided.dragHandleProps}
                {...dpNameProp("drag-n-drop-handle-icon")}
              >
                <LegacyIcon />
              </S.ItemDraggableHandle>
              <Stack justify={"space-between"} style={{ width: "100%" }}>
                <Stack>
                  <P3
                    style={{
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                    }}
                  >
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

function TreeList<T>({
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
}: TreeListProps<T>) {
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
                <Stack style={{ width: "100%" }}>
                  <TreeNode
                    key={idAccessor(option.data)}
                    idAccessor={idAccessor}
                    labelAccessor={labelAccessor}
                    actionAccessor={actionAccessor}
                    disableDrag={isDragDropDisabled}
                    option={option}
                    index={index}
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
                        ) !== "Root" && (
                          <Stack
                            onMouseEnter={() =>
                              onMouseEnter(
                                (option.data as unknown as { Id: string }).Id
                              )
                            }
                          >
                            <S.ItemContainer
                              role="listitem"
                              isDragging={snapshot.isDragging}
                            >
                              <S.ItemDraggableHandle
                                {...provided.dragHandleProps}
                              >
                                <LegacyIcon />
                              </S.ItemDraggableHandle>
                              <Stack
                                style={{
                                  width: "100%",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Stack>
                                  <P3
                                    style={{
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {labelAccessor(
                                      option.data,
                                      option.depth,
                                      snapshot.isDragging
                                    )}
                                  </P3>
                                </Stack>
                                <Stack>
                                  {actionAccessor &&
                                    actionAccessor(option.data)}
                                </Stack>
                              </Stack>
                            </S.ItemContainer>
                          </Stack>
                        )}
                        <TreeList
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

export function HierarchicalDragList<T>({
  options = [],
  onChange,
  idAccessor,
  parentIdAccessor,
  labelAccessor,
  actionAccessor,
  onMouseEnter,
  onMouseLeave,
  parentOnly = false,
}: ListProps<T>) {
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
    <DragDropContext
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      key={options.length} // Force a rerender when options change - fixes a D&D bug for newly added (unsaved) options
    >
      <S.ListContainerRoot>
        <Stack style={{ width: "100%" }}>
          <TreeList
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
          />
        </Stack>
      </S.ListContainerRoot>
    </DragDropContext>
  );
}
