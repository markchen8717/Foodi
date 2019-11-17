import React from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import Accordian from './Components/Accordian'

var ingrdnts_to_description = [
  { 'Soy Sauce': 'A Chinese sauce' },
  { 'Ponzu': 'Lemon juice + Soy Sauce' }
];

export default function App() {
  return (

    <View style={styles.container}>
      {ingrdnts_to_description.map((obj) => {
        let key = Object.keys(obj)[0];
        return <Accordian key={key} title={key} data={obj[key]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,

  }
});
