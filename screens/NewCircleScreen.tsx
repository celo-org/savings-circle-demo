import { PhoneNumberMappingEntry } from "@celo/dappkit";
import * as Permissions from "expo-permissions";
import {
  Body,
  Button,
  Form,
  Input,
  Item,
  Left,
  List,
  Right,
  Text
} from "native-base";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { connect } from "react-redux";
import { ContactMappingType, getContacts } from "../account";
import { NewCircleScreenProps } from "../navigation/MainTabNavigator";
import { addCircle } from "../savingscircle";
import { RootState } from "../store";

interface OwnProps {
  errorMessage?: string;
}

interface StateProps {
  accountAddress: string;
  contacts: ContactMappingType;
}

interface Member {
  address: string;
  self: boolean;
  id?: undefined;
}

interface State {
  name: string;
  members: (Member | PhoneNumberMappingEntry)[];
}

interface DispatchProps {
  addCircle: typeof addCircle;
  getContacts: typeof getContacts;
}

type Props = OwnProps & StateProps & DispatchProps & NewCircleScreenProps;
class NewCircleScreen extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      members: [{ address: this.props.accountAddress, self: true }]
    };
  }

  static navigationOptions = () => ({
    title: "Add Circle"
  });
  changeName = (name: string) => {
    this.setState({ name });
  };

  addMember = (entry: PhoneNumberMappingEntry) => {
    this.setState(prevState => ({
      ...prevState,
      members: [...prevState.members, entry]
    }));
  };

  openAddMember = async () => {
    const { status } = await Permissions.askAsync(Permissions.CONTACTS);

    if (status == Permissions.PermissionStatus.GRANTED) {
      this.props.getContacts();
      this.props.navigation.navigate("AddMember", {
        addMember: this.addMember
      });
    }
  };

  onAddCircle = () => {
    this.props.addCircle(
      this.state.name,
      this.state.members.map(member => member.address)
    );
    this.props.navigation.goBack();
  };

  renderMemberName = (member: PhoneNumberMappingEntry | Member) => {
    if (member.address === this.props.accountAddress) {
      return "You";
    }

    if (
      member.id === undefined ||
      this.props.contacts[member.id] === undefined
    ) {
      return "Someone else";
    }

    const contact = this.props.contacts[member.id];
    return contact.name;
  };

  renderMemberList = () => {
    if (this.state.members.length == 0) {
      return (
        <Item>
          <Text>No members.</Text>
        </Item>
      );
    }

    const members = this.state.members.map(member => (
      <View key={member.address}>
        <Left />
        <Body>
          <Text>{this.renderMemberName(member)}</Text>
          <Text note> {member.address}</Text>
        </Body>
        <Right />
      </View>
    ));

    return <List>{members}</List>;
  };

  render() {
    return (
      <View style={[styles.container, styles.alignedItem]}>
        <ScrollView>
          {/**
           * Go ahead and delete ExpoLinksView and replace it with your content;
           * we just wanted to provide you with some helpful links.
           */}
          <Form style={styles.form}>
            <View style={styles.nameContainer}>
              <Input
                style={styles.nameInput}
                value={this.state.name}
                placeholder="Circle Name"
                onChangeText={this.changeName}
              />
            </View>

            <View style={styles.memberTitle}>
              <Button primary onPress={this.openAddMember}>
                <Text>+Add member</Text>
              </Button>
            </View>

            <View style={styles.memberTitle}>
              <Text style={styles.memberText}>Members:</Text>
            </View>
            {this.renderMemberList()}
          </Form>
        </ScrollView>
        <View style={styles.memberTitle}>
          <Button primary onPress={this.onAddCircle}>
            <Text> Add Circle </Text>
          </Button>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state: RootState): StateProps => ({
  accountAddress: state.account.address,
  contacts: state.account.rawContacts
});

const mapDispatchToProps = {
  addCircle,
  getContacts
};
export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(NewCircleScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: "#fff"
  },
  memberTitle: {
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 20
  },
  nameContainer: {
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ecce81",
    margin: 20
  },
  memberText: {
    fontSize: 20,
    paddingTop: 10,
    paddingBottom: 10
  },
  nameInput: {
    textAlign: "center"
  },
  form: {
    flex: 1
  },
  alignedItem: {
    flexDirection: "column",
    justifyContent: "center"
  }
});
