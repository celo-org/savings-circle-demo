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
import { getContacts, PhoneNumberMappingEntry } from "../account";
import { RootState } from "../store";
import { NavigationScreenProps, NavigationParams } from "react-navigation";

interface OwnProps extends NavigationScreenProps<NavigationParams>{
  errorMessage?: string;
}

class NewCircleScreen extends React.Component<OwnProps, {}> {

  constructor(props) {
    super(props);

    this.state = {
      name: "",
      members: [this.props.accountAddress]
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
      members: [...prevState.members, entry.address]
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
    this.props.addCircle(this.state.name, this.state.members)
    this.props.navigation.goBack()
  }

  renderMemberList = () => {
    if (this.state.members.length == 0) {
      return (
        <Item>
          <Text>No members.</Text>
        </Item>
      );
    }

    const members = this.state.members.map(memberAddress => (
      <View key={memberAddress}>
        <Left />
        <Body>
          <Text>
            {memberAddress === this.props.accountAddress
              ? "You"
              : "Someone else"}
          </Text>
          <Text note> {memberAddress}</Text>
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
  accountAddress: state.account.address
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
