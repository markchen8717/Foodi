import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import IngredientsPage from './Screens/IngredientsPage';
import CameraPage from './Screens/CameraPage';

var ingrdnts_to_description = [
  { 'Soy Sauce': 'A Chinese sauce' },
  { 'Ponzu': 'Lemon juice + Soy Sauce' }
];

export default function App() {

  const [ingrdnts, setIngrdnts] = useState(ingrdnts_to_description);
  var content = <CameraPage />;
  //Once picture is taken render ingredients page
  if (false) {
    content = <IngredientsPage ingrdnts={ingrdnts} />;
  }
  return (
    content
  );
}
