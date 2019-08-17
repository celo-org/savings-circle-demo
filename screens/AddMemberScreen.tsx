import React from "react";
import { ScrollView, StyleSheet, View , TouchableOpacity} from "react-native";
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
import { addCircle } from "../savingscircle";
import { RootState } from "../store";
import { NavigationScreenProps, NavigationParams } from "react-navigation";
import { Contact } from "expo-contacts";
import { Dictionary } from "underscore";
import { PhoneNumberMappingEntry } from "@celo/dappkit";
import { parsePhoneNumber } from "libphonenumber-js";
interface OwnProps extends NavigationScreenProps<NavigationParams> {
  errorMessage?: string;
  rawContacts: { [id: string]: Contact };
  addressMapping: Dictionary<PhoneNumberMappingEntry>;
}

class AddMemberScreen extends React.Component<OwnProps, {}> {
  static navigationOptions  = () => ({
    title: "Add Member"
  });

  addMember = (entry: PhoneNumberMappingEntry) => {
    return () => {
      this.props.navigation.state.params.addMember(entry)
      this.props.navigation.goBack()
    }
  }

  renderList = () => {
    return Object.values(this.props.addressMapping).map(addressData => {
      const contact = this.props.rawContacts[addressData.id];
      return (
        <ListItem key={addressData.address + addressData.phoneNumber}>
          <TouchableOpacity onPress={this.addMember(addressData)}>
          <Body>
            <Text>{contact.name} ({parsePhoneNumber(addressData.phoneNumber).formatInternational()})</Text>
            <Text note>{addressData.address}</Text>
            <Text note>Completed {addressData.attestationStat.completed}/{addressData.attestationStat.total} attestations</Text>
          </Body>
          </TouchableOpacity>
        </ListItem>
      );
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <List>{this.renderList()}</List>
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  accountAddress: state.account.address,
  rawContacts: state.account.rawContacts,
  addressMapping: state.account.addressMapping
});

const mapDispatchToProps = {
  addCircle
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddMemberScreen);

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
