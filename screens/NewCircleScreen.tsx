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
import { addCircle } from "../savingscircle";
import { getContacts } from "../account";
import { RootState } from "../store";
import { NavigationScreenProps, NavigationParams } from "react-navigation";
import { PhoneNumberMappingEntry } from "@celo/dappkit";
import { Contact } from "expo-contacts";

interface OwnProps extends NavigationScreenProps<NavigationParams>{
  errorMessage?: string;
  accountAddress: string,
  contacts: { [id: string]: Contact }
}

class NewCircleScreen extends React.Component<OwnProps, {}> {

  constructor(props) {
    super(props);

    this.state = {
      name: "",
      members: [{ address: this.props.accountAddress, self: true }]
    };
  }

  static navigationOptions = () => ({
    title: "Add Circle"
  })
  changeName = (name: string) => {
    this.setState({ name });
  };

  addMember = (entry: PhoneNumberMappingEntry) => {
    this.setState(prevState => ({
      ...prevState,
      // @ts-ignore
      members: [...prevState.members, entry]
    }))
  }

  openAddMember = async () => {
    const { status } = await Permissions.askAsync(Permissions.CONTACTS);

    if (status == Permissions.PermissionStatus.GRANTED) {
      this.props.getContacts()
      this.props.navigation.navigate('AddMember', { addMember: this.addMember })
    }
  };

  onAddCircle = () => {
    this.props.addCircle(this.state.name, this.state.members.map(member => member.address))
    this.props.navigation.goBack()
  }

  renderMemberName = (member: PhoneNumberMappingEntry)  => {
    if (member.id === undefined || this.props.contacts[member.id] === undefined) {
      return "Someone else"
    }

    const contact = this.props.contacts[member.id]
    return contact.name
  }

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
          <Text>
            {member.address === this.props.accountAddress
              ? "You"
              : this.renderMemberName(member)}
          </Text>
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
              <Input style={styles.nameInput} value={this.state.name} placeholder="Circle Name" onChangeText={this.changeName} />
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

const mapStateToProps = (state: RootState) => ({
  accountAddress: state.account.address,
  contacts: state.account.rawContacts
});

const mapDispatchToProps = {
  addCircle,
  getContacts
}
export default connect(mapStateToProps, mapDispatchToProps)(NewCircleScreen);


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
