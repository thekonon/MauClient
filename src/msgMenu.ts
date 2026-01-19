import { eventBus } from "./EventBus";

export class MessagesMenu {
  private modal?: HTMLDivElement;
  private messages: HTMLParagraphElement[];

  private messageBox!: HTMLDivElement;
  private isOpened: boolean;

  constructor() {
    this.messages = [];
    this.isOpened = false;
    this.addEvents();
  }

  public open() {
    if (this.modal) return;
    this.resetMsgBtn();
    console.log("opening");

    this.modal = document.createElement("div");
    this.modal.className = "messages-modal";

    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    const content = document.createElement("div");
    content.className = "messages-modal-content";

    // Title
    const title = document.createElement("h2");
    title.innerText = "Messages";
    content.appendChild(title);

    // Message list
    this.messageBox = document.createElement("div");
    this.messageBox.className = "messages-box";
    this.messageBox.innerText = "No messages yet.";
    content.appendChild(this.messageBox);

    // --- INPUT ROW ---
    const inputRow = document.createElement("div");
    inputRow.className = "messages-input-row";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Type a message...";
    input.className = "messages-input";

    const sendBtn = document.createElement("button");
    sendBtn.innerText = "Send";
    sendBtn.className = "messages-btn settings-btn";
    sendBtn.id = "messages-btn";
    sendBtn.addEventListener("click", () => {
      eventBus.emit("Command:SEND_MESSAGE", { message: input.value });
    });

    inputRow.appendChild(input);
    inputRow.appendChild(sendBtn);
    content.appendChild(inputRow);

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.innerText = "Close";
    closeBtn.className = "messages-btn settings-btn";
    closeBtn.addEventListener("click", () => this.close());
    content.appendChild(closeBtn);

    this.modal.appendChild(content);
    document.body.appendChild(this.modal);

    this.isOpened = true;

    this.updateMessageBox();
  }

  public close() {
    if (!this.modal) return;
    document.body.removeChild(this.modal);
    this.modal = undefined;

    this.isOpened = false;
  }

  private addEvents() {
    eventBus.on("Helper:GET_MESSAGE", (payload) => {
      this.addMessage(payload.message);
      this.updateMessageBox();
      if (!this.isOpened) {
        this.showUnreadMsg();
      }
    });

    const messageBoxBtn = this.getMsgButton();
    if (messageBoxBtn) {
      messageBoxBtn.addEventListener("click", () => {
        console.log("msg btn clicked");
        this.open();
      });
    }
  }

  private showUnreadMsg() {
    const messageBoxBtn = this.getMsgButton();
    if (!messageBoxBtn) return;
    messageBoxBtn.style.color = "red";
  }

  private resetMsgBtn() {
    const messageBoxBtn = this.getMsgButton();
    if (!messageBoxBtn) return;
    messageBoxBtn.style.color = "black";
  }

  private updateMessageBox() {
    if (!this.messages) return;
    if (!this.messageBox) return;
    this.messageBox.replaceChildren(...this.messages);
  }

  private addMessage(message: string) {
    const p = document.createElement("p");
    p.innerText += message;
    this.messages.push(p);
  }

  private clearMessages() {
    this.messages = [];
  }

  private addMessages(messages: string[]) {
    messages.forEach((msg) => {
      const p = document.createElement("p");
      p.innerText += msg;
      this.messages.push(p);
    });
  }

  private overwriteMessages(messages: string[]) {
    this.clearMessages();
    this.addMessages(messages);
  }

  private getMsgButton(): HTMLButtonElement | undefined {
    const messageBoxBtn = document.getElementById(
      "msgBtn",
    ) as HTMLButtonElement;
    if (messageBoxBtn) {
      return messageBoxBtn;
    } else {
      console.log("Element id=msgBtn was not found");
      return undefined;
    }
  }
}
