import { useState, useEffect } from "react";
import client, {
  databases,
  DATABASE_ID,
  COLLECTION_ID_MESSAGES,
} from "../appwriteConfig";
import { ID, Query, Permission, Role } from "appwrite";
import Header from "../components/Header";
import { useAuth } from "../utils/AuthContext";
import { Trash2 } from "react-feather";

const Room = () => {
  const [messageBody, setMessageBody] = useState("");
  const [messages, setMessages] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    getMessages();

    // Subscribe to real-time updates
    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTION_ID_MESSAGES}.documents`,
      (response) => {
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.create"
          )
        ) {
          console.log("A MESSAGE WAS CREATED");
          setMessages((prevState) => [response.payload, ...prevState]);
        }

        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.delete"
          )
        ) {
          console.log("A MESSAGE WAS DELETED!!!");
          setMessages((prevState) =>
            prevState.filter((message) => message.$id !== response.payload.$id)
          );
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const getMessages = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID_MESSAGES,
        [Query.orderDesc("$createdAt"), Query.limit(100)]
      );
      console.log(response.documents);
      setMessages(response.documents);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("MESSAGE:", messageBody);

    // Set permissions for the logged-in user
    const permissions = [
      Permission.read(Role.any()), // Allow anyone to read the message
      Permission.write(Role.user(user.$id)), // Allow only the logged-in user to write
      Permission.delete(Role.user(user.$id)), // Allow only the logged-in user to delete
    ];

    const payload = {
      user_id: user.$id,
      username: user.name,
      body: messageBody,
    };

    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID_MESSAGES,
        ID.unique(),
        payload,
        permissions
      );

      console.log("RESPONSE:", response);
      setMessageBody("");
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const deleteMessage = async (id) => {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID_MESSAGES, id);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  return (
    <main className="container">
      <Header />
      <div className="room--container">
        <form id="message--form" onSubmit={handleSubmit}>
          <div>
            <textarea
              required
              maxLength={250}
              placeholder="Say something..."
              onChange={(e) => {
                setMessageBody(e.target.value);
              }}
              value={messageBody}
            ></textarea>
          </div>

          <div className="send-btn--wrapper">
            <input className="btn btn--secondary" type="submit" value="send" />
          </div>
        </form>

        <div>
          {messages.map((message) => (
            <div key={message.$id} className={"message--wrapper"}>
              <div className="message--header">
                <p>
                  {message?.username ? (
                    <span> {message?.username}</span>
                  ) : (
                    "Anonymous user"
                  )}

                  <small className="message-timestamp">
                    {" "}
                    {new Date(message.$createdAt).toLocaleString()}
                  </small>
                </p>

                {message.$permissions.includes(
                  `delete(\"user:${user.$id}\")`
                ) && (
                  <Trash2
                    className="delete--btn"
                    onClick={() => {
                      deleteMessage(message.$id);
                    }}
                  />
                )}
              </div>

              <div
                className={
                  "message--body" +
                  (message.user_id === user.$id ? " message--body--owner" : "")
                }
              >
                <span>{message.body}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Room;
