import "./messenger.css";
import Conversation from "../../components/conversations/Conversation";
import Message from "../../components/message/Message";
import Popup from "../../components/popup/popup";
import ChatOnline from "../../components/chatOnline/ChatOnline";
import GifBox from "../../components/gifs/GifBox";
import "emoji-picker-element";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useParams } from "react-router";
import Picker from "emoji-picker-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoffee } from "@fortawesome/free-solid-svg-icons";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import $ from "jquery";

export default function Messenger() {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [friendId, setFriendId] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [gifSelected, setGifSelected] = useState(false);
  const [fileName, setFileName] = useState("");
  const [popupMessage, setPopupMessage] = useState(false);
  const [openImage, setOpenImage] = useState(false);
  const [fileExtension, setFileExtension] = useState("");
  const [alertContent, setAlertContent] = useState("");
  const [images, setImages] = useState([]);
  const [imageOpen, setImageOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageIndex, setImageIndex] = useState(null);
  const [fileSelected, setFileSelected] = useState(false);
  const [updatedMessage, setUpdatedMessage] = useState("");
  const [sendGIF, setSendGIF] = useState([]);
  const [toggleGIF, setToggleGIF] = useState(false);
  const [editMessage, setEditMessage] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageId, setMessageId] = useState("");
  const [rerender, setRerender] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState(false);
  const [replyMessage, setReplyMessage] = useState([]);
  const [replyMessageDetails, setReplyMessageDetails] = useState([]);
  const [senderId, setSenderId] = useState("");
  const [isReply, setIsReply] = useState(false);
  const [user, setUser] = useState([]);
  const [reply, setReply] = useState([]);
  const [replyUser, setReplyUser] = useState([]);
  const [replyCloudinaryUrl, setReplyCloudinaryUrl] = useState("");
  const [replyGifUrl, setReplyGifUrl] = useState("");
  const [replyFileExtension, setReplyFileExtension] = useState("");
  const [replyFileName, setReplyFileName] = useState("");
  const [offset, setOffset] = useState(0);
  const [offsetMessage, setOffsetMessage] = useState([]);
  const socket = useRef();
  const userId = useParams().userid;
  const scrollRef = useRef();
  const scrollRef1 = useRef();

  useEffect(() => {
    socket.current = io("/");
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios("/users/" + friendId);
        setUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
  }, [currentChat]);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    socket.current.emit("addUser", userId);
    console.log("user id " + userId);
  }, [userId]);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await axios.get("/conversations/" + userId);
        setConversations(res.data);
        setRerender(true);
      } catch (err) {
        console.log(err);
      }
    };
    getConversations();
    setRerender(false);
  }, [userId]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await axios.get("/messages/" + currentChat._id);
        setMessages(res.data);
        console.log("message is " + res.data.length);
        setOffset(res.data.length);
        // const response = await axios.get(
        //   "/messages/offset/" + currentChat._id + "/" + skip
        // );
        // console.log("total number of messages is " + res.data.length);
        // console.log("Offset messages is " + response.data.length);
      } catch (err) {
        console.log(err);
      }
    };

    const getOffsetMessage = async () => {
      const params = {
        limit: 10,
        offset: 10,
      };
      try {
        // const response = await axios.get("/messages/offset/" + currentChat._id, {
        //   params: params,
        // });
        // setOffsetMessage(response.data);
        console.log("total number of messages is " + offset);
        // console.log("Offset messages is " + response.data.length);
      } catch (err) {
        console.log(err);
      }
    };

    getMessages();
    getOffsetMessage();
    // removeScrollEvent();
    // registerScrollEvent();
    setRerender(false);
  }, [rerender]);

  // useEffect(() => {
  //   const getOffsetMessage = async () => {
  //     const params = {
  //       limit: 10,
  //       offset: 10,
  //     };
  //     try {
  //       // const response = await axios.get("/messages/offset/" + currentChat._id, {
  //       //   params: params,
  //       // });
  //       // setOffsetMessage(response.data);
  //       console.log("total number of messages is " + offset);
  //       // console.log("Offset messages is " + response.data.length);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };
  //   getOffsetMessage();
  //   // removeScrollEvent();
  //   // registerScrollEvent();
  //   setRerender(false);
  // }, [rerender]);

  useEffect(() => {
    const getMessageImage = async () => {
      try {
        const res = await axios.get("/messages/images/" + currentChat._id);
        setImages(res.data);
      } catch (err) {
        console.log("Get message image " + err);
      }
    };
    getMessageImage();
    setRerender(false);
  }, [rerender]);

  function selectFile(e) {
    setNewFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
    setFileExtension(e.target.files[0].name.split(".").pop());
    setFileSelected(true);
  }

  function pushImage(i) {
    setImages({
      caption: i.text,
      url: i.cloudinaryUrl,
    });
  }

  function closeImage() {
    setImageOpen(false);
    setImageIndex(null);
  }

  function closePopup() {
    setDeleteMessage(false);
  }

  function closeEditor() {
    setEditMessage(false);
    setNewFile();
    setReplyMessage("");
    setIsReply(false);
  }

  function closeReply() {
    setIsReply(false);
    setNewFile();
  }

  function closeFileUpload() {
    setFileSelected(false);
    setNewFile();
  }

  const editText = () => {
    const res = axios.put("/messages/" + currentChat._id + "/" + messageId, {
      text: messageText,
      isEdited: true,
    });
    setEditMessage(false);
    setRerender(true);
    setMessageText("");
    setMessageId("");
  };

  const removeMessage = async () => {
    try {
      const res = axios.put(
        "/deleteMessage/" + currentChat._id + "/" + messageId,
        {
          isDeleted: true,
        }
      );
      setDeleteMessage(false);
      setRerender(true);
      setMessageText("");
      setMessageId("");
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let webFormData = new FormData();
    const message = {
      conversationId: currentChat._id,
      sender: userId,
      text: newMessage,
      file: newFile,
      fileName: fileName,
      fileExtension: fileExtension,
      gif_url: sendGIF.url,
      replyTo: messageId,
    };
    const updateTime = {
      updated_at: Date.now(),
    };
    const textMessage = {
      conversationId: currentChat._id,
      sender: userId,
      text: newMessage,
      file: newFile,
      fileName: fileName,
      fileExtension: fileExtension,
      replyTo: messageId,
    };
    webFormData.append("conversationId", currentChat._id);
    webFormData.append("sender", userId);
    webFormData.append("text", newMessage);
    webFormData.append("file", newFile);
    webFormData.append("fileName", fileName);
    webFormData.append("fileExtension", fileExtension);
    webFormData.append("replyTo", messageId);

    const receiverId = currentChat.members.find((member) => member !== userId);

    const blank = new RegExp(/.\S./);
    const msg = newMessage.replace(/ /g, "");

    if (msg.length === 0 && newFile === null && sendGIF.url === undefined) {
      console.log("msg is blank");
    } else if (msg.length === 0 && newFile !== null && fileExtension != "mp4") {
      // If there is no caption and user selected a file
      try {
        const res = await axios.post("/messageFile", webFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        // if (res.data === "Cloudinary file too large") {
        // }
        setMessages([...messages, res.data]);
        console.log(newMessage.length);
        setNewMessage("");
        setRerender(true);
        setFileSelected(false);
        setReplyMessage("");
        setIsReply(false);
        const data = await axios.put(
          "/conversation/" + currentChat._id,
          updateTime
        );
      } catch (err) {
        setPopupMessage(true);
        setFileSelected(false);
        console.log("The error is " + err);
      }
    } else if (
      msg.length === 0 &&
      newFile !== null &&
      sendGIF.url === undefined
    ) {
      try {
        const res = await axios.post("/messageVideo", webFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        // if (res.data === "Cloudinary file too large") {
        // }
        setMessages([...messages, res.data]);
        console.log(newMessage.length);
        setNewMessage("");
        setFileSelected(false);
        setReplyMessage("");
        setIsReply(false);
        const data = await axios.put(
          "/conversation/" + currentChat._id,
          updateTime
        );
      } catch (err) {
        setPopupMessage(true);
        console.log("The error is " + err);
      }
    } else if (sendGIF.url !== undefined) {
      try {
        const res = await axios.post("/sendGIF", message);
        setMessages([...messages, res.data]);
        console.log(newMessage.length);
        console.log("sent successfully");
        setNewMessage("");
        setSendGIF([]);
        setReplyMessage("");
        setIsReply(false);
        const data = await axios.put(
          "/conversation/" + currentChat._id,
          updateTime
        );
      } catch (err) {
        console.log("The error " + err);
      }
    } else {
      console.log("New message is " + newMessage);
      // normal message
      socket.current.emit("sendMessage", {
        senderId: userId,
        receiverId: receiverId,
        text: newMessage,
      });
      try {
        const res = await axios.post("/message", textMessage);
        setMessages([...messages, res.data]);
        console.log(newMessage.length);
        setNewMessage("");
        setReplyMessage("");
        setIsReply(false);
        const data = await axios.put(
          "/conversation/" + currentChat._id,
          updateTime
        );
      } catch (err) {
        console.log("The error " + err);
      }
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  useEffect(() => {
    scrollRef1.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations]);

  function handleCurrentChat(c) {
    setCurrentChat(c);
    setRerender(true);
    const receiverId = c.members.find((member) => member !== userId);
    setFriendId(receiverId);
  }

  const onEmojiClick = (event, emojiObject, data) => {
    setNewMessage((prevInput) => prevInput + emojiObject.emoji);
    setShowPicker(false);
    socket.current = io("/");
    socket.current.emit("typing", userId);
    console.log("typing");
  };

  const onChatBoxClick = (userId) => {
    setIsTyping(userId + "is typing...");
  };

  useEffect(() => {
    socket.current.on(
      "typing",
      (userId) => {
        socket.current.emit("typing", userId);
        console.log("user typing");
      },
      [userId]
    );
  });

  const toggleGif = (e) => {
    setToggleGIF(true);
    console.log(toggleGIF);
  };

  const toggleChat = () => {
    setToggleGIF(false);
  };
  useEffect(() => {
    socket.current.on("typing", (userId) => {
      setIsTyping(userId + "is typing");
      console.log("i am finally typing");
    });
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [toggleGIF]);

  // const registerScrollEvent = () => {
  //   let $chatBoxTop = $(".chatBoxTop")[0];
  //   $($chatBoxTop).on("scroll", function () {
  //     if (
  //       $($chatBoxTop).scrollTop() + $($chatBoxTop).innerHeight() <=
  //       $($chatBoxTop).prop("scrollHeight")
  //     ) {
  //       setOffset(offset + 10);
  //       console.log("scroll bottom");
  //     }
  //   });
  // };

  const registerScrollEvent = () => {
    let $chatBoxTop = $(".chatBoxTop")[0];
    $($chatBoxTop).on("scroll", function () {
      if ($($chatBoxTop).scrollTop() === 0) {
        setOffset(offset + 10);
        console.log("scroll bottom");
      }
    });
  };

  const removeScrollEvent = () => {
    $(".chatBoxTop").off("scroll");
  };

  // useEffect(() => {
  //   const getMessages = async () => {
  //     try {
  //       const res = await axios.get("/messages/" + currentChat._id);
  //       setMessages(res.data);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };
  //   getMessages();
  //   setRerender(false);
  // }, [rerender]);

  // const getMessage = () => {
  //   removeScrollEvent();
  //   this.setState({
  //     message: "",
  //   });
  //   axios
  //     .get("/messages/" + currentChat._id, {
  //       params: {
  //         limit: 10,
  //         offset: offset,
  //       },
  //     })
  //     .then(function (response) {
  //       let results = response.data;
  //       if (results.length) {
  //         setMessages(response.data);
  //         registerScrollEvent();
  //       } else {
  //         setMessages();
  //       }
  //     })
  //     .catch(function (error) {
  //       console.log(error);
  //     });
  // };

  return (
    <>
      {/* <Topbar /> */}

      <div className="messenger">
        <div className="chatMenu" style={{ backgroundColor: "#d9dce6" }}>
          <div className="HomeBar" style={{ width: 450 }}>
            <h3 className="Inbox">
              Direct Messages
              <a href="http://localhost:3000/listings">
                <img
                  className="home"
                  src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE2LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgd2lkdGg9IjQ2MC4yOThweCIgaGVpZ2h0PSI0NjAuMjk3cHgiIHZpZXdCb3g9IjAgMCA0NjAuMjk4IDQ2MC4yOTciIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ2MC4yOTggNDYwLjI5NzsiDQoJIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGc+DQoJPGc+DQoJCTxwYXRoIGQ9Ik0yMzAuMTQ5LDEyMC45MzlMNjUuOTg2LDI1Ni4yNzRjMCwwLjE5MS0wLjA0OCwwLjQ3Mi0wLjE0NCwwLjg1NWMtMC4wOTQsMC4zOC0wLjE0NCwwLjY1Ni0wLjE0NCwwLjg1MnYxMzcuMDQxDQoJCQljMCw0Ljk0OCwxLjgwOSw5LjIzNiw1LjQyNiwxMi44NDdjMy42MTYsMy42MTMsNy44OTgsNS40MzEsMTIuODQ3LDUuNDMxaDEwOS42M1YzMDMuNjY0aDczLjA5N3YxMDkuNjRoMTA5LjYyOQ0KCQkJYzQuOTQ4LDAsOS4yMzYtMS44MTQsMTIuODQ3LTUuNDM1YzMuNjE3LTMuNjA3LDUuNDMyLTcuODk4LDUuNDMyLTEyLjg0N1YyNTcuOTgxYzAtMC43Ni0wLjEwNC0xLjMzNC0wLjI4OC0xLjcwN0wyMzAuMTQ5LDEyMC45MzkNCgkJCXoiLz4NCgkJPHBhdGggZD0iTTQ1Ny4xMjIsMjI1LjQzOEwzOTQuNiwxNzMuNDc2VjU2Ljk4OWMwLTIuNjYzLTAuODU2LTQuODUzLTIuNTc0LTYuNTY3Yy0xLjcwNC0xLjcxMi0zLjg5NC0yLjU2OC02LjU2My0yLjU2OGgtNTQuODE2DQoJCQljLTIuNjY2LDAtNC44NTUsMC44NTYtNi41NywyLjU2OGMtMS43MTEsMS43MTQtMi41NjYsMy45MDUtMi41NjYsNi41Njd2NTUuNjczbC02OS42NjItNTguMjQ1DQoJCQljLTYuMDg0LTQuOTQ5LTEzLjMxOC03LjQyMy0yMS42OTQtNy40MjNjLTguMzc1LDAtMTUuNjA4LDIuNDc0LTIxLjY5OCw3LjQyM0wzLjE3MiwyMjUuNDM4Yy0xLjkwMywxLjUyLTIuOTQ2LDMuNTY2LTMuMTQsNi4xMzYNCgkJCWMtMC4xOTMsMi41NjgsMC40NzIsNC44MTEsMS45OTcsNi43MTNsMTcuNzAxLDIxLjEyOGMxLjUyNSwxLjcxMiwzLjUyMSwyLjc1OSw1Ljk5NiwzLjE0MmMyLjI4NSwwLjE5Miw0LjU3LTAuNDc2LDYuODU1LTEuOTk4DQoJCQlMMjMwLjE0OSw5NS44MTdsMTk3LjU3LDE2NC43NDFjMS41MjYsMS4zMjgsMy41MjEsMS45OTEsNS45OTYsMS45OTFoMC44NThjMi40NzEtMC4zNzYsNC40NjMtMS40Myw1Ljk5Ni0zLjEzOGwxNy43MDMtMjEuMTI1DQoJCQljMS41MjItMS45MDYsMi4xODktNC4xNDUsMS45OTEtNi43MTZDNDYwLjA2OCwyMjkuMDA3LDQ1OS4wMjEsMjI2Ljk2MSw0NTcuMTIyLDIyNS40Mzh6Ii8+DQoJPC9nPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPC9zdmc+DQo="
                  alt="Home"
                />
              </a>
            </h3>
          </div>

          <div className="chatMenuWrapper" style={{ width: 450 }}>
            {conversations.map((c) => (
              <div ref={scrollRef1}>
                <div onClick={() => handleCurrentChat(c)}>
                  <Conversation
                    conversation={c}
                    currentUser={userId}
                    friendID={friendId}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="chatBox">
          <div className="chatBoxWrapper">
            {currentChat ? (
              <>
                <ChatOnline conv={currentChat} currentId={friendId} />
                <div className="chatBoxTop">
                  {messages.map((m) => (
                    <div ref={scrollRef}>
                      <Message
                        message={m}
                        own={m.sender === userId}
                        imageOpen={imageOpen}
                        setImageOpen={setImageOpen}
                        imageUrl={imageUrl}
                        setImageUrl={setImageUrl}
                        images={images}
                        setImages={setImages}
                        imageIndex={imageIndex}
                        setImageIndex={setImageIndex}
                        setEditMessage={setEditMessage}
                        editMessage={editMessage}
                        setMessageText={setMessageText}
                        messageText={messageText}
                        setMessageId={setMessageId}
                        messageId={messageId}
                        setDeleteMessage={setDeleteMessage}
                        deleteMessage={deleteMessage}
                        userId={userId}
                        chatId={currentChat._id}
                        isReply={isReply}
                        setIsReply={setIsReply}
                        setSenderId={setSenderId}
                        senderId={senderId}
                        setReply={setReply}
                        reply={reply}
                        replyUser={replyUser}
                        setReplyUser={setReplyUser}
                        setReplyCloudinaryUrl={setReplyCloudinaryUrl}
                        replyCloudinaryUrl={replyCloudinaryUrl}
                        replyGifUrl={replyGifUrl}
                        setReplyGifUrl={setReplyGifUrl}
                        replyFileExtension={replyFileExtension}
                        setReplyFileExtension={setReplyFileExtension}
                        replyFileName={replyFileName}
                        setReplyFileName={setReplyFileName}
                      />
                    </div>
                  ))}
                </div>

                <Popup trigger={popupMessage} setTrigger={setPopupMessage}>
                  <img
                    src="https://res.cloudinary.com/dtkliahdh/image/upload/v1656132543/768px-Cross_red_circle.svg_lbhyeb.png"
                    style={{ width: 50, height: 50 }}
                  ></img>
                  <h3>Error!</h3>
                  <p>File size is too large or wrong file type!</p>
                  <p>Only jpg/jpeg/png/gif/docx/pdf is allowed</p>
                </Popup>

                <Popup
                  trigger={deleteMessage}
                  setTrigger={setDeleteMessage}
                  className="popup-box"
                >
                  <p
                    style={{
                      fontFamily: "Helvetica, sans-serif",
                      fontSize: "18px",
                    }}
                  >
                    Delete Message?
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      fontFamily: "Helvetica, sans-serif",
                      fontSize: "17px",
                      marginTop: "60px",
                    }}
                  >
                    <button className="deleteNo" onClick={closePopup}>
                      CANCEL
                    </button>
                    <button className="delete" onClick={removeMessage}>
                      DELETE
                    </button>
                  </div>
                </Popup>

                {imageOpen && (
                  <Lightbox
                    // imageTitle={images[imgIndex].title}
                    // imageCaption={images[imgIndex].caption}
                    mainSrc={images[imageIndex].cloudinary_url}
                    nextSrc={
                      images[(imageIndex + 1) % images.length].cloudinary_url
                    }
                    prevSrc={
                      images[(imageIndex + images.length - 1) % images.length]
                        .cloudinary_url
                    }
                    onCloseRequest={() => closeImage()}
                    onMovePrevRequest={() =>
                      setImageIndex(
                        (imageIndex + images.length - 1) % images.length
                      )
                    }
                    onMoveNextRequest={() =>
                      setImageIndex((imageIndex + 1) % images.length)
                    }
                  />
                )}

                {editMessage === true ? (
                  <div class="fileSelected">
                    <img
                      src="https://res.cloudinary.com/dtkliahdh/image/upload/v1657001050/pencil-solid_bvwsai.svg"
                      style={{
                        height: 20,
                        width: 20,
                        float: "left",
                        marginTop: 20,
                        marginRight: 20,
                        marginLeft: 5,
                      }}
                    />
                    <p
                      className="fileName"
                      style={{
                        display: "inline-block",
                        marginLeft: 10,
                        marginTop: 15,
                        float: "left",
                      }}
                    >
                      {messageText}
                    </p>
                    <button
                      onClick={closeEditor}
                      style={{
                        background: "transparent",
                        border: "none",
                        position: "absolute",
                        top: 0,
                        right: 0,
                        height: 15,
                        width: 15,
                        marginRight: 10,
                      }}
                    >
                      <img
                        src="https://res.cloudinary.com/dtkliahdh/image/upload/v1656575910/x-solid_d8oyjh.svg"
                        style={{ height: 15, width: 15 }}
                      />
                    </button>
                  </div>
                ) : isReply === true ? (
                  <div class="fileSelected">
                    {senderId !== userId ? <p>{user.firstName}</p> : <p>you</p>}
                    {messageText !== "" ? (
                      <p
                        className="fileName"
                        style={{
                          display: "inline-block",
                          marginLeft: 10,
                          marginTop: 15,
                          float: "left",
                        }}
                      >
                        {messageText}
                      </p>
                    ) : replyCloudinaryUrl !== "" &&
                      (replyFileExtension === "jpeg" ||
                        replyFileExtension === "jpg" ||
                        replyFileExtension === "png" ||
                        replyFileExtension === "gif") ? (
                      <img
                        src={replyCloudinaryUrl}
                        style={{ width: 50, height: 50 }}
                        alt="img"
                      />
                    ) : replyCloudinaryUrl !== "" &&
                      (replyFileExtension === "pdf" ||
                        replyFileExtension === "docx") ? (
                      <div>
                        {replyFileExtension === "docx" ? (
                          <img
                            src="https://res.cloudinary.com/dtkliahdh/image/upload/v1655968990/docx_z8htqn.png"
                            style={{
                              height: 30,
                              width: 30,
                              marginTop: 10,
                              display: "inline-block",
                              float: "left",
                              marginLeft: 10,
                            }}
                          />
                        ) : replyFileExtension === "pdf" ? (
                          <img
                            src="https://res.cloudinary.com/dtkliahdh/image/upload/v1655955302/pdf_qi5qya.png"
                            style={{
                              height: 30,
                              width: 30,
                              marginTop: 10,
                              marginRight: 20,
                              marginLeft: 5,
                              display: "inline-block",
                              float: "left",
                            }}
                          />
                        ) : (
                          <img
                            src="https://res.cloudinary.com/dtkliahdh/image/upload/v1656502911/file_c2tnhe.png"
                            style={{
                              height: 30,
                              width: 30,
                              marginTop: 10,
                              display: "inline-block",
                              float: "left",
                              marginLeft: 5,
                            }}
                          />
                        )}
                        <p
                          className="fileName"
                          style={{
                            display: "inline-block",
                            marginTop: 15,
                            marginLeft: 15,
                            float: "left",
                          }}
                        >
                          {replyFileName}
                        </p>
                        <button
                          onClick={closeFileUpload}
                          style={{
                            background: "transparent",
                            border: "none",
                            position: "absolute",
                            top: 0,
                            right: 0,
                            height: 15,
                            width: 15,
                            marginRight: 10,
                          }}
                        >
                          <img
                            src="https://res.cloudinary.com/dtkliahdh/image/upload/v1656575910/x-solid_d8oyjh.svg"
                            style={{ height: 15, width: 15 }}
                          />
                        </button>
                      </div>
                    ) : replyGifUrl !== "" || replyGifUrl !== undefined ? (
                      <img
                        src={replyGifUrl}
                        alt="gif"
                        style={{ width: 50, height: 50 }}
                      />
                    ) : (
                      ""
                    )}

                    <button
                      onClick={closeReply}
                      style={{
                        background: "transparent",
                        border: "none",
                        position: "absolute",
                        top: 0,
                        right: 0,
                        height: 15,
                        width: 15,
                        marginRight: 10,
                      }}
                    >
                      <img
                        src="https://res.cloudinary.com/dtkliahdh/image/upload/v1656575910/x-solid_d8oyjh.svg"
                        style={{ height: 15, width: 15 }}
                      />
                    </button>
                  </div>
                ) : (
                  ""
                )}

                <div className="chatBoxBottom">
                  {toggleGIF === false && editMessage === true ? (
                    <textarea
                      className="chatMessageInput"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      // onClick={() => onChatBoxClick()}
                    ></textarea>
                  ) : toggleGIF === false &&
                    editMessage === false &&
                    fileSelected === true ? (
                    <div className="chatMessageWrapper">
                      <textarea
                        className="chatMessageInput"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        // onClick={() => onChatBoxClick()}
                      ></textarea>
                      <div className="test2">
                        <p
                          className="fileName"
                          style={{
                            display: "inline-block",
                            marginTop: 15,
                            float: "left",
                            fontWeight: "bold",
                          }}
                        >
                          {fileName}
                        </p>
                        <button
                          onClick={closeFileUpload}
                          style={{
                            background: "transparent",
                            border: "none",
                            position: "absolute",
                            top: 0,
                            right: 0,
                            height: 5,
                            width: 5,
                            marginRight: 8,
                            marginTop: -5,
                          }}
                        >
                          <img
                            src="https://res.cloudinary.com/dtkliahdh/image/upload/v1656575910/x-solid_d8oyjh.svg"
                            style={{ height: 15, width: 15 }}
                          />
                        </button>
                      </div>
                    </div>
                  ) : toggleGIF === false &&
                    editMessage === false &&
                    fileSelected === false ? (
                    <div className="chatMessageWrapper">
                      <textarea
                        className="chatMessageInput"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        // onClick={() => onChatBoxClick()}
                      ></textarea>
                    </div>
                  ) : toggleGIF === true ? (
                    <GifBox setSendGIF={setSendGIF} sendGIF={sendGIF}></GifBox>
                  ) : fileSelected === true ? (
                    <div class="fileSelected">
                      <img
                        src="https://res.cloudinary.com/dtkliahdh/image/upload/v1656502911/file_c2tnhe.png"
                        style={{
                          height: 30,
                          width: 30,
                          marginTop: 10,
                          display: "inline-block",
                          float: "left",
                          marginLeft: 5,
                        }}
                      />
                      <p
                        className="fileName"
                        style={{
                          display: "inline-block",
                          marginTop: 15,
                          marginLeft: 15,
                          float: "left",
                        }}
                      >
                        {fileName}
                      </p>
                      <button
                        onClick={closeFileUpload}
                        style={{
                          background: "transparent",
                          border: "none",
                          position: "absolute",
                          top: 0,
                          right: 0,
                          height: 15,
                          width: 15,
                          marginRight: 10,
                        }}
                      >
                        <img
                          src="https://res.cloudinary.com/dtkliahdh/image/upload/v1656575910/x-solid_d8oyjh.svg"
                          style={{ height: 15, width: 15 }}
                        />
                      </button>
                    </div>
                  ) : (
                    ""
                  )}

                  {toggleGIF === true ? (
                    <div>
                      <div class="image-upload" style={{ float: "left" }}>
                        <label for="file-input">
                          <img
                            src="https://res.cloudinary.com/dtkliahdh/image/upload/v1656133501/circle-plus-solid_tu6wkh.svg"
                            style={{ width: 50, height: 50, padding: 1 }}
                          />
                        </label>
                        <input
                          id="file-input"
                          type="file"
                          onChange={selectFile}
                        ></input>
                      </div>
                      <img
                        className="emoji-icon"
                        src="https://cdn-icons-png.flaticon.com/512/3260/3260867.png"
                        alt="emoji icon"
                        width={"50px"}
                        style={{ float: "center" }}
                        onClick={() => setShowPicker((val) => !val)}
                      />
                      <button
                        style={{
                          border: 0,
                          backgroundColor: "transparent",
                          float: "right",
                        }}
                        onClick={toggleChat}
                      >
                        <img
                          className="GIF"
                          src="https://res.cloudinary.com/dtkliahdh/image/upload/v1657027895/keyboard_y2pdto.png"
                          alt="chat button"
                        />
                      </button>
                    </div>
                  ) : (
                    <div className="buttonGroup">
                      <div class="image-upload" style={{ float: "left" }}>
                        <label for="file-input">
                          <img
                            src="https://res.cloudinary.com/dtkliahdh/image/upload/v1656133501/circle-plus-solid_tu6wkh.svg"
                            style={{ width: 50, height: 50, padding: 1 }}
                          />
                        </label>
                        <input
                          id="file-input"
                          type="file"
                          onChange={selectFile}
                        ></input>
                      </div>
                      <img
                        className="emoji-icon"
                        src="https://cdn-icons-png.flaticon.com/512/3260/3260867.png"
                        alt="emoji icon"
                        width={"50px"}
                        onClick={() => setShowPicker((val) => !val)}
                        style={{ float: "center" }}
                      />
                      <button
                        style={{
                          border: 0,
                          backgroundColor: "transparent",
                          float: "right",
                        }}
                        onClick={toggleGif}
                      >
                        <img
                          className="GIF"
                          src="https://res.cloudinary.com/dtkliahdh/image/upload/v1657026098/gif_2_hqigu9.png"
                          alt="GIF button"
                        />
                      </button>
                    </div>
                  )}

                  {showPicker && (
                    <Picker
                      pickerStyle={{ width: "100%" }}
                      onEmojiClick={onEmojiClick}
                    />
                  )}

                  {/* <emoji-picker></emoji-picker>
                  <script type="module">
                    
                    document.querySelector('emoji-picker').addEventListener('emoji-click', {(e) =>
                      insertTextAtCursor(document.querySelector('chatMessageInput'), e.detail.unicode)
                    }
                  </script> */}
                  <isTyping></isTyping>
                  <shareIcon />
                  {editMessage === true ? (
                    <button className="chatSubmitButton" onClick={editText}>
                      <img
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAABWElEQVRIie3UL0hkURTHcf+MCwuCLGzwzwaDQRTMBpui0bRtrVbDCiYtloW1GjZsGavNsKhRo0WjSZBxFcGwiIiiH8Ocgau892ZGJ8medO+5v/v7nnt477S1/Y8k0I8F/G6l6Ud8xRbuVeP7W007MIFf+Od5PGDgtcZjWEMlMXzEHrZjv9Osaa2vBy8qPcEPDIVuP/LfGjHN6itcoYwptCf6wXjJNbrzTDsxg40Q1uIWm5jFh0RfQl+sl0O7UVR1OaOv8/iU07ZVlGJ/HPem67VlN4QXGM7RTeII/bEfjzsVdOYCMiDnGE3O2rGEu7RSrIf+Z6F5EQSf8SdyK4m2C5eRH2sIkAE5w2mst9GR6GYjf9iweQ4E/qL3hWYzzhabBmRAzjGSnPXgRnU0fHkVoAgSnzDNjoZGIar/Ccy9GZABuVBvNLQAQtFoaBEkfzS0AFJWbzS8i3gCIB2P4qUlL1gAAAAASUVORK5CYII="
                        alt=""
                      />
                    </button>
                  ) : (
                    <button className="chatSubmitButton" onClick={handleSubmit}>
                      <img
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAABWElEQVRIie3UL0hkURTHcf+MCwuCLGzwzwaDQRTMBpui0bRtrVbDCiYtloW1GjZsGavNsKhRo0WjSZBxFcGwiIiiH8Ocgau892ZGJ8medO+5v/v7nnt477S1/Y8k0I8F/G6l6Ud8xRbuVeP7W007MIFf+Od5PGDgtcZjWEMlMXzEHrZjv9Osaa2vBy8qPcEPDIVuP/LfGjHN6itcoYwptCf6wXjJNbrzTDsxg40Q1uIWm5jFh0RfQl+sl0O7UVR1OaOv8/iU07ZVlGJ/HPem67VlN4QXGM7RTeII/bEfjzsVdOYCMiDnGE3O2rGEu7RSrIf+Z6F5EQSf8SdyK4m2C5eRH2sIkAE5w2mst9GR6GYjf9iweQ4E/qL3hWYzzhabBmRAzjGSnPXgRnU0fHkVoAgSnzDNjoZGIar/Ccy9GZABuVBvNLQAQtFoaBEkfzS0AFJWbzS8i3gCIB2P4qUlL1gAAAAASUVORK5CYII="
                        alt=""
                      />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <span className="noConversationText">
                <img
                  className="noConversationImage"
                  src="https://res.cloudinary.com/dtkliahdh/image/upload/v1643994658/Zeus_Property_Word_fq5wmg.png"
                />
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
