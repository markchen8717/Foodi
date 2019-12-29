import React, { useEffect, useState, Fragment, PureComponent } from 'react';
import { Image, StyleSheet, Text, View, Button, Dimensions, } from 'react-native';
import IngredientsList from '../Components/IngredientsList';
import { filterWordListAsync, getIngredientsToDescriptionAsync } from '../API/APIFunctions';
import { getIngredientSearchResultsAsync } from '../API/Wiki';
import { useDebounce } from "use-debounce";
import { RNCamera } from 'react-native-camera';
import FillToAspectRatio from '../Components/FillToAspectRatio';
import ViewFinder from 'react-native-view-finder'


export default function ScanIngredientsPage() {

    const [textBlocks, setTextBlocks] = useState([]);
    const [barcodes, setBarcodes] = useState([]);
    const [torch, setTorch] = useState(false);
    const [data, setData] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [viewFinderWidth, setViewFinderWidth] = useState(0);
    const [viewFinderHeight, setViewFinderHeight] = useState(0);


    const handleBarCodeRead = (obj) => {
        setBarcodes(obj["barcodes"]);

    }
    const renderBarcodes = () => (
        <View style={style.facesContainer} pointerEvents="none">
            {barcodes.map(renderBarcode)}
        </View>
    );

    const renderBarcode = ({ bounds, data, type }) => (
        <Fragment key={data + bounds.origin.x}>
            <View
                style={[
                    style.text,
                    {
                        ...bounds.size,
                        left: bounds.origin.x,
                        top: bounds.origin.y,
                    },
                ]}
            >
                <Text style={[style.textBlock]}>{`${data} ${type}`}</Text>
            </View>
        </Fragment>
    );

    const measureViewFinderDimensions = (event) => {

        setViewFinderHeight(parseInt(0.90 * parseFloat(event.nativeEvent.layout.height)));
        setViewFinderWidth(parseInt(0.95 * parseFloat(event.nativeEvent.layout.width)));
    };



    const handleTextRead = (obj) => {
        setTextBlocks(obj["textBlocks"]);
    }
    const renderTextBlocks = () => (
        <View style={style.facesContainer} pointerEvents="none">
            {textBlocks.map(renderTextBlock)}
        </View>
    );

    const renderTextBlock = ({ bounds, value }) => (
        <Fragment key={value + bounds.origin.x}>
            <Text style={[style.textBlock, { left: bounds.origin.x, top: bounds.origin.y }]}>
                {value}
            </Text>
            <View
                style={[
                    style.text,
                    {
                        ...bounds.size,
                        left: bounds.origin.x,
                        top: bounds.origin.y,
                    },
                ]}
            />
        </Fragment>
    );

    return (
        <View style={style.container}>
            <View style={style.camera} onLayout={(event) => measureViewFinderDimensions(event)} >

                <FillToAspectRatio style={style.camera}>
                    <RNCamera
                        autoFocus={RNCamera.Constants.AutoFocus.on}
                        captureAudio={false}
                        onFacesDetected={null}
                        style={style.camera}

                        type={RNCamera.Constants.Type.back}
                        flashMode={torch ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
                        androidCameraPermissionOptions={{
                            title: 'Permission to use camera',
                            message: 'We need your permission to use your camera',
                            buttonPositive: 'Ok',
                            buttonNegative: 'Cancel',
                        }}
                        onGoogleVisionBarcodesDetected={handleBarCodeRead}
                        googleVisionBarcodeType={RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType.ALL}
                        onTextRecognized={handleTextRead}
                    >
                        <ViewFinder backgroundColor="transparent" loading={isSearching} height={viewFinderHeight} width={viewFinderWidth} />


                        {renderTextBlocks()}
                        {renderBarcodes()}

                    </RNCamera>

                </FillToAspectRatio>
            </View>


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
    camera: {
        height: "100%",
        width: "100%",
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center'
    },
    textBlock: {
        color: '#F00',
        position: 'absolute',
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    ingredients_lst: {
        flex: 4,
        borderBottomStartRadius: 20,
        borderBottomEndRadius: 20,
        overflow: 'hidden',
    },
    facesContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        top: 0,
    },
    text: {
        padding: 10,
        borderWidth: 2,
        borderRadius: 2,
        position: 'absolute',
        borderColor: '#F00',
        justifyContent: 'center',
    },
});
