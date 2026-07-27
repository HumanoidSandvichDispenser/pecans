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
  /**
   * Get a list of messages in a folder.
   *
   * @param folder The folder to view. Defaults to "inbox".
   * @param page The page number to view. Defaults to 1.
   * @returns A FolderViewResponse object containing the messages in the folder.
   */
  @rpc("messages.folderview")
  folderView(folder?: string = "inbox", page?: int32 = 1): FolderViewResponse;

  /**
    * View a conversation thread.
    *
    * @param conversationId The id of the conversation to view.
    * @param includeHeader Whether to include the conversation header in the response. Defaults to true.
    * @param markAsRead Whether to mark the conversation as read. Defaults to true.
    * @param page The page number of messages to view. Defaults to 1.
    * @returns A MessageViewResponse object containing the messages in the conversation and the header if requested.
    */
  @rpc("messages.view")
  view(
    conversationId: string,
    includeHeader?: boolean = true,
    markAsRead?: boolean = true,
    page?: int32 = 1,
  ): MessageViewResponse;

  /**
    * Reply to a conversation thread.
    *
    * @param conversationId The id of the conversation to reply to.
    * @param text The body text of the reply (UCP markup).
    * @param unanonymize Whether to send the reply as your real username instead of anonymously. Defaults to false.
    * @returns A TCResponse object indicating the result of the reply attempt.
    */
  @rpc("messages.reply")
  reply(conversationId: string, text: string, unanonymize?: boolean = false): TCResponse;

  /**
    * Get a list of the user's message folders.
    *
    * @returns A FolderListResponse object containing the user's message folders.
    */
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
