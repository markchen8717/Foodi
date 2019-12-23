import React, { useState, Fragment } from 'react';
import { StyleSheet, Text, View, Button, TextInput, Dimensions, FlatList, ScrollView } from 'react-native';
import Accordian from '../Components/Accordian';
import Header from '../Components/Header';


export default function IngredientsPage(props) {

    const [collapse_all, toggleCollapseAll] = useState(true);
    handleCollapseAllButton = () => {
        toggleCollapseAll(!collapse_all);
    }
    handleHomeButton = () => {
        props.toHomePage("HomePage");
    }

    return (

        <View style={style.container}>
            <View style={style.navBar}>
                <Button color="white" title="Home" onPress={handleHomeButton} />
                <Button title="Collapse All" onPress={handleCollapseAllButton} />
            </View>
            <View style={style.header}>
                <Header style={style.header} title="Ingredients Found:" />
            </View>
            <View style={style.content}>
                <ScrollView contentContainerStyle={{ margin: "1.5%" }}>
                    {props.ingrdnts_to_dscrption.map((obj) => {
                        return <Accordian collapse_all={collapse_all} key={obj["name"]} title={obj["name"]} text_data={obj["text"]} visual_data={obj["visual"]} page_url={obj["page_url"]}/>;
                    })}
                </ScrollView>
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
        paddingLeft: '2.5%',
        paddingRight: '2.5%',
        paddingTop: '10%',
        backgroundColor: '#FFA07A',
        
    },
    navBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flex: 5,
    },
    header: {
        flex: 10,
    },
    content: {
        flex: 80,
        backgroundColor: 'white',
        borderBottomStartRadius:20,
        borderBottomEndRadius:20,
    }
});