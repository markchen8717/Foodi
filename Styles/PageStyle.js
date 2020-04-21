import { StyleSheet, Dimensions } from 'react-native'

const { width: winWidth, height: winHeight } = Dimensions.get('window');
export const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flex: 10,
        flexDirection: "column",
        height: winHeight,
        width: winWidth,
        //paddingHorizontal: '2.5%',
        // backgroundColor: 'green',
        overflow: 'hidden',
    }
    , navBar: {
        paddingLeft: '2.5%',
        paddingRight: '2.5%',
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flex: 1.25,
        backgroundColor: '#F4F6F6',
        // borderTopEndRadius: 20,
        // borderTopStartRadius: 20,
    },
    navBarText: {
        color:"black",
        fontSize: 11.5,
    },
    navSwitch: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    ingredients_lst: {
        flex: 10,
        // borderBottomStartRadius: 20,
        // borderBottomEndRadius: 20,
        overflow: 'hidden',
    },
});