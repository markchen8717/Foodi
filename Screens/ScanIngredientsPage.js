import React, { useEffect, useState, Fragment } from 'react';
import { StyleSheet, Text, View, Button, Dimensions, Switch } from 'react-native';
import IngredientsList from '../Components/IngredientsList';
import { getBatchIngredientSearchResultAsync } from '../API/APIFunctions';
import { RNCamera } from 'react-native-camera';
import FillToAspectRatio from '../Components/FillToAspectRatio';
import ViewFinder from 'react-native-view-finder';
import { getIngredientsListFromBarcodeAsync } from '../API/OFF';
import { styles } from "../Styles/PageStyle"
import BAd from '../Components/BAd'
import { setDataAsync, fetchDataAsync, printAppVariablesAsync } from '../API/Storage'
import { RateModal, isRateReadyAsync } from '../Components/RateModal'
import IAd from '../Components/IAd'
import { isInteruptReadyAsync } from '../Components/IAd';

const { width: winWidth, height: winHeight } = Dimensions.get('window');
var scannedText = new Set([]);
var scannedBarcodes = new Set([]);

export default function ScanIngredientsPage(props) {

    const [detectingBarcode, setDetectingBarcode] = useState(true);
    const [scanner, setScanner] = useState(false);
    const [textBlocks, setTextBlocks] = useState([]);
    const [barcodes, setBarcodes] = useState([]);
    const [torch, setTorch] = useState(false);
    const [displayData, setDisplayData] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [viewFinderDimension, setViewFinderDimension] = useState({});
    const [isReadyToRenderRateModal, setIsReadyToRenderRateModal] = useState(false)
    const [isReadyToRenderInterstitialAd, setIsReadyToRenderInterstitialAd] = useState(false)

    useEffect(() => {
        scannedText = new Set([]);
        scannedBarcodes = new Set([]);
    }, [])

    const handleClearAllAsync = async () => {
        scannedBarcodes = new Set([]);
        scannedText = new Set([]);
        setDisplayData([]);
    };

    const handleHomeButtonAsync = async () => {
        setTorch(false);
        setScanner(false);
        await setDataAsync("lastPage", JSON.stringify(1))
        await setDataAsync("currentPage", JSON.stringify(0))
        props.setPage("HomePage");
    };

    const updateSuccessfulScansAsync = async (response) => {
        let numOfScansAndSearchesSinceR = JSON.parse(await fetchDataAsync("numOfScansAndSearchesSinceR"));
        await setDataAsync("numOfScansAndSearchesSinceR", JSON.stringify(numOfScansAndSearchesSinceR + 1));
        let numOfScansAndSearchesSinceI = JSON.parse(await fetchDataAsync("numOfScansAndSearchesSinceI"));
        await setDataAsync("numOfScansAndSearchesSinceI", JSON.stringify(numOfScansAndSearchesSinceI + 1));

        if (response.length >= 3) {
            await setDataAsync("isLastScanSuccessful", JSON.stringify(true));
        }
        else {
            await setDataAsync("isLastScanSuccessful", JSON.stringify(false));
        }
        await printAppVariablesAsync();

    };

    const updateFoundIngredientsAsync = async (ingredients_list, myAbortController) => {
        const newData = await getBatchIngredientSearchResultAsync(ingredients_list, myAbortController);
        const filtered_data = newData.filter(new_ => !displayData.map(old_ => old_.title).includes(new_.title));
        const newDisplayData = [...displayData, ...filtered_data];
        await updateSuccessfulScansAsync(newDisplayData);
        setDisplayData(newDisplayData);
    };

    const getParsedIngredient = (ingredient) => {
        return ingredient.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9 ]/g, " ").replace(/\s+/g, " ").trim()
    };

    const getParsedIngredientsArray = (data) => {
        let filtered_data = data.reduce(function (filtered, ingredient) {
            ingredient = getParsedIngredient(ingredient);
            if (ingredient.length > 2) {
                filtered.push(ingredient);
            }
            return filtered
        }, []);
        filtered_data = Array.from(new Set(filtered_data))
        return filtered_data;
    };

    const parseTextBlocksForIngredientsList = () => {
        const ingredients_lst = []
        textBlocks.forEach((block) => {
            let reduced_ingredients_lst = [
                ...block.value.split(/,/),
                // ...block.value.split(/\s+/)
            ];
            reduced_ingredients_lst = getParsedIngredientsArray(reduced_ingredients_lst);
            reduced_ingredients_lst.forEach((word) => {
                if (!scannedText.has(word)) {
                    ingredients_lst.push(word);
                    scannedText.add(word);
                }
            });
            ;
        });
        return ingredients_lst;
    };

    useEffect(() => {
        let isCancelled = false;
        const myAbortController = new AbortController();
        const main = async function () {
            const ingredients_lst = (detectingBarcode) ?
                await getIngredientsListFromBarcodeAsync(barcodes[0].data, myAbortController) :
                parseTextBlocksForIngredientsList()
            if (!isCancelled && ingredients_lst.length) {
                await updateFoundIngredientsAsync(ingredients_lst, myAbortController);
            }
            if (!isCancelled) {
                setIsSearching(false);
                setTextBlocks([]);
                setBarcodes([]);
            }
        };
        if (!isCancelled && (barcodes.length || textBlocks.length)) {
            main();
        }
        return () => {
            isCancelled = true;
            myAbortController.abort();
        };
    }, [textBlocks, barcodes]);

    useEffect(() => {
        const interruptIfReady = async () => {
            if (displayData.length == 0) {
                let isLastScanSuccessful = JSON.parse(await fetchDataAsync("isLastScanSuccessful"));
                if (isLastScanSuccessful) {
                    if (await isRateReadyAsync()) {
                        //choose to rate
                        setIsReadyToRenderRateModal(true);
                    }
                    else if (await isInteruptReadyAsync()) {
                        //choose to show interstitial ad
                        setIsReadyToRenderInterstitialAd(true);
                    }
                }
            };
        }
        interruptIfReady();
    }, [displayData]);

    const handleBarCodeRead = (obj) => {
        if (isSearching)
            return;
        const barcodes_obj = obj["barcodes"];
        //cap it to one barcode at a time for now
        const new_barcode = (barcodes_obj.length > 0) ? [barcodes_obj[0]] : [];
        const filtered_barcodes = new_barcode.filter(barcode => {
            if (!scannedBarcodes.has(barcode.data)) {
                scannedBarcodes.add(barcode.data);
                return true;
            }
        });
        if (filtered_barcodes.length > 0) {
            setIsSearching(true);
            setBarcodes(filtered_barcodes);
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
        const text_blocks = obj["textBlocks"];

        const filtered_text_blocks = text_blocks.reduce(function (filtered, block) {
            if (100 < block.bounds.origin.y < viewFinderDimension["height"] + 150) {
                filtered.push(block);
            }
            return filtered;
        }, []);

        if (filtered_text_blocks.length > 0) {
            setIsSearching(true);
            setTextBlocks(filtered_text_blocks);
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
            <RateModal trigger={isReadyToRenderRateModal} setTrigger={setIsReadyToRenderRateModal} />
            <IAd adConsentStatus={props.adConsentStatus} trigger={isReadyToRenderInterstitialAd} setTrigger={setIsReadyToRenderInterstitialAd} />
            <View style={styles.container}>
                <View style={styles.navBar}>
                    <Button title="Home" onPress={handleHomeButtonAsync} />
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
                    <IngredientsList handleClearAll={async function () {
                        await handleClearAllAsync()
                    }} instructions={instructions} is_searching={isSearching} ingrdnts_to_dscrption={displayData} />
                </View>
            </View>
            <View >
                <BAd adConsentStatus={props.adConsentStatus} adType='banner' />
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
