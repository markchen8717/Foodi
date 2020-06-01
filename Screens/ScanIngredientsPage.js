import React, { useEffect, useState, Fragment } from 'react';
import { StyleSheet, Text, View, Button, Dimensions, Switch } from 'react-native';
import IngredientsList from '../Components/IngredientsList';
import { getFilteredWordListAsync, getIngredientsToDescriptionAsync, getMostAppropriateWord } from '../API/APIFunctions';
import { RNCamera } from 'react-native-camera';
import FillToAspectRatio from '../Components/FillToAspectRatio';
import ViewFinder from 'react-native-view-finder';
import { getIngredientsListFromBarcodeAsync } from '../API/OFF';
import { styles } from "../Styles/PageStyle"
import Ad from '../Components/Ad'

const { width: winWidth, height: winHeight } = Dimensions.get('window');
var dataList = [];

export default function ScanIngredientsPage(props) {

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
        dataList = [];
    }


    const handleHomeButton = async () => {
        setTorch(false);
        setScanner(false);
        props.setPage("HomePage");
    };

    const load_data = async (filtered_lst,abortController=new AbortController()) => {
        console.log("filtered lst:", filtered_lst);
        for (let i = 0; i < filtered_lst.length; i++) {
            const data = await getIngredientsToDescriptionAsync([filtered_lst[i]],abortController);
            dataList = [...dataList, ...data];
            setDisplayData(dataList);
        }
    }


    useEffect(() => {
        let isCancelled = false;
        const myAbortController = new AbortController();
        const myAsyncFunction = async function () {
            const word_lst = textBlocks.reduce((a, c) => {
                const words1 = c.value.trim().split(",");
                const words2 = c.value.trim().split(/[ ,]+/);
                return [...a, ...words1, ...words2];
            }, []);
            const processed_word_lst = word_lst.filter(x => /^[a-zA-Z\s]+$/.test(x) && !scannedWords.has(x.toUpperCase()));
            console.log("processed_word_lst", processed_word_lst);
            if (!isCancelled && processed_word_lst.length > 0) {

                const filtered_lst = (await getFilteredWordListAsync(processed_word_lst,myAbortController)).filter(x => !displayData.map(x => x.name).includes(x));

                setScannedWords(new Set([...scannedWords, ...word_lst.map(x => x.toUpperCase()), ...filtered_lst.map(x => x.toUpperCase())]));
                if (!isCancelled)
                    await load_data(filtered_lst,myAbortController);
            }
            if (!isCancelled) {
                setIsSearching(false);
                setTextBlocks([]);
            }
        }
        if (!isCancelled && textBlocks.length > 0) {

            myAsyncFunction();
        }
        return () => {
            isCancelled = true;
            myAbortController.abort();
        };
    }, [textBlocks]);


    useEffect(() => {
        let isCancelled = false;
        const myAbortController = new AbortController();
        const myAsyncFunction = async function () {
            const ingredients_list = await getIngredientsListFromBarcodeAsync(barcodes[0].data,myAbortController);
            if (!isCancelled && ingredients_list.length > 0) {
                const filtered_lst = (await getFilteredWordListAsync(ingredients_list,myAbortController)).filter(x => !displayData.map(x => x.name).includes(x));
                setScannedWords(new Set([...scannedWords, ...filtered_lst.map(x => x.toUpperCase())]));
                if (!isCancelled)
                    await load_data(filtered_lst,myAbortController);
            }
            if (!isCancelled) {
                setIsSearching(false);
                setBarcodes([]);
            }
        }
        if (!isCancelled && barcodes.length > 0) {
            myAsyncFunction();
        }
        return () => {
            isCancelled = true;
            myAbortController.abort();
        };
    }, [barcodes]);


    const handleBarCodeRead = (obj) => {
        if (isSearching)
            return;
        const barcodes_obj = obj["barcodes"];
        //cap it to one barcode at a time for now
        const new_barcode = (barcodes_obj.length > 0) ? [barcodes_obj[0]] : [];
        const filtered_barcode = new_barcode.filter(x => !scannedBarcodes.has(x.data));
        if (filtered_barcode.length > 0) {
            setIsSearching(true);
            setBarcodes(filtered_barcode);
            setScannedBarcodes(new Set([...scannedBarcodes, ...filtered_barcode.map(x => x.data)]));
        }
    };

    const renderBarcodes = () => (
        <View style={camera_style.facesContainer} pointerEvents="none">
            {barcodes.map(renderBarcode)}
        </View>
    );

    const renderBarcode = ({ bounds, data, type }) => (
        <Fragment key={data + bounds.origin.x}>
            <View
                style={[
                    camera_style.MLKitText,
                    {
                        ...bounds.size,
                        left: bounds.origin.x,
                        top: bounds.origin.y,
                    },
                ]}
            >
                <Text style={[camera_style.textBlock]}>{`${data} ${type}`}</Text>
            </View>
        </Fragment>
    );

    const measureViewFinderDimensions = (event) => {
        setViewFinderDimension({ "height": parseInt(0.90 * parseFloat(event.nativeEvent.layout.height)), "width": parseInt(0.95 * parseFloat(event.nativeEvent.layout.width)) });
        console.log("camera width:", viewFinderDimension["width"], "camera height", viewFinderDimension["height"])
        console.log("win width:", winWidth, "win height:", winHeight);
    };


    const handleTextRead = (obj) => {
        if (isSearching)
            return;
        const text_blocks_obj_arr = obj["textBlocks"];

        const filtered_text_block = text_blocks_obj_arr.filter(x => !scannedWords.has(x.value.toUpperCase()) && 100 < x.bounds.origin.y < viewFinderDimension["height"] + 150);
        if (filtered_text_block.length > 0) {
            filtered_text_block.forEach(el => {
                console.log(el.bounds);
            })
            setIsSearching(true);
            setScannedWords(new Set([...scannedWords, ...filtered_text_block.map(x => x.value.toUpperCase())]));
            setTextBlocks(filtered_text_block);
        }
    };

    const renderTextBlocks = () => (
        <View style={camera_style.facesContainer} pointerEvents="none">
            {textBlocks.map(renderTextBlock)}
        </View>
    );

    const renderTextBlock = ({ bounds, value }) => {

        return (
            <Fragment key={value + bounds.origin.x}>
                <Text style={[camera_style.textBlock, { left: bounds.origin.x, top: bounds.origin.y }]}>
                    {value}
                </Text>
                <View
                    style={[
                        camera_style.MLKitText,
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
            <View style={styles.container}>
                <View style={styles.navBar}>
                    <Button title="Home" onPress={handleHomeButton} />
                    {scanner &&
                        <View >
                            <Text style={[{ backgroundColor: "gold" }, styles.navBarText]}>TORCH:</Text>
                            <Switch
                                value={torch}
                                onChange={() => setTorch(!torch)}
                            />
                        </View>
                    }
                    {scanner &&
                        <View >
                            <Text style={styles.navBarText}>DETECTING:</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Switch
                                    value={detectingBarcode}
                                    onChange={() => setDetectingBarcode(!detectingBarcode)}
                                    trackColor={{ false: 'grey', true: 'grey' }}
                                    thumbColor='green'
                                />
                                {detectingBarcode && <Text style={[styles.navBarText, { color: "green" }]}>BARCODES</Text>}
                                {!detectingBarcode && <Text style={[styles.navBarText, { color: "#3498DB" }]}>TEXT</Text>}
                            </View>
                        </View>
                    }
                    <View >
                        <Text style={styles.navBarText}>SCANNER:</Text>
                        <Switch
                            value={scanner}
                            onChange={() => { setScanner(!scanner); setTorch(false); }}
                        />
                    </View>
                </View>
                {scanner &&
                    <View style={camera_style.camera} onLayout={(event) => measureViewFinderDimensions(event)} >
                        <FillToAspectRatio style={camera_style.camera}>
                            <RNCamera
                                //autoFocus='on'
                                autoFocusPointOfInterest={{ x: 0.25, y: 0.5 }}
                                captureAudio={false}
                                onFacesDetected={null}
                                style={camera_style.camera}

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
                <View style={styles.ingredients_lst}>
                    <IngredientsList handleClearAll={handleClearAll} instructions={instructions} is_searching={isSearching} ingrdnts_to_dscrption={displayData} />
                </View>
            </View>
            <View >
                <Ad adConsentStatus={props.adConsentStatus} adType='banner' />
            </View>
        </Fragment>
    );
};

const instructions = `Begin by toggling the scanner. You may then toggle between text or product barcode detection.
\nTip: Some product barcodes are yet to be supported, use text detection or simply search for the ingredient instead!`;


const camera_style = StyleSheet.create({

    camera: {
        height: "100%",
        width: "100%",
        flex: 4.5,
        justifyContent: 'center',
        alignContent: 'center'
    },
    textBlock: {
        color: '#F00',
        position: 'absolute',
        textAlign: 'center',
        backgroundColor: 'transparent',
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
});
