import React, { useEffect, useState, Fragment, PureComponent } from 'react';
import { Image, StyleSheet, Text, View, Button, TextInput, Dimensions, FlatList, ScrollView, ImageBackground, TouchableOpacity, MaskedViewIOS } from 'react-native';
import IngredientsList from '../Components/IngredientsList';
import { filterWordListAsync, getIngredientsToDescriptionAsync } from '../API/APIFunctions';
import { getIngredientSearchResultsAsync } from '../API/Wiki';
import { useDebounce } from "use-debounce";
import { RNCamera } from 'react-native-camera';

export default function ScanIngredientsPage() {

    const [torch, setTorch] = useState(false);
    const [data, setData] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleBarCodeRead = (barcode) => {
        setIsSearching(true);
        
        console.log(barcode);
    }
    const handleTextRead = (text) => {
        setIsSearching(true);
        console.log(text);
    }

    return (
        <View style={style.container}>

            <RNCamera
                autoFocus={RNCamera.Constants.AutoFocus.on}
                captureAudio={false}
                style={style.preview}
                type={RNCamera.Constants.Type.back}
                flashMode={torch ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
                androidCameraPermissionOptions={{
                    title: 'Permission to use camera',
                    message: 'We need your permission to use your camera',
                    buttonPositive: 'Ok',
                    buttonNegative: 'Cancel',
                }}
                onBarCodeRead={handleBarCodeRead}
                onTextRecognized={handleTextRead}
            />

            <View style={style.ingredients_lst}>
                <IngredientsList is_searching={isSearching} ingrdnts_to_dscrption={data} />
            </View>

        </View>
    );
}



const { width: winWidth, height: winHeight } = Dimensions.get('window');
const style = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: "column",
        height: winHeight,
        width: winWidth,
        paddingBottom: '5%',
        paddingLeft: '2.5%',
        paddingRight: '2.5%',
        paddingTop: '2.5%',
        backgroundColor: '#FFA07A',
        overflow: 'hidden',
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    ingredients_lst: {
        flex: 4,
        borderBottomStartRadius: 20,
        borderBottomEndRadius: 20,
        overflow: 'hidden',
    }
});
