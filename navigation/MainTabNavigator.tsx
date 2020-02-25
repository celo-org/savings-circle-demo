import { PhoneNumberMappingEntry } from "@celo/dappkit";
import { RouteProp } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp
} from "@react-navigation/stack";
import React from "react";
import { Platform } from "react-native";
import AddMemberScreen from "../screens/AddMemberScreen";
import CircleScreen from "../screens/CircleScreen";
import HomeScreen from "../screens/HomeScreen";
import NewCircleScreen from "../screens/NewCircleScreen";

const config = Platform.select({
  web: { headerMode: "screen" },
  default: {}
});

export enum HomeScreens {
  Home = "Home",
  NewCircle = "NewCircle",
  AddMember = "AddMember",
  Circle = "Circle"
}

export type HomeStackParamList = {
  Home: undefined;
  NewCircle: undefined;
  AddMember: {
    addMember: (entry: PhoneNumberMappingEntry) => void;
  };
  Circle: { circle: string };
};

const HomeStack = createStackNavigator<HomeStackParamList>();

export interface HomeScreenProps {
  navigation: StackNavigationProp<HomeStackParamList, HomeScreens.Home>;
  route: RouteProp<HomeStackParamList, HomeScreens.Home>;
}

export interface NewCircleScreenProps {
  navigation: StackNavigationProp<HomeStackParamList, HomeScreens.NewCircle>;
  route: RouteProp<HomeStackParamList, HomeScreens.NewCircle>;
}

export interface AddMemberScreenProps {
  navigation: StackNavigationProp<HomeStackParamList, HomeScreens.AddMember>;
  route: RouteProp<HomeStackParamList, HomeScreens.AddMember>;
}

export interface CircleScreenProps {
  navigation: StackNavigationProp<HomeStackParamList, HomeScreens.Circle>;
  route: RouteProp<HomeStackParamList, HomeScreens.Circle>;
}

const val = {
  screens: {
    [HomeScreens.Home]: {
      screen: HomeScreen,
      path: "home/:account"
    },
    [HomeScreens.NewCircle]: {
      screen: NewCircleScreen,
      path: "home/new_circle"
    },
    [HomeScreens.AddMember]: {
      screen: AddMemberScreen,
      path: "home/new_circle/add_member"
    },
    [HomeScreens.Circle]: {
      screen: CircleScreen,
      path: "home/circles/:circle"
    }
  }
};

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="NewCircle" component={NewCircleScreen} />
      <HomeStack.Screen name="AddMember" component={AddMemberScreen} />
      <HomeStack.Screen name="Circle" component={CircleScreen} />
    </HomeStack.Navigator>
  );
};

export default HomeStackNavigator;
