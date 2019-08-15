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
import { contributeToCircle, withdrawFromCircle, CircleInfo } from "../savingscircle";
import { RootState } from "../store";
import { NavigationScreenProps, NavigationParams } from "react-navigation";
import moment from "moment";

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

  contributeOrWithdraw = () => {
    if (this.props.circle.withdrawable) {
      this.props.withdrawFromCircle(this.props.circle.circleHash)
    } else {
      this.props.contributeToCircle(
        this.props.circle.depositAmount,
        this.props.circle.circleHash
      );
    }
  };

  renderMemberList = () => {
    const members = Object.entries(this.props.circle.members).map(
      ([memberAddress, memberBalance]) => (
        <ListItem avatar key={memberAddress}>
          <Left />
          <Body>
            <Text>
              {memberAddress === this.props.accountAddress
                ? "You "
                : "Someone else "}
              ({memberBalance.toString()} cUSD)
            </Text>
            <Text note>{this.props.accountAddress}</Text>
          </Body>
          <Right />
        </ListItem>
      )
    );

    return <List>{members}</List>;
  };

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <Form style={styles.form}>
            <Text>{JSON.stringify(this.props.circle)}</Text>
            <Item stackedLabel>
              <Label>Contribution Amount per member</Label>
              <Input
                value={`${this.props.circle.prettyDepositAmount} cUSD`}
                onChangeText={this.changeName}
              />
            </Item>

            <Item stackedLabel>
              <Label>Time of last action</Label>
              <Input
                value={moment.unix(this.props.circle.timestamp).fromNow()}
              />
            </Item>

            <Item stackedLabel>
              <Label>Members</Label>
            </Item>

            {this.renderMemberList()}
          </Form>
        </ScrollView>
        <Footer>
          <Button primary onPress={this.contributeOrWithdraw}>
            <Text> {this.props.circle.withdrawable ? "Withdraw" : "Contribute"} </Text>
          </Button>
        </Footer>
      </View>
    );
  }
}

const mapStateToProps = (state: RootState, props: OwnProps) => ({
  circle: state.savingsCircle.circles.find(
    circle => circle.name === props.navigation.state.params.circle
  ),
  accountAddress: state.account.address
});

const mapDispatchToProps = {
  contributeToCircle,
  withdrawFromCircle
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
  form: {
    flex: 1
  },
  addButton: {
    flex: 1,
    justifyContent: "flex-end"
  }
});
