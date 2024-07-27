import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { icons } from "../constants";
import { ResizeMode, Video } from "expo-av";
import { useGlobalContext } from "../context/GlobalProvider";
import { getLikesForVideo, likeVideo, unlikeVideo } from "../lib/appwrite";

// $id -->
// In the context of the VideoCard component, $id is used to uniquely identify each video. This is necessary when performing actions on a specific video, such as liking or unliking it. It ensures that the action affects the correct video document in the database.

// user.$id -->
// user.$id is used to identify the logged-in user who is performing an action, such as liking or unliking a video. This user ID is necessary to record which user liked a video and to ensure that each user can only like a video once.

const VideoCard = ({
  video: {
    $id,
    title,
    thumbnail,
    video,
    creator: { username, avatar },
  },
  showHeart = true,
}) => {
  const [play, setPlay] = useState(false);
  const { user } = useGlobalContext();
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchLikes = async () => {
      const likes = await getLikesForVideo($id);
      const likedByUser = likes.includes(user.$id);
      setIsLiked(likedByUser);
    };

    fetchLikes();
  }, [$id, user.$id]);

  const handleLike = async () => {
    if (isLiked) {
      await unlikeVideo($id, user.$id);
    } else {
      await likeVideo($id, user.$id);
    }
    setIsLiked(!isLiked);
  };

  return (
    <View className="flex flex-col items-center px-4 mb-14">
      <View className="flex flex-row gap-3 items-start w-full">
        <View className="flex-row items-center flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>
          <View className="ml-3 flex-1">
            <Text
              className="text-white font-psemibold text-sm"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-xs text-gray-100 font-pregular"
              numberOfLines={1}
            >
              {username}
            </Text>
          </View>
        </View>

        {showHeart && (
          <View className="pt-2">
            {/* <Image source={icons.menu} className="w-5 h-5" resizeMode="contain" /> */}
            <TouchableOpacity onPress={handleLike}>
              <Image
                source={isLiked ? icons.heartFilled : icons.heartOutline}
                className="w-6 h-6"
                resizeMode="contain"
                style={{ tintColor: isLiked ? "red" : "white" }}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
      {play ? (
        <Video
          source={{ uri: video }}
          className="w-full h-60 rounded-xl mt-3 "
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
              setPlay(false);
            }
          }}
        />
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
          className="w-full h-60 rounded-xl mt-3 relative justify-center items-center"
        >
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-full rounded-xl mt-3"
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoCard;
