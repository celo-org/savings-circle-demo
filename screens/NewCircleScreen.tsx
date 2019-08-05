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
import { RootState } from "../store";

class NewCircleScreen extends React.Component {

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

  addMember = async () => {
    const { status } = await Permissions.askAsync(Permissions.CONTACTS);

    if (status == Permissions.PermissionStatus.GRANTED) {
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
          <Text>No member.</Text>
        </Item>
      );
    }

    const members = this.state.members.map(memberAddress => (
      <ListItem avatar key={memberAddress}>
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
      </ListItem>
    ));

    return <List>{members}</List>;
  };

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          {/**
           * Go ahead and delete ExpoLinksView and replace it with your content;
           * we just wanted to provide you with some helpful links.
           */}
          <Form style={styles.form}>
            <Item stackedLabel>
              <Label>Name</Label>
              <Input value={this.state.name} onChangeText={this.changeName} />
            </Item>

            <Item stackedLabel>
              <Label>Members</Label>
            </Item>

            {this.renderMemberList()}

            <Button full light onPress={this.addMember}>
              <Text>Add member</Text>
            </Button>
          </Form>
        </ScrollView>
        <Footer>
          <Button primary onPress={this.onAddCircle}>
            <Text> Add Circle </Text>
          </Button>
        </Footer>
      </View>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  accountAddress: state.account.address
});

const mapDispatchToProps = {
  addCircle
}
export default connect(mapStateToProps, mapDispatchToProps)(NewCircleScreen);


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
