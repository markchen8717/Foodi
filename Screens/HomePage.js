import React from 'react';
import { Image, StyleSheet, Text, Dimensions, ImageBackground, TouchableOpacity } from 'react-native';


const nlp = require('compromise');

export default function HomePage(props) {

    handleScanButton = async () => {
        props.setPage("ScanIngredientsPage");

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
        paddingHorizontal: "10%",
        paddingVertical: "10%",
        flexDirection: 'column',
        alignItems: 'center',
    },
    logo: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1.25,
        height: "100%",
        width: "100%",
        aspectRatio: 1 / 1,
        // backgroundColor:'green',
        // margin:'10%',

    },
    scan_button_container: {


        // backgroundColor: 'red',
        flex: 1.1,
        alignItems: 'center',
        justifyContent: 'center',
        margin: '5%',

    },
    search_button_container: {

        //backgroundColor: 'blue',
        flex: 1.1,
        alignItems: 'center',
        justifyContent: 'center',
        margin: '5%',

    },
    button_image: {
        height: "100%",
        width: "100%",
        aspectRatio: 1 / 1,
        borderRadius: 20,
    }
});