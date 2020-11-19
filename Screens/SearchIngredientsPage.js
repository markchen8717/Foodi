import React, { useEffect, useState, Fragment } from 'react';
import { View, Button, Text } from 'react-native';
import IngredientsList from '../Components/IngredientsList';
import { SearchBar } from 'react-native-elements';
import { getIngredientFuzzySearchResultAsync } from '../API/APIFunctions';
import { styles } from "../Styles/PageStyle"
import BAd from '../Components/BAd'
import { setDataAsync, fetchDataAsync, printAppVariablesAsync } from '../API/Storage'
import { RateModal, isRateReadyAsync } from '../Components/RateModal'
import IAd from '../Components/IAd'
import { isInteruptReadyAsync } from '../Components/IAd'
import { useDebounce } from "use-debounce";


export default function SearchIngredientsPage(props) {
    const [query, setQuery] = useState("");
    const [debouncedQuery] = useDebounce(query, 1000);
    const [isSearching, setIsSearching] = useState(false);
    const [data, setData] = useState([]);

    const [isReadyToRenderRateModal, setIsReadyToRenderRateModal] = useState(false);
    const [isReadyToRenderInterstitialAd, setIsReadyToRenderInterstitialAd] = useState(false);

    const handleHomeButtonAsync = async () => {
        await setDataAsync("lastPage", JSON.stringify(2))
        await setDataAsync("currentPage", JSON.stringify(0))
        props.setPage("HomePage");
    }

    const updateSuccessfulSearchesAsync = async (response) => {
        let numOfScansAndSearchesSinceR = JSON.parse(await fetchDataAsync("numOfScansAndSearchesSinceR"))
        await setDataAsync("numOfScansAndSearchesSinceR", JSON.stringify(numOfScansAndSearchesSinceR + 1))
        let numOfScansAndSearchesSinceI = JSON.parse(await fetchDataAsync("numOfScansAndSearchesSinceI"))
        await setDataAsync("numOfScansAndSearchesSinceI", JSON.stringify(numOfScansAndSearchesSinceI + 1))

        if (response.length > 0) {

            await setDataAsync("isLastSearchSuccessful", JSON.stringify(true))
        }
        else {
            await setDataAsync("isLastSearchSuccessful", JSON.stringify(false))
        }
        await printAppVariablesAsync();
    };

    useEffect(() => {
        let isCancelled = false;
        const myAbortController = new AbortController();

        const fetchData = async () => {
            let response = undefined
            if (debouncedQuery !== "" && !isCancelled) {
                setIsSearching(true);
                response = await getIngredientFuzzySearchResultAsync(debouncedQuery, myAbortController);
                setData(response);
                await updateSuccessfulSearchesAsync(response);
                setIsSearching(false);
            }
        };
        fetchData();
        return () => {
            isCancelled = true;
            myAbortController.abort();
        };
    }, [debouncedQuery]);

    useEffect(() => {
        let isCancelled = false;
        const interruptIfReady = async () => {
            if (query == "" && !isCancelled) {
                let isLastSearchSuccessful = JSON.parse(await fetchDataAsync("isLastSearchSuccessful"));
                //Choose to display interstitial ad or ask for rate when user clears search query
                if (isLastSearchSuccessful == true) {
                    if (await isRateReadyAsync()) {
                        //choose to rate
                        setIsReadyToRenderRateModal(true)
                    }
                    else if (await isInteruptReadyAsync()) {
                        //choose to show interstitial ad
                        setIsReadyToRenderInterstitialAd(true)
                    }
                }
            }
        };
        interruptIfReady();
        return () => {
            isCancelled = true;
        };
    }, [query])

    return (
        <Fragment>
            <RateModal trigger={isReadyToRenderRateModal} setTrigger={setIsReadyToRenderRateModal} />
            <IAd adConsentStatus={props.adConsentStatus} trigger={isReadyToRenderInterstitialAd} setTrigger={setIsReadyToRenderInterstitialAd} />
            <View style={styles.container}>
                <View style={styles.navBar}>
                    <Button title="Home" onPress={handleHomeButtonAsync} />
                </View>

                <SearchBar
                    placeholder="Type Here..."
                    onChangeText={async (text) => {
                        setQuery(text)
                    }}
                    lightTheme round
                    value={query}
                    style={{ height: "100%", width: "100%" }}
                    showLoading={isSearching}
                />

                <View style={styles.ingredients_lst}>
                    <IngredientsList instructions={instructions} is_searching={isSearching} ingrdnts_to_dscrption={data} />
                </View>
            </View>
            <View >
                <BAd adConsentStatus={props.adConsentStatus} adType='banner' />
            </View>
        </Fragment>
    );
}

const instructions = `Begin by typing the ingredient into the search bar.`;
