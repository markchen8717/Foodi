import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, Dimensions } from 'react-native';
import IngredientsList from '../Components/IngredientsList';
import { SearchBar } from 'react-native-elements';
import { filterWordListAsync, getIngredientsToDescriptionAsync } from '../API/APIFunctions';
import { getIngredientSearchResultsAsync } from '../API/Wiki';
import { useDebounce } from "use-debounce";


var sample_data = [
    { 'name': 'Soy Sauce', 'text': 'A Chinese sauce', 'visual': "https://media.wired.com/photos/598e35fb99d76447c4eb1f28/master/pass/phonepicutres-TA.jpg", 'page_url': "https://google.ca" },

];

export default function SearchIngredientsPage(props) {

    const [unfilteredData,setUnfilteredData] = useState([]);
    const [query, setQuery] = useState("");
    const [data, setData] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [debouncedQuery] = useDebounce(query, 500);


    handleHomeButton = async () => {
        props.setPage("HomePage");
    }

    updateSearchAsync = async (text) => {
        console.log("query",query);
        setQuery(text);
    }

    useEffect(() => {
        console.log("debouncedQuery",debouncedQuery);
        myAsyncFunction = async function () {
            setIsSearching(true);
            const searchResults = await getIngredientSearchResultsAsync(debouncedQuery);
            const ingredients_lst = await filterWordListAsync(searchResults);
            const data = await getIngredientsToDescriptionAsync(ingredients_lst);
            let unfilteredDataobj = {};
            unfilteredDataobj[debouncedQuery] = data;
            setUnfilteredData(unfilteredDataobj);
            setIsSearching(false);
        };
        myAsyncFunction();
    }, [debouncedQuery]);

    useEffect(()=>{
        const unfilteredDataQuery = Object.keys(unfilteredData)[0];
        if(unfilteredDataQuery == query)
        {
            setData(unfilteredData[unfilteredDataQuery]);
        }
    },[unfilteredData]);



    return (
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
    }, navBar: {
        paddingLeft: '2.5%',
        paddingRight: '2.5%',
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flex: 1,
        backgroundColor: 'white',
        borderTopEndRadius: 20,
        borderTopStartRadius: 20,
        overflow: 'hidden',
    },
    ingredients_lst: {
        flex: 10,
        borderBottomStartRadius: 20,
        borderBottomEndRadius: 20,
        overflow: 'hidden',
    }
});