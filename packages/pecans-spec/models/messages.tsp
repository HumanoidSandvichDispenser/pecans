import "../lib/main.tsp";

namespace Pecans;

model MessagePreview {
  id: string;
  subject: string;
  preview: string;
  time: safeint;
  users: TCUser[];
  `new`?: boolean;
}

model Message {
  id: safeint;
  member: safeint;
  time: safeint;
  type: string;
  html: string;
  `new`?: boolean;
}

model MessageFolder {
  id: string;
  name: string;
}

model MessageThreadMember {
  mid: safeint;
  anon?: boolean;
  readTo: safeint;
  id?: string;
  you?: boolean;
}

model MessageThreadHeader {
  title: string;
  members: MessageThreadMember[];
  folder: MessageFolder;
}

model Folder {
  id: string;
  name: string;
}

model FolderViewResponse extends TCResponse {
  hasMore: boolean;
  hasPrevious: boolean;
  messages: MessagePreview[];
}

model MessageViewResponse extends TCResponse {
  messages: Message[];
  header: MessageThreadHeader;

  /**
   * Whether older pages exist beyond this one. Page 1 holds the most recent
   * messages; higher page numbers are progressively older.
   */
  hasMore: boolean;
}

model FolderListResponse extends TCResponse {
  folders: Folder[];
}

interface Messages {
  @rpc("messages.folderview")
  folderView(folder?: string = "inbox", page?: int32 = 1): FolderViewResponse;

  @rpc("messages.view")
  view(
    conversationId: string,
    includeHeader?: boolean = true,
    markAsRead?: boolean = true,
    page?: int32 = 1,
  ): MessageViewResponse;

  @rpc("messages.reply")
  reply(conversationId: string, text: string, unanonymize?: boolean = false): TCResponse;

  @rpc("messages.folderlist")
  folderList(): FolderListResponse;

  /**
   * Start a new conversation with one or more recipients.
   *
   * @param title Conversation title / subject.
   * @param body Body text of the opening message (UCP markup).
   * @param recipients Usernames to send the conversation to.
   */
  @rpc("messages.startconversation")
  startConversation(title: string, body: string, recipients: string[]): TCResponse;

  /**
   * Delete a conversation from the current user's view.
   *
   * @param conversationId Id of the conversation to delete.
   */
  @rpc("messages.delete")
  delete(conversationId: string): TCResponse;

  /**
   * Move a conversation into a folder.
   *
   * @param conversationId Id of the conversation to move.
   * @param folder Id of the destination folder.
   */
  @rpc("messages.movetofolder")
  moveToFolder(conversationId: string, folder: string): TCResponse;
}
