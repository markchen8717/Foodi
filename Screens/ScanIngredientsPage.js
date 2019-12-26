import React, { useEffect, useState, Fragment } from 'react';
import { Image, StyleSheet, Text, View, Button, TextInput, Dimensions, FlatList, ScrollView, ImageBackground, TouchableOpacity, MaskedViewIOS } from 'react-native';
import IngredientsList from '../Components/IngredientsList';
import { SearchBar } from 'react-native-elements';
import { filterWordListAsync, getIngredientsToDescriptionAsync } from '../API/APIFunctions';
import { getIngredientSearchResultsAsync } from '../API/Wiki';
import { useDebounce } from "use-debounce";

export default function ScanIngredientsPage(props) {

    return(
        <Text>Scan Ingredients Page</Text>
    )
}
