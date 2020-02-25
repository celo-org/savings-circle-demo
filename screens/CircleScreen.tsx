import { getContactForAddress } from "@celo/dappkit";
import { Contact } from "expo-contacts";
import * as Permissions from "expo-permissions";
import { List, Text } from "native-base";
import React from "react";
import { StyleSheet, TouchableHighlight, View } from "react-native";
import { connect } from "react-redux";
import { AddressMappingType, prettyBalance } from "../account";
import { CircleScreenProps } from "../navigation/MainTabNavigator";
import {
  CircleInfo,
  contributeToCircle,
  fetchCircles,
  withdrawFromCircle
} from "../savingscircle";
import { RootState } from "../store";

type OwnProps = {
  errorMessage?: string;
} & CircleScreenProps;
interface StateProps {
  circle: CircleInfo;
  contacts: { [id: string]: Contact };
  addressMapping: AddressMappingType;
  accountAddress: string;
}

interface DispatchProps {
  contributeToCircle: typeof contributeToCircle;
  withdrawFromCircle: typeof withdrawFromCircle;
  fetchCircles: typeof fetchCircles;
}

type Props = StateProps & OwnProps & DispatchProps;

class CircleScreen extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  static navigationOptions = ({ navigation }) => ({
    title: navigation.state.params.circle
  });
  changeName = (name: string) => {
    this.setState({ name });
  };

  addMember = async () => {
    const { status } = await Permissions.askAsync(Permissions.CONTACTS);

    if (status == Permissions.PermissionStatus.GRANTED) {
    }
  };

  componentDidMount = () => {
    this.props.fetchCircles();
  };

  contributeOrWithdraw = () => {
    if (this.withdrawable()) {
      this.props.withdrawFromCircle(this.props.circle.circleHash);
    } else {
      this.props.contributeToCircle(
        this.props.circle.depositAmount,
        this.props.circle.circleHash
      );
    }
  };

  contribute = () => {
    this.props.contributeToCircle(
      this.props.circle.depositAmount,
      this.props.circle.circleHash
    );
  };

  renderMemberList = () => {
    const members = Object.keys(this.props.circle.members).map(
      memberAddress => {
        const contact = getContactForAddress(
          memberAddress,
          this.props.contacts,
          this.props.addressMapping
        );
        return (
          <Text key={memberAddress} style={styles.member}>
            {contact ? contact.firstName : memberAddress}

            {memberAddress.toLowerCase() ===
            this.props.accountAddress.toLowerCase()
              ? " (You)"
              : ""}
          </Text>
        );
      }
    );

    return members;
  };

  withdrawable = () => {
    return (
      Object.keys(this.props.circle.members)[
        this.props.circle.currentIndex
      ].toLowerCase() === this.props.accountAddress
    );
  };

  render() {
    const eligibleWithdrawAmount =
      (Object.keys(this.props.circle.members).length - 1) *
      parseFloat(this.props.circle.depositAmount);

    return (
      <View style={styles.container}>
        <View style={styles.scrollContainer}>
          <Text style={styles.totalsavings}>Total Savings</Text>
          <Text style={styles.balance}>
            {this.props.circle.totalBalance} cGLD
          </Text>
          <View style={styles.memberList}>
            <Text style={styles.memberTitle}>Members:</Text>
            <List>{this.renderMemberList()}</List>
          </View>
        </View>

        <View style={styles.center}>
          <Text style={styles.subtitle}>It’s your turn to withdraw.</Text>
          <Text style={styles.subtitle}>
            Withdraw or Contribute more below.
          </Text>

          <TouchableHighlight
            onPress={this.contributeOrWithdraw}
            disabled={!this.withdrawable()}
          >
            <View
              style={[
                styles.button,
                !this.withdrawable() ? { backgroundColor: "#CAD7DB" } : null
              ]}
            >
              <Text style={styles.buttonText}>
                Withdraw {prettyBalance(eligibleWithdrawAmount).toString()} cGLD
              </Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={this.contribute}>
            <View style={[styles.button]}>
              <Text style={styles.buttonText}>
                Contribute {this.props.circle.prettyDepositAmount} cGLD
              </Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state: RootState, props: OwnProps): StateProps => ({
  circle: state.savingsCircle.circles.find(
    circle => circle.name === props.route.params.circle
  ),
  contacts: state.account.rawContacts,
  addressMapping: state.account.addressMapping,
  accountAddress: state.account.address
});

const mapDispatchToProps = {
  contributeToCircle,
  withdrawFromCircle,
  fetchCircles
};

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(CircleScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: "#E5E5E5",
    justifyContent: "flex-start"
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20
  },
  center: {
    flex: 1,
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center"
  },
  totalsavings: {
    fontSize: 20,
    color: "#2B7086"
  },
  subtitle: {
    fontSize: 18,
    color: "#6AA1B2",
    fontWeight: "300",
    textAlign: "center"
  },
  name: {
    fontSize: 36
  },
  memberTitle: {
    fontSize: 15,
    color: "#2B7086",
    fontWeight: "600",
    borderBottomWidth: 1,
    padding: 10,
    paddingLeft: 20,
    marginBottom: 10,
    borderBottomColor: "#2B7086"
  },
  cta: {
    margin: 20
  },
  memberList: {
    marginTop: 30,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingBottom: 20,
    elevation: 4
  },
  member: {
    alignItems: "center",
    color: "#2B7086",
    margin: 2,
    fontSize: 15,
    marginLeft: 20
  },
  balance: {
    fontSize: 48,
    fontWeight: "600",
    color: "#2B7086"
  },
  header: {
    marginTop: 30,
    alignItems: "center"
  },
  addButton: {
    flex: 1
  },
  button: {
    backgroundColor: "#2B7086",
    borderRadius: 4,
    height: 50,
    width: 280,
    textAlign: "center",
    justifyContent: "center",
    margin: 10
  },
  buttonText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#fff"
  }
});
