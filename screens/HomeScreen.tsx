import { listenToAccount, requestAccountAddress } from "@celo/dappkit";
import BigNumber from "bignumber.js";
import { Linking } from "expo";
import { Body, Button, Text } from "native-base";
import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { connect } from "react-redux";
import { hasAccount, logout, setAccount } from "../account";
import { HomeScreenProps, HomeScreens } from "../navigation/MainTabNavigator";
import { CircleInfo, prettyAmount, sendAddCircleTx } from "../savingscircle";
import { RootState } from "../store";

interface StateProps {
  hasAddress: boolean;
  circles: CircleInfo[];
  goldBalance: string;
}
interface DispatchProps {
  setAccount: typeof setAccount;
  sendAddCircleTx: typeof sendAddCircleTx;
  logout: typeof logout;
}

type Props = StateProps & DispatchProps & HomeScreenProps;
class HomeScreen extends React.Component<Props> {
  static navigationOptions = _any => {
    return {
      title: "Celo Savings Circle"
    };
  };

  componentDidMount() {
    listenToAccount(this.props.setAccount);
  }

  handleNewCirclePress = () => {
    this.props.navigation.navigate(HomeScreens.NewCircle);
  };

  handleCirclePress = (circle: string) => {
    return () => {
      this.props.navigation.navigate(HomeScreens.Circle, { circle });
    };
  };

  renderCircleList = () => {
    return this.props.circles.map(circle => (
      <TouchableOpacity
        onPress={this.handleCirclePress(circle.name)}
        key={circle.name}
      >
        <View style={[styles.circleDisplay]}>
          <Body>
            <View style={[styles.alignedItem, styles.helpContainer]}>
              <Text style={styles.circleName}>{circle.name}</Text>
              <Text style={styles.circleBalance}>{circle.totalBalance}</Text>
            </View>
          </Body>
        </View>
      </TouchableOpacity>
    ));
  };

  handleLogout = () => {
    this.props.logout();
  };
  render() {
    if (this.props.hasAddress) {
      return (
        <View style={styles.container}>
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
          >
            <View style={styles.welcomeContainer}>
              <View style={styles.alignedItem}>
                <View style={[styles.alignedColItem, styles.helpContainer]}>
                  <Text style={[styles.goldBalance]}>
                    {prettyAmount(new BigNumber(this.props.goldBalance))} cGLD
                  </Text>
                  <Button primary onPress={this.handleNewCirclePress}>
                    <Text>+New Circle</Text>
                  </Button>
                </View>
              </View>
            </View>

            <View style={styles.bar}>
              <View style={styles.alignedItem}>
                <Text style={styles.merchTitle}>Your Circles:</Text>
              </View>

              <View style={styles.helpContainerNoPad}>
                {this.props.circles.length > 0 ? (
                  this.renderCircleList()
                ) : (
                  <Text>You Have No Circles Yet!</Text>
                )}
              </View>
            </View>

            <View style={styles.helpContainer}>
              <Button danger onPress={this.handleLogout}>
                <Text>Logout</Text>
              </Button>
            </View>
          </ScrollView>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.welcomeContainer}>
            <Image
              source={require("../assets/images/gold-value.png")}
              style={styles.welcomeImage}
            />
          </View>

          <View style={styles.helpContainer}>
            <Text style={styles.helpHeaderText}>
              Welcome to the Celo Savings Circle!
            </Text>
          </View>

          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              Savings Circles let you pool funds with your friends to save for
              large purchases. To get started, we'll need permission to connect
              this app to your Celo Wallet Account.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button primary onPress={handleHelpPress}>
              <Text>Connect Wallet Account</Text>
            </Button>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state: RootState): StateProps => {
  return {
    hasAddress: hasAccount(state),
    goldBalance: state.account.goldBalance,
    circles: state.savingsCircle.circles
  };
};

const mapDispatchToProps = {
  setAccount,
  sendAddCircleTx,
  logout
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);

function DevelopmentModeNotice() {
  if (__DEV__) {
    const learnMoreButton = (
      <Text onPress={handleLearnMorePress} style={styles.helpLinkText}>
        Learn more
      </Text>
    );

    return (
      <Text style={styles.developmentModeText}>
        Development mode is enabled: your app will be slower but you can use
        useful development tools. {learnMoreButton}
      </Text>
    );
  } else {
    return (
      <Text style={styles.developmentModeText}>
        You are not in development mode: your app will run at full speed.
      </Text>
    );
  }
}

function handleLearnMorePress() {
  requestAccountAddress({
    callback: Linking.makeUrl("/home/test"),
    requestId: "test",
    dappName: "My Dapps"
  });
}

function handleHelpPress() {
  handleLearnMorePress();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  developmentModeText: {
    marginBottom: 20,
    color: "rgba(0,0,0,0.4)",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center"
  },
  contentContainer: {
    paddingTop: 15,
    padding: 15
  },
  circleName: {
    fontSize: 30,
    marginBottom: 10,
    paddingRight: 150,
    fontWeight: "100"
  },
  circleBalance: {
    fontSize: 30,
    marginBottom: 10,
    fontWeight: "100"
  },
  welcomeContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20
  },
  welcomeImage: {
    width: 200,
    height: 160,
    resizeMode: "contain",
    marginTop: 3,
    marginLeft: -10
  },
  homeImage: {
    width: 75,
    height: 60,
    resizeMode: "contain",
    marginTop: 3,
    marginLeft: -10
  },
  getStartedContainer: {
    alignItems: "center",
    marginHorizontal: 50,
    paddingBottom: 20
  },
  circleDisplay: {
    backgroundColor: "#f4e3b7",
    marginBottom: 2,
    marginTop: 2,
    borderRadius: 4,
    justifyContent: "space-between",
    flexDirection: "row"
  },
  homeScreenFilename: {
    marginVertical: 7
  },
  bar: {
    fontWeight: "bold",
    alignItems: "stretch",
    flexDirection: "column"
  },
  merchTitle: {
    fontSize: 28
  },
  codeHighlightText: {
    color: "rgba(96,100,109, 0.8)"
  },
  codeHighlightContainer: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 3,
    paddingHorizontal: 4
  },
  getStartedText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    lineHeight: 24,
    textAlign: "center"
  },
  tabBarInfoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3
      },
      android: {
        elevation: 20
      }
    }),
    alignItems: "center",
    backgroundColor: "#fbfbfb",
    paddingVertical: 20
  },
  goldBalance: {
    fontSize: 36,
    marginBottom: 20,
    fontWeight: "200",
    color: "#E5B94C"
  },
  tabBarInfoText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    textAlign: "center"
  },
  navigationFilename: {
    marginTop: 5
  },
  helpContainer: {
    marginTop: 15,
    padding: 15,
    alignItems: "center"
  },
  helpContainerNoPad: {
    marginTop: 5,
    padding: 15,
    alignItems: "stretch",
    flexDirection: "column"
  },
  alignedItem: {
    flexDirection: "row",
    justifyContent: "center"
  },
  alignedColItem: {
    flexDirection: "column"
  },
  buttonContainer: {
    marginTop: 45,
    alignItems: "center"
  },
  helpLink: {
    paddingVertical: 15
  },
  helpHeaderText: {
    fontSize: 20,
    textAlign: "center"
  },
  helpText: {
    fontSize: 14,
    textAlign: "center"
  },
  helpLinkText: {
    fontSize: 14,
    color: "#2e78b7"
  }
});
