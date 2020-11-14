import AsyncStorage from '@react-native-community/async-storage';

/*
    App Variables:

    isLastScanSuccessful : boolean
        true only if previous scan returned > 3 results
    isLastSearchSuccessful : boolean
        true only if orevious search returned results
    isUserRated : boolean
    numOfScansAndSearchesSinceR : integer
    numOfScansAndSearchesSinceI : integer
    lastPage : integer
    currentPage : integer
       -1 - splash screen
        0 - home
        1 - scan
        2 - search
*/
const app_variables = ["isLastScanSuccessful", "isLastSearchSuccessful", "isUserRated", "numOfScansAndSearchesSinceR", "numOfScansAndSearchesSinceI", "lastPage", "currentPage"];

export const printAppVariablesAsync = async()=> {
    console.log("//////   App Variables Start   ////");
    for (let idx = 0 ; idx < app_variables.length;idx++){
        console.log(app_variables[idx], await(fetchDataAsync(app_variables[idx])));
    }
    console.log("//////   App Variables End    ////");
}

export const fetchDataAsync = async (key) => {
    const value = await AsyncStorage.getItem(key);
    return value;
}

export const setDataAsync = async (key, value) => {
    await AsyncStorage.setItem(key, value);
}

