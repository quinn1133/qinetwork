import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Profile from "./pages/profile";
import Home from "./pages/home";
import LoggedInRoutes from "./routes/LoggedInRoutes";
import NotLoggedInRoutes from "./routes/NotLoggedInRoutes";
import NotFoundPage from "./pages/notFoundPage/NotFoundPage";
import { useSelector } from "react-redux";
import Activate from "./pages/home/activate";
import Reset from "./pages/reset";
import CreatePostPopup from "./components/createPostPopup";
import { useEffect, useReducer, useState } from "react";
import axios from "axios";
import {
  postsReducer,
  notificationsReducer,
  listMessReducer,
  listPostSavedReducer,
  friendspage,
  friendspageByBirthday,
  groupspage,
  groupdiscoverspage,
  postgroups,
  roommess
} from "./functions/reducers";
import Friends from "./pages/friends";
import io from "socket.io-client";
import { notification } from "antd";
import Search from "./pages/search";
import PostDetail from "./components/post/Post_detail";
import ReactPopup from "./components/reactPopup";
import ReactCommentPopup from "./components/reactPopup/reactCommentPopup";
import { setRead } from "./functions/notification";
import PageGroup from "./pages/groups/PageGroup";
import Groups from "./pages/groups";
import { getGroupsJoined, getdiscoverGroups, getFriendsByBirthday, getFriendsPageInfos, getUser } from "./functions/user";
import RoomMessScreen from "./components/chat/RoomMess";
import ReportMenu from "./components/reportMenu";
import ReportGroupMenu from "./components/reportMenu/reportGroupMenu";
import Messages from "./pages/messages";
import PhotoDetail from "./components/photoDetail";
import ReportMenuProfile from "./components/reportMenu/reportProfile";
import Verifi from "./pages/verify";
import PhotoPopup from "./components/photoPopup";
import ChatScreen from "./components/chat";
import Saved from "./pages/saved";
import VerifiRegister from "./pages/verify/VerifiRegister";

function App() {
  const [visible, setVisible] = useState(false);
  const [visiblePost, setVisiblePost] = useState(null);
  const [visiblePhoto, setVisiblePhoto] = useState(null);
  const [visibleReact, setVisibleReact] = useState(null);
  const [visibleReactComment, setVisibleReactComment] = useState(null);
  const { user, darkTheme } = useSelector((state) => ({ ...state }));
  const [api, contextHolder] = notification.useNotification();
  const [notifi, setNotifi] = useState(null);
  const [report, setReport] = useState(null);
  const [reportGroup, setReportGroup] = useState(null);

  const [report_Profile, setReport_Profile] = useState(null);

  const [reportComment, setReportComment] = useState(false);
  const [reportGroupComment, setReportGroupComment] = useState(false);
  const [mess, setMess] = useState(null);
  const [loadingAllPosts, setLoadingAllPosts] = useState(false);

  const [visiblePhotoDetail, setVisiblePhotoDetail] = useState(null);

  const [socket, setSocket] = useState(null);
  const [User, setUser] = useState();
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [openChatWindows, setOpenChatWindows] = useState([]);
  const [openChatWindowMess, setOpenChatWindowMess] = useState(null);

  const getUserData = async () => {
    const res = await getUser(user.token);
    setUser(res);
  };

  useEffect(() => {
    if (user?.id !== undefined) {
      socket?.emit("newUser", user?.id);
      getDatafriendsByBirthday();
      getAllPosts();
      getListPostSaved();
      getDataFriend();
      getGroups();
      getDiscoverGroups();
      getPostGroups();
      getRoomMess();
      getNotifications();
      getListMess();
      getUserData();
    }
  }, [user?.id, socket, getDatafriendsByBirthday, getAllPosts, getListPostSaved, getDataFriend, getGroups, getDiscoverGroups, getPostGroups, getRoomMess, getNotifications, getListMess, getUserData]);

  useEffect(() => {
    const newSocket = io("http://localhost:5000", {
      transports: ["websocket"],
    });
    setSocket(newSocket);
   
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const openChatWindow = (room) => {
    const existingWindowIndex = openChatWindows.findIndex(
      (window) => window._id === room._id
    );

    if (existingWindowIndex !== -1) {
      setOpenChatWindows([
        ...openChatWindows.slice(0, existingWindowIndex),
        ...openChatWindows.slice(existingWindowIndex + 1),
        room,
      ]);
      closeChatWindow(existingWindowIndex);
    } else {
      if (openChatWindows.length === 3) {
        closeChatWindow(0);
        setOpenChatWindows([...openChatWindows.slice(1), room]);
      } else {
        setOpenChatWindows([...openChatWindows, room]);
      }
    }
  };

  const closeChatWindow = (index) => {
    const updatedWindows = [...openChatWindows];
    updatedWindows.splice(index, 1);
    setOpenChatWindows(updatedWindows);
  };

  useEffect(() => {
    if (socket === null) return;
    socket.emit("newUser", user?.id);
    socket.on("getOnlineUsers", (res) => {
      setOnlineUsers(res);
    });
    return () => {
      socket.off("getOnlineUsers");
    };
  }, [socket, user?.id]);

  const [photoDetail, setPhotoDetail] = useState("");
  const [{ loading, error, posts }, dispatch] = useReducer(postsReducer, {
    loading: false,
    posts: [],
    error: "",
  });

  const reacts = ["Like", "Love", "Angry", "Haha", "Sad", "Wow"];

  const [
    { loadingNotification, errorNotification, notifications },
    dispatchNotification,
  ] = useReducer(notificationsReducer, {
    loading: false,
    notifications: [],
    error: "",
  });

  const [
    { loading: loadingListMess, errorListMes, listMess },
    dispatchListMes,
  ] = useReducer(listMessReducer, {
    loading: false,
    listMess: [],
    error: "",
  });

  const getNotifications = async () => {
    try {
      dispatchNotification({
        type: "NOTIFICATIONS_REQUEST",
      });
      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/getAllNotification`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      dispatchNotification({
        type: "NOTIFICATIONS_SUCCESS",
        payload: data,
      });
    } catch (error) {
      dispatchNotification({
        type: "NOTIFICATIONS_ERROR",
        payload: errorNotification?.response.data.message,
      });
    }
  };

  const [
    { loading: loadingListPostSaved, errorListPostSaved, listPostSaved },
    dispatchListPostSaved,
  ] = useReducer(listPostSavedReducer, {
    loading: false,
    listPostSaved: [],
    error: "",
  });

  const getListPostSaved = async () => {
    try {
      dispatchListPostSaved({
        type: "POSTSSAVED_REQUEST",
      });
      const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/getSavedPosts`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      dispatchListPostSaved({
        type: "POSTSSAVED_SUCCESS",
        payload: data,
      });
    } catch (error) {
      dispatchListPostSaved({
        type: "POSTSSAVED_ERROR",
        payload: errorListPostSaved?.response.data.message,
      });
    }
  };

  const getListMess = async () => {
    try {
      dispatchListMes({
        type: "LISTMESS_REQUEST",
      });
      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/getListRoomMess`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      dispatchListMes({
        type: "LISTMESS_SUCCESS",
        payload: data,
      });
    } catch (error) {
      dispatchListMes({
        type: "LISTMESS_ERROR",
        payload: errorListMes?.response.data.message,
      });
    }
  };

  const [
    { loading: friendsLoading, error: friendsError, dataFriend },
    dispatchFriends,
  ] = useReducer(friendspage, {
    loading: false,
    dataFriend: [],
    error: "",
  });
  console.log(dataFriend);
  const [
    { loading: groupsLoading, error: groupsError, dataGroups },
    dispatchGroups,
  ] = useReducer(groupspage, {
    loading: false,
    dataGroups: [],
    error: "",
  });

  const [
    {
      loading: discoverGroupsLoading,
      error: discoverGroupsError,
      dataDiscoverGroups,
    },
    dispatchDiscoverGroups,
  ] = useReducer(groupdiscoverspage, {
    loading: false,
    dataDiscoverGroups: [],
    error: "",
  });

  const [
    { loading: postGroupsLoading, error: postGroupsError, dataPostGroups },
    dispatchPostGroups,
  ] = useReducer(postgroups, {
    loading: false,
    dataPostGroups: [],
    error: "",
  });

  const [
    { loading: roomMessLoading, error: roomMessError, dataRoomMess },
    dispatchRoomMess,
  ] = useReducer(roommess, {
    loading: false,
    dataRoomMess: [],
    error: "",
  });

  const getRoomMess = async () => {
    try {
      dispatchRoomMess({ type: "ROOM_MESS_REQUEST" });
      const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/getRoomMess`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      dispatchRoomMess({ type: "ROOM_MESS_SUCCESS", payload: data });
    } catch (error) {
      dispatchRoomMess({
        type: "ROOM_MESS_ERROR",
        payload: roomMessError?.response.data.message,
      });
    }
  };

  const getPostGroups = async () => {
    try {
      dispatchPostGroups({ type: "POST_GROUPS_REQUEST" });
      const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/getpostgroups`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      dispatchPostGroups({ type: "POST_GROUPS_SUCCESS", payload: data });
    } catch (error) {
      dispatchPostGroups({
        type: "POST_GROUPS_ERROR",
        payload: groupsError?.response.data.message,
      });
    }
  };

  const getGroups = async () => {
    dispatchGroups({ type: "GROUPS_REQUEST" });
    const data = await getGroupsJoined(user?.token);
    console.log(data);
    if (data.status === "ok") {
      dispatchGroups({ type: "GROUPS_SUCCESS", payload: data.data });
    } else {
      dispatchGroups({
        type: "GROUPS_ERROR",
        payload: groupsError.response.data.message,
      });
    }
  };

  const getDiscoverGroups = async () => {
    dispatchDiscoverGroups({ type: "DISCOVER_GROUPS_REQUEST" });
    const data = await getdiscoverGroups(user?.token);
    console.log(data);
    if (data.status === "ok") {
      dispatchDiscoverGroups({
        type: "DISCOVER_GROUPS_SUCCESS",
        payload: data.data,
      });
    } else {
      dispatchDiscoverGroups({
        type: "DISCOVER_GROUPS_ERROR",
        payload: groupsError.response.data.message,
      });
    }
  };

  const getDataFriend = async () => {
    dispatchFriends({ type: "FRIENDS_REQUEST" });
    const data = await getFriendsPageInfos(user?.id, user?.token);
    if (data.status === "ok") {
      dispatchFriends({ type: "FRIENDS_SUCCESS", payload: data.data });
    } else {
      dispatchFriends({
        type: "FRIENDS_ERROR",
        payload: error.response.data.message,
      });
    }
  };

  const [
    {
      loading: friendsByBirthdayLoading,
      error: friendsByBirthdayError,
      dataByBirthday,
    },
    dispatchFriendsByBirthday,
  ] = useReducer(friendspageByBirthday, {
    loading: false,
    dataByBirthday: [],
    error: "",
  });

  const getDatafriendsByBirthday = async () => {
    dispatchFriendsByBirthday({ type: "FRIENDS_BY_BIRTHDAY_REQUEST" });
    const data = await getFriendsByBirthday(user?.id, user?.token);
    if (data.status === "ok") {
      dispatchFriendsByBirthday({
        type: "FRIENDS_BY_BIRTHDAY_SUCCESS",
        payload: data.data,
      });
    } else {
      dispatchFriendsByBirthday({
        type: "FRIENDS_BY_BIRTHDAY_ERROR",
        payload: data.data,
      });
    }
  };

  const setReadNotificaion = async (idNotification) => {
    try {
      await setRead(idNotification, user.token).then(setNotifi(idNotification));
    } catch (error) {
      console.error("Error while setting read:", error);
      // Handle the error as needed
    }
  };

  useEffect(() => {
    if (socket === null) return;
    socket.on("getNotification", (data) => {
      getNotifications();
      setReadNotificaion(data._id);
    });
    return () => {
      socket.off("getNotification");
    };
  }, [socket, getNotifications, setReadNotificaion]);

  const getAllPosts = async () => {
    try {
      setLoadingAllPosts(true);
      dispatch({
        type: "POSTS_REQUEST",
      });
      const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/getAllposts`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      dispatch({
        type: "POSTS_SUCCESS",
        payload: data,
      });
      setLoadingAllPosts(false);
    } catch (error) {
      dispatch({
        type: "POSTS_ERROR",
        payload: error.response.data.message,
      });
    }
  };

  return (
    <div className={darkTheme ? "dark" : ""}>
      {contextHolder}
      <Routes>
        <Route element={<LoggedInRoutes />}>
          <Route path="/profile" element={<Profile />} exact />
          <Route path="/profile/:username" element={<Profile />} exact />
          <Route path="/friends" element={<Friends />} exact />
          <Route path="/friends/:type" element={<Friends />} exact />
          <Route path="/" element={<Home />} exact />
          <Route path="/activate/:token" element={<Activate />} exact />
          <Route path="/reset" element={<Reset />} exact />
          <Route path="/search" element={<Search />} exact />
          <Route path="/message" element={<Messages />} exact />
          <Route path="/saved" element={<Saved />} exact />
          <Route path="/groups" element={<Groups />} exact />
          <Route path="/groups/:type" element={<Groups />} exact />
          <Route path="/group/:id" element={<PageGroup />} exact />
          <Route path="/verify" element={<Verifi />} exact />
          <Route path="/verify/register" element={<VerifiRegister />} exact />
        </Route>
        <Route element={<NotLoggedInRoutes />}>
          <Route path="/login" element={<Login />} exact />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {visible && <CreatePostPopup user={user} setVisible={setVisible} />}
      {visiblePost && <PostDetail user={user} post={visiblePost} setVisiblePost={setVisiblePost} />}
      {visiblePhoto && <PhotoPopup user={user} post={visiblePhoto} setVisiblePhoto={setVisiblePhoto} />}
      {visibleReact && <ReactPopup user={user} post={visibleReact} setVisibleReact={setVisibleReact} />}
      {visibleReactComment && <ReactCommentPopup user={user} comment={visibleReactComment} setVisibleReactComment={setVisibleReactComment} />}
      {visiblePhotoDetail && <PhotoDetail user={user} post={visiblePhotoDetail} setVisiblePhotoDetail={setVisiblePhotoDetail} />}
      {report && <ReportMenu user={user} post={report} setReport={setReport} />}
      {reportGroup && <ReportGroupMenu user={user} post={reportGroup} setReportGroup={setReportGroup} />}
      {report_Profile && <ReportMenuProfile user={user} post={report_Profile} setReport_Profile={setReport_Profile} />}
      {mess && <ChatScreen user={user} mess={mess} setMess={setMess} />}
      {openChatWindowMess && <RoomMessScreen user={user} room={openChatWindowMess} setOpenChatWindowMess={setOpenChatWindowMess} />}
    </div>
  );
}

export default App;
