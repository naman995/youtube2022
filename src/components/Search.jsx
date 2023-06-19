import React, { useContext, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../Context/AuthContext";
const Search = () => {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(false);

  const { currentUser } = useContext(AuthContext);

  const handleSearch = async () => {
    const q = query(
      collection(db, "users"),
      where("displayName", "==", username)
    );

    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setUser(doc.data());
      });
    } catch (err) {
      setErr(true);
    }
  };

  const handleKey = (e) => {
    e.code === "Enter" && handleSearch();
  };

  const handleSelect = async () => {
    //check whether the group(chats in firestore) exists, if not create
    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;
        
    const currentUserChatData = {
      [`userInfo.${combinedId}`]: {
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid,
      },
      [`date.${combinedId}`]: serverTimestamp(),
    };

    const userChatData = {
      [`userInfo.${combinedId}`]: {
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        uid: currentUser.uid,
      },
      [`date.${combinedId}`]: serverTimestamp(),
    };

    const currentUserChatRef = doc(db, "userChats", currentUser.uid);
    const userChatRef = doc(db, "userChats", user.uid);

    const currentUserChatSnapshot = await getDoc(currentUserChatRef);
    const userChatSnapshot = await getDoc(userChatRef);

    if (currentUserChatSnapshot.exists()) {
      await updateDoc(currentUserChatRef, currentUserChatData);
    } else {
      await setDoc(currentUserChatRef, currentUserChatData);
    }

    if (userChatSnapshot.exists()) {
      await updateDoc(userChatRef, userChatData);
    } else {
      await setDoc(userChatRef, userChatData);
    }

    setUser(null);
    setUsername("")
  };
  return (
    <div className="search">
      <div className="searchForm">
        <input
          type="text"
          placeholder="Find a user"
          onKeyDown={handleKey}
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
      </div>
      {err && <span>User not found!</span>}
      {user && (
        <div className="userChat" onClick={handleSelect}>
          <img src={user.photoURL} alt="" />
          <div className="userChatInfo">
            <span>{user.displayName}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;