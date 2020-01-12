import React, { useEffect, useState, Fragment } from 'react';
import { StyleSheet, View, Button, Dimensions } from 'react-native';
import IngredientsList from '../Components/IngredientsList';
import { SearchBar } from 'react-native-elements';
import { getFilteredWordListAsync, getIngredientsToDescriptionAsync } from '../API/APIFunctions';
import { getIngredientSearchResultsAsync } from '../API/Wiki';
import { useDebounce } from "use-debounce";
import Ad from '../Components/Ad'

export default function SearchIngredientsPage(props) {

    const [unfilteredData, setUnfilteredData] = useState({});
    const [query, setQuery] = useState("");
    const [data, setData] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [debouncedQuery] = useDebounce(query, 500);
    const [unmount, setUnmount] = useState(false);


    const handleHomeButton = async () => {
        setUnmount(true);
        props.setPage("HomePage");
    }

    const updateSearchAsync = async (text) => {
        if (!unmount) {
            setQuery(text);
        }
    }

    useEffect(() => {
        if (!unmount)
            setIsSearching(false);
    }, [data]);

    useEffect(() => {
        console.log("debounced", debouncedQuery);
        const myAsyncFunction = async function () {
            let foundData = false;
            const search_results = await getIngredientSearchResultsAsync(debouncedQuery);
            console.log("wiki search results", search_results);
            if (!unmount && search_results.length > 0 && debouncedQuery == query) {
                const ingredients_lst = await getFilteredWordListAsync(search_results);
                console.log("filtered list", ingredients_lst);
                if (!unmount && ingredients_lst.length > 0 && debouncedQuery == query) {
                    const api_data = await getIngredientsToDescriptionAsync(ingredients_lst);
                    if (!unmount && api_data.length > 0 && debouncedQuery == query) {
                        foundData = true;
                        let unfiltered_data_obj = {};
                        unfiltered_data_obj[debouncedQuery] = api_data;
                        setUnfilteredData(unfiltered_data_obj);
                    }
                }
            }
            if (!foundData && !unmount && debouncedQuery == query)
                setIsSearching(false);
        }
        if (!unmount && debouncedQuery == query) {
            setIsSearching(true);
            myAsyncFunction();
        }
    }, [debouncedQuery]);

    useEffect(() => {
        const unfiltered_data_query = Object.keys(unfilteredData)[0];
        if (!unmount && unfiltered_data_query == query) {
            setData(unfilteredData[unfiltered_data_query]);
        }
    }, [unfilteredData]);



    return (
        <Fragment>
            <View style={style.container}>
                <View style={style.navBar}>
                    <Button title="Home" onPress={handleHomeButton} />
                </View>

                <SearchBar
                    placeholder="Type Here..."
                    onChangeText={updateSearchAsync}
                    lightTheme round
                    value={query}
                    style={{ height: "100%", width: "100%" }}
                    showLoading={isSearching}
                />

                <View style={style.ingredients_lst}>
                    <IngredientsList instructions={instructions} is_searching={isSearching} ingrdnts_to_dscrption={data} />
                </View>
            </View>
            <View style={style.bannerAd} >
                <Ad adConsentStatus={props.adConsentStatus} adType='banner' />
            </View>
        </Fragment>
    );
}

const instructions = ``;

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
    }, navBar: {
        paddingLeft: '2.5%',
        paddingRight: '2.5%',
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flex: 1.5,
        backgroundColor: 'white',
        borderTopEndRadius: 20,
        borderTopStartRadius: 20,
    },
    ingredients_lst: {
        flex: 10,
        borderBottomStartRadius: 20,
        borderBottomEndRadius: 20,
        overflow: 'hidden',
    },
    bannerAd: {
        flex: 1,
        backgroundColor: 'green',
    }
});