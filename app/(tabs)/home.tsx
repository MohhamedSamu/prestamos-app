import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, Text, View } from "react-native";

import images from "../../constants/images";

const Home = () => {
  // const { data: posts, refetch } = useAppwrite(getAllPosts);
  // const { data: latestPosts } = useAppwrite(getLatestPosts);

  const posts:any = [];
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // await refetch();
    setRefreshing(false);
  };

  // one flatlist
  // with list header
  // and horizontal flatlist

  //  we cannot do that with just scrollview as there's both horizontal and vertical scroll (two flat lists, within trending)

  return (
    <SafeAreaView className="bg-primary">

      <View className="flex mt-6 px-4 space-t-6 h-full">
        <View className="flex justify-between items-start flex-row mb-6">
          <View>
            <Text className="font-pmedium text-sm text-gray-100">
              Bienvenido de regreso
            </Text>
            <Text className="text-2xl font-psemibold text-white">
              A tu control
            </Text>
          </View>

          <View className="mt-1.5">
            <Image
              source={images.logoSmall}
              className="w-9 h-10"
              resizeMode="contain"
            />
          </View>
        </View>

        <View className="w-full flex-1 pt-1 pb-8">
          <Text className="text-lg font-pregular text-gray-100 mb-3">
            Latest Videos
          </Text>
        </View>

      </View>

    </SafeAreaView>
  );
};

export default Home;
