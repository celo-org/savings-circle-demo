import { PhoneNumberMappingEntry } from "@celo/dappkit";
import { Contact } from "expo-contacts";
import { parsePhoneNumber } from "libphonenumber-js";
import { Body, List, ListItem, Text } from "native-base";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";
import { Dictionary } from "underscore";
import { AddMemberScreenProps } from "../navigation/MainTabNavigator";
import { addCircle } from "../savingscircle";
import { RootState } from "../store";
interface OwnProps {
  errorMessage?: string;
  rawContacts: { [id: string]: Contact };
  addressMapping: Dictionary<PhoneNumberMappingEntry>;
}

type Props = OwnProps & AddMemberScreenProps;

class AddMemberScreen extends React.Component<Props> {
  static navigationOptions = () => ({
    title: "Add Member"
  });

  addMember = (entry: PhoneNumberMappingEntry) => {
    return () => {
      this.props.route.params.addMember(entry);
      this.props.navigation.goBack();
    };
  };

  renderList = () => {
    return Object.values(this.props.addressMapping).map(
      (addressData: PhoneNumberMappingEntry) => {
        const contact = this.props.rawContacts[addressData.id];
        return (
          <ListItem key={addressData.address + addressData.phoneNumber}>
            <TouchableOpacity onPress={this.addMember(addressData)}>
              <Body>
                <Text>
                  {contact.name} (
                  {parsePhoneNumber(
                    addressData.phoneNumber
                  ).formatInternational()}
                  )
                </Text>
                <Text note>{addressData.address}</Text>
                <Text note>
                  Completed {addressData.attestationStat.completed}/
                  {addressData.attestationStat.total} attestations
                </Text>
              </Body>
            </TouchableOpacity>
          </ListItem>
        );
      }
    );
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
export default connect(mapStateToProps, mapDispatchToProps)(AddMemberScreen);

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
