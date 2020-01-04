import React, { useEffect, useState, Fragment } from 'react';
import { StyleSheet, Text, View, Button, Dimensions, Switch } from 'react-native';
import IngredientsList from '../Components/IngredientsList';
import { getFilteredWordListAsync, getIngredientsToDescriptionAsync } from '../API/APIFunctions';
import { RNCamera } from 'react-native-camera';
import FillToAspectRatio from '../Components/FillToAspectRatio';
import ViewFinder from 'react-native-view-finder';
import { getIngredientsListFromBarcodeAsync } from '../API/OFF';
import Ad from '../Components/Ad'

export default function ScanIngredientsPage(props) {

    const [scannedWords, setScannedWords] = useState(new Set([]));
    const [scannedBarcodes, setScannedBarcodes] = useState(new Set([]));
    const [detecingBarcode, setDectectingBarcode] = useState(true);
    const [scanner, setScanner] = useState(false);
    const [textBlocks, setTextBlocks] = useState([]);
    const [barcodes, setBarcodes] = useState([]);
    const [torch, setTorch] = useState(false);
    const [displayData, setDisplayData] = useState([]);
    const [potentialNewIngredients, setPotentialNewIngredients] = useState([]);
    const [newDisplayData, setNewDisplayData] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [viewFinderDimension, setViewFinderDimension] = useState({});
    // const [bannerAdDimension, setBannerAdDimension] = useState({ width: 0, height: 0 });
    const [unmount, setUnmount] = useState(false);

    // useEffect(() => { console.log(bannerAdDimension) }, [bannerAdDimension]);

    const handleHomeButton = async () => {
        setUnmount(true);
        setTorch(false);
        setScanner(false);
        props.setPage("HomePage");
    };

    useEffect(() => {
        if (!unmount && isSearching == false) {
            setTextBlocks([]);
            setBarcodes([]);
        }
    }, [isSearching]);

    useEffect(() => {
        if (!unmount) {
            setIsSearching(false);
        }
    }, [displayData]);

    useEffect(() => {
        if (!unmount && newDisplayData.length > 0) {
            console.log("new display data names", newDisplayData.map(x => x.name));
            setDisplayData([...displayData, ...newDisplayData]);
        }
    }, [newDisplayData]);

    useEffect(() => {
        const myAsyncFunction = async function () {

            const ingredients_shown = displayData.map(x => x.name);
            const missing_ingredients = potentialNewIngredients.filter(x => !ingredients_shown.includes(x));
            //checking unmount state before firing each setState and async function
            let foundNewDisplayData = false;
            if (!unmount && missing_ingredients.length > 0) {
                console.log("missing_ingredients", missing_ingredients);
                const new_data = await getIngredientsToDescriptionAsync(missing_ingredients);
                if (!unmount && new_data.length > 0) {
                    foundNewDisplayData = true;
                    setNewDisplayData(new_data);
                }
            }
            if (!unmount && !foundNewDisplayData)
                setIsSearching(false);
        }
        if (!unmount && potentialNewIngredients.length > 0)
            myAsyncFunction();
    }, [potentialNewIngredients]);

    useEffect(() => {
        const myAsyncFunction = async function () {
            let word_lst = [];
            for (let i = 0; i < textBlocks.length; i++) {
                const words1 = textBlocks[i].value.trim().split(",");
                const words2 = textBlocks[i].value.trim().split(/[ ,]+/);
                word_lst = [...word_lst, ...words1, ...words2];
            }
            const processed_word_lst = word_lst.filter(x => !scannedWords.has(x));
            //console.log("scanned word list",processed_word_lst);

            let foundPotentialNewIngredients = false;
            if (!unmount && processed_word_lst.length > 0) {
                setScannedWords(new Set([...scannedWords, ...processed_word_lst]));
                const filtered_lst = await getFilteredWordListAsync(processed_word_lst);
                if (!unmount && filtered_lst.length > 0) {
                    console.log("filtered lst:", filtered_lst);
                    setPotentialNewIngredients(filtered_lst);
                    foundPotentialNewIngredients = true;
                }
            }
            if (!foundPotentialNewIngredients && !unmount)
                setIsSearching(false);

        }
        if (!unmount && textBlocks.length > 0) {
            setIsSearching(true);
            myAsyncFunction();
        }
    }, [textBlocks]);


    useEffect(() => {
        const myAsyncFunction = async function () {
            let ingredients_list = [];
            for (let i = 0; i < barcodes.length && !unmount; i++) {
                const ingredients = await getIngredientsListFromBarcodeAsync(barcodes[i].data);
                ingredients_list = [...ingredients_list, ...ingredients];
            }

            let foundPotentialNewIngredients = false;
            if (!unmount && ingredients_list.length > 0) {
                const filtered_lst = await getFilteredWordListAsync(ingredients_list);
                if (!unmount && filtered_lst.length > 0) {
                    setPotentialNewIngredients(filtered_lst);
                    foundPotentialNewIngredients = true;
                }
            }
            if (!unmount && !foundPotentialNewIngredients) {
                setIsSearching(false);
            }

        }
        if (!unmount && barcodes.length > 0) {
            setIsSearching(true);
            myAsyncFunction();
        }

    }, [barcodes]);



    const handleBarCodeRead = (obj) => {
        if (isSearching)
            return;
        const barcodes_obj = obj["barcodes"];
        //cap it to one barcode at a time for now, although muliple barcodes at once is supported
        const new_barcodes = (barcodes_obj.length > 0) ? [barcodes_obj[0]] : [];
        const filtered_barcodes = new_barcodes.filter(x => !scannedBarcodes.has(x.data));
        if (!unmount && filtered_barcodes.length > 0) {
            setBarcodes(filtered_barcodes);
            setScannedBarcodes(new Set([...scannedBarcodes, ...filtered_barcodes.map(x => x.data)]));
        }
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
                    style.MLKitText,
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
        setViewFinderDimension({ "height": parseInt(0.90 * parseFloat(event.nativeEvent.layout.height)), "width": parseInt(0.95 * parseFloat(event.nativeEvent.layout.width)) });
    };

    // const measureBannerAdDimensions = (event) => {
    //     setBannerAdDimension({ "height": parseInt(0.90 * parseFloat(event.nativeEvent.layout.height)), "width": parseInt(0.95 * parseFloat(event.nativeEvent.layout.width)) });
    // }

    const handleTextRead = (obj) => {
        if (isSearching)
            return;
        const text_blocks_obj_arr = obj["textBlocks"];
        //cap to one text block at a time, although multiple text blocks at once is supported
        const new_text_blocks = (text_blocks_obj_arr.length > 0) ? [text_blocks_obj_arr[0]] : [];
        const filtered_text_blocks = new_text_blocks.filter(x => !scannedWords.has(x.value));
        if (!unmount && filtered_text_blocks.length > 0) {
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
                        style.MLKitText,
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
        <Fragment>
            <View style={style.container}>
                <View style={style.navBar}>
                    <Button title="Home" onPress={handleHomeButton} />
                    {scanner &&
                        <View stlye={style.navSwitch}>
                            <Text style={[style.navBarText, { backgroundColor: 'yellow' }]}>TORCH:</Text>
                            <Switch
                                value={torch}
                                onChange={() => setTorch(!torch)}
                            />
                        </View>
                    }
                    {scanner &&
                        <View stlye={style.navSwitch}>
                            <Text style={style.navBarText}>DETECTING:</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Switch
                                    value={detecingBarcode}
                                    onChange={() => setDectectingBarcode(!detecingBarcode)}
                                    trackColor={{ false: 'grey', true: 'grey' }}
                                    thumbColor='green'
                                />
                                {detecingBarcode && <Text style={[style.navBarText, { color: 'blue' }]}>BARCODES</Text>}
                                {!detecingBarcode && <Text style={[style.navBarText, { color: 'blue' }]}>TEXT</Text>}
                            </View>
                        </View>
                    }
                    <View stlye={style.navSwitch}>
                        <Text style={style.navBarText}>SCANNER:</Text>
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
                                autoFocus='on'
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
                                onGoogleVisionBarcodesDetected={(scanner && detecingBarcode) ? handleBarCodeRead : null}
                                googleVisionBarcodeType={(scanner && detecingBarcode) ? RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType.ALL : null}
                                onTextRecognized={(scanner && !detecingBarcode) ? handleTextRead : null}
                            >
                                <ViewFinder backgroundColor="transparent" loading={isSearching} height={viewFinderDimension["height"]} width={viewFinderDimension["width"]} />
                                {renderTextBlocks()}
                                {renderBarcodes()}
                            </RNCamera>
                        </FillToAspectRatio>
                    </View>
                }
                <View style={style.ingredients_lst}>
                    <IngredientsList instructions={instructions} is_searching={isSearching} ingrdnts_to_dscrption={displayData} />
                </View>
            </View>
            <View style={style.bannerAd} >
                <Ad adConsentStatus={props.adConsentStatus} adType='banner' />
            </View>
        </Fragment>
    );
};

const instructions = `\nBegin by toggling the scanner. You may then toggle between text or product barcode detection.
\nTip: Some product barcodes are yet to be supported, use text detection or simply search for the ingredient instead!`;

const { width: winWidth, height: winHeight } = Dimensions.get('window');
const style = StyleSheet.create({
    container: {
        display: 'flex',
        flex: 10,
        flexDirection: "column",
        height: winHeight,
        width: winWidth,
        padding: '1.5%',
        backgroundColor: 'green',
        overflow: 'hidden',
    },
    navBar: {
        paddingLeft: '2.5%',
        paddingRight: '2.5%',
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flex: 1.75,
        backgroundColor: 'white',
        borderTopEndRadius: 20,
        borderTopStartRadius: 20,
    },
    navSwitch: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    navBarText: {
        fontSize: 11.5,
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
    MLKitText: {
        padding: 10,
        borderWidth: 2,
        borderRadius: 2,
        position: 'absolute',
        borderColor: '#F00',
        justifyContent: 'center',
    },
    bannerAd: {
        flex: 1,
        backgroundColor: 'green',
    }
});
