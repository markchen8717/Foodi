import React, { useState, Fragment } from 'react';
import { Image, StyleSheet, Text, Dimensions,ImageBackground, TouchableOpacity} from 'react-native';

import {getIngredientDescriptionFromWikiAsync} from '../API/Wiki';
const nlp = require('compromise');

export default function HomePage(props) {

    handleScanButton = async () => {
        //console.log(await getIngredientDescriptionFromWikiAsync("Laver"));
        // await getFilteredWordListAsync(["par fried,"]);
        // const barcode_to_ing = await getIngredientsListFromBarcodeAsync("737628064502");
        // console.log(barcode_to_ing);
        // const filter_list = await getFilteredWordListAsync(barcode_to_ing);
        // console.log(filter_list);
        props.setPage("ScanIngredientsPage");
        // console.log(nlp("par fried").nouns().toSingular().out());
    }
    handleSearchButton = async () => {
        props.setPage("SearchIngredientsPage");
    }

    return (
        <ImageBackground source={require('../Images/HomePage_background.jpg')} style={style.container}>
            <Image
                    style={style.logo}
                    source={require('../Images/HomePage_logo.png')}
                />
            <TouchableOpacity onPress={handleScanButton} style={style.scan_button_container}>
                <Image
                    style={style.button_image}
                    source={require('../Images/HomePage_scan_button.jpg')}
                />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSearchButton} style={style.search_button_container}>
                <Image
                    style={style.button_image}
                    source={require('../Images/HomePage_search_button.jpg')}
                />
            </TouchableOpacity>
        </ImageBackground>
    );
}

const { width: winWidth, height: winHeight } = Dimensions.get('window');
const style = StyleSheet.create({
    container: {
        height: winHeight,
        width: winWidth,
        paddingHorizontal:"10%",
        paddingVertical:"10%",
        flexDirection:'column',
        alignItems:'center',
    },
    logo:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        flex:1.25,
        height:"100%",
        width:"100%",
        aspectRatio: 1/1, 
        // backgroundColor:'green',
        // margin:'10%',

    },
    scan_button_container: {


        // backgroundColor: 'red',
        flex: 1.1,
        alignItems:'center',
        justifyContent:'center',
        margin: '5%',

    },
    search_button_container: {

        //backgroundColor: 'blue',
        flex: 1.1,
        alignItems:'center',
        justifyContent:'center',
        margin: '5%',

    },
    button_image: {
        height:"100%",
        width:"100%",
        aspectRatio: 1/1, 
        borderRadius: 20,
    }
});