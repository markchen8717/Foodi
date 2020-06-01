import React, { useEffect, useState, Fragment } from 'react';
import { View, Button } from 'react-native';
import IngredientsList from '../Components/IngredientsList';
import { SearchBar } from 'react-native-elements';
import { getFilteredWordListAsync, getIngredientsToDescriptionAsync, getSimilarWordsList,getMostAppropriateWord } from '../API/APIFunctions';
import { getIngredientSearchResultsAsync } from '../API/Wiki';
import { styles } from "../Styles/PageStyle"
import Ad from '../Components/Ad'
import { getFDAFilteredWordListAsync } from '../API/FDA';




export default function SearchIngredientsPage(props) {
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [data, setData] = useState([]);
    const handleHomeButton = async () => {
        props.setPage("HomePage");
    }

    useEffect(() => {
        let isCancelled = false;
        const myAbortController = new AbortController();
        const fetchData = async () => {
            try {
                let response, similarWordList= undefined
                if (query == "") {
                    response = []
                } else {
                    setIsSearching(true)
                    similarWordList = getSimilarWordsList(query)
                    response = await getIngredientsToDescriptionAsync(similarWordList, myAbortController);
                }
                if (!isCancelled) {
                    setData(response)
                    setIsSearching(false)
                }
            } catch (e) {
                if (!isCancelled) {
                    console.log(e);
                }
            }
        };


        fetchData();

        return () => {
            isCancelled = true;
            myAbortController.abort();
        };
    }, [query]);



    return (
        <Fragment>
            <View style={styles.container}>
                <View style={styles.navBar}>
                    <Button title="Home" onPress={handleHomeButton} />
                </View>

                <SearchBar
                    placeholder="Type Here..."
                    onChangeText={async (text) => (setQuery(text))}
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
