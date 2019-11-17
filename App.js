import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import IngredientsPage from './Screens/IngredientsPage'
import CameraPage from './Screens/CameraPage'


var ingrdnts_to_description = [
  { 'Soy Sauce': 'A Chinese sauce' },
  { 'Ponzu': 'Lemon juice + Soy Sauce' }
];

export default function App() {
  const [ingrdnts, setIngrdnts] = useState(ingrdnts_to_description);
  let content = <CameraPage/>;
  if (true){
    content = <IngredientsPage ingrdnts = {ingrdnts}/>;
  }
  return (
    <View>
      {content}
    </View>
  );
}
