declare type NamespacePrefix = 'collections' | 'files' | 'actions';

declare type CollectionsNS = `manage/collections/${'get' | 'create' | 'delete' | 'refresh'}`;
declare type FilesNS = `manage/files/${'images' | 'image' | 'folders' | 'search'}`;
declare type EditNS = `manage/tags/${'add' | 'remove' | 'get'}`;
declare type TagNS = `edit/actions`;
declare type AINS = `ai/classification/${'analyze' | 'objects'}`;

declare type Namespace = CollectionsNS | FilesNS | EditNS | TagNS | AINS;
declare type SocketId = `${string}-${string}-${string}-${string}-${string}`;

declare type ServerResponseKey = 'tags:image' | 'tags:new';


declare interface FileTagsModify {
  tag?: string;
  file?: string;
}