import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { AppLoading } from "expo";
import { Asset } from "expo-asset";
import * as Font from "expo-font";
import React, { useState } from "react";
import { Platform, StatusBar, StyleSheet, View, YellowBox } from "react-native";
import { Provider } from "react-redux";
import "./global";
import AppNavigator from "./navigation/AppNavigator";
import store from "./store";

YellowBox.ignoreWarnings([
  "Warning: The provided value 'moz",
  "Warning: The provided value 'ms-stream"
]);

function App(props) {
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  if (!isLoadingComplete && !props.skipLoadingScreen) {
    return (
      <AppLoading
        startAsync={loadResourcesAsync}
        onError={handleLoadingError}
        onFinish={() => handleFinishLoading(setLoadingComplete)}
      />
    );
  } else {
    return (
      <View style={styles.container}>
        {Platform.OS === "ios" && <StatusBar barStyle="default" />}
        <AppNavigator />
      </View>
    );
  }
}

const RootComponent = () => (
  <Provider store={store}>
    <NavigationContainer>
      <App />
    </NavigationContainer>
  </Provider>
);

export default RootComponent;

async function loadResourcesAsync() {
  await Promise.all([
    Asset.loadAsync([require("./assets/images/gold-value.png")]),
    Font.loadAsync({
      // This is the font that we are using for our tab bar
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
      ...Ionicons.font,
      // We include SpaceMono because we use it in HomeScreen.js. Feel free to
      // remove this if you are not using it in your app
      "space-mono": require("./assets/fonts/SpaceMono-Regular.ttf")
    })
  ]);
}

function handleLoadingError(error) {
  // In this case, you might want to report the error to your error reporting
  // service, for example Sentry
  console.warn(error);
}

function handleFinishLoading(setLoadingComplete) {
  setLoadingComplete(true);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  }
});
