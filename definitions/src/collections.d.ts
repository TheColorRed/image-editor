declare interface CollectionAddResponse {
  status: boolean;
  message: 'folder exists' | '';
}

declare interface FolderResponseItem {
  name: string;
  path: string;
}

declare type SearchStyle = 'fuzzy' | 'text';
declare type CollectionType = 'smart' | 'folder' | 'tag' | 'search';

declare interface SearchRequest {
  query: string;
  style: SearchStyle;
}

declare interface FolderCollection {
  label: string;
  type: CollectionType;
  info: {
    path: string;
    deep: boolean;
  };
}

declare interface SmartCollection {
  label: string;
  type: CollectionType;
  info: {
    match: 'all' | 'any';
    rules: {
      type: string;
      comparer: string;
      value: string;
    }[];
  };
}

declare interface TagCollection {
  label: string;
  type: CollectionType;
  // info: {};
}

declare interface SearchCollection {
  query: string;
  type: CollectionType;
  label: '',
  info: {};
}

declare type Collection<T = FolderCollection | SmartCollection | SearchCollection | TagCollection> = T;

declare interface Message<T = any> {
  namespace: string;
  data?: T;
  id: string;
  key?: string;
  done: boolean;
  dataItems: number;
}

declare interface IPTCData {
  object_name?: string;
  keywords?: string[];
  date_created?: string;
  digital_date_created?: string;
  digital_time_created?: string;
  city?: string;
  sub_location?: string;
  province_or_state?: string;
  country_or_primary_location_code?: string;
  country_or_primary_location_name?: string;
  copyright_notice?: string;
  caption?: string;
}

declare module 'node-iptc' {
  function iptc(fileData: Buffer): IPTCData;
  export = iptc;
}