import React, { useEffect, useState, Fragment } from 'react';
import { StyleSheet, Text, View, Button, Dimensions, Switch } from 'react-native';
import IngredientsList from '../Components/IngredientsList';
import { getFilteredWordListAsync, getIngredientsToDescriptionAsync } from '../API/APIFunctions';
import { RNCamera } from 'react-native-camera';
import FillToAspectRatio from '../Components/FillToAspectRatio';
import ViewFinder from 'react-native-view-finder'

export default function ScanIngredientsPage(props) {

    const [scannedWords, setScannedWords] = useState(new Set([]));
    const [scanner, setScanner] = useState(false);
    const [textBlocks, setTextBlocks] = useState([]);
    const [barcodes, setBarcodes] = useState([]);
    const [torch, setTorch] = useState(false);
    const [displayData, setDisplayData] = useState([]);
    const [newIngredients, setNewIngredients] = useState([]);
    const [newDisplayData, setNewDisplayData] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [viewFinderWidth, setViewFinderWidth] = useState(0);
    const [viewFinderHeight, setViewFinderHeight] = useState(0);
    const [unmount, setUnmount] = useState(false);

    const handleHomeButton = async () => {
        setUnmount(true);
        setTorch(false);
        setScanner(false);
        props.setPage("HomePage");
    };

    useEffect(()=>{
        const missing_data = newDisplayData.filter(x=>!displayData.map(x=>x.name).includes(x.name));
        if(!unmount)
            setDisplayData([...displayData,...missing_data]);
    },[newDisplayData]);

    useEffect(() => {
        const myAsyncFunction = async function () {
            const ingredients_shown = displayData.map(x => x.name);
            const missing_ingredients = newIngredients.filter(x => !ingredients_shown.includes(x));
            if (missing_ingredients.length > 0 && !unmount) {
                setIsSearching(true);
                const new_data = await getIngredientsToDescriptionAsync(missing_ingredients);
                setNewDisplayData(new_data);
                setIsSearching(false);
            }
        }
        if (!unmount)
            myAsyncFunction();
    }, [newIngredients]);

    useEffect(() => {
        const myAsyncFunction = async function () {
            let word_lst = [];
            for (let i = 0; i < textBlocks.length; i++) {
                const words1 = textBlocks[i].value.trim().split(",");
                const words2 = textBlocks[i].value.trim().split(" ");
                word_lst = [...word_lst, ...words1, ...words2];
            }
            const processed_word_lst = word_lst.filter(x => !scannedWords.has(x));

            if (!unmount) {
                const filtered_lst = await getFilteredWordListAsync(processed_word_lst);
                setScannedWords(new Set([...scannedWords, ...processed_word_lst]));
                setNewIngredients(filtered_lst);
            }
        }
        if (!unmount)
            myAsyncFunction();
    }, [textBlocks]);

    const handleBarCodeRead = (obj) => {
        if (!unmount)
            setBarcodes(obj["barcodes"]);
    };

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
        setUnmount(false);
        setViewFinderHeight(parseInt(0.90 * parseFloat(event.nativeEvent.layout.height)));
        setViewFinderWidth(parseInt(0.95 * parseFloat(event.nativeEvent.layout.width)));
    };

    const handleTextRead = (obj) => {
        const text_blocks_obj_arr = obj["textBlocks"];
        const filtered_text_blocks = text_blocks_obj_arr.filter(x => !scannedWords.has(x.value));
        if (!unmount) {
            setScannedWords(new Set([...scannedWords, ...filtered_text_blocks.map(x => x.value)]));
            setTextBlocks(filtered_text_blocks);
        }
    };

    const renderTextBlocks = () => (
        <View style={style.facesContainer} pointerEvents="none">
            {textBlocks.map(renderTextBlock)}
        </View>
    );

    const renderTextBlock = ({ bounds, value }) => {

        return (
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
    };

    return (
        <View style={style.container}>
            <View style={style.navBar}>
                <Button title="Home" onPress={handleHomeButton} />
                {scanner &&
                    <View stlye={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Text>TORCH:</Text>
                        <Switch
                            value={torch}
                            onChange={() => setTorch(!torch)}
                        />
                    </View>
                }
                <View stlye={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <Text>SCANNER:</Text>
                    <Switch
                        value={scanner}
                        onChange={() => { setScanner(!scanner); setTorch(false); }}
                    />
                </View>
            </View>
            {scanner &&
                <View style={style.camera} onLayout={(event) => measureViewFinderDimensions(event)} >
                    <FillToAspectRatio style={style.camera}>
                        <RNCamera
                            autoFocus={RNCamera.Constants.AutoFocus.on}
                            // autoFocusPointOfInterest={{ x: 0.5, y: 0.5 }}
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
                            onBarCodeRead={null}
                            onGoogleVisionBarcodesDetected={(scanner) ? handleBarCodeRead : null}
                            googleVisionBarcodeType={(scanner) ? RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType.ALL : null}
                            onTextRecognized={(scanner) ? handleTextRead : null}
                        >
                            <ViewFinder backgroundColor="transparent" loading={isSearching} height={viewFinderHeight} width={viewFinderWidth} />
                            {renderTextBlocks()}
                            {renderBarcodes()}
                        </RNCamera>
                    </FillToAspectRatio>
                </View>
            }
            <View style={style.ingredients_lst}>
                <IngredientsList is_searching={isSearching} ingrdnts_to_dscrption={displayData} />
            </View>
        </View>
    );
};

const { width: winWidth, height: winHeight } = Dimensions.get('window');
const style = StyleSheet.create({
    navBar: {
        paddingLeft: '2.5%',
        paddingRight: '2.5%',
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flex: 1.3,
        backgroundColor: 'white',
        borderTopEndRadius: 20,
        borderTopStartRadius: 20,
        overflow: 'hidden',
    },
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
        flex: 5,
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
        flex: 10,
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
