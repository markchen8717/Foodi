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
    var unmount = false;

    const [scannedWords, setScannedWords] = useState(new Set([]));
    const [scannedBarcodes, setScannedBarcodes] = useState(new Set([]));
    const [detectingBarcode, setDetectingBarcode] = useState(true);
    const [scanner, setScanner] = useState(false);
    const [textBlocks, setTextBlocks] = useState([]);
    const [barcodes, setBarcodes] = useState([]);
    const [torch, setTorch] = useState(false);
    const [displayData, setDisplayData] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [viewFinderDimension, setViewFinderDimension] = useState({});

    const handleClearAll = () => {
        setScannedBarcodes(new Set([]));
        setScannedWords(new Set([]));
        setDisplayData([]);
    }


    const handleHomeButton = async () => {
        unmount = true;
        setTorch(false);
        setScanner(false);
        props.setPage("HomePage");
    };

    const load_data = async (filtered_lst) => {
        var dataList = [];
        console.log("filtered lst:", filtered_lst);
        for (let i = 0; i < filtered_lst.length; i++) {
            const data = await getIngredientsToDescriptionAsync([filtered_lst[i]]);
            dataList = [...dataList,...data];
            setDisplayData(dataList);
        }
    }


    useEffect(() => {
        const myAsyncFunction = async function () {
            const word_lst = textBlocks.reduce((a, c) => {
                const words1 = c.value.trim().split(",");
                const words2 = c.value.trim().split(/[ ,]+/);
                return [...a, ...words1, ...words2];
            },[]);
            const processed_word_lst = word_lst.filter(x => /^[a-zA-Z\s]+$/.test(x) && !scannedWords.has(x.toUpperCase()));
            console.log("processed_word_lst", processed_word_lst);
            if (!unmount && processed_word_lst.length > 0) {
                const filtered_lst = (await getFilteredWordListAsync(processed_word_lst)).filter(x=>!displayData.map(x=>x.name).includes(x));
                setScannedWords(new Set([...scannedWords, ...word_lst.map(x => x.toUpperCase()), ...filtered_lst.map(x => x.toUpperCase())]));
                if (!unmount)
                    await load_data(filtered_lst);
            }
            if (!unmount){
                setIsSearching(false);
                setTextBlocks([]);
            }
        }
        if (!unmount && textBlocks.length > 0) {

            myAsyncFunction();
        }
        return (() => unmount = true);
    }, [textBlocks]);


    useEffect(() => {
        const myAsyncFunction = async function () {
            const ingredients_list = await getIngredientsListFromBarcodeAsync(barcodes[0].data);
            if (!unmount && ingredients_list.length > 0) {
                const filtered_lst = (await getFilteredWordListAsync(ingredients_list)).filter(x=>!displayData.map(x=>x.name).includes(x));
                setScannedWords(new Set([...scannedWords, ...filtered_lst.map(x => x.toUpperCase())]));
                if (!unmount)
                    await load_data(filtered_lst);
            }
            if (!unmount){
                setIsSearching(false);
                setBarcodes([]);
            }
        }
        if (!unmount && barcodes.length > 0) {
            myAsyncFunction();
        }
        return (() => unmount = true);
    }, [barcodes]);


    const handleBarCodeRead = (obj) => {
        if (isSearching)
            return;
        const barcodes_obj = obj["barcodes"];
        //cap it to one barcode at a time for now
        const new_barcode = (barcodes_obj.length > 0) ? [barcodes_obj[0]] : [];
        const filtered_barcode = new_barcode.filter(x => !scannedBarcodes.has(x.data));
        if (!unmount && filtered_barcode.length > 0) {
            setIsSearching(true);
            setBarcodes(filtered_barcode);
            setScannedBarcodes(new Set([...scannedBarcodes, ...filtered_barcode.map(x => x.data)]));
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


    const handleTextRead = (obj) => {
        if (isSearching)
            return;
        const text_blocks_obj_arr = obj["textBlocks"];
        //cap to one text block at a time
        const new_text_block = (text_blocks_obj_arr.length > 0) ? [text_blocks_obj_arr[0]] : [];
        const filtered_text_block = new_text_block.filter(x => !scannedWords.has(x.value.toUpperCase()));
        if (!unmount && filtered_text_block.length > 0) {
            console.log("searching new text:", filtered_text_block[0].bounds);
            setIsSearching(true);
            setScannedWords(new Set([...scannedWords, ...filtered_text_block.map(x => x.value.toUpperCase())]));
            setTextBlocks(filtered_text_block);
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
                                    value={detectingBarcode}
                                    onChange={() => setDetectingBarcode(!detectingBarcode)}
                                    trackColor={{ false: 'grey', true: 'grey' }}
                                    thumbColor='green'
                                />
                                {detectingBarcode && <Text style={[style.navBarText, { color: 'blue' }]}>BARCODES</Text>}
                                {!detectingBarcode && <Text style={[style.navBarText, { color: 'blue' }]}>TEXT</Text>}
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
                                //autoFocus='on'
                                autoFocusPointOfInterest={{ x: 0.2, y: 0.5 }}
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
                                onGoogleVisionBarcodesDetected={(scanner && detectingBarcode) ? handleBarCodeRead : null}
                                googleVisionBarcodeType={(scanner && detectingBarcode) ? RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType.ALL : null}
                                onTextRecognized={(scanner && !detectingBarcode) ? handleTextRead : null}
                            >
                                <ViewFinder backgroundColor="transparent" loading={isSearching} height={viewFinderDimension["height"]} width={viewFinderDimension["width"]} />
                                {renderTextBlocks()}
                                {renderBarcodes()}
                            </RNCamera>
                        </FillToAspectRatio>
                    </View>
                }
                <View style={style.ingredients_lst}>
                    <IngredientsList handleClearAll={handleClearAll} instructions={instructions} is_searching={isSearching} ingrdnts_to_dscrption={displayData} />
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
