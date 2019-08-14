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
import { RootState } from "../store";
import { hasAccount, setAccount, logout } from "../account";
import { requestAccountAddress, listenToAccount, listenToSignedTxs } from "@celo/dappkit";
import { sendAddCircleTx, CircleInfo } from "../savingscircle";
import { ListItem, Left, Body, Right, List, Text, Button } from "native-base";
import { Linking } from "expo";
class HomeScreen extends React.Component<{ circles: CircleInfo[] }> {

  static navigationOptions = (_any) => {
    return {
      title: "Savings Circle"
    };
  };

  componentDidMount() {
    listenToAccount(this.props.setAccount)
    listenToSignedTxs(this.props.sendAddCircleTx)
  }

  handleNewCirclePress = () => {
    this.props.navigation.navigate('NewCircle')
  }

  renderCircleList = () => {
    return this.props.circles.map((circle) => (
      <ListItem key={circle.name}>
        <Left></Left>
        <Body>
          <Text>{ circle.name }</Text>
          <Text note> { circle.members.length } members</Text>
        </Body>
        <Right></Right>
      </ListItem>
    ))
  }

  handleLogout = () => {
    this.props.logout()
  }
  render() {

    if (this.props.hasAddress) {
      return (
        <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.welcomeContainer}>
            <Image
              source={
                __DEV__
                  ? require("../assets/images/robot-dev.png")
                  : require("../assets/images/robot-prod.png")
              }
              style={styles.welcomeImage}
            />
          </View>

          <View style={styles.getStartedContainer}>
            <Text style={styles.getStartedText}>
              Celo
            </Text>
          </View>

          <View style={styles.helpContainer}>
              <Text>
                Your account address is {this.props.address}
              </Text>
          </View>

          <View style={styles.helpContainer}>
              <Text>
                Your stable balance is  {this.props.stableBalance.toString() } cUSD and your gold balance is {this.props.goldBalance.toString()}
              </Text>
          </View>

          <View style={styles.helpContainer}>
              <Text>
                You are part of { this.props.circles.length } savings circles.
              </Text>
          </View>

          <List>
              { this.renderCircleList() }
          </List>

          <View style={styles.helpContainer}>
            <TouchableOpacity onPress={this.handleNewCirclePress} style={styles.helpLink}>
              <Text style={styles.helpLinkText}>
                Create new savings circle.
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.helpContainer}>
            <Button danger onPress={this.handleLogout}>
              <Text style={styles.helpLinkText}>
                Logout
              </Text>
            </Button>
          </View>
        </ScrollView>
      </View>
      )
    }

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.welcomeContainer}>
            <Image
              source={
                __DEV__
                  ? require("../assets/images/robot-dev.png")
                  : require("../assets/images/robot-prod.png")
              }
              style={styles.welcomeImage}
            />
          </View>

          <View style={styles.getStartedContainer}>
            <Text style={styles.getStartedText}>
              Celo
            </Text>
          </View>

          <View style={styles.helpContainer}>
            <TouchableOpacity onPress={handleHelpPress} style={styles.helpLink}>
              <Text style={styles.helpLinkText}>
                Request address from wallet
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

      </View>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  console.log(state);
  return {
    hasAddress: hasAccount(state),
    ...state.account,
    circles: state.savingsCircle.circles
  };
};

const mapDispatchToProps = {
  setAccount,
  sendAddCircleTx,
  logout
}

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
    callback: Linking.makeUrl('/home/test'),
    requestId: 'test',
    dappName: 'My Dapps'
  })
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
    paddingTop: 30
  },
  welcomeContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: "contain",
    marginTop: 3,
    marginLeft: -10
  },
  getStartedContainer: {
    alignItems: "center",
    marginHorizontal: 50
  },
  homeScreenFilename: {
    marginVertical: 7
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
    alignItems: "center"
  },
  helpLink: {
    paddingVertical: 15
  },
  helpLinkText: {
    fontSize: 14,
    color: "#2e78b7"
  }
});
