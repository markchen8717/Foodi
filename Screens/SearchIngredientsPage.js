import React, { useEffect, useState, Fragment } from 'react';
import { View, Button } from 'react-native';
import IngredientsList from '../Components/IngredientsList';
import { SearchBar } from 'react-native-elements';
import { getFilteredWordListAsync, getIngredientsToDescriptionAsync } from '../API/APIFunctions';
import { getIngredientSearchResultsAsync } from '../API/Wiki';
import { useDebounce } from "use-debounce";
import {styles} from "../Styles/PageStyle"
import Ad from '../Components/Ad'


var globalQuery = "";
export default function SearchIngredientsPage(props) {
    var unmount = false;

    const [query, setQuery] = useState("");
    const [data, setData] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [debouncedQuery] = useDebounce(query, 500);


    const handleHomeButton = async () => {
        unmount = true;
        props.setPage("HomePage");
    }

    const updateSearchAsync = async (text) => {
        setQuery(text);
        globalQuery = text;

    }

    useEffect(() => {
        const myAsyncFunction = async () => {
            var search_results, filtered_lst, data = null;
            search_results = await getIngredientSearchResultsAsync(debouncedQuery);
            console.log("search_results:", search_results);
            console.log("unmount:",unmount,"debouncedQuery:",debouncedQuery,"globalQuery:",globalQuery);
            if (!unmount && debouncedQuery === globalQuery)
                filtered_lst = await getFilteredWordListAsync(search_results);
            console.log("filtered_lst:", filtered_lst);
            if (!unmount && debouncedQuery === globalQuery && filtered_lst != null)
                data = await getIngredientsToDescriptionAsync(filtered_lst);
            console.log("data:", data);
            if (!unmount && debouncedQuery === globalQuery && data != null) {
                setData(data);
                setIsSearching(false);
            }
        }
        if (!unmount) {
            setData([]);
            if (debouncedQuery != "") {
                setIsSearching(true);
                myAsyncFunction();
            } else {
                setIsSearching(false);
            }
        }
        return(()=> {unmount = true;});
    }, [debouncedQuery]);


    return (
        <Fragment>
            <View style={styles.container}>
                <View style={styles.navBar}>
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

                <View style={styles.ingredients_lst}>
                    <IngredientsList instructions={instructions} is_searching={isSearching} ingrdnts_to_dscrption={data} />
                </View>
            </View>
            <View >
                <Ad adConsentStatus={props.adConsentStatus} adType='banner' />
            </View>
        </Fragment>
    );
}

const instructions = `Begin by typing the ingredient into the search bar.`;
