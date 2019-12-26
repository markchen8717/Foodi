import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import SearchIngredientsPage from './Screens/SearchIngredientsPage';
import ScanIngredientsPage from './Screens/ScanIngredientsPage';
import HomePage from './Screens/HomePage';

export default function App() {

  const [page, setPage] = useState("HomePage");

  var content = null;

  if (page == "ScanIngredientsPage") {
    content = <ScanIngredientsPage setPage={setPage} />;
  }
  else if (page == "HomePage") {
    content = <HomePage setPage={setPage} />;
  }
  else if (page == "SearchIngredientsPage") {
    content = <SearchIngredientsPage setPage={setPage} />;
  }
  return (
    content
  );
}
