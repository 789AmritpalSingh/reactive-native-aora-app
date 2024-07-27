import { View, Text, FlatList, RefreshControl, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchInput from "../../components/SearchInput";
import VideoCard from "../../components/VideoCard";
import { getVideosLikedByUser } from "../../lib/appwrite"; // Assuming you have a function to get liked videos
import { useGlobalContext } from "../../context/GlobalProvider";

const Bookmark = () => {
  const { user } = useGlobalContext();
  const [savedVideos, setSavedVideos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSavedVideos = async () => {
    try {
      const likedVideos = await getVideosLikedByUser(user.$id);
      console.log('Liked videos by user - ', likedVideos)
      setSavedVideos(likedVideos);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    fetchSavedVideos();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSavedVideos();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <View className="my-6 px-4">
        <Text className="text-2xl font-psemibold text-white mb-4">Saved Videos</Text>
        <SearchInput />
      </View>
      <FlatList
        data={savedVideos}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard video={item} showHeart={false}/>
        )}
        ListEmptyComponent={() => (
          <View className="justify-center items-center py-20">
            <Text className="text-lg text-gray-100">No Saved Videos</Text>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

export default Bookmark;
