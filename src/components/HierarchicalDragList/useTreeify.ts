import { useMemo } from "react";
import { v4 } from "uuid";
import type { HierarchyNode } from "d3-hierarchy";
import { stratify } from "d3-hierarchy";

const falseRootId = v4();
const falseRoot = { id: falseRootId };

export function isFalseNode(node: unknown) {
  return node === falseRoot;
}
export function isFalseHierarchyNodeRoot<T>(node: HierarchyNode<T>) {
  return isFalseNode(node.data) || isFalseHierarchyNodeRootId(node.id);
}

export function isFalseHierarchyNodeRootId(id: string | undefined) {
  return id === falseRootId;
}

export interface TreeifyOptions<T> {
  idAccessor: (options: T) => string;
  parentIdAccessor: (option: T) => string | undefined | null;
  withFalseRoot?: boolean;
}

export function generateTree<T>(
  list: readonly T[],
  { withFalseRoot = true, idAccessor, parentIdAccessor }: TreeifyOptions<T>
): HierarchyNode<T> {
  const parentIdAccessorWrapper = (node: T): string | null => {
    if (withFalseRoot) {
      if (isFalseNode(node)) {
        return null;
      }

      return parentIdAccessor(node) ?? falseRootId;
    }

    return parentIdAccessor(node) ?? null;
  };

  const idAccessorWrapper = (node: T): string | null => {
    if (withFalseRoot) {
      if (isFalseNode(node)) {
        return falseRootId;
      }
    }

    return idAccessor(node as T);
  };

  return stratify<T>().id(idAccessorWrapper).parentId(parentIdAccessorWrapper)([
    falseRoot as unknown as T,
    ...list,
  ]);
}
export function useTreeify<T>(
  list: readonly T[],
  options: TreeifyOptions<T>
): HierarchyNode<T> {
  return useMemo(() => {
    return generateTree(list, options);
  }, [list, options]);
}

/**
 * For any list construct a tree
 */
export function useTreeifyDetachedFromRoot<T>(
  list: readonly T[],
  options: TreeifyOptions<T>
): HierarchyNode<T>[] {
  const rootNode = useTreeify(list, options);

  return useMemo(() => {
    return (
      rootNode.children?.map((topLevelChild) => topLevelChild.copy()) ?? []
    );
  }, [rootNode.children]) as HierarchyNode<T>[];
}
