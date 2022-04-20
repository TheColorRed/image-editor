
export function isFolderCollection(collection: any): collection is FolderCollection {
  return (collection as Collection).type === 'folder';
}

export function isSmartCollection(collection: any): collection is SmartCollection {
  return (collection as Collection).type === 'smart';
}

export function isSearchCollection(collection: any): collection is SearchCollection {
  return (collection as Collection).type === 'search';
}

export function isTagCollection(collection: any): collection is TagCollection {
  return (collection as Collection).type === 'tag';
}