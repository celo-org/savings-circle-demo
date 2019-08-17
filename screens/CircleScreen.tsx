import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Container,
  Header,
  Content,
  Footer,
  Left,
  Button,
  Icon,
  FooterTab,
  Body,
  Title,
  Right,
  Form,
  Item,
  Input,
  Label,
  List,
  Text,
  ListItem
} from "native-base";
import { connect } from "react-redux";
import * as Permissions from "expo-permissions";
import {
  contributeToCircle,
  withdrawFromCircle,
  fetchCircles,
  CircleInfo
} from "../savingscircle";
import { RootState } from "../store";
import { NavigationScreenProps, NavigationParams } from "react-navigation";
import moment from "moment";
import { getContactForAddress, prettyBalance } from "../account";

interface OwnProps {
  errorMessage?: string;
  navigation?: NavigationScreenProps<NavigationParams>;
  circle: CircleInfo;
}

class CircleScreen extends React.Component<OwnProps, {}> {
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
    this.props.fetchCircles()
  }

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

  renderMemberList = () => {
    const members = Object.entries(this.props.circle.members).map(
      ([memberAddress, memberBalance], index) => {
        const contact = getContactForAddress(
          memberAddress,
          this.props.contacts,
          this.props.addressMapping
        );
        return (
          <ListItem avatar key={memberAddress} style={styles.member}>
            <Left />
            <Body>
              <Text>
                {memberAddress.toLowerCase() === this.props.accountAddress.toLowerCase()
                  ? "You "
                  : contact
                  ? contact.name
                  : "Someone else"}
                ({prettyBalance(memberBalance).toString()} cGLD)
              </Text>
              { index === this.props.circle.currentIndex ? (<Text>Turn to withdraw</Text>) : null }
              <Text note>{memberAddress}</Text>
            </Body>
            <Right />
          </ListItem>
        );
      }
    );

    return <List>{members}</List>;
  };

  withdrawable = () => {
    return Object.keys(this.props.circle.members)[this.props.circle.currentIndex].toLowerCase() === this.props.accountAddress
  }

  render() {
    const eligibleWithdrawAmount =
      (Object.keys(this.props.circle.members).length -1)*
      this.props.circle.depositAmount;
    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.header}>
            <Text style={styles.name}>{this.props.circle.name}</Text>
            <Text style={styles.balance}>
              {this.props.circle.totalBalance} cGLD
            </Text>
            <Text style={styles.lastUpdated}>
              Last Updated: {moment.unix(this.props.circle.timestamp).fromNow()}
            </Text>

            <Button
              primary
              onPress={this.contributeOrWithdraw}
              style={styles.cta}
            >
              <Text>
                {" "}
                {this.withdrawable()
                  ? "Withdraw " + prettyBalance(eligibleWithdrawAmount)
                  : "Contribute " + this.props.circle.prettyDepositAmount}{" "}
                cGLD
              </Text>
            </Button>
          </View>

          <View style={styles.memberList}>
            <Text style={styles.memberTitle}>Members:</Text>
          </View>
          <List>
            {this.renderMemberList()}
          </List>

        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state: RootState, props: OwnProps) => ({
  circle: state.savingsCircle.circles.find(
    circle => circle.name === props.navigation.state.params.circle
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
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CircleScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: "#fff"
  },
  name: {
    fontSize: 36
  },
  memberTitle: {
    fontSize: 20
  },
  cta: {
    margin: 20
  },
  memberList: {
    margin: 20,
    fontSize: 24,
    alignItems: "center"
  },
  member: {
    alignItems: "center"
  },
  balance: {
    fontSize: 30,
    fontWeight: "200",
    color: "#E5B94C"
  },
  lastUpdated: {
    fontSize: 10
  },
  header: {
    marginTop: 30,
    alignItems: "center"
  },
  addButton: {
    flex: 1,
    justifyContent: "flex-end"
  }
});
